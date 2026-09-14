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
  AlertCircle
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

  // Playground state
  const [testPrompt, setTestPrompt] = useState('Quanto custa o plano Starter e como funciona o WhatsApp?');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="Injetada automaticamente ou personalizada..."
                  value={config.geminiApiKey || ''}
                  onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
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
                <label className="block text-[11px] text-slate-500 mb-1">
                  Anthropic API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-ant-..."
                  value={config.anthropicApiKey || ''}
                  onChange={(e) => setConfig({ ...config, anthropicApiKey: e.target.value })}
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
                    {testResponse.stageTriggered && (
                      <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Funil Atualizado para: {testResponse.stageTriggered}
                      </span>
                    )}
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
