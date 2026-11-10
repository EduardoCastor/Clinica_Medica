import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { Navbar, AppViewMode } from './components/Navbar';
import { Sidebar, ClinicTab } from './components/Sidebar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';

// Modules
import { ClinicDashboard } from './modules/clinic/ClinicDashboard';
import { AppointmentsModule } from './modules/appointments/AppointmentsModule';
import { PatientsModule } from './modules/patients/PatientsModule';
import { MedicalRecordsModule } from './modules/medical-records/MedicalRecordsModule';
import { CommunicationModule } from './modules/communication/CommunicationModule';
import { FinancialModule } from './modules/financial/FinancialModule';
import { ClinicSettings } from './modules/clinic/ClinicSettings';
import { TeamManagement } from './modules/clinic/TeamManagement';
import { WebsiteEditor } from './modules/website-builder/WebsiteEditor';
import { ClinicWebsitePreview } from './modules/website-builder/ClinicWebsitePreview';
import { PatientPortal } from './modules/patient-portal/PatientPortal';
import { LandingPage } from './modules/landing/LandingPage';
import { SaasAdminDashboard } from './modules/saas-admin/SaasAdminDashboard';
import { DomainSimulatorBanner } from './components/DomainSimulatorBanner';
import { DomainResolver } from './services/domainResolver';

import { Patient, ResolvedTenantContext } from './types';

const MainAppContent: React.FC = () => {
  const { currentRole } = useAuth();
  const [tenantContext, setTenantContext] = useState<ResolvedTenantContext>(DomainResolver.resolveTenant());
  const [currentView, setCurrentView] = useState<AppViewMode>(() => {
    const initialTenant = DomainResolver.resolveTenant();
    if (initialTenant.resolved) {
      return initialTenant.environment === 'website' ? 'clinic_website' : 'clinic_panel';
    }
    return 'clinic_panel';
  });
  const [activeClinicTab, setActiveClinicTab] = useState<ClinicTab>('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [targetPatientForRecord, setTargetPatientForRecord] = useState<Patient | null>(null);

  React.useEffect(() => {
    const updateResolution = () => {
      const resolved = DomainResolver.resolveTenant();
      setTenantContext(resolved);
      if (resolved.resolved) {
        if (resolved.environment === 'website') {
          setCurrentView('clinic_website');
        } else if (resolved.environment === 'app') {
          setCurrentView('clinic_panel');
        }
      }
    };

    window.addEventListener('medsync_domain_simulation_changed', updateResolution);
    window.addEventListener('medsync_storage_update', updateResolution);
    return () => {
      window.removeEventListener('medsync_domain_simulation_changed', updateResolution);
      window.removeEventListener('medsync_storage_update', updateResolution);
    };
  }, []);

  const handleNavigateToRecord = (patient: Patient) => {
    setTargetPatientForRecord(patient);
    setActiveClinicTab('medical_records');
  };

  const handleNavigateToSchedule = (patient: Patient) => {
    setActiveClinicTab('appointments');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Domain Simulator Banner for Multi-Tenant Testing */}
      <DomainSimulatorBanner
        tenantContext={tenantContext}
        onDomainChange={(domain) => DomainResolver.setSimulatedDomain(domain)}
      />

      {/* Top Bar with View Switcher, Role Simulator, Branch Selector and PWA */}
      {/* Hidden only on real institutional website domain to guarantee complete privacy separation */}
      {(!tenantContext.resolved || tenantContext.environment !== 'website' || tenantContext.isSimulation) && (
        <Navbar
          currentView={currentView}
          onViewChange={(view) => setCurrentView(view)}
          onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        
        {/* VIEW 1: Clinic Operational Panel */}
        {currentView === 'clinic_panel' && (
          <div className="flex-1 flex flex-col md:flex-row">
            <Sidebar
              activeTab={activeClinicTab}
              onTabChange={(tab) => {
                setActiveClinicTab(tab);
                setTargetPatientForRecord(null);
              }}
            />
            
            <section className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {activeClinicTab === 'dashboard' && (
                <ClinicDashboard onNavigateTab={(tab) => setActiveClinicTab(tab)} />
              )}
              {activeClinicTab === 'appointments' && (
                <AppointmentsModule />
              )}
              {activeClinicTab === 'patients' && (
                <PatientsModule
                  onNavigateToRecord={handleNavigateToRecord}
                  onNavigateToSchedule={handleNavigateToSchedule}
                />
              )}
              {activeClinicTab === 'medical_records' && (
                <MedicalRecordsModule initialPatient={targetPatientForRecord} />
              )}
              {activeClinicTab === 'communication' && (
                <CommunicationModule />
              )}
              {activeClinicTab === 'financial' && (
                <FinancialModule />
              )}
              {activeClinicTab === 'users' && (
                <TeamManagement />
              )}
              {activeClinicTab === 'settings' && (
                <ClinicSettings />
              )}
              {activeClinicTab === 'website_builder' && (
                <WebsiteEditor onOpenPreview={() => setCurrentView('clinic_website')} />
              )}
            </section>
          </div>
        )}

        {/* VIEW 2: Clinic Institutional Website (White-Label with 5 palettes & public booking) */}
        {currentView === 'clinic_website' && (
          <ClinicWebsitePreview onBackToPanel={() => setCurrentView('clinic_panel')} />
        )}

        {/* VIEW 3: Patient Portal */}
        {currentView === 'patient_portal' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
            <PatientPortal />
          </div>
        )}

        {/* VIEW 4: SaaS Commercial Landing Page */}
        {currentView === 'saas_landing' && (
          <LandingPage
            onAccessClinic={() => setCurrentView('clinic_panel')}
            onAccessSuperAdmin={() => setCurrentView('saas_admin')}
          />
        )}

        {/* VIEW 5: SaaS Super Admin Dashboard */}
        {currentView === 'saas_admin' && (
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
            <SaasAdminDashboard onSimulateDomain={(d) => DomainResolver.setSimulatedDomain(d)} />
          </div>
        )}

      </main>

      {/* Supabase / PostgreSQL Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />

    </div>
  );
};

export default function App() {
  return (
    <TenantProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </TenantProvider>
  );
}
