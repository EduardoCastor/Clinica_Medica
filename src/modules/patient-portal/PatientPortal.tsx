import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Pill, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Plus, 
  AlertCircle 
} from 'lucide-react';
import { Patient, Appointment, MedicalRecordEntry } from '../../types';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

export const PatientPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const { branches } = useTenant();
  const patients = StorageService.getPatients();

  // Find patient record matching current user email or name, or default to Camila Albuquerque
  const patient = patients.find(p => p.email === currentUser.email) || patients[0];

  const appointments = StorageService.getAppointments().filter(a => a.patientId === patient.id);
  const medicalRecords = StorageService.getMedicalRecords(patient.id);

  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'profile'>('appointments');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Patient Welcome Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center font-bold text-xl">
            {patient.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-widest block">
              Portal do Paciente
            </span>
            <h1 className="text-xl font-bold text-white">{patient.fullName}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              CPF: {patient.documentCpf} · {branches.find(b => b.id === patient.originBranchId)?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-white/10 rounded-lg text-xs font-semibold text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Cadastro Ativo</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'appointments' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Minhas Consultas ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'prescriptions' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Receitas & Orientações ({medicalRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === 'profile' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Meus Dados & LGPD</span>
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                Você não possui nenhuma consulta agendada.
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {new Date(apt.startTime).toLocaleDateString('pt-BR')} às {new Date(apt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 capitalize">
                        {apt.status === 'in_consultation' ? 'Em atendimento' : apt.status}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">
                      {apt.professionalName} · {apt.serviceName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Local: {apt.roomName || 'Consultório Principal'} · {branches.find(b => b.id === apt.branchId)?.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => alert('Sua solicitação de confirmação foi enviada para a recepção!')}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                    >
                      Confirmar Presença
                    </button>
                    <button
                      onClick={() => alert('Para reagendamento com menos de 24h, por favor contate nossa recepção via WhatsApp.')}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                    >
                      Reagendar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            {medicalRecords.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
                Nenhuma receita ou plano terapêutico disponibilizado até o momento.
              </div>
            ) : (
              medicalRecords.map((rec) => (
                <div key={rec.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Prescrições e Recomendações Terapêuticas
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Emitido por {rec.professionalName} em {new Date(rec.recordDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {rec.isSigned && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ✓ Assinado Digitalmente
                      </span>
                    )}
                  </div>

                  {rec.prescriptions && (
                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Prescrições e Formulações Ortomoleculares:</span>
                      <pre className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                        {rec.prescriptions}
                      </pre>
                    </div>
                  )}

                  {rec.therapeuticPlan && (
                    <div>
                      <span className="font-bold text-slate-800 block mb-1">Orientações do Plano Terapêutico:</span>
                      <p className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 text-slate-700 leading-relaxed whitespace-pre-line">
                        {rec.therapeuticPlan}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 text-xs text-slate-700">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Dados Cadastrais e Preferências de Privacidade (LGPD)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block">Nome Completo:</span>
                <span className="font-semibold text-slate-900">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">CPF:</span>
                <span className="font-mono font-semibold text-slate-900">{patient.documentCpf}</span>
              </div>
              <div>
                <span className="text-slate-400 block">WhatsApp / Telefone:</span>
                <span className="font-semibold text-slate-900">{patient.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block">E-mail:</span>
                <span className="font-semibold text-slate-900">{patient.email}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Consentimento LGPD Ativo</span>
              </span>
              <p className="text-emerald-800 text-[11px]">
                Você autorizou o envio de lembretes de consultas e informativos de saúde por WhatsApp e e-mail.
              </p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
