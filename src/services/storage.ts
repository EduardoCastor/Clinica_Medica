import {
  Plan,
  Organization,
  Clinic,
  Branch,
  Room,
  UserProfile,
  Specialty,
  Professional,
  Service,
  Patient,
  Appointment,
  WaitlistEntry,
  MedicalRecordEntry,
  MessageTemplate,
  MessageLog,
  FinancialTransaction,
  WebsiteConfig,
  AuditLog,
  AppointmentStatus,
  ColorPalette
} from '../types';

import {
  INITIAL_PLANS,
  INITIAL_ORGANIZATION,
  INITIAL_CLINIC,
  INITIAL_BRANCHES,
  INITIAL_ROOMS,
  INITIAL_SPECIALTIES,
  INITIAL_PROFESSIONALS,
  INITIAL_SERVICES,
  INITIAL_USERS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_WAITLIST,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_TEMPLATES,
  INITIAL_MESSAGES,
  INITIAL_FINANCIAL,
  INITIAL_WEBSITE,
  INITIAL_AUDIT_LOGS
} from './mockData';

const STORAGE_KEYS = {
  PLANS: 'medsync_plans',
  ORGANIZATION: 'medsync_org',
  CLINIC: 'medsync_clinic',
  BRANCHES: 'medsync_branches',
  ROOMS: 'medsync_rooms',
  SPECIALTIES: 'medsync_specialties',
  PROFESSIONALS: 'medsync_professionals',
  SERVICES: 'medsync_services',
  USERS: 'medsync_users',
  PATIENTS: 'medsync_patients',
  APPOINTMENTS: 'medsync_appointments',
  WAITLIST: 'medsync_waitlist',
  MEDICAL_RECORDS: 'medsync_records',
  TEMPLATES: 'medsync_templates',
  MESSAGES: 'medsync_messages',
  FINANCIAL: 'medsync_financial',
  WEBSITE: 'medsync_website',
  AUDIT_LOGS: 'medsync_audit',
  ACTIVE_BRANCH_ID: 'medsync_active_branch',
  ACTIVE_USER_ID: 'medsync_active_user',
};

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Error reading key ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('medsync_storage_update'));
  } catch (e) {
    console.error(`Error writing key ${key} to localStorage:`, e);
  }
}

// Storage Service API
export const StorageService = {
  // Reset all data to factory demo state
  resetAll: () => {
    setStored(STORAGE_KEYS.PLANS, INITIAL_PLANS);
    setStored(STORAGE_KEYS.ORGANIZATION, INITIAL_ORGANIZATION);
    setStored(STORAGE_KEYS.CLINIC, INITIAL_CLINIC);
    setStored(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
    setStored(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    setStored(STORAGE_KEYS.SPECIALTIES, INITIAL_SPECIALTIES);
    setStored(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS);
    setStored(STORAGE_KEYS.SERVICES, INITIAL_SERVICES);
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStored(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    setStored(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    setStored(STORAGE_KEYS.WAITLIST, INITIAL_WAITLIST);
    setStored(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    setStored(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
    setStored(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    setStored(STORAGE_KEYS.FINANCIAL, INITIAL_FINANCIAL);
    setStored(STORAGE_KEYS.WEBSITE, INITIAL_WEBSITE);
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    window.dispatchEvent(new Event('medsync_storage_update'));
  },

  // Plans
  getPlans: (): Plan[] => getStored<Plan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS),
  savePlan: (plan: Plan): void => {
    const list = StorageService.getPlans();
    const index = list.findIndex(p => p.id === plan.id);
    if (index >= 0) {
      list[index] = plan;
    } else {
      list.push(plan);
    }
    setStored(STORAGE_KEYS.PLANS, list);
  },

  // Organization
  getOrganization: (): Organization => getStored<Organization>(STORAGE_KEYS.ORGANIZATION, INITIAL_ORGANIZATION),
  updateOrganization: (updates: Partial<Organization>): Organization => {
    const org = { ...StorageService.getOrganization(), ...updates };
    setStored(STORAGE_KEYS.ORGANIZATION, org);
    return org;
  },

  // Clinic
  getClinic: (): Clinic => getStored<Clinic>(STORAGE_KEYS.CLINIC, INITIAL_CLINIC),
  updateClinic: (updates: Partial<Clinic>): Clinic => {
    const clinic = { ...StorageService.getClinic(), ...updates };
    setStored(STORAGE_KEYS.CLINIC, clinic);
    return clinic;
  },

  // Branches
  getBranches: (): Branch[] => getStored<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES),
  saveBranch: (branch: Branch): void => {
    const list = StorageService.getBranches();
    const index = list.findIndex(b => b.id === branch.id);
    if (index >= 0) {
      list[index] = branch;
    } else {
      list.push(branch);
    }
    setStored(STORAGE_KEYS.BRANCHES, list);
  },

  // Rooms
  getRooms: (): Room[] => getStored<Room[]>(STORAGE_KEYS.ROOMS, INITIAL_ROOMS),
  saveRoom: (room: Room): void => {
    const list = StorageService.getRooms();
    const index = list.findIndex(r => r.id === room.id);
    if (index >= 0) {
      list[index] = room;
    } else {
      list.push(room);
    }
    setStored(STORAGE_KEYS.ROOMS, list);
  },

  // Users
  getUsers: (): UserProfile[] => getStored<UserProfile[]>(STORAGE_KEYS.USERS, INITIAL_USERS),
  saveUser: (user: UserProfile): void => {
    const list = StorageService.getUsers();
    const index = list.findIndex(u => u.id === user.id);
    if (index >= 0) {
      list[index] = user;
    } else {
      list.push(user);
    }
    setStored(STORAGE_KEYS.USERS, list);
  },

  // Specialties
  getSpecialties: (): Specialty[] => getStored<Specialty[]>(STORAGE_KEYS.SPECIALTIES, INITIAL_SPECIALTIES),
  saveSpecialty: (specialty: Specialty): void => {
    const list = StorageService.getSpecialties();
    const index = list.findIndex(s => s.id === specialty.id);
    if (index >= 0) {
      list[index] = specialty;
    } else {
      list.push(specialty);
    }
    setStored(STORAGE_KEYS.SPECIALTIES, list);
  },

  // Professionals
  getProfessionals: (): Professional[] => getStored<Professional[]>(STORAGE_KEYS.PROFESSIONALS, INITIAL_PROFESSIONALS),
  saveProfessional: (professional: Professional): void => {
    const list = StorageService.getProfessionals();
    const index = list.findIndex(p => p.id === professional.id);
    if (index >= 0) {
      list[index] = professional;
    } else {
      list.push(professional);
    }
    setStored(STORAGE_KEYS.PROFESSIONALS, list);
  },

  // Services
  getServices: (): Service[] => getStored<Service[]>(STORAGE_KEYS.SERVICES, INITIAL_SERVICES),
  saveService: (service: Service): void => {
    const list = StorageService.getServices();
    const index = list.findIndex(s => s.id === service.id);
    if (index >= 0) {
      list[index] = service;
    } else {
      list.push(service);
    }
    setStored(STORAGE_KEYS.SERVICES, list);
  },

  // Patients (with duplicate CPF prevention and Model A/B sharing logic)
  getPatients: (branchFilterId?: string): Patient[] => {
    const list = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    if (!branchFilterId || branchFilterId === 'all') return list;

    // Filter based on originBranch or authorized sharing
    return list.filter(p => {
      if (p.originBranchId === branchFilterId) return true;
      if (p.sharingMode === 'model_b_shared' && p.authorizedBranchIds?.includes(branchFilterId)) {
        return true;
      }
      return false;
    });
  },
  savePatient: (patient: Patient): { success: boolean; message?: string } => {
    const list = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    
    // Check CPF duplicate for other patients
    const normalizedCpf = patient.documentCpf.replace(/\D/g, '');
    const duplicate = list.find(p => p.id !== patient.id && p.documentCpf.replace(/\D/g, '') === normalizedCpf);
    if (duplicate) {
      return { 
        success: false, 
        message: `Já existe um paciente cadastrado com este CPF (${duplicate.fullName} na filial ${duplicate.originBranchId}). Evite duplicidades.` 
      };
    }

    const index = list.findIndex(p => p.id === patient.id);
    if (index >= 0) {
      list[index] = patient;
    } else {
      list.unshift(patient);
    }
    setStored(STORAGE_KEYS.PATIENTS, list);
    
    StorageService.addAuditLog({
      action: index >= 0 ? 'Atualizou Paciente' : 'Cadastrou Novo Paciente',
      entity: 'Paciente',
      entityId: patient.id,
      details: `${patient.fullName} (${patient.documentCpf}) - Filial Origem: ${patient.originBranchId}`,
    });

    return { success: true };
  },

  // Appointments
  getAppointments: (branchFilterId?: string): Appointment[] => {
    const list = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
    if (!branchFilterId || branchFilterId === 'all') return list;
    return list.filter(a => a.branchId === branchFilterId);
  },
  saveAppointment: (appointment: Appointment): { success: boolean; message?: string } => {
    const list = getStored<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);

    // Concurrency / duplicate slot check (unless marked as overbook / encaixe)
    if (!appointment.isOverbook && appointment.status !== 'cancelled') {
      const conflict = list.find(a => 
        a.id !== appointment.id &&
        a.professionalId === appointment.professionalId &&
        a.branchId === appointment.branchId &&
        a.status !== 'cancelled' &&
        new Date(a.startTime).getTime() < new Date(appointment.endTime).getTime() &&
        new Date(a.endTime).getTime() > new Date(appointment.startTime).getTime()
      );
      if (conflict) {
        return {
          success: false,
          message: `Conflito de horário! O profissional já possui uma consulta com ${conflict.patientName} no mesmo intervalo. Marque como "Encaixe" se desejar forçar.`
        };
      }
    }

    const index = list.findIndex(a => a.id === appointment.id);
    if (index >= 0) {
      list[index] = appointment;
    } else {
      list.unshift(appointment);
    }
    setStored(STORAGE_KEYS.APPOINTMENTS, list);

    StorageService.addAuditLog({
      action: index >= 0 ? `Atualizou Consulta (${appointment.status})` : 'Novo Agendamento Criado',
      entity: 'Agendamento',
      entityId: appointment.id,
      details: `Paciente: ${appointment.patientName} com ${appointment.professionalName} em ${new Date(appointment.startTime).toLocaleString('pt-BR')}`,
    });

    return { success: true };
  },
  updateAppointmentStatus: (id: string, status: AppointmentStatus, cancellationReason?: string): void => {
    const list = StorageService.getAppointments();
    const apt = list.find(a => a.id === id);
    if (apt) {
      apt.status = status;
      if (cancellationReason) apt.cancellationReason = cancellationReason;
      setStored(STORAGE_KEYS.APPOINTMENTS, list);

      StorageService.addAuditLog({
        action: `Status alterado para: ${status}`,
        entity: 'Agendamento',
        entityId: id,
        details: `Paciente ${apt.patientName}. ${cancellationReason ? `Motivo: ${cancellationReason}` : ''}`,
      });
    }
  },

  // Waitlist
  getWaitlist: (branchFilterId?: string): WaitlistEntry[] => {
    const list = getStored<WaitlistEntry[]>(STORAGE_KEYS.WAITLIST, INITIAL_WAITLIST);
    if (!branchFilterId || branchFilterId === 'all') return list;
    return list.filter(w => w.branchId === branchFilterId);
  },
  saveWaitlistEntry: (entry: WaitlistEntry): void => {
    const list = StorageService.getWaitlist();
    const index = list.findIndex(w => w.id === entry.id);
    if (index >= 0) {
      list[index] = entry;
    } else {
      list.unshift(entry);
    }
    setStored(STORAGE_KEYS.WAITLIST, list);
  },
  removeWaitlistEntry: (id: string): void => {
    const list = StorageService.getWaitlist().filter(w => w.id !== id);
    setStored(STORAGE_KEYS.WAITLIST, list);
  },

  // Medical Records (Electronic Health Record)
  getMedicalRecords: (patientId?: string): MedicalRecordEntry[] => {
    const list = getStored<MedicalRecordEntry[]>(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    if (!patientId) return list;
    return list.filter(r => r.patientId === patientId);
  },
  saveMedicalRecord: (record: MedicalRecordEntry): void => {
    const list = getStored<MedicalRecordEntry[]>(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    const index = list.findIndex(r => r.id === record.id);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    setStored(STORAGE_KEYS.MEDICAL_RECORDS, list);

    StorageService.addAuditLog({
      action: index >= 0 ? 'Atualizou Registro Clínico' : 'Novo Registro de Prontuário',
      entity: 'Prontuário',
      entityId: record.id,
      details: `Profissional: ${record.professionalName} - Queixa: ${record.chiefComplaint.substring(0, 60)}...`,
    });
  },

  // Message Templates & Logs
  getTemplates: (): MessageTemplate[] => getStored<MessageTemplate[]>(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES),
  saveTemplate: (template: MessageTemplate): void => {
    const list = StorageService.getTemplates();
    const index = list.findIndex(t => t.id === template.id);
    if (index >= 0) {
      list[index] = template;
    } else {
      list.push(template);
    }
    setStored(STORAGE_KEYS.TEMPLATES, list);
  },
  getMessages: (): MessageLog[] => getStored<MessageLog[]>(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES),
  sendMessage: (msg: Omit<MessageLog, 'id' | 'sentAt'>): MessageLog => {
    const fullMsg: MessageLog = {
      ...msg,
      id: `msg_${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    const list = StorageService.getMessages();
    list.unshift(fullMsg);
    setStored(STORAGE_KEYS.MESSAGES, list);

    StorageService.addAuditLog({
      action: `Envio de Mensagem WhatsApp (${fullMsg.status})`,
      entity: 'Comunicação',
      entityId: fullMsg.id,
      details: `Destinatário: ${fullMsg.patientName} (${fullMsg.recipientPhone})`,
    });

    return fullMsg;
  },

  // Financial Transactions
  getFinancial: (branchFilterId?: string): FinancialTransaction[] => {
    const list = getStored<FinancialTransaction[]>(STORAGE_KEYS.FINANCIAL, INITIAL_FINANCIAL);
    if (!branchFilterId || branchFilterId === 'all') return list;
    return list.filter(f => f.branchId === branchFilterId);
  },
  saveFinancialTransaction: (tx: FinancialTransaction): void => {
    const list = getStored<FinancialTransaction[]>(STORAGE_KEYS.FINANCIAL, INITIAL_FINANCIAL);
    const index = list.findIndex(f => f.id === tx.id);
    if (index >= 0) {
      list[index] = tx;
    } else {
      list.unshift(tx);
    }
    setStored(STORAGE_KEYS.FINANCIAL, list);

    StorageService.addAuditLog({
      action: index >= 0 ? 'Atualizou Lançamento Financeiro' : 'Novo Recebimento Registrado',
      entity: 'Financeiro',
      entityId: tx.id,
      details: `${tx.description} - R$ ${tx.amount.toFixed(2)} (${tx.paymentMethod})`,
    });
  },

  // Website Config
  getWebsite: (): WebsiteConfig => getStored<WebsiteConfig>(STORAGE_KEYS.WEBSITE, INITIAL_WEBSITE),
  updateWebsite: (updates: Partial<WebsiteConfig>): WebsiteConfig => {
    const site = { ...StorageService.getWebsite(), ...updates };
    setStored(STORAGE_KEYS.WEBSITE, site);
    return site;
  },

  // Audit Logs
  getAuditLogs: (): AuditLog[] => getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  addAuditLog: (entry: { action: string; entity: string; entityId?: string; details: string }): void => {
    const currentUsers = StorageService.getUsers();
    const activeUserId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) : null;
    const currentUser = currentUsers.find(u => u.id === activeUserId) || currentUsers[2]; // Default Dr. Newton

    const log: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: 'org_mureb_01',
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      details: entry.details,
      timestamp: new Date().toISOString(),
    };

    const list = StorageService.getAuditLogs();
    list.unshift(log);
    setStored(STORAGE_KEYS.AUDIT_LOGS, list.slice(0, 100)); // Keep latest 100
  },

  // Active Branch Preference
  getActiveBranchId: (): string => {
    if (typeof window === 'undefined') return 'all';
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH_ID) || 'all';
  },
  setActiveBranchId: (id: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH_ID, id);
    window.dispatchEvent(new Event('medsync_storage_update'));
  },

  // Active User / Role Switcher for Testing
  getActiveUserId: (): string => {
    if (typeof window === 'undefined') return 'usr_doctor_newton';
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || 'usr_doctor_newton';
  },
  setActiveUserId: (id: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
    window.dispatchEvent(new Event('medsync_storage_update'));
  }
};
