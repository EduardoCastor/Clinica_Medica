import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCheck, 
  Check, 
  Plus, 
  Sparkles, 
  Smartphone, 
  PhoneCall, 
  Mail, 
  Bot, 
  User, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { MessageTemplate, MessageLog } from '../../types';
import { StorageService } from '../../services/storage';
import { useTenant } from '../../contexts/TenantContext';

export const CommunicationModule: React.FC = () => {
  const { activeBranchId, branches, clinic } = useTenant();
  const [messages, setMessages] = useState<MessageLog[]>(StorageService.getMessages());
  const [templates, setTemplates] = useState<MessageTemplate[]>(StorageService.getTemplates());
  const patients = StorageService.getPatients(activeBranchId);
  const professionals = StorageService.getProfessionals();

  // Test Dispatcher State
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState(templates[0]?.id || '');
  const [customText, setCustomText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedPreview, setSimulatedPreview] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'automations'>('messages');

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];
  const activeBranch = branches.find(b => b.id === (selectedPatient?.originBranchId || branches[0]?.id));

  // Compute preview with dynamic variables
  const generatePreview = (templateContent: string) => {
    if (!selectedPatient) return templateContent;
    let text = templateContent;
    text = text.replace(/{{nome_paciente}}/g, selectedPatient.fullName);
    text = text.replace(/{{nome_clinica}}/g, clinic.tradeName.split('-')[0].trim());
    text = text.replace(/{{nome_profissional}}/g, professionals[0]?.fullName || 'Dr. Newton Mureb');
    text = text.replace(/{{data_consulta}}/g, '10/11/2026');
    text = text.replace(/{{horario_consulta}}/g, '14:30');
    text = text.replace(/{{endereco_filial}}/g, `${activeBranch?.street}, ${activeBranch?.number} - ${activeBranch?.neighborhood}`);
    return text;
  };

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    setIsSimulating(true);
    const contentToSend = customText || generatePreview(selectedTemplate.content);

    setTimeout(() => {
      StorageService.sendMessage({
        organizationId: 'org_mureb_01',
        branchId: selectedPatient.originBranchId,
        patientId: selectedPatient.id,
        patientName: selectedPatient.fullName,
        recipientPhone: selectedPatient.whatsapp || selectedPatient.phone,
        channel: 'whatsapp',
        direction: 'outbound',
        content: contentToSend,
        status: 'delivered',
      });

      setMessages(StorageService.getMessages());
      setIsSimulating(false);
      setCustomText('');
      alert(`Mensagem WhatsApp enviada com sucesso para ${selectedPatient.fullName} (${selectedPatient.phone})!`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Central de Comunicação & WhatsApp
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              API Oficial WhatsApp Business
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Lembretes automáticos 48h/24h, confirmação de consultas, pós-atendimento e modelos dinâmicos com variáveis.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'messages' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Histórico de Conversas
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'templates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Modelos de Mensagens
          </button>
          <button
            onClick={() => setActiveTab('automations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'automations' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gatilhos Automáticos
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Dispatcher & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive WhatsApp Dispatch Simulator */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900">Simulador de Disparo WhatsApp</h3>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Online
            </span>
          </div>

          <form onSubmit={handleSendTestMessage} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Destinatário (Paciente)</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Modelo de Mensagem</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* WhatsApp Phone Mockup Preview */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Visualização do Balão de WhatsApp
              </label>
              <div className="bg-[#EFEAE2] p-4 rounded-xl border border-slate-300 relative overflow-hidden text-xs">
                <div className="bg-white rounded-lg p-3 shadow-xs max-w-xs ml-auto rounded-tr-none text-slate-800 leading-relaxed whitespace-pre-line text-[11px] border border-[#d1d7db]">
                  <p>{generatePreview(selectedTemplate?.content || '')}</p>
                  <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                    <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="w-3 h-3 text-sky-500" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSimulating}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSimulating ? 'Disparando...' : 'Enviar Mensagem Agora'}</span>
            </button>
          </form>
        </div>

        {/* Right Columns: Tab Content */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* TAB 1: Messages History */}
          {activeTab === 'messages' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <h3 className="text-sm font-bold text-slate-900">Histórico de Disparos e Mensagens</h3>
                </div>
                <span className="text-xs text-slate-400">{messages.length} mensagens registradas</span>
              </div>

              <div className="divide-y divide-slate-100">
                {messages.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    Nenhuma mensagem registrada na central.
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="p-4 hover:bg-slate-50/60 transition flex items-start justify-between gap-4 text-xs">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{msg.patientName}</span>
                          <span className="text-[11px] text-slate-400 font-mono">({msg.recipientPhone})</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${
                            msg.direction === 'inbound' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {msg.direction === 'inbound' ? 'Recebida (Paciente)' : 'Enviada (Clínica)'}
                          </span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-line bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] leading-relaxed">
                          {msg.content}
                        </p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-[10px] text-slate-400 block tabular-nums">
                          {new Date(msg.sentAt).toLocaleDateString('pt-BR')} {new Date(msg.sentAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center justify-end gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span className="capitalize">{msg.status === 'read' ? 'Lido' : 'Entregue'}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Templates List */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-800 space-y-1">
                <span className="font-bold block">Variáveis Dinâmicas Disponíveis:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {['{{nome_paciente}}', '{{nome_clinica}}', '{{nome_profissional}}', '{{data_consulta}}', '{{horario_consulta}}', '{{endereco_filial}}'].map(v => (
                    <code key={v} className="bg-white text-sky-800 px-2 py-0.5 rounded font-mono text-[10px] border border-sky-300">
                      {v}
                    </code>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {templates.map(tpl => (
                  <div key={tpl.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{tpl.name}</h4>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                        Canal: {tpl.channel}
                      </span>
                    </div>
                    <pre className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 whitespace-pre-line font-sans leading-relaxed">
                      {tpl.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Automations Settings */}
          {activeTab === 'automations' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-900">Configuração de Disparos Automáticos</h3>
              
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900">Lembrete & Confirmação com 48 Horas de Antecedência</strong>
                    <span className="text-slate-500 text-[11px]">Disparado 2 dias antes para confirmar presença ou liberar vaga para lista de espera.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900">Lembrete com 24 Horas de Antecedência</strong>
                    <span className="text-slate-500 text-[11px]">Envia instruções de jejum ou envio prévio de exames laboratoriais.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900">Aviso no Dia da Consulta (2h antes)</strong>
                    <span className="text-slate-500 text-[11px]">Endereço com link do Google Maps e orientações de estacionamento.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <strong className="block text-slate-900">Mensagem de Pós-Atendimento e Acolhimento</strong>
                    <span className="text-slate-500 text-[11px]">Pesquisa de satisfação e canal aberto para dúvidas sobre receitas e suplementação.</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-sky-600 rounded" />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
