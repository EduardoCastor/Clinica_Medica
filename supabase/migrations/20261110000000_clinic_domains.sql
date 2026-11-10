-- ====================================================================
-- MIGRAÇÃO SUPABASE: TABELA DE DOMÍNIOS PERSONALIZADOS (CLINIC_DOMAINS)
-- Separação estrita entre Painel Administrativo (app) e Site Institucional (website)
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.clinic_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL,
    domain_type VARCHAR(20) NOT NULL CHECK (domain_type IN ('app', 'website')),
    is_verified BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT false,
    verification_token VARCHAR(100) NOT NULL DEFAULT ('medsync-verify-' || encode(gen_random_bytes(16), 'hex')),
    dns_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (dns_status IN ('pending', 'dns_configured', 'propagating', 'verified', 'error')),
    ssl_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'provisioning', 'active', 'error')),
    expected_cname VARCHAR(255) NOT NULL DEFAULT 'cname.medsync.io',
    verified_at TIMESTAMPTZ,
    last_dns_check_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Restrições de unicidade: um domínio não pode ser vinculado a duas organizações diferentes
    CONSTRAINT uq_clinic_domains_domain UNIQUE (domain),
    -- Cada clínica possui no máximo um domínio primário para 'app' e um para 'website'
    CONSTRAINT uq_clinic_domain_type UNIQUE (clinic_id, domain_type)
);

-- Índices de consulta de alta performance
CREATE INDEX IF NOT EXISTS idx_clinic_domains_domain ON public.clinic_domains (domain);
CREATE INDEX IF NOT EXISTS idx_clinic_domains_org ON public.clinic_domains (organization_id);
CREATE INDEX IF NOT EXISTS idx_clinic_domains_clinic ON public.clinic_domains (clinic_id);

-- RLS
ALTER TABLE public.clinic_domains ENABLE ROW LEVEL SECURITY;

-- Leitura pública para resolução de domínios no frontend / edge
CREATE POLICY "Public domain resolution read" ON public.clinic_domains
    FOR SELECT
    USING (true);

-- Carga inicial para o caso do Dr. Newton Mureb
INSERT INTO public.clinic_domains (
    id, organization_id, clinic_id, domain, domain_type, is_verified, is_active, dns_status, ssl_status, verified_at
) VALUES 
(
    'dom11111-1111-1111-1111-111111111111',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'app.drnewtonmureb.com.br',
    'app',
    true,
    true,
    'verified',
    'active',
    now()
),
(
    'dom22222-2222-2222-2222-222222222222',
    'a0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'www.drnewtonmureb.com.br',
    'website',
    true,
    true,
    'verified',
    'active',
    now()
)
ON CONFLICT (domain) DO UPDATE SET 
    domain_type = EXCLUDED.domain_type,
    is_verified = EXCLUDED.is_verified,
    is_active = EXCLUDED.is_active;
