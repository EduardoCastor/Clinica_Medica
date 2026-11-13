import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { Navbar } from './components/Navbar';
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
import { SaasAdminLoginScreen } from './modules/saas-admin/SaasAdminLoginScreen';
import { ClinicLoginScreen } from './modules/clinic/ClinicLoginScreen';
import { DomainSimulatorBanner } from './components/DomainSimulatorBanner';
import { DomainResolver, PRODUCTION_DOMAINS } from './services/domainResolver';

import { Patient } from './types';
import { ShieldCheck, LogOut, Database, X } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { tenantContext } = useTenant();
  const { isAuthenticated, isSuperAdmin, logout } = useAuth();
  
  const [activeClinicTab, setActiveClinicTab] = useState<ClinicTab>('dashboard');
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [targetPatientForRecord, setTargetPatientForRecord] = useState<Patient | null>(null);
  const [isWebsitePreviewModalOpen, setIsWebsitePreviewModalOpen] = useState(false);

  const handleNavigateToRecord = (patient: Patient) => {
    setTargetPatientForRecord(patient);
    setActiveClinicTab('medical_records');
  };

  const handleNavigateToSchedule = (_patient: Patient) => {
    setActiveClinicTab('appointments');
  };

  const currentMode = tenantContext.mode;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Domain Simulator Banner: Automatically hidden on verified production domains */}
      <DomainSimulatorBanner
        tenantContext={tenantContext}
        onDomainChange={(domain) => DomainResolver.setSimulatedDomain(domain)}
      />

      {/* =========================================================================
          MODE 1: SAAS_LANDING (medsync.beaverstraining.com.br)
          Exclusively renders the commercial landing page for MedSync SaaS
          ========================================================================= */}
      {currentMode === 'SAAS_LANDING' && (
        <main className="flex-1 flex flex-col">
          <LandingPage
            onAccessClinic={() => DomainResolver.setSimulatedDomain(PRODUCTION_DOMAINS.CLINIC_APP)}
            onAccessSuperAdmin={() => DomainResolver.setSimulatedDomain(PRODUCTION_DOMAINS.SAAS_ADMIN)}
          />
        </main>
      )}

      {/* =========================================================================
          MODE 2: SAAS_ADMIN (painelclinica.beaverstraining.com.br)
          Exclusively renders the Super Admin Login or SaasAdminDashboard
          ========================================================================= */}
      {currentMode === 'SAAS_ADMIN' && (
        <main className="flex-1 flex flex-col">
          {(!isAuthenticated || !isSuperAdmin) ? (
            <SaasAdminLoginScreen />
          ) : (
            <div className="flex-1 flex flex-col">
              {/* SaaS Super Admin Dedicated Top Bar */}
              <header className="bg-slate-900 border-b border-purple-500/30 text-white px-4 sm:px-6 h-16 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-600 rounded-xl text-white shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-sm sm:text-base font-extrabold tracking-tight">
                      MedSync SaaS <span className="text-purple-400 font-semibold">Master Admin</span>
                    </h1>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      painelclinica.beaverstraining.com.br · Gestão Multi-Tenant
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSupabaseModalOpen(true)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition border border-slate-700"
                    title="Configurar Supabase / PostgreSQL"
                  >
                    <Database className="w-4 h-4 text-emerald-400" />
                  </button>

                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 rounded-lg border border-rose-900 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sair</span>
                  </button>
                </div>
              </header>

              <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex-1">
                <SaasAdminDashboard onSimulateDomain={(d) => DomainResolver.setSimulatedDomain(d)} />
              </div>
            </div>
          )}
        </main>
      )}

      {/* =========================================================================
          MODE 3: CLINIC_APP (app.drnewtonmureb.com.br)
          Exclusively renders Clinic White-Label Login or the Operational Clinic ERP
          ========================================================================= */}
      {currentMode === 'CLINIC_APP' && (
        <main className="flex-1 flex flex-col">
          {!isAuthenticated ? (
            <ClinicLoginScreen />
          ) : (
            <div className="flex-1 flex flex-col">
              {/* White-Label Clinic Topbar without cross-domain pills */}
              <Navbar
                onOpenSupabaseConfig={() => setIsSupabaseModalOpen(true)}
                onOpenWebsitePreview={() => setIsWebsitePreviewModalOpen(true)}
              />

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
                    <AppointmentsModule onNavigateToRecord={handleNavigateToRecord} />
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
                    <WebsiteEditor onOpenPreview={() => setIsWebsitePreviewModalOpen(true)} />
                  )}
                </section>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =========================================================================
          MODE 4: CLINIC_WEBSITE (www.drnewtonmureb.com.br / drnewtonmureb.com.br)
          Exclusively renders the public institutional website in production mode
          ========================================================================= */}
      {currentMode === 'CLINIC_WEBSITE' && (
        <main className="flex-1 flex flex-col">
          <ClinicWebsitePreview isProduction={true} />
        </main>
      )}

      {/* =========================================================================
          MODE 5: CLINIC_BOOKING (agenda.drnewtonmureb.com.br)
          Exclusively renders the standalone n8n Online Booking Portal
          ========================================================================= */}
      {currentMode === 'CLINIC_BOOKING' && (
        <main className="flex-1 flex flex-col">
          <PatientPortal isStandaloneBooking={true} />
        </main>
      )}

      {/* Website Preview Modal when invoked inside Clinic ERP Website Builder */}
      {isWebsitePreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between px-5">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Visualização do Site Institucional da Clínica (Dr. Newton Mureb)
              </span>
              <button
                onClick={() => setIsWebsitePreviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Fechar visualização"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ClinicWebsitePreview onBackToPanel={() => setIsWebsitePreviewModalOpen(false)} />
            </div>
          </div>
        </div>
      )}

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
