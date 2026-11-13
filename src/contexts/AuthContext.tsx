import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { StorageService } from '../services/storage';
import { DomainResolver, PRODUCTION_DOMAINS } from '../services/domainResolver';

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  login: (userId: string) => void;
  logout: () => void;
  impersonateClinic: (clinicId: string) => void;
  stopImpersonation: () => void;
  isImpersonating: boolean;
  impersonatedClinicId: string | null;
  usersList: UserProfile[];
  canViewMedicalRecords: boolean;
  canEditMedicalRecords: boolean;
  canManageFinances: boolean;
  canManageSchedules: boolean;
  canManageClinicSettings: boolean;
  isSuperAdmin: boolean;
}

const AUTH_STATUS_STORAGE_KEY = 'medsync_is_logged_in';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<UserProfile[]>(StorageService.getUsers());
  const [activeUserId, setActiveUserId] = useState<string>(StorageService.getActiveUserId());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(AUTH_STATUS_STORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });
  const [impersonatedClinicId, setImpersonatedClinicId] = useState<string | null>(
    DomainResolver.getImpersonatedClinicId()
  );

  useEffect(() => {
    const handleStorageUpdate = () => {
      setUsersList(StorageService.getUsers());
      setActiveUserId(StorageService.getActiveUserId());
      setImpersonatedClinicId(DomainResolver.getImpersonatedClinicId());
    };
    window.addEventListener('medsync_storage_update', handleStorageUpdate);
    window.addEventListener('medsync_domain_simulation_changed', handleStorageUpdate);
    return () => {
      window.removeEventListener('medsync_storage_update', handleStorageUpdate);
      window.removeEventListener('medsync_domain_simulation_changed', handleStorageUpdate);
    };
  }, []);

  const currentUser =
    usersList.find(u => u.id === activeUserId) ||
    usersList.find(u => u.id === 'usr_doctor_newton') ||
    usersList[0]; // Default Dr. Newton Mureb
  const currentRole = currentUser.role;

  const switchUser = (userId: string) => {
    StorageService.setActiveUserId(userId);
    setActiveUserId(userId);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STATUS_STORAGE_KEY, 'true');
    }
  };

  const login = (userId: string) => {
    switchUser(userId);
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STATUS_STORAGE_KEY, 'false');
    }
  };

  const impersonateClinic = (clinicId: string) => {
    DomainResolver.setImpersonatedClinicId(clinicId);
    setImpersonatedClinicId(clinicId);
    // Find clinic admin or default doctor
    const clinicAdmin = usersList.find(u => u.role === 'clinic_admin') || usersList[1];
    switchUser(clinicAdmin.id);
    // If in simulation, also switch domain to app.drnewtonmureb.com.br
    if (DomainResolver.isSimulationAllowed()) {
      DomainResolver.setSimulatedDomain(PRODUCTION_DOMAINS.CLINIC_APP);
    }
  };

  const stopImpersonation = () => {
    DomainResolver.setImpersonatedClinicId(null);
    setImpersonatedClinicId(null);
    // Switch back to Super Admin
    const superAdmin = usersList.find(u => u.role === 'super_admin') || usersList[0];
    switchUser(superAdmin.id);
    // If in simulation, switch back to painelclinica.beaverstraining.com.br
    if (DomainResolver.isSimulationAllowed()) {
      DomainResolver.setSimulatedDomain(PRODUCTION_DOMAINS.SAAS_ADMIN);
    }
  };

  const isImpersonating = Boolean(impersonatedClinicId);

  // RBAC permissions logic
  const isSuperAdmin = currentRole === 'super_admin';
  const isClinicAdmin = currentRole === 'clinic_admin' || isSuperAdmin;
  const isDoctor = currentRole === 'doctor';
  const isPhysio = currentRole === 'physiotherapist';
  const isClinicalStaff = isDoctor || isPhysio;

  const canViewMedicalRecords = isClinicalStaff || isClinicAdmin;
  const canEditMedicalRecords = isClinicalStaff;
  const canManageFinances = isClinicAdmin || currentRole === 'financial';
  const canManageSchedules = isClinicAdmin || currentRole === 'receptionist' || isClinicalStaff;
  const canManageClinicSettings = isClinicAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isAuthenticated,
        switchUser,
        login,
        logout,
        impersonateClinic,
        stopImpersonation,
        isImpersonating,
        impersonatedClinicId,
        usersList,
        canViewMedicalRecords,
        canEditMedicalRecords,
        canManageFinances,
        canManageSchedules,
        canManageClinicSettings,
        isSuperAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
