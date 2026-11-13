import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Plus, 
  Receipt, 
  CheckCircle2, 
  CreditCard, 
  Building2, 
  Stethoscope, 
  Search,
  FileCheck,
  Printer,
  X
} from 'lucide-react';
import { FinancialTransaction } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';
import {
  MedicalDocumentHeader,
  MedicalDocumentFooter,
  CLINIC_OFFICIAL_DATA,
} from '../../components/ClinicBrandLogo';

export const FinancialModule: React.FC = () => {
  const { activeBranchId, branches } = useTenant();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(
    StorageService.getFinancial(activeBranchId)
  );

  const patients = StorageService.getPatients();
  const professionals = StorageService.getProfessionals();
  const services = StorageService.getServices();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);

  // New Transaction Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id || '');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [description, setDescription] = useState(services[0]?.name || 'Consulta Médica');
  const [amount, setAmount] = useState(services[0]?.price || 850);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer'>('pix');
  const [installments, setInstallments] = useState(1);
  const [branchId, setBranchId] = useState(activeBranchId === 'all' ? branches[0]?.id : activeBranchId);

  const refreshList = () => {
    setTransactions(StorageService.getFinancial(activeBranchId));
  };

  // Metrics
  const totalReceived = transactions
    .filter(t => t.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPending = transactions
    .filter(t => t.status === 'pending')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === patientId);
    const professional = professionals.find(p => p.id === professionalId);
    const branch = branches.find(b => b.id === branchId);

    const newTx: FinancialTransaction = {
      id: `fin_${Date.now()}`,
      organizationId: 'org_mureb_01',
      branchId: branch?.id || branches[0].id,
      branchName: branch?.name || 'Matriz',
      patientId: patient?.id,
      patientName: patient?.fullName,
      professionalId: professional?.id,
      professionalName: professional?.fullName,
      serviceId,
      description,
      amount: Number(amount),
      type: 'receivable',
      paymentMethod,
      installments,
      status: 'paid',
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: new Date().toISOString(),
      receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveFinancialTransaction(newTx);
    refreshList();
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Módulo Financeiro & Faturamento da Clínica
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controle de contas a receber, faturamento por filial/profissional, formas de pagamento e emissão de recibos digitais.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Recebimento</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Faturamento Total Recebido</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-600">R$</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {totalReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Recebido e conciliado
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Contas a Receber (Pendentes)</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-600">R$</span>
            <span className="text-2xl font-extrabold text-amber-600 tabular-nums">
              {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">
            Parcelas e consultas a faturar
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Ticket Médio por Atendimento</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-600">R$</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {transactions.length > 0 ? (totalReceived / transactions.length).toFixed(2) : '0,00'}
            </span>
          </div>
          <p className="text-[11px] text-sky-600 font-medium mt-1">
            Consultas & Sessões Terapêuticas
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Histórico de Lançamentos Financeiros</h3>
          <span className="text-xs text-slate-400">{transactions.length} registros</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Recibo / Data</th>
                <th className="py-3 px-4">Descrição do Serviço</th>
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3 px-4">Profissional & Filial</th>
                <th className="py-3 px-4">Forma & Parcelas</th>
                <th className="py-3 px-4 text-right">Valor Líquido</th>
                <th className="py-3 px-4 text-right">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Nenhum lançamento financeiro para o período.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block">{t.receiptNumber || t.id}</span>
                      <span className="text-[10px] text-slate-400">{new Date(t.createdAt).toLocaleDateString('pt-BR')}</span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {t.description}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {t.patientName || 'Cliente Direto'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-800 block">{t.professionalName || 'Clínica'}</span>
                      <span className="text-[10px] text-slate-400 block">{t.branchName}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-700 uppercase block">{t.paymentMethod}</span>
                      <span className="text-[10px] text-slate-400 block">
                        {t.installments > 1 ? `${t.installments}x de R$ ${(t.amount / t.installments).toFixed(2)}` : 'À vista'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900 block tabular-nums text-sm">
                        R$ {t.amount.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                        t.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {t.status === 'paid' ? 'PAGO' : 'PENDENTE'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedReceipt(t)}
                        className="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                      >
                        Ver Recibo
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Novo Recebimento / Lançamento</h3>

            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Filial</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Paciente</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} ({p.documentCpf})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Profissional</label>
                  <select
                    value={professionalId}
                    onChange={(e) => setProfessionalId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {professionals.map(pr => (
                      <option key={pr.id} value={pr.id}>{pr.fullName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serviço</label>
                  <select
                    value={serviceId}
                    onChange={(e) => {
                      setServiceId(e.target.value);
                      const s = services.find(srv => srv.id === e.target.value);
                      if (s) {
                        setDescription(s.name);
                        setAmount(s.price);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg tabular-nums"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Forma</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="pix">Pix Instantâneo</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="cash">Dinheiro</option>
                    <option value="transfer">Transferência / TED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={installments}
                    onChange={(e) => setInstallments(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  Registrar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Receipt View Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:static print:bg-white print:p-0">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 print:max-w-none print:shadow-none print:border-none print:my-0 print:rounded-none">
            {/* Toolbar hidden on print */}
            <div className="print:hidden bg-[#1E2024] text-white px-6 py-3.5 flex items-center justify-between border-b border-[#D4AF37]/30">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-[#E5C158]" />
                <span className="text-xs font-bold tracking-wide">Recibo Médico Oficial · Padrão A4</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#1E2024] bg-[#E5C158] hover:bg-[#D4AF37] rounded-lg transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  title="Fechar recibo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6 text-slate-900 print:p-6">
              <MedicalDocumentHeader
                badgeTitle="Recibo de Honorários Médicos"
                badgeSubtitle={`Nº ${selectedReceipt.receiptNumber}`}
                badgeTone="gold"
              />

              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <p className="text-slate-700 leading-relaxed">
                  Recebemos de <strong className="text-slate-900">{selectedReceipt.patientName}</strong> a importância de{' '}
                  <strong className="text-emerald-800 text-sm tabular-nums">
                    R$ {selectedReceipt.amount.toFixed(2)}
                  </strong>{' '}
                  referente aos serviços médicos prestados por{' '}
                  <strong className="text-slate-900">
                    {CLINIC_OFFICIAL_DATA.physicianName} ({CLINIC_OFFICIAL_DATA.crm})
                  </strong>{' '}
                  junto à pessoa jurídica <strong className="text-slate-900">{CLINIC_OFFICIAL_DATA.legalName}</strong>{' '}
                  (CNPJ: <span className="font-mono">{CLINIC_OFFICIAL_DATA.cnpj}</span>).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Número do Recibo</span>
                    <span className="font-mono font-bold text-slate-900">{selectedReceipt.receiptNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Data do Pagamento</span>
                    <span className="font-semibold text-slate-900">
                      {new Date(selectedReceipt.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Serviço / Procedimento</span>
                    <span className="font-semibold text-slate-900">{selectedReceipt.description}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Forma de Pagamento</span>
                    <span className="uppercase font-semibold text-slate-900">
                      {selectedReceipt.paymentMethod}
                      {selectedReceipt.installments && selectedReceipt.installments > 1
                        ? ` (${selectedReceipt.installments}x)`
                        : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Unidade de Atendimento</span>
                    <span className="font-medium text-slate-800">{selectedReceipt.branchName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Valor Total Quitado</span>
                    <span className="text-base font-extrabold text-emerald-700 tabular-nums">
                      R$ {selectedReceipt.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center italic">
                Recibo válido para fins de comprovação de despesas médicas (IRPF) e solicitação de reembolso junto a operadoras de saúde.
              </p>

              <MedicalDocumentFooter
                dateLabel="Emissão"
                dateValue={new Date(selectedReceipt.createdAt).toLocaleDateString('pt-BR')}
                extraLeftText={`CNPJ ${CLINIC_OFFICIAL_DATA.cnpj} · ${CLINIC_OFFICIAL_DATA.phone}`}
                roleSubtitle="Médico Responsável Técnico"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
