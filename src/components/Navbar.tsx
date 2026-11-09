import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Database, 
  MapPin, 
  ChevronDown, 
  ShieldCheck, 
  Stethoscope, 
  Activity, 
  Users, 
  DollarSign, 
  User, 
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';
import { PWAInstallButton } from './PWAInstallButton';
import { UserRole } from '../types';

export type AppViewMode = 
  | 'saas_landing'     // Site comercial da plataforma
  | 'saas_admin'       // Painel do Super Admin SaaS
  | 'clinic_panel'     // Painel operacional da clínica
  | 'clinic_website'   // Site institucional white-label da clínica
  | 'patient_portal';  // Portal do paciente

interface NavbarProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  onOpenSupabaseConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenSupabaseConfig,
}) => {
  const { currentUser, currentRole, switchUser, usersList } = useAuth();
  const { branches, activeBranchId, setActiveBranchId } = useTenant();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const roleLabelMap: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    super_admin: { label: 'Admin SaaS', icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
    clinic_admin: { label: 'Admin Clínica', icon: <Building2 className="w-3.5 h-3.5 text-sky-600" />, color: 'bg-sky-50 text-sky-700 border-sky-200' },
    branch_admin: { label: 'Admin Filial', icon: <MapPin className="w-3.5 h-3.5 text-teal-600" />, color: 'bg-teal-50 text-teal-700 border-teal-200' },
    doctor: { label: 'Médico', icon: <Stethoscope className="w-3.5 h-3.5 text-blue-600" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    physiotherapist: { label: 'Fisioterapeuta', icon: <Activity className="w-3.5 h-3.5 text-emerald-600" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    receptionist: { label: 'Recepção', icon: <Users className="w-3.5 h-3.5 text-amber-600" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
    financial: { label: 'Financeiro', icon: <DollarSign className="w-3.5 h-3.5 text-emerald-600" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    patient: { label: 'Paciente', icon: <User className="w-3.5 h-3.5 text-slate-600" />, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const activeBranchName = activeBranchId === 'all'
    ? 'Todas as Filiais'
    : branches.find(b => b.id === activeBranchId)?.name || 'Todas as Filiais';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-6 h-16">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => onViewChange('clinic_panel')} 
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
                MedSync <span className="text-sky-600 font-semibold">SaaS</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block">
                Clínicas & Multiunidades
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links / View Switcher */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          <button
            onClick={() => onViewChange('clinic_panel')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'clinic_panel'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Painel da Clínica
          </button>
          
          <button
            onClick={() => onViewChange('clinic_website')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              currentView === 'clinic_website'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Site da Clínica (White-Label)</span>
          </button>

          <button
            onClick={() => onViewChange('patient_portal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'patient_portal'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Portal do Paciente
          </button>

          <button
            onClick={() => onViewChange('saas_landing')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'saas_landing'
                ? 'bg-white text-sky-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Site Comercial SaaS
          </button>

          <button
            onClick={() => onViewChange('saas_admin')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentView === 'saas_admin'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin Geral SaaS
          </button>
        </nav>

        {/* Zone 3: Interactive Controls (Branch, Role Switcher, Supabase, PWA) */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Filial Selector (Only inside clinic panel) */}
          {currentView === 'clinic_panel' && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowBranchDropdown(!showBranchDropdown);
                  setShowRoleDropdown(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                title="Filial Ativa"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-600" />
                <span className="max-w-[120px] truncate">{activeBranchName}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showBranchDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Alternar Filial / Unidade
                  </div>
                  <button
                    onClick={() => {
                      setActiveBranchId('all');
                      setShowBranchDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      activeBranchId === 'all' ? 'text-sky-700 font-bold bg-sky-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>Todas as Filiais (Visão Geral)</span>
                    {activeBranchId === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />}
                  </button>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveBranchId(b.id);
                        setShowBranchDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        activeBranchId === b.id ? 'text-sky-700 font-bold bg-sky-50/50' : 'text-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <span className="block font-medium truncate">{b.name}</span>
                        <span className="block text-[10px] text-slate-400">
                          {b.isHeadquarters ? 'Matriz' : 'Filial'} · {b.city}/{b.state}
                        </span>
                      </div>
                      {activeBranchId === b.id && <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Role Switcher (Simulador de Perfis RBAC) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowBranchDropdown(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${roleLabelMap[currentRole]?.color || 'bg-slate-100 text-slate-700'}`}
              title="Alternar Perfil para Teste RBAC"
            >
              {roleLabelMap[currentRole]?.icon}
              <span className="max-w-[100px] truncate">{currentUser.fullName.split(' ')[0]} ({roleLabelMap[currentRole]?.label})</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Simular Usuário / Perfil (RBAC)</span>
                  <UserCheck className="w-3 h-3 text-sky-600" />
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {usersList.map((u) => {
                    const roleInfo = roleLabelMap[u.role] || { label: u.role, icon: null, color: '' };
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowRoleDropdown(false);
                          if (u.role === 'patient') {
                            onViewChange('patient_portal');
                          } else if (u.role === 'super_admin') {
                            onViewChange('saas_admin');
                          }
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition ${
                          isSelected ? 'bg-sky-50/70 font-semibold text-sky-900' : 'text-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            {roleInfo.icon}
                            <span className="font-medium text-slate-900 truncate">{u.fullName}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {roleInfo.label} · {u.email}
                          </span>
                        </div>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Database / Supabase Config Button */}
          <button
            onClick={onOpenSupabaseConfig}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Configurar Conexão Supabase / PostgreSQL"
          >
            <Database className="w-4 h-4 text-emerald-600" />
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />
        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="lg:hidden flex items-center gap-2 px-4 py-2 border-t border-slate-200 overflow-x-auto bg-slate-50 text-xs">
        <button
          onClick={() => onViewChange('clinic_panel')}
          className={`px-3 py-1 font-medium rounded-md shrink-0 ${currentView === 'clinic_panel' ? 'bg-sky-600 text-white' : 'text-slate-700'}`}
        >
          Painel da Clínica
        </button>
        <button
          onClick={() => onViewChange('clinic_website')}
          className={`px-3 py-1 font-medium rounded-md shrink-0 ${currentView === 'clinic_website' ? 'bg-sky-600 text-white' : 'text-slate-700'}`}
        >
          Site da Clínica
        </button>
        <button
          onClick={() => onViewChange('patient_portal')}
          className={`px-3 py-1 font-medium rounded-md shrink-0 ${currentView === 'patient_portal' ? 'bg-sky-600 text-white' : 'text-slate-700'}`}
        >
          Portal do Paciente
        </button>
        <button
          onClick={() => onViewChange('saas_landing')}
          className={`px-3 py-1 font-medium rounded-md shrink-0 ${currentView === 'saas_landing' ? 'bg-sky-600 text-white' : 'text-slate-700'}`}
        >
          SaaS Comercial
        </button>
        <button
          onClick={() => onViewChange('saas_admin')}
          className={`px-3 py-1 font-medium rounded-md shrink-0 ${currentView === 'saas_admin' ? 'bg-sky-600 text-white' : 'text-slate-700'}`}
        >
          Admin Geral
        </button>
      </div>
    </header>
  );
};
