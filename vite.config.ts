import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Roteamento de base flexível para publicação híbrida:
  // 1. Variável explícita VITE_BASE_PATH (se fornecida)
  // 2. Ambiente Vercel (VERCEL=1) ou domínio customizado -> '/'
  // 3. Workflow de build do GitHub Actions (sem Vercel) -> '/Clinica_Medica/'
  // 4. Padrão local e produção com domínio próprio -> '/'
  const basePath = process.env.VITE_BASE_PATH || 
    (process.env.GITHUB_ACTIONS === 'true' && !process.env.VERCEL ? '/Clinica_Medica/' : '/');

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
