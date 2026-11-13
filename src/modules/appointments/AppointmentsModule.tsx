import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Stethoscope,
  AlertCircle,
  UserCheck,
  Play,
  Check,
  Edit,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Globe,
  Copy,
  MessageCircle,
  FileText,
  RotateCcw,
  ExternalLink,
} from 'lucide-react';
import { Appointment, AppointmentStatus, Patient } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';
import { getSupabase } from '../../services/supabaseClient';
import { PRODUCTION_DOMAINS, DomainResolver } from '../../services/domainResolver';
import { AppointmentFormModal } from './AppointmentFormModal';
import { WaitlistModal } from './WaitlistModal';

interface AppointmentsModuleProps {
  onNavigateToRecord?: (patient: Patient) => void;
}

type ViewPeriodMode = 'day' | 'week' | 'month' | 'all';

function getLocalYmd(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDaysToYmd(ymd: string, deltaDays: number): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, (d || 1) + deltaDays);
  return getLocalYmd(dt);
}

function formatLongDatePtBr(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function buildWhatsappUrl(phone: string, apt: Appointment, branchAddress?: string): string {
  const digits = phone.replace(/\D/g, '');
  const fullDigits = digits.startsWith('55') && digits.length >= 12 ? digits : `55${digits}`;
  const dt = new Date(apt.startTime);
  const dateStr = dt.toLocaleDateString('pt-BR');
  const timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const text = `Olá, ${apt.patientName}! Confirmamos sua consulta (${apt.serviceName || 'Atendimento Médico'}) com ${apt.professionalName} no dia ${dateStr} às ${timeStr}${branchAddress ? ` na ${branchAddress}` : ''}. Caso precise remarcar, nos avise por aqui.`;
  return `https://wa.me/${fullDigits}?text=${encodeURIComponent(text)}`;
}

export const AppointmentsModule: React.FC<AppointmentsModuleProps> = ({ onNavigateToRecord }) => {
  const { activeBranchId, branches, clinic } = useTenant();
  const [appointments, setAppointments] = useState<Appointment[]>(() =>
    StorageService.getAppointments(activeBranchId)
  );
  const professionals = StorageService.getProfessionals();

  // Interactive Date & View Filters
  const todayYmd = getLocalYmd();
  const [referenceDate, setReferenceDate] = useState<string>(todayYmd);
  const [viewMode, setViewMode] = useState<ViewPeriodMode>('all');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync & Feedback States
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedAgendaLink, setCopiedAgendaLink] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [preselectedPatientId, setPreselectedPatientId] = useState<string | undefined>(undefined);
  const [preselectedProfessionalId, setPreselectedProfessionalId] = useState<string | undefined>(undefined);
  const [preselectedNotes, setPreselectedNotes] = useState<string | undefined>(undefined);
  const [defaultOverbook, setDefaultOverbook] = useState<boolean>(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [cancellationModalAppt, setCancellationModalAppt] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState(
    'Desistência do paciente comunicada por WhatsApp'
  );

  const clinicDomains = StorageService.getDomainsByClinic(clinic.id);
  const bookingDomain =
    clinicDomains.find((d) => d.domainType === 'clinic_booking' || d.domainType === 'booking')
      ?.domain || PRODUCTION_DOMAINS.CLINIC_BOOKING;
  const bookingUrl = `https://${bookingDomain}`;

  const loadAppointments = useCallback(
    async (silent = false) => {
      if (!silent) setIsSyncing(true);
      const cloudList = await StorageService.fetchAppointmentsFromCloud();
      const filteredByBranch =
        !activeBranchId || activeBranchId === 'all'
          ? cloudList
          : cloudList.filter((a) => a.branchId === activeBranchId);
      setAppointments(filteredByBranch);
      setLastSyncedAt(
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      if (!silent) setIsSyncing(false);
    },
    [activeBranchId]
  );

  useEffect(() => {
    void loadAppointments(false);
  }, [loadAppointments]);

  // Supabase Realtime subscription + localStorage listener + 30s fallback polling
  useEffect(() => {
    const supabase = getSupabase();
    let channel: ReturnType<NonNullable<typeof supabase>['channel']> | null = null;

    if (supabase) {
      channel = supabase
        .channel('appointments-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'appointments' },
          () => {
            void loadAppointments(true);
          }
        )
        .subscribe((subStatus) => {
          setIsRealtimeConnected(subStatus === 'SUBSCRIBED');
        });
    }

    const handleStorageUpdate = () => {
      setAppointments(StorageService.getAppointments(activeBranchId));
    };
    window.addEventListener('medsync_storage_update', handleStorageUpdate);

    const pollInterval = window.setInterval(() => {
      if (getSupabase()) {
        void loadAppointments(true);
      }
    }, 30000);

    return () => {
      window.removeEventListener('medsync_storage_update', handleStorageUpdate);
      window.clearInterval(pollInterval);
      if (supabase && channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [activeBranchId, loadAppointments]);

  const handleUpdateStatus = async (
    id: string,
    status: AppointmentStatus,
    reasonOrNotes?: string
  ) => {
    setUpdatingId(id);
    await StorageService.updateAppointmentStatusInCloud(id, status, reasonOrNotes);
    setAppointments(StorageService.getAppointments(activeBranchId));
    setUpdatingId(null);
  };

  const handleConfirmCancel = async () => {
    if (cancellationModalAppt) {
      const target = cancellationModalAppt;
      setCancellationModalAppt(null);
      await handleUpdateStatus(target.id, 'cancelled', cancellationReason);
    }
  };

  const handleOpenMedicalRecord = (apt: Appointment) => {
    if (!onNavigateToRecord) return;
    const allPatients = StorageService.getPatients();
    let patient =
      allPatients.find((p) => p.id === apt.patientId) ||
      allPatients.find((p) => p.fullName.toLowerCase() === apt.patientName.toLowerCase());

    if (!patient) {
      patient = StorageService.upsertPatientByCpf({
        id: apt.patientId || `pat_pep_${Date.now()}`,
        organizationId: apt.organizationId,
        originBranchId: apt.branchId,
        fullName: apt.patientName,
        documentCpf: '',
        birthDate: '',
        gender: 'N',
        phone: apt.patientPhone,
        whatsapp: apt.patientPhone,
        email: '',
        sharingMode: 'model_b_shared',
        authorizedBranchIds: [apt.branchId],
        createdAt: new Date().toISOString(),
        isActive: true,
      });
    }

    onNavigateToRecord(patient);
  };

  const handleCopyBookingLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    setCopiedAgendaLink(true);
    setTimeout(() => setCopiedAgendaLink(false), 2500);
  };

  // Period + Search + Status + Professional Filtering
  const filteredAppointments = appointments
    .filter((apt) => {
      const aptLocalDate = getLocalYmd(new Date(apt.startTime));

      if (viewMode === 'day') {
        if (aptLocalDate !== referenceDate) return false;
      } else if (viewMode === 'week') {
        const [ry, rm, rd] = referenceDate.split('-').map(Number);
        const refDt = new Date(ry, (rm || 1) - 1, rd || 1);
        const dayOfWeek = refDt.getDay(); // 0 = Sun ... 6 = Sat
        const weekStart = new Date(refDt);
        weekStart.setDate(refDt.getDate() - dayOfWeek);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        const startYmd = getLocalYmd(weekStart);
        const endYmd = getLocalYmd(weekEnd);
        if (aptLocalDate < startYmd || aptLocalDate > endYmd) return false;
      } else if (viewMode === 'month') {
        if (aptLocalDate.slice(0, 7) !== referenceDate.slice(0, 7)) return false;
      }

      if (selectedProfessional !== 'all' && apt.professionalId !== selectedProfessional) {
        return false;
      }
      if (selectedStatus !== 'all' && apt.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPatient = apt.patientName.toLowerCase().includes(q);
        const matchProf = apt.professionalName.toLowerCase().includes(q);
        const matchService = apt.serviceName?.toLowerCase().includes(q) || false;
        const matchPhone = apt.patientPhone?.toLowerCase().includes(q) || false;
        if (!matchPatient && !matchProf && !matchService && !matchPhone) return false;
      }
      return true;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const statusBadge = (st: AppointmentStatus) => {
    switch (st) {
      case 'in_consultation':
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
            Em Atendimento
          </span>
        );
      case 'waiting_room':
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
            Na Recepção
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200">
            Confirmado
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-300">
            Concluído
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
            Faltou
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-md border border-slate-200 line-through">
            Cancelado
          </span>
        );
      case 'scheduled':
      default:
        return (
          <span className="inline-flex items-center text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
            Agendado
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Agenda Visual de Consultas
            </h1>
            <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {isRealtimeConnected ? 'Realtime Supabase Ativo' : 'Sincronização Ativa'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle em tempo real integrado ao portal <code className="font-mono text-slate-700">{bookingDomain}</code> e automação n8n.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Online Booking Portal Actions */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
            {DomainResolver.isSimulationAllowed() ? (
              <button
                type="button"
                onClick={() => DomainResolver.setSimulatedDomain(bookingDomain)}
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-1.5"
                title={`Abrir simulador de ${bookingDomain}`}
              >
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span>Agenda Online ({bookingDomain})</span>
              </button>
            ) : (
              <a
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-amber-600" />
                <span>Agenda Online ({bookingDomain})</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            )}
            <button
              type="button"
              onClick={handleCopyBookingLink}
              className="px-2.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border-l border-slate-200 transition inline-flex items-center gap-1"
              title="Copiar link para enviar ao paciente no WhatsApp"
            >
              {copiedAgendaLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAgendaLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsWaitlistOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition flex items-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Lista de Espera</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingAppointment(null);
              setPreselectedPatientId(undefined);
              setPreselectedProfessionalId(undefined);
              setPreselectedNotes(undefined);
              setDefaultOverbook(false);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Filter & Period Controls */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: View Mode Segmented Control */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Diária
          </button>
          <button
            type="button"
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Semanal
          </button>
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Mensal
          </button>
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas as Datas
          </button>
        </div>

        {/* Right: Search & Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar paciente ou procedimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 w-56"
            />
          </div>

          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Dr. Newton Mureb (Todos)</option>
            {professionals.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todos os Status</option>
            <option value="scheduled">Agendado</option>
            <option value="confirmed">Confirmado</option>
            <option value="waiting_room">Na Recepção</option>
            <option value="in_consultation">Em Atendimento</option>
            <option value="completed">Concluído</option>
            <option value="no_show">Faltou</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Interactive Date Navigation & Sync Bar */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setReferenceDate((prev) => addDaysToYmd(prev, -1));
              if (viewMode === 'all') setViewMode('day');
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Dia Anterior</span>
          </button>

          <input
            type="date"
            value={referenceDate}
            onChange={(e) => {
              if (e.target.value) {
                setReferenceDate(e.target.value);
                if (viewMode === 'all') setViewMode('day');
              }
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          <button
            type="button"
            onClick={() => {
              setReferenceDate(todayYmd);
              setViewMode('day');
            }}
            className="px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold transition"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={() => {
              setReferenceDate((prev) => addDaysToYmd(prev, 1));
              if (viewMode === 'all') setViewMode('day');
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1 transition"
          >
            <span>Próximo Dia</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <span className="font-semibold text-slate-700 capitalize ml-1">
            {viewMode === 'all'
              ? 'Exibindo todas as datas / próximas consultas'
              : viewMode === 'week'
                ? `Semana de ${formatLongDatePtBr(referenceDate)}`
                : viewMode === 'month'
                  ? `Mês de ${new Date(`${referenceDate}T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
                  : formatLongDatePtBr(referenceDate)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void loadAppointments(false)}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold inline-flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
          </button>

          <span className="text-slate-500 font-medium tabular-nums">
            {filteredAppointments.length}{' '}
            {filteredAppointments.length === 1 ? 'consulta' : 'consultas'}
            {lastSyncedAt && <span className="text-[10px] text-slate-400 ml-1.5">({lastSyncedAt})</span>}
          </span>
        </div>
      </div>

      {/* Appointments Table (responsive overflow-x with unclipped Actions column) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 w-[135px]">Horário</th>
                <th className="py-3 px-3.5">Paciente & Contato</th>
                <th className="py-3 px-3.5">Profissional & Sala</th>
                <th className="py-3 px-3.5">Procedimento</th>
                <th className="py-3 px-3.5 w-[135px]">Status</th>
                <th className="py-3 px-3.5 text-right w-[290px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 space-y-2">
                    <p>Nenhum agendamento encontrado para o filtro selecionado.</p>
                    {viewMode !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setViewMode('all')}
                        className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition"
                      >
                        Ver Todas as Datas / Próximas Consultas
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const startDt = new Date(apt.startTime);
                  const endDt = new Date(apt.endTime);
                  const startTimeStr = startDt.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const endTimeStr = endDt.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const dateStr = startDt.toLocaleDateString('pt-BR');
                  const branchObj = branches.find((b) => b.id === apt.branchId);
                  const branchAddr = branchObj
                    ? `${branchObj.name} (${branchObj.street}, ${branchObj.number} - ${branchObj.city}/${branchObj.state})`
                    : undefined;
                  const waHref = apt.patientPhone
                    ? buildWhatsappUrl(apt.patientPhone, apt, branchAddr)
                    : '';
                  const isBusy = updatingId === apt.id;

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                      {/* Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 tabular-nums font-mono">
                          {startTimeStr} - {endTimeStr}
                        </div>
                        <span className="text-[11px] text-slate-500 tabular-nums font-mono block">
                          {dateStr}
                        </span>
                        {apt.isOverbook && (
                          <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Encaixe
                          </span>
                        )}
                      </td>

                      {/* Patient */}
                      <td className="py-3 px-3.5 max-w-[230px]">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span>{apt.patientName}</span>
                          {apt.appointmentType === 'telemedicina' && (
                            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
                              Telemedicina
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          {apt.patientPhone || 'Sem telefone'}
                        </span>
                        {apt.notes && (
                          <p className="text-[11px] text-slate-500 italic truncate mt-0.5" title={apt.notes}>
                            "{apt.notes}"
                          </p>
                        )}
                      </td>

                      {/* Professional & Room */}
                      <td className="py-3 px-3.5 max-w-[210px]">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="truncate">{apt.professionalName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {apt.roomName || 'Consultório 01 - Cabo Frio'}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-3.5 max-w-[190px]">
                        <span className="font-medium text-slate-800 block truncate">
                          {apt.serviceName || 'Consulta Médica'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          {branchObj?.name || 'Unidade Matriz Cabo Frio (Centro)'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {statusBadge(apt.status)}
                        {apt.cancellationReason && (
                          <p
                            className="text-[10px] text-rose-500 italic mt-0.5 max-w-[130px] truncate"
                            title={apt.cancellationReason}
                          >
                            {apt.cancellationReason}
                          </p>
                        )}
                      </td>

                      {/* Actions Column (Never clipped) */}
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* scheduled -> Confirmar + WhatsApp + Faltou + Cancelar */}
                          {apt.status === 'scheduled' && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleUpdateStatus(apt.id, 'confirmed')}
                                className="px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                              >
                                Confirmar
                              </button>
                              {waHref && (
                                <a
                                  href={waHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition inline-flex items-center gap-1"
                                  title="Enviar confirmação via WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleUpdateStatus(apt.id, 'no_show')}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                Faltou
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setCancellationModalAppt(apt)}
                                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-700 hover:bg-slate-100 rounded-lg transition"
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          {/* confirmed -> Chegou + WhatsApp + Faltou + Cancelar */}
                          {apt.status === 'confirmed' && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleUpdateStatus(apt.id, 'waiting_room')}
                                className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition inline-flex items-center gap-1"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Chegou</span>
                              </button>
                              {waHref && (
                                <a
                                  href={waHref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition inline-flex items-center gap-1"
                                  title="Enviar mensagem de confirmação no WhatsApp"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleUpdateStatus(apt.id, 'no_show')}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                Faltou
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setCancellationModalAppt(apt)}
                                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-700 hover:bg-slate-100 rounded-lg transition"
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          {/* waiting_room -> Chamar / Iniciar + Faltou + Cancelar */}
                          {apt.status === 'waiting_room' && (
                            <>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleUpdateStatus(apt.id, 'in_consultation')}
                                className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition inline-flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                <span>Chamar / Iniciar</span>
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleUpdateStatus(apt.id, 'no_show')}
                                className="px-2 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                Faltou
                              </button>
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => setCancellationModalAppt(apt)}
                                className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-rose-700 hover:bg-slate-100 rounded-lg transition"
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          {/* in_consultation -> Prontuário + Concluir */}
                          {apt.status === 'in_consultation' && (
                            <>
                              {onNavigateToRecord && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenMedicalRecord(apt)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition inline-flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  <span>Prontuário</span>
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => void handleUpdateStatus(apt.id, 'completed')}
                                className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition inline-flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                <span>Concluir</span>
                              </button>
                            </>
                          )}

                          {/* completed / no_show / cancelled -> Reabrir / Reagendar */}
                          {(apt.status === 'completed' ||
                            apt.status === 'no_show' ||
                            apt.status === 'cancelled') && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => void handleUpdateStatus(apt.id, 'scheduled')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition inline-flex items-center gap-1"
                              title="Reabrir agendamento para status Agendado"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reabrir / Reagendar</span>
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAppointment(apt);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                            title="Editar Agendamento"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancellation Reason Modal */}
      {cancellationModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirmar Cancelamento</h3>
            <p className="text-xs text-slate-600">
              Você está cancelando a consulta de{' '}
              <strong>{cancellationModalAppt.patientName}</strong> com{' '}
              {cancellationModalAppt.professionalName}.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Motivo do Cancelamento
              </label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellationModalAppt(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmCancel()}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Form Modal */}
      <AppointmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        existingAppointment={editingAppointment}
        preselectedPatientId={preselectedPatientId}
        preselectedProfessionalId={preselectedProfessionalId}
        preselectedNotes={preselectedNotes}
        defaultOverbook={defaultOverbook}
        defaultDate={referenceDate}
        onSaveSuccess={() => void loadAppointments(true)}
      />

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        onBookPatient={(patientId, profId, notes) => {
          setEditingAppointment(null);
          setPreselectedPatientId(patientId);
          setPreselectedProfessionalId(profId);
          setPreselectedNotes(notes);
          setDefaultOverbook(true);
          setIsFormOpen(true);
        }}
      />
    </div>
  );
};
