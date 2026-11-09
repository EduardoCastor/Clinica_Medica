import React, { useState } from 'react';
import { X, User, Calendar, FileText, DollarSign, MapPin, Phone, ShieldCheck, Mail, Clock } from 'lucide-react';
import { Patient, Appointment, MedicalRecordEntry, FinancialTransaction } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'appointments' | 'records' | 'financial'>('profile');

  if (!isOpen || !patient) return null;

  const appointments: Appointment[] = StorageService.getAppointments().filter(a => a.patientId === patient.id);
  const medicalRecords: MedicalRecordEntry[] = StorageService.getMedicalRecords(patient.id);
  const financial: FinancialTransaction[] = StorageService.getFinancial().filter(f => f.patientId === patient.id);

  const originBranch = branches.find(b => b.id === patient.originBranchId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-md">
              {patient.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{patient.fullName}</h2>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  CPF: {patient.documentCpf}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                <span>{originBranch?.name || 'Filial Principal'}</span>
                <span aria-hidden="true">·</span>
                <span>{patient.phone}</span>
                <span aria-hidden="true">·</span>
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
                onNewAppointment(patient);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition"
            >
              Novo Agendamento
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50/50 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'profile' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cadastro & LGPD
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'appointments' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Consultas</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {appointments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'records' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Prontuário & Evoluções</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {medicalRecords.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'financial' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Histórico Financeiro</span>
            <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
              {financial.length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 text-xs text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-sky-600" />
                    <span>Dados Pessoais</span>
                  </h4>
                  <p><strong>Nascimento:</strong> {patient.birthDate ? new Date(patient.birthDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Não informado'}</p>
                  <p><strong>Sexo:</strong> {patient.gender}</p>
                  <p><strong>E-mail:</strong> {patient.email || 'Não informado'}</p>
                  <p><strong>WhatsApp:</strong> {patient.whatsapp}</p>
                  <p><strong>Telefone:</strong> {patient.phone}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    <span>Localização & Filial</span>
                  </h4>
                  <p><strong>Filial de Referência:</strong> {originBranch?.name}</p>
                  <p><strong>Endereço:</strong> {patient.address || 'Não cadastrado'}, {patient.addressNumber || ''}</p>
                  <p><strong>Bairro/Cidade:</strong> {patient.neighborhood || ''} - {patient.city}/{patient.state}</p>
                  <p><strong>Contato de Emergência:</strong> {patient.emergencyContactName} ({patient.emergencyContactPhone})</p>
                </div>
              </div>

              {/* Multi-Branch Policy */}
              <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-200 space-y-2">
                <div className="flex items-center gap-2 text-sky-900 font-bold">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Configuração de Compartilhamento entre Unidades (Requisito 3.1)</span>
                </div>
                <p className="text-slate-600">
                  {patient.sharingMode === 'model_b_shared'
                    ? 'Este paciente está configurado no Modelo B: Compartilhado. Seus prontuários, prescrições e histórico de consultas podem ser acessados com segurança pelos profissionais das filiais autorizadas abaixo.'
                    : 'Este paciente está configurado no Modelo A: Exclusivo. Seus dados estão estritamente isolados e só podem ser visualizados na filial de referência.'}
                </p>
                {patient.sharingMode === 'model_b_shared' && patient.authorizedBranchIds && (
                  <div className="pt-2 flex flex-wrap gap-2">
                    {patient.authorizedBranchIds.map(bId => {
                      const br = branches.find(b => b.id === bId);
                      return (
                        <span key={bId} className="px-2.5 py-1 bg-white rounded-lg border border-sky-300 font-semibold text-sky-800 text-[11px]">
                          ✓ {br?.name || bId}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {patient.administrativeNotes && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900">Observações Clínicas e Administrativas:</span>
                  <p className="text-amber-800 italic">{patient.administrativeNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Nenhuma consulta agendada para este paciente.</p>
              ) : (
                appointments.map(apt => (
                  <div key={apt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{new Date(apt.startTime).toLocaleDateString('pt-BR')} às {new Date(apt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-sky-100 text-sky-800">
                          {apt.status}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        Profissional: {apt.professionalName} · Procedimento: {apt.serviceName}
                      </p>
                      {apt.notes && <p className="text-slate-500 italic mt-0.5">"{apt.notes}"</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onOpenRecord(patient);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                >
                  Abrir Prontuário Completo
                </button>
              </div>

              {medicalRecords.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Nenhuma evolução clínica registrada até o momento.</p>
              ) : (
                medicalRecords.map(rec => (
                  <div key={rec.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900">
                        Atendimento em {new Date(rec.recordDate).toLocaleDateString('pt-BR')} · {rec.professionalName}
                      </span>
                      {rec.isSigned && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                          Assinado Digitalmente
                        </span>
                      )}
                    </div>
                    <p><strong>Queixa Principal:</strong> {rec.chiefComplaint}</p>
                    <p><strong>Anamnese:</strong> {rec.clinicalHistory}</p>
                    {rec.prescriptions && (
                      <div className="p-2.5 bg-white rounded-lg border border-slate-200 font-mono text-[11px] whitespace-pre-line text-slate-800">
                        <strong>Prescrições & Suplementação:</strong><br />
                        {rec.prescriptions}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Financial Tab */}
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
                        {new Date(f.createdAt).toLocaleDateString('pt-BR')} · Forma: {f.paymentMethod.toUpperCase()} · Recibo: {f.receiptNumber || 'N/A'}
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
    </div>
  );
};
