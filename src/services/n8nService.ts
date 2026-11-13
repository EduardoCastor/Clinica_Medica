import { Appointment, Patient } from '../types';
import { StorageService } from './storage';
import { getSupabase } from './supabaseClient';
import { formatCpf } from './brazilianFormatters';

export const DEFAULT_N8N_WEBHOOK_DISPONIBILIDADE =
  'https://n8n.srv1352561.hstgr.cloud/webhook/agendadisp';

export const DEFAULT_N8N_WEBHOOK_AGENDAMENTO =
  'https://n8n.srv1352561.hstgr.cloud/webhook/agendaclinica';

export interface N8nAvailableSlot {
  inicio: string;
  hora: string;
}

export interface FetchAvailableSlotsResponse {
  slots: N8nAvailableSlot[];
  mensagem: string;
  error?: string;
}

export interface TenantN8nConfig {
  webhookDisponibilidade?: string;
  webhookAgendamento?: string;
  tenantSlug?: string;
  organizationId?: string;
  clinicCnpj?: string;
}

export interface SubmitBookingInput {
  unidade: string;
  branchId: string;
  especialista: string;
  professionalId: string;
  tipoAtendimento: string;
  nome: string;
  cpfDigits: string;
  celularDigits: string;
  celularFormatted: string;
  email?: string;
  assunto?: string;
  data: string; // YYYY-MM-DD
  inicio: string;
  horaFormatada: string; // HH:mm
  durationMinutes?: number;
  tenantConfig?: TenantN8nConfig;
}

export interface SubmitBookingResult {
  success: boolean;
  error?: string;
  patient?: Patient;
  appointment?: Appointment;
  syncedSupabase?: boolean;
}

/**
 * Fetches available time slots from the tenant's configured n8n availability webhook.
 * Expects response format: [{ slots: [{ inicio, hora }], mensagem }] or { slots, mensagem }.
 */
export async function fetchAvailableSlots(
  dataSelecionada: string,
  tenantConfig?: TenantN8nConfig
): Promise<FetchAvailableSlotsResponse> {
  const clinic = StorageService.getClinic();
  const org = StorageService.getOrganization();

  const webhookUrl = (
    tenantConfig?.webhookDisponibilidade ||
    clinic.n8nWebhookDisponibilidade ||
    DEFAULT_N8N_WEBHOOK_DISPONIBILIDADE
  ).trim();

  const tenantSlug = tenantConfig?.tenantSlug || org.slug || 'dr-newton-mureb';

  try {
    const separator = webhookUrl.includes('?') ? '&' : '?';
    const url = `${webhookUrl}${separator}data=${encodeURIComponent(dataSelecionada)}&tenant=${encodeURIComponent(tenantSlug)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        slots: [],
        mensagem: 'Não foi possível consultar os horários disponíveis no momento.',
        error: `Erro HTTP ${response.status} ao consultar disponibilidade.`,
      };
    }

    const resultado = await response.json();
    const dados = Array.isArray(resultado) ? resultado[0] : resultado;
    const rawSlots = Array.isArray(dados?.slots) ? dados.slots : [];

    const slots: N8nAvailableSlot[] = (rawSlots as Array<{ inicio?: unknown; hora?: unknown }>)
      .filter((s) => Boolean(s && typeof s === 'object'))
      .map((s) => ({
        inicio: String(s.inicio || ''),
        hora: String(s.hora || ''),
      }))
      .filter((s) => Boolean(s.inicio && s.hora));

    const mensagem: string =
      dados?.mensagem || (slots.length === 0 ? 'Nenhum horário disponível nesta data' : '');

    return {
      slots,
      mensagem,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro de conexão com o serviço de agenda.';
    return {
      slots: [],
      mensagem: 'Não foi possível carregar os horários no momento. Tente novamente em instantes.',
      error: msg,
    };
  }
}

/**
 * Builds the end ISO datetime string preserving local offset or falling back to local ISO construction.
 */
function buildStartEndIso(data: string, horaFormatada: string, inicio: string, durationMinutes = 50): {
  startIso: string;
  endIso: string;
} {
  // If n8n returned a valid full ISO datetime for inicio, compute end from it
  const parsedInicio = Date.parse(inicio);
  const [hhStr, mmStr] = horaFormatada.split(':');
  const hh = Number(hhStr) || 8;
  const mm = Number(mmStr) || 0;

  if (!Number.isNaN(parsedInicio) && inicio.includes('T')) {
    const startDate = new Date(parsedInicio);
    const endDate = new Date(parsedInicio + durationMinutes * 60 * 1000);
    return {
      startIso: startDate.toISOString(),
      endIso: endDate.toISOString(),
    };
  }

  // Build local date without UTC day shift
  const [y, m, d] = data.split('-').map(Number);
  const localStart = new Date(y, (m || 1) - 1, d || 1, hh, mm, 0, 0);
  const localEnd = new Date(localStart.getTime() + durationMinutes * 60 * 1000);

  return {
    startIso: localStart.toISOString(),
    endIso: localEnd.toISOString(),
  };
}

/**
 * Submits online booking to the n8n booking webhook and, upon HTTP 2xx,
 * automatically synchronizes patient + appointment into StorageService (ERP) and Supabase.
 */
export async function submitBookingToN8nAndSupabase(
  input: SubmitBookingInput
): Promise<SubmitBookingResult> {
  const clinic = StorageService.getClinic();
  const org = StorageService.getOrganization();
  const services = StorageService.getServices();
  const branches = StorageService.getBranches();
  const professionals = StorageService.getProfessionals();

  const webhookAgendamento = (
    input.tenantConfig?.webhookAgendamento ||
    clinic.n8nWebhookAgendamento ||
    DEFAULT_N8N_WEBHOOK_AGENDAMENTO
  ).trim();

  const cleanCpf = input.cpfDigits.replace(/\D/g, '');
  const cleanPhone = input.celularDigits.replace(/\D/g, '');
  const celularE164 = cleanPhone.startsWith('55') && cleanPhone.length >= 12
    ? `+${cleanPhone}`
    : `+55${cleanPhone}`;

  const tenantSlug = input.tenantConfig?.tenantSlug || org.slug || 'dr-newton-mureb';
  const organizationId = input.tenantConfig?.organizationId || org.id || 'org_mureb_01';
  const clinicCnpj = input.tenantConfig?.clinicCnpj || clinic.documentNumber || '55.937.470/0001-78';

  const payload = {
    unidade: input.unidade,
    especialista: input.especialista,
    tipo_atendimento: input.tipoAtendimento,
    nome: input.nome.trim(),
    cpf: cleanCpf,
    celular: celularE164,
    email: input.email || '',
    assunto: input.assunto || '',
    data: input.data,
    horario: input.inicio,
    hora_formatada: input.horaFormatada,
    inicio: input.inicio,
    tenant_slug: tenantSlug,
    organization_id: organizationId,
    clinic_cnpj: clinicCnpj,
  };

  // 1. Send POST to production n8n webhook
  let response: Response;
  try {
    response = await fetch(webhookAgendamento, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Falha de rede ao enviar agendamento.';
    return {
      success: false,
      error: `Erro de conexão com o servidor de agendamentos: ${msg}`,
    };
  }

  if (!response.ok) {
    let detail = `Erro HTTP ${response.status}`;
    try {
      const errBody = await response.text();
      if (errBody) detail = `${detail}: ${errBody.slice(0, 140)}`;
    } catch {
      // ignore parse failure
    }
    return {
      success: false,
      error: `Não foi possível confirmar o agendamento no momento (${detail}). Tente novamente.`,
    };
  }

  // 2. Sync Patient + Appointment to localStorage ERP immediately
  const targetBranch = branches.find((b) => b.id === input.branchId) || branches[0];
  const targetProfessional =
    professionals.find((p) => p.id === input.professionalId) || professionals[0];
  const matchedService =
    services.find((s) => s.name.toLowerCase() === input.tipoAtendimento.toLowerCase()) ||
    services[0];

  const duration = input.durationMinutes || matchedService?.durationMinutes || 50;
  const formattedCpf = formatCpf(cleanCpf);
  const nowIso = new Date().toISOString();

  const newPatientRecord: Patient = {
    id: `pat_agenda_${Date.now()}`,
    organizationId,
    originBranchId: targetBranch?.id || 'branch_cf_centro',
    authorizedBranchIds: [targetBranch?.id || 'branch_cf_centro'],
    sharingMode: 'model_b_shared',
    fullName: input.nome.trim(),
    documentCpf: formattedCpf,
    birthDate: '',
    gender: 'N',
    phone: input.celularFormatted,
    whatsapp: input.celularFormatted,
    email: input.email || '',
    lgpdConsent: true,
    lgpdConsentDate: nowIso,
    administrativeNotes: `Cadastro originado via Agendamento Online (agenda.${tenantSlug}) · Tipo: ${input.tipoAtendimento}`,
    isActive: true,
    createdAt: nowIso,
  };

  const savedPatient = StorageService.upsertPatientByCpf(newPatientRecord);

  const { startIso, endIso } = buildStartEndIso(
    input.data,
    input.horaFormatada,
    input.inicio,
    duration
  );

  const newAppointment: Appointment = {
    id: `apt_n8n_${Date.now()}`,
    organizationId,
    branchId: targetBranch?.id || 'branch_cf_centro',
    patientId: savedPatient.id,
    patientName: savedPatient.fullName,
    patientPhone: input.celularFormatted,
    professionalId: targetProfessional?.id || 'prof_newton',
    professionalName: input.especialista || targetProfessional?.fullName || 'Dr. Newton Mureb',
    serviceId: matchedService?.id || 'srv_consulta',
    serviceName: input.tipoAtendimento,
    startTime: startIso,
    endTime: endIso,
    status: 'scheduled',
    appointmentType: 'presencial',
    isOverbook: true,
    notes: `Agendado online via n8n (${webhookAgendamento}). Horário original: ${input.data} às ${input.horaFormatada}.`,
    createdAt: nowIso,
  };

  StorageService.saveAppointment(newAppointment);

  StorageService.sendMessage({
    organizationId,
    branchId: targetBranch?.id || 'branch_cf_centro',
    patientId: savedPatient.id,
    patientName: savedPatient.fullName,
    recipientPhone: input.celularFormatted,
    channel: 'whatsapp',
    direction: 'outbound',
    content: `Olá, ${savedPatient.fullName}! Seu agendamento (${input.tipoAtendimento}) com ${newAppointment.professionalName} foi confirmado para ${input.data.split('-').reverse().join('/')} às ${input.horaFormatada} em ${input.unidade}.`,
    status: 'delivered',
  });

  // 3. Synchronize gracefully with Supabase (if VITE_SUPABASE_URL & KEY are active)
  let syncedSupabase = false;
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Look up real UUIDs in Supabase so FK constraints succeed cleanly
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

        // Upsert or find patient by formatted or clean CPF
        const { data: existingPatient } = await supabase
          .from('patients')
          .select('id')
          .eq('organization_id', supaOrgId)
          .or(`document_cpf.eq.${formattedCpf},document_cpf.eq.${cleanCpf}`)
          .limit(1)
          .maybeSingle();

        let supaPatientId = existingPatient?.id as string | undefined;

        if (!supaPatientId && branchRow?.id) {
          const { data: insertedPatient } = await supabase
            .from('patients')
            .insert({
              organization_id: supaOrgId,
              origin_branch_id: branchRow.id,
              full_name: savedPatient.fullName,
              document_cpf: formattedCpf,
              phone: input.celularFormatted,
              whatsapp: input.celularFormatted,
              email: input.email || null,
              lgpd_consent: true,
              lgpd_consent_date: nowIso,
              sharing_mode: 'model_b_shared',
              notes: newPatientRecord.administrativeNotes,
            })
            .select('id')
            .single();

          supaPatientId = insertedPatient?.id;
        }

        if (supaPatientId && branchRow?.id && profRow?.id) {
          const { error: aptError } = await supabase.from('appointments').insert({
            organization_id: supaOrgId,
            branch_id: branchRow.id,
            patient_id: supaPatientId,
            professional_id: profRow.id,
            service_id: srvRow?.id || null,
            start_time: startIso,
            end_time: endIso,
            status: 'scheduled',
            appointment_type: 'presencial',
            notes: newAppointment.notes,
          });
          if (!aptError) {
            syncedSupabase = true;
          }
        }
      }
    } catch (supaErr) {
      console.warn('Aviso ao sincronizar agendamento com Supabase (n8n já confirmado):', supaErr);
    }
  }

  return {
    success: true,
    patient: savedPatient,
    appointment: newAppointment,
    syncedSupabase,
  };
}
