import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Filter, 
  Search, 
  User, 
  Stethoscope, 
  Building2, 
  AlertCircle, 
  CheckCircle2, 
  UserCheck, 
  Play, 
  Check, 
  XCircle, 
  Edit,
  ListFilter
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';
import { AppointmentFormModal } from './AppointmentFormModal';
import { WaitlistModal } from './WaitlistModal';

export const AppointmentsModule: React.FC = () => {
  const { activeBranchId, branches } = useTenant();
  const [appointments, setAppointments] = useState<Appointment[]>(StorageService.getAppointments(activeBranchId));
  const professionals = StorageService.getProfessionals();
  const rooms = StorageService.getRooms();

  // Filters
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedProfessional, setSelectedProfessional] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [cancellationModalAppt, setCancellationModalAppt] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Desistência do paciente comunicada por WhatsApp');

  const refreshAppointments = () => {
    setAppointments(StorageService.getAppointments(activeBranchId));
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus, reason?: string) => {
    StorageService.updateAppointmentStatus(id, status, reason);
    refreshAppointments();
  };

  const handleConfirmCancel = () => {
    if (cancellationModalAppt) {
      handleUpdateStatus(cancellationModalAppt.id, 'cancelled', cancellationReason);
      setCancellationModalAppt(null);
    }
  };

  // Filtered Appointments
  const filteredAppointments = appointments.filter(apt => {
    if (selectedProfessional !== 'all' && apt.professionalId !== selectedProfessional) return false;
    if (selectedStatus !== 'all' && apt.status !== selectedStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchPatient = apt.patientName.toLowerCase().includes(q);
      const matchProf = apt.professionalName.toLowerCase().includes(q);
      const matchService = apt.serviceName?.toLowerCase().includes(q) || false;
      if (!matchPatient && !matchProf && !matchService) return false;
    }
    return true;
  });

  const statusLabel = (st: AppointmentStatus) => {
    switch (st) {
      case 'in_consultation':
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Em Atendimento</span>;
      case 'waiting_room':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Na Sala de Espera</span>;
      case 'confirmed':
        return <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">Confirmado</span>;
      case 'completed':
        return <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">Concluído</span>;
      case 'no_show':
        return <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Não Compareceu</span>;
      case 'cancelled':
        return <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded line-through">Cancelado</span>;
      default:
        return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Agendado</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Agenda Visual de Consultas
            </h1>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              Módulo Prioritário
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Controle de horários, salas, encaixes e acompanhamento do fluxo do paciente em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsWaitlistOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition flex items-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Lista de Espera</span>
          </button>

          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsFormOpen(true);
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: View Mode Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Diária
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Semanal
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              viewMode === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Mensal
          </button>
        </div>

        {/* Right: Search & Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Buscar paciente ou procedimento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 w-52"
            />
          </div>

          <select
            value={selectedProfessional}
            onChange={(e) => setSelectedProfessional(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todos os Profissionais</option>
            {professionals.map(p => (
              <option key={p.id} value={p.id}>{p.fullName}</option>
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
            <option value="waiting_room">Na Sala de Espera</option>
            <option value="in_consultation">Em Atendimento</option>
            <option value="completed">Concluído</option>
            <option value="no_show">Faltou</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

      </div>

      {/* Date Title Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-semibold text-slate-800">
          Data de referência: Segunda-feira, 09 de Novembro de 2026
        </span>
        <span>
          {filteredAppointments.length} {filteredAppointments.length === 1 ? 'consulta listada' : 'consultas listadas'}
        </span>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Horário</th>
                <th className="py-3 px-4">Paciente & Contato</th>
                <th className="py-3 px-4">Profissional & Sala</th>
                <th className="py-3 px-4">Procedimento</th>
                <th className="py-3 px-4">Status & Fluxo</th>
                <th className="py-3 px-4 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum agendamento encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => {
                  const startTimeStr = new Date(apt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const endTimeStr = new Date(apt.endTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const dateStr = new Date(apt.startTime).toLocaleDateString('pt-BR');

                  return (
                    <tr key={apt.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 tabular-nums">
                          {startTimeStr} - {endTimeStr}
                        </div>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {dateStr}
                        </span>
                        {apt.isOverbook && (
                          <span className="block mt-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 w-fit">
                            Encaixe
                          </span>
                        )}
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{apt.patientName}</span>
                          {apt.appointmentType === 'telemedicina' && (
                            <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
                              Telemedicina
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 block">{apt.patientPhone}</span>
                        {apt.notes && (
                          <p className="text-[11px] text-slate-500 italic truncate max-w-xs mt-0.5">
                            "{apt.notes}"
                          </p>
                        )}
                      </td>

                      {/* Professional & Room */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                          <span>{apt.professionalName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block">
                          {apt.roomName || 'Consultório Principal'}
                        </span>
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">
                          {apt.serviceName || 'Consulta Médica'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {branches.find(b => b.id === apt.branchId)?.name || 'Filial'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {statusLabel(apt.status)}
                        {apt.cancellationReason && (
                          <p className="text-[10px] text-rose-500 italic mt-0.5 max-w-[140px] truncate">
                            Motivo: {apt.cancellationReason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === 'scheduled' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                              className="px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                              title="Confirmar Presença"
                            >
                              Confirmar
                            </button>
                          )}

                          {apt.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'waiting_room')}
                              className="px-2 py-1 text-[11px] font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition flex items-center gap-1"
                              title="Marcar Chegada do Paciente"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Chegou</span>
                            </button>
                          )}

                          {apt.status === 'waiting_room' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'in_consultation')}
                              className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition flex items-center gap-1"
                              title="Iniciar Atendimento no Consultório"
                            >
                              <Play className="w-3 h-3" />
                              <span>Atender</span>
                            </button>
                          )}

                          {apt.status === 'in_consultation' && (
                            <button
                              onClick={() => handleUpdateStatus(apt.id, 'completed')}
                              className="px-2 py-1 text-[11px] font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition flex items-center gap-1"
                              title="Concluir Atendimento"
                            >
                              <Check className="w-3 h-3" />
                              <span>Concluir</span>
                            </button>
                          )}

                          {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(apt.id, 'no_show')}
                                className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Registrar Falta"
                              >
                                Faltou
                              </button>
                              <button
                                onClick={() => setCancellationModalAppt(apt)}
                                className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                                title="Cancelar Consulta"
                              >
                                Cancelar
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setEditingAppointment(apt);
                              setIsFormOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800 transition"
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
              Você está cancelando a consulta de <strong>{cancellationModalAppt.patientName}</strong> com {cancellationModalAppt.professionalName}.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motivo do Cancelamento</label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellationModalAppt(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmCancel}
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
        onSaveSuccess={refreshAppointments}
      />

      {/* Waitlist Modal */}
      <WaitlistModal
        isOpen={isWaitlistOpen}
        onClose={() => setIsWaitlistOpen(false)}
        onBookPatient={(patientId, profId) => {
          setEditingAppointment(null);
          setIsFormOpen(true);
        }}
      />

    </div>
  );
};
