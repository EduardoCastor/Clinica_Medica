/**
 * Utilitários de formatação e validação para conformidade brasileira (CFM, ANVISA, LGPD e SUS)
 */

export function validateCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;

  // Rejeita sequências repetidas como 111.111.111-11
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

export function formatCpf(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 3) return clean;
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

export function formatCep(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 8);
  if (clean.length <= 5) return clean;
  return `${clean.slice(0, 5)}-${clean.slice(5, 8)}`;
}

export function formatPhone(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length <= 2) return clean.length ? `(${clean}` : '';
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

export function formatCns(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 15);
  if (clean.length <= 3) return clean;
  if (clean.length <= 7) return `${clean.slice(0, 3)} ${clean.slice(3)}`;
  if (clean.length <= 11) return `${clean.slice(0, 3)} ${clean.slice(3, 7)} ${clean.slice(7)}`;
  return `${clean.slice(0, 3)} ${clean.slice(3, 7)} ${clean.slice(7, 11)} ${clean.slice(11, 15)}`;
}

export function calculateBmi(weightKg: number, heightCm: number): { bmi: number; classification: string } | null {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let classification = 'Eutrofia (Peso Normal)';
  if (bmi < 18.5) classification = 'Abaixo do peso';
  else if (bmi < 25) classification = 'Peso saudável';
  else if (bmi < 30) classification = 'Sobrepeso (Pré-obesidade)';
  else if (bmi < 35) classification = 'Obesidade Grau I';
  else if (bmi < 40) classification = 'Obesidade Grau II';
  else classification = 'Obesidade Grau III (Grave)';

  return { bmi, classification };
}

export function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate + 'T00:00:00');
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const clean = cep.replace(/\D/g, '');
  if (clean.length !== 8) return null;

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.erro) return null;
    return data as ViaCepResponse;
  } catch (error) {
    console.warn('Falha ao consultar ViaCEP:', error);
    return null;
  }
}
