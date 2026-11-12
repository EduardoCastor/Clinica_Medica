import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Stethoscope, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  MessageSquare,
  ChevronDown,
  X,
  User
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { WebsiteConfig, ColorPalette, Appointment } from '../../types';
import { PatientPortal } from '../patient-portal/PatientPortal';

interface ClinicWebsitePreviewProps {
  onBackToPanel?: () => void;
  isProduction?: boolean;
}

export const ClinicWebsitePreview: React.FC<ClinicWebsitePreviewProps> = ({ onBackToPanel, isProduction = false }) => {
  const [config, setConfig] = useState<WebsiteConfig>(StorageService.getWebsite());
  const [isPatientPortalOpen, setIsPatientPortalOpen] = useState(false);
  const clinic = StorageService.getClinic();
  const branches = StorageService.getBranches();
  const professionals = StorageService.getProfessionals();
  const services = StorageService.getServices();
  const specialties = StorageService.getSpecialties();

  // Online Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id || '');
  const [selectedProfessionalId, setSelectedProfessionalId] = useState(professionals[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState('2026-11-10');
  const [selectedTime, setSelectedTime] = useState('14:00');
  
  // Patient Form
  const [patientName, setPatientName] = useState('');
  const [patientCpf, setPatientCpf] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Theme styling definitions for the 5 palettes
  const getThemeStyles = (palette: ColorPalette) => {
    switch (palette) {
      case 'verde-saude':
        return {
          primary: 'bg-emerald-700 hover:bg-emerald-800 text-white',
          primaryText: 'text-emerald-800',
          primaryBorder: 'border-emerald-600',
          accentBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          heroGradient: 'from-emerald-950 via-slate-900 to-emerald-900',
          lightBg: 'bg-[#f0fdf4]',
          cardBorder: 'border-emerald-100',
          headerBg: 'bg-white text-emerald-950',
          badge: 'bg-emerald-100 text-emerald-800',
        };
      case 'elegancia':
        return {
          primary: 'bg-amber-700 hover:bg-amber-800 text-white',
          primaryText: 'text-amber-800',
          primaryBorder: 'border-amber-600',
          accentBg: 'bg-amber-50 text-amber-900 border-amber-200',
          heroGradient: 'from-stone-950 via-neutral-900 to-stone-900',
          lightBg: 'bg-[#fffbeb]',
          cardBorder: 'border-amber-200/60',
          headerBg: 'bg-stone-900 text-white',
          badge: 'bg-amber-100 text-amber-900',
        };
      case 'minimalista':
        return {
          primary: 'bg-slate-900 hover:bg-slate-800 text-white',
          primaryText: 'text-slate-900',
          primaryBorder: 'border-slate-800',
          accentBg: 'bg-slate-100 text-slate-800 border-slate-300',
          heroGradient: 'from-slate-900 via-slate-800 to-slate-900',
          lightBg: 'bg-slate-50',
          cardBorder: 'border-slate-200',
          headerBg: 'bg-white text-slate-900',
          badge: 'bg-slate-200 text-slate-800',
        };
      case 'natural':
        return {
          primary: 'bg-lime-800 hover:bg-lime-900 text-white',
          primaryText: 'text-lime-900',
          primaryBorder: 'border-lime-700',
          accentBg: 'bg-lime-50 text-lime-900 border-lime-200',
          heroGradient: 'from-lime-950 via-stone-900 to-stone-950',
          lightBg: 'bg-[#fcfbf7]',
          cardBorder: 'border-lime-200',
          headerBg: 'bg-[#faf9f5] text-stone-900',
          badge: 'bg-lime-100 text-lime-900',
        };
      case 'azul-clinico':
      default:
        return {
          primary: 'bg-sky-600 hover:bg-sky-700 text-white',
          primaryText: 'text-sky-700',
          primaryBorder: 'border-sky-500',
          accentBg: 'bg-sky-50 text-sky-800 border-sky-200',
          heroGradient: 'from-slate-950 via-slate-900 to-sky-950',
          lightBg: 'bg-slate-50',
          cardBorder: 'border-slate-200',
          headerBg: 'bg-white text-slate-900',
          badge: 'bg-sky-100 text-sky-800',
        };
    }
  };

  const theme = getThemeStyles(config.paletteName);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !patientCpf.trim()) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const professional = professionals.find(p => p.id === selectedProfessionalId);
    const service = services.find(s => s.id === selectedServiceId);
    const branch = branches.find(b => b.id === selectedBranchId);

    // Create or find patient
    const newApt: Appointment = {
      id: `apt_online_${Date.now()}`,
      organizationId: 'org_mureb_01',
      branchId: selectedBranchId,
      patientId: `pat_online_${Date.now()}`,
      patientName,
      patientPhone,
      professionalId: selectedProfessionalId,
      professionalName: professional?.fullName || 'Dr. Newton Mureb',
      serviceId: selectedServiceId,
      serviceName: service?.name || 'Consulta Médica',
      startTime: `${selectedDate}T${selectedTime}:00.000Z`,
      endTime: `${selectedDate}T${selectedTime === '14:00' ? '15:00' : '11:00'}:00.000Z`,
      status: 'scheduled',
      appointmentType: 'presencial',
      notes: `Solicitação realizada via Site Institucional (${config.paletteName}). Telefone: ${patientPhone}`,
      createdAt: new Date().toISOString(),
    };

    StorageService.saveAppointment(newApt);

    // Also trigger automated WhatsApp welcome/confirmation message
    StorageService.sendMessage({
      organizationId: 'org_mureb_01',
      branchId: selectedBranchId,
      patientName,
      recipientPhone: patientPhone,
      channel: 'whatsapp',
      direction: 'outbound',
      content: `Olá, ${patientName}! Sua solicitação de consulta com ${professional?.fullName} para ${selectedDate} às ${selectedTime} na ${branch?.name} foi recebida com sucesso! Em breve nossa recepção entrará em contato.`,
      status: 'delivered',
    });

    setBookingSuccess(true);
  };

  const availableHours = ['08:30', '10:00', '11:30', '14:00', '15:30', '17:00'];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans">
      
      {/* Floating Control Bar for Demo / Testing Palette (Only visible in editor preview) */}
      {!isProduction && onBackToPanel && (
        <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 sticky top-16 z-30">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sky-400">Site Institucional White-Label:</span>
            <span className="text-slate-300">{config.title}</span>
            <span className="text-slate-500">({config.customDomain})</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Paleta Ativa:</span>
              <select
                value={config.paletteName}
                onChange={(e) => {
                  const next = { ...config, paletteName: e.target.value as ColorPalette };
                  setConfig(next);
                  StorageService.updateWebsite(next);
                }}
                className="bg-slate-800 text-white px-2.5 py-1 rounded-md border border-slate-700 text-xs focus:ring-1 focus:ring-sky-500 font-medium"
              >
                <option value="azul-clinico">1. Azul-Clínico</option>
                <option value="verde-saude">2. Verde-Saúde</option>
                <option value="elegancia">3. Elegância</option>
                <option value="minimalista">4. Minimalista</option>
                <option value="natural">5. Natural</option>
              </select>
            </div>

            <button
              onClick={onBackToPanel}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md transition font-medium"
            >
              Voltar ao Painel
            </button>
          </div>
        </div>
      )}

      {/* Website Top Bar */}
      <header className={`border-b border-slate-200/80 sticky ${!isProduction && onBackToPanel ? 'top-26' : 'top-0'} z-20 backdrop-blur-md ${theme.headerBg}`}>
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
          
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-xs ${theme.primary}`}>
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight block leading-tight">
                Dr. Newton Mureb
              </span>
              <span className="text-[10px] text-slate-500 block">
                Medicina Ortomolecular & Saúde Metabólica
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#filosofia" className="hover:text-slate-900 transition whitespace-nowrap">Filosofia Clínica</a>
            <a href="#especialidades" className="hover:text-slate-900 transition whitespace-nowrap">Áreas de Atuação</a>
            <a href="#corpo-clinico" className="hover:text-slate-900 transition whitespace-nowrap">Corpo Clínico</a>
            <a href="#unidades" className="hover:text-slate-900 transition whitespace-nowrap">Unidades SP & RJ</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsPatientPortalOpen(true)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 rounded-xl transition flex items-center gap-1.5 bg-white shadow-2xs hover:bg-slate-50"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Portal do Paciente</span>
            </button>

            <button
              onClick={() => {
                setBookingSuccess(false);
                setBookingStep(1);
                setIsBookingOpen(true);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl shadow-xs transition whitespace-nowrap flex items-center gap-1.5 ${theme.primary}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Consulta</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className={`relative text-white py-24 sm:py-32 px-6 bg-gradient-to-b ${theme.heroGradient} overflow-hidden`}>
        <div className="max-w-5xl mx-auto space-y-6 relative z-10 text-center sm:text-left">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white backdrop-blur-xs border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>São Paulo (Jardins) & Rio de Janeiro (Ipanema)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
            {config.heroHeadline}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {config.heroSubheadline}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                setBookingSuccess(false);
                setBookingStep(1);
                setIsBookingOpen(true);
              }}
              className={`w-full sm:w-auto px-6 py-3.5 text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 ${theme.primary}`}
            >
              <Calendar className="w-4 h-4" />
              <span>Solicitar Agendamento Online</span>
            </button>
            <a
              href="#filosofia"
              className="w-full sm:w-auto px-6 py-3.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 rounded-xl transition border border-white/20 text-center"
            >
              Conhecer Nossa Abordagem
            </a>
          </div>

        </div>
      </section>

      {/* Filosofia & Abordagem Médica (Requisito 14) */}
      <section id="filosofia" className="py-20 px-6 max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Medicina Ortomolecular com Base Científica
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Promover a saúde celular integral, e não apenas remediar sintomas.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {config.aboutText}
          </p>
        </div>

        {/* Pillars Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${theme.primary}`}>
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Bioquímica e Metabologia</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mapeamento de desbalanços hormonais, estresse oxidativo celular e carências nutricionais por meio de exames laboratoriais especializados.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${theme.primary}`}>
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Lipedema & Saúde Vascular</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diagnóstico e manejo conservador do tecido adiposo doente, unindo modulação biológica anti-inflamatória e fisioterapia descongestiva especializada.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${theme.primary}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Combate à Sarcopenia</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Preservação rigorosa da massa muscular magra como órgão endócrino vital para a longevidade ativa, mobilidade e taxa metabólica.
            </p>
          </div>
        </div>

        {/* Ethical Transparency Box */}
        <div className="p-6 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
          <h4 className="font-bold text-sm text-amber-950 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Compromisso Ético e Responsabilidade Médica (CFM)</span>
          </h4>
          <p className="leading-relaxed text-amber-900">
            {config.medicalApproach}
          </p>
        </div>
      </section>

      {/* Corpo Clínico Section */}
      <section id="corpo-clinico" className="py-20 px-6 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Especialistas Dedicados</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Nosso Corpo Clínico</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {professionals.map(p => (
              <div key={p.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white font-extrabold text-lg flex items-center justify-center shadow-xs">
                    {p.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{p.fullName}</h3>
                    <p className="text-xs font-semibold text-sky-700">{p.councilNumber}</p>
                    <p className="text-[11px] text-slate-500">{p.specialtyName}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {p.bio}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Atendimento: São Paulo & Rio de Janeiro</span>
                  <button
                    onClick={() => {
                      setSelectedProfessionalId(p.id);
                      setIsBookingOpen(true);
                    }}
                    className="font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                  >
                    <span>Agendar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Unidades & Filiais */}
      <section id="unidades" className="py-20 px-6 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Estrutura e Localização</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Nossas Unidades</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {branches.map(b => (
            <div key={b.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900">{b.name}</h3>
                {b.isHeadquarters && (
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    Matriz
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <span>{b.street}, {b.number} {b.complement ? `(${b.complement})` : ''} - {b.neighborhood}, {b.city}/{b.state}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{b.phone} · WhatsApp: {b.whatsapp}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{b.openingHours.weekday}</span>
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedBranchId(b.id);
                    setIsBookingOpen(true);
                  }}
                  className={`w-full py-2 text-xs font-semibold rounded-xl text-center transition ${theme.primary}`}
                >
                  Agendar Nesta Unidade
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400">
          <div>
            <strong className="text-white block">{clinic.tradeName}</strong>
            <p className="text-[11px] mt-1">CNPJ: {clinic.documentNumber} · Resp. Técnico: Dr. Newton Mureb (CRM 84.320/SP)</p>
          </div>
          <div className="text-center sm:text-right text-[11px] space-y-1">
            <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
            <p>Plataforma White-Label mantida por MedSync SaaS Clínico.</p>
          </div>
        </div>
      </footer>

      {/* Interactive Online Booking Modal (Section 10.1) */}
      {isBookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Solicitar Agendamento Online</h3>
                <p className="text-xs text-slate-400">Escolha a filial, profissional e horário desejado</p>
              </div>
              <button 
                onClick={() => setIsBookingOpen(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-slate-900">Agendamento Solicitado com Sucesso!</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Sua consulta foi registrada no sistema da clínica. Um comprovante e instruções de atendimento foram enviados para seu WhatsApp <strong>{patientPhone}</strong>.
                </p>
                <button
                  onClick={() => setIsBookingOpen(false)}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="p-6 space-y-4 text-xs">
                
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">1. Escolha a Unidade / Filial</label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name} ({b.city}/{b.state})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">2. Especialista</label>
                    <select
                      value={selectedProfessionalId}
                      onChange={(e) => setSelectedProfessionalId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      {professionals.map(pr => (
                        <option key={pr.id} value={pr.id}>{pr.fullName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">3. Procedimento</label>
                    <select
                      value={selectedServiceId}
                      onChange={(e) => setSelectedServiceId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Data Desejada</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Horário Disponível</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium"
                    >
                      {availableHours.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <span className="font-bold text-slate-800 block">Seus Dados de Contato</span>
                  
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mariana Vasconcelos"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">CPF</label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={patientCpf}
                        onChange={(e) => setPatientCpf(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                      <input
                        type="text"
                        required
                        placeholder="(11) 98765-4321"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 font-bold rounded-lg shadow-sm transition ${theme.primary}`}
                  >
                    Confirmar Agendamento
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

      {/* Patient Portal Modal */}
      {isPatientPortalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Portal do Paciente · {clinic.tradeName}
                </span>
              </div>
              <button
                onClick={() => setIsPatientPortalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Fechar portal do paciente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
              <PatientPortal />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
