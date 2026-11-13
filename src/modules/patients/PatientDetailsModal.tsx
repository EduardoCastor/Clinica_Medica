import React, { useState } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  FileText, 
  DollarSign, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Mail, 
  Clock, 
  Pill, 
  ClipboardList, 
  AlertTriangle, 
  Printer, 
  Activity, 
  FileCheck,
  Plus,
  Stethoscope
} from 'lucide-react';
import { 
  Patient, 
  Appointment, 
  MedicalRecordEntry, 
  FinancialTransaction,
  Prescription,
  MedicalCertificate,
  LabOrder,
  ExamResult
} from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';
import { calculateBmi, calculateAge } from '../../services/brazilianFormatters';
import { DocumentPrintModal, PrintableDocumentType } from '../../components/medical-documents/DocumentPrintModal';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onNewAppointment: (patient: Patient) => void;
  onOpenRecord: (patient: Patient) => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onClose,
  patient,
  onNewAppointment,
  onOpenRecord,
}) => {
  const { branches } = useTenant();
  const [activeTab, setActiveTab] = useState<'profile' | 'clinical' | 'timeline' | 'records' | 'prescriptions' | 'certificates' | 'exams' | 'financial'>('profile');
  const [printableDoc, setPrintableDoc] = useState<PrintableDocumentType | null>(null);

  if (!isOpen || !patient) return null;

  const appointments: Appointment[] = StorageService.getAppointments().filter(a => a.patientId === patient.id);
  const medicalRecords: MedicalRecordEntry[] = StorageService.getMedicalRecords(patient.id);
  const prescriptions: Prescription[] = StorageService.getPrescriptions(patient.id);
  const certificates: MedicalCertificate[] = StorageService.getCertificates(patient.id);
  const labOrders: LabOrder[] = StorageService.getLabOrders(patient.id);
  const examResults: ExamResult[] = StorageService.getExamResults(patient.id);
  const financial: FinancialTransaction[] = StorageService.getFinancial().filter(f => f.patientId === patient.id);

  const originBranch = branches.find(b => b.id === patient.originBranchId);
  const age = calculateAge(patient.birthDate);
  const bmiInfo = patient.weightKg && patient.heightCm ? calculateBmi(patient.weightKg, patient.heightCm) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-md">
              {patient.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  {patient.fullName} {patient.socialName ? `(${patient.socialName})` : ''}
                </h2>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  CPF: {patient.documentCpf}
                </span>
                {patient.bloodType && (
                  <span className="text-[11px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                    {patient.bloodType}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                <span>{originBranch?.name || 'Filial Principal'}</span>
                <span aria-hidden="true">&bull;</span>
                <span>{patient.phone}</span>
                <span aria-hidden="true">&bull;</span>
                <span>{age !== null ? `${age} anos` : 'Idade N/D'}</span>
                <span aria-hidden="true">&bull;</span>
                <span className="text-emerald-400 font-medium">
                  {patient.sharingMode === 'model_b_shared' ? 'Compartilhado entre Filiais' : 'Exclusivo da Filial'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenRecord(patient);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Abrir no PEP</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onNewAppointment(patient);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-lg shadow-xs transition"
            >
              Novo Agendamento
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ALERTA DE ALERGIAS EM DESTAQUE VERMELHO NO TOPO */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="p-3 bg-rose-600 text-white text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-white" />
              <span>ALERGIAS REGISTRADAS: {patient.allergies.join(' &bull; ')}</span>
            </div>
            <span className="text-[10px] bg-white text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase">
              Atenção Médica
            </span>
          </div>
        )}

        {/* Tab Controls */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50/70 flex gap-3 text-xs font-semibold overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'profile' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cadastro & LGPD
          </button>
          <button
            onClick={() => setActiveTab('clinical')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'clinical' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Triagem & Alergias
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'timeline' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Linha do Tempo Clínica
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'records' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Evoluções PEP</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {medicalRecords.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'prescriptions' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Receituários</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {prescriptions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'certificates' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Atestados</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {certificates.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'exams' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Exames & Laudos</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {labOrders.length + examResults.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'financial' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Financeiro</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {financial.length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: PROFILE & LGPD */}
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-sky-600" />
                    <span>Dados Pessoais & Documentos</span>
                  </h4>
                  <p><strong>Nome Social:</strong> {patient.socialName || 'Não utiliza nome social'}</p>
                  <p><strong>RG:</strong> {patient.documentRg || 'Não informado'} {patient.documentRgIssuer ? `(${patient.documentRgIssuer})` : ''}</p>
                  <p><strong>Nascimento:</strong> {patient.birthDate ? new Date(patient.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/D'} ({age} anos)</p>
                  <p><strong>Sexo Biológico:</strong> {patient.biologicalSex === 'F' ? 'Feminino' : patient.biologicalSex === 'M' ? 'Masculino' : 'Outro'}</p>
                  <p><strong>Identidade de Gênero:</strong> {patient.genderIdentity || patient.gender}</p>
                  <p><strong>Estado Civil:</strong> {patient.maritalStatus || 'Não informado'}</p>
                  <p><strong>Profissão:</strong> {patient.profession || 'Não informado'}</p>
                  <p><strong>Naturalidade:</strong> {patient.naturalness || 'Não informado'}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>Contato, Endereço & Convênio</span>
                  </h4>
                  <p><strong>WhatsApp:</strong> {patient.whatsapp}</p>
                  <p><strong>Telefone:</strong> {patient.phone}</p>
                  <p><strong>E-mail:</strong> {patient.email || 'Sem e-mail'}</p>
                  <p><strong>Endereço:</strong> {patient.address || 'Não informado'}, {patient.addressNumber || ''} {patient.complement ? `- ${patient.complement}` : ''}</p>
                  <p><strong>Bairro/Cidade:</strong> {patient.neighborhood || ''} - {patient.city}/{patient.state} ({patient.postalCode || ''})</p>
                  <p><strong>Modalidade:</strong> {patient.healthPlanType === 'convenio' ? `${patient.healthPlanOperator} (${patient.healthPlanNumber})` : 'Particular'}</p>
                  <p><strong>Cartão Nacional de Saúde (CNS):</strong> {patient.cnsNumber || 'Não cadastrado'}</p>
                </div>
              </div>

              {/* Responsável Legal / Contato de Emergência */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Responsável Legal & Emergência:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 block">Responsável Legal:</span>
                    <span className="font-semibold text-slate-800">
                      {patient.legalGuardianName ? `${patient.legalGuardianName} (CPF: ${patient.legalGuardianCpf || 'N/D'}) - ${patient.legalGuardianKinship || ''}` : 'Não aplicável (Paciente maior e capaz)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contato de Emergência:</span>
                    <span className="font-semibold text-slate-800">
                      {patient.emergencyContactName ? `${patient.emergencyContactName} (${patient.emergencyContactPhone}) - ${patient.emergencyContactKinship || ''}` : 'Nenhum contato registrado'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Termo LGPD */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Consentimento LGPD Ativo (Art. 11, II da Lei 13.709/2018)</span>
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Consentimento de tratamento de dados sensíveis de saúde registrado formalmente.
                  </span>
                </div>
                <span className="text-[11px] font-mono text-emerald-800 bg-white px-2 py-1 rounded border border-emerald-200">
                  {patient.lgpdConsentDate ? new Date(patient.lgpdConsentDate).toLocaleDateString('pt-BR') : 'Ativo'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: TRIAGEM & DADOS CLÍNICOS */}
          {activeTab === 'clinical' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Tipo Sanguíneo</span>
                  <span className="font-bold text-rose-700 text-sm">{patient.bloodType || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Peso Atual</span>
                  <span className="font-bold text-slate-900 text-sm">{patient.weightKg ? `${patient.weightKg} kg` : 'N/D'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Estatura</span>
                  <span className="font-bold text-slate-900 text-sm">{patient.heightCm ? `${patient.heightCm} cm` : 'N/D'}</span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block">Índice de Massa Corporal (IMC)</span>
                  <span className="font-bold text-sky-800 text-sm">
                    {bmiInfo ? `${bmiInfo.bmi} (${bmiInfo.classification})` : 'N/D'}
                  </span>
                </div>
              </div>

              {/* Alergias */}
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2">
                <span className="font-bold text-rose-900 uppercase block">Alergias Medicamentosas & Alimentares:</span>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((al, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-white text-rose-800 font-bold rounded-lg border border-rose-300">
                        &bull; {al}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Nenhuma alergia conhecida relatada pelo paciente.</p>
                )}
              </div>

              {/* Comorbidades e Medicamentos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Doenças Crônicas / Comorbidades:</span>
                  {patient.chronicDiseases && patient.chronicDiseases.length > 0 ? (
                    <ul className="list-disc pl-4 text-slate-700 space-y-1">
                      {patient.chronicDiseases.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Nenhum diagnóstico crônico prévio registrado.</p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Medicamentos de Uso Contínuo:</span>
                  {patient.continuousMedications && patient.continuousMedications.length > 0 ? (
                    <ul className="list-disc pl-4 text-slate-700 space-y-1">
                      {patient.continuousMedications.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Não faz uso de medicação contínua.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TIMELINE CLÍNICA */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Linha do Tempo Cronológica Unificada de Atendimentos
              </span>

              <div className="relative pl-6 border-l-2 border-slate-200 space-y-4 text-xs">
                {medicalRecords.map(rec => (
                  <div key={rec.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-sky-600 border-2 border-white ring-2 ring-sky-200" />
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>Consulta / Evolução &bull; {rec.professionalName}</span>
                        <span className="text-slate-400 font-normal">{new Date(rec.recordDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-slate-600">{rec.chiefComplaint}</p>
                    </div>
                  </div>
                ))}

                {prescriptions.map(rx => (
                  <div key={rx.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-200" />
                    <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
                      <div className="flex items-center justify-between font-bold text-indigo-950">
                        <span>Receituário ({rx.type})</span>
                        <span className="text-slate-400 font-normal">{new Date(rx.prescriptionDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-slate-600">{rx.items.map(i => i.medicineName).join(', ')}</p>
                    </div>
                  </div>
                ))}

                {certificates.map(cert => (
                  <div key={cert.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200" />
                    <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-1">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span>Atestado ({cert.type})</span>
                        <span className="text-slate-400 font-normal">{new Date(cert.issueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-slate-600">{cert.periodDescription || 'Atestado emitido com sucesso'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEDICAL RECORDS (PEP) */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onOpenRecord(patient);
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition"
                >
                  Abrir Prontuário Completo
                </button>
              </div>

              {medicalRecords.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Nenhuma evolução clínica registrada até o momento.</p>
              ) : (
                medicalRecords.map(rec => (
                  <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900">
                        Atendimento em {new Date(rec.recordDate).toLocaleDateString('pt-BR')} &bull; {rec.professionalName}
                      </span>
                      <div className="flex items-center gap-2">
                        {rec.status === 'signed' ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                            Assinado Digitalmente (Imutável CFM 1.821/2007)
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                            Rascunho
                          </span>
                        )}
                        <button
                          onClick={() =>
                            setPrintableDoc({
                              type: 'medical_record',
                              data: rec,
                              patientName: patient.fullName,
                              patientCpf: patient.documentCpf,
                            })
                          }
                          className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Imprimir / PDF</span>
                        </button>
                      </div>
                    </div>
                    <p><strong>Queixa Principal:</strong> {rec.chiefComplaint}</p>
                    <p><strong>Plano Terapêutico:</strong> {rec.therapeuticPlan}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: PRESCRIPTIONS */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-3">
              {prescriptions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Nenhum receituário emitido.</p>
              ) : (
                prescriptions.map(rx => (
                  <div key={rx.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        {rx.type === 'controle_especial' ? 'Receita de Controle Especial (ANVISA 344/98)' : 'Receituário Simples'} &bull; {new Date(rx.prescriptionDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </span>
                      <p className="text-slate-600 mt-1">
                        Medicamentos: {rx.items.map(i => `${i.medicineName} ${i.concentration}`).join(', ')}
                      </p>
                    </div>

                    <button
                      onClick={() => setPrintableDoc({ type: 'prescription', data: rx })}
                      className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-lg transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir / PDF</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-3">
              {certificates.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Nenhum atestado emitido.</p>
              ) : (
                certificates.map(cert => (
                  <div key={cert.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 uppercase block">
                        {cert.type === 'afastamento' ? `Atestado de Afastamento (${cert.daysOff} dias)` : cert.type}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Emitido em {new Date(cert.issueDate + 'T00:00:00').toLocaleDateString('pt-BR')} &bull; CID: {cert.showCidOnPrint ? cert.cid10Code : 'Oculto (Sigilo CFM)'}
                      </span>
                    </div>

                    <button
                      onClick={() => setPrintableDoc({ type: 'certificate', data: cert })}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-200 rounded-lg transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: EXAMS */}
          {activeTab === 'exams' && (
            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-800 uppercase block mb-2">Solicitações de Exames</span>
                {labOrders.map(order => (
                  <div key={order.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-2">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Pedido em {new Date(order.orderDate + 'T00:00:00').toLocaleDateString('pt-BR')} ({order.items.length} exames)
                      </span>
                      <span className="text-slate-500 text-[11px]">Justificativa: {order.clinicalIndication}</span>
                    </div>
                    <button
                      onClick={() => setPrintableDoc({ type: 'lab_order', data: order })}
                      className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-white border border-sky-200 rounded-lg"
                    >
                      Imprimir
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <span className="font-bold text-slate-800 uppercase block mb-2">Resultados Recebidos</span>
                {examResults.map(res => (
                  <div key={res.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{res.examName} ({res.laboratoryName})</span>
                      <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase">
                        {res.status}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{res.reportSummary}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: FINANCIAL */}
          {activeTab === 'financial' && (
            <div className="space-y-3">
              {financial.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Nenhum lançamento financeiro para este paciente.</p>
              ) : (
                financial.map(f => (
                  <div key={f.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{f.description}</span>
                      <span className="text-slate-500 text-[11px]">
                        {new Date(f.createdAt).toLocaleDateString('pt-BR')} &bull; Forma: {f.paymentMethod.toUpperCase()} &bull; Recibo: {f.receiptNumber || 'N/A'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 block tabular-nums">
                        R$ {f.amount.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {f.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>

      {/* Document Print Modal */}
      <DocumentPrintModal
        isOpen={Boolean(printableDoc)}
        onClose={() => setPrintableDoc(null)}
        document={printableDoc}
      />

    </div>
  );
};
