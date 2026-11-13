import React, { useState } from 'react';
import { 
  Palette, 
  Globe, 
  Sparkles, 
  Eye, 
  Save, 
  Check, 
  ExternalLink, 
  Building2, 
  Layers 
} from 'lucide-react';
import { WebsiteConfig, ColorPalette } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';

interface WebsiteEditorProps {
  onOpenPreview: () => void;
}

export const WebsiteEditor: React.FC<WebsiteEditorProps> = ({ onOpenPreview }) => {
  const { clinic } = useTenant();
  const [config, setConfig] = useState<WebsiteConfig>(StorageService.getWebsite());
  const [isSaved, setIsSaved] = useState(false);

  const palettes: Array<{ id: ColorPalette; name: string; colors: string[]; desc: string }> = [
    {
      id: 'azul-clinico',
      name: '1. Azul-Clínico',
      colors: ['#0f172a', '#0284c7', '#38bdf8', '#f8fafc'],
      desc: 'Azul-marinho, azul-claro e branco. Transmite serenidade, rigor técnico e autoridade médica.',
    },
    {
      id: 'verde-saude',
      name: '2. Verde-Saúde',
      colors: ['#064e3b', '#059669', '#34d399', '#f0fdf4'],
      desc: 'Verde-escuro, verde-suave e branco. Foco em equilíbrio biológico, saúde celular e vitalidade.',
    },
    {
      id: 'elegancia',
      name: '3. Elegância',
      colors: ['#1c1917', '#b45309', '#f59e0b', '#fffbeb'],
      desc: 'Grafite, dourado suave e branco. Estética premium para consultórios de alta referência.',
    },
    {
      id: 'minimalista',
      name: '4. Minimalista',
      colors: ['#334155', '#64748b', '#94a3b8', '#ffffff'],
      desc: 'Cinza, branco e azul acinzentado. Estilo limpo, contemporâneo e de leitura imediata.',
    },
    {
      id: 'natural',
      name: '5. Natural',
      colors: ['#365314', '#65a30d', '#a3e635', '#fefce8'],
      desc: 'Verde-oliva, bege e tons terrosos. Foco em medicina integrativa e estilo de vida sustentável.',
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateWebsite(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Gerador de Site Institucional White-Label
            </h1>
            <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              5 Paletas de Cores
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Site institucional exclusivo da clínica gerado automaticamente, com agendamento online público e personalização visual.
          </p>
        </div>

        <button
          onClick={onOpenPreview}
          className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition flex items-center gap-1.5"
        >
          <Eye className="w-4 h-4" />
          <span>Visualizar Site Público</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Color Palette Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Palette className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Paleta de Cores Pré-Configurada (Requisito 13.1)</h3>
              <p className="text-xs text-slate-500">Escolha entre 5 combinações harmônicas com pré-visualização instantânea.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {palettes.map((p) => {
              const isSelected = config.paletteName === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setConfig({ ...config, paletteName: p.id })}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition text-xs space-y-2.5 ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{p.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-sky-600" />}
                  </div>

                  {/* Swatches */}
                  <div className="flex items-center gap-1.5 h-6">
                    {p.colors.map((c, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full rounded-md border border-black/10"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Institutional Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Globe className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">Textos Institucionais & Abordagem Médica (Requisito 14)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Título do Site / Marca</label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subtítulo / Tagline</label>
              <input
                type="text"
                value={config.tagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Chamada Principal do Banner (Headline)</label>
            <input
              type="text"
              value={config.heroHeadline}
              onChange={(e) => setConfig({ ...config, heroHeadline: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Subtítulo Explicativo (Subheadline)</label>
            <textarea
              rows={2}
              value={config.heroSubheadline}
              onChange={(e) => setConfig({ ...config, heroSubheadline: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Apresentação da Clínica & Filosofia Médica</label>
            <textarea
              rows={3}
              value={config.aboutText}
              onChange={(e) => setConfig({ ...config, aboutText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Abordagem Médica Responsável (Sem falsas promessas de cura/emagrecimento)
            </label>
            <textarea
              rows={3}
              value={config.medicalApproach}
              onChange={(e) => setConfig({ ...config, medicalApproach: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-slate-800 block">Agendamento Online Público Ativo</span>
              <span className="text-[11px] text-slate-500">Permite que pacientes escolham horários disponíveis diretamente pelo site.</span>
            </div>
            <input
              type="checkbox"
              checked={config.onlineBookingEnabled}
              onChange={(e) => setConfig({ ...config, onlineBookingEnabled: e.target.checked })}
              className="w-4 h-4 text-sky-600 rounded"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Configurações Salvas!' : 'Salvar e Publicar'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
