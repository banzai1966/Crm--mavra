import React, { useState, useEffect } from 'react';
import {
  Radio,
  Server,
  Key,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  Send,
  Zap,
  Sparkles,
  Phone,
  AlertTriangle,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
  Activity,
  Trash2,
  Inbox
} from 'lucide-react';
import { EvolutionConfig, WebhookEventLog } from '../types';

interface EvolutionSettingsProps {
  evolutionConfig: EvolutionConfig;
  onSaveConfig: (config: EvolutionConfig) => Promise<void>;
  onTestConnection: () => Promise<void>;
  onSimulateWebhook: (phone: string, message: string, pushName: string) => Promise<void>;
}

export const EvolutionSettings: React.FC<EvolutionSettingsProps> = ({
  evolutionConfig,
  onSaveConfig,
  onTestConnection,
  onSimulateWebhook,
}) => {
  const [config, setConfig] = useState<EvolutionConfig>(evolutionConfig);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-config VPS webhook state
  const [isAutoConfiguring, setIsAutoConfiguring] = useState(false);
  const [autoConfigFeedback, setAutoConfigFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Real-time Webhook Diagnostic Logs
  const [webhookLogs, setWebhookLogs] = useState<WebhookEventLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Fetch live webhook logs
  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch('/api/webhook/logs');
      if (res.ok) {
        const data = await res.json();
        setWebhookLogs(data);
      }
    } catch (err) {
      console.error('Falha ao obter logs do webhook:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = async () => {
    try {
      await fetch('/api/webhook/logs', { method: 'DELETE' });
      setWebhookLogs([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Quick preset helper
  const handleApplyMarcoInstance = () => {
    setConfig({
      ...config,
      serverUrl: 'https://api.makprojetosmake.com.br',
      apiKey: 'CE08ADFF7647-4B88-91A4-55E66D9A0620',
      instanceName: 'agente-ia',
    });
  };

  // Helper to extract clean URL without label leftovers
  const cleanUrlString = (val: string) => {
    const match = val.match(/https?:\/\/[^\s"'<>]+/i);
    return match ? match[0].replace(/\/+$/, '') : val.trim();
  };

  // Simulator state
  const [simPhone, setSimPhone] = useState('5511999998888');
  const [simPushName, setSimPushName] = useState('Juliana Costa (Lead Teste)');
  const [simMessage, setSimMessage] = useState('Olá! Gostaria de saber os valores do plano Enterprise para 8 atendentes.');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  // Dynamically derive current origin webhook URL
  const webhookUrl = `${window.location.origin}/api/webhook`;

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  const handleAutoSetWebhook = async () => {
    setIsAutoConfiguring(true);
    setAutoConfigFeedback(null);
    try {
      // First, ensure the current sanitized configuration is saved to backend
      const sanitizedConfig: EvolutionConfig = {
        ...config,
        serverUrl: cleanUrlString(config.serverUrl),
        apiKey: config.apiKey.trim(),
        instanceName: config.instanceName.trim(),
      };
      await onSaveConfig(sanitizedConfig);
      setConfig(sanitizedConfig);

      const res = await fetch('/api/evolution/auto-set-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAutoConfigFeedback({
          type: 'success',
          message: 'Webhook gravado com sucesso na VPS Evolution! A instância agente-ia agora enviará todas as mensagens diretamente ao Mavra CRM.',
        });
      } else {
        setAutoConfigFeedback({
          type: 'error',
          message: data.error || 'Não foi possível gravar automaticamente na VPS. Verifique o servidor e apikey.',
        });
      }
    } catch (err: any) {
      setAutoConfigFeedback({
        type: 'error',
        message: 'Erro ao conectar à VPS Evolution: ' + err.message,
      });
    } finally {
      setIsAutoConfiguring(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const sanitizedConfig = {
        ...config,
        serverUrl: cleanUrlString(config.serverUrl),
        apiKey: config.apiKey.trim(),
        instanceName: config.instanceName.trim(),
      };
      await onSaveConfig(sanitizedConfig);
      setConfig(sanitizedConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTestConnection();
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPhone.trim() || !simMessage.trim()) return;

    setIsSimulating(true);
    setSimSuccess(false);
    try {
      await onSimulateWebhook(simPhone.trim(), simMessage.trim(), simPushName.trim());
      setSimSuccess(true);
      setTimeout(() => setSimSuccess(false), 4000);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8" id="evolution-module">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-900 text-white shadow-2xs">
                <Radio className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Conexão Nativa Evolution API v2 (WhatsApp)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Conecte sua VPS diretamente com o MAVRA sem precisar de n8n, Typebot ou intermediários.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                evolutionConfig.isConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  evolutionConfig.isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'
                }`}
              ></span>
              {evolutionConfig.isConnected ? 'Instância Conectada' : 'Aguardando Conexão'}
            </span>
          </div>
        </div>

        {/* 1. WEBHOOK BLINDADO (<50ms) COPY BOX & AUTO-GRAVAÇÃO NA VPS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                URL do Webhook do Mavra CRM (Substituto Direto do n8n)
              </h3>
            </div>

            {/* Quick Auto-Config Button directly to the VPS */}
            <button
              type="button"
              onClick={handleAutoSetWebhook}
              disabled={isAutoConfiguring}
              id="btn-auto-set-webhook"
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Grava esta URL diretamente na sua Evolution API via API, sem precisar abrir o Evolution Manager"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAutoConfiguring ? 'animate-spin' : ''}`} />
              <span>{isAutoConfiguring ? 'Gravando na VPS...' : 'Gravar Webhook na VPS com 1 Clique'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            O Mavra CRM substitui totalmente o n8n: ele recebe o webhook da Evolution API diretamente, cadastra o lead, aciona a IA Sofia e dispara a resposta de volta ao WhatsApp. Para que a Evolution API saiba onde enviar as mensagens, esta URL precisa estar configurada na sua instância.
          </p>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
            <span className="font-mono text-xs text-slate-800 flex-1 truncate px-2 select-all">
              {webhookUrl}
            </span>
            <button
              onClick={handleCopyWebhook}
              id="btn-copy-webhook-url"
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
            >
              {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedWebhook ? 'Copiado!' : 'Copiar URL'}</span>
            </button>
          </div>

          {autoConfigFeedback && (
            <div className={`text-xs p-3 rounded-xl border flex items-center gap-2 ${
              autoConfigFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {autoConfigFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{autoConfigFeedback.message}</span>
            </div>
          )}

          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-4 pt-1">
            <span>• Evento principal: <code className="text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">MESSAGES_UPSERT</code></span>
            <span>• Resposta instantânea: <code className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">&lt; 50ms (Zero-Timeout)</code></span>
          </div>
        </div>

        {/* 2. CREDENCIAIS DA EVOLUTION API */}
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Configurações da VPS e Instância Evolution
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyMarcoInstance}
                id="btn-apply-marco-instance"
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="Preencher com os dados da instância agente-ia detectada"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                <span>Usar Dados da Instância agente-ia</span>
              </button>

              <button
                type="button"
                onClick={handleTest}
                disabled={isTesting}
                id="btn-test-evolution-conn"
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Testar Conexão</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                id="btn-save-evolution-config"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Salvando...' : 'Salvar Dados'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL da Evolution API (Sua VPS) *
              </label>
              <input
                type="url"
                required
                placeholder="https://api.makprojetosmake.com.br"
                value={config.serverUrl}
                onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                onBlur={(e) => setConfig({ ...config, serverUrl: cleanUrlString(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Ex: <code className="text-slate-600">https://api.makprojetosmake.com.br</code>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chave de API / Security Value (Apikey) *
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  required
                  placeholder="CE08ADFF7647-4B88-91A4-55E66D9A0620"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                  title={showApiKey ? 'Ocultar chave' : 'Mostrar chave'}
                >
                  {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Token da instância (ex: <code className="text-slate-600">CE08ADFF...</code>)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Instância *
              </label>
              <input
                type="text"
                required
                placeholder="agente-ia"
                value={config.instanceName}
                onChange={(e) => setConfig({ ...config, instanceName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Nome no Evolution Manager: <code className="text-emerald-700">agente-ia</code>
              </span>
            </div>
          </div>

          {/* Guia Rápido de Configuração */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-semibold text-slate-900">
                Correspondência com sua tela do Evolution Manager (v2.3.7):
              </p>
              <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                <li><strong className="text-slate-900">URL da API:</strong> <code className="text-slate-800 font-bold">https://api.makprojetosmake.com.br</code> (endereço do seu servidor)</li>
                <li><strong className="text-slate-900">Security Value / Apikey:</strong> <code className="text-slate-800 font-bold">CE08ADFF7647-4B88-91A4-55E66D9A0620</code> (campo de token da sua instância)</li>
                <li><strong className="text-slate-900">Instância:</strong> <code className="text-emerald-700 font-bold">agente-ia</code> (conectada ao número 5511976143323)</li>
              </ul>
            </div>
          </div>

          {saveSuccess && (
            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Configurações da Evolution API salvas e ativadas com sucesso no MAVRA.</span>
            </div>
          )}
        </form>

        {/* 3. SIMULADOR DE MENSAGENS WHATSAPP (TESTE REAL DO WEBHOOK) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Simulador Interativo de Mensagem WhatsApp
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Teste o recebimento de mensagens e assista o webhook blindado processar em background, cadastrar o lead no CRM, invocar a IA e mover o card no Kanban automaticamente!
          </p>

          <form onSubmit={handleRunSimulation} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Número do WhatsApp Remetente
                </label>
                <input
                  type="text"
                  required
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  placeholder="5511999998888"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Perfil WhatsApp (PushName)
                </label>
                <input
                  type="text"
                  value={simPushName}
                  onChange={(e) => setSimPushName(e.target.value)}
                  placeholder="Juliana Costa"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Texto da Mensagem Enviada pelo Cliente
              </label>
              <textarea
                rows={3}
                required
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                placeholder="Ex: Gostaria de saber os valores para 8 atendentes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {simSuccess ? (
                <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-700" />
                  Mensagem simulada enviada com sucesso! Verifique na Central de Chat e no Kanban.
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Aciona a rota <code className="text-slate-700">POST /api/webhook</code> com payload Evolution API v2.
                </span>
              )}

              <button
                type="submit"
                disabled={isSimulating}
                id="btn-simulate-whatsapp"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSimulating ? 'Disparando...' : 'Disparar Mensagem Simulada'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* 4. MONITOR E DIAGNÓSTICO EM TEMPO REAL DO WEBHOOK (TRANSPARÊNCIA TOTAL) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Monitor em Tempo Real de Webhooks Recebidos
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                Auto-atualização ativa (4s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchLogs}
                disabled={isLoadingLogs}
                id="btn-refresh-webhook-logs"
                className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                <span>Atualizar Logs</span>
              </button>

              {webhookLogs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  id="btn-clear-webhook-logs"
                  className="flex items-center gap-1 text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  title="Limpar histórico de requisições"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Veja exatamente o que a sua Evolution API está enviando para o Mavra. Quando você mandar uma mensagem do WhatsApp, uma nova linha aparecerá aqui instantaneamente!
          </p>

          {webhookLogs.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Nenhum evento de webhook recebido ainda</p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1">
                Envie uma mensagem para o seu número da Evolution API ou use o botão <b>"Gravar Webhook na VPS com 1 Clique"</b> acima para conectar os pontos.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border bg-slate-50/80 border-slate-200 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        log.status === 'processed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'ignored_from_me'
                          ? 'bg-amber-100 text-amber-800'
                          : log.status === 'ignored_group'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status === 'processed' && '✅ PROCESSADO COM SUCESSO'}
                        {log.status === 'ignored_from_me' && '⚠️ REMETENTE = BOT (IGNORADO)'}
                        {log.status === 'ignored_group' && 'ℹ️ GRUPO (IGNORADO)'}
                        {log.status === 'no_text' && 'ℹ️ SEM TEXTO / MÍDIA'}
                        {log.status === 'error' && '❌ ERRO'}
                      </span>

                      <span className="font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </span>

                      {log.senderPhone && (
                        <span className="font-mono font-semibold text-slate-800">
                          +{log.senderPhone}
                        </span>
                      )}
                    </div>

                    {log.messageText && (
                      <p className="text-slate-900 font-medium bg-white p-2 rounded-lg border border-slate-200">
                        "{log.messageText}"
                      </p>
                    )}

                    {log.details && (
                      <p className="text-[11px] text-slate-600">
                        {log.details}
                      </p>
                    )}
                  </div>

                  {log.rawPayloadSnippet && (
                    <details className="text-[10px] text-slate-500 font-mono">
                      <summary className="cursor-pointer hover:text-slate-800">Ver payload</summary>
                      <pre className="p-2 bg-slate-900 text-slate-100 rounded-lg mt-1 overflow-x-auto max-w-md">
                        {log.rawPayloadSnippet}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
