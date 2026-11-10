import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Edit, 
  Lock,
  PauseCircle,
  PlayCircle,
  Globe
} from 'lucide-react';
import { Plan, Organization } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';
import { DomainsManagement } from './DomainsManagement';

interface SaasAdminDashboardProps {
  onSimulateDomain?: (domain: string) => void;
}

export const SaasAdminDashboard: React.FC<SaasAdminDashboardProps> = ({ onSimulateDomain }) => {
  const { plans, organization, updateOrganization } = useTenant();
  const [activeTab, setActiveTab] = useState<'overview' | 'domains'>('domains');
  const [plansList, setPlansList] = useState<Plan[]>(StorageService.getPlans());
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  // Metrics
  const activeTenantsCount = 18;
  const trialTenantsCount = 6;
  const mrr = 18 * 589.00;
  const trialConversionRate = 72;

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    StorageService.savePlan(editingPlan);
    setPlansList(StorageService.getPlans());
    setEditingPlan(null);
    alert('Plano comercial atualizado com sucesso!');
  };

  const toggleTenantStatus = () => {
    const nextStatus = organization.status === 'active' ? 'suspended' : 'active';
    updateOrganization({ status: nextStatus });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Super Admin Notice */}
      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 space-y-1">
          <strong className="font-bold">Ambiente Exclusivo: Super Administrador da Plataforma SaaS (MedSync)</strong>
          <p className="text-purple-800 leading-relaxed">
            Neste painel são gerenciados os planos comerciais, limites operacionais, assinaturas, domínios e faturamento das clínicas parceiras. 
            <strong> Conformidade de Privacidade:</strong> O administrador geral da plataforma possui restrição arquitetural e não tem acesso aos prontuários ou diagnósticos médicos dos pacientes de cada clínica.
          </p>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('domains')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'domains'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Domínios & Sites (Novo)</span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Visão Geral & Planos Comerciais</span>
        </button>
      </div>

      {/* TAB 1: Domains & Sites */}
      {activeTab === 'domains' && (
        <DomainsManagement onSimulateDomain={onSimulateDomain} />
      )}

      {/* TAB 2: Overview & Commercial Plans */}
      {activeTab === 'overview' && (
        <>
      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Receita Recorrente (MRR)</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-500">R$</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">+14% este mês</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Clínicas Clientes Ativas</span>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {activeTenantsCount}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Multiunidade habilitada</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Contas em Período de Teste</span>
          <div className="mt-2 text-2xl font-extrabold text-amber-600 tabular-nums">
            {trialTenantsCount}
          </div>
          <span className="text-[11px] text-slate-500 block mt-1">Trial de 10 dias ativo</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500">Taxa de Conversão Trial</span>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 tabular-nums">
            {trialConversionRate}%
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Alta adesão médica</span>
        </div>
      </div>

      {/* Plans Configurator (Section 4.1 & 4.2) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Planos Comerciais & Limites Configuráveis</h2>
            <p className="text-xs text-slate-500">Altere preços mensais, número máximo de filiais, usuários e limites sem mexer no código.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansList.map((plan) => (
            <div key={plan.id} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{plan.name}</h3>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded font-semibold">
                    {plan.code}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{plan.description}</p>
                <div className="text-lg font-extrabold text-slate-900 tabular-nums pt-1">
                  R$ {plan.priceMonthly.toFixed(2)} / mês
                </div>

                <div className="space-y-1 text-slate-600 pt-2 border-t border-slate-200">
                  <p>• Máx Filiais: <strong>{plan.maxBranches}</strong></p>
                  <p>• Máx Usuários: <strong>{plan.maxUsers}</strong></p>
                  <p>• Máx Pacientes: <strong>{plan.maxPatients}</strong></p>
                  <p>• Compartilhamento Filiais: <strong>{plan.hasPatientSharing ? 'Sim (Modelo B)' : 'Não'}</strong></p>
                  <p>• WhatsApp Oficial: <strong>{plan.hasWhatsAppAutomation ? 'Sim' : 'Manual'}</strong></p>
                </div>
              </div>

              <button
                onClick={() => setEditingPlan(plan)}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Editar Limites e Preços</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Client Clinics Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Clínicas Clientes Monitoradas
          </h3>
          <span className="text-xs text-slate-400">Ambientes Provisionados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-4">Clínica Cliente</th>
                <th className="py-2.5 px-4">Plano Atual</th>
                <th className="py-2.5 px-4">Status da Assinatura</th>
                <th className="py-2.5 px-4">Validade / Renovação</th>
                <th className="py-2.5 px-4 text-right">Ação de Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">
                  Instituto Dr. Newton Mureb
                  <span className="block text-[11px] text-slate-400 font-normal">2 Filiais (SP e RJ) · 25 usuários</span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded font-semibold text-purple-700 bg-purple-50 border border-purple-200">
                    Avançado Multiunidade
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded font-semibold ${
                    organization.status === 'active' 
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' 
                      : 'text-rose-700 bg-rose-50 border border-rose-200'
                  }`}>
                    {organization.status === 'active' ? 'Assinatura Ativa' : 'Conta Suspensa'}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Renova em 09/11/2027
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={toggleTenantStatus}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                      organization.status === 'active'
                        ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                        : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    {organization.status === 'active' ? 'Suspender Conta' : 'Reativar Conta'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Editar {editingPlan.name}</h3>
            <form onSubmit={handleSavePlan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preço Mensal (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPlan.priceMonthly}
                  onChange={(e) => setEditingPlan({ ...editingPlan, priceMonthly: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Máx. Filiais</label>
                  <input
                    type="number"
                    value={editingPlan.maxBranches}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxBranches: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Máx. Usuários</label>
                  <input
                    type="number"
                    value={editingPlan.maxUsers}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxUsers: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Máx. Pacientes Ativos</label>
                <input
                  type="number"
                  value={editingPlan.maxPatients}
                  onChange={(e) => setEditingPlan({ ...editingPlan, maxPatients: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}

    </div>
  );
};
