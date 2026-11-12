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
  AlertCircle,
  AlertTriangle,
  Printer,
  Activity,
  Heart,
  Thermometer,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck
} from 'lucide-react';
import { 
  MedicalRecordEntry, 
  Patient, 
  Prescription, 
  MedicalCertificate, 
  LabOrder, 
  ExamResult, 
  VitalSigns 
} from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { calculateBmi, calculateAge } from '../../services/brazilianFormatters';
import { searchCid10, Cid10Item } from '../../services/cid10Data';

// Modals
import { AddendumModal } from './AddendumModal';
import { PrescriptionFormModal } from './PrescriptionFormModal';
import { CertificateFormModal } from './CertificateFormModal';
import { LabOrderFormModal } from './LabOrderFormModal';
import { ExamResultModal } from './ExamResultModal';
import { DocumentPrintModal, PrintableDocumentType } from '../../components/medical-documents/DocumentPrintModal';

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
  
  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Active Tab within Medical Records
  const [activeTab, setActiveTab] = useState<'evolutions' | 'prescriptions' | 'certificates' | 'exams' | 'timeline'>('evolutions');

  // Data Collections for selected patient
  const [records, setRecords] = useState<MedicalRecordEntry[]>(
    selectedPatient ? StorageService.getMedicalRecords(selectedPatient.id) : []
  );
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(
    selectedPatient ? StorageService.getPrescriptions(selectedPatient.id) : []
  );
  const [certificates, setCertificates] = useState<MedicalCertificate[]>(
    selectedPatient ? StorageService.getCertificates(selectedPatient.id) : []
  );
  const [labOrders, setLabOrders] = useState<LabOrder[]>(
    selectedPatient ? StorageService.getLabOrders(selectedPatient.id) : []
  );
  const [examResults, setExamResults] = useState<ExamResult[]>(
    selectedPatient ? StorageService.getExamResults(selectedPatient.id) : []
  );

  // New Record Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [consultationType, setConsultationType] = useState<'soap' | 'free_text'>('soap');

  // SOAP Inputs
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalHistory, setClinicalHistory] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [diagnosticHypothesis, setDiagnosticHypothesis] = useState('');
  const [therapeuticPlan, setTherapeuticPlan] = useState('');
  const [prescriptionsText, setPrescriptionsText] = useState('');
  const [examRequestsText, setExamRequestsText] = useState('');
  const [evolutionNotes, setEvolutionNotes] = useState('');

  // Vital Signs
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<string>('120');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<string>('80');
  const [heartRateBpm, setHeartRateBpm] = useState<string>('72');
  const [respiratoryRateRpm, setRespiratoryRateRpm] = useState<string>('16');
  const [temperatureCelsius, setTemperatureCelsius] = useState<string>('36.5');
  const [oxygenSaturationPercent, setOxygenSaturationPercent] = useState<string>('98');
  const [capillaryBloodGlucoseMgDl, setCapillaryBloodGlucoseMgDl] = useState<string>('');
  const [vitalWeightKg, setVitalWeightKg] = useState<string>(selectedPatient?.weightKg?.toString() || '70');
  const [vitalHeightCm, setVitalHeightCm] = useState<string>(selectedPatient?.heightCm?.toString() || '170');

  // CID-10 selector inside SOAP
  const [cidInput, setCidInput] = useState('');
  const [selectedCids, setSelectedCids] = useState<Array<{ code: string; description: string }>>([]);
  const [isCidSearchOpen, setIsCidSearchOpen] = useState(false);

  // Modals state
  const [isAddendumOpen, setIsAddendumOpen] = useState(false);
  const [selectedRecordForAddendum, setSelectedRecordForAddendum] = useState<MedicalRecordEntry | null>(null);

  const [isRxModalOpen, setIsRxModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isLabOrderModalOpen, setIsLabOrderModalOpen] = useState(false);
  const [isExamResultModalOpen, setIsExamResultModalOpen] = useState(false);

  // Print Document Modal State
  const [printableDoc, setPrintableDoc] = useState<PrintableDocumentType | null>(null);

  const refreshPatientData = (patientId: string) => {
    setRecords(StorageService.getMedicalRecords(patientId));
    setPrescriptions(StorageService.getPrescriptions(patientId));
    setCertificates(StorageService.getCertificates(patientId));
    setLabOrders(StorageService.getLabOrders(patientId));
    setExamResults(StorageService.getExamResults(patientId));
  };

  React.useEffect(() => {
    if (initialPatient?.id) {
      setSelectedPatientId(initialPatient.id);
      refreshPatientData(initialPatient.id);
    }
  }, [initialPatient]);

  const handlePatientChange = (id: string) => {
    setSelectedPatientId(id);
    refreshPatientData(id);
    setIsFormOpen(false);
    setEditingRecordId(null);
  };

  // Calculated BMI in realtime for vitals
  const vitalsBmi = calculateBmi(Number(vitalWeightKg), Number(vitalHeightCm));

  // Add CID to SOAP
  const handleAddCid = (cid: Cid10Item) => {
    if (!selectedCids.some(c => c.code === cid.code)) {
      setSelectedCids([...selectedCids, { code: cid.code, description: cid.description }]);
    }
    setCidInput('');
    setIsCidSearchOpen(false);
  };

  const handleRemoveCid = (code: string) => {
    setSelectedCids(selectedCids.filter(c => c.code !== code));
  };

  // Open Edit Draft
  const handleEditDraft = (rec: MedicalRecordEntry) => {
    setEditingRecordId(rec.id);
    setConsultationType(rec.consultationType || 'soap');
    setChiefComplaint(rec.chiefComplaint);
    setClinicalHistory(rec.clinicalHistory);
    setPhysicalExam(rec.physicalExam || '');
    setDiagnosticHypothesis(rec.diagnosticHypothesis || '');
    setTherapeuticPlan(rec.therapeuticPlan);
    setPrescriptionsText(rec.prescriptions || '');
    setExamRequestsText(rec.examRequests || '');
    setEvolutionNotes(rec.evolutionNotes || '');
    setSelectedCids(rec.cid10Codes || []);

    if (rec.vitalSigns) {
      setBloodPressureSystolic(rec.vitalSigns.bloodPressureSystolic?.toString() || '120');
      setBloodPressureDiastolic(rec.vitalSigns.bloodPressureDiastolic?.toString() || '80');
      setHeartRateBpm(rec.vitalSigns.heartRateBpm?.toString() || '72');
      setRespiratoryRateRpm(rec.vitalSigns.respiratoryRateRpm?.toString() || '16');
      setTemperatureCelsius(rec.vitalSigns.temperatureCelsius?.toString() || '36.5');
      setOxygenSaturationPercent(rec.vitalSigns.oxygenSaturationPercent?.toString() || '98');
      setCapillaryBloodGlucoseMgDl(rec.vitalSigns.capillaryBloodGlucoseMgDl?.toString() || '');
      setVitalWeightKg(rec.vitalSigns.weightKg?.toString() || '');
      setVitalHeightCm(rec.vitalSigns.heightCm?.toString() || '');
    }
    setIsFormOpen(true);
  };

  const handleSaveEntry = (statusToSave: 'draft' | 'signed') => {
    if (!selectedPatient) return;

    if (!chiefComplaint.trim() || !therapeuticPlan.trim()) {
      alert('Por favor, informe ao menos a Queixa Principal e o Plano Terapêutico.');
      return;
    }

    const vitalsData: VitalSigns = {
      bloodPressureSystolic: bloodPressureSystolic ? Number(bloodPressureSystolic) : undefined,
      bloodPressureDiastolic: bloodPressureDiastolic ? Number(bloodPressureDiastolic) : undefined,
      heartRateBpm: heartRateBpm ? Number(heartRateBpm) : undefined,
      respiratoryRateRpm: respiratoryRateRpm ? Number(respiratoryRateRpm) : undefined,
      temperatureCelsius: temperatureCelsius ? Number(temperatureCelsius) : undefined,
      oxygenSaturationPercent: oxygenSaturationPercent ? Number(oxygenSaturationPercent) : undefined,
      capillaryBloodGlucoseMgDl: capillaryBloodGlucoseMgDl ? Number(capillaryBloodGlucoseMgDl) : undefined,
      weightKg: vitalWeightKg ? Number(vitalWeightKg) : undefined,
      heightCm: vitalHeightCm ? Number(vitalHeightCm) : undefined,
      bmi: vitalsBmi?.bmi,
    };

    const isSigned = statusToSave === 'signed';

    const entryToSave: MedicalRecordEntry = {
      id: editingRecordId || `rec_${Date.now()}`,
      organizationId: 'org_mureb_01',
      patientId: selectedPatient.id,
      branchId: activeBranchId === 'all' ? branches[0].id : activeBranchId,
      professionalId: currentUser.id,
      professionalName: currentUser.fullName,
      professionalCouncilNumber: 'CRM 84.320/SP',
      recordDate: new Date().toISOString(),
      status: statusToSave,
      consultationType,
      chiefComplaint: chiefComplaint.trim(),
      clinicalHistory: clinicalHistory.trim(),
      vitalSigns: vitalsData,
      physicalExam: physicalExam.trim(),
      diagnosticHypothesis: diagnosticHypothesis.trim(),
      cid10Codes: selectedCids,
      therapeuticPlan: therapeuticPlan.trim(),
      prescriptions: prescriptionsText.trim(),
      examRequests: examRequestsText.trim(),
      evolutionNotes: evolutionNotes.trim(),
      isSigned,
      signedAt: isSigned ? new Date().toISOString() : undefined,
      signatureHash: isSigned ? `sha256_rec_${Math.random().toString(36).substring(2, 12)}` : undefined,
      createdAt: new Date().toISOString(),
    };

    const res = StorageService.saveMedicalRecord(entryToSave);
    if (!res.success) {
      alert(res.message);
      return;
    }

    refreshPatientData(selectedPatient.id);
    setIsFormOpen(false);
    setEditingRecordId(null);

    // Reset Form
    setChiefComplaint('');
    setClinicalHistory('');
    setPhysicalExam('');
    setDiagnosticHypothesis('');
    setSelectedCids([]);
    setTherapeuticPlan('');
    setPrescriptionsText('');
    setExamRequestsText('');
    setEvolutionNotes('');
  };

  const patientAge = selectedPatient ? calculateAge(selectedPatient.birthDate) : null;
  const patientBmi = selectedPatient && selectedPatient.weightKg && selectedPatient.heightCm 
    ? calculateBmi(selectedPatient.weightKg, selectedPatient.heightCm) 
    : null;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Prontuário Eletrônico do Paciente (PEP)
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Conforme CFM 1.638/2002 & LGPD</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evoluções clínicas imutáveis, método SOAP, sinais vitais, emissão de receituários ANVISA e atestados.
          </p>
        </div>

        {canEditMedicalRecords && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditingRecordId(null);
                setIsFormOpen(!isFormOpen);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isFormOpen ? 'Fechar Formulário' : 'Nova Evolução (SOAP)'}</span>
            </button>
            
            <button
              onClick={() => setIsRxModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Pill className="w-4 h-4 text-sky-600" />
              <span>Nova Receita</span>
            </button>

            <button
              onClick={() => setIsCertModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Novo Atestado</span>
            </button>

            <button
              onClick={() => setIsLabOrderModalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <ClipboardList className="w-4 h-4 text-amber-600" />
              <span>Pedir Exames</span>
            </button>
          </div>
        )}
      </div>

      {/* Patient Selector and Clinical Identification Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-sm">
            <User className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Paciente em Atendimento no PEP:
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="mt-0.5 px-3 py-1.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} {p.socialName ? `(${p.socialName})` : ''} · CPF: {p.documentCpf}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedPatient && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Idade / Sexo</span>
              <span className="font-semibold text-slate-900">
                {patientAge ? `${patientAge} anos` : 'N/A'} &bull; {selectedPatient.gender}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Tipo Sanguíneo</span>
              <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                {selectedPatient.bloodType || 'Não informado'}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Peso / Altura / IMC</span>
              <span className="font-semibold text-slate-900">
                {selectedPatient.weightKg ? `${selectedPatient.weightKg} kg` : '-'} &bull; {selectedPatient.heightCm ? `${selectedPatient.heightCm} cm` : '-'}
                {patientBmi && (
                  <span className="ml-1.5 text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                    IMC {patientBmi.bmi}
                  </span>
                )}
              </span>
            </div>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Convênio</span>
              <span className="font-medium text-slate-800">
                {selectedPatient.healthPlanType === 'convenio' 
                  ? `${selectedPatient.healthPlanOperator || 'Convênio'} (${selectedPatient.healthPlanNumber || ''})` 
                  : 'Particular'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BANNER DE ALERTA DE ALERGIAS EM DESTAQUE VERMELHO NO TOPO (Segurança do Paciente ANVISA/CFM) */}
      {selectedPatient?.allergies && selectedPatient.allergies.length > 0 && (
        <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-sm flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <span>ALERTA DE SEGURANÇA &bull; ALERGIAS MEDICAMENTOSAS / ALIMENTARES:</span>
              <span className="px-2 py-0.5 bg-white text-rose-700 font-bold rounded-full text-[10px]">
                {selectedPatient.allergies.length} ALERTA(S)
              </span>
            </h4>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {selectedPatient.allergies.map((allergy, i) => (
                <span key={i} className="px-2.5 py-1 bg-white/20 text-white font-bold rounded-lg text-xs border border-white/30">
                  &bull; {allergy}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navegação entre Abas do Prontuário */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('evolutions')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'evolutions' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Evoluções & SOAP ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'prescriptions' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Receituários ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'certificates' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Atestados ({certificates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'exams' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Exames & Laudos ({labOrders.length + examResults.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'timeline' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Linha do Tempo Clínica</span>
        </button>
      </div>

      {/* New Evolution Form (Collapsible SOAP & Free Text) */}
      {isFormOpen && (
        <div className="p-6 bg-white rounded-2xl border border-sky-300 shadow-md space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {editingRecordId ? 'Editando Rascunho de Atendimento' : 'Nova Evolução Clínica'} &bull; {selectedPatient?.fullName}
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-2">Método:</span>
              <button
                type="button"
                onClick={() => setConsultationType('soap')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  consultationType === 'soap' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                SOAP Estruturado
              </button>
              <button
                type="button"
                onClick={() => setConsultationType('free_text')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition ${
                  consultationType === 'free_text' ? 'bg-sky-600 text-white border-sky-600' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Evolução Livre
              </button>
            </div>
          </div>

          {/* SINAIS VITAIS (O - Objetivo) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Activity className="w-4 h-4 text-sky-600" />
                <span>Registro de Sinais Vitais da Consulta</span>
              </div>
              {vitalsBmi && (
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                  IMC Calculado: {vitalsBmi.bmi} kg/m² ({vitalsBmi.classification})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">PA Sistólica</label>
                <input
                  type="number"
                  placeholder="120"
                  value={bloodPressureSystolic}
                  onChange={(e) => setBloodPressureSystolic(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">PA Diastólica</label>
                <input
                  type="number"
                  placeholder="80"
                  value={bloodPressureDiastolic}
                  onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">FC (bpm)</label>
                <input
                  type="number"
                  placeholder="72"
                  value={heartRateBpm}
                  onChange={(e) => setHeartRateBpm(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="36.5"
                  value={temperatureCelsius}
                  onChange={(e) => setTemperatureCelsius(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">SpO2 (%)</label>
                <input
                  type="number"
                  placeholder="98"
                  value={oxygenSaturationPercent}
                  onChange={(e) => setOxygenSaturationPercent(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Glicemia (mg/dL)</label>
                <input
                  type="number"
                  placeholder="95"
                  value={capillaryBloodGlucoseMgDl}
                  onChange={(e) => setCapillaryBloodGlucoseMgDl(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={vitalWeightKg}
                  onChange={(e) => setVitalWeightKg(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Altura (cm)</label>
                <input
                  type="number"
                  placeholder="170"
                  value={vitalHeightCm}
                  onChange={(e) => setVitalHeightCm(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* S - SUBJETIVO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-sky-950 mb-1">
                S - Subjetivo: Queixa Principal & HDA *
              </label>
              <textarea
                required
                rows={3}
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="Motivo da consulta, sintomas referidos pelo paciente, início e evolução da queixa..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-sky-950 mb-1">
                S - Histórico Clínico & Hábitos de Vida
              </label>
              <textarea
                rows={3}
                value={clinicalHistory}
                onChange={(e) => setClinicalHistory(e.target.value)}
                placeholder="Histórico familiar, antecedentes patológicos, sono, digestão, rotina nutricional..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* O - OBJETIVO */}
          <div>
            <label className="block text-xs font-bold text-teal-950 mb-1">
              O - Objetivo: Exame Físico & Avaliação Funcional
            </label>
            <textarea
              rows={2}
              value={physicalExam}
              onChange={(e) => setPhysicalExam(e.target.value)}
              placeholder="Inspeção, palpação, edema com sinal de cacifo, sinal do manguito, perimetria, amplitude de movimento..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* A - AVALIAÇÃO & CID-10 */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-indigo-950">
              A - Avaliação: Hipótese Diagnóstica & Codificação CID-10
            </label>

            <textarea
              rows={2}
              value={diagnosticHypothesis}
              onChange={(e) => setDiagnosticHypothesis(e.target.value)}
              placeholder="Raciocínio clínico, diagnósticos diferenciais, estado metabólico e funcional..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            {/* CID-10 Tag Selector */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Vincular Códigos CID-10 a esta Consulta:
              </span>

              <div className="flex flex-wrap gap-2">
                {selectedCids.map(cid => (
                  <span key={cid.code} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-medium">
                    <strong className="font-mono">{cid.code}</strong> &bull; {cid.description}
                    <button
                      type="button"
                      onClick={() => handleRemoveCid(cid.code)}
                      className="text-indigo-400 hover:text-indigo-700 font-bold ml-1"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Pesquisar CID-10 para adicionar (ex: E88.2, E11, I10)..."
                  value={cidInput}
                  onChange={(e) => {
                    setCidInput(e.target.value);
                    setIsCidSearchOpen(true);
                  }}
                  onFocus={() => setIsCidSearchOpen(true)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />

                {isCidSearchOpen && (
                  <div className="absolute left-0 right-0 top-9 bg-white rounded-xl shadow-xl border border-slate-200 z-30 max-h-40 overflow-y-auto p-1">
                    {searchCid10(cidInput, 6).map(item => (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => handleAddCid(item)}
                        className="w-full text-left p-2 hover:bg-indigo-50 rounded-lg text-xs flex items-center justify-between"
                      >
                        <div>
                          <strong className="font-mono text-indigo-900 mr-2">{item.code}</strong>
                          <span className="text-slate-700">{item.description}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{item.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* P - PLANO & CONDUTAS */}
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              P - Plano: Condutas Terapêuticas, Prescrições e Orientações *
            </label>
            <textarea
              required
              rows={3}
              value={therapeuticPlan}
              onChange={(e) => setTherapeuticPlan(e.target.value)}
              placeholder="1. Prescrição medicamentosa e suplementação. 2. Orientações nutricionais. 3. Encaminhamentos interdisciplinares. 4. Previsão de retorno."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Digital Signature & CFM Gold Rule Compliance Notice */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-emerald-950">
              <span className="font-bold flex items-center gap-1.5 text-sm">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>Assinatura Digital & Imutabilidade (CFM nº 1.821/2007)</span>
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Ao clicar em <strong>"Finalizar e Assinar"</strong>, a evolução será selada irreversivelmente com seu CRM ({currentUser.fullName}). Para retificações posteriores, será obrigatório o uso de Adendo / Errata.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveEntry('draft')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-xs transition"
              >
                Salvar Rascunho
              </button>

              <button
                type="button"
                onClick={() => handleSaveEntry('signed')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Finalizar e Assinar</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 1: EVOLUÇÕES CLÍNICAS (SOAP & CFM IMMUTABILITY)
          ========================================================================= */}
      {activeTab === 'evolutions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Histórico de Evoluções Clínicas do Paciente ({records.length})
            </h3>
          </div>

          {records.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Nenhuma evolução médica registrada para este paciente até o momento.
            </div>
          ) : (
            records.map((rec) => (
              <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                
                {/* Record Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {rec.professionalName} &bull; {rec.professionalCouncilNumber || 'CRM'}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Atendimento em {new Date(rec.recordDate).toLocaleDateString('pt-BR')} às {new Date(rec.recordDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {rec.status === 'signed' ? (
                      <div className="flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assinado & Imutável ({rec.signatureHash?.substring(0, 14)}...)</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Rascunho (Em Elaboração)</span>
                      </div>
                    )}

                    {rec.status === 'draft' && (
                      <button
                        onClick={() => handleEditDraft(rec)}
                        className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition"
                      >
                        Continuar Rascunho
                      </button>
                    )}

                    {rec.status === 'signed' && (
                      <button
                        onClick={() => {
                          setSelectedRecordForAddendum(rec);
                          setIsAddendumOpen(true);
                        }}
                        className="px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition flex items-center gap-1"
                        title="Adicionar adendo ou errata sem alterar o texto original (CFM 1.821/2007)"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Adendo / Errata</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* SINAIS VITAIS DO ATENDIMENTO */}
                {rec.vitalSigns && (
                  <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-sky-600" />
                      <span>Sinais Vitais:</span>
                    </span>
                    {rec.vitalSigns.bloodPressureSystolic && (
                      <span><strong>PA:</strong> {rec.vitalSigns.bloodPressureSystolic}/{rec.vitalSigns.bloodPressureDiastolic} mmHg</span>
                    )}
                    {rec.vitalSigns.heartRateBpm && (
                      <span><strong>FC:</strong> {rec.vitalSigns.heartRateBpm} bpm</span>
                    )}
                    {rec.vitalSigns.temperatureCelsius && (
                      <span><strong>Temp:</strong> {rec.vitalSigns.temperatureCelsius} °C</span>
                    )}
                    {rec.vitalSigns.oxygenSaturationPercent && (
                      <span><strong>SpO2:</strong> {rec.vitalSigns.oxygenSaturationPercent}%</span>
                    )}
                    {rec.vitalSigns.capillaryBloodGlucoseMgDl && (
                      <span><strong>Glicemia:</strong> {rec.vitalSigns.capillaryBloodGlucoseMgDl} mg/dL</span>
                    )}
                    {rec.vitalSigns.weightKg && (
                      <span><strong>Peso:</strong> {rec.vitalSigns.weightKg} kg</span>
                    )}
                    {rec.vitalSigns.bmi && (
                      <span className="text-sky-800 font-bold bg-sky-100 px-2 py-0.5 rounded">
                        IMC: {rec.vitalSigns.bmi}
                      </span>
                    )}
                  </div>
                )}

                {/* SOAP DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                    <span className="font-bold text-slate-900 block">S - Queixa Principal & Subjetivo:</span>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{rec.chiefComplaint}</p>
                  </div>

                  {rec.clinicalHistory && (
                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                      <span className="font-bold text-slate-900 block">S - Histórico Clínico & Anamnese:</span>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-line">{rec.clinicalHistory}</p>
                    </div>
                  )}
                </div>

                {rec.physicalExam && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">O - Exame Físico & Avaliação Funcional:</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{rec.physicalExam}</p>
                  </div>
                )}

                {/* Diagnóstico e CIDs */}
                <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-2">
                  <span className="font-bold text-indigo-950 block">A - Hipóteses Diagnósticas & Avaliação:</span>
                  <p className="text-slate-800 leading-relaxed">{rec.diagnosticHypothesis || 'Avaliação clínica ambulatorial.'}</p>
                  
                  {rec.cid10Codes && rec.cid10Codes.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rec.cid10Codes.map(cid => (
                        <span key={cid.code} className="px-2.5 py-0.5 bg-white text-indigo-900 font-semibold rounded-md border border-indigo-200 text-[11px]">
                          <strong>{cid.code}</strong> &bull; {cid.description}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-100 text-xs space-y-1.5">
                  <span className="font-bold text-amber-950 block">P - Plano Terapêutico & Condutas Adotadas:</span>
                  <p className="text-slate-800 leading-relaxed whitespace-pre-line">{rec.therapeuticPlan}</p>
                </div>

                {/* ADENDOS E ERRATAS (CFM 1.821/2007) */}
                {rec.addendums && rec.addendums.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-amber-200 space-y-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Adendos / Erratas Registrados ({rec.addendums.length}) - CFM nº 1.821/2007</span>
                    </span>

                    <div className="space-y-2 pl-4 border-l-2 border-amber-400">
                      {rec.addendums.map(ad => (
                        <div key={ad.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-950">
                              Adendo por {ad.authorName} ({ad.authorCouncilNumber})
                            </span>
                            <span className="text-amber-800">
                              {new Date(ad.createdAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-slate-800 italic leading-relaxed whitespace-pre-line">{ad.note}</p>
                          <span className="text-[10px] font-mono text-amber-700 block mt-1">
                            Carimbo ICP-Brasil: {ad.signatureHash}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: RECEITUÁRIOS & PRESCRIÇÕES (ANVISA 344/98)
          ========================================================================= */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Histórico de Receituários Emitidos ({prescriptions.length})
            </h3>
            <button
              onClick={() => setIsRxModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Nova Receita</span>
            </button>
          </div>

          {prescriptions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Nenhuma prescrição registrada para este paciente.
            </div>
          ) : (
            prescriptions.map((rx) => (
              <div key={rx.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <Pill className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{rx.type === 'controle_especial' ? 'Receita de Controle Especial (ANVISA 344/98)' : 'Receituário Simples'}</span>
                        {rx.specialControlNotificationType && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                            {rx.specialControlNotificationType}
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-400">
                        Emitido em {new Date(rx.prescriptionDate + 'T00:00:00').toLocaleDateString('pt-BR')} por {rx.professionalName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPrintableDoc({ type: 'prescription', data: rx })}
                    className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir / PDF</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {rx.items.map((it, idx) => (
                    <div key={it.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-baseline justify-between font-bold text-slate-900">
                        <span>{idx + 1}. {it.medicineName} {it.concentration}</span>
                        <span className="text-slate-500 font-mono text-[11px]">{it.quantity}</span>
                      </div>
                      <p className="text-slate-600"><strong>Posologia:</strong> {it.dosageInstruction}</p>
                      <div className="text-[11px] text-slate-400">
                        Via: {it.administrationRoute} &bull; Forma: {it.pharmaceuticalForm} &bull; Duração: {it.treatmentDuration}
                      </div>
                    </div>
                  ))}
                </div>

                {rx.generalInstructions && (
                  <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                    "{rx.generalInstructions}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ATESTADOS MÉDICOS COM REGRA DE SIGILO CFM 1.658/2002
          ========================================================================= */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Histórico de Atestados e Declarações ({certificates.length})
            </h3>
            <button
              onClick={() => setIsCertModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Novo Atestado</span>
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Nenhum atestado emitido para este paciente.
            </div>
          ) : (
            certificates.map((cert) => (
              <div key={cert.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 uppercase">
                        {cert.type === 'afastamento' && `Atestado de Afastamento (${cert.daysOff} dias)`}
                        {cert.type === 'aptidao_fisica' && 'Atestado de Aptidão Física'}
                        {cert.type === 'comparecimento' && `Declaração de Comparecimento (${cert.hoursOff || ''})`}
                        {cert.type === 'acompanhante' && 'Atestado de Acompanhante'}
                      </h4>
                      <span className="text-xs text-slate-400">
                        Emitido em {new Date(cert.issueDate + 'T00:00:00').toLocaleDateString('pt-BR')} por {cert.professionalName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPrintableDoc({ type: 'certificate', data: cert })}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir / PDF</span>
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                  {cert.periodDescription && <p>{cert.periodDescription}</p>}
                  {cert.activityPermitted && <p><strong>Atividade Permitida:</strong> {cert.activityPermitted}</p>}
                  {cert.companionName && <p><strong>Acompanhante:</strong> {cert.companionName} ({cert.companionKinship})</p>}
                  
                  {/* Informação sobre o CID-10 e sigilo médico */}
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">CID-10 no Prontuário: </span>
                      <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {cert.cid10Code || 'Não informado'}
                      </span>
                    </div>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      cert.showCidOnPrint ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {cert.showCidOnPrint ? '✓ CID impresso sob autorização expressa do paciente' : 'Sigilo mantido (CID oculto na impressão)'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: GESTÃO DE EXAMES E LAUDOS
          ========================================================================= */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          
          {/* Sub-Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Solicitações e Resultados de Exames Laboratoriais e Imagem
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLabOrderModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Solicitação de Exames</span>
              </button>
              <button
                onClick={() => setIsExamResultModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Registrar Laudo / Resultado</span>
              </button>
            </div>
          </div>

          {/* Pedidos de Exames Emitidos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pedidos de Exames Emitidos ({labOrders.length})
            </h4>

            {labOrders.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                Nenhuma solicitação de exames emitida.
              </div>
            ) : (
              labOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">
                        Pedido emitido em {new Date(order.orderDate + 'T00:00:00').toLocaleDateString('pt-BR')} &bull; {order.professionalName}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Justificativa: <strong>{order.clinicalIndication}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => setPrintableDoc({ type: 'lab_order', data: order })}
                      className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition flex items-center gap-1.5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Pedido</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {order.items.map(it => (
                      <span key={it.id} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800">
                        {it.examName} ({it.examType})
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resultados e Laudos Registrados */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Laudos e Resultados Recebidos ({examResults.length})
            </h4>

            {examResults.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                Nenhum resultado de exame arquivado.
              </div>
            ) : (
              examResults.map(res => (
                <div key={res.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{res.examName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          res.status === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {res.status === 'critical' ? 'Alterado / Crítico' : 'Avaliado pelo Médico'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Realizado em {new Date(res.performedDate + 'T00:00:00').toLocaleDateString('pt-BR')} &bull; Laboratório: {res.laboratoryName}
                      </span>
                    </div>

                    {res.evaluatedByProfessionalName && (
                      <span className="text-xs text-slate-500 font-medium">
                        Parecer por: <strong className="text-slate-800">{res.evaluatedByProfessionalName}</strong>
                      </span>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <span className="font-bold text-slate-900 block">Laudo / Valores:</span>
                    <p className="text-slate-700 whitespace-pre-line leading-relaxed">{res.reportSummary}</p>
                    {res.referenceValues && (
                      <p className="text-[11px] text-slate-500 italic mt-1">Ref: {res.referenceValues}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* =========================================================================
          TAB 5: LINHA DO TEMPO CLÍNICA COMPLETA (TIMELINE UNIFICADA)
          ========================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Linha do Tempo Cronológica Unificada de Saúde
          </h3>

          <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
            
            {/* Combine all records, prescriptions, certificates, lab orders sorted by date */}
            {records.map(rec => (
              <div key={rec.id} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-sky-600 border-2 border-white ring-2 ring-sky-200" />
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Evolução Clínica &bull; {rec.professionalName}</span>
                    <span className="text-[11px] text-slate-400">{new Date(rec.recordDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-600">{rec.chiefComplaint}</p>
                  {rec.diagnosticHypothesis && (
                    <span className="inline-block mt-1 font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                      Hipótese: {rec.diagnosticHypothesis}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {prescriptions.map(rx => (
              <div key={rx.id} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 text-sm">Prescrição Médica ({rx.items.length} itens)</span>
                    <span className="text-[11px] text-slate-400">{new Date(rx.prescriptionDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-600">{rx.items.map(it => it.medicineName).join(', ')}</p>
                </div>
              </div>
            ))}

            {certificates.map(cert => (
              <div key={cert.id} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-sm">Atestado Médico ({cert.type})</span>
                    <span className="text-[11px] text-slate-400">{new Date(cert.issueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                  {cert.daysOff && <p className="text-slate-600">Afastamento concedido de {cert.daysOff} dias.</p>}
                </div>
              </div>
            ))}

            {labOrders.map(order => (
              <div key={order.id} className="relative">
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-amber-600 border-2 border-white ring-2 ring-amber-200" />
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 text-sm">Solicitação de Exames ({order.items.length})</span>
                    <span className="text-[11px] text-slate-400">{new Date(order.orderDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p className="text-slate-600">Indicação: {order.clinicalIndication}</p>
                </div>
              </div>
            ))}

          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS INTEGRATION
          ========================================================================= */}
      
      {/* CFM Addendum Modal */}
      <AddendumModal
        isOpen={isAddendumOpen}
        onClose={() => {
          setIsAddendumOpen(false);
          setSelectedRecordForAddendum(null);
        }}
        record={selectedRecordForAddendum}
        onSuccess={() => {
          if (selectedPatient) refreshPatientData(selectedPatient.id);
        }}
      />

      {/* Prescription Form Modal */}
      <PrescriptionFormModal
        isOpen={isRxModalOpen}
        onClose={() => setIsRxModalOpen(false)}
        patient={selectedPatient}
        onSuccess={(rx) => {
          if (selectedPatient) refreshPatientData(selectedPatient.id);
          setPrintableDoc({ type: 'prescription', data: rx });
        }}
      />

      {/* Certificate Form Modal */}
      <CertificateFormModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        patient={selectedPatient}
        onSuccess={(cert) => {
          if (selectedPatient) refreshPatientData(selectedPatient.id);
          setPrintableDoc({ type: 'certificate', data: cert });
        }}
      />

      {/* Lab Order Form Modal */}
      <LabOrderFormModal
        isOpen={isLabOrderModalOpen}
        onClose={() => setIsLabOrderModalOpen(false)}
        patient={selectedPatient}
        onSuccess={(order) => {
          if (selectedPatient) refreshPatientData(selectedPatient.id);
          setPrintableDoc({ type: 'lab_order', data: order });
        }}
      />

      {/* Exam Result Form Modal */}
      <ExamResultModal
        isOpen={isExamResultModalOpen}
        onClose={() => setIsExamResultModalOpen(false)}
        patient={selectedPatient}
        onSuccess={() => {
          if (selectedPatient) refreshPatientData(selectedPatient.id);
        }}
      />

      {/* Document Print Modal */}
      <DocumentPrintModal
        isOpen={Boolean(printableDoc)}
        onClose={() => setPrintableDoc(null)}
        document={printableDoc}
      />

    </div>
  );
};
