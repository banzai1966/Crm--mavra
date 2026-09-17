import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Save,
  Cpu,
  Key,
  FileText,
  Upload,
  Trash2,
  Play,
  Check,
  ShieldCheck,
  HelpCircle,
  ShoppingBag,
  CreditCard,
  FileCheck,
  AlertCircle,
  Power,
  Filter,
  ShieldAlert,
  Phone,
  Mic,
  Volume2,
  VolumeX,
  Loader2,
  ExternalLink,
  Clock,
  RefreshCw
} from 'lucide-react';
import { AgentConfig, KnowledgeDocument, AIProvider } from '../types';

interface AgentBuilderProps {
  agentConfig: AgentConfig;
  documents: KnowledgeDocument[];
  onSaveConfig: (updated: AgentConfig) => Promise<void>;
  onUploadDocument: (doc: { name: string; type: 'pdf' | 'txt' | 'docx'; contentText: string; size: number }) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export const AgentBuilder: React.FC<AgentBuilderProps> = ({
  agentConfig,
  documents,
  onSaveConfig,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [config, setConfig] = useState<AgentConfig>(agentConfig);
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState<'faq' | 'catalog' | 'pricing' | 'rules'>('faq');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Synchronize internal state whenever agentConfig updates from backend
  React.useEffect(() => {
    setConfig(agentConfig);
  }, [agentConfig]);

  // Helper to instantly persist critical toggle switches (Global AI & Test Mode)
  const handleQuickToggle = async (updatedFields: Partial<AgentConfig>) => {
    const updated = { ...config, ...updatedFields };
    setConfig(updated);
    try {
      await onSaveConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Falha ao salvar toggle:', err);
    }
  };

  // Playground state
  const [testPrompt, setTestPrompt] = useState('Quanto custa o plano Starter e como funciona o WhatsApp?');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Voice synthesis playground state
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [voiceTestError, setVoiceTestError] = useState<string | null>(null);
  const [voiceTestSuccess, setVoiceTestSuccess] = useState<string | null>(null);

  // File upload state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAI = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testPrompt.trim() }),
      });
      const data = await res.json();
      setTestResponse(data);
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestVoice = async (customText?: string) => {
    setIsTestingVoice(true);
    setVoiceTestError(null);
    setVoiceTestSuccess(null);
    try {
      const textToSynthesize = customText || 'Olá! Aqui é a Sofia da MAVRA. Seja muito bem-vindo! Como posso ajudar a impulsionar as suas vendas e o seu atendimento hoje?';
      const keyToSend = config.voiceEngine === 'elevenlabs' 
        ? config.elevenLabsApiKey 
        : (config.googleTtsApiKey || config.geminiApiKey);
      const res = await fetch('/api/test-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSynthesize,
          apiKey: keyToSend,
          voiceName: config.voiceVoiceName || 'pt-BR-FranciscaNeural',
          engine: config.voiceEngine || 'native_sofia',
        }),
      });
      const data = await res.json();
      if (res.ok && data.audioBase64) {
        const engineLabel = data.engineUsed === 'native_sofia' ? 'Motor Neural Sofia (Voz Humana)' : data.engineUsed === 'elevenlabs' ? 'ElevenLabs' : 'Google Cloud TTS';
        if (data.notice) {
          setVoiceTestSuccess(`${data.notice} Tocando áudio agora no navegador!`);
        } else {
          setVoiceTestSuccess(`Áudio gerado com sucesso via ${engineLabel}! Tocando agora no navegador...`);
        }
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.play().catch((playErr) => {
          console.warn('Auto-play bloqueado pelo navegador:', playErr);
        });
      } else {
        setVoiceTestError(data.error || 'Falha ao sintetizar áudio.');
      }
    } catch (err: any) {
      setVoiceTestError('Erro de conexão ao testar áudio: ' + err.message);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setIsUploading(true);
      try {
        await onUploadDocument({
          name: file.name,
          type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
          contentText: content,
          size: file.size,
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8" id="agent-builder-module">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-900 text-white shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Construtor de Agente & Base de Conhecimento
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure em 15 minutos a Persona, os Motores Multi-IA (Gemini, OpenAI, Claude), regras de negócio e limites anti-alucinação.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                Salvo com sucesso!
              </span>
            )}
            <button
              id="btn-save-agent-config"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </div>

        {/* CONTROLE MASTER: MODO TESTE (ESTILO N8N) & CHAVE GERAL DA IA */}
        <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-6 shadow-sm space-y-5 bg-gradient-to-br from-amber-50/40 via-white to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Proteção de WhatsApp Pessoal & Modo de Teste
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded border border-amber-300">
                    Estilo n8n Test Step
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Protege seus contatos pessoais (família, amigos, grupos). A IA só responderá números autorizados ou quando você ligar.
                </p>
              </div>
            </div>

            {/* Master Switch: IA Global Ativa / Inativa */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-700">IA no WhatsApp:</span>
              <button
                type="button"
                id="toggle-global-ai"
                onClick={() => handleQuickToggle({ isGlobalAiActive: config.isGlobalAiActive !== false ? false : true })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.isGlobalAiActive !== false
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-rose-600 text-white shadow-xs'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{config.isGlobalAiActive !== false ? 'LIGADA (Ativa)' : 'DESLIGADA (Muda)'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opção Modo de Teste Restrito */}
            <div className={`p-4 rounded-xl border transition-all ${
              config.testModeEnabled
                ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                : 'bg-slate-50/80 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-slate-900">
                    Modo Teste: Whitelist de Números
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="checkbox-test-mode"
                    checked={config.testModeEnabled || false}
                    onChange={(e) => handleQuickToggle({ testModeEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Quando ativado, a IA <b>ignora 100% silenciosamente</b> mensagens de amigos, família ou desconhecidos. Somente os números cadastrados abaixo receberão respostas da Sofia!
              </p>

              {config.testModeEnabled && (
                <div className="mt-3 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-600" />
                    Número(s) Autorizados para Teste (com DDD):
                  </label>
                  <input
                    type="text"
                    id="input-test-whitelist"
                    value={config.testNumberWhitelist || ''}
                    onChange={(e) => setConfig({ ...config, testNumberWhitelist: e.target.value })}
                    onBlur={() => handleQuickToggle({ testNumberWhitelist: config.testNumberWhitelist })}
                    placeholder="Ex: 5511987654321, 5511999998888"
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-amber-800">
                    Coloque aqui o número do celular de teste (ex: o da sua esposa Tania). Se você receber mensagem de qualquer outro número, a IA não fará nada.
                  </p>
                </div>
              )}
            </div>

            {/* Explicação e status atual */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  Status de Proteção Atual:
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.isGlobalAiActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="text-slate-600">Motor WhatsApp:</span>
                    <span className="font-semibold text-slate-900">{config.isGlobalAiActive !== false ? 'Disponível' : 'Desativado (Silêncio Total)'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.testModeEnabled ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                    <span className="text-slate-600">Filtro de Audiência:</span>
                    <span className="font-semibold text-slate-900">
                      {config.testModeEnabled ? 'Restrito aos números de teste' : 'Aberto a todos os contatos'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                Dica: Lembre-se de clicar em "Salvar Alterações" no topo após alterar o modo.
              </p>
            </div>
          </div>
        </div>

        {/* 1. SELETOR MULTI-PROVEDOR DE IA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Motor de Inteligência Artificial (LLM Agnostic)
            </h3>
          </div>

          {/* Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Google Gemini */}
            <div
              onClick={() =>
                setConfig({
                  ...config,
                  activeProvider: 'gemini',
                  activeModel: 'gemini-2.5-flash',
                })
              }
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                config.activeProvider === 'gemini'
                  ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  Google Gemini
                </span>
                {config.activeProvider === 'gemini' && (
                  <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Gemini 2.5 Flash / Pro com Function Calling nativo e ultra-baixa latência.
              </p>
              <select
                value={config.activeProvider === 'gemini' ? config.activeModel : 'gemini-2.5-flash'}
                onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
                disabled={config.activeProvider !== 'gemini'}
                className="w-full bg-white border border-slate-200 rounded text-xs text-slate-800 px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recomendado)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Raciocínio Avançado)</option>
              </select>
            </div>

            {/* OpenAI */}
            <div
              onClick={() =>
                setConfig({
                  ...config,
                  activeProvider: 'openai',
                  activeModel: 'gpt-4o',
                })
              }
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                config.activeProvider === 'openai'
                  ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                  OpenAI
                </span>
                {config.activeProvider === 'openai' && (
                  <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Modelos de linguagem GPT-4o e GPT-4o-mini com alta precisão conversacional.
              </p>
              <select
                value={config.activeProvider === 'openai' ? config.activeModel : 'gpt-4o'}
                onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
                disabled={config.activeProvider !== 'openai'}
                className="w-full bg-white border border-slate-200 rounded text-xs text-slate-800 px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="gpt-4o">GPT-4o (Completo)</option>
                <option value="gpt-4o-mini">GPT-4o-mini (Econômico)</option>
              </select>
            </div>

            {/* Anthropic Claude */}
            <div
              onClick={() =>
                setConfig({
                  ...config,
                  activeProvider: 'anthropic',
                  activeModel: 'claude-3-5-sonnet',
                })
              }
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                config.activeProvider === 'anthropic'
                  ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-700" />
                  Anthropic
                </span>
                {config.activeProvider === 'anthropic' && (
                  <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Claude 3.5 Sonnet com excelência em nuance de tom e redação comercial.
              </p>
              <select
                value={config.activeProvider === 'anthropic' ? config.activeModel : 'claude-3-5-sonnet'}
                onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
                disabled={config.activeProvider !== 'anthropic'}
                className="w-full bg-white border border-slate-200 rounded text-xs text-slate-800 px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>

          {/* API Keys Configuration Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-700" />
              Chaves de API dos Provedores (Armazenadas de forma segura no backend)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="Injetada automaticamente..."
                  value={config.geminiApiKey || ''}
                  onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">
                  Google Cloud TTS API Key (Voz Oficial)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (Chave com TTS ativo)"
                  value={config.googleTtsApiKey || ''}
                  onChange={(e) => setConfig({ ...config, googleTtsApiKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={config.openaiApiKey || ''}
                  onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">
                  ElevenLabs API Key
                </label>
                <input
                  type="password"
                  placeholder="xi-api-key..."
                  value={config.elevenLabsApiKey || ''}
                  onChange={(e) => setConfig({ ...config, elevenLabsApiKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. PERSONA DO AGENTE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Persona & Comportamento do Agente Comercial
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Agente
              </label>
              <input
                type="text"
                value={config.personaName}
                onChange={(e) => setConfig({ ...config, personaName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Papel / Cargo
              </label>
              <input
                type="text"
                value={config.role}
                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tom de Voz
              </label>
              <input
                type="text"
                value={config.toneOfVoice}
                onChange={(e) => setConfig({ ...config, toneOfVoice: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objetivo Comercial Primordial
              </label>
              <input
                type="text"
                value={config.salesGoal}
                onChange={(e) => setConfig({ ...config, salesGoal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          {/* Behavioral checkboxes */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.strictKnowledgeOnly}
                onChange={(e) => setConfig({ ...config, strictKnowledgeOnly: e.target.checked })}
                className="rounded bg-white border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-emerald-800">
                Regra Anti-Alucinação Ativa (a IA só responde baseada no conhecimento cadastrado)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoTriggerCRMStages}
                onChange={(e) => setConfig({ ...config, autoTriggerCRMStages: e.target.checked })}
                className="rounded bg-white border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-slate-800">
                Gatilhos Automáticos do CRM (mover estágios e salvar dados do lead via Function Calling)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoTranscribeAudio !== false}
                onChange={(e) => setConfig({ ...config, autoTranscribeAudio: e.target.checked })}
                className="rounded bg-white border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-sky-800">
                Ouvir Áudios do WhatsApp (Transcrição instantânea com Gemini e resposta automática em texto)
              </span>
            </label>
          </div>

          {/* Envio Automático de Apresentação / Catálogo em PDF */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-slate-50/60 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Envio Automático de Apresentação Oficial em PDF
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                Disparo via WhatsApp
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Quando o cliente pedir apresentação, proposta, catálogo ou tabela no WhatsApp, a Sofia responde amigavelmente e anexa o arquivo PDF automaticamente para ele baixar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Link Público do PDF (URL direta do documento)
                </label>
                <input
                  type="url"
                  value={config.catalogPdfUrl || ''}
                  onChange={(e) => setConfig({ ...config, catalogPdfUrl: e.target.value })}
                  placeholder="https://sua-empresa.com/apresentacao.pdf"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nome do Arquivo PDF Exibido no WhatsApp
                </label>
                <input
                  type="text"
                  value={config.catalogPdfName || ''}
                  onChange={(e) => setConfig({ ...config, catalogPdfName: e.target.value })}
                  placeholder="Ex: Apresentacao_Institucional_MAVRA.pdf"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Respostas de Voz Nativas (Google Cloud Text-to-Speech / WhatsApp PTT) */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-violet-50/50 p-5 rounded-xl space-y-4 border border-violet-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-violet-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Respostas de Áudio da Sofia (Google Cloud Text-to-Speech & WhatsApp PTT)
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-voice-response"
                  checked={config.voiceResponseEnabled !== false}
                  onChange={(e) => handleQuickToggle({ voiceResponseEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Com o <b>Google Cloud Text-to-Speech (Vozes Neural2 & Journey)</b>, a Sofia gera áudios em português brasileiro com entonação humana, natural e fluida em menos de 800ms, enviando diretamente no WhatsApp do lead como nota de voz original (PTT com ondas sonoras).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Modo de Resposta */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Comportamento da Sofia
                </label>
                <select
                  value={config.voiceResponseMode || 'smart_discernment'}
                  onChange={(e) => setConfig({ ...config, voiceResponseMode: e.target.value as any })}
                  className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-violet-400 font-medium"
                >
                  <option value="smart_discernment">🧠 Discernimento Inteligente (Áudio com Áudio / Texto com Texto)</option>
                  <option value="always_audio">🎙️ Sempre Responder em Áudio (100% dos contatos)</option>
                  <option value="only_text">💬 Apenas Texto Rápido (Desativa áudio)</option>
                </select>
              </div>

              {/* Motor de Voz */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Motor de Síntese de Voz
                </label>
                <select
                  value={config.voiceEngine || 'native_sofia'}
                  onChange={(e) => {
                    const engine = e.target.value as any;
                    const defaultVoice = engine === 'elevenlabs' ? '21m00Tcm4TlvDq8ikWAM' : engine === 'google_cloud_tts' ? 'pt-BR-Neural2-C' : 'pt-BR-FranciscaNeural';
                    setConfig({ ...config, voiceEngine: engine, voiceVoiceName: defaultVoice });
                  }}
                  className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-violet-400 font-medium"
                >
                  <option value="native_sofia">⚡ Motor Neural Sofia (Recomendado - 100% Humano, Grátis & Sem Chaves)</option>
                  <option value="elevenlabs">💎 ElevenLabs (Vozes Ultra-Humanas / Clonadas do Ela)</option>
                  <option value="google_cloud_tts">🌐 Google Cloud TTS (Neural2 / Journey - Requer GCP)</option>
                </select>
              </div>

              {/* Tom / Perfil de Voz */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Perfil de Voz Nativa (pt-BR)
                </label>
                <select
                  value={config.voiceVoiceName || 'pt-BR-FranciscaNeural'}
                  onChange={(e) => setConfig({ ...config, voiceVoiceName: e.target.value })}
                  className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-violet-400 font-medium"
                >
                  {config.voiceEngine === 'elevenlabs' ? (
                    <>
                      <option value="21m00Tcm4TlvDq8ikWAM">Rachel (ElevenLabs - Feminina Calma & Confiante)</option>
                      <option value="EXAVITQu4vr4xnSDxMaL">Bella (ElevenLabs - Feminina Jovem & Expressiva)</option>
                      <option value="AZnzlk1XvdvUeBnXmlld">Domi (ElevenLabs - Feminina Comercial & Firme)</option>
                      <option value="pNInz6obpgDQGcFmaJgB">Adam (ElevenLabs - Masculina Profunda & Profissional)</option>
                      <option value="ErXwobaYiN019PkySvjV">Antoni (ElevenLabs - Masculina Acolhedora)</option>
                    </>
                  ) : config.voiceEngine === 'google_cloud_tts' ? (
                    <>
                      <option value="pt-BR-Neural2-C">Sofia Comercial (pt-BR-Neural2-C)</option>
                      <option value="pt-BR-Neural2-A">Sofia Acolhedora (pt-BR-Neural2-A)</option>
                      <option value="pt-BR-Journey-F">Sofia Podcast (pt-BR-Journey-F)</option>
                    </>
                  ) : (
                    <>
                      <option value="pt-BR-FranciscaNeural">Sofia Neural Humana (pt-BR - Mais Realista, Fluida & Empática)</option>
                      <option value="pt-BR-ThalitaNeural">Sofia Jovem & Comercial (pt-BR - Dinâmica e Descontraída)</option>
                      <option value="pt-BR-BrendaNeural">Sofia Acolhedora (pt-BR - Suave, Calma e Educada)</option>
                      <option value="pt-BR-AntonioNeural">Executivo Comercial (pt-BR - Masculina Firme & Confiante)</option>
                      <option value="pt-BR-NicolauNeural">Diretor Comercial (pt-BR - Masculina Grave & Segura)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Painel do Motor de Voz e Teste ao Vivo */}
            <div className="bg-white/90 border border-violet-200/80 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-violet-700" />
                    {config.voiceEngine === 'native_sofia'
                      ? 'Motor Neural Sofia (Voz Humana com Respiração Natural)'
                      : config.voiceEngine === 'elevenlabs'
                      ? 'Motor ElevenLabs (Voz Clonada & Hiper-Realista)'
                      : 'Google Cloud Text-to-Speech'}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {config.voiceEngine === 'native_sofia'
                      ? 'Voz neural de última geração com prosódia humana real, pausas naturais e sem sotaque robótico dos anos 90! 100% pronta e gratuita.'
                      : config.voiceEngine === 'elevenlabs'
                      ? 'Insira abaixo sua chave xi-api-key da ElevenLabs para usar a mesma voz ultra-humana do seu outro aplicativo.'
                      : 'Insira suas credenciais abaixo ou use o teste direto.'}
                  </p>
                </div>

                {/* Botão de Teste de Voz ao Vivo */}
                <button
                  type="button"
                  id="btn-test-voice"
                  onClick={() => handleTestVoice()}
                  disabled={isTestingVoice}
                  className="flex items-center justify-center gap-2 bg-violet-700 hover:bg-violet-800 disabled:bg-violet-400 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
                >
                  {isTestingVoice ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sintetizando...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>🎧 Testar e Ouvir Voz Agora</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informação sobre chaves Google AI Studio vs Google Cloud */}
              {config.voiceEngine === 'google_cloud_tts' && (
                <div className="pt-2 border-t border-violet-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-violet-700" />
                      Chave de API do Google Cloud (Text-to-Speech)
                    </label>
                    {config.geminiApiKey && !config.googleTtsApiKey && (
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, googleTtsApiKey: config.geminiApiKey })}
                        className="text-[10px] text-violet-700 hover:text-violet-900 font-semibold underline cursor-pointer"
                      >
                        Copiar chave usada no Gemini
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    id="input-google-tts-key"
                    placeholder="Cole aqui sua API Key do Google Cloud"
                    value={config.googleTtsApiKey || ''}
                    onChange={(e) => setConfig({ ...config, googleTtsApiKey: e.target.value })}
                    className="w-full bg-slate-50 border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-violet-500 focus:bg-white"
                  />
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-800">
                    💡 <b>Nota do Google:</b> Chaves geradas no <i>Google AI Studio</i> são destinadas ao <b>Gemini</b> (para o cérebro/inteligência). O Google Cloud Text-to-Speech v1 exige OAuth2/Service Account. Caso o Google Cloud bloqueie a chave, o sistema automaticamente usa o <b>Motor Nativo Sofia</b> para que seu cliente nunca fique sem áudio!
                  </div>
                </div>
              )}

              {config.voiceEngine === 'elevenlabs' && (
                <div className="pt-2 border-t border-violet-100 space-y-2">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-violet-700" />
                    ElevenLabs API Key
                  </label>
                  <input
                    type="password"
                    placeholder="xi-api-key..."
                    value={config.elevenLabsApiKey || ''}
                    onChange={(e) => setConfig({ ...config, elevenLabsApiKey: e.target.value })}
                    className="w-full bg-slate-50 border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-violet-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Status e Feedback do Teste de Voz */}
              {voiceTestSuccess && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{voiceTestSuccess}</span>
                </div>
              )}

              {voiceTestError && (
                <div className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Não foi possível sintetizar a voz com essa chave:</span>
                  </div>
                  <p className="font-mono text-[10px] pl-6">{voiceTestError}</p>
                  <p className="text-[10px] text-rose-700 pl-6">
                    💡 Dica: Certifique-se de que a API <b>Cloud Text-to-Speech API</b> está ativada no seu Google Cloud Console na mesma conta da sua chave.
                  </p>
                </div>
              )}

              <p className="text-[10px] text-slate-500 leading-normal">
                🔒 A chave é armazenada de forma segura no servidor. Com o Motor Neural Sofia nativo, nenhum custo ou chave externa é necessária.
              </p>
            </div>

            {/* Travas Inteligentes e Economia de Áudio */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-700" />
                  <h5 className="text-xs font-bold text-slate-900">
                    Travas de Áudio & Economia Inteligente (Anti-Spam de Voz)
                  </h5>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                  Proteção Ativa
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Configure os limites de áudio para manter a conversa ágil, sem cansar o cliente e economizando processamento.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Máximo de Áudios Seguidos
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={config.maxConsecutiveAudios ?? 2}
                      onChange={(e) => setConfig({ ...config, maxConsecutiveAudios: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-24 bg-white border border-violet-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-violet-500"
                    />
                    <span className="text-[11px] text-slate-500">áudios consecutivos</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Após essa quantidade, a Sofia passa a responder em texto para não sobrecarregar o cliente.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tamanho Máximo para Áudio
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={80}
                      max={600}
                      step={20}
                      value={config.maxAudioChars ?? 220}
                      onChange={(e) => setConfig({ ...config, maxAudioChars: Math.max(80, parseInt(e.target.value) || 220) })}
                      className="w-24 bg-white border border-violet-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-violet-500"
                    />
                    <span className="text-[11px] text-slate-500">caracteres (~15 a 20s)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Respostas longas, explicações detalhadas ou especificações são priorizadas em <b>TEXTO</b> automaticamente.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 border border-violet-100 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-violet-900">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>Prioridades de Discernimento Ativas:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-slate-600 pl-1">
                  <li><b>Cliente enviou Texto ➡️ Sempre responde em Texto:</b> Se a pessoa digitou, ela quer ler rápido e em silêncio. Sofia NUNCA manda áudio para mensagem de texto (a não ser que a pessoa peça expressamente "manda um áudio").</li>
                  <li><b>Cliente enviou Áudio ➡️ Responde em Áudio:</b> Mantém o tom acolhedor e a conversa humanizada.</li>
                  <li><b>PIX, Links, Contas e E-mails:</b> Sempre enviados em texto para permitir cópia imediata com 1 toque.</li>
                  <li><b>Respostas Longas (&gt; limite de caracteres):</b> Convertidas automaticamente em texto para não gerar áudios cansativos.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Envio de Chave PIX e Fechamento Comercial */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-emerald-50/50 p-4 rounded-xl space-y-3 border border-emerald-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Dados de Pagamento & Chave PIX Oficial
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-full">
                Conversão Direta
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Quando o lead demonstrar intenção de pagamento ou pedir chave PIX, a Sofia envia automaticamente a chave formatada pronta para cópia rápida no WhatsApp e orienta o envio do comprovante.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Chave PIX Oficial da Empresa
                </label>
                <input
                  type="text"
                  value={config.pixKey || ''}
                  onChange={(e) => setConfig({ ...config, pixKey: e.target.value })}
                  placeholder="Ex: seu-email@empresa.com ou CNPJ"
                  className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tipo da Chave
                </label>
                <select
                  value={config.pixKeyType || 'email'}
                  onChange={(e) => setConfig({ ...config, pixKeyType: e.target.value as any })}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-400"
                >
                  <option value="email">E-mail</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="cpf">CPF</option>
                  <option value="telefone">Telefone (com DDD)</option>
                  <option value="aleatoria">Chave Aleatória (EVP)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Follow-up Automático para Leads Dormentes */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-sky-50/50 p-5 rounded-xl space-y-4 border border-sky-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Motor de Follow-up Automático de Recuperação de Leads
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-followup"
                  checked={config.autoFollowUpEnabled !== false}
                  onChange={(e) => handleQuickToggle({ autoFollowUpEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
            
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Reative contatos que pararam de responder! Se um paciente ou cliente parar de responder após tirar dúvidas, receber valores ou passar por triagem, o motor em segundo plano envia uma mensagem humanizada, carinhosa e natural no WhatsApp.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Nicho do Follow-up */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nicho / Contexto do Follow-up
                </label>
                <select
                  value={config.followUpNiche || 'dental'}
                  onChange={(e) => setConfig({ ...config, followUpNiche: e.target.value as any })}
                  className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-400 font-medium"
                >
                  <option value="dental">🦷 Odontologia (Consultas, Procedimentos & Dor)</option>
                  <option value="medical">🩺 Clínica Médica / Saúde (Avaliações & Exames)</option>
                  <option value="sales">🚀 Vendas B2B / Corporativo (Propostas & Fechamento)</option>
                  <option value="custom">✏️ Mensagem Personalizada (Template Manual)</option>
                </select>
              </div>

              {/* Intervalo de Inatividade */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tempo de Inatividade para Disparo
                </label>
                <select
                  value={config.followUpDelayHours || 4}
                  onChange={(e) => setConfig({ ...config, followUpDelayHours: Number(e.target.value) })}
                  className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-400 font-medium"
                >
                  <option value={2}>2 horas sem resposta (Ágil)</option>
                  <option value={4}>4 horas sem resposta (Recomendado)</option>
                  <option value={8}>8 horas sem resposta</option>
                  <option value={12}>12 horas sem resposta</option>
                  <option value={24}>24 horas (Dia seguinte)</option>
                  <option value={48}>48 horas (2 dias)</option>
                </select>
              </div>

              {/* Máximo de Tentativas */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Máximo de Follow-ups por Lead
                </label>
                <select
                  value={config.maxFollowUpsPerLead || 2}
                  onChange={(e) => setConfig({ ...config, maxFollowUpsPerLead: Number(e.target.value) })}
                  className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-400 font-medium"
                >
                  <option value={1}>1 follow-up (Apenas 1 tentativa)</option>
                  <option value={2}>2 follow-ups (Recomendado)</option>
                  <option value={3}>3 follow-ups (Máximo)</option>
                </select>
              </div>
            </div>

            {/* Custom Template Field if selected */}
            {config.followUpNiche === 'custom' && (
              <div className="bg-white border border-sky-200 rounded-lg p-3 space-y-2">
                <label className="block text-[11px] font-bold text-slate-800">
                  Modelo de Mensagem Personalizada
                </label>
                <textarea
                  rows={2}
                  value={config.followUpCustomMessage || ''}
                  onChange={(e) => setConfig({ ...config, followUpCustomMessage: e.target.value })}
                  placeholder="Ex: Olá, {nome}! Tudo bem? Passando para ver se você conseguiu avaliar nosso orçamento de {procedimento}?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-sky-400 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Variáveis suportadas: <code className="bg-slate-100 px-1 rounded font-bold">{"{nome}"}</code>, <code className="bg-slate-100 px-1 rounded font-bold">{"{procedimento}"}</code>, <code className="bg-slate-100 px-1 rounded font-bold">{"{interesse}"}</code>
                </p>
              </div>
            )}

            {/* Preview Box & Run Now Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-sky-100">
              <div className="text-[11px] text-sky-900 bg-white/80 p-2 rounded-lg border border-sky-200 flex-1">
                <span className="font-bold block text-[10px] text-sky-700">Exemplo de Mensagem Gerada ({config.followUpNiche || 'dental'}):</span>
                <span className="italic text-slate-700">
                  {config.followUpNiche === 'dental'
                    ? '"Olá, Roberto! Tudo bem por aí? Passando rapidinho para saber se você conseguiu ver os horários para a sua avaliação ou se prefere que a gente veja outro período para você! 😊"'
                    : config.followUpNiche === 'medical'
                    ? '"Olá, Roberto! Como você está? Gostaria de confirmar se podemos reservar o seu horário na clínica ou se prefere uma outra data!"'
                    : config.followUpNiche === 'sales'
                    ? '"Olá, Roberto! Tudo bem? Passando para saber se conseguiu dar uma olhada na nossa apresentação ou se ficou alguma dúvida que eu possa esclarecer para avançarmos! 🚀"'
                    : (config.followUpCustomMessage || 'Mensagem personalizada...')}
                </span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/followup/run-now', { method: 'POST' });
                    const d = await res.json();
                    alert(d.message || 'Ciclo de follow-up concluído com sucesso!');
                  } catch (e: any) {
                    alert('Erro ao executar follow-up: ' + e.message);
                  }
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Executar Follow-up Agora</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. BASE DE CONHECIMENTO DINÂMICA (Abas Estruturadas) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                3. Base de Conhecimento Estruturada & Regras de Negócio
              </h3>
            </div>
          </div>

          {/* Knowledge tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveKnowledgeTab('faq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeKnowledgeTab === 'faq'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ / Dúvidas Frequentes</span>
            </button>

            <button
              onClick={() => setActiveKnowledgeTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeKnowledgeTab === 'catalog'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Catálogo de Produtos</span>
            </button>

            <button
              onClick={() => setActiveKnowledgeTab('pricing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeKnowledgeTab === 'pricing'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tabela de Preços</span>
            </button>

            <button
              onClick={() => setActiveKnowledgeTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeKnowledgeTab === 'rules'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Regras de Negócio</span>
            </button>
          </div>

          {/* Active Tab Textarea */}
          <div>
            {activeKnowledgeTab === 'faq' && (
              <textarea
                rows={8}
                value={config.knowledgeFaq}
                onChange={(e) => setConfig({ ...config, knowledgeFaq: e.target.value })}
                placeholder="Insira as perguntas e respostas mais comuns..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
              />
            )}

            {activeKnowledgeTab === 'catalog' && (
              <textarea
                rows={8}
                value={config.knowledgeCatalog}
                onChange={(e) => setConfig({ ...config, knowledgeCatalog: e.target.value })}
                placeholder="Descreva detalhadamente seus produtos, planos ou serviços..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
              />
            )}

            {activeKnowledgeTab === 'pricing' && (
              <textarea
                rows={8}
                value={config.knowledgePricing}
                onChange={(e) => setConfig({ ...config, knowledgePricing: e.target.value })}
                placeholder="Valores, condições de parcelamento, descontos e taxas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
              />
            )}

            {activeKnowledgeTab === 'rules' && (
              <textarea
                rows={8}
                value={config.knowledgeRules}
                onChange={(e) => setConfig({ ...config, knowledgeRules: e.target.value })}
                placeholder="Limites da IA, diretrizes de encaminhamento e regras anti-alucinação..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* 4. DOCUMENTOS DE REFERÊNCIA (PDF / TXT / DOCX) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                4. Documentos de Referência Complementares
              </h3>
            </div>

            <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200 transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-700" />
              <span>{isUploading ? 'Processando...' : 'Carregar Documento (.txt, .pdf)'}</span>
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.length === 0 ? (
              <div className="col-span-2 p-6 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 bg-slate-50/50">
                Nenhum documento carregado ainda. Faça upload de manuais ou tabelas para enriquecer a base.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                        {doc.contentText}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Excluir documento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. PLAYGROUND / TESTADOR INSTANTÂNEO DO AGENTE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              5. Simulador Instantâneo do Agente (Teste ao Vivo)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Digite qualquer pergunta como se fosse um cliente no WhatsApp para ver a resposta exata da IA e se ela identifica movimentação de etapa.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Digite uma mensagem de teste..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
            />
            <button
              onClick={handleTestAI}
              disabled={isTesting || !testPrompt.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTesting ? 'Processando...' : 'Testar Resposta'}</span>
            </button>
          </div>

          {testResponse && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mt-3">
              {testResponse.error ? (
                <div className="text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Erro no teste: {testResponse.error}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                    <span>Motor utilizado: <b className="text-slate-900">{testResponse.providerUsed} ({testResponse.modelUsed})</b></span>
                    <div className="flex items-center gap-2">
                      {testResponse.sendCatalogPdf && (
                        <span className="text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          PDF de Apresentação Solicitado
                        </span>
                      )}
                      {testResponse.stageTriggered && (
                        <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Funil Atualizado para: {testResponse.stageTriggered}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                      Resposta Gerada para o WhatsApp:
                    </span>
                    <p className="text-xs text-slate-900 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      {testResponse.replyText}
                    </p>
                  </div>

                  {testResponse.extractedInfo && (
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">Dados do Lead Identificados:</span>{' '}
                      {JSON.stringify(testResponse.extractedInfo)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
