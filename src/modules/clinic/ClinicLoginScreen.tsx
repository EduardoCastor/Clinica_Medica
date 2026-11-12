import React, { useState } from 'react';
import { 
  Building2, 
  Stethoscope, 
  Activity, 
  Users, 
  DollarSign, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  KeyRound,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

interface ClinicLoginScreenProps {
  onSuccess?: () => void;
}

export const ClinicLoginScreen: React.FC<ClinicLoginScreenProps> = ({ onSuccess }) => {
  const { clinic } = useTenant();
  const { usersList, login } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clinic staff users
  const staffUsers = usersList.filter(u => u.role !== 'super_admin' && u.role !== 'patient');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const found = staffUsers.find(u => u.email.toLowerCase() === emailInput.trim().toLowerCase());
    if (found) {
      login(found.id);
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage('Usuário não encontrado. Selecione um dos perfis autorizados da clínica abaixo para acesso demonstrativo.');
    }
  };

  const handleQuickLogin = (userId: string) => {
    login(userId);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-sky-50/40 to-teal-50/30">
      <div className="w-full max-w-xl space-y-6">
        
        {/* White-Label Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
          
          {/* Header with Clinic Branding */}
          <div className="p-8 pb-6 bg-gradient-to-b from-sky-50/70 to-white border-b border-slate-100 text-center space-y-3">
            <div className="inline-flex p-3.5 bg-gradient-to-tr from-sky-600 to-teal-600 text-white rounded-2xl shadow-md">
              <Activity className="w-8 h-8" />
            </div>
            
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {clinic.tradeName || 'Instituto Dr. Newton Mureb'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Portal Administrativo & Clínico · Sistema de Gestão Interna
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-800 text-[11px] font-semibold border border-sky-200">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Ambiente Exclusivo da Clínica · Multi-Tenant</span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Direct Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">E-mail Profissional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="dr.newton@drnewtonmureb.com.br"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Senha de Acesso</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access by Role */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Acesso Rápido de Demonstração (1 Clique)
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staffUsers.map((u) => {
                  const roleBadge = 
                    u.role === 'clinic_admin' ? { label: 'Admin Clínica', icon: <Building2 className="w-3 h-3 text-sky-600" /> } :
                    u.role === 'doctor' ? { label: 'Médico', icon: <Stethoscope className="w-3 h-3 text-blue-600" /> } :
                    u.role === 'physiotherapist' ? { label: 'Fisioterapeuta', icon: <Activity className="w-3 h-3 text-emerald-600" /> } :
                    u.role === 'receptionist' ? { label: 'Recepção', icon: <Users className="w-3 h-3 text-amber-600" /> } :
                    { label: 'Financeiro', icon: <DollarSign className="w-3 h-3 text-emerald-600" /> };

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u.id)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition group flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5">
                          {roleBadge.icon}
                          <span className="text-xs font-bold text-slate-800 group-hover:text-sky-700 truncate">
                            {u.fullName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                          {roleBadge.label} · {u.email}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer Security Notice */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Conformidade CFM nº 1.821/2007 · LGPD Dados Sensíveis · RLS PostgreSQL</span>
          </div>

        </div>

      </div>
    </div>
  );
};
