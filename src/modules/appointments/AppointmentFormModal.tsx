import React, { useState } from 'react';
import { X, Calendar, Clock, User, Stethoscope, Building2, AlertTriangle } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingAppointment?: Appointment | null;
  onSaveSuccess: () => void;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  existingAppointment,
  onSaveSuccess,
}) => {
  const { branches, activeBranchId } = useTenant();
  const patients = StorageService.getPatients();
  const professionals = StorageService.getProfessionals();
  const services = StorageService.getServices();
  const rooms = StorageService.getRooms();

  const defaultBranch = activeBranchId !== 'all' ? activeBranchId : branches[0]?.id || '';

  const [branchId, setBranchId] = useState(existingAppointment?.branchId || defaultBranch);
  const [patientId, setPatientId] = useState(existingAppointment?.patientId || patients[0]?.id || '');
  const [professionalId, setProfessionalId] = useState(existingAppointment?.professionalId || professionals[0]?.id || '');
  const [serviceId, setServiceId] = useState(existingAppointment?.serviceId || services[0]?.id || '');
  const [roomId, setRoomId] = useState(existingAppointment?.roomId || rooms[0]?.id || '');
  
  // Format initial date & time
  const initialDate = existingAppointment 
    ? new Date(existingAppointment.startTime).toISOString().split('T')[0] 
    : '2026-11-09';
  const initialTime = existingAppointment 
    ? new Date(existingAppointment.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
    : '10:00';

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [status, setStatus] = useState<AppointmentStatus>(existingAppointment?.status || 'scheduled');
  const [appointmentType, setAppointmentType] = useState<'presencial' | 'telemedicina'>(existingAppointment?.appointmentType || 'presencial');
  const [notes, setNotes] = useState(existingAppointment?.notes || '');
  const [isOverbook, setIsOverbook] = useState(existingAppointment?.isOverbook || false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const patient = patients.find(p => p.id === patientId);
    const professional = professionals.find(p => p.id === professionalId);
    const service = services.find(s => s.id === serviceId);
    const room = rooms.find(r => r.id === roomId);

    if (!patient || !professional) {
      setErrorMessage('Selecione um paciente e um profissional.');
      return;
    }

    const startDateTime = new Date(`${date}T${time}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);

    const payload: Appointment = {
      id: existingAppointment?.id || `apt_${Date.now()}`,
      organizationId: 'org_mureb_01',
      branchId,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      professionalId: professional.id,
      professionalName: professional.fullName,
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
      createdAt: existingAppointment?.createdAt || new Date().toISOString(),
    };

    const res = StorageService.saveAppointment(payload);
    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao salvar agendamento.');
      return;
    }

    onSaveSuccess();
    onClose();
  };

  const branchRooms = rooms.filter(r => r.branchId === branchId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        
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
              <p className="text-xs text-slate-400">Reserva de horário, profissional e sala</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Filial / Unidade</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Modalidade</label>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value as 'presencial' | 'telemedicina')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="presencial">Presencial (Consultório)</option>
                <option value="telemedicina">Telemedicina (Online)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Paciente</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.fullName} (CPF: {p.documentCpf}) · {p.phone}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Profissional de Saúde</label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {professionals.map(pr => (
                  <option key={pr.id} value={pr.id}>
                    {pr.fullName} ({pr.councilNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Procedimento / Serviço</label>
              <select
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  const selectedSrv = services.find(s => s.id === e.target.value);
                  if (selectedSrv) setDurationMinutes(selectedSrv.durationMinutes);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} - R$ {s.price.toFixed(2)} ({s.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Horário de Início</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duração (min)</label>
              <input
                type="number"
                min="15"
                step="15"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sala / Consultório</label>
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {branchRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status da Consulta</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Observações Internas</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Queixa relatada na marcação, solicitações especiais, etc."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Encaixe Toggle */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
            <div className="text-xs text-amber-800">
              <span className="font-bold block">Permitir Encaixe de Horário</span>
              <span className="text-[11px] text-amber-700">Ignora alertas de sobreposição de agenda para este paciente.</span>
            </div>
            <input
              type="checkbox"
              checked={isOverbook}
              onChange={(e) => setIsOverbook(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
            />
          </div>

          {/* Buttons */}
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
              Salvar Agendamento
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
