import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export const CLINIC_OFFICIAL_DATA = {
  legalName: 'NEWTON MUREB CLINICA MEDICA LTDA',
  tradeName: 'NEWTON MUREB CLINICA MEDICA',
  displayTitle: 'Dr. Newton Mureb',
  cnpj: '55.937.470/0001-78',
  openedAt: '15/07/2024',
  companySize: 'ME',
  mainCnae: '86.30-5-01 - Atividade médica ambulatorial com recursos para realização de procedimentos cirúrgicos',
  secondaryCnaes: '86.30-5-03 (Consultas) · 86.40-2-99 (Complementação diagnóstica e terapêutica) · 96.02-5-02 (Estética)',
  street: 'Av. Júlia Kubitschek',
  number: '16',
  complement: 'Sala 307 A - Edif. Premier Center',
  neighborhood: 'Centro',
  city: 'Cabo Frio',
  state: 'RJ',
  cep: '28.905-000',
  phone: '(22) 9908-9122',
  whatsapp: '(22) 99908-9122',
  email: 'roseneco1@gmail.com',
  physicianName: 'Dr. Newton Mureb',
  crm: 'CRM/RJ 52-444985',
  cremerjNumber: '444985',
  specialty: 'Clínica Médica, Endocrinologia e Metabologia',
  bio: 'Com mais de 40 anos de experiência médica, dediquei minha vida à busca incansável pela saúde, bem-estar e longevidade dos meus pacientes. Nossa missão é compreender, confortar e tratar não apenas sintomas, mas as causas subjacentes, com acompanhamento semanal individualizado e assessoria próxima.',
};

const LOGO_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="240" height="160">
  <defs>
    <linearGradient id="marbleBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1E2024"/>
      <stop offset="50%" stop-color="#2A2D32"/>
      <stop offset="100%" stop-color="#17191C"/>
    </linearGradient>
    <linearGradient id="goldLeaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E5C158"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#A68224"/>
    </linearGradient>
  </defs>
  <rect width="240" height="160" rx="16" fill="url(#marbleBg)"/>
  <rect x="6" y="6" width="228" height="148" rx="12" fill="none" stroke="#D4AF37" stroke-opacity="0.35" stroke-width="1"/>
  <text x="106" y="88" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="600" fill="url(#goldLeaf)" letter-spacing="-4">N</text>
  <text x="136" y="88" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" font-weight="600" fill="url(#goldLeaf)" letter-spacing="-4">M</text>
  <line x1="48" y1="104" x2="192" y2="104" stroke="url(#goldLeaf)" stroke-width="1.5" stroke-opacity="0.85"/>
  <text x="120" y="128" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="16" font-weight="500" fill="#E5C158" letter-spacing="1.2">Dr. Newton Mureb</text>
</svg>`;

export const CLINIC_LOGO_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(LOGO_SVG_RAW)}`;

export interface ClinicBrandLogoProps {
  variant?: 'dark' | 'light' | 'print';
  size?: 'sm' | 'md' | 'lg';
  layout?: 'stacked' | 'horizontal';
  showSubtitle?: boolean;
  subtitle?: string;
  className?: string;
}

export const ClinicBrandLogo: React.FC<ClinicBrandLogoProps> = ({
  variant = 'dark',
  size = 'md',
  layout = 'stacked',
  showSubtitle = false,
  subtitle = CLINIC_OFFICIAL_DATA.specialty,
  className = '',
}) => {
  const isDark = variant === 'dark';

  const dimensions = {
    sm: { box: 'px-3 py-2', monogram: 'text-xl', lineW: 'w-14', title: 'text-xs', badgeW: 'w-11 h-11', badgeText: 'text-base' },
    md: { box: 'px-5 py-3.5', monogram: 'text-3xl', lineW: 'w-24', title: 'text-sm', badgeW: 'w-12 h-12', badgeText: 'text-lg' },
    lg: { box: 'px-7 py-5', monogram: 'text-4xl', lineW: 'w-32', title: 'text-lg', badgeW: 'w-16 h-16', badgeText: 'text-2xl' },
  }[size];

  const serifStyle: React.CSSProperties = {
    fontFamily: "'Cormorant Garamond', 'Playfair Display', Georgia, serif",
  };

  if (layout === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 ${className}`}>
        {/* Marbled Graphite & Gold Monogram Emblem */}
        <div
          className={`${dimensions.badgeW} rounded-xl relative overflow-hidden shrink-0 flex flex-col items-center justify-center border shadow-xs ${
            isDark
              ? 'border-[#D4AF37]/45 bg-[#1E2024]'
              : 'border-[#9A7B2C]/50 bg-[#23262A]'
          }`}
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 55%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.12) 0%, transparent 50%), linear-gradient(135deg, #1E2024 0%, #2A2D32 55%, #17191C 100%)',
          }}
        >
          <span
            style={serifStyle}
            className={`${dimensions.badgeText} font-semibold leading-none tracking-[-0.10em] text-[#E5C158] select-none`}
          >
            NM
          </span>
          <span className="w-7 h-[1px] bg-[#D4AF37]/80 mt-1" />
        </div>

        <div className="min-w-0">
          <span
            style={serifStyle}
            className={`block font-semibold tracking-wide leading-tight truncate ${
              size === 'lg' ? 'text-xl' : size === 'sm' ? 'text-base' : 'text-lg'
            } ${isDark ? 'text-[#E5C158]' : 'text-[#1E2024]'}`}
          >
            Dr. Newton Mureb
          </span>
          {showSubtitle && (
            <span
              className={`block text-[10px] tracking-wider uppercase truncate mt-0.5 ${
                isDark ? 'text-slate-300' : 'text-[#9A7B2C] font-semibold'
              }`}
            >
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex flex-col items-center justify-center rounded-2xl relative overflow-hidden ${dimensions.box} ${
        isDark
          ? 'border border-[#D4AF37]/40 shadow-md text-[#E5C158]'
          : 'border border-[#9A7B2C]/35 bg-white text-[#1E2024]'
      } ${className}`}
      style={
        isDark
          ? {
              backgroundImage:
                'radial-gradient(circle at 25% 20%, rgba(255,255,255,0.07) 0%, transparent 55%), radial-gradient(circle at 75% 85%, rgba(212,175,55,0.14) 0%, transparent 50%), linear-gradient(145deg, #1E2024 0%, #2A2D32 50%, #17191C 100%)',
            }
          : undefined
      }
    >
      {/* Subtle inner frame */}
      {isDark && (
        <div className="absolute inset-1.5 rounded-xl border border-[#D4AF37]/20 pointer-events-none" />
      )}

      {/* Centered Monogram NM */}
      <div
        style={serifStyle}
        className={`${dimensions.monogram} font-semibold tracking-[-0.10em] leading-none select-none relative z-10 ${
          isDark ? 'text-[#E5C158]' : 'text-[#1E2024]'
        }`}
      >
        NM
      </div>

      {/* Straight Horizontal Rule */}
      <div
        className={`${dimensions.lineW} h-[1.5px] my-1.5 relative z-10 ${
          isDark ? 'bg-[#D4AF37]/85' : 'bg-[#9A7B2C]'
        }`}
      />

      {/* Dr. Newton Mureb Serif Title */}
      <div
        style={serifStyle}
        className={`${dimensions.title} font-semibold tracking-[0.06em] leading-tight relative z-10 ${
          isDark ? 'text-[#E5C158]' : 'text-[#1E2024]'
        }`}
      >
        Dr. Newton Mureb
      </div>

      {showSubtitle && (
        <span
          className={`text-[10px] tracking-widest uppercase mt-1 relative z-10 ${
            isDark ? 'text-slate-300' : 'text-[#9A7B2C] font-semibold'
          }`}
        >
          {subtitle}
        </span>
      )}
    </div>
  );
};

interface MedicalDocumentHeaderProps {
  badgeTitle: string;
  badgeSubtitle?: string;
  badgeTone?: 'dark' | 'sky' | 'gold';
}

export const MedicalDocumentHeader: React.FC<MedicalDocumentHeaderProps> = ({
  badgeTitle,
  badgeSubtitle,
  badgeTone = 'dark',
}) => {
  const badgeClasses =
    badgeTone === 'sky'
      ? 'bg-sky-800 text-white'
      : badgeTone === 'gold'
      ? 'bg-[#23262A] text-[#E5C158] border border-[#D4AF37]/50'
      : 'bg-[#1E2024] text-[#E5C158]';

  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-[#23262A] pb-4">
      <div className="flex items-start gap-3.5">
        <ClinicBrandLogo variant="print" layout="horizontal" size="sm" className="shrink-0" />
        <div className="border-l border-slate-200 pl-3.5 space-y-0.5">
          <h1 className="text-xs font-extrabold tracking-tight text-slate-900 uppercase">
            {CLINIC_OFFICIAL_DATA.legalName}
          </h1>
          <p className="text-[11px] font-semibold text-[#9A7B2C]">
            CNPJ: {CLINIC_OFFICIAL_DATA.cnpj} · {CLINIC_OFFICIAL_DATA.specialty}
          </p>
          <p className="text-[10px] text-slate-600 leading-snug">
            {CLINIC_OFFICIAL_DATA.street}, {CLINIC_OFFICIAL_DATA.number}, {CLINIC_OFFICIAL_DATA.complement} · {CLINIC_OFFICIAL_DATA.neighborhood}, {CLINIC_OFFICIAL_DATA.city} - {CLINIC_OFFICIAL_DATA.state} · CEP: {CLINIC_OFFICIAL_DATA.cep}
          </p>
          <p className="text-[10px] text-slate-500">
            Tel: {CLINIC_OFFICIAL_DATA.phone} · WhatsApp: {CLINIC_OFFICIAL_DATA.whatsapp} · E-mail: {CLINIC_OFFICIAL_DATA.email}
          </p>
        </div>
      </div>

      <div className="text-left sm:text-right shrink-0">
        <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded ${badgeClasses}`}>
          {badgeTitle}
        </span>
        {badgeSubtitle && (
          <span className="block text-[10px] font-semibold text-slate-500 mt-1">
            {badgeSubtitle}
          </span>
        )}
      </div>
    </div>
  );
};

interface MedicalDocumentFooterProps {
  dateLabel?: string;
  dateValue: string;
  extraLeftText?: string;
  signatureHash?: string;
  useLockIcon?: boolean;
  roleSubtitle?: string;
}

export const MedicalDocumentFooter: React.FC<MedicalDocumentFooterProps> = ({
  dateLabel = 'Data de Emissão',
  dateValue,
  extraLeftText,
  signatureHash,
  useLockIcon = false,
  roleSubtitle = 'Médico Responsável',
}) => {
  return (
    <div className="pt-6 mt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-xs">
      <div className="space-y-1">
        <p className="text-[11px] text-slate-600">
          {CLINIC_OFFICIAL_DATA.city} - {CLINIC_OFFICIAL_DATA.state} · {dateLabel}:{' '}
          <strong className="text-slate-900">{dateValue}</strong>
        </p>
        {extraLeftText && (
          <p className="text-[10px] text-slate-500">{extraLeftText}</p>
        )}
        {signatureHash && (
          <div className="mt-1.5 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
            {useLockIcon ? (
              <Lock className="w-3 h-3 text-emerald-600" />
            ) : (
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
            )}
            <span>Assinatura Digital ICP-Brasil: {signatureHash}</span>
          </div>
        )}
      </div>

      <div className="text-center w-64 shrink-0 self-end">
        <div className="border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 text-sm">
          {CLINIC_OFFICIAL_DATA.physicianName}
        </div>
        <span className="block text-xs font-semibold text-slate-800">
          Médico · {CLINIC_OFFICIAL_DATA.crm}
        </span>
        <span className="block text-[10px] text-[#9A7B2C] font-medium">
          {roleSubtitle} · {CLINIC_OFFICIAL_DATA.legalName}
        </span>
      </div>
    </div>
  );
};
