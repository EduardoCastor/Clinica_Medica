-- ====================================================================
-- CARGA INICIAL OFICIAL: NEWTON MUREB CLINICA MEDICA LTDA (CABO FRIO - RJ)
-- Dr. Newton Mureb - CRM/RJ 52-444985 (CREMERJ 444985)
-- Clínica Médica, Endocrinologia e Metabologia
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
    'NEWTON MUREB CLINICA MEDICA',
    'dr-newton-mureb',
    'd3333333-3333-3333-3333-333333333333',
    'active',
    now() + interval '10 days'
) ON CONFLICT (slug) DO NOTHING;

-- 3. Clínica (Dados Oficiais Cartão CNPJ 55.937.470/0001-78)
INSERT INTO public.clinics (id, organization_id, legal_name, trade_name, document_number, email, phone, whatsapp, institutional_bio)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'NEWTON MUREB CLINICA MEDICA LTDA',
    'NEWTON MUREB CLINICA MEDICA',
    '55.937.470/0001-78',
    'roseneco1@gmail.com',
    '(22) 9908-9122',
    '(22) 99908-9122',
    'Com mais de 40 anos de experiência médica, dediquei minha vida à busca incansável pela saúde, bem-estar e longevidade dos meus pacientes. Nossa missão é compreender, confortar e tratar não apenas sintomas, mas as causas subjacentes, com acompanhamento semanal individualizado e assessoria próxima.'
) ON CONFLICT DO NOTHING;

-- 4. Unidade Matriz Cabo Frio
INSERT INTO public.branches (id, organization_id, clinic_id, name, code, is_headquarters, phone, email, postal_code, street, number, complement, neighborhood, city, state, patient_sharing_mode)
VALUES 
('c1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Unidade Matriz Cabo Frio (Centro)', 'CF-CENTRO', true, '(22) 9908-9122', 'roseneco1@gmail.com', '28.905-000', 'Av. Júlia Kubitschek', '16', 'Sala 307 A - Edif. Premier Center', 'Centro', 'Cabo Frio', 'RJ', 'model_b')
ON CONFLICT DO NOTHING;

-- 5. Especialidade Médica Exclusiva
INSERT INTO public.specialties (id, organization_id, name, council_type, description)
VALUES 
('e1111111-1111-1111-1111-111111111111', 'a0000000-0000-0000-0000-000000000001', 'Clínica Médica, Endocrinologia e Metabologia', 'CRM', 'Atendimento médico ambulatorial em clínica médica, endocrinologia, metabologia, modulação hormonal bioidêntica e longevidade saudável.')
ON CONFLICT DO NOTHING;
