export type UserRole = 
  | 'super_admin'
  | 'clinic_admin'
  | 'branch_admin'
  | 'doctor'
  | 'physiotherapist'
  | 'receptionist'
  | 'financial'
  | 'patient';

export type PatientSharingMode = 'model_a_exclusive' | 'model_b_shared' | 'inherit_branch';

export type AppointmentStatus = 
  | 'scheduled'      // Agendado
  | 'confirmed'      // Confirmado
  | 'waiting_room'   // Na Sala de Espera / Chegada
  | 'in_consultation'// Em Atendimento
  | 'completed'      // Finalizado
  | 'no_show'        // Não Compareceu
  | 'cancelled';     // Cancelado

export type ColorPalette = 'azul-clinico' | 'verde-saude' | 'elegancia' | 'minimalista' | 'natural';

export interface Plan {
  id: string;
  code: 'trial' | 'basic' | 'advanced';
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  maxBranches: number;
  maxUsers: number;
  maxPatients: number;
  hasPatientSharing: boolean;
  hasWhatsAppAutomation: boolean;
  hasCustomWebsite: boolean;
  hasFinancialModule: boolean;
  hasAdvancedReports: boolean;
  isActive: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planId: string;
  status: 'trial' | 'active' | 'overdue' | 'suspended';
  trialEndsAt: string;
  subscriptionRenewsAt: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  organizationId: string;
  clinicId: string;
  name: string;
  code: string;
  isHeadquarters: boolean;
  documentNumber: string; // CNPJ
  phone: string;
  whatsapp: string;
  email: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  openingHours: {
    weekday: string;
    saturday?: string;
    sunday?: string;
  };
  patientSharingMode: 'model_a' | 'model_b';
  isActive: boolean;
}

export interface Clinic {
  id: string;
  organizationId: string;
  legalName: string;
  tradeName: string;
  documentNumber: string; // CNPJ
  municipalRegistration?: string;
  email: string;
  phone: string;
  whatsapp: string;
  logoUrl?: string;
  primaryColor: string;
  institutionalBio: string;
  createdAt: string;
}

export interface Room {
  id: string;
  organizationId: string;
  branchId: string;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  userId?: string;
  organizationId: string;
  defaultBranchId?: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
}

export interface Specialty {
  id: string;
  organizationId: string;
  name: string;
  councilType: 'CRM' | 'CREFITO' | 'CRN' | 'CRP';
  description?: string;
  isActive: boolean;
}

export interface Professional {
  id: string;
  organizationId: string;
  userProfileId?: string;
  fullName: string;
  councilNumber: string; // ex: CRM 82.910/SP
  specialtyId: string;
  specialtyName?: string;
  branchIds: string[];
  phone: string;
  email: string;
  bio: string;
  color: string;
  avatarUrl?: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  durationMinutes: number;
  price: number;
  description?: string;
  specialtyId?: string;
  isActive: boolean;
}

export interface Patient {
  id: string;
  organizationId: string;
  originBranchId: string;
  fullName: string;
  socialName?: string; // Nome Social (CFM / SUS)
  documentCpf: string;
  documentRg?: string;
  documentRgIssuer?: string; // Órgão Emissor / UF
  birthDate: string;
  gender: string; // Exibição amigável
  biologicalSex?: 'M' | 'F' | 'outro';
  genderIdentity?: string;
  maritalStatus?: 'solteiro' | 'casado' | 'uniao_estavel' | 'divorciado' | 'viuvo' | 'outro';
  profession?: string;
  nationality?: string;
  naturalness?: string; // Naturalidade (Cidade/UF)
  phone: string;
  whatsapp: string;
  email: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  
  // Dados Clínicos Básicos e Triagem
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'desconhecido';
  weightKg?: number;
  heightCm?: number;
  calculatedBmi?: number;
  allergies?: string[]; // Alertas de alergias
  chronicDiseases?: string[]; // Comorbidades
  continuousMedications?: string[]; // Medicamentos contínuos

  // Convênio / Financeiro
  healthPlanType?: 'particular' | 'convenio';
  healthPlanOperator?: string;
  healthPlanNumber?: string;
  healthPlanValidity?: string;
  healthPlanCategory?: string;
  cnsNumber?: string; // Cartão Nacional de Saúde

  // Contato de Emergência e Responsável Legal
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactKinship?: string;
  legalGuardianName?: string;
  legalGuardianCpf?: string;
  legalGuardianKinship?: string;
  legalGuardianPhone?: string;

  // LGPD & Auditoria
  lgpdConsent?: boolean;
  lgpdConsentDate?: string;
  administrativeNotes?: string;
  sharingMode: PatientSharingMode;
  authorizedBranchIds?: string[];
  createdAt: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  professionalId: string;
  professionalName: string;
  serviceId?: string;
  serviceName?: string;
  roomId?: string;
  roomName?: string;
  startTime: string; // ISO String
  endTime: string;   // ISO String
  status: AppointmentStatus;
  appointmentType: 'presencial' | 'telemedicina';
  notes?: string;
  cancellationReason?: string;
  isOverbook?: boolean; // Encaixe
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  professionalId?: string;
  specialtyId?: string;
  preferredPeriod: 'qualquer' | 'manha' | 'tarde' | 'noite';
  preferredDays: string[];
  notes?: string;
  status: 'waiting' | 'notified' | 'booked';
  createdAt: string;
}

export interface VitalSigns {
  bloodPressureSystolic?: number;   // PA Sistólica (ex: 120)
  bloodPressureDiastolic?: number;  // PA Diastólica (ex: 80)
  heartRateBpm?: number;            // FC (bpm)
  respiratoryRateRpm?: number;      // FR (rpm)
  temperatureCelsius?: number;      // Temp (°C)
  oxygenSaturationPercent?: number; // SpO2 (%)
  capillaryBloodGlucoseMgDl?: number; // Glicemia capilar (mg/dL)
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
}

export interface MedicalRecordAddendum {
  id: string;
  recordId: string;
  authorId: string;
  authorName: string;
  authorCouncilNumber: string;
  note: string;
  createdAt: string;
  signatureHash: string;
}

export interface MedicalRecordEntry {
  id: string;
  organizationId: string;
  patientId: string;
  branchId: string;
  professionalId: string;
  professionalName: string;
  professionalCouncilNumber?: string;
  appointmentId?: string;
  recordDate: string;
  status: 'draft' | 'signed'; // Rascunho vs Assinado (CFM 1.638/2002 e 1.821/2007)
  consultationType?: 'soap' | 'free_text';
  
  // Método SOAP
  chiefComplaint: string;         // S: Queixa Principal & HDA
  clinicalHistory: string;        // S: Anamnese, Hábitos, Antecedentes
  vitalSigns?: VitalSigns;        // O: Sinais Vitais
  physicalExam?: string;          // O: Exame Físico & Avaliação Funcional
  diagnosticHypothesis?: string;  // A: Hipótese Diagnóstica & Avaliação
  cid10Codes?: Array<{ code: string; description: string }>; // A: CIDs selecionados
  therapeuticPlan: string;        // P: Plano Terapêutico & Condutas
  prescriptions: string;          // Prescrições e Suplementação em texto
  examRequests?: string;          // Pedidos de Exames em texto
  evolutionNotes?: string;        // Notas de evolução
  
  // Imutabilidade e Adendos do CFM
  isSigned: boolean;
  signedAt?: string;
  signatureHash?: string;
  addendums?: MedicalRecordAddendum[]; // Erratas / Adendos pós-assinatura
  createdAt: string;
  updatedAt?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;        // Nome do fármaco / princípio ativo
  concentration: string;       // ex: 500mg, 10mg/mL
  pharmaceuticalForm: string;  // Comprimido, Cápsula, Gotas, Solução Injetável, Creme
  dosageInstruction: string;   // Posologia detalhada
  treatmentDuration: string;   // Duração: 7 dias, contínuo, 30 dias
  quantity: string;            // Quantidade: 1 caixa, 30 cápsulas, 2 frascos
  administrationRoute: string; // Oral, Tópica, Inalatória, Intramuscular, Intravenosa, Sublingual
}

export interface Prescription {
  id: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  patientAddress?: string;
  professionalId: string;
  professionalName: string;
  professionalCouncil: string;
  type: 'simples' | 'controle_especial'; // ANVISA Portaria 344/98
  specialControlNotificationType?: 'A1' | 'A2' | 'A3' | 'B1' | 'B2' | 'C1' | 'C2' | 'C5';
  prescriptionDate: string;
  validityDays: number; // 30 dias para controle especial
  items: PrescriptionItem[];
  generalInstructions?: string;
  isSigned: boolean;
  signatureHash?: string;
  buyerIdentification?: {
    name?: string;
    documentRg?: string;
    address?: string;
    phone?: string;
    city?: string;
    state?: string;
  };
  createdAt: string;
}

export type CertificateType = 
  | 'afastamento' 
  | 'aptidao_fisica' 
  | 'comparecimento' 
  | 'acompanhante' 
  | 'sanidade_mental';

export interface MedicalCertificate {
  id: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  patientSocialName?: string;
  professionalId: string;
  professionalName: string;
  professionalCouncil: string;
  type: CertificateType;
  issueDate: string;
  startDate?: string;
  daysOff?: number;
  hoursOff?: string; // ex: 08:00 às 12:00
  periodDescription?: string;
  activityPermitted?: string; // para aptidão física
  companionName?: string;     // para atestado de acompanhante
  companionKinship?: string;
  cid10Code?: string;         // Código CID-10 (salvo no prontuário)
  cid10Description?: string;
  showCidOnPrint: boolean;    // Resolução CFM nº 1.658/2002: apenas se solicitado expressamente pelo paciente
  purpose?: string;           // Fins periciais, trabalhistas, acadêmicos
  notes?: string;
  isSigned: boolean;
  signatureHash?: string;
  createdAt: string;
}

export interface LabOrderItem {
  id: string;
  examName: string;
  examType: 'laboratorial' | 'imagem' | 'outros';
  urgency: 'rotina' | 'urgente';
  observations?: string;
}

export interface LabOrder {
  id: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  patientName: string;
  patientCpf: string;
  professionalId: string;
  professionalName: string;
  professionalCouncil: string;
  orderDate: string;
  clinicalIndication: string; // Justificativa clínica (exigência convênios/CFM)
  items: LabOrderItem[];
  notes?: string;
  isSigned: boolean;
  signatureHash?: string;
  status: 'requested' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ExamResult {
  id: string;
  organizationId: string;
  patientId: string;
  orderId?: string;
  examName: string;
  examCategory: 'laboratorial' | 'imagem' | 'outros';
  performedDate: string;
  laboratoryName: string;
  reportSummary: string; // Laudo / Conclusão
  referenceValues?: string;
  status: 'performed' | 'evaluated' | 'critical';
  attachmentUrl?: string; // Link / Arquivo
  evaluatedByProfessionalName?: string;
  evaluatedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  organizationId: string;
  name: string;
  category: 'confirmation_48h' | 'reminder_24h' | 'day_reminder' | 'post_care' | 'birthday' | 'custom';
  channel: 'whatsapp' | 'email' | 'sms';
  content: string;
  variables: string[];
  isActive: boolean;
}

export interface MessageLog {
  id: string;
  organizationId: string;
  branchId?: string;
  patientId?: string;
  patientName: string;
  recipientPhone: string;
  channel: 'whatsapp' | 'email' | 'sms';
  direction: 'outbound' | 'inbound';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
}

export interface FinancialTransaction {
  id: string;
  organizationId: string;
  branchId: string;
  branchName: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  professionalId?: string;
  professionalName?: string;
  serviceId?: string;
  description: string;
  amount: number;
  type: 'receivable' | 'payable';
  paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'transfer';
  installments: number;
  status: 'paid' | 'pending' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  receiptNumber?: string;
  createdAt: string;
}

export interface WebsiteConfig {
  id: string;
  organizationId: string;
  clinicId: string;
  slug: string;
  customDomain?: string;
  title: string;
  tagline: string;
  paletteName: ColorPalette;
  heroHeadline: string;
  heroSubheadline: string;
  aboutText: string;
  medicalApproach: string;
  onlineBookingEnabled: boolean;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  isPublished: boolean;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  timestamp: string;
}

export type DomainType = 'clinic_app' | 'clinic_website' | 'app' | 'website';

export type AppEnvironmentMode = 
  | 'SAAS_LANDING'    // medsync.beaverstraining.com.br
  | 'SAAS_ADMIN'      // painelclinica.beaverstraining.com.br
  | 'CLINIC_APP'      // app.drnewtonmureb.com.br
  | 'CLINIC_WEBSITE';  // www.drnewtonmureb.com.br

export type DnsStatus = 'pending' | 'dns_configured' | 'propagating' | 'verified' | 'error';

export type SslStatus = 'pending' | 'provisioning' | 'active' | 'error';

export interface ClinicDomain {
  id: string;
  organizationId: string;
  clinicId: string;
  clinicName?: string;
  domain: string;
  domainType: DomainType;
  isVerified: boolean;
  isActive: boolean;
  verificationToken: string;
  dnsStatus: DnsStatus;
  sslStatus: SslStatus;
  expectedCname: string;
  verifiedAt?: string;
  lastDnsCheckAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ResolvedTenantContext {
  resolved: boolean;
  mode: AppEnvironmentMode;
  environment: 'app' | 'website' | 'saas_root';
  domain?: ClinicDomain;
  organizationId?: string;
  clinicId?: string;
  isSimulation?: boolean;
  impersonatingClinicId?: string;
}

