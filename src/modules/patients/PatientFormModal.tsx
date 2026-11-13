import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  MapPin, 
  AlertTriangle, 
  Search, 
  Activity, 
  Heart, 
  CreditCard, 
  Check, 
  Loader2 
} from 'lucide-react';
import { Patient, PatientSharingMode } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';
import { 
  validateCpf, 
  formatCpf, 
  formatCep, 
  formatPhone, 
  formatCns, 
  calculateBmi, 
  calculateAge, 
  fetchAddressByCep 
} from '../../services/brazilianFormatters';

interface PatientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingPatient?: Patient | null;
  onSaveSuccess: () => void;
}

export const PatientFormModal: React.FC<PatientFormModalProps> = ({
  isOpen,
  onClose,
  existingPatient,
  onSaveSuccess,
}) => {
  const { branches, activeBranchId } = useTenant();
  const defaultBranch = activeBranchId !== 'all' ? activeBranchId : branches[0]?.id || '';

  // Form Section Tabs
  const [activeTab, setActiveTab] = useState<'civil' | 'address' | 'clinical' | 'insurance' | 'guardian' | 'sharing'>('civil');

  // 1. Dados Civis e Demográficos
  const [fullName, setFullName] = useState('');
  const [socialName, setSocialName] = useState('');
  const [documentCpf, setDocumentCpf] = useState('');
  const [documentRg, setDocumentRg] = useState('');
  const [documentRgIssuer, setDocumentRgIssuer] = useState('DETRAN/RJ');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [gender, setGender] = useState('Feminino');
  const [biologicalSex, setBiologicalSex] = useState<'M' | 'F' | 'outro'>('F');
  const [genderIdentity, setGenderIdentity] = useState('Mulher cis');
  const [maritalStatus, setMaritalStatus] = useState<'solteiro' | 'casado' | 'uniao_estavel' | 'divorciado' | 'viuvo' | 'outro'>('solteiro');
  const [profession, setProfession] = useState('');
  const [nationality, setNationality] = useState('Brasileira');
  const [naturalness, setNaturalness] = useState('Cabo Frio/RJ');

  // 2. Contato e Endereço
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Cabo Frio');
  const [state, setState] = useState('RJ');
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  // 3. Dados Clínicos e Triagem
  const [bloodType, setBloodType] = useState<'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'desconhecido'>('desconhecido');
  const [weightKg, setWeightKg] = useState<string>('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicDiseasesText, setChronicDiseasesText] = useState('');
  const [continuousMedicationsText, setContinuousMedicationsText] = useState('');

  // 4. Convênio e CNS
  const [healthPlanType, setHealthPlanType] = useState<'particular' | 'convenio'>('particular');
  const [healthPlanOperator, setHealthPlanOperator] = useState('');
  const [healthPlanNumber, setHealthPlanNumber] = useState('');
  const [healthPlanValidity, setHealthPlanValidity] = useState('');
  const [healthPlanCategory, setHealthPlanCategory] = useState('');
  const [cnsNumber, setCnsNumber] = useState('');

  // 5. Responsável Legal e Contato de Emergência
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactKinship, setEmergencyContactKinship] = useState('');
  const [legalGuardianName, setLegalGuardianName] = useState('');
  const [legalGuardianCpf, setLegalGuardianCpf] = useState('');
  const [legalGuardianKinship, setLegalGuardianKinship] = useState('');
  const [legalGuardianPhone, setLegalGuardianPhone] = useState('');

  // 6. Filial, Compartilhamento e LGPD
  const [originBranchId, setOriginBranchId] = useState(defaultBranch);
  const [sharingMode, setSharingMode] = useState<PatientSharingMode>('model_b_shared');
  const [authorizedBranchIds, setAuthorizedBranchIds] = useState<string[]>(branches.map(b => b.id));
  const [lgpdConsent, setLgpdConsent] = useState(true);
  const [administrativeNotes, setAdministrativeNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  // Populate on open or edit
  useEffect(() => {
    if (existingPatient) {
      setFullName(existingPatient.fullName || '');
      setSocialName(existingPatient.socialName || '');
      setDocumentCpf(existingPatient.documentCpf || '');
      setDocumentRg(existingPatient.documentRg || '');
      setDocumentRgIssuer(existingPatient.documentRgIssuer || 'DETRAN/RJ');
      setBirthDate(existingPatient.birthDate || '1990-01-01');
      setGender(existingPatient.gender || 'Feminino');
      setBiologicalSex(existingPatient.biologicalSex || 'F');
      setGenderIdentity(existingPatient.genderIdentity || 'Mulher cis');
      setMaritalStatus(existingPatient.maritalStatus || 'solteiro');
      setProfession(existingPatient.profession || '');
      setNationality(existingPatient.nationality || 'Brasileira');
      setNaturalness(existingPatient.naturalness || 'Cabo Frio/RJ');

      setPhone(existingPatient.phone || '');
      setWhatsapp(existingPatient.whatsapp || '');
      setEmail(existingPatient.email || '');
      setPostalCode(existingPatient.postalCode || '');
      setAddress(existingPatient.address || '');
      setAddressNumber(existingPatient.addressNumber || '');
      setComplement(existingPatient.complement || '');
      setNeighborhood(existingPatient.neighborhood || '');
      setCity(existingPatient.city || 'Cabo Frio');
      setState(existingPatient.state || 'RJ');

      setBloodType(existingPatient.bloodType || 'desconhecido');
      setWeightKg(existingPatient.weightKg ? existingPatient.weightKg.toString() : '');
      setHeightCm(existingPatient.heightCm ? existingPatient.heightCm.toString() : '');
      setAllergiesText(existingPatient.allergies ? existingPatient.allergies.join(', ') : '');
      setChronicDiseasesText(existingPatient.chronicDiseases ? existingPatient.chronicDiseases.join(', ') : '');
      setContinuousMedicationsText(existingPatient.continuousMedications ? existingPatient.continuousMedications.join(', ') : '');

      setHealthPlanType(existingPatient.healthPlanType || 'particular');
      setHealthPlanOperator(existingPatient.healthPlanOperator || '');
      setHealthPlanNumber(existingPatient.healthPlanNumber || '');
      setHealthPlanValidity(existingPatient.healthPlanValidity || '');
      setHealthPlanCategory(existingPatient.healthPlanCategory || '');
      setCnsNumber(existingPatient.cnsNumber || '');

      setEmergencyContactName(existingPatient.emergencyContactName || '');
      setEmergencyContactPhone(existingPatient.emergencyContactPhone || '');
      setEmergencyContactKinship(existingPatient.emergencyContactKinship || '');
      setLegalGuardianName(existingPatient.legalGuardianName || '');
      setLegalGuardianCpf(existingPatient.legalGuardianCpf || '');
      setLegalGuardianKinship(existingPatient.legalGuardianKinship || '');
      setLegalGuardianPhone(existingPatient.legalGuardianPhone || '');

      setOriginBranchId(existingPatient.originBranchId || defaultBranch);
      setSharingMode(existingPatient.sharingMode || 'model_b_shared');
      setAuthorizedBranchIds(existingPatient.authorizedBranchIds || branches.map(b => b.id));
      setLgpdConsent(existingPatient.lgpdConsent ?? true);
      setAdministrativeNotes(existingPatient.administrativeNotes || '');
    } else {
      // Default new patient
      setFullName('');
      setSocialName('');
      setDocumentCpf('');
      setDocumentRg('');
      setDocumentRgIssuer('DETRAN/RJ');
      setBirthDate('1992-05-10');
      setGender('Feminino');
      setBiologicalSex('F');
      setGenderIdentity('Mulher cis');
      setMaritalStatus('solteiro');
      setProfession('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setPostalCode('');
      setAddress('');
      setAddressNumber('');
      setComplement('');
      setNeighborhood('');
      setCity('Cabo Frio');
      setState('RJ');
      setBloodType('desconhecido');
      setWeightKg('');
      setHeightCm('');
      setAllergiesText('');
      setChronicDiseasesText('');
      setContinuousMedicationsText('');
      setHealthPlanType('particular');
      setHealthPlanOperator('');
      setHealthPlanNumber('');
      setCnsNumber('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setLegalGuardianName('');
      setLegalGuardianCpf('');
      setOriginBranchId(defaultBranch);
      setSharingMode('model_b_shared');
      setAuthorizedBranchIds(branches.map(b => b.id));
      setLgpdConsent(true);
      setAdministrativeNotes('');
    }
  }, [isOpen, existingPatient, defaultBranch]);

  if (!isOpen) return null;

  // Realtime calculated values
  const age = calculateAge(birthDate);
  const isMinor = age !== null && age < 18;
  const bmiInfo = calculateBmi(Number(weightKg), Number(heightCm));

  // Auto-fetch ViaCEP
  const handleCepSearch = async () => {
    const clean = postalCode.replace(/\D/g, '');
    if (clean.length !== 8) {
      alert('Informe um CEP válido com 8 dígitos.');
      return;
    }

    setIsLoadingCep(true);
    const data = await fetchAddressByCep(clean);
    setIsLoadingCep(false);

    if (data) {
      setAddress(data.logradouro || address);
      setNeighborhood(data.bairro || neighborhood);
      setCity(data.localidade || city);
      setState(data.uf || state);
    } else {
      alert('CEP não localizado no serviço ViaCEP. Preencha manualmente.');
    }
  };

  const toggleBranchAuth = (id: string) => {
    if (authorizedBranchIds.includes(id)) {
      setAuthorizedBranchIds(authorizedBranchIds.filter(b => b !== id));
    } else {
      setAuthorizedBranchIds([...authorizedBranchIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('O Nome Completo do paciente é obrigatório.');
      setActiveTab('civil');
      return;
    }

    if (!documentCpf.trim()) {
      setErrorMessage('O CPF do paciente é obrigatório.');
      setActiveTab('civil');
      return;
    }

    // CPF Validation
    if (!validateCpf(documentCpf)) {
      setErrorMessage('O CPF informado é inválido de acordo com a validação da Receita Federal.');
      setActiveTab('civil');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage('O telefone do paciente é obrigatório.');
      setActiveTab('address');
      return;
    }

    // Validação de Menor de Idade (Responsável Legal Obrigatório)
    if (isMinor && (!legalGuardianName.trim() || !legalGuardianCpf.trim())) {
      setErrorMessage('Paciente menor de 18 anos exige o cadastro do Nome e CPF do Responsável Legal.');
      setActiveTab('guardian');
      return;
    }

    // Parse arrays
    const allergies = allergiesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const chronicDiseases = chronicDiseasesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const continuousMedications = continuousMedicationsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Patient = {
      id: existingPatient?.id || `pat_${Date.now()}`,
      organizationId: 'org_mureb_01',
      originBranchId,
      fullName: fullName.trim(),
      socialName: socialName.trim() || undefined,
      documentCpf: formatCpf(documentCpf),
      documentRg: documentRg.trim() || undefined,
      documentRgIssuer: documentRgIssuer.trim() || undefined,
      birthDate,
      gender,
      biologicalSex,
      genderIdentity,
      maritalStatus,
      profession: profession.trim() || undefined,
      nationality,
      naturalness: naturalness.trim() || undefined,
      phone: formatPhone(phone),
      whatsapp: whatsapp.trim() ? formatPhone(whatsapp) : formatPhone(phone),
      email: email.trim(),
      postalCode: formatCep(postalCode),
      address: address.trim(),
      addressNumber: addressNumber.trim(),
      complement: complement.trim() || undefined,
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim(),
      bloodType,
      weightKg: weightKg ? Number(weightKg) : undefined,
      heightCm: heightCm ? Number(heightCm) : undefined,
      calculatedBmi: bmiInfo?.bmi,
      allergies,
      chronicDiseases,
      continuousMedications,
      healthPlanType,
      healthPlanOperator: healthPlanType === 'convenio' ? healthPlanOperator.trim() : undefined,
      healthPlanNumber: healthPlanType === 'convenio' ? healthPlanNumber.trim() : undefined,
      healthPlanValidity: healthPlanType === 'convenio' ? healthPlanValidity : undefined,
      healthPlanCategory: healthPlanType === 'convenio' ? healthPlanCategory.trim() : undefined,
      cnsNumber: cnsNumber.trim() ? formatCns(cnsNumber) : undefined,
      emergencyContactName: emergencyContactName.trim() || undefined,
      emergencyContactPhone: emergencyContactPhone.trim() ? formatPhone(emergencyContactPhone) : undefined,
      emergencyContactKinship: emergencyContactKinship.trim() || undefined,
      legalGuardianName: legalGuardianName.trim() || undefined,
      legalGuardianCpf: legalGuardianCpf.trim() ? formatCpf(legalGuardianCpf) : undefined,
      legalGuardianKinship: legalGuardianKinship.trim() || undefined,
      legalGuardianPhone: legalGuardianPhone.trim() ? formatPhone(legalGuardianPhone) : undefined,
      lgpdConsent,
      lgpdConsentDate: existingPatient?.lgpdConsentDate || (lgpdConsent ? new Date().toISOString() : undefined),
      administrativeNotes: administrativeNotes.trim() || undefined,
      sharingMode,
      authorizedBranchIds: sharingMode === 'model_b_shared' ? authorizedBranchIds : [originBranchId],
      createdAt: existingPatient?.createdAt || new Date().toISOString(),
      isActive: true,
    };

    const res = StorageService.savePatient(payload);
    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao gravar cadastro do paciente.');
      return;
    }

    onSaveSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {existingPatient ? `Editar Cadastro de ${existingPatient.fullName}` : 'Novo Paciente &bull; Cadastro Completo de Saúde'}
              </h3>
              <p className="text-xs text-slate-400">
                Conformidade CFM, SUS (Nome Social e CNS) e LGPD de dados sensíveis de saúde
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 bg-slate-50 flex gap-2 text-xs font-semibold overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('civil')}
            className={`pb-2.5 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'civil' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Identificação Civil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`pb-2.5 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'address' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. Contato & Endereço
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clinical')}
            className={`pb-2.5 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'clinical' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Triagem & Alergias
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insurance')}
            className={`pb-2.5 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'insurance' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Convênio / CNS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guardian')}
            className={`pb-2.5 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'guardian' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            5. Responsável & Emergência {isMinor && <span className="text-rose-600 font-bold">*</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sharing')}
            className={`pb-2.5 px-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'sharing' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            6. LGPD & Filiais
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* TAB 1: IDENTIFICAÇÃO CIVIL */}
          {activeTab === 'civil' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo (Certidão / RG) *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Camila Albuquerque"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Social (Resolução CFM nº 2.299/2021 & SUS)
                  </label>
                  <input
                    type="text"
                    value={socialName}
                    onChange={(e) => setSocialName(e.target.value)}
                    placeholder="Nome pelo qual o paciente prefere ser chamado"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF (Validação da Receita Federal) *
                  </label>
                  <input
                    type="text"
                    required
                    value={documentCpf}
                    onChange={(e) => setDocumentCpf(formatCpf(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número do RG
                  </label>
                  <input
                    type="text"
                    value={documentRg}
                    onChange={(e) => setDocumentRg(e.target.value)}
                    placeholder="Ex: 28.910.450-8"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Órgão Emissor / UF
                  </label>
                  <input
                    type="text"
                    value={documentRgIssuer}
                    onChange={(e) => setDocumentRgIssuer(e.target.value)}
                    placeholder="Ex: SSP/SP, DETRAN/RJ"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data de Nascimento * {age !== null && <span className="text-sky-700">({age} anos)</span>}
                  </label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sexo Biológico (Prontuário)
                  </label>
                  <select
                    value={biologicalSex}
                    onChange={(e) => setBiologicalSex(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="F">Feminino</option>
                    <option value="M">Masculino</option>
                    <option value="outro">Intersexo / Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Identidade de Gênero
                  </label>
                  <select
                    value={genderIdentity}
                    onChange={(e) => setGenderIdentity(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Mulher cis">Mulher cis</option>
                    <option value="Homem cis">Homem cis</option>
                    <option value="Mulher trans">Mulher trans</option>
                    <option value="Homem trans">Homem trans</option>
                    <option value="Não-binário">Não-binário</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado Civil
                  </label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="uniao_estavel">União Estável</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profissão / Ocupação
                  </label>
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    placeholder="Ex: Arquiteta, Engenheiro"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Naturalidade (Cidade/UF)
                  </label>
                  <input
                    type="text"
                    value={naturalness}
                    onChange={(e) => setNaturalness(e.target.value)}
                    placeholder="Ex: Cabo Frio/RJ"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTATO E ENDEREÇO (COM VIACEP) */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefone Celular / Chamadas *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp (Para Lembretes)
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail do Paciente
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="paciente@email.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Endereço com Busca Automática ViaCEP */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-end gap-3">
                  <div className="flex-1 max-w-xs">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CEP (Busca Automática)
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(formatCep(e.target.value))}
                      placeholder="00000-000"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCepSearch}
                    disabled={isLoadingCep}
                    className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                  >
                    {isLoadingCep ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Buscar ViaCEP</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Logradouro / Rua</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ex: Rua Pedroso Alvarenga"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={addressNumber}
                      onChange={(e) => setAddressNumber(e.target.value)}
                      placeholder="1120"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      placeholder="Apto 142, Bloco B"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Itaim Bibi"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">UF</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                        maxLength={2}
                        className="w-full px-2 py-2 text-xs border border-slate-300 rounded-lg bg-white text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLÍNICO, TRIAGEM & ALERGIAS */}
          {activeTab === 'clinical' && (
            <div className="space-y-4">
              
              {/* Sanguíneo e Antropometria */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Antropometria de Triagem & Biometria
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo Sanguíneo</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    >
                      <option value="desconhecido">Não Informado</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Peso (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="Ex: 68.5"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="Ex: 165"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">IMC Calculado</label>
                    <div className="px-3 py-2 text-xs border border-sky-300 rounded-lg bg-sky-50 text-sky-900 font-bold">
                      {bmiInfo ? `${bmiInfo.bmi} (${bmiInfo.classification})` : 'Aguardando peso/altura'}
                    </div>
                  </div>
                </div>
              </div>

              {/* ALERGIAS (ALERTA VERMELHO) */}
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-300 space-y-2">
                <label className="block text-xs font-black text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Alergias Medicamentosas & Alimentares (Destaque em Alerta Vermelho no Prontuário)</span>
                </label>
                <input
                  type="text"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  placeholder="Ex: Dipirona (Edema Labial), Sulfa, Frutos do Mar, Penicilina (separe por vírgula)"
                  className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-semibold text-rose-900"
                />
                <span className="text-[11px] text-rose-700 block">
                  * Todo medicamento ou alérgeno listado aqui gerará um alerta visual destacado no topo de qualquer evolução médica.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comorbidades & Doenças Crônicas Conhecidas
                </label>
                <textarea
                  rows={2}
                  value={chronicDiseasesText}
                  onChange={(e) => setChronicDiseasesText(e.target.value)}
                  placeholder="Ex: Lipedema Estágio II, Hipertensão Arterial, Diabetes Tipo 2, Hipotireoidismo de Hashimoto"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medicamentos de Uso Contínuo & Suplementação Atual
                </label>
                <textarea
                  rows={2}
                  value={continuousMedicationsText}
                  onChange={(e) => setContinuousMedicationsText(e.target.value)}
                  placeholder="Ex: Coenzima Q10 200mg, Losartana 50mg, Levotiroxina 50mcg, Magnésio Dimalato"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

            </div>
          )}

          {/* TAB 4: CONVÊNIO & CARTÃO NACIONAL DE SAÚDE (CNS) */}
          {activeTab === 'insurance' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Modalidade de Pagamento / Atendimento
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    healthPlanType === 'particular' ? 'bg-white border-sky-500 shadow-xs' : 'bg-white/60 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="healthPlanType"
                      checked={healthPlanType === 'particular'}
                      onChange={() => setHealthPlanType('particular')}
                      className="text-sky-600 mr-2"
                    />
                    <strong className="text-slate-800">Particular (Desembolso Direto / Reembolso)</strong>
                  </label>

                  <label className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    healthPlanType === 'convenio' ? 'bg-white border-sky-500 shadow-xs' : 'bg-white/60 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="healthPlanType"
                      checked={healthPlanType === 'convenio'}
                      onChange={() => setHealthPlanType('convenio')}
                      className="text-sky-600 mr-2"
                    />
                    <strong className="text-slate-800">Plano de Saúde / Convênio Médico</strong>
                  </label>
                </div>
              </div>

              {healthPlanType === 'convenio' && (
                <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-200 space-y-3">
                  <span className="text-xs font-bold text-sky-950 block">Dados do Plano de Saúde</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Operadora do Convênio *
                      </label>
                      <input
                        type="text"
                        value={healthPlanOperator}
                        onChange={(e) => setHealthPlanOperator(e.target.value)}
                        placeholder="Ex: Bradesco Saúde, Unimed, Amil, SulAmérica"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Número da Carteirinha *
                      </label>
                      <input
                        type="text"
                        value={healthPlanNumber}
                        onChange={(e) => setHealthPlanNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Validade da Carteira
                      </label>
                      <input
                        type="date"
                        value={healthPlanValidity}
                        onChange={(e) => setHealthPlanValidity(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Categoria do Plano
                      </label>
                      <input
                        type="text"
                        value={healthPlanCategory}
                        onChange={(e) => setHealthPlanCategory(e.target.value)}
                        placeholder="Ex: Top Nacional, Especial, Apartamento"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  CNS - Cartão Nacional de Saúde (Padrão SUS / ConecteSUS)
                </label>
                <input
                  type="text"
                  value={cnsNumber}
                  onChange={(e) => setCnsNumber(formatCns(e.target.value))}
                  placeholder="7000 0000 0000 0000 (15 dígitos)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* TAB 5: RESPONSÁVEL LEGAL & CONTATO DE EMERGÊNCIA */}
          {activeTab === 'guardian' && (
            <div className="space-y-4">
              
              {/* Alerta de Menor de Idade se aplicável */}
              {isMinor && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Atenção (Menor de 18 Anos):</strong> O paciente possui {age} anos. Segundo a legislação civil e as normas éticas do CFM, o cadastro dos dados do responsável legal é obrigatório.
                  </div>
                </div>
              )}

              {/* Responsável Legal */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Responsável Legal (Obrigatório para Menores ou Incapazes)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome do Responsável Legal {isMinor && <span className="text-rose-600">*</span>}
                    </label>
                    <input
                      type="text"
                      value={legalGuardianName}
                      onChange={(e) => setLegalGuardianName(e.target.value)}
                      placeholder="Nome do pai, mãe ou tutor legal"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CPF do Responsável Legal {isMinor && <span className="text-rose-600">*</span>}
                    </label>
                    <input
                      type="text"
                      value={legalGuardianCpf}
                      onChange={(e) => setLegalGuardianCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parentesco / Vínculo
                    </label>
                    <input
                      type="text"
                      value={legalGuardianKinship}
                      onChange={(e) => setLegalGuardianKinship(e.target.value)}
                      placeholder="Mãe, Pai, Curador(a), Tutor(a)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone do Responsável
                    </label>
                    <input
                      type="text"
                      value={legalGuardianPhone}
                      onChange={(e) => setLegalGuardianPhone(formatPhone(e.target.value))}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Contato de Emergência Geral */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Contato de Emergência (Em caso de intercorrências clínicas)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nome do Contato
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="Ex: Felipe Albuquerque"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parentesco / Relação
                    </label>
                    <input
                      type="text"
                      value={emergencyContactKinship}
                      onChange={(e) => setEmergencyContactKinship(e.target.value)}
                      placeholder="Esposo(a), Irmão(ã)"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Telefone de Emergência
                    </label>
                    <input
                      type="text"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(formatPhone(e.target.value))}
                      placeholder="(11) 98144-5577"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: LGPD & COMPARTILHAMENTO MULTIUNIDADE */}
          {activeTab === 'sharing' && (
            <div className="space-y-4">
              
              {/* Conformidade LGPD */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpdConsent}
                    onChange={(e) => setLgpdConsent(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded mt-0.5"
                  />
                  <div className="text-xs text-emerald-950">
                    <span className="font-bold block">
                      Consentimento de Tratamento de Dados Pessoais Sensíveis de Saúde (LGPD Art. 11, II)
                    </span>
                    <span className="text-[11px] text-emerald-800 block mt-0.5">
                      O paciente autoriza expressamente a clínica a armazenar e processar seus dados clínicos para fins de tutela de saúde, diagnóstico, prescrição médica e histórico de prontuário eletrônico.
                    </span>
                  </div>
                </label>

                {existingPatient?.lgpdConsentDate && (
                  <span className="text-[10px] text-emerald-700 block pt-1">
                    Aceite registrado em: {new Date(existingPatient.lgpdConsentDate).toLocaleString('pt-BR')}
                  </span>
                )}
              </div>

              {/* Filial de Referência */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Filial de Referência / Origem do Paciente *
                </label>
                <select
                  value={originBranchId}
                  onChange={(e) => setOriginBranchId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-semibold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city}/{b.state})</option>
                  ))}
                </select>
              </div>

              {/* Multi-Branch Sharing Policy (Modelo A vs Modelo B) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-900 block">
                  Política de Compartilhamento entre Unidades da Clínica
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    sharingMode === 'model_b_shared' ? 'bg-white border-sky-500 shadow-xs' : 'bg-white/60 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="sharingPolicy"
                      checked={sharingMode === 'model_b_shared'}
                      onChange={() => setSharingMode('model_b_shared')}
                      className="text-sky-600 mr-2"
                    />
                    <strong className="text-slate-800">Modelo B: Compartilhado</strong>
                    <p className="mt-1 text-[11px] text-slate-500 pl-5">
                      Permite atendimento e visualização do prontuário em filiais autorizadas.
                    </p>
                  </label>

                  <label className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    sharingMode === 'model_a_exclusive' ? 'bg-white border-sky-500 shadow-xs' : 'bg-white/60 border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="sharingPolicy"
                      checked={sharingMode === 'model_a_exclusive'}
                      onChange={() => setSharingMode('model_a_exclusive')}
                      className="text-sky-600 mr-2"
                    />
                    <strong className="text-slate-800">Modelo A: Exclusivo</strong>
                    <p className="mt-1 text-[11px] text-slate-500 pl-5">
                      Isolamento estrito dos dados na filial de referência.
                    </p>
                  </label>
                </div>

                {sharingMode === 'model_b_shared' && (
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Filiais com Acesso Autorizado ao Prontuário:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {branches.map(b => (
                        <label key={b.id} className="flex items-center gap-1.5 text-xs text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={authorizedBranchIds.includes(b.id)}
                            onChange={() => toggleBranchAuth(b.id)}
                            className="text-sky-600 rounded"
                          />
                          <span>{b.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Administrativas / Alertas de Recepção
                </label>
                <textarea
                  rows={2}
                  value={administrativeNotes}
                  onChange={(e) => setAdministrativeNotes(e.target.value)}
                  placeholder="Ex: Encaminhada por médico parceiro, exige recibo discriminado para reembolso."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <span className="text-[11px] text-slate-400">
              * Campos com asterisco são obrigatórios perante a legislação de saúde.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-xs transition"
              >
                Salvar Cadastro do Paciente
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
