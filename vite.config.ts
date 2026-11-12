import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command, mode }) => {
  // Configuração condicional segura para dupla hospedagem (GitHub Pages e Vercel):
  // 1. Variável explícita BUILD_TARGET:
  //    - BUILD_TARGET=vercel -> base = '/'
  //    - BUILD_TARGET=github -> base = '/clinica_medica/'
  // 2. Variável explícita VITE_BASE_PATH:
  //    - ex: VITE_BASE_PATH=/ ou VITE_BASE_PATH=/clinica_medica/
  // 3. Vercel: a plataforma Vercel injeta VERCEL=1 automaticamente -> base = '/'
  // 4. Servidor de desenvolvimento local (vite dev): sempre serve a partir da raiz -> base = '/'
  // 5. GitHub Actions ou Build padrão de produção: base = '/clinica_medica/' (nome real do repositório em minúsculas)
  // Default to '/' for AI Studio and standard hosting, unless GitHub Actions or explicit BUILD_TARGET=github is specified
  let basePath = '/';

  if (process.env.BUILD_TARGET === 'github' || process.env.GITHUB_ACTIONS === 'true') {
    basePath = '/clinica_medica/';
  } else if (process.env.BUILD_TARGET === 'vercel') {
    basePath = '/';
  } else if (process.env.VITE_BASE_PATH) {
    basePath = process.env.VITE_BASE_PATH;
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
      host: '0.0.0.0',
      port: 3000,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
