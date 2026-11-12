/**
 * Base de dados de CIDs frequentes em atenção ambulatorial, medicina preventiva,
 * ortomolecular, clínica geral, cardiologia e fisioterapia com busca rápida.
 */

export interface Cid10Item {
  code: string;
  description: string;
  category: string;
}

export const COMMON_CID10: Cid10Item[] = [
  // Doenças metabólicas, endócrinas e nutricionais
  { code: 'E88.2', description: 'Lipomatose e Lipedema não classificados em outra parte', category: 'Metabologia & Lipedema' },
  { code: 'E11', description: 'Diabetes mellitus não-insulino-dependente (Tipo 2)', category: 'Endocrinologia' },
  { code: 'E11.9', description: 'Diabetes mellitus tipo 2 sem complicações', category: 'Endocrinologia' },
  { code: 'E66', description: 'Obesidade', category: 'Endocrinologia' },
  { code: 'E66.0', description: 'Obesidade devida a excesso de calorias', category: 'Endocrinologia' },
  { code: 'E03.9', description: 'Hipotireoidismo não especificado', category: 'Endocrinologia' },
  { code: 'E06.3', description: 'Tireoidite auto-imune (Tireoidite de Hashimoto)', category: 'Endocrinologia' },
  { code: 'E78.0', description: 'Hipercolesterolemia pura', category: 'Metabologia' },
  { code: 'E78.2', description: 'Hiperlipidemia mista', category: 'Metabologia' },
  { code: 'E78.5', description: 'Hiperlipidemia não especificada', category: 'Metabologia' },
  { code: 'E55.9', description: 'Deficiência de vitamina D não especificada', category: 'Nutrologia' },
  { code: 'E53.8', description: 'Deficiência de outras vitaminas do complexo B (Vitamina B12)', category: 'Nutrologia' },
  { code: 'E61.1', description: 'Deficiência de ferro / Anemia ferropriva subclínica', category: 'Nutrologia' },
  { code: 'E87.8', description: 'Outros transtornos do equilíbrio hidroeletrolítico e ácido-básico', category: 'Ortomolecular' },
  { code: 'R63.0', description: 'Anorexia e perda involuntária de apetite', category: 'Sintomas Gerais' },
  { code: 'M62.5', description: 'Atrofia e fraqueza muscular não classificada (Sarcopenia)', category: 'Fisioterapia & Metabologia' },

  // Aparelho circulatório / cardiovascular
  { code: 'I10', description: 'Hipertensão essencial (primária)', category: 'Cardiologia' },
  { code: 'I11.9', description: 'Doença cardíaca hipertensiva sem insuficiência cardíaca', category: 'Cardiologia' },
  { code: 'I83.9', description: 'Varizes dos membros inferiores sem úlcera ou inflamação', category: 'Angiologia' },
  { code: 'I87.2', description: 'Insuficiência venosa crônica periférica', category: 'Angiologia' },
  { code: 'I89.0', description: 'Linfedema não classificado em outra parte', category: 'Angiologia' },

  // Sistema osteomuscular e tecido conjuntivo
  { code: 'M79.7', description: 'Fibromialgia', category: 'Reumatologia' },
  { code: 'M54.5', description: 'Dor lombar baixa (Lombalgia crônica)', category: 'Ortopedia' },
  { code: 'M54.2', description: 'Cervicalgia', category: 'Ortopedia' },
  { code: 'M75.1', description: 'Síndrome do manguito rotador', category: 'Ortopedia' },
  { code: 'M17.9', description: 'Gonartrose não especificada (Artrose de joelho)', category: 'Ortopedia' },
  { code: 'M19.9', description: 'Artrose não especificada', category: 'Ortopedia' },
  { code: 'M25.5', description: 'Dor articular', category: 'Ortopedia' },
  { code: 'M77.9', description: 'Entesopatia não especificada (Tendinite / Bursite)', category: 'Ortopedia' },

  // Aparelho digestivo
  { code: 'K21.9', description: 'Doença de refluxo gastroesofágico sem esofagite', category: 'Gastroenterologia' },
  { code: 'K29.7', description: 'Gastrite não especificada', category: 'Gastroenterologia' },
  { code: 'K58.9', description: 'Síndrome do cólon irritável sem diarreia', category: 'Gastroenterologia' },
  { code: 'K59.0', description: 'Constipação intestinal crônica', category: 'Gastroenterologia' },
  { code: 'K76.0', description: 'Esteatose hepática (Degeneração gordurosa do fígado)', category: 'Gastroenterologia' },

  // Sintomas gerais, fadiga e estresse
  { code: 'R53', description: 'Mal-estar, fadiga e astenia crônica', category: 'Sintomas Gerais' },
  { code: 'G47.0', description: 'Distúrbios do início e da manutenção do sono (Insônia)', category: 'Neurologia' },
  { code: 'G43.9', description: 'Enxaqueca sem especificação', category: 'Neurologia' },
  { code: 'G44.2', description: 'Cefaleia tensional', category: 'Neurologia' },
  { code: 'F41.1', description: 'Ansiedade generalizada', category: 'Saúde Mental' },
  { code: 'F41.2', description: 'Transtorno misto ansioso e depressivo', category: 'Saúde Mental' },
  { code: 'F32.9', description: 'Episódio depressivo não especificado', category: 'Saúde Mental' },
  { code: 'Z73.0', description: 'Esgotamento (Síndrome de Burnout)', category: 'Saúde Mental' },

  // Avaliações de rotina, exames e atestados
  { code: 'Z00.0', description: 'Exame médico geral (Check-up clínico de rotina)', category: 'Exames & Check-up' },
  { code: 'Z02.1', description: 'Exame para admissão a emprego', category: 'Medicina do Trabalho' },
  { code: 'Z02.5', description: 'Exame para participação em atividades desportivas', category: 'Aptidão Física' },
  { code: 'Z76.0', description: 'Emissão de prescrição de repetição', category: 'Administrativo' },
  { code: 'Z76.8', description: 'Pessoas em contato com serviços de saúde em outras circunstâncias', category: 'Administrativo' },
];

export function searchCid10(query: string, maxResults = 10): Cid10Item[] {
  if (!query || query.trim().length === 0) {
    return COMMON_CID10.slice(0, maxResults);
  }

  const clean = query.trim().toLowerCase();
  return COMMON_CID10.filter(item => 
    item.code.toLowerCase().includes(clean) ||
    item.description.toLowerCase().includes(clean) ||
    item.category.toLowerCase().includes(clean)
  ).slice(0, maxResults);
}
