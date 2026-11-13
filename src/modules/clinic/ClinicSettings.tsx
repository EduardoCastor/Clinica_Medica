import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Check, 
  Save, 
  DoorClosed,
  Trash2,
  Globe,
  ExternalLink,
  Copy,
  Server,
  CheckCircle2
} from 'lucide-react';
import { useTenant } from '../../contexts/TenantContext';
import { Branch, Room, ClinicDomain } from '../../types';
import { StorageService } from '../../services/storage';

export const ClinicSettings: React.FC = () => {
  const { clinic, updateClinic, branches, refreshData } = useTenant();
  const [rooms, setRooms] = useState<Room[]>(StorageService.getRooms());
  const [domains, setDomains] = useState<ClinicDomain[]>(StorageService.getDomainsByClinic(clinic.id));
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const [legalName, setLegalName] = useState(clinic.legalName);
  const [tradeName, setTradeName] = useState(clinic.tradeName);
  const [documentNumber, setDocumentNumber] = useState(clinic.documentNumber);
  const [municipalRegistration, setMunicipalRegistration] = useState(clinic.municipalRegistration || '');
  const [email, setEmail] = useState(clinic.email);
  const [phone, setPhone] = useState(clinic.phone);
  const [whatsapp, setWhatsapp] = useState(clinic.whatsapp);
  const [institutionalBio, setInstitutionalBio] = useState(clinic.institutionalBio);

  const [isSaved, setIsSaved] = useState(false);

  // New Branch Modal State
  const [isNewBranchOpen, setIsNewBranchOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('RJ');
  const [branchStreet, setBranchStreet] = useState('');
  const [branchNumber, setBranchNumber] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchSharing, setBranchSharing] = useState<'model_a' | 'model_b'>('model_b');

  // New Room Modal State
  const [isNewRoomOpen, setIsNewRoomOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomBranchId, setRoomBranchId] = useState(branches[0]?.id || '');

  const handleSaveClinic = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinic({
      legalName,
      tradeName,
      documentNumber,
      municipalRegistration,
      email,
      phone,
      whatsapp,
      institutionalBio,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchCity.trim()) return;

    const newBranch: Branch = {
      id: `branch_${Date.now()}`,
      organizationId: 'org_mureb_01',
      clinicId: clinic.id,
      name: branchName,
      code: branchName.substring(0, 8).toUpperCase(),
      isHeadquarters: false,
      documentNumber: clinic.documentNumber || '55.937.470/0001-78',
      phone: branchPhone || clinic.phone,
      whatsapp: clinic.whatsapp,
      email: clinic.email,
      postalCode: '00000-000',
      street: branchStreet,
      number: branchNumber,
      neighborhood: 'Centro',
      city: branchCity,
      state: branchState,
      openingHours: {
        weekday: '08:00 às 18:00',
      },
      patientSharingMode: branchSharing,
      isActive: true,
    };

    StorageService.saveBranch(newBranch);
    refreshData();
    setIsNewBranchOpen(false);
    setBranchName('');
    setBranchCity('');
    setBranchStreet('');
    setBranchNumber('');
    setBranchPhone('');
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const newRoom: Room = {
      id: `room_${Date.now()}`,
      organizationId: 'org_mureb_01',
      branchId: roomBranchId,
      name: roomName,
      description: 'Consultório médico equipado para atendimento ambulatorial',
      color: '#0284c7',
      isActive: true,
    };

    StorageService.saveRoom(newRoom);
    setRooms(StorageService.getRooms());
    setIsNewRoomOpen(false);
    setRoomName('');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Configurações da Clínica & Rede de Filiais
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Identidade jurídica, informações de contato, unidades (matriz e filiais) e consultórios cadastrados.
        </p>
      </div>

      {/* Clinic Institutional Info Form */}
      <form onSubmit={handleSaveClinic} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900">Dados da Clínica Cliente</h2>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Salvo com Sucesso!' : 'Salvar Alterações'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Razão Social</label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Fantasia</label>
            <input
              type="text"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">CNPJ</label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Inscrição Municipal</label>
            <input
              type="text"
              value={municipalRegistration}
              onChange={(e) => setMunicipalRegistration(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Fixo</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Institucional</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail de Contato Principal</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Apresentação Institucional & Filosofia Clínica</label>
          <textarea
            rows={3}
            value={institutionalBio}
            onChange={(e) => setInstitutionalBio(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
          />
        </div>
      </form>

      {/* Branches Section (Multiunidade) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Filiais e Unidades de Atendimento ({branches.length})</h2>
            <p className="text-xs text-slate-500">Cada unidade possui endereço, horários e modo de compartilhamento de pacientes.</p>
          </div>
          <button
            onClick={() => setIsNewBranchOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Filial</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(b => (
            <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sky-600" />
                  <span>{b.name}</span>
                </span>
                {b.isHeadquarters ? (
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                    Matriz Principal
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                    Filial
                  </span>
                )}
              </div>

              <p className="text-slate-600">
                {b.street}, {b.number} {b.complement ? `(${b.complement})` : ''} · {b.neighborhood}, {b.city}/{b.state}
              </p>

              <div className="pt-1 text-[11px] text-slate-500 space-y-1">
                <p><strong>Telefone:</strong> {b.phone} · <strong>WhatsApp:</strong> {b.whatsapp}</p>
                <p><strong>Horários:</strong> {b.openingHours.weekday} {b.openingHours.saturday ? `| Sáb: ${b.openingHours.saturday}` : ''}</p>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-medium text-teal-800">
                    Regra: {b.patientSharingMode === 'model_b' ? 'Modelo B (Compartilhado)' : 'Modelo A (Exclusivo)'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rooms & Offices Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Salas & Consultórios Cadastrados ({rooms.length})</h2>
            <p className="text-xs text-slate-500">Recursos físicos vinculados às filiais para agendamento de consultas.</p>
          </div>
          <button
            onClick={() => setIsNewRoomOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Sala</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {rooms.map(r => {
            const br = branches.find(b => b.id === r.branchId);
            return (
              <div key={r.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="truncate">{r.name}</span>
                  <DoorClosed className="w-4 h-4 text-sky-600 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 truncate">{r.description}</p>
                <span className="inline-block text-[10px] text-slate-400 font-medium">
                  {br?.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domínios & Endereços Contratados (Dual-Domain Architecture) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Domínios & Endereços Exclusivos da Clínica
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada ambiente opera sob um endereço próprio com certificado SSL dedicado e separação total de segurança.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            Multi-Tenant Ativo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Painel do Sistema (app.*) */}
          {domains.find(d => d.domainType === 'app' || d.domainType === 'clinic_app') ? (
            (() => {
              const appDom = domains.find(d => d.domainType === 'app' || d.domainType === 'clinic_app')!;
              return (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800">
                      <Server className="w-4 h-4 text-sky-600" />
                      1. Painel de Gestão da Clínica
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {appDom.isVerified ? 'Verificado & Seguro' : 'Aguardando DNS'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 truncate">
                      https://{appDom.domain}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://${appDom.domain}`);
                        setCopiedDomain(appDom.domain);
                        setTimeout(() => setCopiedDomain(null), 2000);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                      title="Copiar URL"
                    >
                      {copiedDomain === appDom.domain ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Endereço exclusivo para médicos, recepcionistas, equipe administrativa e gestores. 
                    Exige autenticação rigorosa e dá acesso ao prontuário eletrônico e faturamento.
                  </p>
                </div>
              );
            })()
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 flex items-center justify-center">
              Nenhum subdomínio "app" configurado pelo Super Admin.
            </div>
          )}

          {/* Site Institucional (www.*) */}
          {domains.find(d => d.domainType === 'website' || d.domainType === 'clinic_website') ? (
            (() => {
              const webDom = domains.find(d => d.domainType === 'website' || d.domainType === 'clinic_website')!;
              return (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800">
                      <Globe className="w-4 h-4 text-teal-600" />
                      2. Site Institucional Público
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {webDom.isVerified ? 'Publicado' : 'Aguardando DNS'}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 truncate">
                      https://{webDom.domain}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://${webDom.domain}`);
                        setCopiedDomain(webDom.domain);
                        setTimeout(() => setCopiedDomain(null), 2000);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                      title="Copiar URL"
                    >
                      {copiedDomain === webDom.domain ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Endereço público acessado pelos pacientes. Exibe apresentação da clínica, especialidades, corpo clínico e formulário de agendamento online.
                  </p>
                </div>
              );
            })()
          ) : (
            <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 flex items-center justify-center">
              Nenhum domínio "www" configurado pelo Super Admin.
            </div>
          )}

        </div>
      </div>

      {/* New Branch Modal */}
      {isNewBranchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Filial</h3>
            <form onSubmit={handleAddBranch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Filial / Unidade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Unidade Búzios (Centro)"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    required
                    placeholder="Cabo Frio"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={branchState}
                    onChange={(e) => setBranchState(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Rua / Avenida</label>
                  <input
                    type="text"
                    placeholder="Av. Júlia Kubitschek"
                    value={branchStreet}
                    onChange={(e) => setBranchStreet(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Número</label>
                  <input
                    type="text"
                    placeholder="16"
                    value={branchNumber}
                    onChange={(e) => setBranchNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Telefone da Unidade</label>
                <input
                  type="text"
                  placeholder="(22) 9908-9122"
                  value={branchPhone}
                  onChange={(e) => setBranchPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Regra Padrão de Pacientes</label>
                <select
                  value={branchSharing}
                  onChange={(e) => setBranchSharing(e.target.value as 'model_a' | 'model_b')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="model_b">Modelo B: Compartilhado com outras filiais</option>
                  <option value="model_a">Modelo A: Exclusivo da filial</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewBranchOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  Salvar Filial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Room Modal */}
      {isNewRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Sala / Consultório</h3>
            <form onSubmit={handleAddRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Sala</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consultório 03 - Nutrição"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Filial de Alocação</label>
                <select
                  value={roomBranchId}
                  onChange={(e) => setRoomBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRoomOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  Salvar Sala
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
