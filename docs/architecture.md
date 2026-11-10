# Arquitetura da Plataforma SaaS de Gestão de Clínicas Médicas (MedSync)

## 1. Visão Geral da Arquitetura

A plataforma **MedSync** é um sistema SaaS multi-tenant e multiunidade com segregação lógica estrita de dados, projetada para atender desde consultórios individuais até redes com dezenas de filiais. A arquitetura obedece à separação de camadas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DO CLIENTE                             │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ Landing Page SaaS  │ Painel da Clínica  │ Site Institucional White-Label│
│ & Checkout Planos  │ (Admin/Médico/Rec) │ & Agendamento Online Público │
└────────────────────┴────────────────────┴──────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        CAMADA DE APLICAÇÃO (SPA)                       │
├────────────────────────────────────────────────────────────────────────┤
│ • React 19 + TypeScript + Tailwind CSS                                 │
│ • State Engine Reativo Multi-Tenant (TenantContext & BranchContext)    │
│ • Camada de Abstração de Dados (Data Provider: Supabase Cloud & Local) │
│ • PWA Engine (Offline Cache, Service Worker, Install Prompt)           │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND & BANCO DE DADOS                        │
├────────────────────────────────────────────────────────────────────────┤
│ • Supabase Auth (JWT assinado com claims: org_id, role, branch_id)     │
│ • PostgreSQL Relacional com Row Level Security (RLS)                   │
│ • Storage de Arquivos Criptografado com URLs Assinadas                 │
│ • Triggers de Auditoria Imutáveis e Controle de Versão (LGPD)          │
└────────────────────────────────────────────────────────────────────────┘
```

## 2. Diagrama de Módulos

```
                   ┌───────────────────────────────┐
                   │    SUPER ADMIN DA PLATAFORMA  │
                   │ • Planos & Preços (Config)    │
                   │ • Gestão de Assinaturas & MRR │
                   │ • Monitoramento de Tenants    │
                   └───────────────┬───────────────┘
                                   │
       ┌───────────────────────────┴───────────────────────────┐
       ▼                                                       ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│  SITE COMERCIAL DA PLATAFORMA │              │    PORTAL DO PACIENTE        │
│ • Conversão & Onboarding     │              │ • Histórico de Consultas     │
│ • Demonstração Interativa    │              │ • Agendamento & Reagendamento│
│ • Trial de 10 dias           │              │ • Prescrições & Exames       │
└──────────────────────────────┘              └──────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    NÚCLEO OPERACIONAL DA CLÍNICA                           │
├──────────────────────┬──────────────────────┬──────────────────────────────┤
│ 1. CADASTRO & FILIAIS│ 2. PACIENTES & LGPD  │ 3. PRONTUÁRIO ELETRÔNICO     │
│ • Unidades / Salas   │ • Modelo A / B       │ • Anamnese / Queixa          │
│ • Especialidades     │ • Consentimentos     │ • Evolução / Prescrições     │
│ • Horários & Regras  │ • CPF / Duplicidade  │ • Trilha de Auditoria        │
├──────────────────────┼──────────────────────┼──────────────────────────────┤
│ 4. AGENDAMENTO VIP   │ 5. COMUNICAÇÃO       │ 6. FINANCEIRO & SITES        │
│ • Dia/Semana/Mês     │ • WhatsApp Business  │ • Contas a Receber / Recibos │
│ • Encaixe / Bloqueios│ • Variáveis {{tags}} │ • Fluxo de Caixa / Relatórios│
│ • Lista de Espera    │ • Confirmações 48/24h│ • Gerador Site White-Label   │
└──────────────────────┴──────────────────────┴──────────────────────────────┘
```

## 3. Modelo de Relacionamento do Banco de Dados

Todas as tabelas contêm a chave estrangeira `organization_id` (e `branch_id` onde aplicável) para assegurar que nenhuma consulta possa vazar registros entre clínicas diferentes.

### Principais Entidades e Cardinalidades:
- `organizations` 1 ── N `clinics`
- `clinics` 1 ── N `branches` (Filiais)
- `branches` 1 ── N `rooms` (Salas de atendimento)
- `organizations` 1 ── N `users` & `user_profiles`
- `users` N ── M `roles` (RBAC: Admin SaaS, Admin Clínica, Admin Filial, Médico, Fisioterapeuta, Recepção, Financeiro, Gestor, Paciente)
- `organizations` 1 ── N `patients`
- `patients` N ── M `branches` (via `patient_branch_access` para suporte aos Modelos A e B)
- `organizations` 1 ── N `professionals`
- `professionals` N ── M `branches` & `specialties`
- `branches` 1 ── N `appointments` (vinculados a paciente, profissional e sala)
- `patients` 1 ── N `medical_records` & `medical_record_entries` (com `author_id` e imutabilidade auditada)
- `organizations` 1 ── N `message_templates` & `messages` (com histórico de entrega e canal)
- `organizations` 1 ── N `financial_transactions`
- `clinics` 1 ── 1 `websites` (White-label com 5 paletas de cores e customização)
- `organizations` 1 ── 1 `subscriptions` vinculada a `plans` (Trial 10 dias, Básico, Avançado)

## 4. Estratégia Multi-Tenant

1. **Abordagem**: Shared Database, Shared Process, Isolated Rows via RLS.
2. **Identificador Global**: `organization_id` (UUID v4) indexado em todas as tabelas operacionais.
3. **Filtro de Aplicação & Banco**: No frontend, todo request injeta o `organization_id` da sessão ativa; no PostgreSQL, a política RLS intercepta `auth.jwt() ->> 'organization_id'` e rejeita qualquer operação fora do escopo do inquilino.
4. **Isolamento de Filiais**:
   - **Modelo A (Exclusivo)**: Pacientes vinculados exclusivamente a uma única `branch_id`. Usuários de outra filial não têm visibilidade.
   - **Modelo B (Compartilhado)**: Pacientes com autorização de compartilhamento via `patient_branch_access`. A clínica define quais filiais e profissionais têm acesso ao prontuário e histórico.

## 5. Estratégia de Segurança e RLS (Row Level Security)

- **RLS Ativo**: `ALTER TABLE <tabela> ENABLE ROW LEVEL SECURITY;` em 100% das tabelas.
- **Princípio do Menor Privilégio**: Recepção não possui permissão `SELECT` em `medical_record_entries`; Médicos só acessam pacientes sob seu cuidado ou autorizados pela filial; Financeiro só acessa `financial_transactions`.
- **Super Administrador**: O admin da plataforma gerencia apenas contas, limites e planos. Não possui permissão de leitura em tabelas médicas sensíveis (`medical_records`, `prescriptions`).
- **LGPD**: Tabela de auditoria imutável (`audit_logs`) registrando `actor_id`, `action`, `entity`, `ip_address`, `timestamp` e `payload_hash`.
- **Arquivos**: Documentos médicos são armazenados em buckets privados do Supabase Storage, servidos via URLs temporárias assinadas (TTL máximo de 15 minutos).

## 6. Estrutura do Repositório

```
/
├── docs/                      # Documentação técnica e operacional
│   ├── architecture.md
│   ├── database.md
│   ├── security.md
│   ├── integrations.md
│   └── deployment.md
├── supabase/
│   ├── migrations/            # Scripts DDL versionados com RLS
│   │   └── 20261109000000_initial_schema.sql
│   └── seed/                  # Carga inicial e clínica modelo Dr. Newton Mureb
│       └── seed.sql
├── src/
│   ├── types/                 # Definições TypeScript completas
│   ├── services/              # Clientes Supabase, Auth, Storage e Repository
│   ├── contexts/              # Contextos de Tenant, Auth, Filiais e Tema
│   ├── hooks/                 # Custom hooks (useAppointments, usePatients, usePWA, etc.)
│   ├── modules/
│   │   ├── landing/           # Site comercial do SaaS & Onboarding
│   │   ├── saas-admin/        # Painel Super Admin (Planos, Assinaturas, MRR)
│   │   ├── clinic/            # Configurações da Clínica & Filiais
│   │   ├── patients/          # Cadastro de Pacientes & Controle Modelo A/B
│   │   ├── medical-records/   # Prontuário Eletrônico & Evoluções
│   │   ├── appointments/      # Agendamento, Calendário, Bloqueios & Espera
│   │   ├── communication/     # Central WhatsApp, Modelos & Automações
│   │   ├── financial/         # Módulo Financeiro, Contas, Recibos & Fluxo
│   │   ├── website-builder/   # Gerador White-Label & 5 Paletas de Cores
│   │   └── patient-portal/    # Portal de autoatendimento do Paciente
│   ├── components/            # Componentes reutilizáveis (UI, Modais, PWA Button)
│   └── App.tsx                # Roteador mestre e orquestrador da aplicação
```

## 7. Dependências Externas

1. **Supabase**: Backend relacional PostgreSQL, Auth JWT e Storage criptografado.
2. **WhatsApp Business Cloud API (Meta)**: Envio oficial de templates de mensagens transacionais.
3. **Gateway de Pagamento (Asaas / Stripe / Mercado Pago)**: Gestão de assinaturas do SaaS e cobranças de consultas.
4. **Resend / SendGrid**: Envio de e-mails transacionais (boas-vindas, ativação de conta, recuperação de senha).

## 8. Principais Riscos Técnicos e Mitigação

1. **Risco de Vazamento Multi-Tenant**: Mitigado por testes automatizados de RLS no nível do banco e verificação forçada de `organization_id` em todos os índices compostos.
2. **Conflito de Horários em Agendamentos Simultâneos**: Mitigado por restrições de exclusão no PostgreSQL (`btree_gist` / `EXCLUDE USING gist`) garantindo atomicidade estrita.
3. **Conformidade LGPD para Prontuários Médicos**: Armazenamento imutável com histórico de versões, sem exclusão física (soft delete com log de auditoria obrigatório).

## 9. Arquitetura Dual-Domain e Separação Painel vs Site Institucional

### 9.1. Princípio do Dual-Domain por Clínica
Cada clínica cliente opera sob dois FQDNs distintos no mesmo banco de dados:
1. **Painel do Sistema (`domain_type = 'app'`)**: ex.: `app.drnewtonmureb.com.br`
   - Destinado aos colaboradores (médicos, secretárias, administradores).
   - Exige autenticação via Supabase Auth.
   - Fornece acesso a prontuários, financeiro, agendamentos internos e configurações.
2. **Site Institucional Público (`domain_type = 'website'`)**: ex.: `www.drnewtonmureb.com.br`
   - Destinado aos pacientes e ao público geral.
   - Sem autenticação obrigatória.
   - Exibe bio médica, especialidades, filiais físicas, paleta visual personalizada e widget de agendamento público online.

### 9.2. Mecanismo de Resolução em Tempo de Execução (`DomainResolver`)
- O navegador lê `window.location.hostname`.
- O serviço `DomainResolver` busca o registro correspondente em `clinic_domains`.
- Se `domain_type === 'app'`, a SPA bloqueia o acesso anônimo e inicializa o fluxo de autenticação do painel restrito àquela organização.
- Se `domain_type === 'website'`, a SPA carrega exclusivamente o template institucional com a paleta configurada (`WebsiteConfig`). O código do site público não inicializa repositórios de prontuários médicos ou dados financeiros.
- Na base de dados, políticas RLS impedem que chaves anônimas (`anon`) realizem queries em `medical_records`, `financial_transactions` ou `patients`. Apenas a inserção de agendamento público (`appointments` com status `scheduled`) é autorizada para o papel `anon`.

