import React, { useState, useEffect } from 'react';
import { X, Clock, Trash2, Plus, Loader2 } from 'lucide-react';
import { WaitlistEntry, Patient } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookPatient: (patientId: string, professionalId?: string, notes?: string) => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose, onBookPatient }) => {
  const { activeBranchId, branches, organization } = useTenant();
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(StorageService.getWaitlist(activeBranchId));
  const [patients, setPatients] = useState<Patient[]>(StorageService.getPatients());
  const professionals = StorageService.getProfessionals();

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id || 'prof_newton');
  const [period, setPeriod] = useState<'qualquer' | 'manha' | 'tarde' | 'noite'>('manha');
  const [notes, setNotes] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Segunda', 'Quarta', 'Sexta']);

  const refreshWaitlist = async () => {
    setIsLoading(true);
    const list = await StorageService.fetchWaitlistFromCloud(activeBranchId);
    setWaitlist(list);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      const latestPatients = StorageService.getPatients();
      setPatients(latestPatients);
      if (!patientId && latestPatients[0]) {
        setPatientId(latestPatients[0].id);
      }
      void refreshWaitlist();
    }
  }, [isOpen, activeBranchId]);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;

    setIsSaving(true);
    const newEntry: WaitlistEntry = {
      id: `wait_${Date.now()}`,
      organizationId: organization.id || 'org_mureb_01',
      branchId: activeBranchId === 'all' ? branches[0]?.id || 'branch_cf_centro' : activeBranchId,
      patientId: patient.id,
      patientName: patient.fullName,
      patientPhone: patient.whatsapp || patient.phone,
      professionalId,
      preferredPeriod: period,
      preferredDays: selectedDays,
      notes,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };

    await StorageService.createWaitlistInCloud(newEntry);
    await refreshWaitlist();
    setIsSaving(false);
    setShowAddForm(false);
    setNotes('');
  };

  const handleRemove = async (id: string) => {
    await StorageService.removeWaitlistInCloud(id);
    setWaitlist(StorageService.getWaitlist(activeBranchId));
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const allDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Lista de Espera e Cancelamentos</h3>
              <p className="text-xs text-slate-400">
                Sincronizada com Supabase (public.waitlist) para encaixes imediatos
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>
                {waitlist.length} {waitlist.length === 1 ? 'paciente aguardando' : 'pacientes aguardando'}
              </span>
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />}
            </p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar à Lista</span>
              </button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleAdd} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>Novo Paciente na Lista de Espera</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Paciente</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Profissional Desejado
                  </label>
                  <select
                    value={professionalId}
                    onChange={(e) => setProfessionalId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    {professionals.map((pr) => (
                      <option key={pr.id} value={pr.id}>
                        {pr.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Turno Preferido</label>
                <div className="flex gap-2">
                  {(['qualquer', 'manha', 'tarde', 'noite'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setPeriod(t)}
                      className={`px-3 py-1 text-xs rounded-md capitalize font-medium ${
                        period === t
                          ? 'bg-sky-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Dias da Semana Disponíveis
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allDays.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-2.5 py-1 text-[11px] rounded-md font-medium ${
                        selectedDays.includes(day)
                          ? 'bg-sky-100 text-sky-800 border border-sky-300 font-semibold'
                          : 'bg-white border border-slate-200 text-slate-600'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Observações de Urgência
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Pode vir com 30min de antecedência se houver desistência."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg inline-flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Salvar na Lista</span>
                </button>
              </div>
            </form>
          )}

          {/* Table / List */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {waitlist.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                A lista de espera está vazia para a unidade selecionada.
              </div>
            ) : (
              waitlist.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900">{item.patientName}</span>
                      <span className="text-[10px] text-slate-500">({item.patientPhone})</span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 capitalize">
                        Turno: {item.preferredPeriod}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Dias preferenciais: <strong>{item.preferredDays.join(', ') || 'Flexível'}</strong>
                    </p>
                    {item.notes && <p className="text-[11px] text-slate-500 italic">"{item.notes}"</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onBookPatient(item.patientId, item.professionalId, item.notes);
                        void handleRemove(item.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                    >
                      Encaixar na Agenda
                    </button>
                    <button
                      onClick={() => void handleRemove(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      title="Remover da lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
