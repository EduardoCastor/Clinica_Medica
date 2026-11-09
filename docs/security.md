# Segurança da Informação, LGPD e Auditoria

## 1. Princípios de Segurança e LGPD

A plataforma MedSync foi projetada especificamente para o manuseio de dados pessoais e dados pessoais sensíveis de saúde (Artigo 5º e 11 da Lei Geral de Proteção de Dados - Lei 13.709/2018).

### Medidas Implementadas:
1. **Isolamento de Dados Multi-Tenant**: Nenhuma consulta atinge o banco sem cláusula ou filtro RLS que confira o `organization_id`.
2. **Controle de Acesso Granular (RBAC)**:
   - **Administrador SaaS**: Não possui acesso a prontuários clínicos ou dados sensíveis de pacientes.
   - **Recepcionista**: Acesso a dados de agendamento e contato, sem acesso ao prontuário médico.
   - **Financeiro**: Acesso exclusivo a valores, recibos e notas, sem acesso a diagnósticos ou queixas clínicas.
   - **Médico/Profissional de Saúde**: Acesso restrito aos pacientes atendidos ou autorizados expressamente.
3. **Imutabilidade de Registros Clínicos**: Evoluções e atendimentos médicos recebem hash de assinatura e carimbo temporal, impedindo alterações retroativas não auditadas.
4. **Trilha de Auditoria Imutável**: Toda visualização ou alteração de dados de pacientes gera registro na tabela `audit_logs` contendo autor, data/hora, IP e ação realizada.
5. **Direito dos Titulares**: Rotinas para exportação dos dados do paciente e revogação de consentimentos de comunicação.
