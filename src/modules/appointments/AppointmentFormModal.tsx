import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  AlertTriangle,
  Loader2,
  UserPlus,
  Users,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Appointment, AppointmentStatus, Patient } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';
import { fetchAvailableSlots, N8nAvailableSlot } from '../../services/n8nService';
import { formatCpf, formatPhone } from '../../services/brazilianFormatters';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAppointment?: Appointment | null;
  preselectedPatientId?: string;
  preselectedProfessionalId?: string;
  preselectedNotes?: string;
  defaultOverbook?: boolean;
  defaultDate?: string;
  onSaveSuccess: () => void;
}

function getLocalTodayIso(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  existingAppointment,
  preselectedPatientId,
  preselectedProfessionalId,
  preselectedNotes,
  defaultOverbook = false,
  defaultDate,
  onSaveSuccess,
}) => {
  const { branches, activeBranchId, clinic, organization } = useTenant();
  const [patients, setPatients] = useState<Patient[]>(StorageService.getPatients());
  const professionals = StorageService.getProfessionals();
  const services = StorageService.getServices();
  const rooms = StorageService.getRooms();

  const defaultBranch = activeBranchId !== 'all' ? activeBranchId : branches[0]?.id || 'branch_cf_centro';

  const [patientMode, setPatientMode] = useState<'existing' | 'new'>('existing');
  const [branchId, setBranchId] = useState(defaultBranch);
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id || 'prof_newton');
  const [serviceId, setServiceId] = useState(services[0]?.id || '');
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');

  // New inline patient fields
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientCpf, setNewPatientCpf] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientEmail, setNewPatientEmail] = useState('');

  const [date, setDate] = useState(defaultDate || getLocalTodayIso());
  const [time, setTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [status, setStatus] = useState<AppointmentStatus>('scheduled');
  const [appointmentType, setAppointmentType] = useState<'presencial' | 'telemedicina'>('presencial');
  const [notes, setNotes] = useState('');
  const [isOverbook, setIsOverbook] = useState(false);
  const [sendToN8n, setSendToN8n] = useState(true);

  // n8n slots state
  const [n8nSlots, setN8nSlots] = useState<N8nAvailableSlot[]>([]);
  const [selectedN8nInicio, setSelectedN8nInicio] = useState<string>('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsInfo, setSlotsInfo] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const latestPatients = StorageService.getPatients();
    setPatients(latestPatients);
    setErrorMessage('');

    if (existingAppointment) {
      const dt = new Date(existingAppointment.startTime);
      const localDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      const localTime = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
      const endDt = new Date(existingAppointment.endTime);
      const diffMins = Math.max(15, Math.round((endDt.getTime() - dt.getTime()) / 60000));

      setPatientMode('existing');
      setBranchId(existingAppointment.branchId || defaultBranch);
      setPatientId(existingAppointment.patientId || latestPatients[0]?.id || '');
      setProfessionalId(existingAppointment.professionalId || professionals[0]?.id || 'prof_newton');
      setServiceId(existingAppointment.serviceId || services[0]?.id || '');
      setRoomId(existingAppointment.roomId || rooms[0]?.id || '');
      setDate(localDate);
      setTime(localTime);
      setDurationMinutes(diffMins || 50);
      setStatus(existingAppointment.status);
      setAppointmentType(existingAppointment.appointmentType || 'presencial');
      setNotes(existingAppointment.notes || '');
      setIsOverbook(Boolean(existingAppointment.isOverbook));
      setSendToN8n(false);
    } else {
      setPatientMode(latestPatients.length > 0 ? 'existing' : 'new');
      setBranchId(defaultBranch);
      setPatientId(preselectedPatientId || latestPatients[0]?.id || '');
      setProfessionalId(preselectedProfessionalId || professionals[0]?.id || 'prof_newton');
      setServiceId(services[0]?.id || '');
      setRoomId(rooms[0]?.id || '');
      setDate(defaultDate || getLocalTodayIso());
      setTime('09:00');
      setDurationMinutes(services[0]?.durationMinutes || 50);
      setStatus('scheduled');
      setAppointmentType('presencial');
      setNotes(preselectedNotes || '');
      setIsOverbook(defaultOverbook);
      setSendToN8n(true);
      setNewPatientName('');
      setNewPatientCpf('');
      setNewPatientPhone('');
      setNewPatientEmail('');
    }
    setSelectedN8nInicio('');
  }, [
    isOpen,
    existingAppointment,
    preselectedPatientId,
    preselectedProfessionalId,
    preselectedNotes,
    defaultOverbook,
    defaultDate,
    defaultBranch,
  ]);

  const loadN8nSlots = async (targetDate: string) => {
    if (!targetDate) return;
    setSlotsLoading(true);
    setSlotsInfo('');
    const res = await fetchAvailableSlots(targetDate, {
      webhookDisponibilidade: clinic.n8nWebhookDisponibilidade,
      tenantSlug: organization.slug,
    });
    setN8nSlots(res.slots);
    if (res.slots.length > 0 && !existingAppointment) {
      setTime(res.slots[0].hora);
      setSelectedN8nInicio(res.slots[0].inicio);
    } else if (res.slots.length === 0) {
      setSlotsInfo(res.mensagem || 'Nenhum horário livre retornado pelo n8n nesta data.');
      setSelectedN8nInicio('');
    }
    setSlotsLoading(false);
  };

  useEffect(() => {
    if (isOpen && date) {
      void loadN8nSlots(date);
    }
  }, [isOpen, date]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (patientMode === 'new') {
      const cleanCpf = newPatientCpf.replace(/\D/g, '');
      const cleanPhone = newPatientPhone.replace(/\D/g, '');
      if (!newPatientName.trim() || newPatientName.trim().length < 3) {
        setErrorMessage('Informe o nome completo do novo paciente.');
        return;
      }
      if (cleanCpf.length !== 11) {
        setErrorMessage('Informe um CPF válido com 11 dígitos.');
        return;
      }
      if (cleanPhone.length < 10) {
        setErrorMessage('Informe um WhatsApp válido com DDD.');
        return;
      }
    } else if (!patientId) {
      setErrorMessage('Selecione um paciente ou cadastre um novo.');
      return;
    }

    const service = services.find((s) => s.id === serviceId);
    const room = rooms.find((r) => r.id === roomId);

    const [y, m, d] = date.split('-').map(Number);
    const [hh, mm] = time.split(':').map(Number);
    const startDateTime = new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    setIsSubmitting(true);

    const res = await StorageService.createAppointmentInCloud({
      existingAppointmentId: existingAppointment?.id,
      existingPatientId: patientMode === 'existing' ? patientId : undefined,
      newPatient:
        patientMode === 'new'
          ? {
              fullName: newPatientName.trim(),
              documentCpf: newPatientCpf,
              phone: newPatientPhone,
              whatsapp: newPatientPhone,
              email: newPatientEmail.trim(),
            }
          : undefined,
      branchId,
      professionalId,
      serviceId: service?.id,
      serviceName: service?.name,
      roomId: room?.id,
      roomName: room?.name,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      status,
      appointmentType,
      notes,
      isOverbook,
      dateYmd: date,
      horaFormatada: time,
      n8nInicio: selectedN8nInicio || startDateTime.toISOString(),
      sendToN8n: Boolean(sendToN8n && !existingAppointment),
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao salvar agendamento.');
      return;
    }

    onSaveSuccess();
    onClose();
  };

  const matchedBranchRooms = rooms.filter((r) => r.branchId === branchId);
  const branchRooms = matchedBranchRooms.length > 0 ? matchedBranchRooms : rooms;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {existingAppointment ? 'Editar Consulta Médica' : 'Novo Agendamento'}
              </h3>
              <p className="text-xs text-slate-400">
                Integrado ao Supabase Realtime & disponibilidade n8n
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <strong className="font-semibold">Atenção:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Filial / Unidade</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Modalidade</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as 'presencial' | 'telemedicina')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="presencial">Presencial (Consultório)</option>
                <option value="telemedicina">Telemedicina (Online)</option>
              </select>
            </div>
          </div>

          {/* Patient Selection vs Inline Registration */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-slate-800">Paciente</span>
              {!existingAppointment && (
                <div className="flex items-center gap-1 p-0.5 bg-white border border-slate-200 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPatientMode('existing')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                      patientMode === 'existing'
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>Já Cadastrado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientMode('new')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition ${
                      patientMode === 'new'
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Cadastrar Novo</span>
                  </button>
                </div>
              )}
            </div>

            {patientMode === 'existing' ? (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (CPF: {p.documentCpf}) · {p.whatsapp || p.phone}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Paula Ferreira"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CPF *</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="000.000.000-00"
                    value={newPatientCpf}
                    onChange={(e) => setNewPatientCpf(formatCpf(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    maxLength={15}
                    placeholder="(22) 99908-9122"
                    value={newPatientPhone}
                    onChange={(e) => setNewPatientPhone(formatPhone(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">E-mail (Opcional)</label>
                  <input
                    type="email"
                    placeholder="paciente@email.com"
                    value={newPatientEmail}
                    onChange={(e) => setNewPatientEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Médico Responsável</label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {professionals.map((pr) => (
                  <option key={pr.id} value={pr.id}>
                    {pr.fullName} ({pr.councilNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Procedimento / Serviço</label>
              <select
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  const selectedSrv = services.find((s) => s.id === e.target.value);
                  if (selectedSrv) setDurationMinutes(selectedSrv.durationMinutes);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time & n8n Available Slots */}
          <div className="space-y-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Data</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Horário de Início</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    const matched = n8nSlots.find((s) => s.hora === e.target.value);
                    setSelectedN8nInicio(matched?.inicio || '');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Duração (min)</label>
                <input
                  type="number"
                  min="15"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* n8n Availability Bar */}
            <div className="p-3 bg-sky-50/70 rounded-xl border border-sky-200/80 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-sky-900">
                  Horários Disponíveis (Webhook n8n)
                </span>
                <button
                  type="button"
                  onClick={() => void loadN8nSlots(date)}
                  disabled={slotsLoading}
                  className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 inline-flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${slotsLoading ? 'animate-spin' : ''}`} />
                  <span>{slotsLoading ? 'Consultando...' : 'Atualizar Horários'}</span>
                </button>
              </div>

              {slotsLoading ? (
                <div className="text-[11px] text-sky-700 flex items-center gap-1.5 py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Consultando agenda em tempo real no n8n...</span>
                </div>
              ) : n8nSlots.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {n8nSlots.map((slot) => (
                    <button
                      key={slot.inicio}
                      type="button"
                      onClick={() => {
                        setTime(slot.hora);
                        setSelectedN8nInicio(slot.inicio);
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border transition tabular-nums ${
                        time === slot.hora
                          ? 'bg-sky-600 text-white border-sky-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:border-sky-400 hover:text-sky-800'
                      }`}
                    >
                      {slot.hora}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-600">
                  {slotsInfo || 'Nenhum horário disponível retornado pelo n8n — você ainda pode definir um horário manual ou encaixe acima.'}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sala / Consultório</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {branchRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status da Consulta</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="scheduled">Agendado</option>
                <option value="confirmed">Confirmado</option>
                <option value="waiting_room">Na Sala de Espera</option>
                <option value="in_consultation">Em Atendimento</option>
                <option value="completed">Concluído</option>
                <option value="no_show">Faltou (Não Compareceu)</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Observações Internas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Queixa relatada na marcação, solicitações especiais, etc."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Encaixe Toggle */}
            <label className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between gap-2 cursor-pointer">
              <div className="text-xs text-amber-800">
                <span className="font-bold block">Permitir Encaixe</span>
                <span className="text-[11px] text-amber-700">Ignora alertas de sobreposição.</span>
              </div>
              <input
                type="checkbox"
                checked={isOverbook}
                onChange={(e) => setIsOverbook(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
              />
            </label>

            {/* n8n Sync Toggle */}
            {!existingAppointment && (
              <label className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2 cursor-pointer">
                <div className="text-xs text-emerald-900">
                  <span className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Notificar via n8n
                  </span>
                  <span className="text-[11px] text-emerald-700">Envia confirmação ao fluxo WhatsApp/Agenda.</span>
                </div>
                <input
                  type="checkbox"
                  checked={sendToN8n}
                  onChange={(e) => setSendToN8n(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </label>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-60 rounded-lg shadow-sm transition inline-flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
