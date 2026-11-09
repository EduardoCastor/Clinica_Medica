import React, { useState } from 'react';
import { 
  UserCog, 
  Stethoscope, 
  Plus, 
  Building2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Activity, 
  MapPin,
  Check
} from 'lucide-react';
import { Professional, UserProfile, UserRole } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';

export const TeamManagement: React.FC = () => {
  const { branches } = useTenant();
  const [professionals, setProfessionals] = useState<Professional[]>(StorageService.getProfessionals());
  const [users, setUsers] = useState<UserProfile[]>(StorageService.getUsers());
  const specialties = StorageService.getSpecialties();

  const [isNewProfOpen, setIsNewProfOpen] = useState(false);
  const [name, setName] = useState('');
  const [councilNumber, setCouncilNumber] = useState('');
  const [specialtyId, setSpecialtyId] = useState(specialties[0]?.id || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([branches[0]?.id || '']);

  const toggleBranch = (id: string) => {
    if (selectedBranchIds.includes(id)) {
      setSelectedBranchIds(selectedBranchIds.filter(b => b !== id));
    } else {
      setSelectedBranchIds([...selectedBranchIds, id]);
    }
  };

  const handleAddProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !councilNumber.trim()) return;

    const spec = specialties.find(s => s.id === specialtyId);

    const newProf: Professional = {
      id: `prof_${Date.now()}`,
      organizationId: 'org_mureb_01',
      fullName: name,
      councilNumber,
      specialtyId,
      specialtyName: spec?.name,
      branchIds: selectedBranchIds,
      phone,
      email,
      bio,
      color: '#0284c7',
      isActive: true,
    };

    StorageService.saveProfessional(newProf);
    setProfessionals(StorageService.getProfessionals());
    setIsNewProfOpen(false);
    setName('');
    setCouncilNumber('');
    setPhone('');
    setEmail('');
    setBio('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Equipe Clínica & Gestão de Acessos (RBAC)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controle de profissionais de saúde, conselhos de classe (CRM, CREFITO), especialidades e usuários do sistema.
          </p>
        </div>

        <button
          onClick={() => setIsNewProfOpen(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Profissional</span>
        </button>
      </div>

      {/* Professionals List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Corpo Clínico & Profissionais de Saúde ({professionals.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {professionals.map(p => {
            const spec = specialties.find(s => s.id === p.specialtyId);
            const profBranches = branches.filter(b => p.branchIds.includes(b.id));

            return (
              <div key={p.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 font-bold flex items-center justify-center">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{p.fullName}</h4>
                      <span className="text-xs text-sky-700 font-medium">{p.councilNumber}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Ativo
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Especialidade:</strong> {p.specialtyName || spec?.name}</p>
                  <p className="line-clamp-2 text-slate-500 italic text-[11px]">"{p.bio}"</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Filiais: {profBranches.map(b => b.name.split('(')[0].trim()).join(', ')}</span>
                  </div>
                  <span>{p.phone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Usuários e Papéis do Sistema (RBAC)
          </h3>
          <span className="text-xs text-slate-400">{users.length} usuários</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-4">Nome Completo</th>
                <th className="py-2.5 px-4">E-mail</th>
                <th className="py-2.5 px-4">Papel / Função</th>
                <th className="py-2.5 px-4">Filial Padrão</th>
                <th className="py-2.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{u.fullName}</td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-semibold text-[11px] bg-slate-100 text-slate-800 uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {branches.find(b => b.id === u.defaultBranchId)?.name || 'Todas as Filiais'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-emerald-700 font-medium">Ativo</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Professional Modal */}
      {isNewProfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cadastrar Profissional de Saúde</h3>
            <form onSubmit={handleAddProfessional} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Vasconcelos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registro no Conselho</label>
                  <input
                    type="text"
                    required
                    placeholder="CRM 12345/SP ou CREFITO"
                    value={councilNumber}
                    onChange={(e) => setCouncilNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Especialidade</label>
                  <select
                    value={specialtyId}
                    onChange={(e) => setSpecialtyId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {specialties.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.councilType})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone Celular</label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail Profissional</label>
                  <input
                    type="email"
                    placeholder="mariana@drnewtonmureb.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Filiais de Atendimento</label>
                <div className="flex flex-wrap gap-2">
                  {branches.map(b => (
                    <label key={b.id} className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBranchIds.includes(b.id)}
                        onChange={() => toggleBranch(b.id)}
                        className="rounded text-sky-600"
                      />
                      <span>{b.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mini Biografia / Apresentação</label>
                <textarea
                  rows={2}
                  placeholder="Formação, especializações e linha de cuidado."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProfOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  Salvar Profissional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
