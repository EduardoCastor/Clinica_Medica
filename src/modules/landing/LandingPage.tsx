import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Check, 
  Building2, 
  Calendar, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Smartphone, 
  DollarSign, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { SaasPlan } from '../../types';
import { syncPlansFromSupabase } from '../../services/storage';

interface LandingPageProps {
  onAccessClinic: () => void;
  onAccessSuperAdmin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onAccessClinic, onAccessSuperAdmin }) => {
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState<boolean>(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Dynamically sync plans from Supabase on mount, window focus, and plan update events
  useEffect(() => {
    let isMounted = true;

    const loadPlans = () => {
      syncPlansFromSupabase()
        .then((remotePlans) => {
          if (isMounted && remotePlans?.length) {
            setPlans(remotePlans);
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingPlans(false);
        });
    };

    loadPlans();

    const handleFocus = () => {
      loadPlans();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadPlans();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('medsync-plans-updated', loadPlans);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('medsync-plans-updated', loadPlans);
    };
  }, []);

  // Sign up modal for new clinics
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlanCode, setSelectedPlanCode] = useState('trial');

  const handleRegisterClinic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicName.trim() || !email.trim()) return;

    // Simulate immediate onboarding
    alert(`Parabéns! O ambiente para "${clinicName}" foi provisionado com sucesso com 10 dias de Teste Grátis! Redirecionando para o painel...`);
    setIsRegisterModalOpen(false);
    onAccessClinic();
  };

  const faqs = [
    {
      q: 'Como funciona a arquitetura multiunidade (múltiplas filiais)?',
      a: 'O MedSync permite cadastrar matriz e filiais sob uma mesma gestão. Você pode optar pelo Modelo A (pacientes exclusivos de cada filial) ou Modelo B (pacientes compartilhados com prontuário unificado entre as unidades autorizadas).',
    },
    {
      q: 'O sistema cumpre com os requisitos da LGPD para dados sensíveis de saúde?',
      a: 'Sim, 100%. Utilizamos Row Level Security (RLS) no PostgreSQL/Supabase, trilha imutável de auditoria com autor/data/hora e controle estrito de RBAC onde recepcionistas e administradores do SaaS não acessam prontuários médicos.',
    },
    {
      q: 'Como funciona a integração com o WhatsApp Business?',
      a: 'Utilizamos a API Oficial do WhatsApp Business (Meta Cloud API). As mensagens são disparadas com modelos certificados e variáveis dinâmicas (nome do paciente, data, horário, filial e orientações).',
    },
    {
      q: 'Posso ter o site da minha clínica com domínio próprio?',
      a: 'Sim! Nosso gerador white-label disponibiliza 5 paletas de cores sofisticadas, apresentação do corpo clínico, especialidades e agendamento online público com suporte a domínio próprio (ex: www.suaclinica.com.br).',
    },
  ];

  return (
    <div className="bg-white text-slate-800 font-sans">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 px-6 bg-gradient-to-b from-slate-900 via-slate-900 to-sky-950 text-white">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-400/20 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Plataforma SaaS Multi-Tenant & Multiunidade</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
            A Solução Definitiva para Gestão de Clínicas Médicas e Redes de Filiais
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Agendamento avançado, prontuário eletrônico imutável, comunicação automatizada via WhatsApp Business e site institucional white-label com agendamento online.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setSelectedPlanCode('trial');
                setIsRegisterModalOpen(true);
              }}
              className="w-full sm:w-auto px-7 py-3.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-lg shadow-sky-600/30 transition flex items-center justify-center gap-2"
            >
              <span>Começar Teste Grátis de 10 Dias</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onAccessClinic}
              className="w-full sm:w-auto px-7 py-3.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl border border-white/20 transition text-center"
            >
              Acessar Demonstração ao Vivo
            </button>
          </div>

          <p className="text-xs text-slate-400 pt-2">
            Sem necessidade de cartão de crédito para testar · Cancelamento a qualquer momento
          </p>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Recursos de Alta Performance</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Construído para Clínicas Modernas que Desejam Escalar
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Arquitetura Multiunidade</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Controle matriz e filiais simultaneamente. Configure pacientes exclusivos por filial (Modelo A) ou compartilhados com histórico unificado (Modelo B).
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Agenda Inteligente & Encaixes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Visão diária, semanal e mensal com detecção de conflitos de horários em tempo real, gestão de salas e lista de espera automatizada para cancelamentos.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">WhatsApp API Oficial</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Disparo de lembretes e confirmações 48h e 24h antes da consulta com variáveis dinâmicas, reduzindo faltas e no-shows em até 65%.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Prontuário Imutável LGPD</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anamnese, evolução clínica, prescrições e pedidos de exames com assinatura digital e trilha de auditoria completa em conformidade com as normas do CFM.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Gestão Financeira & Recibos</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Contas a receber, emissão de recibos médicos para IRPF/reembolso, parcelamentos no cartão e fluxo de caixa consolidado por filial e profissional.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Sites White-Label & PWA</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Cada clínica possui seu site institucional próprio com 5 paletas de cores, agendamento online público e aplicativo instalável no celular (PWA).
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section (Section 4.1) */}
      <section id="planos" className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Planos e Preços Transparentes</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              Escolha o Plano Ideal para a Sua Estrutura
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Sem taxas escondidas. Cancele ou altere de plano quando quiser diretamente pelo painel.
            </p>

            {/* Monthly / Yearly Billing Toggle */}
            <div className="pt-3 flex items-center justify-center">
              <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 border border-slate-300/60 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mensal
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Anual</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                    billingCycle === 'yearly' ? 'bg-sky-500 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Até 20% OFF
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Plan Cards */}
          {isLoadingPlans && plans.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-white border border-slate-200 shadow-xs space-y-4 animate-pulse"
                >
                  <div className="h-5 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-8 w-28 bg-slate-200 rounded mt-4" />
                  <div className="h-px bg-slate-100 my-4" />
                  <div className="space-y-2.5">
                    <div className="h-3 w-4/5 bg-slate-100 rounded" />
                    <div className="h-3 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-5/6 bg-slate-100 rounded" />
                    <div className="h-3 w-2/3 bg-slate-100 rounded" />
                  </div>
                  <div className="h-10 w-full bg-slate-200 rounded-xl mt-6" />
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.filter(p => p.isActive !== false).map((plan) => {
              const isPopular = Boolean(plan.isPopular || plan.code === 'advanced');
              const isTrial = plan.code === 'trial' || plan.priceMonthly === 0;

              // Price calculations based on billingCycle
              let displayPrice = plan.priceMonthly;
              let priceSubtitle = '/mês';

              if (isTrial) {
                displayPrice = 0;
                priceSubtitle = `/${plan.trialDays || 10} dias grátis`;
              } else if (billingCycle === 'yearly') {
                displayPrice = plan.priceYearly > 0 ? plan.priceYearly / 12 : plan.priceMonthly;
                priceSubtitle = '/mês*';
              }

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition relative ${
                    isPopular
                      ? 'bg-slate-900 text-white shadow-xl border-2 border-sky-500'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                  }`}
                >
                  {isPopular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-[10px] font-bold text-white bg-sky-600 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Mais Escolhido</span>
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold">{plan.name}</h3>
                      <p className={`text-xs mt-1 leading-relaxed ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-semibold">R$</span>
                        <span className="text-3xl font-extrabold tabular-nums">
                          {displayPrice === 0 ? '0' : displayPrice.toFixed(2)}
                        </span>
                        <span className={`text-xs ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>
                          {priceSubtitle}
                        </span>
                      </div>
                      {!isTrial && billingCycle === 'yearly' && plan.priceYearly > 0 && (
                        <span className="text-[11px] text-slate-400 block mt-1 font-mono">
                          Cobrado R$ {plan.priceYearly.toFixed(2)} anualmente
                        </span>
                      )}
                    </div>

                    <div className={`h-px my-3 ${isPopular ? 'bg-slate-800' : 'bg-slate-100'}`} />

                    {/* Dynamic Features List */}
                    <ul className="space-y-2.5 text-xs">
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-sky-400' : 'text-sky-600'}`} />
                        <span>Até <strong>{plan.maxBranches}</strong> {plan.maxBranches === 1 ? 'filial/unidade' : 'filiais integradas'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-sky-400' : 'text-sky-600'}`} />
                        <span>Até <strong>{plan.maxUsers}</strong> usuários simultâneos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-sky-400' : 'text-sky-600'}`} />
                        <span>Até <strong>{plan.maxPatients}</strong> pacientes ativos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-sky-400' : 'text-sky-600'}`} />
                        <span>{plan.hasPatientSharing ? 'Compartilhamento Modelo A & B' : 'Modelo A Exclusivo'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-sky-400' : 'text-sky-600'}`} />
                        <span>{plan.hasCustomWebsite ? 'Site Institucional White-Label' : 'Site básico'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-sky-400' : 'text-sky-600'}`} />
                        <span>{plan.hasWhatsAppAutomation ? 'Automação WhatsApp API Oficial' : 'WhatsApp manual'}</span>
                      </li>
                      {plan.hasFinancialModule && (
                        <li className="flex items-center gap-2">
                          <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-sky-400' : 'text-sky-600'}`} />
                          <span>Módulo Financeiro & Livro Caixa</span>
                        </li>
                      )}
                      {plan.hasAdvancedReports && (
                        <li className="flex items-center gap-2">
                          <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-sky-400' : 'text-sky-600'}`} />
                          <span>Relatórios Gerenciais Avançados & BI</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => {
                        setSelectedPlanCode(plan.code);
                        setIsRegisterModalOpen(true);
                      }}
                      className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl transition shadow-xs ${
                        isPopular
                          ? 'bg-sky-500 hover:bg-sky-400 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isTrial ? 'Iniciar Teste Grátis' : `Contratar ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tire Suas Dúvidas</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Perguntas Frequentes</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <h3 className="font-bold text-sm text-slate-900">{f.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-white">MedSync SaaS para Gestão de Clínicas Médicas</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={onAccessSuperAdmin} className="hover:text-white transition">
              Painel Admin Geral
            </button>
            <span>·</span>
            <span>Termos de Uso</span>
            <span>·</span>
            <span>Política de Privacidade & LGPD</span>
          </div>
        </div>
      </footer>

      {/* Register / Onboarding Modal for New Clinics */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Cadastrar Nova Clínica no MedSync</h3>
              <p className="text-xs text-slate-500">
                Seu ambiente multiunidade será gerado imediatamente com 10 dias de avaliação gratuita.
              </p>
            </div>

            <form onSubmit={handleRegisterClinic} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Clínica</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clínica Saúde & Vida"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome do Responsável / Gestor</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Carlos Almeida"
                  value={responsibleName}
                  onChange={(e) => setResponsibleName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail Comercial</label>
                  <input
                    type="email"
                    required
                    placeholder="contato@clinica.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plano Inicial Selecionado</label>
                <select
                  value={selectedPlanCode}
                  onChange={(e) => setSelectedPlanCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-900"
                >
                  {plans.filter(p => p.isActive !== false).map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.name} {p.priceMonthly > 0 ? `(R$ ${p.priceMonthly.toFixed(2)}/mês)` : `(${p.trialDays || 10} dias de teste grátis)`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
                >
                  Criar Minha Clínica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
