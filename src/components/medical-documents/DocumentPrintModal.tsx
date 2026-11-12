import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  FileText, 
  Pill, 
  AlertCircle, 
  CheckCircle2, 
  Building2,
  Lock
} from 'lucide-react';
import { Prescription, MedicalCertificate, LabOrder, Branch } from '../../types';
import { useTenant } from '../../contexts/TenantContext';

export type PrintableDocumentType = 
  | { type: 'prescription'; data: Prescription }
  | { type: 'certificate'; data: MedicalCertificate }
  | { type: 'lab_order'; data: LabOrder };

interface DocumentPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PrintableDocumentType | null;
}

export const DocumentPrintModal: React.FC<DocumentPrintModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const { clinic, branches } = useTenant();

  if (!isOpen || !document) return null;

  const currentBranch: Branch | undefined = branches[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      
      {/* Screen Container */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-6 max-h-[90vh]">
        
        {/* Modal Toolbar - Hidden during print */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Visualização de Impressão Oficial</span>
                <span className="text-[10px] font-normal px-2 py-0.5 bg-sky-800/80 text-sky-200 rounded-full border border-sky-600/40">
                  Padrão CFM & ANVISA
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Documento formatado para folha A4 com cabeçalho institucional e assinatura profissional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100 flex justify-center print:p-0 print:bg-white print:overflow-visible">
          
          <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 shadow-md print:shadow-none print:p-8 flex flex-col justify-between border border-slate-200 print:border-none">
            
            {/* DOCUMENT CONTENT SWITCHER */}

            {/* 1. PRESCRIPTION */}
            {document.type === 'prescription' && (
              <PrescriptionCanvas 
                prescription={document.data} 
                clinic={clinic} 
                branch={currentBranch} 
              />
            )}

            {/* 2. MEDICAL CERTIFICATE */}
            {document.type === 'certificate' && (
              <CertificateCanvas 
                certificate={document.data} 
                clinic={clinic} 
                branch={currentBranch} 
              />
            )}

            {/* 3. LAB ORDER */}
            {document.type === 'lab_order' && (
              <LabOrderCanvas 
                order={document.data} 
                clinic={clinic} 
                branch={currentBranch} 
              />
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

/* =========================================================================
   SUB-CANVAS 1: RECEITUÁRIO (SIMPLES OU CONTROLE ESPECIAL ANVISA 344/98)
   ========================================================================= */
interface CanvasProps<T> {
  clinic: any;
  branch?: Branch;
}

const PrescriptionCanvas: React.FC<{ prescription: Prescription } & CanvasProps<Prescription>> = ({
  prescription,
  clinic,
  branch,
}) => {
  const isSpecialControl = prescription.type === 'controle_especial';

  const renderSingleVia = (viaLabel: string, isRetencao: boolean) => (
    <div className={`space-y-6 ${isSpecialControl ? 'border-b-2 border-dashed border-slate-300 pb-10 mb-10' : ''}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
            {clinic?.legalName || 'Dr. Newton Mureb - Medicina Ortomolecular'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {clinic?.institutionalBio?.substring(0, 85) || 'Metabologia, Longevidade Saudável e Modulação Celular'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {branch?.street || 'Alameda dos Jardins'}, {branch?.number || '1500'} - {branch?.neighborhood || 'Jardins'}, {branch?.city || 'São Paulo'}/{branch?.state || 'SP'} · Tel: {branch?.phone || '(11) 3284-9100'}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
            {isSpecialControl ? 'Controle Especial' : 'Receituário'}
          </span>
          {isSpecialControl && (
            <span className="block text-[11px] font-bold text-rose-700 mt-1 uppercase">
              {viaLabel}
            </span>
          )}
        </div>
      </div>

      {/* Patient Strip */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Paciente:</span>
            <span className="font-bold text-slate-900 text-sm">{prescription.patientName}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">CPF do Paciente:</span>
            <span className="font-mono text-slate-800">{prescription.patientCpf}</span>
          </div>
        </div>
        {prescription.patientAddress && (
          <div className="mt-1 pt-1 border-t border-slate-200/60 text-[11px] text-slate-600">
            <span className="font-semibold">Endereço:</span> {prescription.patientAddress}
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="space-y-4 py-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
          Uso / Prescrição Medicamentosa:
        </h3>

        <div className="space-y-4 text-xs">
          {prescription.items.map((item, index) => (
            <div key={item.id} className="pl-2 border-l-2 border-sky-600 space-y-1">
              <div className="flex items-baseline justify-between font-bold text-slate-900 text-sm">
                <span>{index + 1}. {item.medicineName} {item.concentration}</span>
                <span className="text-xs font-semibold text-slate-600 font-mono">
                  Qtd: {item.quantity}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Via: <span className="font-semibold text-slate-800">{item.administrationRoute}</span> · Forma: {item.pharmaceuticalForm}
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-sans bg-slate-50/70 p-2 rounded">
                <strong>Posologia:</strong> {item.dosageInstruction}
              </p>
              {item.treatmentDuration && (
                <div className="text-[11px] text-slate-500 italic">
                  Duração estimada: {item.treatmentDuration}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* General Instructions */}
      {prescription.generalInstructions && (
        <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 text-xs text-amber-900">
          <strong className="block font-bold mb-0.5">Orientações Gerais ao Paciente / Farmácia:</strong>
          <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line">
            {prescription.generalInstructions}
          </p>
        </div>
      )}

      {/* Quadros de Identificação ANVISA (Portaria 344/98) para Controle Especial */}
      {isSpecialControl && isRetencao && (
        <div className="grid grid-cols-2 gap-4 text-[10px] border border-slate-300 p-3 rounded-lg bg-slate-50/50">
          <div className="space-y-1 border-r border-slate-300 pr-3">
            <span className="font-bold text-slate-900 uppercase block border-b border-slate-200 pb-0.5">
              Identificação do Comprador (Preenchimento na Farmácia)
            </span>
            <div className="space-y-1 text-slate-600 pt-1">
              <p>Nome: __________________________________________________</p>
              <p>Identidade / RG: __________________ Órgão Emissor: _______</p>
              <p>Endereço: _______________________________________________</p>
              <p>Cidade: __________________________ UF: _____ Fone: ______</p>
              <div className="pt-4 text-center">
                <p>_______________________________________________________</p>
                <span className="text-[9px]">Assinatura do Comprador</span>
              </div>
            </div>
          </div>

          <div className="space-y-1 pl-1">
            <span className="font-bold text-slate-900 uppercase block border-b border-slate-200 pb-0.5">
              Identificação do Fornecedor / Drogaria
            </span>
            <div className="space-y-1 text-slate-600 pt-1">
              <p>Farmácia / Drogaria: _____________________________________</p>
              <p>Data de Atendimento: _____ / _____ / 2026</p>
              <p>Farmacêutico Responsável: ________________________________</p>
              <p>CRF: __________________ Assinatura: _____________________</p>
              <div className="pt-3 text-[9px] text-slate-400 italic">
                * Conforme Portaria SVS/MS nº 344/98 e RDC ANVISA nº 58/2014. Válido por 30 dias.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Signature */}
      <div className="pt-6 mt-6 border-t border-slate-200 flex items-end justify-between text-xs">
        <div>
          <p className="text-[11px] text-slate-500">
            Data de Emissão: <strong className="text-slate-800">{new Date(prescription.prescriptionDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Validade da Receita: {prescription.validityDays} dias a contar da emissão
          </p>
          {prescription.signatureHash && (
            <div className="mt-2 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Assinatura Digital ICP-Brasil: {prescription.signatureHash}</span>
            </div>
          )}
        </div>

        <div className="text-center w-64">
          <div className="border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 text-sm">
            {prescription.professionalName}
          </div>
          <span className="block text-xs font-semibold text-slate-700">
            {prescription.professionalCouncil}
          </span>
          <span className="block text-[10px] text-slate-400">
            Médico Responsável
          </span>
        </div>
      </div>

    </div>
  );

  return (
    <div className="space-y-6">
      {renderSingleVia(
        isSpecialControl ? '1ª Via - Retenção da Farmácia / Drogaria' : 'Via Única do Paciente', 
        true
      )}

      {isSpecialControl && renderSingleVia('2ª Via - Orientação do Paciente', false)}
    </div>
  );
};

/* =========================================================================
   SUB-CANVAS 2: ATESTADO MÉDICO COM CONTROLE ESTATUTÁRIO DE CID-10 (CFM)
   ========================================================================= */
const CertificateCanvas: React.FC<{ certificate: MedicalCertificate } & CanvasProps<MedicalCertificate>> = ({
  certificate,
  clinic,
  branch,
}) => {
  const getCertificateTitle = () => {
    switch (certificate.type) {
      case 'afastamento':
        return 'Atestado Médico de Afastamento';
      case 'aptidao_fisica':
        return 'Atestado de Aptidão Física';
      case 'comparecimento':
        return 'Declaração de Comparecimento';
      case 'acompanhante':
        return 'Atestado de Acompanhante';
      default:
        return 'Atestado Médico';
    }
  };

  return (
    <div className="flex flex-col justify-between h-full min-h-[240mm] space-y-8">
      
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
            {clinic?.legalName || 'Dr. Newton Mureb - Medicina Ortomolecular'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {clinic?.institutionalBio?.substring(0, 85) || 'Metabologia, Longevidade Saudável e Modulação Celular'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {branch?.street || 'Alameda dos Jardins'}, {branch?.number || '1500'} - {branch?.city || 'São Paulo'}/{branch?.state || 'SP'} · Tel: {branch?.phone || '(11) 3284-9100'}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
            Documento Médico Oficial
          </span>
          <span className="block text-[10px] text-slate-400 mt-1">
            Resoluções CFM nº 1.658/2002 e 1.819/2007
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center py-4">
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide border-b-2 border-slate-200 inline-block pb-1">
          {getCertificateTitle()}
        </h2>
      </div>

      {/* Formal Text Body */}
      <div className="space-y-6 text-sm text-slate-800 leading-relaxed font-serif px-4 sm:px-8">
        
        {/* Afastamento */}
        {certificate.type === 'afastamento' && (
          <p className="indent-8 text-justify">
            Atesto, para os devidos fins legais, periciais ou trabalhistas, que o(a) Sr.(a) <strong>{certificate.patientName}</strong>, 
            portador(a) do CPF nº <strong>{certificate.patientCpf}</strong>, esteve sob meus cuidados profissionais nesta data, 
            necessitando de <strong>{certificate.daysOff || 1} ({certificate.daysOff === 1 ? 'um' : certificate.daysOff}) dia(s)</strong> de 
            afastamento de suas atividades rotineiras e laborais a contar de <strong>{certificate.startDate ? new Date(certificate.startDate + 'T00:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</strong>, 
            para recuperação clínica.
          </p>
        )}

        {/* Comparecimento */}
        {certificate.type === 'comparecimento' && (
          <p className="indent-8 text-justify">
            Declaro, para os devidos fins de comprovação, que o(a) Sr.(a) <strong>{certificate.patientName}</strong>, 
            inscrito(a) no CPF nº <strong>{certificate.patientCpf}</strong>, compareceu a esta clínica médica nesta data para realização 
            de consulta médica e avaliação diagnóstica, no período compreendido entre <strong>{certificate.hoursOff || '08:30 e 11:30'}</strong>.
          </p>
        )}

        {/* Aptidão Física */}
        {certificate.type === 'aptidao_fisica' && (
          <p className="indent-8 text-justify">
            Atesto que o(a) paciente <strong>{certificate.patientName}</strong>, portador(a) do CPF nº <strong>{certificate.patientCpf}</strong>, 
            foi submetido(a) a minuciosa avaliação clínica e cardiovascular nesta data, encontrando-se apto(a) para a realização de: 
            <strong> {certificate.activityPermitted || 'atividades físicas supervisionadas, musculação e exercícios resistidos funcionais'}</strong>.
          </p>
        )}

        {/* Acompanhante */}
        {certificate.type === 'acompanhante' && (
          <p className="indent-8 text-justify">
            Atesto que o(a) Sr.(a) <strong>{certificate.companionName || 'Acompanhante Legal'}</strong> esteve nesta unidade de saúde 
            acompanhando o(a) paciente <strong>{certificate.patientName}</strong> (CPF: {certificate.patientCpf}) durante atendimento 
            médico realizado nesta data.
          </p>
        )}

        {/* Period description or details */}
        {certificate.periodDescription && (
          <p className="indent-8 text-justify text-slate-700">
            {certificate.periodDescription}
          </p>
        )}

        {/* Regra Legal do CID-10 (Resolução CFM nº 1.658/2002) */}
        {certificate.showCidOnPrint && certificate.cid10Code ? (
          <div className="p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-2 font-sans">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">Classificação Estatística Internacional de Doenças (CID-10):</span>
              <span className="px-2.5 py-0.5 bg-slate-900 text-white font-mono font-bold rounded text-xs">
                {certificate.cid10Code}
              </span>
            </div>
            {certificate.cid10Description && (
              <p className="text-slate-600 italic">
                Descrição: {certificate.cid10Description}
              </p>
            )}

            {/* Termo Obrigatório de Consentimento Expresso do Paciente */}
            <div className="mt-3 pt-3 border-t border-slate-200 text-[11px] text-slate-700 space-y-3">
              <p className="text-justify font-sans">
                <strong>Termo de Autorização Expressa do Paciente (Resolução CFM nº 1.658/2002 e CFM nº 1.819/2007):</strong><br />
                Declaro que solicitei formalmente e autorizo de forma expressa a inclusão do código da CID-10 no presente atestado médico, ciente de que tal informação goza de sigilo médico profissional garantido pelo Código de Ética Médica e pela legislação brasileira.
              </p>
              
              <div className="pt-4 flex justify-end">
                <div className="text-center w-72">
                  <div className="border-b border-slate-700 pb-1 mb-1"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    Assinatura / Concordância do Paciente: {certificate.patientName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 font-sans italic">
            * O código de diagnóstico (CID-10) foi omitido deste atestado em estrito cumprimento ao sigilo médico profissional (Resolução CFM nº 1.658/2002), permanecendo devidamente assentado no Prontuário Eletrônico do Paciente.
          </div>
        )}

      </div>

      {/* City Date and Doctor Signature */}
      <div className="pt-10 border-t border-slate-200 flex items-end justify-between text-xs px-4 sm:px-8">
        <div>
          <p className="text-xs text-slate-700">
            {branch?.city || 'São Paulo'}, {new Date(certificate.issueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          {certificate.signatureHash && (
            <div className="mt-2 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1 font-sans">
              <Lock className="w-3 h-3 text-emerald-600" />
              <span>Assinado Digitalmente: {certificate.signatureHash}</span>
            </div>
          )}
        </div>

        <div className="text-center w-64">
          <div className="border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 text-sm font-sans">
            {certificate.professionalName}
          </div>
          <span className="block text-xs font-semibold text-slate-700 font-sans">
            {certificate.professionalCouncil}
          </span>
          <span className="block text-[10px] text-slate-400 font-sans">
            Carimbo e Assinatura Médica
          </span>
        </div>
      </div>

    </div>
  );
};

/* =========================================================================
   SUB-CANVAS 3: PEDIDO DE EXAMES (COM JUSTIFICATIVA CLÍNICA PARA CONVÊNIOS)
   ========================================================================= */
const LabOrderCanvas: React.FC<{ order: LabOrder } & CanvasProps<LabOrder>> = ({
  order,
  clinic,
  branch,
}) => {
  return (
    <div className="flex flex-col justify-between h-full min-h-[240mm] space-y-6">
      
      {/* Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 uppercase">
            {clinic?.legalName || 'Dr. Newton Mureb - Medicina Ortomolecular'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {clinic?.institutionalBio?.substring(0, 85) || 'Metabologia, Longevidade Saudável e Modulação Celular'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {branch?.street || 'Alameda dos Jardins'}, {branch?.number || '1500'} - {branch?.city || 'São Paulo'}/{branch?.state || 'SP'} · Tel: {branch?.phone || '(11) 3284-9100'}
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-sky-700 text-white text-xs font-bold uppercase tracking-wider rounded">
            Solicitação de Exames
          </span>
          <span className="block text-[10px] text-slate-400 mt-1">
            Laboratoriais & Diagnósticos por Imagem
          </span>
        </div>
      </div>

      {/* Patient Strip */}
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs grid grid-cols-2 gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Paciente:</span>
          <span className="font-bold text-slate-900 text-sm">{order.patientName}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block">CPF:</span>
          <span className="font-mono text-slate-800">{order.patientCpf}</span>
        </div>
      </div>

      {/* Justificativa Clínica (Item crítico para autorização de convênios médicos e auditorias) */}
      <div className="p-3 bg-sky-50/60 rounded-lg border border-sky-200 text-xs space-y-1">
        <span className="font-bold text-sky-900 block uppercase text-[10px] tracking-wider">
          Indicação / Justificativa Clínica (Exigência CFM & ANS):
        </span>
        <p className="text-slate-800 font-medium leading-relaxed">
          {order.clinicalIndication}
        </p>
      </div>

      {/* List of Exams */}
      <div className="space-y-3 py-2 flex-1">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
          Exames Solicitados ({order.items.length}):
        </h3>

        <div className="space-y-3 text-xs">
          {order.items.map((item, index) => (
            <div key={item.id} className="p-3 rounded-lg border border-slate-200 bg-white flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>{index + 1}. {item.examName}</span>
                  {item.urgency === 'urgente' && (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 uppercase">
                      Urgente
                    </span>
                  )}
                </div>
                {item.observations && (
                  <p className="text-[11px] text-slate-600 italic">
                    Instrução de preparo: {item.observations}
                  </p>
                )}
              </div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                {item.examType}
              </span>
            </div>
          ))}
        </div>
      </div>

      {order.notes && (
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600">
          <strong>Observações Adicionais:</strong> {order.notes}
        </div>
      )}

      {/* Footer */}
      <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
        <div>
          <p className="text-[11px] text-slate-500">
            Data de Solicitação: <strong className="text-slate-800">{new Date(order.orderDate + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
          </p>
          {order.signatureHash && (
            <div className="mt-2 text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Assinatura Digital: {order.signatureHash}</span>
            </div>
          )}
        </div>

        <div className="text-center w-64">
          <div className="border-b border-slate-800 pb-1 mb-1 font-bold text-slate-900 text-sm">
            {order.professionalName}
          </div>
          <span className="block text-xs font-semibold text-slate-700">
            {order.professionalCouncil}
          </span>
          <span className="block text-[10px] text-slate-400">
            Médico Solicitante
          </span>
        </div>
      </div>

    </div>
  );
};
