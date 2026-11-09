-- ====================================================================
-- MIGRAÇÃO INICIAL SUPABASE / POSTGRESQL: PLATAFORMA MEDSYNC SAAS
-- Estrutura Multi-Tenant, Multiunidade, RBAC, RLS e Auditoria LGPD
-- ====================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de Planos Comerciais do SaaS
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_yearly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    trial_days INT NOT NULL DEFAULT 10,
    max_branches INT NOT NULL DEFAULT 1,
    max_users INT NOT NULL DEFAULT 3,
    max_patients INT NOT NULL DEFAULT 500,
    has_patient_sharing BOOLEAN NOT NULL DEFAULT false,
    has_whatsapp_automation BOOLEAN NOT NULL DEFAULT false,
    has_custom_website BOOLEAN NOT NULL DEFAULT true,
    has_financial_module BOOLEAN NOT NULL DEFAULT false,
    has_advanced_reports BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Organizações (Tenants)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(80) UNIQUE NOT NULL,
    plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'trial', -- trial, active, overdue, suspended
    trial_ends_at TIMESTAMPTZ,
    subscription_renews_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de Clínicas Clientes
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    legal_name VARCHAR(200) NOT NULL,       -- Razão Social
    trade_name VARCHAR(200) NOT NULL,       -- Nome Fantasia
    document_number VARCHAR(30) NOT NULL,   -- CNPJ
    municipal_registration VARCHAR(50),
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30),
    logo_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#0284c7',
    institutional_bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela de Filiais (Branches)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(30),
    is_headquarters BOOLEAN NOT NULL DEFAULT false,
    document_number VARCHAR(30),
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30),
    email VARCHAR(120),
    postal_code VARCHAR(20),
    street VARCHAR(200),
    number VARCHAR(30),
    complement VARCHAR(100),
    neighborhood VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(10) NOT NULL,
    opening_hours JSONB DEFAULT '{"weekday": "08:00 - 19:00", "saturday": "08:00 - 13:00"}',
    patient_sharing_mode VARCHAR(20) NOT NULL DEFAULT 'model_b', -- 'model_a' (exclusivo) ou 'model_b' (compartilhado)
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabela de Salas de Atendimento (Rooms)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#0284c7',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabela de Papéis e Permissões (RBAC)
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- 8. Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE, -- ID do auth.users do Supabase
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    default_branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(30),
    avatar_url TEXT,
    role_code VARCHAR(50) NOT NULL, -- super_admin, clinic_admin, branch_admin, doctor, physiotherapist, receptionist, financial, patient
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Tabela de Especialidades
CREATE TABLE IF NOT EXISTS public.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    council_type VARCHAR(20) DEFAULT 'CRM', -- CRM, CREFITO, etc.
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Tabela de Profissionais de Saúde
CREATE TABLE IF NOT EXISTS public.professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_profile_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    council_number VARCHAR(40) NOT NULL, -- CRM 12345/SP
    specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
    phone VARCHAR(30),
    email VARCHAR(120),
    bio TEXT,
    color VARCHAR(20) DEFAULT '#0284c7',
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Tabela de Serviços e Procedimentos
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Tabela de Pacientes
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    origin_branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    full_name VARCHAR(150) NOT NULL,
    document_cpf VARCHAR(20) NOT NULL,
    birth_date DATE,
    gender VARCHAR(20),
    phone VARCHAR(30) NOT NULL,
    whatsapp VARCHAR(30),
    email VARCHAR(120),
    postal_code VARCHAR(20),
    address VARCHAR(200),
    address_number VARCHAR(30),
    neighborhood VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(10),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(30),
    administrative_notes TEXT,
    sharing_mode VARCHAR(20) DEFAULT 'inherit_branch', -- 'model_a_exclusive', 'model_b_shared', 'inherit_branch'
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Tabela de Permissões de Compartilhamento de Paciente entre Filiais
CREATE TABLE IF NOT EXISTS public.patient_branch_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    can_view_records BOOLEAN NOT NULL DEFAULT true,
    can_edit_records BOOLEAN NOT NULL DEFAULT false,
    can_schedule BOOLEAN NOT NULL DEFAULT true,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(patient_id, branch_id)
);

-- 14. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'scheduled', 
    -- 'scheduled', 'confirmed', 'waiting_room', 'in_consultation', 'completed', 'no_show', 'cancelled'
    appointment_type VARCHAR(30) DEFAULT 'presencial', -- 'presencial', 'telemedicina'
    notes TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. Tabela de Lista de Espera (Waitlist)
CREATE TABLE IF NOT EXISTS public.waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
    preferred_days TEXT[],
    preferred_period VARCHAR(30), -- 'manha', 'tarde', 'noite', 'qualquer'
    notes TEXT,
    status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'notified', 'booked', 'expired'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Tabela de Prontuário e Evoluções Clínicas
CREATE TABLE IF NOT EXISTS public.medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    record_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    chief_complaint TEXT,                -- Queixa Principal
    clinical_history TEXT,               -- Histórico Clínico / Anamnese
    physical_exam TEXT,                  -- Exame Físico / Avaliação
    diagnostic_hypothesis TEXT,          -- Diagnósticos / Hipóteses
    therapeutic_plan TEXT,               -- Plano Terapêutico
    prescriptions TEXT,                  -- Prescrições / Suplementação
    exam_requests TEXT,                  -- Pedidos de Exames
    evolution_notes TEXT,                -- Evolução do Atendimento
    is_signed BOOLEAN NOT NULL DEFAULT false,
    signature_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Tabela de Modelos de Mensagens de Comunicação
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'confirmation_48h', 'reminder_24h', 'day_reminder', 'post_care', 'birthday'
    channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    content TEXT NOT NULL,
    variables JSONB DEFAULT '["nome_paciente", "nome_clinica", "nome_profissional", "data_consulta", "horario_consulta", "endereco_filial"]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 18. Central de Comunicação (Histórico de Mensagens)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
    recipient_phone VARCHAR(30) NOT NULL,
    direction VARCHAR(20) NOT NULL DEFAULT 'outbound', -- 'outbound', 'inbound'
    content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'delivered', -- 'queued', 'sent', 'delivered', 'read', 'failed'
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 19. Tabela de Transações Financeiras da Clínica
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL DEFAULT 'receivable', -- 'receivable', 'payable'
    payment_method VARCHAR(30) NOT NULL, -- 'pix', 'credit_card', 'debit_card', 'cash', 'transfer', 'boleto'
    installments INT DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'paid', -- 'pending', 'paid', 'cancelled', 'refunded'
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    receipt_number VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Tabela de Configurações de Sites White-Label das Clínicas
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    slug VARCHAR(80) UNIQUE NOT NULL,
    custom_domain VARCHAR(150),
    title VARCHAR(150) NOT NULL,
    tagline VARCHAR(250),
    palette_name VARCHAR(50) NOT NULL DEFAULT 'azul-clinico', 
    -- 'azul-clinico', 'verde-saude', 'elegancia', 'minimalista', 'natural'
    hero_headline VARCHAR(200),
    hero_subheadline TEXT,
    about_text TEXT,
    medical_approach TEXT,
    online_booking_enabled BOOLEAN NOT NULL DEFAULT true,
    contact_phone VARCHAR(30),
    contact_whatsapp VARCHAR(30),
    contact_email VARCHAR(120),
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Tabela de Auditoria LGPD
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL,
    user_id UUID,
    user_role VARCHAR(50),
    action VARCHAR(50) NOT NULL, -- 'view_record', 'update_record', 'export_data', 'change_permission'
    entity VARCHAR(50) NOT NULL,
    entity_id UUID,
    ip_address VARCHAR(50),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- POLÍTICAS DE SEGURANÇA ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_branch_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Exemplo de política de isolamento estrito por tenant:
CREATE POLICY "Tenant isolation for clinics" ON public.clinics
    FOR ALL
    USING (organization_id = (current_setting('app.current_org_id', true))::uuid);

CREATE POLICY "Tenant isolation for patients" ON public.patients
    FOR ALL
    USING (organization_id = (current_setting('app.current_org_id', true))::uuid);

CREATE POLICY "Tenant isolation for appointments" ON public.appointments
    FOR ALL
    USING (organization_id = (current_setting('app.current_org_id', true))::uuid);

CREATE POLICY "Tenant isolation for medical_records" ON public.medical_records
    FOR ALL
    USING (organization_id = (current_setting('app.current_org_id', true))::uuid);
