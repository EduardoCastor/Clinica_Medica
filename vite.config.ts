import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command, mode }) => {
  // Configuração condicional segura para dupla hospedagem (GitHub Pages e Vercel):
  // 1. Variável explícita VITE_BASE_PATH: máxima prioridade
  // 2. Vercel: a plataforma Vercel injeta VERCEL=1 automaticamente -> base = '/'
  // 3. Servidor de desenvolvimento local (vite dev): sempre serve a partir da raiz -> base = '/'
  // 4. GitHub Actions ou Build padrão de produção: base = '/Clinica_Medica/' (exato case do repositório)
  let basePath = '/Clinica_Medica/';

  if (process.env.VITE_BASE_PATH) {
    basePath = process.env.VITE_BASE_PATH;
  } else if (process.env.VERCEL) {
    basePath = '/';
  } else if (command === 'serve' || mode === 'development') {
    basePath = '/';
  } else if (process.env.GITHUB_ACTIONS === 'true') {
    basePath = '/Clinica_Medica/';
  }

  // Assegurar formato canônico com barras inicial e final
  if (!basePath.startsWith('/')) {
    basePath = '/' + basePath;
  }
  if (!basePath.endsWith('/')) {
    basePath = basePath + '/';
  }

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
