# Modelo de Dados e Dicionário de Tabelas (PostgreSQL / Supabase)

## Visão Geral das Entidades

Todas as tabelas do sistema utilizam chaves primárias do tipo `UUID`, geradas via `gen_random_uuid()`, e incluem colunas de auditoria temporal (`created_at`, `updated_at`).

### 1. Núcleo Multi-Tenant & SaaS
- **`organizations`**: Organização SaaS (tenant mestre).
- **`clinics`**: Dados cadastrais da clínica (Razão Social, Nome Fantasia, CNPJ, etc.).
- **`branches`**: Filiais vinculadas à clínica (Endereço, Telefone, Horários de atendimento).
- **`plans`**: Planos comerciais do SaaS (Teste Grátis 10 dias, Básico, Avançado) com limites configuráveis.
- **`subscriptions`**: Assinatura da organização, status (`trial`, `active`, `overdue`, `suspended`), validade e limites vigentes.

### 2. Controle de Acesso e Usuários (RBAC)
- **`users`**: Usuários cadastrados (vinculados ao Supabase Auth).
- **`user_profiles`**: Nome completo, e-mail, telefone, foto/avatar, status.
- **`roles`**: Papéis (`super_admin`, `clinic_admin`, `branch_admin`, `doctor`, `physiotherapist`, `receptionist`, `financial`, `patient`).
- **`permissions`**: Permissões granulares (`view_medical_records`, `edit_medical_records`, `manage_schedules`, `manage_finances`, etc.).
- **`user_roles`**: Vínculo entre usuário, perfil, organização e filial padrão.

### 3. Operação Clínica & Especialidades
- **`professionals`**: Profissionais de saúde (médicos, fisioterapeutas) com número de conselho (CRM, CREFITO), especialidade e cor de agenda.
- **`specialties`**: Especialidades atendidas (ex.: Medicina Ortomolecular, Fisioterapia, Endocrinologia, Metabologia).
- **`services`**: Procedimentos e consultas oferecidos com duração e valor padrão.
- **`rooms`**: Salas e consultórios disponíveis em cada filial.
- **`schedules`**: Configuração de horários de atendimento dos profissionais por dia da semana e filial.

### 4. Pacientes & Compartilhamento entre Filiais
- **`patients`**: Cadastro completo (Nome, CPF, Data de Nascimento, Sexo, Telefone, WhatsApp, E-mail, Endereço, Contato de Emergência, Filial de Origem).
- **`patient_branch_access`**: Matriz de compartilhamento entre filiais (Modelo A: exclusivo; Modelo B: compartilhado com permissões de leitura/escrita e acesso a prontuário).
- **`patient_consents`**: Registro de termos de consentimento e tratamento de dados segundo a LGPD.

### 5. Agendamento & Lista de Espera
- **`appointments`**: Agendamentos com data, hora de início/fim, status (`scheduled`, `confirmed`, `waiting_room`, `in_consultation`, `completed`, `no_show`, `cancelled`), tipo (presencial/online), observações.
- **`appointment_status_history`**: Registro cronológico de todas as mudanças de status da consulta com usuário autor.
- **`waitlist`**: Lista de espera para horários disputados ou cancelamentos.

### 6. Prontuário Eletrônico & Documentos
- **`medical_records`**: Prontuário mestre do paciente.
- **`medical_record_entries`**: Evoluções clínicas e notas de atendimento (Anamnese, Queixa Principal, Hipóteses, Plano Terapêutico) imutáveis por sessão.
- **`prescriptions`**: Receitas médicas estruturadas com posologia, orientações e autor.
- **`exams`**: Solicitações de exames laboratoriais/imagem e resultados anexados.
- **`documents`**: Documentos clínicos e laudos armazenados de forma criptografada.

### 7. Comunicação Automatizada & WhatsApp
- **`message_templates`**: Modelos de mensagens com variáveis dinâmicas (`{{nome_paciente}}`, `{{data_consulta}}`, etc.).
- **`messages`**: Fila e histórico de mensagens enviadas/recebidas por canal (WhatsApp, E-mail, SMS) com status de entrega.

### 8. Gestão Financeira
- **`financial_transactions`**: Contas a receber, pagamentos, recibos, métodos de pagamento (Pix, Cartão, Boleto, Dinheiro) e status.

### 9. Gerador de Site White-Label
- **`websites`**: Configurações de site da clínica (slug, domínio próprio, título, descrição, paleta de cores, logotipo, seções ativas).

### 10. Mapeamento de Domínios Customizados (Multi-Tenant)
- **`clinic_domains`**: Registro de domínios FQDN exclusivos vinculados a organizações e clínicas.
  - `id`: UUID chave primária.
  - `organization_id`: UUID chave estrangeira para `organizations`.
  - `clinic_id`: UUID chave estrangeira para `clinics`.
  - `domain`: Texto com índice e restrição `UNIQUE` (ex: `app.drnewtonmureb.com.br`, `www.drnewtonmureb.com.br`).
  - `domain_type`: Enum `app` (Painel Administrativo do Sistema) ou `website` (Site Institucional Público).
  - `is_verified`: Booleano indicando validação de registros DNS e propriedade do domínio.
  - `is_active`: Booleano de ativação/pausa pelo Super Admin.
  - `verification_token`: Token para validação de entrada TXT (`_medsync-challenge`).
  - `dns_status`: Status de apontamento DNS (`pending`, `dns_configured`, `propagating`, `verified`, `error`).
  - `ssl_status`: Status de emissão de certificado SSL/TLS (`pending`, `provisioning`, `active`, `error`).
  - `expected_cname`: CNAME canônico da infraestrutura Anycast (padrão `cname.medsync.io`).
  - `verified_at`, `last_dns_check_at`: Timestamps de auditoria.
  - `CONSTRAINT unique_clinic_domain_type UNIQUE (clinic_id, domain_type)`: Garante que cada clínica possua no máximo 1 domínio para o painel (`app`) e 1 domínio para o site (`website`).

