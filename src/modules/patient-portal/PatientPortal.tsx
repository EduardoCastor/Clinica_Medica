import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Calendar,
  ShieldCheck,
  Pill,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  Clock,
  MapPin,
  Stethoscope,
  FileCheck2,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';
import { DomainResolver, PRODUCTION_DOMAINS } from '../../services/domainResolver';
import {
  fetchAvailableSlots,
  submitBookingToN8nAndSupabase,
  N8nAvailableSlot,
} from '../../services/n8nService';
import { formatCpf, formatPhone } from '../../services/brazilianFormatters';
import { ClinicBrandLogo, CLINIC_OFFICIAL_DATA } from '../../components/ClinicBrandLogo';

interface PatientPortalProps {
  isStandaloneBooking?: boolean;
}

const PROCEDIMENTOS_OFICIAIS = [
  'Primeira consulta',
  'Retorno de consulta',
  'Modulação Hormonal Bioidêntica',
  'Avaliação de Exames',
  'Acompanhamento Médico',
] as const;

function formatLocalDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today (if weekday) or next Monday (if weekend) in local timezone,
 * avoiding UTC day-shift bugs after 21:00 BRT.
 */
function obterProximoDiaUtil(): string {
  const date = new Date();
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 6) {
    date.setDate(date.getDate() + 2);
  } else if (dayOfWeek === 0) {
    date.setDate(date.getDate() + 1);
  }
  return formatLocalDateISO(date);
}

function formatDateBr(isoDate: string): string {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

const StandaloneBookingPortal: React.FC = () => {
  const { organization, clinic, branches } = useTenant();
  const hojeISO = formatLocalDateISO(new Date());

  const defaultBranch = branches[0];
  const defaultUnidadeLabel = defaultBranch
    ? `${defaultBranch.name} (${defaultBranch.city}/${defaultBranch.state})`
    : 'Unidade Matriz Cabo Frio (Centro) (Cabo Frio/RJ)';

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    defaultBranch?.id || 'branch_cf_centro'
  );
  const [unidade, setUnidade] = useState<string>(defaultUnidadeLabel);
  const [especialista, setEspecialista] = useState<string>('Dr. Newton Mureb');
  const [tipoAtendimento, setTipoAtendimento] = useState<string>('Primeira consulta');
  const [dataSelecionada, setDataSelecionada] = useState<string>(() => obterProximoDiaUtil());

  // Slots fetched from n8n
  const [slots, setSlots] = useState<N8nAvailableSlot[]>([]);
  const [selectedSlotInicio, setSelectedSlotInicio] = useState<string>('');
  const [slotsLoading, setSlotsLoading] = useState<boolean>(true);
  const [slotsMessage, setSlotsMessage] = useState<string>('');
  const [slotsError, setSlotsError] = useState<string | null>(null);

  // Contact fields
  const [nome, setNome] = useState<string>('');
  const [cpf, setCpf] = useState<string>('');
  const [celular, setCelular] = useState<string>('');

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedSummary, setConfirmedSummary] = useState<{
    nome: string;
    unidade: string;
    especialista: string;
    tipoAtendimento: string;
    dataBr: string;
    horaFormatada: string;
  } | null>(null);

  const loadSlots = useCallback(
    async (targetDate: string) => {
      setSlotsLoading(true);
      setSlotsError(null);
      setSlotsMessage('');

      const res = await fetchAvailableSlots(targetDate, {
        webhookDisponibilidade: clinic.n8nWebhookDisponibilidade,
        tenantSlug: organization.slug,
      });

      setSlots(res.slots);
      if (res.slots.length > 0) {
        setSelectedSlotInicio(res.slots[0].inicio);
      } else {
        setSelectedSlotInicio('');
        setSlotsMessage(res.mensagem || 'Nenhum horário disponível nesta data');
      }
      if (res.error) {
        setSlotsError(res.error);
      }
      setSlotsLoading(false);
    },
    [clinic.n8nWebhookDisponibilidade, organization.slug]
  );

  useEffect(() => {
    void loadSlots(dataSelecionada);
  }, [dataSelecionada, loadSlots]);

  const handleCloseToWebsite = () => {
    if (DomainResolver.isRealProductionDomain()) {
      window.location.href = `https://${PRODUCTION_DOMAINS.CLINIC_WEBSITE}`;
    } else {
      DomainResolver.setSimulatedDomain(PRODUCTION_DOMAINS.CLINIC_WEBSITE);
    }
  };

  const handleResetForm = () => {
    const proximoDia = obterProximoDiaUtil();
    setTipoAtendimento('Primeira consulta');
    setDataSelecionada(proximoDia);
    setNome('');
    setCpf('');
    setCelular('');
    setSubmitError(null);
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const cleanCpf = cpf.replace(/\D/g, '');
    const cleanPhone = celular.replace(/\D/g, '');

    if (!nome.trim() || nome.trim().length < 3) {
      setSubmitError('Por favor, informe seu nome completo.');
      return;
    }
    if (cleanCpf.length !== 11) {
      setSubmitError('Por favor, informe um CPF completo com 11 dígitos.');
      return;
    }
    if (cleanPhone.length < 10) {
      setSubmitError('Por favor, informe um número de WhatsApp válido com DDD.');
      return;
    }

    const chosenSlot = slots.find((s) => s.inicio === selectedSlotInicio) || slots[0];
    if (!chosenSlot) {
      setSubmitError('Selecione uma data e um horário disponível para continuar.');
      return;
    }

    setIsSubmitting(true);

    const result = await submitBookingToN8nAndSupabase({
      unidade,
      branchId: selectedBranchId,
      especialista,
      professionalId: 'prof_newton',
      tipoAtendimento,
      nome: nome.trim(),
      cpfDigits: cleanCpf,
      celularDigits: cleanPhone,
      celularFormatted: celular,
      email: '',
      assunto: '',
      data: dataSelecionada,
      inicio: chosenSlot.inicio,
      horaFormatada: chosenSlot.hora,
      tenantConfig: {
        webhookDisponibilidade: clinic.n8nWebhookDisponibilidade,
        webhookAgendamento: clinic.n8nWebhookAgendamento,
        tenantSlug: organization.slug || 'dr-newton-mureb',
        organizationId: organization.id || 'org_mureb_01',
        clinicCnpj: clinic.documentNumber || CLINIC_OFFICIAL_DATA.cnpj,
      },
    });

    setIsSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error || 'Erro ao enviar agendamento. Tente novamente.');
      return;
    }

    setConfirmedSummary({
      nome: nome.trim(),
      unidade,
      especialista: `${especialista} (${CLINIC_OFFICIAL_DATA.crm})`,
      tipoAtendimento,
      dataBr: formatDateBr(dataSelecionada),
      horaFormatada: chosenSlot.hora,
    });
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-[#d1d5db] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[540px] bg-white rounded-[14px] shadow-[0_20px_45px_rgba(15,23,42,0.18)] overflow-hidden border border-slate-200">
        {/* Dark Navy Header */}
        <header className="bg-[#0d1527] text-white px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <ClinicBrandLogo variant="dark" layout="horizontal" size="sm" />
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Solicitar Agendamento Online
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Escolha a filial, profissional e horário desejado
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseToWebsite}
            aria-label="Fechar e voltar ao site da clínica"
            title="Voltar ao site da clínica"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* STEP 2: Confirmation Screen */}
        {step === 2 && confirmedSummary ? (
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#dcfce7] text-[#16a34a] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-extrabold text-slate-900">
                Agendamento Confirmado!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Enviamos os detalhes da sua consulta para o seu WhatsApp. Confira o resumo abaixo:
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Paciente</span>
                <span className="font-bold text-slate-900 text-right">{confirmedSummary.nome}</span>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  Unidade
                </span>
                <span className="font-semibold text-slate-800 text-right">{confirmedSummary.unidade}</span>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                  Especialista
                </span>
                <span className="font-semibold text-slate-800 text-right">{confirmedSummary.especialista}</span>
              </div>
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
                  Procedimento
                </span>
                <span className="font-semibold text-slate-800 text-right">{confirmedSummary.tipoAtendimento}</span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Data e Horário
                </span>
                <span className="font-bold text-[#16a34a] font-mono text-sm tabular-nums">
                  {confirmedSummary.dataBr} às {confirmedSummary.horaFormatada}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 leading-relaxed text-left">
              Por gentileza, compareça à unidade com <strong>10 a 15 minutos de antecedência</strong> portando documento oficial com foto e exames recentes, caso possua.
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleResetForm}
                className="flex-1 px-5 py-2.5 text-xs font-bold text-white bg-[#0d1527] hover:bg-slate-800 rounded-xl transition cursor-pointer"
              >
                Realizar Novo Agendamento
              </button>
              <button
                type="button"
                onClick={handleCloseToWebsite}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Voltar ao Site
              </button>
            </div>
          </div>
        ) : (
          /* STEP 1: Booking Form */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* 1. Unidade / Filial */}
            <div>
              <label htmlFor="booking-unidade" className="block font-bold text-slate-800 mb-1.5">
                1. Escolha a Unidade / Filial
              </label>
              <select
                id="booking-unidade"
                value={selectedBranchId}
                onChange={(e) => {
                  const br = branches.find((b) => b.id === e.target.value);
                  setSelectedBranchId(e.target.value);
                  if (br) {
                    setUnidade(`${br.name} (${br.city}/${br.state})`);
                  }
                }}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#b44d00]/40 focus:border-[#b44d00]"
              >
                {branches.map((b) => {
                  const label = `${b.name} (${b.city}/${b.state})`;
                  return (
                    <option key={b.id} value={b.id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 2. Especialista & 3. Procedimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="booking-especialista" className="block font-bold text-slate-800 mb-1.5">
                  2. Especialista
                </label>
                <select
                  id="booking-especialista"
                  value={especialista}
                  onChange={(e) => setEspecialista(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#b44d00]/40 focus:border-[#b44d00]"
                >
                  <option value="Dr. Newton Mureb">Dr. Newton Mureb ({CLINIC_OFFICIAL_DATA.crm})</option>
                </select>
              </div>

              <div>
                <label htmlFor="booking-procedimento" className="block font-bold text-slate-800 mb-1.5">
                  3. Procedimento
                </label>
                <select
                  id="booking-procedimento"
                  value={tipoAtendimento}
                  onChange={(e) => setTipoAtendimento(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#b44d00]/40 focus:border-[#b44d00]"
                >
                  {PROCEDIMENTOS_OFICIAIS.map((proc) => (
                    <option key={proc} value={proc}>
                      {proc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Data Desejada & Horário Disponível */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="booking-data" className="block font-bold text-slate-800 mb-1.5">
                  Data Desejada
                </label>
                <input
                  id="booking-data"
                  type="date"
                  required
                  min={hojeISO}
                  value={dataSelecionada}
                  onChange={(e) => setDataSelecionada(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[#b44d00]/40 focus:border-[#b44d00]"
                />
              </div>

              <div>
                <label htmlFor="booking-horario" className="block font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Horário Disponível</span>
                  {slotsLoading && (
                    <span className="text-[10px] font-medium text-slate-500 inline-flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Buscando...
                    </span>
                  )}
                </label>
                <select
                  id="booking-horario"
                  required
                  disabled={slotsLoading || slots.length === 0}
                  value={selectedSlotInicio}
                  onChange={(e) => setSelectedSlotInicio(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 font-mono font-semibold tabular-nums disabled:bg-slate-100 disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#b44d00]/40 focus:border-[#b44d00]"
                >
                  {slotsLoading ? (
                    <option value="">Carregando horários...</option>
                  ) : slots.length === 0 ? (
                    <option value="">Sem horários disponíveis</option>
                  ) : (
                    slots.map((slot) => (
                      <option key={slot.inicio} value={slot.inicio}>
                        {slot.hora}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {!slotsLoading && slots.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{slotsError ? slotsError : slotsMessage || 'Nenhum horário disponível nesta data.'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void loadSlots(dataSelecionada)}
                  className="text-amber-800 font-bold underline shrink-0"
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {/* 5. Seus Dados de Contato */}
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <span className="block font-bold text-slate-900 text-xs">
                Seus Dados de Contato
              </span>

              <div>
                <label htmlFor="booking-nome" className="block font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  id="booking-nome"
                  type="text"
                  required
                  placeholder="Ex: Ana Paula Ferreira"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b44d00]/40 focus:border-[#b44d00]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="booking-cpf" className="block font-semibold text-slate-700 mb-1">
                    CPF *
                  </label>
                  <input
                    id="booking-cpf"
                    type="text"
                    inputMode="numeric"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(formatCpf(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b44d00]/40 focus:border-[#b44d00]"
                  />
                </div>

                <div>
                  <label htmlFor="booking-celular" className="block font-semibold text-slate-700 mb-1">
                    WhatsApp *
                  </label>
                  <input
                    id="booking-celular"
                    type="tel"
                    inputMode="tel"
                    required
                    maxLength={15}
                    placeholder="(22) 99908-9122"
                    value={celular}
                    onChange={(e) => setCelular(formatPhone(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#b44d00]/40 focus:border-[#b44d00]"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleResetForm}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || slotsLoading || slots.length === 0}
                className="px-5 py-2.5 text-xs font-bold text-white bg-[#b44d00] hover:bg-[#9a4100] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isSubmitting ? 'Agendando...' : 'Confirmar Agendamento'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export const PatientPortal: React.FC<PatientPortalProps> = ({ isStandaloneBooking = false }) => {
  const { currentUser } = useAuth();
  const { branches } = useTenant();
  const [activeTab, setActiveTab] = useState<'appointments' | 'prescriptions' | 'profile'>('appointments');

  if (isStandaloneBooking) {
    return <StandaloneBookingPortal />;
  }

  const patients = StorageService.getPatients();

  // Find patient record matching current user email or name, or default to Camila Albuquerque
  const patient = patients.find((p) => p.email === currentUser.email) || patients[0];

  const appointments = StorageService.getAppointments().filter((a) => a.patientId === patient.id);
  const medicalRecords = StorageService.getMedicalRecords(patient.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Patient Welcome Header */}
      <div className="p-6 bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center justify-center font-bold text-xl">
            {patient.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-widest block">
              Portal do Paciente
            </span>
            <h1 className="text-xl font-bold text-white">{patient.fullName}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              CPF: {patient.documentCpf} · {branches.find((b) => b.id === patient.originBranchId)?.name}
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
                      Local: {apt.roomName || 'Consultório Principal'} · {branches.find((b) => b.id === apt.branchId)?.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (DomainResolver.isRealProductionDomain()) {
                          window.location.href = `https://${PRODUCTION_DOMAINS.CLINIC_BOOKING}`;
                        } else {
                          DomainResolver.setSimulatedDomain(PRODUCTION_DOMAINS.CLINIC_BOOKING);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                    >
                      Novo Agendamento Online
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
                      <span className="font-bold text-slate-800 block mb-1">Prescrições Médicas e Condutas:</span>
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
