import React from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  ArrowRight, 
  Stethoscope,
  Activity,
  UserCheck,
  Building2,
  ChevronRight
} from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../services/storage';
import { AppointmentStatus } from '../../types';
import { ClinicTab } from '../../components/Sidebar';

interface ClinicDashboardProps {
  onNavigateTab: (tab: ClinicTab) => void;
}

export const ClinicDashboard: React.FC<ClinicDashboardProps> = ({ onNavigateTab }) => {
  const { activeBranchId, branches } = useTenant();
  const { currentUser, currentRole } = useAuth();

  const appointments = StorageService.getAppointments(activeBranchId);
  const patients = StorageService.getPatients(activeBranchId);
  const financial = StorageService.getFinancial(activeBranchId);
  const waitlist = StorageService.getWaitlist(activeBranchId);
  const auditLogs = StorageService.getAuditLogs().slice(0, 5);

  // Status counters
  const totalToday = appointments.length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmed').length;
  const inWaitingRoom = appointments.filter(a => a.status === 'waiting_room').length;
  const inConsultation = appointments.filter(a => a.status === 'in_consultation').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const noShowCount = appointments.filter(a => a.status === 'no_show').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;

  const totalReceivablesToday = financial
    .filter(f => f.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    StorageService.updateAppointmentStatus(id, status);
  };

  const statusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_consultation':
        return <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Em Atendimento</span>;
      case 'waiting_room':
        return <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">Na Sala de Espera</span>;
      case 'confirmed':
        return <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">Confirmado</span>;
      case 'completed':
        return <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">Concluído</span>;
      case 'no_show':
        return <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">Faltou</span>;
      case 'cancelled':
        return <span className="text-xs font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">Cancelado</span>;
      default:
        return <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">Agendado</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Painel Operacional da Clínica
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Olá, <strong className="text-slate-800">{currentUser.fullName}</strong> ({currentRole}) · 
            {activeBranchId === 'all' ? ' Visão Consolidada de Todas as Filiais' : ` Filtrado para ${branches.find(b => b.id === activeBranchId)?.name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('appointments')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Ver Agenda Completa</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Agendados Hoje</span>
            <Calendar className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">{totalToday}</span>
            <span className="text-xs text-slate-500">consultas</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>{confirmedCount} confirmadas</span>
            <span aria-hidden="true">·</span>
            <span>{inWaitingRoom} em espera</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Na Sala de Espera</span>
            <UserCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600 tabular-nums">{inWaitingRoom}</span>
            <span className="text-xs text-slate-500">aguardando atendimento</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {inConsultation > 0 ? `${inConsultation} já no consultório` : 'Nenhum atendimento em curso'}
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Taxa de Presença</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {totalToday > 0 ? Math.round(((confirmedCount + inWaitingRoom + inConsultation + completedCount) / totalToday) * 100) : 100}%
            </span>
            <span className="text-xs text-emerald-600 font-medium">alta adesão</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {noShowCount} faltas · {cancelledCount} cancelados
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Recebimentos do Dia</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-sm font-semibold text-slate-600">R$</span>
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {totalReceivablesToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium">
            Via Pix & Cartão de Crédito
          </div>
        </div>
      </div>

      {/* Main Grid: Atendimentos de Hoje & Lista de Espera / Filiais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Atendimentos do Dia (Col 1 & 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <h2 className="text-sm font-bold text-slate-900">Consultas e Atendimentos do Dia</h2>
            </div>
            <button
              onClick={() => onNavigateTab('appointments')}
              className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>Gerenciar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhuma consulta agendada para este filtro de filial.
              </div>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {new Date(apt.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs font-bold text-slate-800">{apt.patientName}</span>
                      {statusBadge(apt.status)}
                    </div>
                    <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>{apt.professionalName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{apt.serviceName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{apt.roomName || 'Consultório'}</span>
                    </div>
                    {apt.notes && (
                      <p className="text-[11px] text-slate-600 italic">
                        "{apt.notes}"
                      </p>
                    )}
                  </div>

                  {/* Quick Workflow Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'waiting_room')}
                        className="px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition"
                      >
                        Chegou na Clínica
                      </button>
                    )}
                    {apt.status === 'waiting_room' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'in_consultation')}
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                      >
                        Iniciar Consulta
                      </button>
                    )}
                    {apt.status === 'in_consultation' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        className="px-2.5 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                      >
                        Finalizar Consulta
                      </button>
                    )}
                    {apt.status === 'scheduled' && (
                      <button
                        onClick={() => handleUpdateStatus(apt.id, 'confirmed')}
                        className="px-2.5 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                      >
                        Confirmar
                      </button>
                    )}
                    <button
                      onClick={() => onNavigateTab('medical_records')}
                      className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="Abrir Prontuário"
                    >
                      Prontuário
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Widgets: Filiais & Lista de Espera (Col 3) */}
        <div className="space-y-6">
          
          {/* Filiais Cadastradas */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <h3 className="text-xs font-bold text-slate-900">Unidades da Rede</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('settings')}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700"
              >
                Gerenciar
              </button>
            </div>

            <div className="space-y-2.5">
              {branches.map((b) => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{b.name}</span>
                    {b.isHeadquarters && (
                      <span className="text-[10px] text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded font-semibold">
                        Matriz
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {b.street}, {b.number} · {b.neighborhood}, {b.city}/{b.state}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{b.phone}</span>
                    <span className="text-teal-700 font-medium">
                      {b.patientSharingMode === 'model_b' ? 'Modelo B: Compartilhado' : 'Modelo A: Exclusivo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de Espera Rápida */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900">Lista de Espera Ativa</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{waitlist.length} aguardando</span>
            </div>

            {waitlist.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-2">
                Nenhum paciente na fila de espera no momento.
              </p>
            ) : (
              <div className="space-y-2">
                {waitlist.map((w) => (
                  <div key={w.id} className="p-2.5 bg-amber-50/50 rounded-xl border border-amber-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{w.patientName}</span>
                      <span className="text-[10px] text-amber-800 font-medium capitalize">{w.preferredPeriod}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Dias preferidos: {w.preferredDays.join(', ')}
                    </p>
                    <p className="text-[10px] text-slate-500 italic">
                      "{w.notes}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Auditoria LGPD Recente */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Trilha de Auditoria LGPD</span>
              <span className="text-[10px] text-emerald-600 font-medium">Imutável</span>
            </div>
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-[11px] text-slate-600 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-700">
                    <strong className="font-semibold">{log.userName}</strong>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-500">{log.action} · {log.entity}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
