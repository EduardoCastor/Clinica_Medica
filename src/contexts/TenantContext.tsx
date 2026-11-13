import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization, Clinic, Branch, Plan, ResolvedTenantContext } from '../types';
import { StorageService } from '../services/storage';
import { DomainResolver } from '../services/domainResolver';

interface TenantContextType {
  organization: Organization;
  clinic: Clinic;
  branches: Branch[];
  plans: Plan[];
  activeBranchId: string; // 'all' or specific branch ID
  activeBranch: Branch | null;
  tenantContext: ResolvedTenantContext;
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
  const [tenantContext, setTenantContext] = useState<ResolvedTenantContext>(DomainResolver.resolveTenant());

  const refreshData = () => {
    setOrganization(StorageService.getOrganization());
    setClinic(StorageService.getClinic());
    setBranches(StorageService.getBranches());
    setPlans(StorageService.getPlans());
    setActiveBranchIdState(StorageService.getActiveBranchId());
    setTenantContext(DomainResolver.resolveTenant());
  };

  useEffect(() => {
    window.addEventListener('medsync_storage_update', refreshData);
    window.addEventListener('medsync-plans-updated', refreshData);
    window.addEventListener('medsync_domain_simulation_changed', refreshData);
    return () => {
      window.removeEventListener('medsync_storage_update', refreshData);
      window.removeEventListener('medsync-plans-updated', refreshData);
      window.removeEventListener('medsync_domain_simulation_changed', refreshData);
    };
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
        tenantContext,
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
