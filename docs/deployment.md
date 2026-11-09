# Guia de Implantação e Configuração de Ambiente

## 1. Variáveis de Ambiente

Crie um arquivo `.env` baseado em `.env.example`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional Provider Integrations
VITE_WHATSAPP_API_URL=https://graph.facebook.com/v21.0
VITE_PAYMENT_GATEWAY_ENV=sandbox
```

## 2. Execução Local

```bash
# Instalação de dependências
npm install

# Execução em ambiente de desenvolvimento
npm run dev

# Verificação de tipos e compilação
npm run lint
npm run build
```

## 3. Aplicação das Migrations no Supabase

1. Acesse o SQL Editor do seu projeto Supabase.
2. Execute o conteúdo de `/supabase/migrations/20261109000000_initial_schema.sql`.
3. (Opcional) Execute `/supabase/seed/seed.sql` para carregar dados iniciais e a clínica modelo Dr. Newton Mureb.
