-- ====================================================================
-- CARGA INICIAL DE DEMONSTRAÇÃO (SEED): CLÍNICA DR. NEWTON MUREB
-- Medicina Ortomolecular, Saúde Metabólica, Lipedema e Fisioterapia
-- ====================================================================

-- 1. Inserir Planos Comerciais
INSERT INTO public.plans (id, code, name, description, price_monthly, trial_days, max_branches, max_users, max_patients, has_patient_sharing, has_whatsapp_automation, has_custom_website, has_financial_module, has_advanced_reports)
VALUES 
('d1111111-1111-1111-1111-111111111111', 'trial', 'Teste Grátis', 'Experimente todas as funções por 10 dias.', 0.00, 10, 2, 5, 150, true, true, true, true, false),
('d2222222-2222-2222-2222-222222222222', 'basic', 'Plano Básico', 'Para clínicas e consultórios em fase inicial.', 249.00, 0, 1, 3, 600, false, false, true, true, false),
('d3333333-3333-3333-3333-333333333333', 'advanced', 'Plano Avançado Multiunidade', 'Multiunidade com compartilhamento e automações.', 589.00, 0, 10, 25, 10000, true, true, true, true, true)
ON CONFLICT (code) DO NOTHING;

-- 2. Organização Inquilina
INSERT INTO public.organizations (id, name, slug, plan_id, status, trial_ends_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Instituto Dr. Newton Mureb',
    'dr-newton-mureb',
    'd3333333-3333-3333-3333-333333333333',
    'active',
    now() + interval '10 days'
) ON CONFLICT (slug) DO NOTHING;

-- 3. Clínica
INSERT INTO public.clinics (id, organization_id, legal_name, trade_name, document_number, email, phone, whatsapp, institutional_bio)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Mureb & Associados Medicina Integrada Ltda',
    'Clínica Dr. Newton Mureb - Medicina Ortomolecular & Saúde Metabólica',
    '42.891.304/0001-92',
    'contato@drnewtonmureb.com.br',
    '(11) 3284-9100',
    '(11) 98765-4321',
    'Referência em medicina ortomolecular e saúde celular metabólica. Identificação e correção de desequilíbrios bioquímicos, manejo de lipedema e prevenção de sarcopenia.'
) ON CONFLICT DO NOTHING;

-- 4. Filiais (Matriz SP Jardins e Filial RJ Ipanema)
INSERT INTO public.branches (id, organization_id, clinic_id, name, code, is_headquarters, phone, email, street, number, neighborhood, city, state, patient_sharing_mode)
VALUES 
('c1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Unidade São Paulo (Jardins - Matriz)', 'SP-JARDINS', true, '(11) 3284-9100', 'jardins@drnewtonmureb.com.br', 'Rua Bela Cintra', '2105', 'Jardins', 'São Paulo', 'SP', 'model_b'),
('c2222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Unidade Rio de Janeiro (Ipanema)', 'RJ-IPANEMA', false, '(21) 2522-8400', 'ipanema@drnewtonmureb.com.br', 'Rua Visconde de Pirajá', '550', 'Ipanema', 'Rio de Janeiro', 'RJ', 'model_b')
ON CONFLICT DO NOTHING;

-- 5. Especialidades
INSERT INTO public.specialties (id, organization_id, name, council_type, description)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'Medicina Ortomolecular & Metabologia', 'CRM', 'Modulação bioquímica e estresse oxidativo.'),
('e2222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001', 'Fisioterapia Metabólica & Lipedema', 'CREFITO', 'Manejo descongestivo de lipedema e prevenção de sarcopenia.')
ON CONFLICT DO NOTHING;
