import React, { useState } from 'react';
import { X, User, ShieldCheck, MapPin, AlertTriangle } from 'lucide-react';
import { Patient, PatientSharingMode } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPatient?: Patient | null;
  onSaveSuccess: () => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  existingPatient,
  onSaveSuccess,
}) => {
  const { branches, activeBranchId } = useTenant();
  const defaultBranch = activeBranchId !== 'all' ? activeBranchId : branches[0]?.id || '';

  const [fullName, setFullName] = useState(existingPatient?.fullName || '');
  const [documentCpf, setDocumentCpf] = useState(existingPatient?.documentCpf || '');
  const [birthDate, setBirthDate] = useState(existingPatient?.birthDate || '1990-01-01');
  const [gender, setGender] = useState(existingPatient?.gender || 'Feminino');
  const [phone, setPhone] = useState(existingPatient?.phone || '');
  const [whatsapp, setWhatsapp] = useState(existingPatient?.whatsapp || '');
  const [email, setEmail] = useState(existingPatient?.email || '');
  const [postalCode, setPostalCode] = useState(existingPatient?.postalCode || '');
  const [address, setAddress] = useState(existingPatient?.address || '');
  const [addressNumber, setAddressNumber] = useState(existingPatient?.addressNumber || '');
  const [neighborhood, setNeighborhood] = useState(existingPatient?.neighborhood || '');
  const [city, setCity] = useState(existingPatient?.city || 'São Paulo');
  const [state, setState] = useState(existingPatient?.state || 'SP');
  const [originBranchId, setOriginBranchId] = useState(existingPatient?.originBranchId || defaultBranch);
  const [emergencyContactName, setEmergencyContactName] = useState(existingPatient?.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(existingPatient?.emergencyContactPhone || '');
  const [administrativeNotes, setAdministrativeNotes] = useState(existingPatient?.administrativeNotes || '');
  
  // Sharing Mode: Model A (exclusive to origin branch) vs Model B (shared with other authorized branches)
  const [sharingMode, setSharingMode] = useState<PatientSharingMode>(existingPatient?.sharingMode || 'model_b_shared');
  const [authorizedBranchIds, setAuthorizedBranchIds] = useState<string[]>(
    existingPatient?.authorizedBranchIds || branches.map(b => b.id)
  );
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const toggleBranchAuth = (id: string) => {
    if (authorizedBranchIds.includes(id)) {
      setAuthorizedBranchIds(authorizedBranchIds.filter(b => b !== id));
    } else {
      setAuthorizedBranchIds([...authorizedBranchIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !documentCpf.trim() || !phone.trim()) {
      setErrorMessage('Nome completo, CPF e telefone são obrigatórios.');
      return;
    }

    const payload: Patient = {
      id: existingPatient?.id || `pat_${Date.now()}`,
      organizationId: 'org_mureb_01',
      originBranchId,
      fullName: fullName.trim(),
      documentCpf: documentCpf.trim(),
      birthDate,
      gender,
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      email: email.trim(),
      postalCode,
      address,
      addressNumber,
      neighborhood,
      city,
      state,
      emergencyContactName,
      emergencyContactPhone,
      administrativeNotes,
      sharingMode,
      authorizedBranchIds: sharingMode === 'model_b_shared' ? authorizedBranchIds : [originBranchId],
      createdAt: existingPatient?.createdAt || new Date().toISOString(),
      isActive: true,
    };

    const res = StorageService.savePatient(payload);
    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao salvar paciente.');
      return;
    }

    onSaveSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {existingPatient ? 'Editar Cadastro de Paciente' : 'Novo Paciente'}
              </h3>
              <p className="text-xs text-slate-400">Identificação, contato, filial e política de compartilhamento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Camila Albuquerque"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">CPF (Verificação de Duplicidade) *</label>
              <input
                type="text"
                required
                value={documentCpf}
                onChange={(e) => setDocumentCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sexo / Gênero</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Feminino">Feminino</option>
                <option value="Masculino">Masculino</option>
                <option value="Outro">Outro / Prefere não informar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filial de Referência *</label>
              <select
                value={originBranchId}
                onChange={(e) => setOriginBranchId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Principal *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="paciente@email.com"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Compartilhamento Multiunidade (Requisito 3.1) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <h4 className="text-xs font-bold text-slate-900">
                Política de Compartilhamento entre Filiais (Multiunidade)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                sharingMode === 'model_a_exclusive' 
                  ? 'bg-white border-sky-500 shadow-xs' 
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sharingMode"
                    checked={sharingMode === 'model_a_exclusive'}
                    onChange={() => setSharingMode('model_a_exclusive')}
                    className="text-sky-600"
                  />
                  <span className="font-bold text-slate-800">Modelo A: Exclusivo da Filial</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 pl-5">
                  O paciente será acessível exclusivamente pela filial de referência. Usuários de outras filiais não visualizam o cadastro.
                </p>
              </label>

              <label className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                sharingMode === 'model_b_shared' 
                  ? 'bg-white border-sky-500 shadow-xs' 
                  : 'bg-white/60 border-slate-200 hover:bg-white'
              }`}>
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sharingMode"
                    checked={sharingMode === 'model_b_shared'}
                    onChange={() => setSharingMode('model_b_shared')}
                    className="text-sky-600"
                  />
                  <span className="font-bold text-slate-800">Modelo B: Compartilhado</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500 pl-5">
                  Permite atendimento em diferentes unidades da mesma clínica com histórico médico compartilhado.
                </p>
              </label>
            </div>

            {sharingMode === 'model_b_shared' && (
              <div className="pt-2 pl-2">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Filiais Autorizadas para Atendimento e Consulta ao Prontuário:
                </span>
                <div className="flex flex-wrap gap-2">
                  {branches.map(b => (
                    <label key={b.id} className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                      <input
                        type="checkbox"
                        checked={authorizedBranchIds.includes(b.id)}
                        onChange={() => toggleBranchAuth(b.id)}
                        className="rounded text-sky-600"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contato de Emergência</label>
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Nome do familiar / grau de parentesco"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone de Emergência</label>
              <input
                type="text"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                placeholder="(11) 90000-0000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Administrativas / Alertas</label>
            <textarea
              rows={2}
              value={administrativeNotes}
              onChange={(e) => setAdministrativeNotes(e.target.value)}
              placeholder="Ex: Encaminhamento externo, convênio reembolso, preferências de contato."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
            >
              Salvar Paciente
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
