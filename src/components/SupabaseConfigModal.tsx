import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Key, Globe, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { getSupabaseCredentials, saveSupabaseCredentials, clearSupabaseCredentials } from '../services/supabaseClient';
import { StorageService } from '../services/storage';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const currentCreds = getSupabaseCredentials();
  const [url, setUrl] = useState(currentCreds.url || '');
  const [anonKey, setAnonKey] = useState(currentCreds.anonKey || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) {
      alert('Por favor, informe a URL do projeto e a chave Anônima (anon key).');
      return;
    }
    saveSupabaseCredentials(url.trim(), anonKey.trim());
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleResetToDemo = () => {
    if (confirm('Deseja resetar os dados locais para a clínica modelo original (Dr. Newton Mureb)?')) {
      clearSupabaseCredentials();
      StorageService.resetAll();
      setUrl('');
      setAnonKey('');
      alert('Dados resetados com sucesso para a clínica modelo.');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conexão Backend & Supabase</h3>
              <p className="text-xs text-slate-400">PostgreSQL com RLS e persistência em nuvem</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 space-y-1">
            <p className="font-semibold">Modo Dual Ativo: Demonstração Completa + Supabase Ready</p>
            <p className="text-emerald-700">
              O MedSync já está 100% funcional com banco relacional reativo em memória/storage local. Para conectar à sua instância real do Supabase em nuvem, insira as credenciais abaixo.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Project URL (Supabase)</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-400" />
              <span>Anon / Public Key</span>
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Nunca utilize a chave de serviço (service_role) no frontend!
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
              <span>Migrações SQL prontas no projeto</span>
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              O script DDL completo com todas as tabelas e políticas de Row Level Security (RLS) está salvo em:
              <br />
              <code className="text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[10px]">
                /supabase/migrations/20261109000000_initial_schema.sql
              </code>
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDemo}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resetar Dados da Clínica</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition"
              >
                {isSaved ? 'Conectado!' : 'Salvar Conexão'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
