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
  CreditCard,
  Send,
  Layers,
  Shield,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Lead, KanbanStage, AgentConfig, EvolutionConfig, BusinessNiche } from '../types';
import { ResetDataModal } from './ResetDataModal';
import { ServerHealthModal } from './ServerHealthModal';

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
  restaurant_delivery: {
    id: 'restaurant_delivery',
    name: 'Restaurantes / Pizzarias / Delivery',
    shortName: 'Restaurante/Delivery',
    icon: '🍕',
    urgencyCardTitle: 'Pedidos c/ Atraso ou Prioridade',
    urgencyBadge: 'Pedido Prioritário',
    urgencyDescription: 'Pedidos na cozinha ou em rota que exigem atenção imediata',
    urgencyEmptyTitle: 'Todas as entregas dentro do prazo!',
    urgencyEmptyDesc: 'Nenhum pedido com alerta de atraso no momento.',
    leadsCategoryLabel: 'Clientes & Pedidos',
    triagesTitle: 'Pedidos em Rota / Entregues',
    triagesSubLabel: 'pedidos ativos',
    actionButtonText: 'Ver Pedidos',
  },
};

interface ExecutiveDashboardProps {
  leads: Lead[];
  stages: KanbanStage[];
  agentConfig: AgentConfig;
  evolutionConfig: EvolutionConfig;
  onOpenChat: (leadId: string) => void;
  onNavigateToTab: (tab: 'kanban' | 'chat' | 'agent' | 'evolution' | 'calendar' | 'delivery') => void;
  onUpdateEvolutionConfig?: (config: EvolutionConfig) => void;
  onUpdateAgentConfig?: (config: AgentConfig) => void;
  onClearAllLeads?: () => Promise<void> | void;
  onRestoreDemoLeads?: () => Promise<void> | void;
  isAdmin?: boolean;
  showExecutiveGuide: boolean;
  setShowExecutiveGuide: (show: boolean) => void;
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
  showExecutiveGuide,
  setShowExecutiveGuide,
}) => {
  const currentNicheKey = agentConfig.followUpNiche || 'dental';
  const currentNiche: NichePreset = NICHE_PRESETS[currentNicheKey] || NICHE_PRESETS.general;

  const [showResetModal, setShowResetModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);

  // Daily Owner WhatsApp Briefing state
  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [briefingPhone, setBriefingPhone] = useState(agentConfig.ownerBriefingPhone || '5511976143323');
  const [briefingTime, setBriefingTime] = useState(agentConfig.ownerBriefingTime || '20:00');
  const [briefingText, setBriefingText] = useState('');
  const [isSendingBriefing, setIsSendingBriefing] = useState(false);
  const [briefingFeedback, setBriefingFeedback] = useState<string | null>(null);

  // Advanced Guide & Educational Modals state
  const [guideTab, setGuideTab] = useState<'kanban_flow' | 'reativacao' | 'agendamento' | 'atendimento_24h'>('kanban_flow');
  const [showReactivationExplainModal, setShowReactivationExplainModal] = useState(false);
  const [showAppointmentExplainModal, setShowAppointmentExplainModal] = useState(false);

  const handleOpenBriefingPreview = async () => {
    setShowBriefingModal(true);
    setBriefingFeedback(null);
    try {
      const res = await fetch('/api/briefing/preview');
      if (res.ok) {
        const data = await res.json();
        setBriefingText(data.text || '');
        if (data.ownerPhone) setBriefingPhone(data.ownerPhone);
      }
    } catch (err) {
      console.error('Erro ao carregar preview do briefing:', err);
    }
  };

  const handleDispatchBriefingNow = async () => {
    setIsSendingBriefing(true);
    setBriefingFeedback(null);
    try {
      const res = await fetch('/api/briefing/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: briefingPhone, customText: briefingText }),
      });
      if (res.ok) {
        const data = await res.json();
        setBriefingFeedback(data.message || 'Briefing Executivo processado com sucesso!');
        if (onUpdateAgentConfig) {
          onUpdateAgentConfig({
            ...agentConfig,
            ownerBriefingEnabled: true,
            ownerBriefingPhone: briefingPhone,
            ownerBriefingTime: briefingTime,
          });
        }
      }
    } catch (err: any) {
      setBriefingFeedback('Erro ao disparar briefing: ' + (err.message || 'Falha de conexão'));
    } finally {
      setIsSendingBriefing(false);
    }
  };

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

  // Executive Guide & Onboarding state (moved to App.tsx)
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

          {/* Server Health & Resources (Admin) */}
          {isAdmin && (
            <button
              id="btn-dashboard-server-health"
              onClick={() => setShowHealthModal(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Monitorar consumo de Memória RAM, Espaço em Disco e Telemetria do Servidor"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Servidor & Recursos</span>
            </button>
          )}

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
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Resgate do "Dinheiro na Gaveta"
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  🛡️ Cadência Segura Anti-Bloqueio (25-45s)
                </span>
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mt-1 flex items-center gap-2">
                Reativação de Base & Clientes Inativos (Campanhas com IA)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                Aborda contatos que não compram ou consultam há mais de 30/60/180 dias com mensagens humanizadas personalizadas (com nome ou áudio falado). Quando o cliente responde "oi, tudo bem", a Sofia retoma a conversa e fecha!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowReactivationExplainModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
              title="Ver explicação passo a passo com exemplo de WhatsApp"
            >
              <Info className="w-3.5 h-3.5 text-indigo-300" />
              <span>Como Funciona o Resgate</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('kanban')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <span>Ver Base no Kanban</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Métricas da Reativação */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="text-center sm:text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Na Fila de Resgate</span>
            <span className="text-base sm:text-lg font-extrabold text-indigo-300 font-mono">
              {baseAntigaLeads.length} contatos
            </span>
            <span className="text-[10px] text-slate-400 block">Clientes antigos mapeados</span>
          </div>

          <div className="text-center sm:text-left border-l border-white/10 pl-3">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Resgatados / Ativos</span>
            <span className="text-base sm:text-lg font-extrabold text-emerald-400 font-mono">
              {reactivatedLeads.length} ({reactivatedRate}%)
            </span>
            <span className="text-[10px] text-emerald-300/80 block">Responderam & retomaram</span>
          </div>

          <div className="text-center sm:text-left border-l border-white/10 pl-3 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Receita Resgatada</span>
            <span className="text-base sm:text-lg font-extrabold text-amber-300 font-mono">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reactivatedRevenue)}
            </span>
            <span className="text-[10px] text-amber-300/80 block">Vendas que estavam perdidas</span>
          </div>
        </div>
      </div>

      {/* Central de Agendamentos & Confirmação Anti-Falta (Anti-No-Show) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-violet-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                  Agenda Otimizada
                </span>
                <span className="text-[10px] text-violet-700 font-bold bg-violet-50 px-2 py-0.5 rounded-full border border-violet-200">
                  🛡️ Anti-No-Show Ativo (Zero Cadeira Vazia)
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                Central de Agendamentos & Lembretes Anti-Falta no WhatsApp
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
                A Sofia faz a triagem do paciente (procedimento, particular vs convênio e turno preferido), agenda o horário e dispara lembretes automáticos 24h e 2h antes com confirmação rápida, reduzindo faltas em até 70%!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowAppointmentExplainModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
              title="Entenda como a Sofia faz a triagem e confirma horários"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>Como Funciona o Agendamento</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToTab('calendar')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Abrir Agenda de Consultas</span>
            </button>
          </div>
        </div>

        {/* 3 Pilares do Agendamento Inteligente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-violet-100 text-violet-700 text-[10px] font-mono flex items-center justify-center font-bold">1</span>
                Triagem no WhatsApp
              </span>
              <span className="text-[10px] text-violet-600 font-semibold">{triagedLeads.length} Triados</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Descobre procedimento de interesse, turno desejado (manhã/tarde) e tipo de atendimento sem a secretária precisar digitar.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-mono flex items-center justify-center font-bold">2</span>
                Confirmação de Presença
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">{confirmedAppointments.length} Confirmados</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              O paciente recebe lembrete no WhatsApp 24h antes e clica para confirmar. Se desmarcar, a recepção é avisada na mesma hora para remanejar a vaga.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-mono flex items-center justify-center font-bold">3</span>
                Pós-Consulta & Retorno
              </span>
              <span className="text-[10px] text-amber-600 font-semibold">Automático</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Pesquisa de satisfação e agendamento de retornos periódicos (profilaxia, revisão, novas etapas) sem esforço manual.
            </p>
          </div>
        </div>
      </div>

      {/* Relatório Executivo Diário no WhatsApp do Dono (Morning / Evening Briefing) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                📲 Relatório Diário no WhatsApp do Proprietário (Morning / Evening Briefing)
              </h3>
              <span className="text-[11px] text-emerald-700 font-semibold">
                · Disparo Automático às {briefingTime}h
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              A Sofia compila o balanço do dia (Pipeline R$, Pagamentos PIX validados por IA, Agendamentos, Entregas e Urgências) e envia direto no celular do dono.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-open-owner-briefing"
            onClick={handleOpenBriefingPreview}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ver & Disparar Briefing no WhatsApp Agora</span>
          </button>
        </div>
      </div>

      {/* Modal de Preview e Disparo do Briefing Executivo Diário */}
      {showBriefingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Briefing Executivo no WhatsApp do Dono
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Resumo estratégico diário enviado pela IA Sofia no celular do proprietário
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBriefingModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  WhatsApp do Proprietário / Gestor (com DDD)
                </label>
                <input
                  type="text"
                  value={briefingPhone}
                  onChange={(e) => setBriefingPhone(e.target.value)}
                  placeholder="5511999998888"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Horário do Disparo Diário Automático
                </label>
                <select
                  value={briefingTime}
                  onChange={(e) => setBriefingTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900"
                >
                  <option value="08:00">08:00 (Morning Briefing — Abertura do Dia)</option>
                  <option value="18:00">18:00 (Fechamento Comercial)</option>
                  <option value="20:00">20:00 (Balanço Noturno Completo)</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Prévia da Mensagem em Tempo Real (Editável):
              </label>
              <textarea
                rows={10}
                value={briefingText}
                onChange={(e) => setBriefingText(e.target.value)}
                className="w-full bg-emerald-950/95 text-emerald-50 font-mono text-xs p-3.5 rounded-xl border border-emerald-800 leading-relaxed focus:outline-hidden"
              />
            </div>

            {briefingFeedback && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{briefingFeedback}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBriefingModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                disabled={isSendingBriefing}
                onClick={handleDispatchBriefingNow}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isSendingBriefing ? 'Disparando no WhatsApp...' : 'Enviar Agora no WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
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

          {/* Navegação entre os 4 Módulos Operacionais */}
          <div className="flex flex-wrap items-center gap-2 pt-5 pb-3 border-b border-white/10 relative z-10">
            <button
              type="button"
              onClick={() => setGuideTab('kanban_flow')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                guideTab === 'kanban_flow'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. Kanban Automático & Limite Seguro</span>
            </button>

            <button
              type="button"
              onClick={() => setGuideTab('reativacao')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                guideTab === 'reativacao'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Reativação de Base Antiga (Resgate)</span>
            </button>

            <button
              type="button"
              onClick={() => setGuideTab('agendamento')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                guideTab === 'agendamento'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Agendamentos & Anti-Falta (No-Show)</span>
            </button>

            <button
              type="button"
              onClick={() => setGuideTab('atendimento_24h')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                guideTab === 'atendimento_24h'
                  ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>4. Atendimento 24/7, Voz & Chave PIX</span>
            </button>
          </div>

          {/* TAB 1: KANBAN AUTOMÁTICO & ONDE ENTRA O HUMANO */}
          {guideTab === 'kanban_flow' && (
            <div className="pt-6 relative z-10 space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Lado 1: O Que a IA Faz 100% Sozinha */}
                <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-5 space-y-3.5 bg-gradient-to-br from-white/5 to-emerald-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ⚡ 100% Automático
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">Autonomia Comercial</span>
                  </div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    O que a IA Move e Fecha Sozinha no Funil
                  </h3>
                  <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                      <span><strong>Entrada Imediata:</strong> Qualquer cliente que manda mensagem no WhatsApp vira um cartão sozinho na coluna <em>"Novos Leads"</em>.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                      <span><strong>Triagem e Avanço de Estágio:</strong> A Sofia descobre interesse, turno de preferência e forma de pagamento, movendo o cartão sozinho para <em>"Em Atendimento"</em> e <em>"Triagem Concluída"</em>.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                      <span><strong>Fechamento com PIX ou Pedidos Tabelados:</strong> Se for produto com preço fixo (cardápios, taxas de entrega tabeladas, planos ou itens cadastrados), ou se o cliente pedir a chave PIX, a Sofia envia a chave oficial, lê o comprovante com visão computacional e move o cartão para <em>"Ganho / Pago"</em>!</span>
                    </div>
                  </div>
                </div>

                {/* Lado 2: Onde a IA NÃO Fecha no Escuro (Segurança do Negócio) */}
                <div className="bg-white/5 border border-indigo-500/30 rounded-2xl p-5 space-y-3.5 bg-gradient-to-br from-white/5 to-indigo-950/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      🛡️ Limite Seguro da Automação
                    </span>
                    <span className="text-[11px] text-indigo-400 font-mono font-bold">Zero Risco Financeiro</span>
                  </div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400 shrink-0" />
                    O que Exige Conversa ou Avaliação Humana
                  </h3>
                  <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                      <span><strong>Orçamentos Sob Medida & Procedimentos Clínicos:</strong> Tratamentos como implantes, próteses, harmonização facial, reformas ou peças industriais sob encomenda dependem de <strong>exame clínico ou avaliação técnica</strong>.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                      <span><strong>A IA Não Chuta Valores:</strong> A Sofia <strong>NUNCA inventa preços</strong> nem fecha no escuro o que precisa de exame! Ela qualifica, tira dúvidas de localização/horários e <strong>agenda a Avaliação Presencial</strong>, deixando o valor final para o profissional fechar cara a cara.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                      <span><strong>Assumir Atendimento a Qualquer Momento:</strong> Na Central de Chat, você clica em <em>"Assumir Atendimento"</em> e conversa manualmente sempre que quiser negociar condições especiais.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <span className="text-xs text-slate-400">
                  💡 O Kanban funciona como um piloto automático inteligente: cuida de 90% da rotina e deixa as negociações de alto valor mastigadas para você.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigateToTab('kanban')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Abrir Kanban</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigateToTab('chat')}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Central de Chat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REATIVAÇÃO DE BASE ANTIGA */}
          {guideTab === 'reativacao' && (
            <div className="pt-6 relative z-10 space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">Mapeamento dos Inativos</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Clientes ou pacientes antigos que não compram há mais de 30, 60 ou 180 dias. O sistema puxa os nomes e históricos automaticamente.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Cadência Segura Anti-Ban</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Disparos em intervalos aleatórios de <strong>25 a 45 segundos</strong> com o nome personalizado (<code className="text-amber-300 font-mono text-[11px]">&#123;nome&#125;</code>) ou áudio humano. O WhatsApp reconhece como conversa real.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-white">Resposta "Oi, tudo bem"</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Quando o cliente responde, a Sofia lê a mensagem que ela mesma mandou antes, acolhe o cliente com simpatia e conduz para o fechamento!
                  </p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
                <div className="space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-amber-300">
                    <Sparkles className="w-4 h-4" />
                    Como funciona na prática quando você clica em disparar:
                  </span>
                  <p className="text-slate-300">
                    Você pode selecionar 20, 50 ou 100 contatos da lista, escolher um modelo de texto ou áudio falado, e o robô cuida de todo o envio em segundo plano.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowReactivationExplainModal(true)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Ver Simulação de Conversa
                  </button>
                  <button
                    onClick={() => onNavigateToTab('kanban')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Ver Base Inativa
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AGENDAMENTOS & ANTI-FALTA */}
          {guideTab === 'agendamento' && (
            <div className="pt-6 relative z-10 space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h4 className="text-sm font-bold text-white">Triagem no WhatsApp</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    A Sofia pergunta o procedimento ou queixa, se é particular ou convênio, e o turno desejado (manhã ou tarde). Ficha pronta para a recepção.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h4 className="text-sm font-bold text-white">Encaixe na Agenda</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    O horário cai direto no painel de Agendamentos e no Google Agenda, organizando os consultórios e profissionais sem conflitos de horário.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h4 className="text-sm font-bold text-white">Lembrete Anti-Falta (24h & 2h)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Mensagem no WhatsApp no dia anterior com botões rápidos: <strong>[Confirmar]</strong> ou <strong>[Remarcar]</strong>. Se desmarcar, a vaga é liberada na hora.
                  </p>
                </div>
              </div>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-violet-200">
                <div className="space-y-1">
                  <span className="font-bold flex items-center gap-1.5 text-violet-300">
                    <Calendar className="w-4 h-4" />
                    O Maior Vilão dos Consultórios: A Cadeira Vazia
                  </span>
                  <p className="text-slate-300">
                    Em média, 25% a 35% dos pacientes faltam sem avisar. O sistema de confirmação ativa reduz essa taxa para menos de 8%!
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowAppointmentExplainModal(true)}
                    className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                  >
                    Como Funciona o Anti-Falta
                  </button>
                  <button
                    onClick={() => onNavigateToTab('calendar')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Abrir Agenda
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ATENDIMENTO 24/7, VOZ & CHAVE PIX */}
          {guideTab === 'atendimento_24h' && (
            <div className="pt-6 relative z-10 space-y-5 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold text-xs">
                    ⚡
                  </div>
                  <h4 className="text-sm font-bold text-white">Resposta em &lt;10s (24/7)</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Nenhum lead fica esperando. Atende na madrugada, feriados e fins de semana, momento em que concorrentes estão fechados.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs">
                    🎙️
                  </div>
                  <h4 className="text-sm font-bold text-white">Voz Humana com Respiração</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Se o cliente mandar áudio no WhatsApp, a Sofia escuta, transcreve e responde com áudio falado natural e empático.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    💳
                  </div>
                  <h4 className="text-sm font-bold text-white">Chave PIX & Comprovante</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Quando o cliente pede PIX para fechar, a IA envia a chave cadastrada pronta para copiar e valida o comprovante com visão computacional.
                  </p>
                </div>
              </div>

              {/* Status da Chave PIX */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-sm shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chave PIX Cadastrada no Sistema</span>
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      {agentConfig.pixKey ? `${agentConfig.pixKey} (${agentConfig.pixKeyType || 'E-mail'})` : 'Nenhuma chave cadastrada ainda'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      onClick={() => onNavigateToTab('agent')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer shadow-xs"
                    >
                      Configurar Chave PIX
                    </button>
                  )}
                  <button
                    onClick={() => onNavigateToTab('chat')}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Testar no Chat ao Vivo
                  </button>
                </div>
              </div>
            </div>
          )}
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

      {/* Modal Educativo: Como Funciona a Reativação de Base */}
      {showReactivationExplainModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Como Funciona o Resgate de Base & Clientes Inativos
                  </h3>
                  <p className="text-xs text-slate-500">
                    O passo a passo para transformar contatos esquecidos em faturamento real
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReactivationExplainModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-600 leading-relaxed">
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-indigo-900 text-sm flex items-center gap-2">
                  <span>💡 O Conceito do "Dinheiro na Gaveta"</span>
                </span>
                <p className="text-indigo-950">
                  Conquistar um novo cliente custa de 5 a 7 vezes mais caro do que vender para quem já conhece sua empresa. Toda empresa tem dezenas ou centenas de contatos que já compraram ou consultaram uma vez, mas que esfriaram por falta de tempo da equipe de mandar mensagem um por um.
                </p>
              </div>

              {/* 3 Etapas */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-bold text-slate-900">Seleção dos Contatos Inativos</h4>
                    <p className="text-slate-500 mt-0.5">
                      Você pode filtrar quem não compra há 30, 60 ou 180 dias. Na tela de campanhas, basta escolher quantos quer disparar hoje (ex: 20, 50 ou 100).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-bold text-slate-900">Disparo com Cadência Segura Anti-Bloqueio (25 a 45s)</h4>
                    <p className="text-slate-500 mt-0.5">
                      O sistema <strong>não dispara tudo de uma vez</strong>. Ele envia uma mensagem, espera de 25 a 45 segundos (simulando digitação humana) e envia a próxima. Isso garante que o WhatsApp nunca considere sua conta como spam!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-bold text-slate-900">Personalização com Nome e Retomada Natural da Sofia</h4>
                    <p className="text-slate-500 mt-0.5">
                      O robô troca a tag <code className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-mono">&#123;nome&#125;</code> pelo primeiro nome de cada cliente. Quando a pessoa responde, a Sofia já assume a conversa na hora!
                    </p>
                  </div>
                </div>
              </div>

              {/* Exemplo de Conversa no WhatsApp */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-800 block">Exemplo Real de Conversa de Resgate:</span>
                <div className="bg-emerald-950/90 rounded-2xl p-4 space-y-3 font-sans border border-emerald-900">
                  <div className="bg-emerald-800 text-white p-3 rounded-xl rounded-tr-xs max-w-sm ml-auto text-xs shadow-xs">
                    <span className="text-[10px] text-emerald-300 font-bold block mb-0.5">Sofia (IA da Clínica):</span>
                    Olá Roberto, tudo bem? Passando para te dar um oi! Consegue falar 5 minutinhos hoje?
                  </div>

                  <div className="bg-white text-slate-900 p-3 rounded-xl rounded-tl-xs max-w-sm mr-auto text-xs shadow-xs">
                    <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Roberto (Cliente Antigo):</span>
                    oi, tudo bem
                  </div>

                  <div className="bg-emerald-800 text-white p-3 rounded-xl rounded-tr-xs max-w-sm ml-auto text-xs shadow-xs">
                    <span className="text-[10px] text-emerald-300 font-bold block mb-0.5">Sofia (IA da Clínica):</span>
                    Tudo ótimo por aqui, Roberto! 😊 Estava revisando nossos atendimentos e lembrei de você. Como estão as coisas? Me conta: você gostaria de agendar uma avaliação preventiva essa semana ou prefere no início do próximo mês?
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReactivationExplainModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReactivationExplainModal(false);
                  onNavigateToTab('kanban');
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Ver Base de Inativos no Kanban</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Educativo: Como Funciona o Agendamento & Anti-Falta */}
      {showAppointmentExplainModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-violet-50 border border-violet-200 text-violet-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Como Funciona o Agendamento & Confirmação Anti-Falta
                  </h3>
                  <p className="text-xs text-slate-500">
                    Triagem inteligente no WhatsApp e fim do no-show (cadeira vazia)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAppointmentExplainModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-600 leading-relaxed">
              <div className="bg-violet-50/70 border border-violet-200/80 rounded-2xl p-4 space-y-2">
                <span className="font-bold text-violet-900 text-sm flex items-center gap-2">
                  <span>🛡️ A Dor das Clínicas: Pacientes que Faltam sem Avisar</span>
                </span>
                <p className="text-violet-950">
                  Em clínicas e consultórios, de 20% a 35% dos horários agendados são perdidos porque o paciente simplesmente esquece ou surge um imprevisto e ele não avisa a recepção a tempo. A Sofia resolve isso através de confirmações automáticas ativas no WhatsApp.
                </p>
              </div>

              {/* Fluxo em 3 Etapas */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-violet-600 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                  <div>
                    <h4 className="font-bold text-slate-900">Triagem Inicial na Conversa</h4>
                    <p className="text-slate-500 mt-0.5">
                      Quando o paciente demonstra interesse em consultar, a Sofia pergunta:
                      <br />• Procedimento ou queixa principal (ex: limpeza, clareamento, dor).
                      <br />• Forma de pagamento (Particular ou Convênio).
                      <br />• Preferência de turno (Manhã ou Tarde).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                  <div>
                    <h4 className="font-bold text-slate-900">Ficha Mastigada no Calendário</h4>
                    <p className="text-slate-500 mt-0.5">
                      O agendamento entra automaticamente na aba <strong>Agendamentos</strong> e sincroniza com o Google Agenda. A secretária ou recepcionista não precisa redigitar nada.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                  <div>
                    <h4 className="font-bold text-slate-900">Lembrete Automático 24h e 2h Antes no WhatsApp</h4>
                    <p className="text-slate-500 mt-0.5">
                      No dia anterior, a Sofia manda uma mensagem calorosa pedindo confirmação rápida:
                      <br />• <strong>Se confirmar:</strong> o status vira "Confirmado" e o profissional tem garantia de atendimento.
                      <br />• <strong>Se desmarcar:</strong> a secretária é notificada na hora para encaixar outro paciente da lista de espera!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAppointmentExplainModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAppointmentExplainModal(false);
                  onNavigateToTab('calendar');
                }}
                className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Abrir Calendário de Agendamentos</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Server Health & Resources Modal */}
      <ServerHealthModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
      />
    </div>
  );
};
