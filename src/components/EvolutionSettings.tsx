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
  Inbox,
  X,
  Plus,
  LogOut,
  Smartphone
} from 'lucide-react';
import { EvolutionConfig, WebhookEventLog } from '../types';

interface EvolutionSettingsProps {
  evolutionConfig: EvolutionConfig;
  onSaveConfig: (config: EvolutionConfig) => Promise<void>;
  onTestConnection: () => Promise<void>;
  onSimulateWebhook: (
    phone: string,
    message: string,
    pushName: string,
    mediaType?: 'text' | 'audio' | 'document' | 'image',
    fileName?: string
  ) => Promise<void>;
}

export const EvolutionSettings: React.FC<EvolutionSettingsProps> = ({
  evolutionConfig,
  onSaveConfig,
  onTestConnection,
  onSimulateWebhook,
}) => {
  const [config, setConfig] = useState<EvolutionConfig>(evolutionConfig);

  // Keep local config in sync with parent evolutionConfig
  useEffect(() => {
    setConfig(evolutionConfig);
  }, [evolutionConfig]);
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
  const handleApplyDraLucyInstance = () => {
    const updated = {
      ...config,
      serverUrl: 'https://api.makprojetosmake.com.br',
      apiKey: 'b2efa885a71ee22edf72b597df1a0ce9',
      instanceName: 'dra-lucy-murata',
    };
    setConfig(updated);
    onSaveConfig(updated);
  };

  // Instant QR Code & Multiple Instance Management State
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrPairingCode, setQrPairingCode] = useState<string | null>(null);
  const [qrStatusText, setQrStatusText] = useState<string>('Carregando QR Code...');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [selectedInstanceTab, setSelectedInstanceTab] = useState<'dra-lucy-murata' | 'agente-ia' | 'demo-ao-vivo' | 'custom'>('dra-lucy-murata');
  const [newInstanceName, setNewInstanceName] = useState('');
  const [customInstanceInput, setCustomInstanceInput] = useState('');
  const [isCreatingInstance, setIsCreatingInstance] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [availableInstances, setAvailableInstances] = useState<Array<{ name: string; connectionStatus: string }>>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(false);

  // Fetch real instances from VPS
  const fetchInstancesFromVps = async () => {
    setIsLoadingInstances(true);
    try {
      const res = await fetch('/api/evolution/instances');
      const data = await res.json();
      if (data.success && Array.isArray(data.instances)) {
        setAvailableInstances(data.instances);
      }
    } catch (err) {
      console.warn('Erro ao listar instâncias:', err);
    } finally {
      setIsLoadingInstances(false);
    }
  };

  useEffect(() => {
    fetchInstancesFromVps();
  }, []);

  // Function to load live QR Code from backend
  const loadQrCode = async (instanceToLoad?: string) => {
    const targetInst = (instanceToLoad || config.instanceName || 'dra-lucy-murata').trim();
    setIsQrLoading(true);
    setQrStatusText('Consultando instância na VPS Evolution...');
    try {
      const res = await fetch(`/api/evolution/qrcode?instance=${encodeURIComponent(targetInst)}`);
      const data = await res.json();
      if (data.success) {
        if (data.qrcode) {
          setQrCodeData(data.qrcode);
          setQrPairingCode(data.pairingCode || null);
          setQrStatusText('Aguardando leitura do QR Code pelo WhatsApp...');
        } else if (data.state === 'open' || data.state === 'connected') {
          setQrCodeData(null);
          setQrStatusText('✅ WhatsApp já está conectado nesta instância!');
        } else if (data.state === 'connecting') {
          setQrCodeData(null);
          setQrStatusText('🔄 Conectando ao WhatsApp... Aguarde alguns instantes.');
        } else {
          // Status like 'close' or 'disconnected'
          setQrCodeData(null);
          setQrStatusText(`Instância ativa (${data.state || 'close'}). Clique em "Atualizar QR Code" para gerar nova chave de pareamento.`);
        }
      } else {
        if (data.state === 'close' || data.state === 'connecting') {
          setQrCodeData(null);
          setQrStatusText('Instância ativa na VPS. Clique no botão abaixo para gerar o QR Code.');
        } else {
          setQrStatusText(data.error || 'Aguardando inicialização da sessão.');
        }
      }
    } catch (err: any) {
      setQrStatusText('Aguardando inicialização: ' + err.message);
    } finally {
      setIsQrLoading(false);
    }
  };

  // Poll QR Code state while modal is open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQrModal) {
      loadQrCode(config.instanceName);
      interval = setInterval(() => {
        loadQrCode(config.instanceName);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQrModal, config.instanceName]);

  // Handle Switch Instance Tab
  const handleSelectInstanceTab = (inst: 'dra-lucy-murata' | 'agente-ia' | 'demo-ao-vivo' | 'custom', customName?: string) => {
    setSelectedInstanceTab(inst);
    let targetName = 'dra-lucy-murata';
    if (inst === 'agente-ia') targetName = 'agente-ia';
    if (inst === 'demo-ao-vivo') targetName = 'demo-ao-vivo';
    if (inst === 'custom') targetName = (customName || newInstanceName || config.instanceName).trim();

    const updated = {
      ...config,
      serverUrl: 'https://api.makprojetosmake.com.br',
      apiKey: config.apiKey && config.apiKey.length > 20 ? config.apiKey : 'b2efa885a71ee22edf72b597df1a0ce9',
      instanceName: targetName,
    };
    setConfig(updated);
    onSaveConfig(updated);
  };

  // Handle Create Instance
  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstanceName.trim()) return;
    setIsCreatingInstance(true);
    setCreateFeedback(null);
    try {
      const clean = newInstanceName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const currentWebhookUrl = `${window.location.origin}/api/webhook`;
      const res = await fetch('/api/evolution/create-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: clean, webhookUrl: currentWebhookUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCreateFeedback(`Instância "${clean}" criada com sucesso!`);
        handleSelectInstanceTab('custom', clean);
        setTimeout(() => setShowQrModal(true), 600);
      } else {
        setCreateFeedback(`Erro: ${data.error || 'Falha ao criar instância'}`);
      }
    } catch (err: any) {
      setCreateFeedback('Erro ao criar: ' + err.message);
    } finally {
      setIsCreatingInstance(false);
    }
  };

  // Handle Logout / Disconnect
  const handleLogoutInstance = async () => {
    if (!confirm(`Deseja desconectar o WhatsApp da instância "${config.instanceName}"?`)) return;
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/evolution/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: config.instanceName }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Instância desconectada com sucesso! O QR Code poderá ser lido novamente.');
        loadQrCode(config.instanceName);
      } else {
        alert('Erro ao desconectar: ' + (data.error || 'Erro desconhecido'));
      }
    } catch (err: any) {
      alert('Erro ao desconectar: ' + err.message);
    } finally {
      setIsLoggingOut(false);
    }
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
  const [simMediaType, setSimMediaType] = useState<'text' | 'audio' | 'document' | 'image'>('text');
  const [simFileName, setSimFileName] = useState('comprovante_pix_2900.pdf');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSuccess, setSimSuccess] = useState(false);

  const handleApplyPreset = (type: 'text' | 'audio' | 'document' | 'image') => {
    setSimMediaType(type);
    if (type === 'text') {
      setSimPhone('5511999998888');
      setSimPushName('Juliana Costa (Lead Teste)');
      setSimMessage('Olá! Gostaria de saber os valores do plano Enterprise para 8 atendentes.');
    } else if (type === 'audio') {
      setSimPhone('5511988887777');
      setSimPushName('Carlos Eduardo (Áudio WhatsApp)');
      setSimMessage('Oi Sofia! Gostei muito da apresentação do CRM e queria saber se vocês oferecem treinamento pra equipe e qual o prazo de implementação?');
    } else if (type === 'document') {
      setSimPhone('5511977776666');
      setSimPushName('Roberto Almeida (Comprovante PIX)');
      setSimMessage('Acabei de fazer o PIX de R$ 2.900,00 referente à adesão do plano anual. Segue o comprovante em PDF para liberação!');
      setSimFileName('comprovante_pix_2900.pdf');
    } else if (type === 'image') {
      setSimPhone('5511966665555');
      setSimPushName('Fernanda Lima (Foto Proposta)');
      setSimMessage('Sofia, tirei uma foto da tabela com a quantidade de usuários que precisamos na nossa filial. Dá uma olhada e me passa o orçamento fechado.');
    }
  };

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
          message: 'Webhook gravado com sucesso na VPS Evolution! A instância agora enviará todas as mensagens diretamente ao NEXA CRM.',
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
      await onSimulateWebhook(
        simPhone.trim(),
        simMessage.trim(),
        simPushName.trim(),
        simMediaType,
        simMediaType === 'document' ? simFileName.trim() : undefined
      );
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
              Conecte seu WhatsApp comercial ou instâncias de teste ao vivo para demonstrações com clientes.
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
              {evolutionConfig.isConnected ? 'WhatsApp Conectado' : 'Aguardando Leitura do QR'}
            </span>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              id="btn-open-qrcode-modal"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Conectar / Ver QR Code</span>
            </button>
          </div>
        </div>

        {/* 0. SELETOR RÁPIDO DE INSTÂNCIAS (ESTILO AMBULATÓRIO IA) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Instância Ativa para Atendimento & Demonstração
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Alterne entre seu número oficial e instâncias de demonstração ao vivo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Tab 1: Instância Dra. Lucy Murata */}
            <div
              onClick={() => handleSelectInstanceTab('dra-lucy-murata')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                config.instanceName === 'dra-lucy-murata'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Dra. Lucy Murata</span>
                {config.instanceName === 'dra-lucy-murata' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Instância: <strong className="text-indigo-700">dra-lucy-murata</strong>
              </p>
              <span className="inline-block text-[10px] text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded mt-2">
                Odontologia Integrativa (Ativa)
              </span>
            </div>

            {/* Tab 2: Instância Marco Duarte (Oficial) */}
            <div
              onClick={() => handleSelectInstanceTab('agente-ia')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                config.instanceName === 'agente-ia'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Marco Duarte (Oficial)</span>
                {config.instanceName === 'agente-ia' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Instância: <strong className="text-slate-700">agente-ia</strong>
              </p>
              <span className="inline-block text-[10px] text-indigo-700 font-semibold bg-indigo-100/70 px-2 py-0.5 rounded mt-2">
                Número Comercial
              </span>
            </div>

            {/* Tab 3: Outro Cliente / Personalizada */}
            <div
              onClick={() => {
                const target = customInstanceInput.trim() || (config.instanceName !== 'dra-lucy-murata' && config.instanceName !== 'agente-ia' ? config.instanceName : 'demo-ao-vivo');
                handleSelectInstanceTab('custom', target);
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                config.instanceName !== 'dra-lucy-murata' && config.instanceName !== 'agente-ia'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Outra Instância / Demo</span>
                {config.instanceName !== 'dra-lucy-murata' && config.instanceName !== 'agente-ia' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-mono">
                Instância: <strong className="text-indigo-700">{config.instanceName !== 'dra-lucy-murata' && config.instanceName !== 'agente-ia' ? config.instanceName : 'demo-ao-vivo'}</strong>
              </p>
              <span className="inline-block text-[10px] text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded mt-2">
                {config.instanceName !== 'dra-lucy-murata' && config.instanceName !== 'agente-ia' ? 'Instância Ativa' : 'Clique para alternar'}
              </span>
            </div>
          </div>

          {/* Lista de instâncias reais encontradas na VPS ou campo rápido de ativação */}
          {availableInstances.length > 0 && (
            <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-slate-500" />
                Instâncias encontradas na sua VPS:
              </span>
              {availableInstances.map((inst) => (
                <button
                  key={inst.name}
                  type="button"
                  onClick={() => handleSelectInstanceTab('custom', inst.name)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    config.instanceName === inst.name
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      inst.connectionStatus === 'open' || inst.connectionStatus === 'connected'
                        ? 'bg-emerald-400'
                        : 'bg-slate-400'
                    }`}
                  ></span>
                  <span>{inst.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={fetchInstancesFromVps}
                disabled={isLoadingInstances}
                className="text-[10px] text-indigo-700 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                title="Recarregar instâncias da VPS"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingInstances ? 'animate-spin' : ''}`} />
                <span>Atualizar lista</span>
              </button>
            </div>
          )}

          {/* Form to dynamically create or switch to a new instance */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              placeholder="Nome da instância (ex: dra-lucia-murata)"
              value={newInstanceName}
              onChange={(e) => {
                setNewInstanceName(e.target.value);
                setCustomInstanceInput(e.target.value);
              }}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400 w-full sm:w-auto"
            />
            <button
              type="button"
              onClick={handleCreateInstance}
              disabled={isCreatingInstance || !newInstanceName.trim()}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all shrink-0 w-full sm:w-auto justify-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingInstance ? 'Criando na VPS...' : 'Criar Instância & Gerar QR'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                loadQrCode(config.instanceName);
                setShowQrModal(true);
              }}
              className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all shrink-0 w-full sm:w-auto justify-center"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Ver QR da Selecionada</span>
            </button>

            <button
              type="button"
              onClick={handleLogoutInstance}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all shrink-0 w-full sm:w-auto justify-center"
              title="Desconectar o aparelho desta instância para ler outro celular"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Desconectando...' : 'Desconectar'}</span>
            </button>
          </div>

          {createFeedback && (
            <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
              {createFeedback}
            </p>
          )}
        </div>

        {/* 1. WEBHOOK BLINDADO (<50ms) COPY BOX & AUTO-GRAVAÇÃO NA VPS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-900">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                URL do Webhook do Nexa CRM (Substituto Direto do n8n)
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
            O Nexa CRM substitui totalmente o n8n: ele recebe o webhook da Evolution API diretamente, cadastra o lead, aciona a IA Sofia e dispara a resposta de volta ao WhatsApp. Para que a Evolution API saiba onde enviar as mensagens, esta URL precisa estar configurada na sua instância.
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
                onClick={handleApplyDraLucyInstance}
                id="btn-apply-dra-lucy-instance"
                className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                title="Preencher com os dados da instância dra-lucy-murata"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                <span>Usar Dados Dra. Lucy Murata</span>
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
              <span>Configurações da Evolution API salvas e ativadas com sucesso no NEXA CRM.</span>
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

          {/* Cenários de Teste Rápidos (1-clique) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              🧪 Escolha o Tipo de Mídia para Simular:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('text')}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  simMediaType === 'text'
                    ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>💬</span>
                  <span>Texto Puro</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  Pergunta comum
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 mt-1">
                  Sofia responde em TEXTO
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('audio')}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  simMediaType === 'audio'
                    ? 'bg-purple-50/90 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>🎙️</span>
                  <span>Áudio de Voz</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  Mensagem de voz
                </span>
                <span className="text-[10px] font-semibold text-purple-700 mt-1">
                  Sofia responde em ÁUDIO
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('document')}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  simMediaType === 'document'
                    ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>📄</span>
                  <span>Documento / PDF</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  Comprovante PIX
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 mt-1">
                  IA analisa PDF
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('image')}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  simMediaType === 'image'
                    ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <span>📷</span>
                  <span>Foto / Imagem</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  Foto de orçamento
                </span>
                <span className="text-[10px] font-semibold text-amber-700 mt-1">
                  IA analisa foto
                </span>
              </button>
            </div>
          </div>

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

            {simMediaType === 'document' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Arquivo PDF / Documento
                </label>
                <input
                  type="text"
                  value={simFileName}
                  onChange={(e) => setSimFileName(e.target.value)}
                  placeholder="comprovante_pix_2900.pdf"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>
            )}

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
            Veja exatamente o que a sua Evolution API está enviando para o NEXA CRM. Quando você mandar uma mensagem do WhatsApp, uma nova linha aparecerá aqui instantaneamente!
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

      {/* MODAL DE CONEXÃO WHATSAPP / QR CODE (ESTILO AMBULATÓRIO IA) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Conexão WhatsApp Comercial</h3>
                  <p className="text-xs text-indigo-200">
                    Pareamento fácil via QR Code do seu celular
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-center">
              {/* Status card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Status da Instância ({config.instanceName})
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    {qrStatusText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => loadQrCode(config.instanceName)}
                  disabled={isQrLoading}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                  title="Atualizar QR Code"
                >
                  <RefreshCw className={`w-4 h-4 ${isQrLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center min-h-[260px] p-4 bg-white border-2 border-dashed border-indigo-200 rounded-2xl">
                {isQrLoading && !qrCodeData ? (
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-xs text-slate-500 font-medium">
                      Buscando QR Code na VPS Evolution...
                    </span>
                  </div>
                ) : qrCodeData ? (
                  <div className="space-y-3">
                    <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200 inline-block">
                      <img
                        src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                        alt="QR Code WhatsApp"
                        className="w-56 h-56 object-contain mx-auto"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Aguardando leitura pelo aplicativo do seu celular...
                    </p>
                  </div>
                ) : (qrStatusText.includes('conectado') || qrStatusText.includes('Conectado') || config.isConnected) ? (
                  <div className="flex flex-col items-center gap-2 py-6">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    <p className="text-sm font-bold text-slate-900">
                      WhatsApp Conectado com Sucesso!
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs">
                      A instância <strong>{config.instanceName}</strong> está ativa e recebendo mensagens.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 text-center max-w-xs">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full">
                      <Radio className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      Instância Ativa na VPS Evolution
                    </p>
                    <p className="text-xs text-slate-600">
                      {qrStatusText}
                    </p>
                    <button
                      type="button"
                      onClick={() => loadQrCode(config.instanceName)}
                      disabled={isQrLoading}
                      className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isQrLoading ? 'animate-spin' : ''}`} />
                      <span>Gerar / Atualizar QR Code</span>
                    </button>
                  </div>
                )}

                {/* Pairing Code Alternative */}
                {qrPairingCode && (
                  <div className="mt-3 p-2 bg-slate-100 rounded-lg text-center font-mono">
                    <span className="text-[10px] text-slate-500 block uppercase">
                      Ou digite este Código de Pareamento:
                    </span>
                    <strong className="text-sm text-slate-900 tracking-wider">
                      {qrPairingCode}
                    </strong>
                  </div>
                )}
              </div>

              {/* Passo a Passo para Conectar */}
              <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-200 space-y-2 text-xs">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                  Passo a Passo para Conectar:
                </p>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Abra o <strong>WhatsApp</strong> no celular comercial.</li>
                  <li>Toque em <strong>Configurações</strong> (iPhone) ou <strong>Mais opções ⋮</strong> (Android).</li>
                  <li>Selecione <strong>Dispositivos Conectados</strong>.</li>
                  <li>Toque em <strong>Conectar um dispositivo</strong> e aponte a câmera para o QR Code acima.</li>
                </ol>
              </div>

              {/* Botões do Modal */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => loadQrCode(config.instanceName)}
                  disabled={isQrLoading}
                  className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Atualizar QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="pt-1">
                <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Conexão direta encriptada ponta a ponta via Evolution API oficial.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
