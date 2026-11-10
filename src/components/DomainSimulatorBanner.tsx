import React from 'react';
import { Globe, Server, ExternalLink, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { ResolvedTenantContext } from '../types';
import { DomainResolver } from '../services/domainResolver';

interface DomainSimulatorBannerProps {
  tenantContext: ResolvedTenantContext;
  onDomainChange: (domain: string | null) => void;
}

export const DomainSimulatorBanner: React.FC<DomainSimulatorBannerProps> = ({
  tenantContext,
  onDomainChange,
}) => {
  const isSimulation = tenantContext.isSimulation;
  const isReal = DomainResolver.isRealCustomDomain();

  // If running on actual production custom domain without manual override, show subtle status
  if (isReal && !isSimulation) {
    return (
      <div className="bg-slate-900 text-white text-[11px] py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            Conexão Segura Multi-Tenant: <strong className="font-mono text-sky-300">{window.location.hostname}</strong> ({tenantContext.environment === 'app' ? 'Painel Administrativo' : 'Site Institucional Público'})
          </span>
        </div>
        <span className="text-slate-400 text-[10px]">TLS 1.3 / RLS Ativo</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Left: Current Domain Resolution Info */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-400/30 font-semibold text-[11px]">
            <Globe className="w-3.5 h-3.5" />
            <span>Simulador de Domínios</span>
          </span>

          <span className="text-slate-300 text-[11px]">
            {tenantContext.resolved ? (
              <>
                Ambiente ativo:{' '}
                <strong className="font-mono text-emerald-400 font-bold">
                  {tenantContext.domain?.domain}
                </strong>{' '}
                <span className="text-slate-400">
                  ({tenantContext.environment === 'app' ? 'Painel Administrativo Exclusivo' : 'Site Institucional Público'})
                </span>
              </>
            ) : (
              <>
                Ambiente atual:{' '}
                <strong className="font-mono text-purple-300 font-bold">
                  Plataforma Geral SaaS (preview / medsync.io)
                </strong>
              </>
            )}
          </span>
        </div>

        {/* Right: Quick switcher buttons for instant testing */}
        <div className="flex items-center gap-2 shrink-0">
          
          <button
            onClick={() => onDomainChange('app.drnewtonmureb.com.br')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1.5 ${
              tenantContext.domain?.domain === 'app.drnewtonmureb.com.br'
                ? 'bg-sky-600 text-white ring-1 ring-sky-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
            title="Simular acesso ao Painel Administrativo da Clínica"
          >
            <Server className="w-3 h-3 text-sky-400" />
            <span>app.drnewtonmureb.com.br</span>
          </button>

          <button
            onClick={() => onDomainChange('www.drnewtonmureb.com.br')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1.5 ${
              tenantContext.domain?.domain === 'www.drnewtonmureb.com.br'
                ? 'bg-teal-600 text-white ring-1 ring-teal-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
            }`}
            title="Simular acesso ao Site Institucional Público da Clínica"
          >
            <Globe className="w-3 h-3 text-teal-400" />
            <span>www.drnewtonmureb.com.br</span>
          </button>

          {tenantContext.resolved && (
            <button
              onClick={() => onDomainChange(null)}
              className="px-2 py-1 rounded-lg text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700 transition flex items-center gap-1"
              title="Restaurar visão geral da plataforma"
            >
              <X className="w-3 h-3" />
              <span>SaaS Geral</span>
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
