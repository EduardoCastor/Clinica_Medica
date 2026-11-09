import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Calendar, 
  FileText, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Building2,
  Filter
} from 'lucide-react';
import { Patient } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';
import { PatientFormModal } from './PatientFormModal';
import { PatientDetailsModal } from './PatientDetailsModal';

interface PatientsModuleProps {
  onNavigateToSchedule?: (patient: Patient) => void;
  onNavigateToRecord?: (patient: Patient) => void;
}

export const PatientsModule: React.FC<PatientsModuleProps> = ({
  onNavigateToSchedule,
  onNavigateToRecord,
}) => {
  const { activeBranchId, branches } = useTenant();
  const [patients, setPatients] = useState<Patient[]>(StorageService.getPatients(activeBranchId));
  const [searchQuery, setSearchQuery] = useState('');
  const [sharingFilter, setSharingFilter] = useState<string>('all');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<Patient | null>(null);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);

  const refreshList = () => {
    setPatients(StorageService.getPatients(activeBranchId));
  };

  const filteredPatients = patients.filter(p => {
    if (sharingFilter !== 'all' && p.sharingMode !== sharingFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().replace(/\D/g, '');
      const qText = searchQuery.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(qText);
      const matchCpf = p.documentCpf.replace(/\D/g, '').includes(q);
      const matchPhone = p.phone.replace(/\D/g, '').includes(q);
      if (!matchName && !matchCpf && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Gestão de Pacientes
            </h1>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {patients.length} Pacientes Cadastrados
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cadastro completo, controle de duplicidades por CPF e regras de compartilhamento entre filiais.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedPatientForEdit(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Paciente</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Pesquisar por Nome, CPF ou Telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={sharingFilter}
            onChange={(e) => setSharingFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
          >
            <option value="all">Todos os Modelos de Compartilhamento</option>
            <option value="model_b_shared">Modelo B: Compartilhado entre Filiais</option>
            <option value="model_a_exclusive">Modelo A: Exclusivo da Filial</option>
          </select>
        </div>

      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Paciente</th>
                <th className="py-3 px-4">Documento / CPF</th>
                <th className="py-3 px-4">Contato</th>
                <th className="py-3 px-4">Filial de Referência</th>
                <th className="py-3 px-4">Compartilhamento</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Nenhum paciente localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const branch = branches.find(b => b.id === p.originBranchId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      
                      {/* Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{p.fullName}</div>
                        <span className="text-[11px] text-slate-500">
                          {p.birthDate ? `${new Date(p.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')} · ${p.gender}` : p.gender}
                        </span>
                      </td>

                      {/* CPF */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-700">
                        {p.documentCpf}
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-800 font-medium block">{p.phone}</span>
                        <span className="text-[11px] text-slate-400 block">{p.email || 'Sem e-mail'}</span>
                      </td>

                      {/* Branch */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-sky-600" />
                          <span>{branch?.name || 'Matriz'}</span>
                        </div>
                      </td>

                      {/* Sharing Mode */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.sharingMode === 'model_b_shared' ? (
                          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                            Modelo B: Compartilhado
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            Modelo A: Exclusivo
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPatientForDetails(p)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition"
                            title="Ver Cadastro Completo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {onNavigateToRecord && (
                            <button
                              onClick={() => onNavigateToRecord(p)}
                              className="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition flex items-center gap-1"
                              title="Abrir Prontuário"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>Prontuário</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedPatientForEdit(p);
                              setIsFormOpen(true);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            Editar
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

      {/* Patient Form Modal */}
      <PatientFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        existingPatient={selectedPatientForEdit}
        onSaveSuccess={refreshList}
      />

      {/* Patient Details Modal */}
      <PatientDetailsModal
        isOpen={Boolean(selectedPatientForDetails)}
        onClose={() => setSelectedPatientForDetails(null)}
        patient={selectedPatientForDetails}
        onNewAppointment={(p) => {
          if (onNavigateToSchedule) onNavigateToSchedule(p);
        }}
        onOpenRecord={(p) => {
          if (onNavigateToRecord) onNavigateToRecord(p);
        }}
      />

    </div>
  );
};
