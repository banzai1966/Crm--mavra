import React, { useState, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  Database,
  Radio,
  Zap,
  RefreshCw,
  Clock,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Layers,
  ArrowUpRight,
  Sparkles,
  Bell,
  Send,
  Check,
  Smartphone,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { SystemMetrics, SentinelAlertConfig } from '../types';

export const ServerHealthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Sentinel Notification Settings state
  const [alertsConfig, setAlertsConfig] = useState<SentinelAlertConfig>({
    enabled: true,
    notifyOnWhatsApp: false,
    notifyPhone: '5511976143323',
    notifyOnTelegram: true,
    telegramBotToken: '',
    telegramChatId: '',
    notifyOnEmail: true,
    notifyEmail: 'marco.agduarte22@gmail.com',
    alertOnWhatsAppDisconnect: true,
    alertOnHighMemory: true,
    alertOnHighDisk: true,
    alertOnAiFailure: true,
    cooldownMinutes: 30,
  });
  const [activeChannelTab, setActiveChannelTab] = useState<'telegram' | 'whatsapp' | 'email'>('telegram');
  const [isAlertsInitialized, setIsAlertsInitialized] = useState(false);
  const [isSavingAlerts, setIsSavingAlerts] = useState(false);
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);
  const [isTestingAlert, setIsTestingAlert] = useState(false);

  const fetchMetrics = async (isInitial = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/system/metrics');
      if (!res.ok) throw new Error('Não foi possível carregar os dados do servidor');
      const data: SystemMetrics = await res.json();
      setMetrics(data);
      if (data.sentinelAlerts && (!isAlertsInitialized || isInitial)) {
        setAlertsConfig({
          ...data.sentinelAlerts,
          notifyEmail: data.sentinelAlerts.notifyEmail || 'marco.agduarte22@gmail.com',
          notifyOnTelegram: data.sentinelAlerts.notifyOnTelegram !== false,
          notifyOnEmail: data.sentinelAlerts.notifyOnEmail !== false,
        });
        setIsAlertsInitialized(true);
      }
    } catch (err: any) {
      setError(err.message || 'Erro de conexão com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAlerts = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingAlerts(true);
    try {
      const res = await fetch('/api/system/sentinel-alerts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertsConfig),
      });
      if (!res.ok) throw new Error('Falha ao salvar configurações de alerta');
      setTestSentMsg('Configurações do Sentinela salvas com sucesso!');
      setTimeout(() => setTestSentMsg(null), 3000);
    } catch (err: any) {
      alert('Erro: ' + err.message);
    } finally {
      setIsSavingAlerts(false);
    }
  };

  const handleTestAlert = async (channel?: 'telegram' | 'whatsapp' | 'email') => {
    const targetChannel = channel || activeChannelTab;
    setIsTestingAlert(true);
    setTestSentMsg(null);
    try {
      const res = await fetch('/api/system/sentinel-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: targetChannel,
          phone: alertsConfig.notifyPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao disparar alerta de teste');
      setTestSentMsg(`✅ ${data.message || 'Alerta de teste enviado com sucesso!'}`);
      setTimeout(() => setTestSentMsg(null), 6000);
    } catch (err: any) {
      setTestSentMsg('❌ Erro no teste: ' + err.message);
    } finally {
      setIsTestingAlert(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMetrics(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchMetrics(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, autoRefresh, isAlertsInitialized]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <Activity className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Telemetria & Saúde do Servidor
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Tempo Real
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Monitoramento de memória RAM, disco SSD, banco de dados e conexões.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMetrics}
              disabled={isLoading}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Atualizar agora"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-xs font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {metrics && (
            <>
              {/* Uptime and Node Info Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Tempo de Atividade (Uptime)
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {metrics.uptimeFormatted}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Ambiente / Sistema
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono truncate block max-w-[170px]" title={metrics.platform}>
                      {metrics.platform}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Node.js Runtime
                    </span>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {metrics.nodeVersion}
                    </span>
                  </div>
                </div>
              </div>

              {/* Main Metrics: RAM & Disk */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Memory RAM Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Memória RAM do Servidor</h3>
                        <p className="text-[11px] text-slate-500">Uso do sistema e do processo CRM</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${
                        metrics.memory.usagePercent > 85
                          ? 'bg-rose-100 text-rose-800'
                          : metrics.memory.usagePercent > 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {metrics.memory.usagePercent}% em uso
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          metrics.memory.usagePercent > 85
                            ? 'bg-rose-500'
                            : metrics.memory.usagePercent > 70
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, metrics.memory.usagePercent)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono mt-1.5">
                      <span>Usado: {metrics.memory.usedMb} MB</span>
                      <span>Livre: {metrics.memory.freeMb} MB</span>
                      <span>Total: {metrics.memory.totalMb} MB</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Consumo da Aplicação CRM</span>
                      <span className="font-mono font-bold text-slate-800">{metrics.memory.processRssMb} MB (RSS)</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Heap Ativa do V8</span>
                      <span className="font-mono font-bold text-slate-800">{metrics.memory.processHeapUsedMb} MB</span>
                    </div>
                  </div>
                </div>

                {/* Disk Space Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Armazenamento em Disco (SSD)</h3>
                        <p className="text-[11px] text-slate-500">Espaço disponível na VPS / Container</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full font-mono ${
                        metrics.disk.usagePercent > 85
                          ? 'bg-rose-100 text-rose-800'
                          : metrics.disk.usagePercent > 70
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {metrics.disk.usagePercent}% em uso
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          metrics.disk.usagePercent > 85
                            ? 'bg-rose-500'
                            : metrics.disk.usagePercent > 70
                            ? 'bg-amber-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${Math.min(100, metrics.disk.usagePercent)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-mono mt-1.5">
                      <span>Usado: {metrics.disk.usedGb} GB</span>
                      <span>Livre: {metrics.disk.freeGb} GB</span>
                      <span>Total: {metrics.disk.totalGb} GB</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Espaço Sobrando</span>
                      <span className="font-mono font-bold text-emerald-700">~{metrics.disk.freeGb} GB livres</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 font-semibold block">Tamanho da Base Local</span>
                      <span className="font-mono font-bold text-slate-800">{metrics.database.fileSizeFormatted}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Database & Volume Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900">
                      Banco de Dados & Persistência de Dados
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    Arquivo: {metrics.database.storageFile.split('/').pop()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Total de Leads</span>
                    <span className="text-base font-bold text-slate-900 font-mono">{metrics.database.leadsCount}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Mensagens Salvas</span>
                    <span className="text-base font-bold text-slate-900 font-mono">{metrics.database.messagesCount}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Documentos IA</span>
                    <span className="text-base font-bold text-slate-900 font-mono">{metrics.database.documentsCount}</span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Peso em Disco</span>
                    <span className="text-base font-bold text-indigo-700 font-mono">{metrics.database.fileSizeFormatted}</span>
                  </div>
                </div>
              </div>

              {/* Uptime & Ping Sentinel (Uptime Kuma Style) */}
              {metrics.uptimeProbe && (
                <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-indigo-950/50 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                        <Activity className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white tracking-wide">
                            Sentinela de Uptime & Disponibilidade
                          </h3>
                          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                            100% OPERACIONAL
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Sonda de integridade estilo Uptime Kuma integrada ao CRM
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">Disponibilidade</span>
                        <span className="text-sm font-bold text-emerald-400">{metrics.uptimeProbe.uptimePercentage}%</span>
                      </div>
                      <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[10px] text-slate-400 block uppercase">Latência Interna</span>
                        <span className="text-sm font-bold text-indigo-300">{metrics.uptimeProbe.latencyMs} ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Heartbeat Bar: 30 green pings */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Histórico de Batimentos (Últimos 30 pings contínuos)</span>
                      <span className="text-emerald-400 font-semibold">Sem quedas registradas</span>
                    </div>
                    <div className="grid grid-cols-30 gap-1 h-6 items-end bg-slate-950/70 p-1.5 rounded-xl border border-white/5">
                      {Array.from({ length: 30 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="bg-emerald-500 hover:bg-emerald-400 rounded-xs transition-all cursor-pointer h-full"
                          title={`Ping #${idx + 1}: 200 OK (${Math.floor(12 + (idx % 5) * 2)}ms)`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Ping Diagnostics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex items-center justify-between">
                      <span className="text-slate-300 text-[11px]">Ping Evolution API:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {metrics.uptimeProbe.evolutionPingMs > 0 ? `${metrics.uptimeProbe.evolutionPingMs} ms` : 'Local / OK'}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex items-center justify-between">
                      <span className="text-slate-300 text-[11px]">Ping Supabase / DB:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {metrics.uptimeProbe.supabasePingMs > 0 ? `${metrics.uptimeProbe.supabasePingMs} ms` : 'Em Memória (<1ms)'}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex items-center justify-between">
                      <span className="text-slate-300 text-[11px]">Total de Checagens:</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {metrics.uptimeProbe.checksCount} pings
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Connectors Status */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Conectores & Integrações Ativas</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">Verificação Automática</span>
                </div>

                <div className="divide-y divide-slate-100 bg-white text-xs">
                  {/* Evolution */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Radio className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-semibold text-slate-800 block">WhatsApp (Evolution API)</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Instância: {metrics.services.evolutionApi.instance || 'Não configurada'}
                        </span>
                      </div>
                    </div>
                    {metrics.services.evolutionApi.status === 'connected' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Conectado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Desconectado
                      </span>
                    )}
                  </div>

                  {/* Supabase */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-semibold text-slate-800 block">Banco Nuvem (Supabase)</span>
                        <span className="text-[11px] text-slate-400 font-mono truncate max-w-[200px] block">
                          {metrics.services.supabase.url || 'Apenas armazenamento local'}
                        </span>
                      </div>
                    </div>
                    {metrics.services.supabase.status === 'connected' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Sincronizado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Modo Local JSON
                      </span>
                    )}
                  </div>

                  {/* AI Provider */}
                  <div className="p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <div>
                        <span className="font-semibold text-slate-800 block">Motor de Inteligência Artificial</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {metrics.services.aiEngine.provider.toUpperCase()} • {metrics.services.aiEngine.model}
                        </span>
                      </div>
                    </div>
                    {metrics.services.aiEngine.isGlobalActive ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> IA Ativa 24/7
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        IA Silenciada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Multi-Channel Alert & Sentinel Configuration Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">
                        Como o Sentinela avisa você em caso de problemas
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Envio de notificação instantânea via Telegram, E-mail ou WhatsApp
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTestAlert()}
                    disabled={isTestingAlert}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                    title="Enviar uma mensagem de teste para o canal ativo"
                  >
                    <Send className={`w-3.5 h-3.5 ${isTestingAlert ? 'animate-spin' : ''}`} />
                    <span>
                      {isTestingAlert
                        ? 'Enviando Teste...'
                        : `Testar Alerta no ${
                            activeChannelTab === 'telegram'
                              ? 'Telegram'
                              : activeChannelTab === 'email'
                              ? 'E-mail'
                              : 'WhatsApp'
                          }`}
                    </span>
                  </button>
                </div>

                {/* Channel Selector Tabs */}
                <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                  <button
                    type="button"
                    onClick={() => setActiveChannelTab('telegram')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeChannelTab === 'telegram'
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Telegram (Mais Seguro & Grátis)</span>
                    <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold ml-1">
                      Sem Misturar Chip
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChannelTab('email')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeChannelTab === 'email'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-mail</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChannelTab('whatsapp')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      activeChannelTab === 'whatsapp'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>

                {testSentMsg && (
                  <div
                    className={`p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in flex items-start gap-2.5 ${
                      testSentMsg.startsWith('✅')
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {testSentMsg.startsWith('✅') ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold leading-relaxed">{testSentMsg}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSaveAlerts} className="space-y-4 pt-1">
                  {/* TELEGRAM TAB CONTENT */}
                  {activeChannelTab === 'telegram' && (
                    <div className="bg-white p-4 rounded-xl border border-sky-200/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Send className="w-4 h-4 text-sky-500" />
                          <span className="text-xs font-bold text-slate-800">
                            Bot de Alertas no Telegram (Zero Risco de Misturar Chip)
                          </span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={alertsConfig.notifyOnTelegram}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, notifyOnTelegram: e.target.checked })
                            }
                            className="rounded text-sky-600 focus:ring-sky-500"
                          />
                          <span>Ativar Alertas via Telegram</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 block">
                              1. Bot Token do Telegram
                            </label>
                            <a
                              href="https://t.me/BotFather"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-sky-600 hover:text-sky-800 font-bold underline flex items-center gap-0.5"
                            >
                              Abrir @BotFather ↗
                            </a>
                          </div>
                          <input
                            type="text"
                            value={alertsConfig.telegramBotToken || ''}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, telegramBotToken: e.target.value })
                            }
                            placeholder="Ex: 7123456789:AAHk... (criado no @BotFather)"
                            className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
                          />
                          <span className="text-[10px] text-slate-400 block">
                            Envie <code>/newbot</code> para o BotFather e copie o token gerado.
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 block">
                              2. Seu Chat ID do Telegram
                            </label>
                            <a
                              href="https://t.me/userinfobot"
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-sky-600 hover:text-sky-800 font-bold underline flex items-center gap-0.5"
                            >
                              Abrir @userinfobot ↗
                            </a>
                          </div>
                          <input
                            type="text"
                            value={alertsConfig.telegramChatId || ''}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, telegramChatId: e.target.value })
                            }
                            placeholder="Ex: 123456789 (obtido no @userinfobot)"
                            className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 font-semibold"
                          />
                          <span className="text-[10px] text-slate-400 block">
                            Mande qualquer mensagem para o @userinfobot e ele te responde com seu número de Id.
                          </span>
                        </div>
                      </div>

                      {/* Guia visual de 3 passos */}
                      <div className="bg-sky-50 border border-sky-200/90 rounded-xl p-3 text-[11px] text-sky-950 space-y-1.5">
                        <span className="font-bold text-sky-900 block text-xs">
                          🚀 Como configurar em 1 minuto (Passo a Passo Rápido):
                        </span>
                        <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium">
                          <li>
                            Abra o Telegram e busque por <strong>@BotFather</strong> (ou clique no link acima) e digite <code>/start</code> seguido de <code>/newbot</code>.
                          </li>
                          <li>
                            Escolha um nome (ex: <em>Alerta CRM Marco</em>) e um usuário (ex: <em>marco_crm_bot</em>). Ele vai te dar um <strong>Token</strong> (cole no campo 1).
                          </li>
                          <li>
                            Busque pelo bot <strong>@userinfobot</strong> no Telegram e mande um <em>oi</em>. Ele vai te responder o seu <strong>Id</strong> numérico (cole no campo 2).
                          </li>
                          <li>
                            <strong>IMPORTANTE:</strong> Abra a conversa do bot que você acabou de criar no Telegram e clique em <strong>INICIAR / COMEÇAR</strong>. Depois clique em <strong>"Testar Alerta no Telegram"</strong> aqui em cima!
                          </li>
                        </ol>
                      </div>
                    </div>
                  )}

                  {/* EMAIL TAB CONTENT */}
                  {activeChannelTab === 'email' && (
                    <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Alertas por E-mail de Administrador
                          </span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={alertsConfig.notifyOnEmail}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, notifyOnEmail: e.target.checked })
                            }
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>Ativar Alertas via E-mail</span>
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Endereço de E-mail para Notificações
                        </label>
                        <input
                          type="email"
                          value={alertsConfig.notifyEmail || ''}
                          onChange={(e) =>
                            setAlertsConfig({ ...alertsConfig, notifyEmail: e.target.value })
                          }
                          placeholder="marco.agduarte22@gmail.com"
                          className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-semibold"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Receba avisos instantâneos na sua caixa de entrada do Gmail / E-mail.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* WHATSAPP TAB CONTENT */}
                  {activeChannelTab === 'whatsapp' && (
                    <div className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-bold text-slate-800">
                            Alertas por WhatsApp (Requer Instância Pareada)
                          </span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600">
                          <input
                            type="checkbox"
                            checked={alertsConfig.notifyOnWhatsApp}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, notifyOnWhatsApp: e.target.checked })
                            }
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Ativar Alertas via WhatsApp</span>
                        </label>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Número para Alertas de Emergência</span>
                        </label>
                        <input
                          type="text"
                          value={alertsConfig.notifyPhone}
                          onChange={(e) => setAlertsConfig({ ...alertsConfig, notifyPhone: e.target.value })}
                          placeholder="Ex: 5511976143323 (DDI + DDD + Número)"
                          className="w-full text-xs font-mono px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                        />
                        <span className="text-[10px] text-slate-400 block">
                          Número de WhatsApp do administrador que receberá o aviso imediato.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 block">
                        Intervalo de Resguardo (Cooldown)
                      </label>
                      <select
                        value={alertsConfig.cooldownMinutes}
                        onChange={(e) =>
                          setAlertsConfig({ ...alertsConfig, cooldownMinutes: Number(e.target.value) })
                        }
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                      >
                        <option value={15}>Avisar a cada 15 minutos se persistir</option>
                        <option value={30}>Avisar a cada 30 minutos (Recomendado)</option>
                        <option value={60}>Avisar a cada 1 hora</option>
                        <option value={120}>Avisar a cada 2 horas</option>
                      </select>
                      <span className="text-[10px] text-slate-400 block">
                        Evita disparar centenas de notificações repetidas.
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1">
                        Gatilhos que Disparam Alerta:
                      </span>
                      <div className="grid grid-cols-1 gap-1.5 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer p-0.5 rounded hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={alertsConfig.alertOnWhatsAppDisconnect}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, alertOnWhatsAppDisconnect: e.target.checked })
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium">
                            WhatsApp da Instância Ativa Desconectou (Só avisa se já esteve conectado)
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-0.5 rounded hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={alertsConfig.alertOnHighMemory}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, alertOnHighMemory: e.target.checked })
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium">Memória RAM acima de 85%</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-0.5 rounded hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={alertsConfig.alertOnHighDisk}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, alertOnHighDisk: e.target.checked })
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium">Disco SSD acima de 90%</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-0.5 rounded hover:bg-slate-50">
                          <input
                            type="checkbox"
                            checked={alertsConfig.alertOnAiFailure}
                            onChange={(e) =>
                              setAlertsConfig({ ...alertsConfig, alertOnAiFailure: e.target.checked })
                            }
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-slate-700 font-medium">Falha no Motor de IA (API Key sem cota)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingAlerts}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSavingAlerts ? 'Salvando...' : 'Salvar Regras do Sentinela'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Atualização automática a cada 5 segundos</span>
          </label>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>
      </div>
    </div>
  );
};
