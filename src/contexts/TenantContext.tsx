import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Clinic, Branch, Plan } from '../types';
import { StorageService } from '../services/storage';

interface TenantContextType {
  organization: Organization;
  clinic: Clinic;
  branches: Branch[];
  plans: Plan[];
  activeBranchId: string; // 'all' or specific branch ID
  activeBranch: Branch | null;
  setActiveBranchId: (id: string) => void;
  updateClinic: (data: Partial<Clinic>) => void;
  updateOrganization: (data: Partial<Organization>) => void;
  refreshData: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organization, setOrganization] = useState<Organization>(StorageService.getOrganization());
  const [clinic, setClinic] = useState<Clinic>(StorageService.getClinic());
  const [branches, setBranches] = useState<Branch[]>(StorageService.getBranches());
  const [plans, setPlans] = useState<Plan[]>(StorageService.getPlans());
  const [activeBranchId, setActiveBranchIdState] = useState<string>(StorageService.getActiveBranchId());

  const refreshData = () => {
    setOrganization(StorageService.getOrganization());
    setClinic(StorageService.getClinic());
    setBranches(StorageService.getBranches());
    setPlans(StorageService.getPlans());
    setActiveBranchIdState(StorageService.getActiveBranchId());
  };

  useEffect(() => {
    window.addEventListener('medsync_storage_update', refreshData);
    return () => window.removeEventListener('medsync_storage_update', refreshData);
  }, []);

  const setActiveBranchId = (id: string) => {
    StorageService.setActiveBranchId(id);
    setActiveBranchIdState(id);
  };

  const updateClinic = (data: Partial<Clinic>) => {
    const updated = StorageService.updateClinic(data);
    setClinic(updated);
  };

  const updateOrganization = (data: Partial<Organization>) => {
    const updated = StorageService.updateOrganization(data);
    setOrganization(updated);
  };

  const activeBranch = activeBranchId === 'all' 
    ? null 
    : branches.find(b => b.id === activeBranchId) || null;

  return (
    <TenantContext.Provider
      value={{
        organization,
        clinic,
        branches,
        plans,
        activeBranchId,
        activeBranch,
        setActiveBranchId,
        updateClinic,
        updateOrganization,
        refreshData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
