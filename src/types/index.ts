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
  documentCpf: string;
  birthDate: string;
  gender: string;
  phone: string;
  whatsapp: string;
  email: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
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

export interface MedicalRecordEntry {
  id: string;
  organizationId: string;
  patientId: string;
  branchId: string;
  professionalId: string;
  professionalName: string;
  appointmentId?: string;
  recordDate: string;
  chiefComplaint: string;         // Queixa Principal
  clinicalHistory: string;        // Anamnese / Histórico
  physicalExam?: string;          // Avaliação / Exame Físico
  diagnosticHypothesis?: string;  // Diagnóstico
  therapeuticPlan: string;        // Plano Terapêutico
  prescriptions: string;          // Prescrições e Suplementação
  examRequests?: string;          // Pedidos de Exames
  evolutionNotes?: string;        // Evolução
  isSigned: boolean;
  signatureHash?: string;
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

export type DomainType = 'app' | 'website';

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
  domain?: ClinicDomain;
  environment: 'app' | 'website' | 'saas_root';
  organizationId?: string;
  clinicId?: string;
  isSimulation?: boolean;
}

