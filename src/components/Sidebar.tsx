import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  FileText, 
  MessageSquare, 
  DollarSign, 
  UserCog, 
  Building2, 
  Globe,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClinicBrandLogo, CLINIC_OFFICIAL_DATA } from './ClinicBrandLogo';

export type ClinicTab = 
  | 'dashboard'
  | 'appointments'
  | 'patients'
  | 'medical_records'
  | 'communication'
  | 'financial'
  | 'users'
  | 'settings'
  | 'website_builder';

interface SidebarProps {
  activeTab: ClinicTab;
  onTabChange: (tab: ClinicTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { 
    canViewMedicalRecords, 
    canManageFinances, 
    canManageClinicSettings,
    currentRole 
  } = useAuth();

  const navItems: Array<{
    id: ClinicTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    visible: boolean;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      visible: true,
    },
    {
      id: 'appointments',
      label: 'Agenda de Consultas',
      icon: <CalendarDays className="w-4 h-4" />,
      badge: 'Prioritário',
      visible: true,
    },
    {
      id: 'patients',
      label: 'Gestão de Pacientes',
      icon: <Users className="w-4 h-4" />,
      visible: true,
    },
    {
      id: 'medical_records',
      label: 'Prontuário Eletrônico',
      icon: <FileText className="w-4 h-4" />,
      visible: canViewMedicalRecords,
    },
    {
      id: 'communication',
      label: 'Central WhatsApp',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: 'Automações',
      visible: true,
    },
    {
      id: 'financial',
      label: 'Módulo Financeiro',
      icon: <DollarSign className="w-4 h-4" />,
      visible: canManageFinances,
    },
    {
      id: 'users',
      label: 'Equipe & Permissões',
      icon: <UserCog className="w-4 h-4" />,
      visible: canManageClinicSettings,
    },
    {
      id: 'settings',
      label: 'Clínica & Filiais',
      icon: <Building2 className="w-4 h-4" />,
      visible: canManageClinicSettings,
    },
    {
      id: 'website_builder',
      label: 'Site Institucional',
      icon: <Globe className="w-4 h-4" />,
      badge: '5 Cores',
      visible: canManageClinicSettings,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 shrink-0 hidden md:flex flex-col justify-between min-h-[calc(100vh-4rem)] print:hidden">
      <div className="p-4 space-y-6">
        
        {/* Navigation Section */}
        <div>
          <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Operacional
          </div>
          <nav className="space-y-1">
            {navItems.filter(item => item.visible).map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-700 font-bold border border-sky-100 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-sky-600' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-medium text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Official Clinic Identity Card */}
        <div
          className="p-3.5 rounded-2xl border border-[#D4AF37]/35 text-xs space-y-2.5 shadow-sm"
          style={{
            backgroundImage:
              'linear-gradient(145deg, #1E2024 0%, #2A2D32 55%, #17191C 100%)',
          }}
        >
          <ClinicBrandLogo variant="dark" layout="horizontal" size="sm" />
          <div className="pt-2 border-t border-[#D4AF37]/20 text-[10px] text-slate-300 space-y-0.5 leading-snug">
            <p className="font-semibold text-[#E5C158]">{CLINIC_OFFICIAL_DATA.crm}</p>
            <p className="truncate">{CLINIC_OFFICIAL_DATA.specialty}</p>
            <p className="text-slate-400">
              {CLINIC_OFFICIAL_DATA.city} - {CLINIC_OFFICIAL_DATA.state} · CEP {CLINIC_OFFICIAL_DATA.cep}
            </p>
          </div>
        </div>
      </div>

      {/* Footer System Indicator */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-emerald-600" />
          <span>Sincronizado</span>
        </span>
        <span className="font-mono text-[10px] text-slate-400">v1.0-prod</span>
      </div>
    </aside>
  );
};
