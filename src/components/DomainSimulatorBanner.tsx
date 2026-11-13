import React from 'react';
import { 
  Globe, 
  Server, 
  ShieldCheck, 
  Layers, 
  ExternalLink, 
  UserCheck, 
  Building2,
  LogOut,
  Info,
  Calendar
} from 'lucide-react';
import { ResolvedTenantContext } from '../types';
import { DomainResolver, PRODUCTION_DOMAINS } from '../services/domainResolver';
import { useAuth } from '../contexts/AuthContext';

interface DomainSimulatorBannerProps {
  tenantContext: ResolvedTenantContext;
  onDomainChange: (domain: string | null) => void;
}

export const DomainSimulatorBanner: React.FC<DomainSimulatorBannerProps> = ({
  tenantContext,
  onDomainChange,
}) => {
  const { switchUser, usersList, isImpersonating, stopImpersonation } = useAuth();

  // If running in true production environment, completely hide simulation bar
  if (!DomainResolver.isSimulationAllowed()) {
    return null;
  }

  const handleSelectDomain = (domain: string, targetRole?: 'super_admin' | 'clinic_admin' | 'doctor') => {
    onDomainChange(domain);
    
    // Auto-adjust default authenticated user for smooth testing when switching modes
    if (targetRole === 'super_admin') {
      const superAdmin = usersList.find(u => u.role === 'super_admin');
      if (superAdmin) switchUser(superAdmin.id);
    } else if (targetRole === 'doctor') {
      const doctor = usersList.find(u => u.role === 'doctor') || usersList[2];
      if (doctor) switchUser(doctor.id);
    }
  };

  const currentMode = tenantContext.mode;

  return (
    <aside aria-label="Simulador de Domínios Multi-Tenant" className="bg-slate-950 text-white text-xs border-b border-slate-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        
        {/* Left Side: Simulation Status & Mode Badge */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Simulador de Domínios
          </span>

          <span className="text-slate-300 text-xs flex items-center gap-1.5">
            <span className="text-slate-400">Contexto Ativo:</span>
            {currentMode === 'SAAS_LANDING' && (
              <span className="font-semibold text-sky-300 font-mono flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                {PRODUCTION_DOMAINS.SAAS_LANDING}
                <span className="text-slate-400 font-sans font-normal">(Landing Comercial SaaS)</span>
              </span>
            )}
            {currentMode === 'SAAS_ADMIN' && (
              <span className="font-semibold text-purple-300 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                {PRODUCTION_DOMAINS.SAAS_ADMIN}
                <span className="text-slate-400 font-sans font-normal">(Painel Super Admin SaaS)</span>
              </span>
            )}
            {currentMode === 'CLINIC_APP' && (
              <span className="font-semibold text-emerald-300 font-mono flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-emerald-400" />
                {PRODUCTION_DOMAINS.CLINIC_APP}
                <span className="text-slate-400 font-sans font-normal">(ERP Clínica Dr. Newton Mureb)</span>
              </span>
            )}
            {currentMode === 'CLINIC_WEBSITE' && (
              <span className="font-semibold text-teal-300 font-mono flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                {PRODUCTION_DOMAINS.CLINIC_WEBSITE}
                <span className="text-slate-400 font-sans font-normal">(Site Público Institucional)</span>
              </span>
            )}
            {currentMode === 'CLINIC_BOOKING' && (
              <span className="font-semibold text-amber-300 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {PRODUCTION_DOMAINS.CLINIC_BOOKING}
                <span className="text-slate-400 font-sans font-normal">(Agenda Online n8n do Cliente)</span>
              </span>
            )}
          </span>

          {/* Impersonation Alert Badge if active */}
          {isImpersonating && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
              <span>Sessão de Suporte Ativa</span>
              <button
                onClick={stopImpersonation}
                className="ml-1 underline text-rose-200 hover:text-white"
                title="Sair do modo suporte e voltar ao Painel SaaS"
              >
                (Sair)
              </button>
            </span>
          )}
        </div>

        {/* Right Side: The 4 Domain Quick Switch Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          
          {/* 1. Comercial SaaS */}
          <button
            onClick={() => handleSelectDomain(PRODUCTION_DOMAINS.SAAS_LANDING)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              currentMode === 'SAAS_LANDING'
                ? 'bg-sky-600 text-white border-sky-400 shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
            }`}
            title="Simular: medsync.beaverstraining.com.br (Site Comercial)"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>1. Comercial SaaS</span>
          </button>

          {/* 2. Admin Geral SaaS */}
          <button
            onClick={() => handleSelectDomain(PRODUCTION_DOMAINS.SAAS_ADMIN, 'super_admin')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              currentMode === 'SAAS_ADMIN'
                ? 'bg-purple-600 text-white border-purple-400 shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
            }`}
            title="Simular: painelclinica.beaverstraining.com.br (Super Admin)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>2. Admin Geral SaaS</span>
          </button>

          {/* 3. ERP Clínica */}
          <button
            onClick={() => handleSelectDomain(PRODUCTION_DOMAINS.CLINIC_APP, 'doctor')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              currentMode === 'CLINIC_APP'
                ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
            }`}
            title="Simular: app.drnewtonmureb.com.br (ERP Clínico da Clínica Dr. Newton Mureb)"
          >
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. ERP Clínica</span>
          </button>

          {/* 4. Site do Cliente */}
          <button
            onClick={() => handleSelectDomain(PRODUCTION_DOMAINS.CLINIC_WEBSITE)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              currentMode === 'CLINIC_WEBSITE'
                ? 'bg-teal-600 text-white border-teal-400 shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
            }`}
            title="Simular: www.drnewtonmureb.com.br (Site Institucional do Cliente)"
          >
            <Building2 className="w-3.5 h-3.5 text-teal-400" />
            <span>4. Site do Cliente</span>
          </button>

          {/* 5. Agenda do Cliente */}
          <button
            onClick={() => handleSelectDomain(PRODUCTION_DOMAINS.CLINIC_BOOKING)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 border ${
              currentMode === 'CLINIC_BOOKING'
                ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-800'
            }`}
            title="Simular: agenda.drnewtonmureb.com.br (Agendamento Online n8n do Cliente)"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>5. Agenda do Cliente</span>
          </button>

        </div>

      </div>
    </aside>
  );
};
