import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Lock, 
  Building2, 
  Layers, 
  Info,
  Radio
} from 'lucide-react';
import { ClinicDomain, DomainType } from '../../types';
import { StorageService } from '../../services/storage';
import { DomainResolver } from '../../services/domainResolver';

interface DomainsManagementProps {
  onSimulateDomain?: (domain: string) => void;
}

export const DomainsManagement: React.FC<DomainsManagementProps> = ({ onSimulateDomain }) => {
  const [domains, setDomains] = useState<ClinicDomain[]>(StorageService.getClinicDomains());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);
  const [validatingId, setValidatingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [domainInput, setDomainInput] = useState('');
  const [domainTypeInput, setDomainTypeInput] = useState<DomainType>('app');
  const [formError, setFormError] = useState<string | null>(null);

  const clinic = StorageService.getClinic();
  const organization = StorageService.getOrganization();

  useEffect(() => {
    const handleUpdate = () => {
      setDomains(StorageService.getClinicDomains());
    };
    window.addEventListener('medsync_storage_update', handleUpdate);
    return () => window.removeEventListener('medsync_storage_update', handleUpdate);
  }, []);

  const showFeedback = (text: string, type: 'success' | 'error') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTokenId(id);
    setTimeout(() => setCopiedTokenId(null), 2000);
  };

  const handleValidateDns = (domain: ClinicDomain) => {
    setValidatingId(domain.id);
    setTimeout(() => {
      const res = StorageService.verifyDomainDns(domain.id);
      setValidatingId(null);
      if (res.success) {
        setDomains(StorageService.getClinicDomains());
        showFeedback(res.message, 'success');
      } else {
        showFeedback(res.message, 'error');
      }
    }, 900);
  };

  const handleToggleActive = (id: string) => {
    StorageService.toggleDomainActive(id);
    setDomains(StorageService.getClinicDomains());
    showFeedback('Status de ativação do domínio atualizado!', 'success');
  };

  const handleDelete = (id: string, domainName: string) => {
    if (confirm(`Tem certeza que deseja remover o domínio ${domainName}? O tráfego para este endereço será interrompido.`)) {
      StorageService.deleteClinicDomain(id);
      setDomains(StorageService.getClinicDomains());
      showFeedback(`Domínio ${domainName} desvinculado com sucesso.`, 'success');
    }
  };

  const handleCreateDomain = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const clean = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!clean || !clean.includes('.')) {
      setFormError('Informe um nome de domínio válido (ex: app.clinica.com.br).');
      return;
    }

    const newDomain: ClinicDomain = {
      id: `dom_${Date.now()}`,
      organizationId: organization.id,
      clinicId: clinic.id,
      clinicName: clinic.tradeName,
      domain: clean,
      domainType: domainTypeInput,
      isVerified: false,
      isActive: true,
      verificationToken: `medsync-verify-${Math.random().toString(36).substring(2, 10)}`,
      dnsStatus: 'pending',
      sslStatus: 'pending',
      expectedCname: 'cname.vercel-dns.com',
      createdAt: new Date().toISOString(),
    };

    const res = StorageService.saveClinicDomain(newDomain);
    if (!res.success) {
      setFormError(res.error || 'Erro ao salvar domínio.');
      return;
    }

    setDomains(StorageService.getClinicDomains());
    setIsModalOpen(false);
    setDomainInput('');
    showFeedback(`Domínio ${clean} adicionado com sucesso. Configure os registros DNS.`, 'success');
  };

  const handleSimulate = (domainName: string) => {
    DomainResolver.setSimulatedDomain(domainName);
    if (onSimulateDomain) {
      onSimulateDomain(domainName);
    }
    showFeedback(`Simulação ativada para o domínio: ${domainName}`, 'success');
  };

  // KPIs
  const totalDomains = domains.length;
  const verifiedDomains = domains.filter(d => d.isVerified).length;
  const pendingDomains = domains.filter(d => !d.isVerified).length;
  const appDomains = domains.filter(d => d.domainType === 'app').length;
  const webDomains = domains.filter(d => d.domainType === 'website').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header and Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Domínios & Sites Institucionais
              </h1>
              <p className="text-xs text-slate-500">
                Roteamento multi-tenant inteligente: Separação estrita entre Painel Administrativo (<code className="text-sky-700 font-mono">app.*</code>) e Site Institucional Público (<code className="text-sky-700 font-mono">www.*</code>).
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Domínio</span>
        </button>
      </div>

      {/* Feedback Alert Toast */}
      {feedbackMessage && (
        <div className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
          feedbackMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-bold hover:opacity-75"
          >
            ×
          </button>
        </div>
      )}

      {/* Architecture Highlights Banner */}
      <div className="p-5 bg-gradient-to-r from-sky-50 via-teal-50 to-indigo-50 rounded-2xl border border-sky-100 space-y-3">
        <div className="flex items-start gap-3">
          <Server className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-xs text-slate-700">
            <h3 className="font-bold text-slate-900 text-sm">
              Arquitetura de Isolamento & Dual-Domain
            </h3>
            <p className="leading-relaxed">
              O MedSync SaaS identifica dinamicamente o cliente através do cabeçalho <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-sky-800">Host</code> da requisição HTTP. 
              Ao acessar <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-slate-900 font-semibold">app.drnewtonmureb.com.br</code>, a aplicação restringe o carregamento ao portal administrativo protegido por autenticação e RLS. 
              Ao acessar <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-slate-900 font-semibold">www.drnewtonmureb.com.br</code>, o sistema renderiza apenas o site institucional e o agendamento público, sem expor prontuários, dados financeiros ou cadastros de outros pacientes.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total de Domínios</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{totalDomains}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">{appDomains} App / {webDomains} Site</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Verificados & Ativos</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1 tabular-nums">{verifiedDomains}</div>
          <span className="text-[11px] text-emerald-700 mt-0.5 block">SSL emitido e ativo</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Pendentes de DNS</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">{pendingDomains}</div>
          <span className="text-[11px] text-amber-700 mt-0.5 block">Aguardando apontamento</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">CNAME Base SaaS</span>
          <div className="text-xs font-mono font-bold text-sky-700 mt-2 truncate">cname.vercel-dns.com</div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Anycast Edge Routing</span>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Domínios Customizados Mapeados
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {domains.length} registros ativos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-3 px-4">Domínio / Hostname</th>
                <th className="py-3 px-4">Tipo & Destino</th>
                <th className="py-3 px-4">Clínica Vinculada</th>
                <th className="py-3 px-4">Status DNS</th>
                <th className="py-3 px-4">Certificado SSL</th>
                <th className="py-3 px-4">Apontamento CNAME</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {domains.map((dom) => (
                <tr key={dom.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Domain Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-[13px]">
                        {dom.domain}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                      <span>Token TXT:</span>
                      <code className="font-mono text-slate-600">{dom.verificationToken.substring(0, 16)}...</code>
                      <button
                        onClick={() => handleCopy(dom.verificationToken, `token_${dom.id}`)}
                        title="Copiar token TXT de verificação"
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {copiedTokenId === `token_${dom.id}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Domain Type */}
                  <td className="py-3.5 px-4">
                    {dom.domainType === 'app' || dom.domainType === 'clinic_app' ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 font-semibold text-[11px]">
                        <Server className="w-3.5 h-3.5" />
                        <span>Painel ERP da Clínica</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 font-semibold text-[11px]">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Site Institucional</span>
                      </div>
                    )}
                  </td>

                  {/* Linked Clinic */}
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 block">
                      {dom.clinicName || 'Instituto Dr. Newton Mureb'}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      Org: {dom.organizationId}
                    </span>
                  </td>

                  {/* DNS Status */}
                  <td className="py-3.5 px-4">
                    {dom.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verificado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Aguardando DNS</span>
                      </span>
                    )}
                  </td>

                  {/* SSL Status */}
                  <td className="py-3.5 px-4">
                    {dom.sslStatus === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>SSL Ativo (TLS 1.3)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Em emissão</span>
                      </span>
                    )}
                  </td>

                  {/* CNAME */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span>{dom.expectedCname}</span>
                      <button
                        onClick={() => handleCopy(dom.expectedCname, `cname_${dom.id}`)}
                        title="Copiar CNAME"
                        className="text-slate-400 hover:text-slate-700"
                      >
                        {copiedTokenId === `cname_${dom.id}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Simulate Access Button */}
                      <button
                        onClick={() => handleSimulate(dom.domain)}
                        title="Simular carregamento por este domínio"
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition inline-flex items-center gap-1 shadow-2xs"
                      >
                        <ExternalLink className="w-3 h-3 text-sky-600" />
                        <span>Simular</span>
                      </button>

                      {/* Verify DNS Button */}
                      {!dom.isVerified && (
                        <button
                          onClick={() => handleValidateDns(dom)}
                          disabled={validatingId === dom.id}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition inline-flex items-center gap-1"
                        >
                          <RefreshCw className={`w-3 h-3 ${validatingId === dom.id ? 'animate-spin' : ''}`} />
                          <span>Verificar</span>
                        </button>
                      )}

                      {/* Toggle Active */}
                      <button
                        onClick={() => handleToggleActive(dom.id)}
                        className={`px-2 py-1 text-[11px] font-semibold rounded-lg border transition ${
                          dom.isActive 
                            ? 'text-slate-600 hover:bg-slate-100 border-slate-200' 
                            : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200'
                        }`}
                      >
                        {dom.isActive ? 'Ativo' : 'Pausado'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(dom.id, dom.domain)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Remover mapeamento de domínio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DNS Configuration Guide for Clients */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Instruções de Apontamento DNS para a Equipe de TI da Clínica
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-sky-600" />
              1. Painel Administrativo da Clínica (Ex: app.drnewtonmureb.com.br)
            </span>
            <div className="space-y-1 font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <p>Tipo: <strong className="text-slate-900">CNAME</strong></p>
              <p>Nome/Host: <strong className="text-slate-900">app</strong></p>
              <p>Destino: <strong className="text-sky-700">cname.vercel-dns.com</strong></p>
              <p>Proxy/Nuvem: <strong className="text-slate-900">DNS Only (Desativado)</strong></p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              2. Site Institucional Público (Ex: www.drnewtonmureb.com.br)
            </span>
            <div className="space-y-1 font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
              <p>Tipo: <strong className="text-slate-900">CNAME</strong></p>
              <p>Nome/Host: <strong className="text-slate-900">www</strong></p>
              <p>Destino: <strong className="text-sky-700">cname.vercel-dns.com</strong></p>
              <p>Proxy/Nuvem: <strong className="text-slate-900">DNS Only (Desativado)</strong></p>
            </div>
          </div>

        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Os certificados SSL/TLS são provisionados e renovados automaticamente pela infraestrutura MedSync após a verificação do apontamento DNS.
          </span>
        </div>
      </div>

      {/* New Domain Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">Vincular Novo Domínio Customizado</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ×
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDomain} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clínica Cliente</label>
                <input
                  type="text"
                  disabled
                  value={`${clinic.tradeName} (${clinic.legalName})`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Tipo de Domínio & Destino de Ambiente
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition ${
                    domainTypeInput === 'app'
                      ? 'bg-sky-50 border-sky-300 text-sky-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-sky-600" />
                        Painel do Sistema
                      </span>
                      <input
                        type="radio"
                        name="domainType"
                        value="app"
                        checked={domainTypeInput === 'app'}
                        onChange={() => setDomainTypeInput('app')}
                        className="text-sky-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Roteia para login, prontuários, financeiro e agenda interna (ex: <code className="text-sky-700">app.clinica.com.br</code>).
                    </span>
                  </label>

                  <label className={`p-3 rounded-xl border cursor-pointer flex flex-col gap-1 transition ${
                    domainTypeInput === 'website'
                      ? 'bg-teal-50 border-teal-300 text-teal-900'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-teal-600" />
                        Site Institucional
                      </span>
                      <input
                        type="radio"
                        name="domainType"
                        value="website"
                        checked={domainTypeInput === 'website'}
                        onChange={() => setDomainTypeInput('website')}
                        className="text-teal-600"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Roteia para portal público com especialidades e agendamento (ex: <code className="text-teal-700">www.clinica.com.br</code>).
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Domínio (FQDN)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">https://</span>
                  <input
                    type="text"
                    required
                    placeholder={domainTypeInput === 'app' ? 'app.drnewtonmureb.com.br' : 'www.drnewtonmureb.com.br'}
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    className="w-full pl-18 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Não inclua caminhos adicionais (ex: /login). Apenas o hostname exato.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Salvar e Gerar Tokens DNS
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
