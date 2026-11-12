import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  Sparkles, 
  Server,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SaasAdminLoginScreenProps {
  onSuccess?: () => void;
}

export const SaasAdminLoginScreen: React.FC<SaasAdminLoginScreenProps> = ({ onSuccess }) => {
  const { usersList, login } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const superAdminUser = usersList.find(u => u.role === 'super_admin') || usersList[0];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (emailInput.trim().toLowerCase() === superAdminUser.email.toLowerCase()) {
      login(superAdminUser.id);
      if (onSuccess) onSuccess();
    } else {
      setErrorMessage('Credenciais inválidas. Este painel é restrito à equipe de infraestrutura e Super Administradores da plataforma MedSync SaaS.');
    }
  };

  const handleQuickDemoLogin = () => {
    login(superAdminUser.id);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        
        {/* Super Admin Card */}
        <div className="bg-slate-900 rounded-3xl border border-purple-500/30 shadow-2xl overflow-hidden backdrop-blur-md">
          
          {/* Header */}
          <div className="p-8 pb-6 bg-gradient-to-b from-purple-900/40 to-transparent border-b border-slate-800 text-center space-y-3">
            <div className="inline-flex p-3.5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg ring-1 ring-purple-400/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                MedSync SaaS <span className="text-purple-400 font-semibold">Master Admin</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                painelclinica.beaverstraining.com.br
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-semibold border border-purple-400/30">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Ambiente de Controle Geral · Super Administrador</span>
            </div>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">E-mail de Super Administrador</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="admin@medsync.io"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Chave Mestra de Acesso</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>Autenticar no Painel Geral</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Access Button */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Demonstração Rápida (1 Clique)
                </span>
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              </div>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full text-left p-3 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/40 transition group flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white group-hover:text-purple-300">
                      Entrar como Super Administrador
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                    {superAdminUser.fullName} · {superAdminUser.email}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

          </div>

          {/* Footer Security Notice */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Auditoria estrita de acessos · Zero conhecimento de prontuários</span>
          </div>

        </div>

      </div>
    </div>
  );
};
