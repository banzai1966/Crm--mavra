import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Bot,
  Zap,
  CheckCircle2,
  PhoneCall,
  Activity,
  ArrowUpRight,
  QrCode,
  Radio,
  RefreshCw,
  Check,
  X,
  Smartphone,
  ShieldCheck,
  Power,
  Trash2,
  Sparkles,
  Server,
  Edit2,
  Plus,
  UserCheck,
  Eye,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Flame,
  Volume2,
  Sparkle,
  ArrowRight,
} from 'lucide-react';
import { Lead, KanbanStage, AgentConfig, EvolutionConfig, BusinessNiche } from '../types';
import { ResetDataModal } from './ResetDataModal';

export interface NichePreset {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  urgencyCardTitle: string;
  urgencyBadge: string;
  urgencyDescription: string;
  urgencyEmptyTitle: string;
  urgencyEmptyDesc: string;
  leadsCategoryLabel: string;
  triagesTitle: string;
  triagesSubLabel: string;
  actionButtonText: string;
}

export const NICHE_PRESETS: Record<string, NichePreset> = {
  dental: {
    id: 'dental',
    name: 'Odontologia / Clínicas',
    shortName: 'Dental',
    icon: '🦷',
    urgencyCardTitle: 'Urgências / Dor',
    urgencyBadge: 'Urgência Clínica',
    urgencyDescription: 'Pacientes que relataram dor ou urgência odontológica',
    urgencyEmptyTitle: 'Nenhuma urgência pendente no momento!',
    urgencyEmptyDesc: 'Todos os pacientes com dor foram atendidos.',
    leadsCategoryLabel: 'Pacientes em Atendimento',
    triagesTitle: 'Triagens & Agendas',
    triagesSubLabel: 'confirmados',
    actionButtonText: 'Ver no Kanban',
  },
  medical: {
    id: 'medical',
    name: 'Saúde / Clínicas Médicas',
    shortName: 'Saúde/Médico',
    icon: '🩺',
    urgencyCardTitle: 'Sintomas Agudos / Triagem',
    urgencyBadge: 'Triagem Prioritária',
    urgencyDescription: 'Pacientes que relataram sintomas agudos ou urgência clínica',
    urgencyEmptyTitle: 'Nenhuma prioridade médica pendente!',
    urgencyEmptyDesc: 'Todos os pacientes foram devidamente triados.',
    leadsCategoryLabel: 'Pacientes Ativos',
    triagesTitle: 'Consultas & Triagens',
    triagesSubLabel: 'confirmadas',
    actionButtonText: 'Ver no Kanban',
  },
  retail: {
    id: 'retail',
    name: 'Comércio / Varejo / Loja',
    shortName: 'Comércio/Varejo',
    icon: '🛍️',
    urgencyCardTitle: 'Leads Quentes / Prontos p/ Compra',
    urgencyBadge: 'Pronto p/ Comprar',
    urgencyDescription: 'Clientes pedindo Pix, estoque ou link de pagamento imediato',
    urgencyEmptyTitle: 'Nenhum lead quente represado!',
    urgencyEmptyDesc: 'Todas as intenções de compra imediata foram respondidas.',
    leadsCategoryLabel: 'Clientes / Compradores',
    triagesTitle: 'Pedidos & Cotações',
    triagesSubLabel: 'pedidos fechados',
    actionButtonText: 'Ver no Funil',
  },
  sales: {
    id: 'sales',
    name: 'Vendas Comerciais / B2B',
    shortName: 'Vendas B2B',
    icon: '💼',
    urgencyCardTitle: 'Oportunidades em Decisão',
    urgencyBadge: 'Decisão Imediata',
    urgencyDescription: 'Contatos com proposta ativa ou em negociação final',
    urgencyEmptyTitle: 'Nenhuma oportunidade em risco!',
    urgencyEmptyDesc: 'Todas as propostas quentes estão com follow-up em dia.',
    leadsCategoryLabel: 'Oportunidades Comerciais',
    triagesTitle: 'Reuniões & Demos',
    triagesSubLabel: 'reuniões marcadas',
    actionButtonText: 'Ver Oportunidades',
  },
  real_estate: {
    id: 'real_estate',
    name: 'Imobiliária / Corretores',
    shortName: 'Imobiliária',
    icon: '🏠',
    urgencyCardTitle: 'Visitas & Propostas Quentes',
    urgencyBadge: 'Alta Intenção',
    urgencyDescription: 'Clientes aguardando visita a imóvel ou envio de proposta',
    urgencyEmptyTitle: 'Nenhuma visita pendente de agendamento!',
    urgencyEmptyDesc: 'Todos os clientes interessados foram atendidos.',
    leadsCategoryLabel: 'Compradores / Inquilinos',
    triagesTitle: 'Visitas Agendadas',
    triagesSubLabel: 'visitas marcadas',
    actionButtonText: 'Ver Imóveis/Leads',
  },
  services: {
    id: 'services',
    name: 'Prestação de Serviços',
    shortName: 'Serviços',
    icon: '🔧',
    urgencyCardTitle: 'Chamados Urgentes / Orçamentos',
    urgencyBadge: 'Orçamento Urgente',
    urgencyDescription: 'Clientes solicitando orçamento emergencial ou atendimento imediato',
    urgencyEmptyTitle: 'Nenhum chamado emergencial pendente!',
    urgencyEmptyDesc: 'Todos os orçamentos urgentes foram processados.',
    leadsCategoryLabel: 'Ordens & Contatos',
    triagesTitle: 'Agendamentos de Serviço',
    triagesSubLabel: 'serviços agendados',
    actionButtonText: 'Ver Ordens de Serviço',
  },
  general: {
    id: 'general',
    name: 'Geral / Corporativo',
    shortName: 'Geral',
    icon: '⚡',
    urgencyCardTitle: 'Atenção Imediata / Alta Prioridade',
    urgencyBadge: 'Alta Prioridade',
    urgencyDescription: 'Contatos e oportunidades que necessitam de intervenção prioritária',
    urgencyEmptyTitle: 'Nenhuma pendência prioritária!',
    urgencyEmptyDesc: 'Todos os contatos de alta prioridade foram atendidos.',
    leadsCategoryLabel: 'Contatos Ativos',
    triagesTitle: 'Triagens & Reuniões',
    triagesSubLabel: 'confirmados',
    actionButtonText: 'Ver no Kanban',
  },
};

interface ExecutiveDashboardProps {
  leads: Lead[];
  stages: KanbanStage[];
  agentConfig: AgentConfig;
  evolutionConfig: EvolutionConfig;
  onOpenChat: (leadId: string) => void;
  onNavigateToTab: (tab: 'kanban' | 'chat' | 'agent' | 'evolution') => void;
  onUpdateEvolutionConfig?: (config: EvolutionConfig) => void;
  onUpdateAgentConfig?: (config: AgentConfig) => void;
  onClearAllLeads?: () => Promise<void> | void;
  onRestoreDemoLeads?: () => Promise<void> | void;
  isAdmin?: boolean;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  leads,
  stages,
  agentConfig,
  evolutionConfig,
  onOpenChat,
  onNavigateToTab,
  onUpdateEvolutionConfig,
  onUpdateAgentConfig,
  onClearAllLeads,
  onRestoreDemoLeads,
  isAdmin = false,
}) => {
  const currentNicheKey = agentConfig.followUpNiche || 'dental';
  const currentNiche: NichePreset = NICHE_PRESETS[currentNicheKey] || NICHE_PRESETS.general;

  const [showResetModal, setShowResetModal] = useState(false);

  const handleNicheChange = (newNiche: BusinessNiche) => {
    if (onUpdateAgentConfig) {
      onUpdateAgentConfig({ ...agentConfig, followUpNiche: newNiche });
    }
  };
  const totalLeads = leads.length;
  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const urgentLeads = leads.filter((l) => l.isUrgent);
  const triagedLeads = leads.filter((l) => Boolean(l.triage));
  const confirmedAppointments = leads.filter((l) => l.triage?.status === 'confirmed');
  const followedUpLeads = leads.filter((l) => (l.followUpCount || 0) > 0 || l.tags.includes('Follow-up Enviado'));
  const wonLeads = leads.filter((l) => l.stageId === 'stage-5' || l.stageId === 'stage-won');
  const wonValue = wonLeads.reduce((acc, l) => acc + (l.value || 0), 0);
  const conversionRate = totalLeads > 0 ? ((wonLeads.length / totalLeads) * 100).toFixed(1) : '0.0';

  // Base Antiga & Reativação metrics
  const baseAntigaLeads = leads.filter(
    (l) =>
      l.stageId === 'stage-base' ||
      l.stageId === 'stage-reativacao' ||
      l.tags.includes('Base Antiga') ||
      l.tags.includes('Reativação')
  );
  const reactivatedLeads = leads.filter(
    (l) =>
      (l.tags.includes('Base Antiga') ||
        l.tags.includes('Reativação') ||
        l.tags.includes('Reativado com Sucesso') ||
        l.notes?.toLowerCase().includes('reativação') ||
        l.notes?.toLowerCase().includes('reativado')) &&
      l.stageId !== 'stage-base' &&
      l.stageId !== 'stage-reativacao' &&
      l.stageId !== 'stage-6'
  );
  const reactivatedRevenue = reactivatedLeads.reduce((acc, l) => acc + (l.value || 0), 0);
  const reactivatedRate =
    baseAntigaLeads.length > 0
      ? ((reactivatedLeads.length / baseAntigaLeads.length) * 100).toFixed(1)
      : '0.0';

  // State for discreet Quick QR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrPairingCode, setQrPairingCode] = useState<string | null>(null);
  const [qrStatusText, setQrStatusText] = useState<string>('Gerando QR Code...');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [isConnectedLive, setIsConnectedLive] = useState<boolean>(evolutionConfig.isConnected);

  // Quick instance selector states on Dashboard
  const [customInstanceName, setCustomInstanceName] = useState(
    evolutionConfig.instanceName !== 'agente-ia' && evolutionConfig.instanceName !== 'demo-ao-vivo'
      ? evolutionConfig.instanceName
      : 'dra-lucy-murata'
  );
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [clientInputName, setClientInputName] = useState('dra-lucy-murata');
  const [clientDisplayName, setClientDisplayName] = useState('Dra. Lucy Murata');
  const [isCreatingOnVps, setIsCreatingOnVps] = useState(false);
  const [createFeedback, setCreateFeedback] = useState<string | null>(null);

  // Executive Guide & Onboarding state
  const [showExecutiveGuide, setShowExecutiveGuide] = useState(true);
  const [modalTab, setModalTab] = useState<'qr' | 'crm_flow' | 'benefits'>('qr');

  const handleSelectInstance = (targetInstance: string) => {
    if (onUpdateEvolutionConfig) {
      const updated: EvolutionConfig = {
        ...evolutionConfig,
        instanceName: targetInstance,
      };
      onUpdateEvolutionConfig(updated);
    }
  };

  const handleSaveAndCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInputName.trim()) return;
    const clean = clientInputName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    setIsCreatingOnVps(true);
    setCreateFeedback('Criando instância e registrando Webhook na VPS...');
    const currentWebhookUrl = `${window.location.origin}/api/webhook`;
    try {
      // Create instance on VPS via API with webhook auto-configured
      await fetch('/api/evolution/create-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceName: clean, webhookUrl: currentWebhookUrl }),
      });
      setCustomInstanceName(clean);
      handleSelectInstance(clean);
      setShowEditClientModal(false);
      setCreateFeedback(null);
      // Auto open QR code modal for this newly created instance
      setTimeout(() => setShowQrModal(true), 400);
    } catch (err: any) {
      // Even if already exists, select it
      setCustomInstanceName(clean);
      handleSelectInstance(clean);
      setShowEditClientModal(false);
      setCreateFeedback(null);
      setTimeout(() => setShowQrModal(true), 400);
    } finally {
      setIsCreatingOnVps(false);
    }
  };

  // Leads distribution per stage
  const stageStats = stages.map((st) => {
    const stageLeads = leads.filter((l) => l.stageId === st.id);
    const value = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);
    return {
      id: st.id,
      name: st.name,
      count: stageLeads.length,
      value,
      color: st.color || '#4f46e5',
    };
  });

  // Fetch QR code function for the dashboard modal
  const fetchDashboardQrCode = async () => {
    setIsQrLoading(true);
    setQrStatusText('Solicitando QR Code do WhatsApp...');
    try {
      const instance = evolutionConfig.instanceName || 'agente-ia';
      const res = await fetch(`/api/evolution/qrcode?instance=${encodeURIComponent(instance)}`);
      const data = await res.json();
      if (data.success) {
        if (data.qrcode) {
          setQrCodeData(data.qrcode);
          setQrPairingCode(data.pairingCode || null);
          setQrStatusText('Aponte a câmera do seu WhatsApp para conectar!');
          setIsConnectedLive(false);
        } else if (data.state === 'open' || data.state === 'connected') {
          setQrCodeData(null);
          setQrStatusText('✅ WhatsApp já está conectado e funcionando com sucesso!');
          setIsConnectedLive(true);
          if (onUpdateEvolutionConfig) {
            onUpdateEvolutionConfig({ ...evolutionConfig, isConnected: true, state: 'connected' });
          }
        } else {
          setQrCodeData(null);
          setQrStatusText(`Status da conexão: ${data.state || 'Aguardando'}`);
        }
      } else {
        setQrStatusText(data.error || 'Não foi possível gerar o QR Code no momento');
      }
    } catch (err: any) {
      setQrStatusText('Erro ao buscar QR Code: ' + err.message);
    } finally {
      setIsQrLoading(false);
    }
  };

  // Poll QR Code state when modal is open
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showQrModal) {
      fetchDashboardQrCode();
      interval = setInterval(fetchDashboardQrCode, 4500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showQrModal, evolutionConfig.instanceName]);

  const handleOpenQrModal = () => {
    setShowQrModal(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/70 p-4 md:p-6 space-y-6">
      {/* Top Header of Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Dashboard Executivo & Inteligência Comercial
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de conversão, triagens, fila prioritária e follow-ups em tempo real.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Niche Segment: Editable dropdown for Admin, polished fixed badge for Client */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 shadow-2xs transition-colors">
              <span className="text-slate-400 text-xs font-medium">Nicho:</span>
              <select
                value={currentNicheKey}
                onChange={(e) => handleNicheChange(e.target.value as BusinessNiche)}
                className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer pr-1"
                title="Mudar segmento de negócio para adaptar termos e métricas (Admin)"
              >
                {Object.values(NICHE_PRESETS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.icon} {p.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 shadow-2xs"
              title="Segmento operacional configurado para a empresa"
            >
              <span className="text-slate-400 text-xs font-medium">Segmento:</span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>{currentNiche.icon}</span>
                <span>{currentNiche.name}</span>
              </span>
            </div>
          )}

          {/* Guia Executivo: Como Funciona, Conectar & O Que Esperar */}
          <button
            id="btn-toggle-executive-guide"
            onClick={() => setShowExecutiveGuide(!showExecutiveGuide)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
              showExecutiveGuide
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-700 shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Guia Executivo: Como Funciona, Como Conectar e O que Esperar"
          >
            <Sparkle className={`w-3.5 h-3.5 ${showExecutiveGuide ? 'text-amber-300 animate-spin' : 'text-indigo-600'}`} />
            <span>{showExecutiveGuide ? 'Ocultar Guia' : '✨ Como Funciona o Atendimento IA'}</span>
            {showExecutiveGuide ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {/* Discreet WhatsApp Connection Button */}
          <button
            id="btn-dashboard-connect-whatsapp"
            onClick={handleOpenQrModal}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
              evolutionConfig.isConnected || isConnectedLive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 hover:shadow-xs'
            }`}
            title="Conectar ou verificar o WhatsApp do consultório/empresa"
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                evolutionConfig.isConnected || isConnectedLive ? 'text-emerald-600 animate-pulse' : 'text-indigo-200'
              }`}
            />
            <span>
              {evolutionConfig.isConnected || isConnectedLive
                ? 'WhatsApp Conectado'
                : '📲 Conectar WhatsApp (QR Code)'}
            </span>
          </button>

          {/* Clear / Reset CRM Data Button (Available for Admin) */}
          {isAdmin && (
            totalLeads > 0 ? (
              <button
                id="btn-dashboard-clear-data"
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Zerar dados de demonstração para iniciar produção limpa (Admin)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Limpar Base</span>
              </button>
            ) : (
              <button
                id="btn-dashboard-restore-demo"
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Restaurar dados de teste para demonstração (Admin)"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Restaurar Demo</span>
              </button>
            )
          )}

          <a
            href="/api/leads/export/csv"
            download
            className="flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Base (CSV)</span>
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pipeline Total */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline em Aberto</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPipelineValue)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>{totalLeads} {currentNiche.leadsCategoryLabel.toLowerCase()}</span>
            <span className="font-semibold text-emerald-600 font-mono">
              Ganho: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(wonValue)}
            </span>
          </div>
        </div>

        {/* Card 2: Urgências / Leads Quentes (Adaptive by Niche) */}
        <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-2xs space-y-2 bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5" title={currentNiche.urgencyDescription}>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              {currentNiche.urgencyCardTitle}
            </span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-900 font-mono">
            {urgentLeads.length}
          </div>
          <div className="text-xs text-rose-700 pt-1 border-t border-rose-100 flex items-center justify-between">
            <span className="truncate pr-1">{urgentLeads.length > 0 ? 'Exigem atendimento prioritário' : currentNiche.urgencyEmptyTitle}</span>
            <button
              onClick={() => onNavigateToTab('kanban')}
              className="font-bold underline text-[11px] cursor-pointer shrink-0"
            >
              {currentNiche.actionButtonText}
            </button>
          </div>
        </div>

        {/* Card 3: Triagens & Agendamentos (Adaptive) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{currentNiche.triagesTitle}</span>
            <div className="p-2 rounded-lg bg-violet-50 text-violet-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {triagedLeads.length}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>{confirmedAppointments.length} {currentNiche.triagesSubLabel}</span>
            <span className="font-semibold text-violet-700">
              {triagedLeads.length - confirmedAppointments.length} pendentes
            </span>
          </div>
        </div>

        {/* Card 4: Follow-up Automático */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Follow-Up Ativo</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-sky-900 font-mono">
            {followedUpLeads.length}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span>Nicho: <b className="capitalize text-slate-800">{currentNiche.shortName}</b></span>
            {isAdmin && (
              <button
                onClick={() => onNavigateToTab('agent')}
                className="font-semibold text-sky-700 underline text-[11px] cursor-pointer"
              >
                Configurar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reativação de Base de Pacientes Inativos KPI Highlight */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Campanha de Resgate
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Reativação de Base & Pacientes Inativos
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Pacientes antigos resgatados da planilha ou agenda do WhatsApp através da abordagem humanizada da Sofia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 shrink-0 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5">
          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Na Fila de Resgate</span>
            <span className="text-base font-extrabold text-indigo-300 font-mono">
              {baseAntigaLeads.length} pacientes
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Resgatados / Ativos</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              {reactivatedLeads.length} ({reactivatedRate}%)
            </span>
          </div>

          <div className="h-8 w-px bg-white/10" />

          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Receita Resgatada</span>
            <span className="text-base font-extrabold text-amber-300 font-mono">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reactivatedRevenue)}
            </span>
          </div>

          <button
            onClick={() => onNavigateToTab('kanban')}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <span>Ver Base</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {showExecutiveGuide && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-indigo-500/20 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Subtle glow / background flair */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header of the guide */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4 relative z-10">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SISTEMA OPERACIONAL ATIVO • WHATSAPP & GEMINI 3.8
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Experiência do Atendimento com IA: Como Funciona & O Que Esperar
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                Guia prático para a sua equipe: como conectar o WhatsApp da empresa em 30 segundos, acompanhar os pacientes no CRM em tempo real e os resultados comerciais que você pode esperar.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleOpenQrModal}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>{evolutionConfig.isConnected || isConnectedLive ? 'Ver Conexão WhatsApp' : 'Escanear QR Code'}</span>
              </button>
              <button
                onClick={() => setShowExecutiveGuide(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Minimizar guia"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Interactive Pillars / Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6 relative z-10">
            {/* Pilar 1: Como se Conecta */}
            <div className="bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 backdrop-blur-xs transition-all flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    30 Segundos
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Como se Conecta
                  </h3>
                  <p className="text-[11px] text-emerald-400/90 font-medium">Fácil como conectar no WhatsApp Web</p>
                </div>
                <div className="space-y-2 text-xs text-slate-300 leading-relaxed pt-1">
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/10 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Abra o <strong>WhatsApp</strong> no celular da clínica/empresa.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/10 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Toque nos 3 pontinhos (ou Ajustes) e vá em <strong>Aparelhos Conectados</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/10 text-white font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>Toque em <strong>Conectar um aparelho</strong> e aponte a câmera para o QR Code aqui na tela.</span>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-200 leading-relaxed">
                  🛡️ <strong>Zero aplicativo para instalar:</strong> Não precisa baixar nada no celular. A Sofia assume o atendimento direto na nuvem com total segurança e criptografia ponta a ponta.
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-white/10">
                <button
                  onClick={handleOpenQrModal}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{evolutionConfig.isConnected || isConnectedLive ? 'Ver Status da Conexão' : 'Abrir QR Code Agora'}</span>
                </button>
              </div>
            </div>

            {/* Pilar 2: Como Acompanha no CRM */}
            <div className="bg-white/5 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-5 backdrop-blur-xs transition-all flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Controle Total
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Como Acompanhar no CRM
                  </h3>
                  <p className="text-[11px] text-indigo-400/90 font-medium">Visibilidade em tempo real para toda a equipe</p>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed pt-1">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Kanban Automático:</strong> Cada cliente que manda mensagem vira um cartão no funil e avança de estágio sozinho conforme demonstra interesse.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Ficha de Triagem Pronta:</strong> A IA já anota procedimento, turno preferido (manhã/tarde), dia da semana e forma de pagamento.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span><strong>Intervenção Humana:</strong> Na Central de Chat, você clica em <em>"Assumir Atendimento"</em> e conversa manualmente se preferir.</span>
                  </div>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-[11px] text-indigo-200 leading-relaxed">
                  👥 <strong>Portal da Cliente:</strong> A doutora ou secretária usa o link exclusivo (<em>?modo=cliente</em>) para ver tudo sem perigo de alterar chaves ou configurações técnicas.
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-white/10 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigateToTab('kanban')}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>Ver Kanban</span>
                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                </button>
                <button
                  onClick={() => onNavigateToTab('chat')}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 px-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="w-3 h-3 text-indigo-400" />
                  <span>Chat ao Vivo</span>
                </button>
              </div>
            </div>

            {/* Pilar 3: O Que Esperar */}
            <div className="bg-white/5 border border-white/10 hover:border-amber-500/40 rounded-2xl p-5 backdrop-blur-xs transition-all flex flex-col justify-between group">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm">
                    3
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Efeito UAU
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    O Que Esperar
                  </h3>
                  <p className="text-[11px] text-amber-400/90 font-medium">Resultados práticos no dia a dia</p>
                </div>
                <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed pt-1">
                  <div className="flex items-start gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Atendimento 24/7 em &lt;10s:</strong> Ninguém fica sem resposta à noite, fins de semana ou feriados. A clínica nunca dorme.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Áudios com Voz Humana:</strong> Se o cliente mandar áudio, a Sofia ouve com atenção e responde com áudio caloroso e empático.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Anti-Vácuo Automático:</strong> Se o paciente parar de responder no meio da conversa, o sistema resgata após 4h com gentileza.</span>
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-[11px] text-amber-200 leading-relaxed">
                  📈 <strong>Mais Consultas Fechadas:</strong> Ao responder na hora e recuperar contatos frios, a taxa de agendamento chega a triplicar!
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-white/10">
                <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Sofia com Gemini 3.8
                  </span>
                  <span className="text-slate-400">Zero Erros / 100% Blindado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Distribution (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribuição por Estágio do Funil</h3>
              <p className="text-xs text-slate-500">Métricas de volume e valor monetário em cada etapa</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 block">Taxa de Conversão</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">{conversionRate}%</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {stageStats.map((st) => {
              const pct = totalLeads > 0 ? (st.count / totalLeads) * 100 : 0;
              return (
                <div key={st.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: st.color }}></span>
                      {st.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-600">{st.count} lead{st.count !== 1 ? 's' : ''} ({pct.toFixed(0)}%)</span>
                      <span className="font-mono font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(st.value)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: st.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Urgent Attention / Action Center (1 col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {currentNiche.urgencyCardTitle}
              </h3>
              <p className="text-xs text-slate-500">{currentNiche.urgencyDescription}</p>
            </div>
            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-xs">
              {urgentLeads.length}
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-72">
            {urgentLeads.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <p className="text-xs font-medium text-slate-600">{currentNiche.urgencyEmptyTitle}</p>
                <p className="text-[11px] text-slate-400">{currentNiche.urgencyEmptyDesc}</p>
              </div>
            ) : (
              urgentLeads.map((u) => (
                <div
                  key={u.id}
                  className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 space-y-2 text-xs hover:border-rose-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{u.name}</span>
                    <span className="text-[10px] text-rose-800 font-semibold bg-white px-1.5 py-0.5 rounded border border-rose-200">
                      {u.phone}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-900 line-clamp-2">
                    {u.urgencyReason || 'Classificado com alta prioridade de atendimento imediato'}
                  </p>
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => onOpenChat(u.id)}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>Abrir Chat WhatsApp</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modern Discreet QR Code Modal for Client */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Conectar WhatsApp</h3>
                  <p className="text-xs text-slate-500">Escaneie o QR Code com o WhatsApp da empresa</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-100/80 p-1 rounded-xl mt-3">
              <button
                type="button"
                onClick={() => setModalTab('qr')}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalTab === 'qr'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>1. QR Code</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('crm_flow')}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalTab === 'crm_flow'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>2. Ver no CRM</span>
              </button>
              <button
                type="button"
                onClick={() => setModalTab('benefits')}
                className={`flex-1 text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  modalTab === 'benefits'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>3. O Que Esperar</span>
              </button>
            </div>

            {/* Modal Body: QR Tab */}
            {modalTab === 'qr' && (
              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                {/* Quick instance switcher inside modal (Full controls for Admin, clean label for Client) */}
                {isAdmin ? (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                        Instância Selecionada (Admin):
                      </span>
                      <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {evolutionConfig.instanceName || 'agente-ia'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectInstance('agente-ia')}
                        className={`text-[10px] font-bold py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                          evolutionConfig.instanceName === 'agente-ia'
                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Marco Duarte
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectInstance('demo-ao-vivo')}
                        className={`text-[10px] font-bold py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                          evolutionConfig.instanceName === 'demo-ao-vivo'
                            ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Demo ao Vivo
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelectInstance(customInstanceName.trim() || 'dra-lucy-murata')}
                        className={`text-[10px] font-bold py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                          evolutionConfig.instanceName !== 'agente-ia' && evolutionConfig.instanceName !== 'demo-ao-vivo'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Dra. Lucy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-emerald-800">
                    <span className="font-medium">Canal de Atendimento do Consultório</span>
                    <span className="font-bold bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-700 text-[11px]">
                      Pronto para Conexão
                    </span>
                  </div>
                )}

                {isQrLoading && !qrCodeData ? (
                  <div className="w-64 h-64 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
                    <p className="text-xs font-semibold">{qrStatusText}</p>
                  </div>
                ) : isConnectedLive ? (
                  <div className="w-64 h-64 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                      <Check className="w-8 h-8" />
                    </div>
                    <h4 className="font-bold text-emerald-900 text-base">WhatsApp Conectado!</h4>
                    <p className="text-xs text-emerald-700">
                      O Agente de IA já está pronto e atendendo as mensagens recebidas em tempo real.
                    </p>
                  </div>
                ) : qrCodeData ? (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-md">
                      <img
                        src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                        alt="WhatsApp QR Code"
                        className="w-56 h-56 object-contain rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                      <span>Atualiza automaticamente a cada 5s</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-center p-4 space-y-2">
                    <QrCode className="w-10 h-10 text-slate-400" />
                    <p className="text-xs font-semibold">{qrStatusText}</p>
                    <button
                      onClick={fetchDashboardQrCode}
                      className="mt-2 text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Tentar Novamente
                    </button>
                  </div>
                )}

                {/* Instructions step by step for the client */}
                <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Passo a passo rápido:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                    <li>Abra o <strong>WhatsApp</strong> no celular comercial</li>
                    <li>Acesse <strong>Aparelhos Conectados</strong> (Ajustes ou 3 pontinhos)</li>
                    <li>Toque em <strong>Conectar um aparelho</strong></li>
                    <li>Aponte a câmera para o QR Code acima</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Modal Body: How to view in CRM Tab */}
            {modalTab === 'crm_flow' && (
              <div className="py-4 space-y-3.5 text-xs text-slate-600">
                <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                    <Eye className="w-4 h-4 text-indigo-600" />
                    Como o atendimento aparece no CRM:
                  </div>
                  <p className="text-[11px] text-indigo-800 leading-relaxed">
                    Assim que o WhatsApp é conectado, você e sua equipe têm visibilidade total e instantânea de cada interação:
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">1. Cartões no Kanban em Tempo Real</strong>
                      <span className="text-[11px] text-slate-500">Cada novo contato que manda mensagem vira um lead e avança de estágio sozinho (Novo Lead ➔ Qualificado ➔ Proposta ➔ Fechado).</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="p-1.5 bg-violet-100 text-violet-700 rounded-lg shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">2. Triagem Completa do Agendamento</strong>
                      <span className="text-[11px] text-slate-500">A IA anota procedimento de interesse, turno (manhã/tarde), dia preferido e forma de pagamento na ficha do lead.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">3. Central de Chat ao Vivo & Intervenção</strong>
                      <span className="text-[11px] text-slate-500">Leia a conversa ao vivo e, se desejar falar com o paciente pessoalmente, clique em <em>"Assumir Atendimento"</em> para pausar a IA na hora.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setShowQrModal(false);
                      onNavigateToTab('kanban');
                    }}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-center cursor-pointer transition-colors"
                  >
                    Ver Funil Kanban
                  </button>
                  <button
                    onClick={() => {
                      setShowQrModal(false);
                      onNavigateToTab('chat');
                    }}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-center cursor-pointer transition-colors"
                  >
                    Abrir Central de Chat
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body: What to expect Tab */}
            {modalTab === 'benefits' && (
              <div className="py-4 space-y-3 text-xs text-slate-600">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    O que esperar do Atendimento com IA:
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Mais conversões, resposta imediata e experiência humanizada para os seus clientes:
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">Resposta em Menos de 10 Segundos</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Atendimento ininterrupto 24 horas por dia, fins de semana e feriados. Nenhum lead esfria ou busca o concorrente.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">Voz Neural Humanizada em Áudio</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Se o paciente mandar áudio pelo WhatsApp, a Sofia responde com áudio falado natural com entonação de secretária dedicada.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-lg shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-900 block text-xs">Anti-Vácuo & Remarketing Automático</strong>
                      <p className="text-[11px] text-slate-500 leading-relaxed">Se o paciente sumir no meio do agendamento, o sistema resgata o contato 4 horas depois de forma cordial e amigável.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Instância: <strong className="text-slate-700">{evolutionConfig.instanceName || 'agente-ia'}</strong>
              </span>
              <button
                onClick={() => setShowQrModal(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reset / Clean CRM Data Modal */}
      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        totalLeads={totalLeads}
        onClearAll={async () => {
          if (onClearAllLeads) await onClearAllLeads();
        }}
        onRestoreDemo={async () => {
          if (onRestoreDemoLeads) await onRestoreDemoLeads();
        }}
      />

      {/* Modal: Trocar Cliente / Configurar Nova Instância */}
      {showEditClientModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Instância do Cliente</h3>
                  <p className="text-xs text-slate-500">Defina o nome da cliente e crie na Evolution API</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditClientModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAndCreateInstance} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Exibido do Cliente
                </label>
                <input
                  type="text"
                  value={clientDisplayName}
                  onChange={(e) => setClientDisplayName(e.target.value)}
                  placeholder="Ex: Dra. Lucy Murata ou Clínica Sorrir"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome da Instância (Evolution API)
                </label>
                <input
                  type="text"
                  value={clientInputName}
                  onChange={(e) => setClientInputName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                  placeholder="Ex: dra-lucy-murata, clinica-maria"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Apenas letras minúsculas, números e hífens. Sem espaços.
                </p>
              </div>

              {/* Suggestions Quick Buttons */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">Exemplos Prontos:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setClientDisplayName('Dra. Lucy Murata');
                      setClientInputName('dra-lucy-murata');
                    }}
                    className="text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded cursor-pointer transition-colors"
                  >
                    Dra. Lucy Murata
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientDisplayName('Dra. Maria Odonto');
                      setClientInputName('dra-maria-odonto');
                    }}
                    className="text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded cursor-pointer transition-colors"
                  >
                    Dra. Maria Odonto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setClientDisplayName('Clínica Estética');
                      setClientInputName('clinica-estetica');
                    }}
                    className="text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded cursor-pointer transition-colors"
                  >
                    Clínica Estética
                  </button>
                </div>
              </div>

              {createFeedback && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2 text-xs text-indigo-800 font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
                  <span>{createFeedback}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditClientModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingOnVps}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isCreatingOnVps ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Configurando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Ativar & Gerar QR Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
