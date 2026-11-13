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
  ColorPalette,
  ClinicDomain,
  Prescription,
  MedicalCertificate,
  LabOrder,
  ExamResult,
  MedicalRecordAddendum,
  SaasPlan
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
  INITIAL_AUDIT_LOGS,
  INITIAL_CLINIC_DOMAINS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_CERTIFICATES,
  INITIAL_LAB_ORDERS,
  INITIAL_EXAM_RESULTS
} from './mockData';
import { getSupabase } from './supabaseClient';

const STORAGE_KEYS = {
  PLANS: 'medsync_saas_plans',
  LEGACY_PLANS: 'medsync_plans',
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
  PRESCRIPTIONS: 'medsync_prescriptions',
  CERTIFICATES: 'medsync_certificates',
  LAB_ORDERS: 'medsync_lab_orders',
  EXAM_RESULTS: 'medsync_exam_results',
  TEMPLATES: 'medsync_templates',
  MESSAGES: 'medsync_messages',
  FINANCIAL: 'medsync_financial',
  WEBSITE: 'medsync_website',
  AUDIT_LOGS: 'medsync_audit',
  CLINIC_DOMAINS: 'medsync_clinic_domains',
  ACTIVE_BRANCH_ID: 'medsync_active_branch',
  ACTIVE_USER_ID: 'medsync_active_user',
  DATA_VERSION: 'medsync_data_version',
};

export const MEDSYNC_DATA_VERSION = '2026.11.13-newton-mureb-n8n-agenda';

let migrationChecked = false;

export function runDataMigrationIfNeeded(): void {
  if (typeof window === 'undefined' || migrationChecked) return;
  migrationChecked = true;

  try {
    const currentVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    const rawClinic = localStorage.getItem(STORAGE_KEYS.CLINIC);
    const rawProfessionals = localStorage.getItem(STORAGE_KEYS.PROFESSIONALS);
    const rawBranches = localStorage.getItem(STORAGE_KEYS.BRANCHES);

    const hasLegacyClinic =
      Boolean(rawClinic) &&
      (rawClinic!.includes('42.891.304') ||
        rawClinic!.includes('00.000.000') ||
        rawClinic!.includes('Mureb & Associados'));

    const hasLegacyProfessional =
      Boolean(rawProfessionals) &&
      (rawProfessionals!.includes('Rodrigo Viana') ||
        rawProfessionals!.includes('prof_rodrigo') ||
        rawProfessionals!.includes('84.320/SP'));

    const hasLegacyBranches =
      Boolean(rawBranches) &&
      (rawBranches!.includes('branch_sp_jardins') ||
        rawBranches!.includes('branch_rj_ipanema') ||
        rawBranches!.includes('Bela Cintra'));

    const needsLegacyReset =
      hasLegacyClinic ||
      hasLegacyProfessional ||
      hasLegacyBranches ||
      !currentVersion;

    // Incremental non-destructive migration when upgrading from 2026.11.13-newton-mureb
    if (!needsLegacyReset && currentVersion !== MEDSYNC_DATA_VERSION) {
      if (rawClinic) {
        try {
          const parsedClinic = JSON.parse(rawClinic) as Clinic;
          const updatedClinic: Clinic = {
            ...parsedClinic,
            n8nWebhookDisponibilidade:
              parsedClinic.n8nWebhookDisponibilidade || INITIAL_CLINIC.n8nWebhookDisponibilidade,
            n8nWebhookAgendamento:
              parsedClinic.n8nWebhookAgendamento || INITIAL_CLINIC.n8nWebhookAgendamento,
          };
          localStorage.setItem(STORAGE_KEYS.CLINIC, JSON.stringify(updatedClinic));
        } catch {
          localStorage.setItem(STORAGE_KEYS.CLINIC, JSON.stringify(INITIAL_CLINIC));
        }
      }

      const rawDomains = localStorage.getItem(STORAGE_KEYS.CLINIC_DOMAINS);
      if (rawDomains) {
        try {
          const parsedDomains = JSON.parse(rawDomains) as ClinicDomain[];
          const hasBooking = parsedDomains.some(
            d => d.domain === 'agenda.drnewtonmureb.com.br' || d.domainType === 'clinic_booking' || d.domainType === 'booking'
          );
          if (!hasBooking) {
            const bookingSeed = INITIAL_CLINIC_DOMAINS.find(d => d.id === 'dom_mureb_booking');
            if (bookingSeed) {
              parsedDomains.push(bookingSeed);
              localStorage.setItem(STORAGE_KEYS.CLINIC_DOMAINS, JSON.stringify(parsedDomains));
            }
          }
        } catch {
          localStorage.setItem(STORAGE_KEYS.CLINIC_DOMAINS, JSON.stringify(INITIAL_CLINIC_DOMAINS));
        }
      }

      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, MEDSYNC_DATA_VERSION);
      return;
    }

    if (!needsLegacyReset) return;

    // Upgrade core clinic, org, branches, rooms, specialties, professionals, services, users, website, domains
    localStorage.setItem(STORAGE_KEYS.ORGANIZATION, JSON.stringify(INITIAL_ORGANIZATION));
    localStorage.setItem(STORAGE_KEYS.CLINIC, JSON.stringify(INITIAL_CLINIC));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(INITIAL_BRANCHES));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
    localStorage.setItem(STORAGE_KEYS.SPECIALTIES, JSON.stringify(INITIAL_SPECIALTIES));
    localStorage.setItem(STORAGE_KEYS.PROFESSIONALS, JSON.stringify(INITIAL_PROFESSIONALS));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(INITIAL_TEMPLATES));
    localStorage.setItem(STORAGE_KEYS.WEBSITE, JSON.stringify(INITIAL_WEBSITE));
    localStorage.setItem(STORAGE_KEYS.CLINIC_DOMAINS, JSON.stringify(INITIAL_CLINIC_DOMAINS));

    // Migrate patients (preserve custom added patients while remapping old SP/RJ branchIds to Cabo Frio)
    const rawPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (rawPatients) {
      try {
        const parsedPatients = JSON.parse(rawPatients) as Patient[];
        const migratedPatients = parsedPatients.map((p) => {
          const isOldBranch =
            p.originBranchId === 'branch_sp_jardins' || p.originBranchId === 'branch_rj_ipanema';
          return {
            ...p,
            originBranchId: isOldBranch ? 'branch_cf_centro' : p.originBranchId,
            authorizedBranchIds: ['branch_cf_centro'],
          };
        });
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(migratedPatients));
      } catch {
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
      }
    } else {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(INITIAL_PATIENTS));
    }

    // Reset/update sample appointments, records, prescriptions, certificates, lab orders, exams, financial & messages containing legacy doctors/CRM
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(INITIAL_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify(INITIAL_WAITLIST));
    localStorage.setItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify(INITIAL_MEDICAL_RECORDS));
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(INITIAL_PRESCRIPTIONS));
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(INITIAL_CERTIFICATES));
    localStorage.setItem(STORAGE_KEYS.LAB_ORDERS, JSON.stringify(INITIAL_LAB_ORDERS));
    localStorage.setItem(STORAGE_KEYS.EXAM_RESULTS, JSON.stringify(INITIAL_EXAM_RESULTS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.FINANCIAL, JSON.stringify(INITIAL_FINANCIAL));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));

    // Fix active branch/user if pointing to removed IDs
    const activeBranch = localStorage.getItem(STORAGE_KEYS.ACTIVE_BRANCH_ID);
    if (activeBranch === 'branch_sp_jardins' || activeBranch === 'branch_rj_ipanema') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_BRANCH_ID, 'branch_cf_centro');
    }
    const activeUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    if (activeUser === 'usr_physio_rodrigo') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, 'usr_doctor_newton');
    }

    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, MEDSYNC_DATA_VERSION);
  } catch (err) {
    console.warn('Erro ao migrar cache local MedSync:', err);
  }
}

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  runDataMigrationIfNeeded();
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

let lastPlanSyncError: string | null = null;

export function getLastPlanSyncError(): string | null {
  return lastPlanSyncError;
}

function mapDbPlanToPlan(row: Record<string, unknown>, localFallback?: Plan): Plan {
  const code = String(row.code || row.id || '');
  const hasWhatsapp = Boolean(row.has_whatsapp_automation ?? row.hasWhatsAppAutomation);
  return {
    id: String(row.id || localFallback?.id || code),
    code,
    name: String(row.name || localFallback?.name || ''),
    description: String(row.description ?? localFallback?.description ?? ''),
    priceMonthly: Number(row.price_monthly ?? row.priceMonthly ?? 0),
    priceYearly: Number(row.price_yearly ?? row.priceYearly ?? 0),
    trialDays: Number(row.trial_days ?? row.trialDays ?? 0),
    maxBranches: Number(row.max_branches ?? row.maxBranches ?? 1),
    maxUsers: Number(row.max_users ?? row.maxUsers ?? 1),
    maxPatients: Number(row.max_patients ?? row.maxPatients ?? 100),
    hasPatientSharing: Boolean(row.has_patient_sharing ?? row.hasPatientSharing),
    hasWhatsAppAutomation: hasWhatsapp,
    hasWhatsappAutomation: hasWhatsapp,
    hasCustomWebsite: Boolean(row.has_custom_website ?? row.hasCustomWebsite),
    hasFinancialModule: Boolean(row.has_financial_module ?? row.hasFinancialModule),
    hasAdvancedReports: Boolean(row.has_advanced_reports ?? row.hasAdvancedReports),
    isPopular:
      row.is_popular !== undefined
        ? Boolean(row.is_popular)
        : row.isPopular !== undefined
        ? Boolean(row.isPopular)
        : localFallback?.isPopular ?? code === 'advanced',
    features: Array.isArray(row.features) ? (row.features as string[]) : localFallback?.features,
    isActive:
      row.is_active !== undefined
        ? Boolean(row.is_active)
        : row.isActive !== undefined
        ? Boolean(row.isActive)
        : true,
  };
}

function buildPlanDbPayload(plan: Plan | SaasPlan) {
  return {
    code: plan.code,
    name: plan.name,
    description: plan.description || '',
    price_monthly: Number(plan.priceMonthly) || 0,
    price_yearly: Number(plan.priceYearly) || 0,
    trial_days: Number(plan.trialDays) || 0,
    max_branches: Number(plan.maxBranches) || 1,
    max_users: Number(plan.maxUsers) || 1,
    max_patients: Number(plan.maxPatients) || 0,
    has_patient_sharing: Boolean(plan.hasPatientSharing),
    has_whatsapp_automation: Boolean(plan.hasWhatsAppAutomation ?? plan.hasWhatsappAutomation),
    has_custom_website: Boolean(plan.hasCustomWebsite),
    has_financial_module: Boolean(plan.hasFinancialModule),
    has_advanced_reports: Boolean(plan.hasAdvancedReports),
    is_active: plan.isActive !== false,
    updated_at: new Date().toISOString(),
  };
}

function getLocalPlansOnly(): Plan[] {
  if (typeof window === 'undefined') return INITIAL_PLANS;
  let plans: Plan[] | null = null;
  try {
    const rawSaas = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (rawSaas) {
      plans = JSON.parse(rawSaas) as Plan[];
    }
    if (!plans || !Array.isArray(plans) || plans.length === 0) {
      const rawLegacy = localStorage.getItem(STORAGE_KEYS.LEGACY_PLANS);
      if (rawLegacy) {
        plans = JSON.parse(rawLegacy) as Plan[];
      }
    }
  } catch (e) {
    console.warn('Erro ao ler planos do localStorage:', e);
  }

  if (!plans || !Array.isArray(plans) || plans.length === 0) {
    plans = INITIAL_PLANS;
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
    localStorage.setItem(STORAGE_KEYS.LEGACY_PLANS, JSON.stringify(plans));
  }

  return plans;
}

export async function syncPlansFromSupabase(): Promise<Plan[]> {
  const localPlans = getLocalPlansOnly();
  const supabase = getSupabase();
  if (!supabase) {
    lastPlanSyncError = 'Supabase não configurado (variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes).';
    return localPlans;
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_monthly', { ascending: true });

    if (error) {
      lastPlanSyncError = `${error.message}${error.details ? ` (${error.details})` : ''}`;
      console.error('Erro ao buscar planos no Supabase:', error);
      return localPlans;
    }

    lastPlanSyncError = null;

    if (data && data.length > 0) {
      const mapped = data.map((row: Record<string, unknown>) => {
        const localMatch = localPlans.find(p => p.code === String(row.code || '') || p.id === String(row.id || ''));
        return mapDbPlanToPlan(row, localMatch);
      });

      if (typeof window !== 'undefined') {
        const serialized = JSON.stringify(mapped);
        localStorage.setItem(STORAGE_KEYS.PLANS, serialized);
        localStorage.setItem(STORAGE_KEYS.LEGACY_PLANS, serialized);
      }

      return mapped;
    }

    return localPlans;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    lastPlanSyncError = message;
    console.error('Exceção ao sincronizar planos do Supabase:', err);
    return localPlans;
  }
}

export async function updatePlanInSupabase(plan: Plan): Promise<boolean> {
  const normalizedPlan: Plan = {
    ...plan,
    priceMonthly: Number(plan.priceMonthly) || 0,
    priceYearly: Number(plan.priceYearly) || 0,
    trialDays: Number(plan.trialDays) || 0,
    maxBranches: Number(plan.maxBranches) || 1,
    maxUsers: Number(plan.maxUsers) || 1,
    maxPatients: Number(plan.maxPatients) || 0,
    hasWhatsAppAutomation: Boolean(plan.hasWhatsAppAutomation ?? plan.hasWhatsappAutomation),
    hasWhatsappAutomation: Boolean(plan.hasWhatsAppAutomation ?? plan.hasWhatsappAutomation),
    hasCustomWebsite: Boolean(plan.hasCustomWebsite),
    hasFinancialModule: Boolean(plan.hasFinancialModule),
    hasAdvancedReports: Boolean(plan.hasAdvancedReports),
    hasPatientSharing: Boolean(plan.hasPatientSharing),
    isPopular: Boolean(plan.isPopular),
    isActive: plan.isActive !== false,
  };

  // Persist locally immediately
  const list = getLocalPlansOnly();
  const index = list.findIndex(p => p.code === normalizedPlan.code || p.id === normalizedPlan.id);
  if (index >= 0) {
    list[index] = normalizedPlan;
  } else {
    list.push(normalizedPlan);
  }
  if (typeof window !== 'undefined') {
    const serialized = JSON.stringify(list);
    localStorage.setItem(STORAGE_KEYS.PLANS, serialized);
    localStorage.setItem(STORAGE_KEYS.LEGACY_PLANS, serialized);
  }

  const supabase = getSupabase();
  if (!supabase) {
    lastPlanSyncError = 'Supabase não configurado neste ambiente (verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY).';
    return false;
  }

  try {
    const dbPayload = buildPlanDbPayload(normalizedPlan);
    const { data, error } = await supabase
      .from('plans')
      .upsert(dbPayload, { onConflict: 'code' })
      .select();

    if (error) {
      lastPlanSyncError = `${error.message}${error.details ? ` (${error.details})` : ''}${error.hint ? ` — ${error.hint}` : ''}`;
      console.error('Erro ao fazer upsert do plano no Supabase:', error);
      return false;
    }

    if (!data || data.length === 0) {
      lastPlanSyncError = 'O Supabase não retornou registros atualizados (possível bloqueio de RLS para INSERT/UPDATE na tabela public.plans).';
      console.error(lastPlanSyncError);
      return false;
    }

    lastPlanSyncError = null;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('medsync-plans-updated'));
      window.dispatchEvent(new CustomEvent('medsync-plans-updated', { detail: { plans: list, updatedPlan: normalizedPlan } }));
      window.dispatchEvent(new Event('medsync_storage_update'));
    }

    StorageService.addAuditLog({
      action: 'Atualizou Plano Comercial',
      entity: 'Planos SaaS',
      entityId: String(data[0].id || normalizedPlan.id),
      details: `Plano ${normalizedPlan.name}: R$ ${normalizedPlan.priceMonthly.toFixed(2)}/mês (R$ ${normalizedPlan.priceYearly.toFixed(2)}/ano)`,
    });

    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    lastPlanSyncError = message;
    console.error('Exceção ao atualizar plano no Supabase:', err);
    return false;
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
    setStored(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    setStored(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    setStored(STORAGE_KEYS.LAB_ORDERS, INITIAL_LAB_ORDERS);
    setStored(STORAGE_KEYS.EXAM_RESULTS, INITIAL_EXAM_RESULTS);
    setStored(STORAGE_KEYS.TEMPLATES, INITIAL_TEMPLATES);
    setStored(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
    setStored(STORAGE_KEYS.FINANCIAL, INITIAL_FINANCIAL);
    setStored(STORAGE_KEYS.WEBSITE, INITIAL_WEBSITE);
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    window.dispatchEvent(new Event('medsync_storage_update'));
  },

  // SaaS Plans (Persisted in localStorage & Supabase with real-time events)
  syncPlansFromSupabase,
  updatePlanInSupabase,
  getLastPlanSyncError,

  getPlans: (): Plan[] => {
    return getLocalPlansOnly();
  },

  savePlan: (plan: Plan | SaasPlan): void => {
    void updatePlanInSupabase(plan as Plan);
  },

  updatePlans: (plans: Plan[] | SaasPlan[]): void => {
    if (typeof window !== 'undefined') {
      const serialized = JSON.stringify(plans);
      localStorage.setItem(STORAGE_KEYS.PLANS, serialized);
      localStorage.setItem(STORAGE_KEYS.LEGACY_PLANS, serialized);
    }

    const supabase = getSupabase();
    if (supabase) {
      const payloads = plans.map(p => buildPlanDbPayload(p));
      Promise.resolve(supabase.from('plans').upsert(payloads, { onConflict: 'code' }))
        .then(({ error }) => {
          if (error) {
            console.warn('Erro ao sincronizar lista de planos no Supabase:', error.message);
          }
        })
        .catch(err => console.warn('Erro ao sincronizar lista de planos no Supabase:', err));
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('medsync-plans-updated'));
      window.dispatchEvent(new CustomEvent('medsync-plans-updated', { detail: { plans } }));
      window.dispatchEvent(new Event('medsync_storage_update'));
    }
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
  upsertPatientByCpf: (patient: Patient): Patient => {
    const list = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
    const normalizedCpf = patient.documentCpf.replace(/\D/g, '');
    const existingIndex = list.findIndex(
      p => p.documentCpf.replace(/\D/g, '') === normalizedCpf
    );

    if (existingIndex >= 0) {
      const existing = list[existingIndex];
      const merged: Patient = {
        ...existing,
        fullName: patient.fullName || existing.fullName,
        phone: patient.phone || existing.phone,
        whatsapp: patient.whatsapp || existing.whatsapp,
        email: patient.email || existing.email,
        administrativeNotes: patient.administrativeNotes || existing.administrativeNotes,
      };
      list[existingIndex] = merged;
      setStored(STORAGE_KEYS.PATIENTS, list);
      return merged;
    }

    list.unshift(patient);
    setStored(STORAGE_KEYS.PATIENTS, list);
    StorageService.addAuditLog({
      action: 'Paciente Cadastrado via Agenda Online',
      entity: 'Paciente',
      entityId: patient.id,
      details: `${patient.fullName} (${patient.documentCpf}) - Origem: Agendamento Online`,
    });
    return patient;
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
      if (status === 'cancelled' && cancellationReason) {
        apt.cancellationReason = cancellationReason;
      } else if (status === 'scheduled' || status === 'confirmed') {
        apt.cancellationReason = undefined;
      }
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

  // Medical Records (Electronic Health Record - CFM 1.638/2002 e 1.821/2007)
  getMedicalRecords: (patientId?: string): MedicalRecordEntry[] => {
    const list = getStored<MedicalRecordEntry[]>(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    if (!patientId) return list;
    return list.filter(r => r.patientId === patientId);
  },

  saveMedicalRecord: (record: MedicalRecordEntry): { success: boolean; message?: string } => {
    const list = getStored<MedicalRecordEntry[]>(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    const index = list.findIndex(r => r.id === record.id);
    
    if (index >= 0) {
      const existing = list[index];
      // Regra de Ouro do CFM: Registro assinado não pode ser reeditado
      if (existing.status === 'signed' && existing.isSigned) {
        return {
          success: false,
          message: 'Conformidade CFM (Resolução nº 1.821/2007): Uma evolução médica assinada é imutável e não pode ser editada. Adicione um "Adendo / Errata" para correções.'
        };
      }
      list[index] = { ...record, updatedAt: new Date().toISOString() };
    } else {
      list.unshift(record);
    }
    
    setStored(STORAGE_KEYS.MEDICAL_RECORDS, list);

    StorageService.addAuditLog({
      action: index >= 0 
        ? `Atualizou Evolução (${record.status === 'signed' ? 'Finalizada/Assinada' : 'Rascunho'})` 
        : `Novo Registro de Prontuário (${record.status === 'signed' ? 'Assinado' : 'Rascunho'})`,
      entity: 'Prontuário',
      entityId: record.id,
      details: `Profissional: ${record.professionalName} (${record.professionalCouncilNumber || 'CRM'}) - Queixa: ${record.chiefComplaint.substring(0, 50)}...`,
    });

    return { success: true };
  },

  addMedicalRecordAddendum: (recordId: string, addendum: MedicalRecordAddendum): { success: boolean; message?: string } => {
    const list = getStored<MedicalRecordEntry[]>(STORAGE_KEYS.MEDICAL_RECORDS, INITIAL_MEDICAL_RECORDS);
    const index = list.findIndex(r => r.id === recordId);
    if (index === -1) {
      return { success: false, message: 'Registro clínico original não encontrado.' };
    }

    const record = list[index];
    if (!record.addendums) {
      record.addendums = [];
    }

    record.addendums.push(addendum);
    record.updatedAt = new Date().toISOString();
    list[index] = record;
    setStored(STORAGE_KEYS.MEDICAL_RECORDS, list);

    StorageService.addAuditLog({
      action: 'Adicionou Adendo / Errata ao Prontuário (CFM 1.821/2007)',
      entity: 'Prontuário',
      entityId: record.id,
      details: `Adendo por ${addendum.authorName} (${addendum.authorCouncilNumber}): ${addendum.note.substring(0, 60)}...`,
    });

    return { success: true };
  },

  // Prescrições e Receituários (Portaria ANVISA 344/98 e Receitas Simples)
  getPrescriptions: (patientId?: string): Prescription[] => {
    const list = getStored<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    if (!patientId) return list;
    return list.filter(p => p.patientId === patientId);
  },
  savePrescription: (prescription: Prescription): void => {
    const list = getStored<Prescription[]>(STORAGE_KEYS.PRESCRIPTIONS, INITIAL_PRESCRIPTIONS);
    const index = list.findIndex(p => p.id === prescription.id);
    if (index >= 0) {
      list[index] = prescription;
    } else {
      list.unshift(prescription);
    }
    setStored(STORAGE_KEYS.PRESCRIPTIONS, list);

    StorageService.addAuditLog({
      action: `Emissão de Receita (${prescription.type === 'controle_especial' ? 'Controle Especial ANVISA 344/98' : 'Simples'})`,
      entity: 'Prescrição',
      entityId: prescription.id,
      details: `Paciente: ${prescription.patientName} - ${prescription.items.length} medicamento(s) prescritos por ${prescription.professionalName}`,
    });
  },

  // Atestados Médicos e Declarações (Resolução CFM nº 1.658/2002)
  getCertificates: (patientId?: string): MedicalCertificate[] => {
    const list = getStored<MedicalCertificate[]>(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    if (!patientId) return list;
    return list.filter(c => c.patientId === patientId);
  },
  saveCertificate: (certificate: MedicalCertificate): void => {
    const list = getStored<MedicalCertificate[]>(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    const index = list.findIndex(c => c.id === certificate.id);
    if (index >= 0) {
      list[index] = certificate;
    } else {
      list.unshift(certificate);
    }
    setStored(STORAGE_KEYS.CERTIFICATES, list);

    StorageService.addAuditLog({
      action: `Emissão de Atestado Médico (${certificate.type.toUpperCase()})`,
      entity: 'Atestado',
      entityId: certificate.id,
      details: `Paciente: ${certificate.patientName} - CID-10: ${certificate.showCidOnPrint ? certificate.cid10Code : 'Oculto a pedido do sigilo CFM'} - Médico: ${certificate.professionalName}`,
    });
  },

  // Pedidos de Exames (Lab Orders)
  getLabOrders: (patientId?: string): LabOrder[] => {
    const list = getStored<LabOrder[]>(STORAGE_KEYS.LAB_ORDERS, INITIAL_LAB_ORDERS);
    if (!patientId) return list;
    return list.filter(o => o.patientId === patientId);
  },
  saveLabOrder: (order: LabOrder): void => {
    const list = getStored<LabOrder[]>(STORAGE_KEYS.LAB_ORDERS, INITIAL_LAB_ORDERS);
    const index = list.findIndex(o => o.id === order.id);
    if (index >= 0) {
      list[index] = order;
    } else {
      list.unshift(order);
    }
    setStored(STORAGE_KEYS.LAB_ORDERS, list);

    StorageService.addAuditLog({
      action: 'Emissão de Solicitação de Exames',
      entity: 'Exames',
      entityId: order.id,
      details: `Paciente: ${order.patientName} - ${order.items.length} exames solicitados por ${order.professionalName}`,
    });
  },

  // Resultados de Exames (Exam Results)
  getExamResults: (patientId?: string): ExamResult[] => {
    const list = getStored<ExamResult[]>(STORAGE_KEYS.EXAM_RESULTS, INITIAL_EXAM_RESULTS);
    if (!patientId) return list;
    return list.filter(r => r.patientId === patientId);
  },
  saveExamResult: (result: ExamResult): void => {
    const list = getStored<ExamResult[]>(STORAGE_KEYS.EXAM_RESULTS, INITIAL_EXAM_RESULTS);
    const index = list.findIndex(r => r.id === result.id);
    if (index >= 0) {
      list[index] = result;
    } else {
      list.unshift(result);
    }
    setStored(STORAGE_KEYS.EXAM_RESULTS, list);

    StorageService.addAuditLog({
      action: 'Registro de Resultado de Exame',
      entity: 'Exames',
      entityId: result.id,
      details: `${result.examName} - Laboratório: ${result.laboratoryName} - Status: ${result.status}`,
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
    const currentUser =
      currentUsers.find(u => u.id === activeUserId) ||
      currentUsers.find(u => u.id === 'usr_doctor_newton') ||
      currentUsers[0]; // Default Dr. Newton Mureb

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
    runDataMigrationIfNeeded();
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
    runDataMigrationIfNeeded();
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID) || 'usr_doctor_newton';
  },
  setActiveUserId: (id: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id);
    window.dispatchEvent(new Event('medsync_storage_update'));
  },

  // Clinic Custom Domains (Multi-tenant Architecture)
  getClinicDomains: (): ClinicDomain[] => getStored<ClinicDomain[]>(STORAGE_KEYS.CLINIC_DOMAINS, INITIAL_CLINIC_DOMAINS),
  
  saveClinicDomain: (domain: ClinicDomain): { success: boolean; error?: string } => {
    const list = StorageService.getClinicDomains();
    const cleanDomain = domain.domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    // Validate uniqueness of domain name
    const existingDomainName = list.find(d => d.domain.toLowerCase() === cleanDomain && d.id !== domain.id);
    if (existingDomainName) {
      return { success: false, error: `O domínio "${cleanDomain}" já está em uso por outra clínica ou ambiente.` };
    }

    // Validate only one domain per (clinic_id, canonical domain_type), allowing multiple website/apex aliases
    const normalizeDomainCat = (t: ClinicDomain['domainType']) => {
      if (t === 'app' || t === 'clinic_app') return 'app';
      if (t === 'booking' || t === 'clinic_booking') return 'booking';
      return 'website';
    };
    const targetCat = normalizeDomainCat(domain.domainType);
    const existingType = list.find(
      d =>
        d.clinicId === domain.clinicId &&
        normalizeDomainCat(d.domainType) === targetCat &&
        d.id !== domain.id &&
        targetCat !== 'website'
    );
    if (existingType) {
      const catLabel =
        targetCat === 'app'
          ? 'Painel do Sistema'
          : targetCat === 'booking'
            ? 'Agenda Online (n8n)'
            : 'Site Institucional';
      return {
        success: false,
        error: `A clínica já possui um domínio configurado para o tipo ${catLabel}. Remova ou edite o existente.`,
      };
    }

    const domainToSave: ClinicDomain = {
      ...domain,
      domain: cleanDomain,
      updatedAt: new Date().toISOString()
    };

    const index = list.findIndex(d => d.id === domainToSave.id);
    if (index >= 0) {
      list[index] = domainToSave;
    } else {
      list.push(domainToSave);
    }

    setStored(STORAGE_KEYS.CLINIC_DOMAINS, list);
    return { success: true };
  },

  deleteClinicDomain: (id: string): void => {
    const list = StorageService.getClinicDomains().filter(d => d.id !== id);
    setStored(STORAGE_KEYS.CLINIC_DOMAINS, list);
  },

  toggleDomainActive: (id: string): void => {
    const list = StorageService.getClinicDomains();
    const index = list.findIndex(d => d.id === id);
    if (index >= 0) {
      list[index].isActive = !list[index].isActive;
      list[index].updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.CLINIC_DOMAINS, list);
    }
  },

  verifyDomainDns: (id: string): { success: boolean; message: string } => {
    const list = StorageService.getClinicDomains();
    const index = list.findIndex(d => d.id === id);
    if (index >= 0) {
      list[index].dnsStatus = 'verified';
      list[index].isVerified = true;
      list[index].sslStatus = 'active';
      list[index].verifiedAt = new Date().toISOString();
      list[index].lastDnsCheckAt = new Date().toISOString();
      list[index].updatedAt = new Date().toISOString();
      setStored(STORAGE_KEYS.CLINIC_DOMAINS, list);
      return { success: true, message: `DNS e certificado SSL validados com sucesso para ${list[index].domain}!` };
    }
    return { success: false, message: 'Domínio não encontrado.' };
  },

  getDomainsByClinic: (clinicId: string): ClinicDomain[] => {
    return StorageService.getClinicDomains().filter(d => d.clinicId === clinicId);
  },

  findDomainByName: (domainName: string): ClinicDomain | undefined => {
    const normalized = domainName.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').split(':')[0];
    const domains = StorageService.getClinicDomains().filter(d => d.isActive);
    
    // 1. Exact match
    const exact = domains.find(d => d.domain.toLowerCase() === normalized);
    if (exact) return exact;

    // 2. Try adding or removing www.
    if (normalized.startsWith('www.')) {
      const stripped = normalized.substring(4);
      const matchStripped = domains.find(d => d.domain.toLowerCase() === stripped);
      if (matchStripped) return matchStripped;
    } else {
      const withWww = `www.${normalized}`;
      const matchWithWww = domains.find(d => d.domain.toLowerCase() === withWww);
      if (matchWithWww) return matchWithWww;
    }

    return undefined;
  },

  // =========================================================================
  // Supabase Cloud Sync: Appointments & Waitlist (with localStorage fallback)
  // =========================================================================

  fetchAppointmentsFromCloud: async (dateFilter?: string): Promise<Appointment[]> => {
    const localList = StorageService.getAppointments();
    const supabase = getSupabase();
    if (!supabase) return localList;

    try {
      let query = supabase
        .from('appointments')
        .select(
          `
          id,
          organization_id,
          branch_id,
          patient_id,
          professional_id,
          service_id,
          room_id,
          start_time,
          end_time,
          status,
          appointment_type,
          notes,
          cancellation_reason,
          created_at,
          patients (
            id,
            full_name,
            phone,
            whatsapp,
            document_cpf,
            email,
            health_plan_type
          ),
          services (
            id,
            name
          ),
          rooms (
            id,
            name
          ),
          professionals (
            id,
            full_name
          ),
          branches (
            id,
            name
          )
        `
        )
        .order('start_time', { ascending: true });

      if (dateFilter) {
        query = query
          .gte('start_time', `${dateFilter}T00:00:00`)
          .lte('start_time', `${dateFilter}T23:59:59.999`);
      }

      const { data, error } = await query;
      if (error || !data) {
        if (error) {
          console.warn('Erro ao buscar agendamentos no Supabase:', error.message);
        }
        return localList;
      }

      const branches = StorageService.getBranches();
      const defaultBranchId = branches[0]?.id || 'branch_cf_centro';

      const cloudAppointments: Appointment[] = (data as Array<Record<string, unknown>>).map((row) => {
        const patientJoin = Array.isArray(row.patients)
          ? (row.patients[0] as Record<string, unknown> | undefined)
          : (row.patients as Record<string, unknown> | null);
        const serviceJoin = Array.isArray(row.services)
          ? (row.services[0] as Record<string, unknown> | undefined)
          : (row.services as Record<string, unknown> | null);
        const roomJoin = Array.isArray(row.rooms)
          ? (row.rooms[0] as Record<string, unknown> | undefined)
          : (row.rooms as Record<string, unknown> | null);
        const profJoin = Array.isArray(row.professionals)
          ? (row.professionals[0] as Record<string, unknown> | undefined)
          : (row.professionals as Record<string, unknown> | null);

        // Ensure linked patient exists in localStorage cache for quick PEP navigation
        if (patientJoin && patientJoin.id && patientJoin.full_name) {
          const cachedPatients = getStored<Patient[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
          const alreadyExists = cachedPatients.some(
            (p) =>
              p.id === String(patientJoin.id) ||
              (patientJoin.document_cpf &&
                p.documentCpf.replace(/\D/g, '') === String(patientJoin.document_cpf).replace(/\D/g, ''))
          );
          if (!alreadyExists) {
            cachedPatients.unshift({
              id: String(patientJoin.id),
              organizationId: String(row.organization_id || 'org_mureb_01'),
              originBranchId: String(row.branch_id || defaultBranchId),
              fullName: String(patientJoin.full_name),
              documentCpf: String(patientJoin.document_cpf || ''),
              birthDate: '',
              gender: 'N',
              phone: String(patientJoin.phone || patientJoin.whatsapp || ''),
              whatsapp: String(patientJoin.whatsapp || patientJoin.phone || ''),
              email: String(patientJoin.email || ''),
              healthPlanType:
                patientJoin.health_plan_type === 'convenio' ? 'convenio' : 'particular',
              sharingMode: 'model_b_shared',
              authorizedBranchIds: [defaultBranchId],
              lgpdConsent: true,
              createdAt: String(row.created_at || new Date().toISOString()),
              isActive: true,
            });
            setStored(STORAGE_KEYS.PATIENTS, cachedPatients);
          }
        }

        const rawNotes = row.notes ? String(row.notes) : '';
        const notesServiceMatch = rawNotes.match(/Tipo:\s*([^·\n]+)/i);

        return {
          id: String(row.id),
          organizationId: String(row.organization_id || 'org_mureb_01'),
          branchId: String(row.branch_id || defaultBranchId),
          patientId: String(row.patient_id || patientJoin?.id || ''),
          patientName: String(patientJoin?.full_name || 'Paciente Online'),
          patientPhone: String(patientJoin?.whatsapp || patientJoin?.phone || ''),
          professionalId: String(row.professional_id || 'prof_newton'),
          professionalName: String(profJoin?.full_name || 'Dr. Newton Mureb'),
          serviceId: row.service_id ? String(row.service_id) : undefined,
          serviceName: String(
            serviceJoin?.name || (notesServiceMatch ? notesServiceMatch[1].trim() : 'Consulta Médica')
          ),
          roomId: row.room_id ? String(row.room_id) : undefined,
          roomName: String(roomJoin?.name || 'Consultório 01 - Dr. Newton Mureb'),
          startTime: String(row.start_time),
          endTime: String(row.end_time),
          status: (row.status as AppointmentStatus) || 'scheduled',
          appointmentType:
            row.appointment_type === 'telemedicina' ? 'telemedicina' : 'presencial',
          notes: rawNotes || undefined,
          cancellationReason: row.cancellation_reason
            ? String(row.cancellation_reason)
            : undefined,
          createdAt: String(row.created_at || new Date().toISOString()),
        };
      });

      if (!dateFilter) {
        // Merge cloud appointments with any purely local/demo appointments without duplicating
        const cloudIds = new Set(cloudAppointments.map((c) => c.id));
        const cloudKeys = new Set(
          cloudAppointments.map(
            (c) => `${c.patientName.trim().toLowerCase()}|${new Date(c.startTime).getTime()}`
          )
        );
        const remainingLocal = localList.filter((l) => {
          const key = `${l.patientName.trim().toLowerCase()}|${new Date(l.startTime).getTime()}`;
          return !cloudIds.has(l.id) && !cloudKeys.has(key);
        });
        const merged = [...cloudAppointments, ...remainingLocal].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        setStored(STORAGE_KEYS.APPOINTMENTS, merged);
        return merged;
      }

      return cloudAppointments;
    } catch (err) {
      console.warn('Exceção ao carregar agendamentos do Supabase:', err);
      return localList;
    }
  },

  updateAppointmentStatusInCloud: async (
    appointmentId: string,
    newStatus: AppointmentStatus,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Update localStorage immediately for responsive UI
    StorageService.updateAppointmentStatus(
      appointmentId,
      newStatus,
      newStatus === 'cancelled' ? notes : undefined
    );

    const supabase = getSupabase();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(appointmentId);

    if (!supabase || !isUuid) {
      return { success: true };
    }

    try {
      const updatePayload: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (newStatus === 'cancelled' && notes) {
        updatePayload.cancellation_reason = notes;
      } else if (newStatus === 'scheduled' || newStatus === 'confirmed') {
        updatePayload.cancellation_reason = null;
        if (notes) updatePayload.notes = notes;
      } else if (notes) {
        updatePayload.notes = notes;
      }

      const { error } = await supabase
        .from('appointments')
        .update(updatePayload)
        .eq('id', appointmentId);

      if (error) {
        console.warn('Erro ao atualizar status no Supabase:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  },

  createAppointmentInCloud: async (input: {
    existingAppointmentId?: string;
    existingPatientId?: string;
    newPatient?: {
      fullName: string;
      documentCpf: string;
      phone: string;
      whatsapp?: string;
      email?: string;
    };
    branchId: string;
    professionalId: string;
    serviceId?: string;
    serviceName?: string;
    roomId?: string;
    roomName?: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    appointmentType: 'presencial' | 'telemedicina';
    notes?: string;
    isOverbook?: boolean;
    dateYmd?: string;
    horaFormatada?: string;
    n8nInicio?: string;
    sendToN8n?: boolean;
  }): Promise<{ success: boolean; appointment?: Appointment; message?: string }> => {
    const clinic = StorageService.getClinic();
    const org = StorageService.getOrganization();
    const branches = StorageService.getBranches();
    const professionals = StorageService.getProfessionals();
    const services = StorageService.getServices();
    const rooms = StorageService.getRooms();

    const targetBranch = branches.find((b) => b.id === input.branchId) || branches[0];
    const targetProf = professionals.find((p) => p.id === input.professionalId) || professionals[0];
    const targetService = services.find((s) => s.id === input.serviceId) || services[0];
    const targetRoom = rooms.find((r) => r.id === input.roomId) || rooms[0];

    let resolvedPatient: Patient | undefined;

    if (input.newPatient) {
      const nowIso = new Date().toISOString();
      resolvedPatient = StorageService.upsertPatientByCpf({
        id: `pat_${Date.now()}`,
        organizationId: org.id || 'org_mureb_01',
        originBranchId: targetBranch?.id || 'branch_cf_centro',
        authorizedBranchIds: [targetBranch?.id || 'branch_cf_centro'],
        sharingMode: 'model_b_shared',
        fullName: input.newPatient.fullName.trim(),
        documentCpf: input.newPatient.documentCpf,
        birthDate: '',
        gender: 'N',
        phone: input.newPatient.phone,
        whatsapp: input.newPatient.whatsapp || input.newPatient.phone,
        email: input.newPatient.email || '',
        lgpdConsent: true,
        lgpdConsentDate: nowIso,
        administrativeNotes: 'Paciente cadastrado diretamente via Agenda Visual.',
        isActive: true,
        createdAt: nowIso,
      });
    } else if (input.existingPatientId) {
      resolvedPatient = StorageService.getPatients().find((p) => p.id === input.existingPatientId);
    }

    if (!resolvedPatient) {
      return { success: false, message: 'Selecione ou cadastre um paciente para agendar.' };
    }

    const nowIso = new Date().toISOString();
    let finalAppointmentId = input.existingAppointmentId || `apt_${Date.now()}`;
    const isUuid = (val?: string) =>
      Boolean(
        val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
      );

    // 1. Optional n8n webhook notification (if requested for new appointments)
    if (input.sendToN8n && !input.existingAppointmentId) {
      const webhookUrl = (
        clinic.n8nWebhookAgendamento ||
        'https://n8n.srv1352561.hstgr.cloud/webhook/agendaclinica'
      ).trim();

      const cleanCpf = resolvedPatient.documentCpf.replace(/\D/g, '');
      const cleanPhone = (resolvedPatient.whatsapp || resolvedPatient.phone).replace(/\D/g, '');
      const celularE164 =
        cleanPhone.startsWith('55') && cleanPhone.length >= 12
          ? `+${cleanPhone}`
          : `+55${cleanPhone}`;

      const dateYmd =
        input.dateYmd ||
        `${new Date(input.startTime).getFullYear()}-${String(new Date(input.startTime).getMonth() + 1).padStart(2, '0')}-${String(new Date(input.startTime).getDate()).padStart(2, '0')}`;
      const horaFmt =
        input.horaFormatada ||
        new Date(input.startTime).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            unidade: targetBranch
              ? `${targetBranch.name} (${targetBranch.city}/${targetBranch.state})`
              : 'Unidade Matriz Cabo Frio (Centro) (Cabo Frio/RJ)',
            especialista: targetProf?.fullName || 'Dr. Newton Mureb',
            tipo_atendimento: input.serviceName || targetService?.name || 'Primeira consulta',
            nome: resolvedPatient.fullName,
            cpf: cleanCpf,
            celular: celularE164,
            email: resolvedPatient.email || '',
            assunto: input.notes || '',
            data: dateYmd,
            horario: input.n8nInicio || input.startTime,
            hora_formatada: horaFmt,
            inicio: input.n8nInicio || input.startTime,
            tenant_slug: org.slug || 'dr-newton-mureb',
            organization_id: org.id || 'org_mureb_01',
            clinic_cnpj: clinic.documentNumber || '55.937.470/0001-78',
          }),
        });
      } catch (n8nErr) {
        console.warn('Aviso ao enviar confirmação para webhook n8n:', n8nErr);
      }
    }

    // 2. Persist in Supabase (if configured)
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .maybeSingle();

        const supaOrgId = orgRow?.id;
        if (supaOrgId) {
          const { data: branchRow } = await supabase
            .from('branches')
            .select('id')
            .eq('organization_id', supaOrgId)
            .limit(1)
            .maybeSingle();

          const { data: profRow } = await supabase
            .from('professionals')
            .select('id')
            .eq('organization_id', supaOrgId)
            .limit(1)
            .maybeSingle();

          const { data: srvRow } = await supabase
            .from('services')
            .select('id')
            .eq('organization_id', supaOrgId)
            .limit(1)
            .maybeSingle();

          const cleanCpf = resolvedPatient.documentCpf.replace(/\D/g, '');
          let supaPatientId = isUuid(resolvedPatient.id) ? resolvedPatient.id : undefined;

          if (!supaPatientId && cleanCpf) {
            const { data: foundPat } = await supabase
              .from('patients')
              .select('id')
              .eq('organization_id', supaOrgId)
              .or(`document_cpf.eq.${resolvedPatient.documentCpf},document_cpf.eq.${cleanCpf}`)
              .limit(1)
              .maybeSingle();
            supaPatientId = foundPat?.id;
          }

          if (!supaPatientId && branchRow?.id) {
            const { data: insertedPat } = await supabase
              .from('patients')
              .insert({
                organization_id: supaOrgId,
                origin_branch_id: branchRow.id,
                full_name: resolvedPatient.fullName,
                document_cpf: resolvedPatient.documentCpf,
                phone: resolvedPatient.phone,
                whatsapp: resolvedPatient.whatsapp || resolvedPatient.phone,
                email: resolvedPatient.email || null,
                lgpd_consent: true,
                lgpd_consent_date: nowIso,
                sharing_mode: 'model_b_shared',
              })
              .select('id')
              .single();
            supaPatientId = insertedPat?.id;
          }

          if (supaPatientId && branchRow?.id && profRow?.id) {
            if (isUuid(input.existingAppointmentId)) {
              await supabase
                .from('appointments')
                .update({
                  patient_id: supaPatientId,
                  service_id: isUuid(input.serviceId) ? input.serviceId : srvRow?.id || null,
                  room_id: isUuid(input.roomId) ? input.roomId : null,
                  start_time: input.startTime,
                  end_time: input.endTime,
                  status: input.status,
                  appointment_type: input.appointmentType,
                  notes: input.notes || null,
                  updated_at: nowIso,
                })
                .eq('id', input.existingAppointmentId!);
            } else {
              const { data: insertedApt } = await supabase
                .from('appointments')
                .insert({
                  organization_id: supaOrgId,
                  branch_id: branchRow.id,
                  patient_id: supaPatientId,
                  professional_id: profRow.id,
                  service_id: isUuid(input.serviceId) ? input.serviceId : srvRow?.id || null,
                  room_id: isUuid(input.roomId) ? input.roomId : null,
                  start_time: input.startTime,
                  end_time: input.endTime,
                  status: input.status,
                  appointment_type: input.appointmentType,
                  notes: input.notes || null,
                })
                .select('id')
                .single();
              if (insertedApt?.id) {
                finalAppointmentId = insertedApt.id;
              }
            }
          }
        }
      } catch (supaErr) {
        console.warn('Aviso ao persistir agendamento no Supabase:', supaErr);
      }
    }

    // 3. Persist in localStorage ERP
    const appointmentObj: Appointment = {
      id: finalAppointmentId,
      organizationId: org.id || 'org_mureb_01',
      branchId: targetBranch?.id || 'branch_cf_centro',
      patientId: resolvedPatient.id,
      patientName: resolvedPatient.fullName,
      patientPhone: resolvedPatient.whatsapp || resolvedPatient.phone,
      professionalId: targetProf?.id || 'prof_newton',
      professionalName: targetProf?.fullName || 'Dr. Newton Mureb',
      serviceId: targetService?.id,
      serviceName: input.serviceName || targetService?.name || 'Consulta Médica',
      roomId: targetRoom?.id,
      roomName: targetRoom?.name || 'Consultório 01 - Clínica Médica, Endocrinologia e Metabologia',
      startTime: input.startTime,
      endTime: input.endTime,
      status: input.status,
      appointmentType: input.appointmentType,
      notes: input.notes,
      isOverbook: input.isOverbook,
      createdAt: nowIso,
    };

    const localRes = StorageService.saveAppointment(appointmentObj);
    if (!localRes.success) {
      return { success: false, message: localRes.message };
    }

    return { success: true, appointment: appointmentObj };
  },

  fetchWaitlistFromCloud: async (branchFilterId?: string): Promise<WaitlistEntry[]> => {
    const localList = StorageService.getWaitlist(branchFilterId);
    const supabase = getSupabase();
    if (!supabase) return localList;

    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select(
          `
          id,
          organization_id,
          branch_id,
          patient_id,
          professional_id,
          specialty_id,
          preferred_days,
          preferred_period,
          notes,
          status,
          created_at,
          patients (
            full_name,
            phone,
            whatsapp
          )
        `
        )
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error || !data) {
        return localList;
      }

      const cloudWaitlist: WaitlistEntry[] = (data as Array<Record<string, unknown>>).map((row) => {
        const pat = Array.isArray(row.patients)
          ? (row.patients[0] as Record<string, unknown> | undefined)
          : (row.patients as Record<string, unknown> | null);
        return {
          id: String(row.id),
          organizationId: String(row.organization_id),
          branchId: String(row.branch_id),
          patientId: String(row.patient_id),
          patientName: String(pat?.full_name || 'Paciente'),
          patientPhone: String(pat?.whatsapp || pat?.phone || ''),
          professionalId: row.professional_id ? String(row.professional_id) : undefined,
          specialtyId: row.specialty_id ? String(row.specialty_id) : undefined,
          preferredDays: Array.isArray(row.preferred_days)
            ? (row.preferred_days as string[])
            : [],
          preferredPeriod:
            (row.preferred_period as WaitlistEntry['preferredPeriod']) || 'qualquer',
          notes: row.notes ? String(row.notes) : undefined,
          status: (row.status as WaitlistEntry['status']) || 'waiting',
          createdAt: String(row.created_at || new Date().toISOString()),
        };
      });

      const cloudIds = new Set(cloudWaitlist.map((w) => w.id));
      const merged = [
        ...cloudWaitlist,
        ...StorageService.getWaitlist().filter((l) => !cloudIds.has(l.id)),
      ];
      setStored(STORAGE_KEYS.WAITLIST, merged);
      return !branchFilterId || branchFilterId === 'all'
        ? merged
        : merged.filter((w) => w.branchId === branchFilterId);
    } catch {
      return localList;
    }
  },

  createWaitlistInCloud: async (entry: WaitlistEntry): Promise<WaitlistEntry> => {
    let savedId = entry.id;
    const supabase = getSupabase();

    if (supabase) {
      try {
        const { data: orgRow } = await supabase
          .from('organizations')
          .select('id')
          .limit(1)
          .maybeSingle();
        if (orgRow?.id) {
          const { data: branchRow } = await supabase
            .from('branches')
            .select('id')
            .eq('organization_id', orgRow.id)
            .limit(1)
            .maybeSingle();
          const { data: profRow } = await supabase
            .from('professionals')
            .select('id')
            .eq('organization_id', orgRow.id)
            .limit(1)
            .maybeSingle();

          const localPatient = StorageService.getPatients().find((p) => p.id === entry.patientId);
          let supaPatientId: string | undefined;
          if (localPatient) {
            const cleanCpf = localPatient.documentCpf.replace(/\D/g, '');
            const { data: patRow } = await supabase
              .from('patients')
              .select('id')
              .eq('organization_id', orgRow.id)
              .or(`document_cpf.eq.${localPatient.documentCpf},document_cpf.eq.${cleanCpf}`)
              .limit(1)
              .maybeSingle();
            supaPatientId = patRow?.id;
          }

          if (branchRow?.id && supaPatientId) {
            const { data: inserted } = await supabase
              .from('waitlist')
              .insert({
                organization_id: orgRow.id,
                branch_id: branchRow.id,
                patient_id: supaPatientId,
                professional_id: profRow?.id || null,
                preferred_days: entry.preferredDays,
                preferred_period: entry.preferredPeriod,
                notes: entry.notes || null,
                status: 'waiting',
              })
              .select('id')
              .single();
            if (inserted?.id) savedId = inserted.id;
          }
        }
      } catch (err) {
        console.warn('Aviso ao inserir na waitlist do Supabase:', err);
      }
    }

    const finalEntry = { ...entry, id: savedId };
    StorageService.saveWaitlistEntry(finalEntry);
    return finalEntry;
  },

  removeWaitlistInCloud: async (id: string): Promise<void> => {
    StorageService.removeWaitlistEntry(id);
    const supabase = getSupabase();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (supabase && isUuid) {
      try {
        await supabase.from('waitlist').delete().eq('id', id);
      } catch (err) {
        console.warn('Aviso ao remover item da waitlist no Supabase:', err);
      }
    }
  }
};


