import React, { useState } from 'react';
import { X, Plus, Trash2, ClipboardList, ShieldCheck, AlertCircle } from 'lucide-react';
import { Patient, LabOrder, LabOrderItem } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

interface LabOrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: (order: LabOrder) => void;
}

export const LabOrderFormModal: React.FC<LabOrderFormModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { activeBranchId, branches } = useTenant();

  const [clinicalIndication, setClinicalIndication] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [items, setItems] = useState<Array<Omit<LabOrderItem, 'id'>>>([
    {
      examName: 'Hemograma completo com contagem de plaquetas',
      examType: 'laboratorial',
      urgency: 'rotina',
      observations: 'Jejum recomendado de 8 horas.',
    },
    {
      examName: 'PCR Ultrassensível e Ferritina',
      examType: 'laboratorial',
      urgency: 'rotina',
      observations: 'Avaliação de marcadores inflamatórios sistêmicos.',
    }
  ]);

  if (!isOpen || !patient) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        examName: '',
        examType: 'laboratorial',
        urgency: 'rotina',
        observations: '',
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Omit<LabOrderItem, 'id'>, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!clinicalIndication.trim()) {
      setErrorMessage('A indicação / justificativa clínica é obrigatória para emissão da solicitação de exames.');
      return;
    }

    const hasEmpty = items.some(it => !it.examName.trim());
    if (hasEmpty) {
      setErrorMessage('Informe o nome de todos os exames solicitados.');
      return;
    }

    const orderId = `order_${Date.now()}`;
    const order: LabOrder = {
      id: orderId,
      organizationId: 'org_mureb_01',
      branchId: activeBranchId === 'all' ? branches[0].id : activeBranchId,
      patientId: patient.id,
      patientName: patient.fullName,
      patientCpf: patient.documentCpf,
      professionalId: currentUser.id,
      professionalName: currentUser.fullName,
      professionalCouncil: 'CRM 84.320/SP',
      orderDate: new Date().toISOString().split('T')[0],
      clinicalIndication: clinicalIndication.trim(),
      items: items.map((it, idx) => ({ ...it, id: `item_${orderId}_${idx}` })),
      notes,
      isSigned: true,
      signatureHash: `sha256_order_${Math.random().toString(36).substring(2, 12)}`,
      status: 'requested',
      createdAt: new Date().toISOString(),
    };

    StorageService.saveLabOrder(order);
    onSuccess(order);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Solicitação de Exames Laboratoriais e Imagem
              </h3>
              <p className="text-xs text-slate-400">
                Paciente: {patient.fullName} (CPF: {patient.documentCpf})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Justificativa / Indicação Clínica * (Exigência CFM e Convênios Médicos)
            </label>
            <textarea
              required
              rows={2}
              value={clinicalIndication}
              onChange={(e) => setClinicalIndication(e.target.value)}
              placeholder="Ex: Investigação de síndrome metabólica, resistência insulínica, lipedema e inflamação subclínica crônica."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Lista de Exames */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Exames Solicitados ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Exame</span>
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700">Exame #{index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-rose-600 hover:text-rose-800 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      required
                      value={item.examName}
                      onChange={(e) => handleItemChange(index, 'examName', e.target.value)}
                      placeholder="Nome do exame (ex: Ultrassonografia com doppler, Curva glicêmica)"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <select
                      value={item.examType}
                      onChange={(e) => handleItemChange(index, 'examType', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="laboratorial">Laboratorial</option>
                      <option value="imagem">Imagem / USG / RX</option>
                      <option value="outros">Bioimpedância / Outros</option>
                    </select>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={item.observations || ''}
                    onChange={(e) => handleItemChange(index, 'observations', e.target.value)}
                    placeholder="Instruções de preparo (ex: Jejum 12h, bexiga cheia, repouso prévio)"
                    className="w-full px-3 py-1 text-[11px] border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Instruções Gerais ao Laboratório ou Paciente
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Retorno de resultados previsto para 15 dias após a coleta."
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assinatura Digital ICP-Brasil: <strong>{currentUser.fullName} (CRM 84.320/SP)</strong></span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700">Data: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Emitir Pedido de Exames</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
