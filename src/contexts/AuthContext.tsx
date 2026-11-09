import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  switchUser: (userId: string) => void;
  usersList: UserProfile[];
  canViewMedicalRecords: boolean;
  canEditMedicalRecords: boolean;
  canManageFinances: boolean;
  canManageSchedules: boolean;
  canManageClinicSettings: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usersList, setUsersList] = useState<UserProfile[]>(StorageService.getUsers());
  const [activeUserId, setActiveUserId] = useState<string>(StorageService.getActiveUserId());

  useEffect(() => {
    const handleStorageUpdate = () => {
      setUsersList(StorageService.getUsers());
      setActiveUserId(StorageService.getActiveUserId());
    };
    window.addEventListener('medsync_storage_update', handleStorageUpdate);
    return () => window.removeEventListener('medsync_storage_update', handleStorageUpdate);
  }, []);

  const currentUser = usersList.find(u => u.id === activeUserId) || usersList[2]; // Default Dr. Newton
  const currentRole = currentUser.role;

  const switchUser = (userId: string) => {
    StorageService.setActiveUserId(userId);
    setActiveUserId(userId);
  };

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
        switchUser,
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
