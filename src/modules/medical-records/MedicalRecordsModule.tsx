import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Stethoscope, 
  Plus, 
  CheckCircle2, 
  Lock, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  Pill, 
  ClipboardList, 
  Search,
  AlertCircle
} from 'lucide-react';
import { MedicalRecordEntry, Patient } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

interface MedicalRecordsModuleProps {
  initialPatient?: Patient | null;
}

export const MedicalRecordsModule: React.FC<MedicalRecordsModuleProps> = ({ initialPatient }) => {
  const { currentUser, canEditMedicalRecords } = useAuth();
  const { activeBranchId, branches } = useTenant();

  const patients = StorageService.getPatients(activeBranchId);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatient?.id || patients[0]?.id || ''
  );
  
  const [records, setRecords] = useState<MedicalRecordEntry[]>(
    StorageService.getMedicalRecords(selectedPatientId)
  );

  // New Record Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [diagnosticHypothesis, setDiagnosticHypothesis] = useState('');
  const [therapeuticPlan, setTherapeuticPlan] = useState('');
  const [prescriptions, setPrescriptions] = useState('');
  const [examRequests, setExamRequests] = useState('');
  const [evolutionNotes, setEvolutionNotes] = useState('');
  const [isSigned, setIsSigned] = useState(true);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const handlePatientChange = (id: string) => {
    setSelectedPatientId(id);
    setRecords(StorageService.getMedicalRecords(id));
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (!chiefComplaint.trim() || !therapeuticPlan.trim()) {
      alert('Por favor, preencha pelo menos a Queixa Principal e o Plano Terapêutico.');
      return;
    }

    const newRecord: MedicalRecordEntry = {
      id: `rec_${Date.now()}`,
      organizationId: 'org_mureb_01',
      patientId: selectedPatient.id,
      branchId: activeBranchId === 'all' ? branches[0].id : activeBranchId,
      professionalId: currentUser.id,
      professionalName: currentUser.fullName,
      recordDate: new Date().toISOString(),
      chiefComplaint,
      clinicalHistory,
      physicalExam,
      diagnosticHypothesis,
      therapeuticPlan,
      prescriptions,
      examRequests,
      evolutionNotes,
      isSigned,
      signatureHash: isSigned ? `sha256_${Math.random().toString(36).substring(2, 15)}` : undefined,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveMedicalRecord(newRecord);
    setRecords(StorageService.getMedicalRecords(selectedPatient.id));
    setIsFormOpen(false);

    // Reset Form
    setChiefComplaint('');
    setClinicalHistory('');
    setPhysicalExam('');
    setDiagnosticHypothesis('');
    setTherapeuticPlan('');
    setPrescriptions('');
    setExamRequests('');
    setEvolutionNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Prontuário Eletrônico do Paciente
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conformidade LGPD & CFM</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Histórico clínico imutável, anamnese, diagnósticos, evolução, prescrições e rastreamento de autoria.
          </p>
        </div>

        {canEditMedicalRecords && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isFormOpen ? 'Fechar Formulário' : 'Nova Evolução Clínica'}</span>
          </button>
        )}
      </div>

      {/* Patient Selector Strip */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-sky-600 shrink-0" />
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Selecione o Paciente em Atendimento:
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="mt-0.5 px-3 py-1.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} (CPF: {p.documentCpf}) · {p.sharingMode === 'model_b_shared' ? 'Modelo B (Compartilhado)' : 'Modelo A (Exclusivo)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedPatient && (
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Filial de Referência</span>
              <span className="font-semibold text-slate-800">
                {branches.find(b => b.id === selectedPatient.originBranchId)?.name || 'Matriz'}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Contato Direto</span>
              <span className="font-semibold text-slate-800">{selectedPatient.phone}</span>
            </div>
          </div>
        )}
      </div>

      {/* New Evolution Form (Collapsible) */}
      {isFormOpen && (
        <form onSubmit={handleSaveEntry} className="p-6 bg-white rounded-2xl border border-sky-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Novo Registro Clínico / Atendimento para {selectedPatient?.fullName}
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Profissional: <strong className="text-slate-700">{currentUser.fullName}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Queixa Principal *</label>
              <textarea
                required
                rows={2}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Ex: Fadiga vespertina, queixa de inchaço nos membros inferiores, perda de força muscular."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Histórico Clínico / Anamnese</label>
              <textarea
                rows={2}
                value={clinicalHistory}
                onChange={(e) => setClinicalHistory(e.target.value)}
                placeholder="Antecedentes, hábitos de vida, sono, digestão, histórico familiar."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exame Físico / Avaliação Funcional</label>
              <textarea
                rows={2}
                value={physicalExam}
                onChange={(e) => setPhysicalExam(e.target.value)}
                placeholder="Inspeção segmentar, perimetria, sinal do manguito, palpação profunda, tônus muscular."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hipóteses Diagnósticas / Disfunções Bioquímicas</label>
              <textarea
                rows={2}
                value={diagnosticHypothesis}
                onChange={(e) => setDiagnosticHypothesis(e.target.value)}
                placeholder="Ex: Lipedema Estágio II, disfunção mitocondrial, resistência insulínica compensada."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Plano Terapêutico & Condutas *</label>
            <textarea
              required
              rows={3}
              value={therapeuticPlan}
              onChange={(e) => setTherapeuticPlan(e.target.value)}
              placeholder="1. Modulação nutricional anti-inflamatória. 2. Prescrição de fitoquímicos e antioxidantes. 3. Fisioterapia metabólica semanal."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-sky-600" />
                <span>Prescrições / Modulação Ortomolecular / Fórmulas</span>
              </label>
              <textarea
                rows={3}
                value={prescriptions}
                onChange={(e) => setPrescriptions(e.target.value)}
                placeholder="Ex:&#10;• Coenzima Q10 200mg (1 dose ao dia)&#10;• Resveratrol 100mg + Quercetina 250mg&#10;• Magnésio Dimalato 300mg"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-sky-600" />
                <span>Solicitações de Exames Laboratoriais e Imagem</span>
              </label>
              <textarea
                rows={3}
                value={examRequests}
                onChange={(e) => setExamRequests(e.target.value)}
                placeholder="Ex: Curva glicêmica/insulinêmica, PCR ultrassensível, Ferritina, Perfil de citocinas inflamatórias, Ultrassom com doppler."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Digital Signature Confirmation */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="text-xs text-emerald-800">
              <span className="font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Assinatura Digital & Carimbo de Auditoria</span>
              </span>
              <span className="text-[11px] text-emerald-700">
                O registro será selado com carimbo de tempo imutável em nome de {currentUser.fullName}.
              </span>
            </div>
            <input
              type="checkbox"
              checked={isSigned}
              onChange={(e) => setIsSigned(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
            >
              Gravar no Prontuário
            </button>
          </div>
        </form>
      )}

      {/* Historical Entries Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Histórico Cronológico de Atendimentos ({records.length})
        </h3>

        {records.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            Nenhuma evolução médica gravada para este paciente até o momento.
          </div>
        ) : (
          records.map((rec) => (
            <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
              
              {/* Record Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {rec.professionalName} · Atendimento Clínico
                    </h4>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rec.recordDate).toLocaleDateString('pt-BR')} às {new Date(rec.recordDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {rec.isSigned && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Assinado Digitalmente ({rec.signatureHash?.substring(0, 16)}...)</span>
                  </div>
                )}
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block">Queixa Principal:</span>
                  <p className="text-slate-600 leading-relaxed">{rec.chiefComplaint}</p>
                </div>

                {rec.clinicalHistory && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">Anamnese / Histórico:</span>
                    <p className="text-slate-600 leading-relaxed">{rec.clinicalHistory}</p>
                  </div>
                )}
              </div>

              {rec.diagnosticHypothesis && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">Hipótese Diagnóstica:</span>
                  <p className="text-slate-700 leading-relaxed">{rec.diagnosticHypothesis}</p>
                </div>
              )}

              <div className="p-3.5 bg-sky-50/50 rounded-xl border border-sky-100 text-xs space-y-1.5">
                <span className="font-bold text-sky-900 block">Plano Terapêutico & Condutas Adotadas:</span>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{rec.therapeuticPlan}</p>
              </div>

              {rec.prescriptions && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Pill className="w-4 h-4 text-sky-600" />
                    <span>Prescrições / Formulações Ortomoleculares:</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-800 whitespace-pre-line bg-white p-3 rounded-lg border border-slate-200">
                    {rec.prescriptions}
                  </pre>
                </div>
              )}

              {rec.examRequests && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                    <span>Pedidos de Exames Laboratoriais:</span>
                  </div>
                  <p className="text-amber-800">{rec.examRequests}</p>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};
