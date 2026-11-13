import React, { useState } from 'react';
import { X, Plus, Trash2, Pill, ShieldCheck, Printer, AlertTriangle } from 'lucide-react';
import { Patient, Prescription, PrescriptionItem } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

interface PrescriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: (prescription: Prescription) => void;
}

export const PrescriptionFormModal: React.FC<PrescriptionFormModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { activeBranchId, branches } = useTenant();

  const [type, setType] = useState<'simples' | 'controle_especial'>('simples');
  const [specialControlNotificationType, setSpecialControlNotificationType] = useState<'A1' | 'B1' | 'C1'>('C1');
  const [validityDays, setValidityDays] = useState(30);
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [items, setItems] = useState<Array<Omit<PrescriptionItem, 'id'>>>([
    {
      medicineName: '',
      concentration: '',
      pharmaceuticalForm: 'Cápsula',
      dosageInstruction: '',
      treatmentDuration: '30 dias',
      quantity: '1 caixa / frasco',
      administrationRoute: 'Oral',
    }
  ]);

  if (!isOpen || !patient) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicineName: '',
        concentration: '',
        pharmaceuticalForm: 'Comprimido',
        dosageInstruction: '',
        treatmentDuration: 'Uso contínuo',
        quantity: '1 unidade',
        administrationRoute: 'Oral',
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Omit<PrescriptionItem, 'id'>, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const hasEmpty = items.some(item => !item.medicineName.trim() || !item.dosageInstruction.trim());
    if (hasEmpty) {
      setErrorMessage('Por favor, informe o nome do medicamento e a posologia para todos os itens.');
      return;
    }

    const prescriptionId = `rx_${Date.now()}`;
    const prescription: Prescription = {
      id: prescriptionId,
      organizationId: 'org_mureb_01',
      branchId: activeBranchId === 'all' ? branches[0].id : activeBranchId,
      patientId: patient.id,
      patientName: patient.fullName,
      patientCpf: patient.documentCpf,
      patientAddress: patient.address ? `${patient.address}, ${patient.addressNumber || ''} - ${patient.city || ''}/${patient.state || ''}` : undefined,
      professionalId: currentUser.id,
      professionalName: currentUser.fullName,
      professionalCouncil: 'CRM/RJ 52-444985',
      type,
      specialControlNotificationType: type === 'controle_especial' ? specialControlNotificationType : undefined,
      prescriptionDate: new Date().toISOString().split('T')[0],
      validityDays,
      items: items.map((it, idx) => ({ ...it, id: `item_${prescriptionId}_${idx}` })),
      generalInstructions,
      isSigned: true,
      signatureHash: `sha256_rx_${Math.random().toString(36).substring(2, 12)}`,
      buyerIdentification: type === 'controle_especial' ? {
        city: patient.city || 'Cabo Frio',
        state: patient.state || 'RJ'
      } : undefined,
      createdAt: new Date().toISOString(),
    };

    StorageService.savePrescription(prescription);
    onSuccess(prescription);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Nova Prescrição Médica &bull; {patient.fullName}
              </h3>
              <p className="text-xs text-slate-400">
                Padrão CFM e ANVISA (Portaria SVS/MS nº 344/98) com assinatura digital
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Tipo de Receituário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
              type === 'simples' ? 'bg-sky-50 border-sky-500 shadow-xs' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rxType"
                  checked={type === 'simples'}
                  onChange={() => setType('simples')}
                  className="text-sky-600"
                />
                <span className="font-bold text-slate-800">Receita Médica Simples</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 pl-5">
                Para fármacos isentos de controle especial, suplementos ortomoleculares e fitoterápicos.
              </p>
            </label>

            <label className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
              type === 'controle_especial' ? 'bg-amber-50 border-amber-500 shadow-xs' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="rxType"
                  checked={type === 'controle_especial'}
                  onChange={() => setType('controle_especial')}
                  className="text-amber-600"
                />
                <span className="font-bold text-slate-800">Controle Especial (ANVISA 344/98)</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500 pl-5">
                Gera automaticamente 1ª Via (Retenção da Drogaria) e 2ª Via (Orientação ao Paciente).
              </p>
            </label>
          </div>

          {/* Opções de Controle Especial se selecionado */}
          {type === 'controle_especial' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2 text-xs">
              <span className="font-bold text-amber-900 block">Classificação da Notificação / Lista:</span>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="notifType"
                    checked={specialControlNotificationType === 'C1'}
                    onChange={() => setSpecialControlNotificationType('C1')}
                  />
                  <span>Lista C1 (Branca 2 Vias - Antidepressivos, Anticonvulsivantes, Pregabalina)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="notifType"
                    checked={specialControlNotificationType === 'B1'}
                    onChange={() => setSpecialControlNotificationType('B1')}
                  />
                  <span>Lista B1 (Azul - Psicotrópicos)</span>
                </label>
              </div>
            </div>
          )}

          {/* Lista Dinâmica de Medicamentos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-sky-600" />
                <span>Medicamentos e Fórmulas Prescritas ({items.length})</span>
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Fármaco</span>
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Item #{index + 1}</span>
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Fármaco / Princípio Ativo / Fórmula *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.medicineName}
                      onChange={(e) => handleItemChange(index, 'medicineName', e.target.value)}
                      placeholder="Ex: Coenzima Q10, Pregabalina, Magnésio Dimalato"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Concentração / Dosagem
                    </label>
                    <input
                      type="text"
                      value={item.concentration}
                      onChange={(e) => handleItemChange(index, 'concentration', e.target.value)}
                      placeholder="Ex: 200mg, 10mg/mL"
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Via de Admin.</label>
                    <select
                      value={item.administrationRoute}
                      onChange={(e) => handleItemChange(index, 'administrationRoute', e.target.value)}
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Tópica">Tópica</option>
                      <option value="Sublingual">Sublingual</option>
                      <option value="Intramuscular">Intramuscular</option>
                      <option value="Intravenosa">Intravenosa</option>
                      <option value="Inalatória">Inalatória</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Forma Farmacêutica</label>
                    <input
                      type="text"
                      value={item.pharmaceuticalForm}
                      onChange={(e) => handleItemChange(index, 'pharmaceuticalForm', e.target.value)}
                      placeholder="Cápsula, Comprimido, Pomada"
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Quantidade</label>
                    <input
                      type="text"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="60 cápsulas, 1 frasco"
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duração</label>
                    <input
                      type="text"
                      value={item.treatmentDuration}
                      onChange={(e) => handleItemChange(index, 'treatmentDuration', e.target.value)}
                      placeholder="30 dias, uso contínuo"
                      className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Posologia / Modo de Usar *
                  </label>
                  <input
                    type="text"
                    required
                    value={item.dosageInstruction}
                    onChange={(e) => handleItemChange(index, 'dosageInstruction', e.target.value)}
                    placeholder="Ex: Ingerir 1 cápsula pela manhã junto ao desjejum por 60 dias."
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Orientações Gerais ao Paciente / Farmácia
            </label>
            <textarea
              rows={2}
              value={generalInstructions}
              onChange={(e) => setGeneralInstructions(e.target.value)}
              placeholder="Ex: Manipular com selo de qualidade ANVISA RDC 67/2007. Manter ao abrigo da luz e umidade."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Carimbo Médico */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assinatura Digital ICP-Brasil: <strong>Dr. Newton Mureb (CRM/RJ 52-444985)</strong></span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700">Validade: {validityDays} dias</span>
          </div>

          {/* Footer Buttons */}
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
              <span>Emitir e Assinar Receita</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
