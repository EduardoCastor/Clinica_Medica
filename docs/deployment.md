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
2. Execute o conteúdo de `/supabase/migrations/20261109000000_initial_schema.sql` (Schema mestre).
3. Execute o conteúdo de `/supabase/migrations/20261110000000_clinic_domains.sql` (Tabela `clinic_domains`, restrições de unicidade e políticas RLS).
4. (Opcional) Execute `/supabase/seed/seed.sql` para carregar dados iniciais e a clínica modelo Dr. Newton Mureb.

## 4. Arquitetura de Hospedagem & Domínios Customizados Multi-Tenant

### 4.1. Avaliação de Provedores de Hospedagem

| Provedor | Múltiplos Domínios por Tenant | Wildcard SSL Automático | Roteamento Edge Anycast | Recomendação MedSync SaaS |
| :--- | :--- | :--- | :--- | :--- |
| **GitHub Pages** | **Não** (apenas 1 CNAME por repo) | Não nativo para múltiplos FQDNs | Básico | Ambiente de demonstração e homologação |
| **Vercel** | **Sim** (Domains API com SSL Let's Encrypt) | Sim, automático | Sim, Vercel Edge Network | **Recomendado para Produção** |
| **Cloudflare Pages / Workers** | **Sim** (Cloudflare for SaaS / Custom Hostnames) | Sim (Universal SSL com emissão instantânea) | Sim, CDN global Anycast | **Recomendado para Produção em Escala** |

### 4.2. Configuração de DNS para Clínicas Parceiras

Para cada clínica contratante (exemplo: Dr. Newton Mureb):

1. **Painel do Sistema Administrativo**:
   - Tipo: `CNAME`
   - Entrada: `app` (ou `app.drnewtonmureb.com.br`)
   - Destino: `cname.medsync.io`
   - TTL: `Auto` ou `3600`

2. **Site Institucional Público**:
   - Tipo: `CNAME`
   - Entrada: `www` (ou `www.drnewtonmureb.com.br`)
   - Destino: `cname.medsync.io`
   - TTL: `Auto` ou `3600`

3. **Validação de Propriedade (TXT)**:
   - Entrada: `_medsync-challenge.drnewtonmureb.com.br`
   - Valor: Token gerado pelo módulo "Domínios e Sites" no Super Admin.

## 5. Migração Segura para a Vercel (Etapa A: Homologação e Coexistência)

### 5.1. Princípio da Não-Interrupção (Zero Downtime)
A versão em produção no GitHub Pages (`https://eduardocastor.github.io/Clinica_Medica/`) permanece 100% ativa e funcional durante todo o processo.
- O workflow `.github/workflows/deploy.yml` permanece ativo na branch `main`.
- A nova configuração na branch `migration/vercel` contém o arquivo `vercel.json` e a resolução dinâmica de `base` no `vite.config.ts`.
- Nenhuma alteração de DNS ou no Registro.br deve ser feita nesta Etapa A.

### 5.2. Como Conectar o GitHub à Vercel

1. **Acessar o Painel Vercel**: Faça login em [vercel.com](https://vercel.com) com sua conta.
2. **Adicionar Novo Projeto**: Clique em **"Add New..."** > **"Project"**.
3. **Importar Repositório**:
   - Localize o repositório `EduardoCastor/Clinica_Medica`.
   - Clique em **"Import"**.
4. **Configurações do Projeto (Configure Project)**:
   - **Framework Preset**: Selecione `Vite`.
   - **Root Directory**: `./` (raiz do repositório).
   - **Build and Output Settings**:
     - *Build Command*: `npm run build`
     - *Output Directory*: `dist`
     - *Install Command*: `npm ci`
5. **Configurar Variáveis de Ambiente**:
   - Adicione `VITE_SUPABASE_URL` com a URL do seu projeto Supabase.
   - Adicione `VITE_SUPABASE_ANON_KEY` com a chave anônima pública.
   - Marque as caixas de seleção: **Production**, **Preview** e **Development**.
6. **Selecionar a Branch de Migração**:
   - Para o primeiro deploy de teste, aponte ou selecione a branch `migration/vercel`.
7. **Deploy**: Clique em **"Deploy"**.

### 5.3. Checklist de Validação Pré-Produção
Após a conclusão do build na Vercel:
- [ ] O deploy gera uma URL de Preview (ex.: `https://clinica-medica-xxx.vercel.app`).
- [ ] A página inicial carrega todos os assets estáticos sem erros 404 no console.
- [ ] Ao recarregar páginas internas (F5), o arquivo `vercel.json` reescreve para `/index.html` sem retornar erro 404.
- [ ] A conexão com o Supabase é estabelecida com sucesso.
- [ ] O simulador de domínios reconhece os ambientes `app.drnewtonmureb.com.br` e `www.drnewtonmureb.com.br`.
- [ ] O endereço legado no GitHub Pages (`https://eduardocastor.github.io/Clinica_Medica/`) continua operando normalmente.


