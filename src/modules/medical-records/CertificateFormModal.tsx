import React, { useState } from 'react';
import { X, FileText, Search, ShieldCheck, AlertCircle, Lock, Check } from 'lucide-react';
import { Patient, MedicalCertificate, CertificateType } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { searchCid10, Cid10Item, COMMON_CID10 } from '../../services/cid10Data';

interface CertificateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onSuccess: (certificate: MedicalCertificate) => void;
}

export const CertificateFormModal: React.FC<CertificateFormModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { activeBranchId, branches } = useTenant();

  const [type, setType] = useState<CertificateType>('afastamento');
  const [daysOff, setDaysOff] = useState<number>(2);
  const [hoursOff, setHoursOff] = useState<string>('08:30 às 11:30');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activityPermitted, setActivityPermitted] = useState<string>('Musculação supervisionada, pilates clínico e exercícios funcionais');
  const [companionName, setCompanionName] = useState<string>('');
  const [companionKinship, setCompanionKinship] = useState<string>('');
  const [periodDescription, setPeriodDescription] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('Para fins de comprovação e justificativa de ausência laboral');

  // CID-10 Search & Selection
  const [cidQuery, setCidQuery] = useState('');
  const [selectedCid, setSelectedCid] = useState<Cid10Item | null>(COMMON_CID10[0]);
  const [isCidDropdownOpen, setIsCidDropdownOpen] = useState(false);
  
  // Regra Legal do CFM 1.658/2002: Exibir apenas sob expressa solicitação do paciente
  const [showCidOnPrint, setShowCidOnPrint] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !patient) return null;

  const cidResults = searchCid10(cidQuery, 8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const certId = `cert_${Date.now()}`;
    const certificate: MedicalCertificate = {
      id: certId,
      organizationId: 'org_mureb_01',
      branchId: activeBranchId === 'all' ? branches[0].id : activeBranchId,
      patientId: patient.id,
      patientName: patient.fullName,
      patientCpf: patient.documentCpf,
      patientSocialName: patient.socialName,
      professionalId: currentUser.id,
      professionalName: currentUser.fullName,
      professionalCouncil: 'CRM 84.320/SP · RQE 41.200',
      type,
      issueDate: new Date().toISOString().split('T')[0],
      startDate,
      daysOff: type === 'afastamento' ? Number(daysOff) : undefined,
      hoursOff: type === 'comparecimento' ? hoursOff : undefined,
      activityPermitted: type === 'aptidao_fisica' ? activityPermitted : undefined,
      companionName: type === 'acompanhante' ? companionName : undefined,
      companionKinship: type === 'acompanhante' ? companionKinship : undefined,
      periodDescription,
      cid10Code: selectedCid?.code,
      cid10Description: selectedCid?.description,
      showCidOnPrint,
      purpose,
      isSigned: true,
      signatureHash: `sha256_cert_${Math.random().toString(36).substring(2, 12)}`,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveCertificate(certificate);
    onSuccess(certificate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Novo Atestado / Declaração Médica
              </h3>
              <p className="text-xs text-slate-400">
                Resoluções CFM nº 1.658/2002 e 1.819/2007 &bull; Paciente: {patient.fullName}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Tipo de Atestado */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Documento Médico *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('afastamento')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                  type === 'afastamento' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Afastamento
              </button>
              <button
                type="button"
                onClick={() => setType('comparecimento')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                  type === 'comparecimento' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Comparecimento
              </button>
              <button
                type="button"
                onClick={() => setType('aptidao_fisica')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                  type === 'aptidao_fisica' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Aptidão Física
              </button>
              <button
                type="button"
                onClick={() => setType('acompanhante')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition text-center ${
                  type === 'acompanhante' ? 'bg-sky-50 border-sky-600 text-sky-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Acompanhante
              </button>
            </div>
          </div>

          {/* Campos específicos por tipo */}
          {type === 'afastamento' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dias de Afastamento Solicitados *
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={daysOff}
                  onChange={(e) => setDaysOff(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data de Início do Afastamento
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {type === 'comparecimento' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Período / Horário de Permanência na Clínica
              </label>
              <input
                type="text"
                value={hoursOff}
                onChange={(e) => setHoursOff(e.target.value)}
                placeholder="Ex: das 09:00 às 11:30"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {type === 'aptidao_fisica' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Atividades Liberadas / Recomendadas
              </label>
              <input
                type="text"
                value={activityPermitted}
                onChange={(e) => setActivityPermitted(e.target.value)}
                placeholder="Ex: Treino funcional, musculação de moderada intensidade e hidroginástica"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {type === 'acompanhante' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo do Acompanhante *
                </label>
                <input
                  type="text"
                  required
                  value={companionName}
                  onChange={(e) => setCompanionName(e.target.value)}
                  placeholder="Nome do familiar ou responsável"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grau de Parentesco / Vínculo
                </label>
                <input
                  type="text"
                  value={companionKinship}
                  onChange={(e) => setCompanionKinship(e.target.value)}
                  placeholder="Esposo(a), Filho(a), Cuidador(a)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          )}

          {/* Busca e Seleção do CID-10 */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Diagnóstico CID-10 (Armazenado no Prontuário Clínico)
            </label>

            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Digite código (ex: E88.2, I10, M79.7) ou descrição..."
                    value={cidQuery}
                    onChange={(e) => {
                      setCidQuery(e.target.value);
                      setIsCidDropdownOpen(true);
                    }}
                    onFocus={() => setIsCidDropdownOpen(true)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Selected CID Pill */}
              {selectedCid && (
                <div className="mt-2 p-2 bg-sky-50 border border-sky-200 rounded-lg text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded mr-2">
                      {selectedCid.code}
                    </span>
                    <span className="font-medium text-slate-800">{selectedCid.description}</span>
                  </div>
                  <span className="text-[10px] text-sky-700 font-semibold bg-white px-2 py-0.5 rounded border border-sky-200">
                    {selectedCid.category}
                  </span>
                </div>
              )}

              {/* Dropdown Results */}
              {isCidDropdownOpen && (
                <div className="absolute left-0 right-0 top-10 bg-white rounded-xl shadow-xl border border-slate-200 z-30 max-h-48 overflow-y-auto mt-1 p-1">
                  {cidResults.map(item => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        setSelectedCid(item);
                        setIsCidDropdownOpen(false);
                        setCidQuery('');
                      }}
                      className="w-full text-left p-2 hover:bg-sky-50 rounded-lg text-xs flex items-center justify-between transition"
                    >
                      <div>
                        <span className="font-mono font-bold text-sky-800 mr-2">{item.code}</span>
                        <span className="text-slate-700">{item.description}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Regra Legal do CID-10 (Resolução CFM nº 1.658/2002) - Checkbox Obrigatório com Alerta */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCidOnPrint}
                onChange={(e) => setShowCidOnPrint(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded mt-0.5"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">
                  Exibir CID-10 no documento impresso a pedido expresso do paciente
                </span>
                <span className="text-[11px] text-slate-600 block mt-0.5">
                  Conforme a <strong>Resolução CFM nº 1.658/2002</strong>, o diagnóstico CID-10 é protegido pelo sigilo médico e somente pode ser impresso no atestado se solicitado formalmente pelo próprio paciente.
                </span>
              </div>
            </label>

            {showCidOnPrint && (
              <div className="pt-2 pl-6 text-[11px] text-amber-900 border-t border-amber-200/80">
                ✓ Será impresso o termo formal de consentimento no rodapé do documento com campo de assinatura do paciente.
              </div>
            )}
          </div>

          {/* Assinatura e Carimbo */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Assinatura Digital: <strong>{currentUser.fullName} (CRM 84.320/SP)</strong></span>
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
              <span>Emitir Atestado Oficial</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
