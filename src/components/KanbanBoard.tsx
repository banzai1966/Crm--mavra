import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Bot,
  UserCheck,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  Tag,
  DollarSign,
  Phone,
  Layers,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Clock,
  Download,
  Flame,
  Zap,
  Database,
  Upload,
  Send,
  Bike,
  UtensilsCrossed,
  LayoutDashboard,
  Stethoscope,
} from 'lucide-react';
import { Lead, KanbanStage, EvolutionConfig } from '../types';
import { NewLeadModal } from './NewLeadModal';
import { ResetDataModal } from './ResetDataModal';
import { ImportLeadsModal } from './ImportLeadsModal';
import { ReactivationCampaignModal } from './ReactivationCampaignModal';

export const RESTAURANT_KANBAN_STAGES: KanbanStage[] = [
  { id: 'rest-novo', name: '📥 Novo Pedido (WhatsApp)', color: '#3b82f6', order: 1 },
  { id: 'rest-cozinha', name: '🍳 Na Cozinha (Em Preparo)', color: '#f59e0b', order: 2 },
  { id: 'rest-rota', name: '🛵 Saiu p/ Entrega (Em Rota)', color: '#6366f1', order: 3 },
  { id: 'rest-chegando', name: '⏱️ Chegando no Local (~5 min)', color: '#ea580c', order: 4 },
  { id: 'rest-entregue', name: '✅ Entregue & Concluído (PIN)', color: '#10b981', order: 5 },
  { id: 'rest-cancelado', name: '❌ Cancelado', color: '#ef4444', order: 6 },
];

export const HEALTH_KANBAN_STAGES: KanbanStage[] = [
  { id: 'health-base', name: '📂 Base Antiga (+6m Inativos)', color: '#6366f1', order: 1 },
  { id: 'health-reativacao', name: '⚡ Em Reativação (Sofia IA)', color: '#ec4899', order: 2 },
  { id: 'health-triagem', name: '📥 Novo Paciente / Triagem', color: '#3b82f6', order: 3 },
  { id: 'health-avaliacao', name: '💬 Em Avaliação / Dúvidas', color: '#f59e0b', order: 4 },
  { id: 'health-agendado', name: '📅 Consulta Agendada', color: '#8b5cf6', order: 5 },
  { id: 'health-tratamento', name: '🩺 Paciente em Tratamento', color: '#06b6d4', order: 6 },
  { id: 'health-concluido', name: '🌟 Alta / Concluído', color: '#10b981', order: 7 },
  { id: 'health-retorno', name: '🔄 Retorno Preventivo / Manutenção', color: '#14b8a6', order: 8 },
];

export const isDeliveryOrRestaurantLead = (l: Lead): boolean => {
  if (l.deliveryInfo) return true;
  const str = `${l.name} ${(l.tags || []).join(' ')} ${l.interest || ''} ${l.notes || ''}`.toLowerCase();
  return (
    str.includes('delivery') ||
    str.includes('restaurante') ||
    str.includes('pizz') ||
    str.includes('burger') ||
    str.includes('lanche') ||
    str.includes('sushi') ||
    str.includes('marmit') ||
    str.includes('comida') ||
    str.includes('motoboy') ||
    str.includes('ifood') ||
    l.id === 'lead-1' ||
    l.id === 'lead-2' ||
    l.id === 'lead-3' ||
    l.id === 'lead-4'
  );
};

export const isHealthLead = (l: Lead): boolean => {
  if (l.triage || l.scheduledDate) return true;
  const str = `${l.name} ${(l.tags || []).join(' ')} ${l.interest || ''} ${l.notes || ''}`.toLowerCase();
  return (
    str.includes('clínica') ||
    str.includes('clinica') ||
    str.includes('odonto') ||
    str.includes('médic') ||
    str.includes('medic') ||
    str.includes('avaliação') ||
    str.includes('dent') ||
    str.includes('dra') ||
    str.includes('doutor') ||
    str.includes('paciente') ||
    str.includes('amálgama') ||
    str.includes('profilaxia') ||
    str.includes('limpeza') ||
    str.includes('harmonização') ||
    str.includes('harmonizacao') ||
    str.includes('botox') ||
    str.includes('bioestimulador') ||
    str.includes('prontuário') ||
    str.includes('prontuario') ||
    str.includes('consulta') ||
    str.includes('exame') ||
    l.id.startsWith('lead-health-') ||
    l.id === 'lead-insta-1' ||
    l.id === 'lead-insta-1791217658483' ||
    l.id === 'lead-insta-1791217765321' ||
    l.id === 'lead-insta-1791127158451'
  );
};

interface KanbanBoardProps {
  stages: KanbanStage[];
  leads: Lead[];
  onMoveLead: (leadId: string, targetStageId: string) => void;
  onSaveLead: (leadData: Partial<Lead>, leadId?: string) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenChat: (leadId: string) => void;
  onToggleAi: (leadId: string) => void;
  onResolveUrgency?: (leadId: string) => void;
  onToggleHotLead?: (leadId: string) => void;
  onClearAllLeads?: () => Promise<void> | void;
  onRestoreDemoLeads?: () => Promise<void> | void;
  onRefreshLeads?: () => Promise<void> | void;
  onNavigateToDelivery?: () => void;
  evolutionConfig?: EvolutionConfig;
  isAdmin?: boolean;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  stages,
  leads,
  onMoveLead,
  onSaveLead,
  onDeleteLead,
  onOpenChat,
  onToggleAi,
  onResolveUrgency,
  onToggleHotLead,
  onClearAllLeads,
  onRestoreDemoLeads,
  onRefreshLeads,
  onNavigateToDelivery,
  evolutionConfig = { serverUrl: '', apiKey: '', instanceName: 'dra-lucy-murata', isConnected: false, state: 'disconnected' },
  isAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nicheFilter, setNicheFilter] = useState<'all' | 'restaurant' | 'health'>('all');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [filterHotOnly, setFilterHotOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [targetStageForNewLead, setTargetStageForNewLead] = useState<string | undefined>();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<{ id: string; name: string } | null>(null);

  // Delivery / restaurant leads count
  const restaurantLeadsCount = leads.filter(isDeliveryOrRestaurantLead).length;
  const healthLeadsCount = leads.filter(isHealthLead).length;
  const healthBaseLeadsCount = leads.filter(
    (l) =>
      isHealthLead(l) &&
      (l.stageId === 'stage-base' ||
        l.stageId === 'health-base' ||
        l.tags?.some((t) => t.toLowerCase().includes('base antiga') || t.toLowerCase().includes('sem consulta')))
  ).length;
  const healthReactivationLeadsCount = leads.filter(
    (l) =>
      isHealthLead(l) &&
      (l.stageId === 'stage-reativacao' ||
        l.stageId === 'health-reativacao' ||
        l.tags?.some((t) => t.toLowerCase().includes('reativação') || t.toLowerCase().includes('reativacao')))
  ).length;

  // Active stages according to selected niche
  const effectiveStages =
    nicheFilter === 'restaurant'
      ? RESTAURANT_KANBAN_STAGES
      : nicheFilter === 'health'
      ? HEALTH_KANBAN_STAGES
      : stages;

  // Base Antiga leads eligible for reactivation campaigns
  const baseLeads = leads.filter((l) => {
    if (nicheFilter === 'health') {
      return (
        isHealthLead(l) &&
        (l.stageId === 'stage-base' ||
          l.stageId === 'stage-reativacao' ||
          l.stageId === 'health-base' ||
          l.stageId === 'health-reativacao' ||
          l.tags?.some(
            (t) =>
              t.toLowerCase().includes('base antiga') ||
              t.toLowerCase().includes('reativação') ||
              t.toLowerCase().includes('sem consulta') ||
              t.toLowerCase().includes('inativo')
          ))
      );
    }
    return (
      l.stageId === 'stage-base' ||
      l.stageId === 'stage-reativacao' ||
      l.tags.includes('Base Antiga') ||
      l.tags.includes('Reativação')
    );
  });

  // Map lead to stageId according to the selected niche funnel
  const getLeadStageIdForNiche = (lead: Lead): string => {
    if (nicheFilter === 'restaurant') {
      const status = lead.deliveryInfo?.status;
      if (status === 'preparing') return 'rest-cozinha';
      if (status === 'dispatched') return 'rest-rota';
      if (status === 'arriving') return 'rest-chegando';
      if (status === 'delivered') return 'rest-entregue';
      if (lead.stageId === 'stage-6') return 'rest-cancelado';
      if (lead.stageId === 'stage-2') return 'rest-cozinha';
      if (lead.stageId === 'stage-3') return 'rest-rota';
      if (lead.stageId === 'stage-4') return 'rest-chegando';
      if (lead.stageId === 'stage-5') return 'rest-entregue';
      return 'rest-novo';
    }

    if (nicheFilter === 'health') {
      if (
        lead.stageId === 'stage-base' ||
        lead.stageId === 'health-base' ||
        lead.tags?.some((t) => t.toLowerCase().includes('base antiga') || t.toLowerCase().includes('sem consulta'))
      ) {
        return 'health-base';
      }
      if (
        lead.stageId === 'stage-reativacao' ||
        lead.stageId === 'health-reativacao' ||
        lead.tags?.some(
          (t) =>
            t.toLowerCase().includes('em reativação') ||
            t.toLowerCase().includes('reativação disparada') ||
            t.toLowerCase().includes('reativacao')
        )
      ) {
        return 'health-reativacao';
      }
      if (lead.stageId === 'stage-1' || lead.stageId === 'health-triagem') return 'health-triagem';
      if (lead.stageId === 'stage-2' || lead.stageId === 'health-avaliacao') return 'health-avaliacao';
      if (lead.stageId === 'stage-3' || lead.stageId === 'health-agendado') return 'health-agendado';
      if (lead.stageId === 'stage-4' || lead.stageId === 'health-tratamento') return 'health-tratamento';
      if (lead.stageId === 'stage-5' || lead.stageId === 'health-concluido') return 'health-concluido';
      if (lead.stageId === 'stage-6' || lead.stageId === 'health-retorno') return 'health-retorno';
      return 'health-triagem';
    }

    return lead.stageId;
  };

  // Filter leads based on search term, urgency, hot closing toggle and niche
  const filteredLeads = leads.filter((lead) => {
    if (filterUrgentOnly && !lead.isUrgent) return false;
    if (filterHotOnly && !lead.isHotLead) return false;

    if (nicheFilter === 'restaurant') {
      if (!isDeliveryOrRestaurantLead(lead)) return false;
    } else if (nicheFilter === 'health') {
      if (!isHealthLead(lead)) return false;
    }

    const term = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      lead.phone.includes(term) ||
      (lead.interest && lead.interest.toLowerCase().includes(term)) ||
      lead.tags.some((t) => t.toLowerCase().includes(term)) ||
      (lead.triage?.procedure && lead.triage.procedure.toLowerCase().includes(term)) ||
      (lead.hotReason && lead.hotReason.toLowerCase().includes(term))
    );
  });

  const totalValue = filteredLeads.reduce((acc, l) => acc + (l.value || 0), 0);
  const urgentCount = leads.filter((l) => l.isUrgent).length;
  const hotCount = leads.filter((l) => l.isHotLead).length;
  const triageCount = leads.filter((l) => Boolean(l.triage)).length;

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    if (nicheFilter === 'restaurant') {
      const lead = leads.find((l) => l.id === leadId);
      if (lead) {
        let deliveryStatus: 'preparing' | 'dispatched' | 'arriving' | 'delivered' = 'preparing';
        let fallbackStage = 'stage-2';

        if (stageId === 'rest-novo') {
          fallbackStage = 'stage-1';
          deliveryStatus = 'preparing';
        } else if (stageId === 'rest-cozinha') {
          fallbackStage = 'stage-2';
          deliveryStatus = 'preparing';
        } else if (stageId === 'rest-rota') {
          fallbackStage = 'stage-3';
          deliveryStatus = 'dispatched';
        } else if (stageId === 'rest-chegando') {
          fallbackStage = 'stage-4';
          deliveryStatus = 'arriving';
        } else if (stageId === 'rest-entregue') {
          fallbackStage = 'stage-5';
          deliveryStatus = 'delivered';
        } else if (stageId === 'rest-cancelado') {
          fallbackStage = 'stage-6';
          deliveryStatus = 'delivered';
        }

        const updatedDelivery = {
          orderNumber: lead.deliveryInfo?.orderNumber || `PED-${Math.floor(1000 + Math.random() * 9000)}`,
          itemsDescription: lead.deliveryInfo?.itemsDescription || lead.interest || 'Pedido de Comida / Refeição',
          motoboyName: lead.deliveryInfo?.motoboyName || 'Carlos Motoboy',
          motoboyPhone: lead.deliveryInfo?.motoboyPhone || '5511999887766',
          motoboyPlate: lead.deliveryInfo?.motoboyPlate || 'ABC-1234',
          deliveryAddress: lead.deliveryInfo?.deliveryAddress || 'Endereço informado no WhatsApp',
          etaMinutes: stageId === 'rest-chegando' ? 5 : stageId === 'rest-entregue' ? 0 : 20,
          dispatchedAt: lead.deliveryInfo?.dispatchedAt || new Date().toISOString(),
          status: deliveryStatus,
          verificationCode: lead.deliveryInfo?.verificationCode || lead.phone.slice(-4) || '1234',
        };

        await onSaveLead(
          {
            stageId: fallbackStage,
            deliveryInfo: updatedDelivery,
          },
          lead.id
        );
      }
      setDraggedLeadId(null);
      return;
    }

    if (nicheFilter === 'health') {
      const stageMap: Record<string, string> = {
        'health-base': 'stage-base',
        'health-reativacao': 'stage-reativacao',
        'health-triagem': 'stage-1',
        'health-avaliacao': 'stage-2',
        'health-agendado': 'stage-3',
        'health-tratamento': 'stage-4',
        'health-concluido': 'stage-5',
        'health-retorno': 'stage-6',
      };
      const actualStage = stageMap[stageId] || 'stage-1';
      onMoveLead(leadId, actualStage);
      setDraggedLeadId(null);
      return;
    }

    onMoveLead(leadId, stageId);
    setDraggedLeadId(null);
  };

  const openNewLeadInStage = (stageId: string) => {
    setLeadToEdit(null);
    let target = stageId;
    if (stageId === 'health-base') target = 'stage-base';
    else if (stageId === 'health-reativacao') target = 'stage-reativacao';
    else if (stageId === 'health-triagem') target = 'stage-1';
    else if (stageId === 'health-avaliacao') target = 'stage-2';
    else if (stageId === 'health-agendado') target = 'stage-3';
    else if (stageId === 'health-tratamento') target = 'stage-4';
    else if (stageId === 'health-concluido') target = 'stage-5';
    else if (stageId === 'health-retorno') target = 'stage-6';
    else if (stageId === 'rest-novo') target = 'stage-1';
    else if (stageId === 'rest-cozinha') target = 'stage-2';
    else if (stageId === 'rest-rota') target = 'stage-3';
    else if (stageId === 'rest-chegando') target = 'stage-4';
    else if (stageId === 'rest-entregue') target = 'stage-5';
    else if (stageId === 'rest-cancelado') target = 'stage-6';
    setTargetStageForNewLead(target);
    setIsModalOpen(true);
  };

  const openEditLead = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 p-4 md:p-6 overflow-hidden">
      {/* Top Controls: Search, Metrics & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="kanban-search-input"
              type="text"
              placeholder="Buscar por lead, fone ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 shadow-2xs transition-colors"
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs shadow-2xs">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-500">Total Funil:</span>
            <span className="text-emerald-700 font-bold font-mono">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalValue
              )}
            </span>
          </div>

          {/* Urgent Leads filter pill */}
          <button
            onClick={() => {
              setFilterUrgentOnly(!filterUrgentOnly);
              if (!filterUrgentOnly) setFilterHotOnly(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterUrgentOnly
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                : urgentCount > 0
                ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Filtrar apenas pacientes ou leads com urgência / dor relatada"
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${filterUrgentOnly ? 'text-white' : urgentCount > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-400'}`} />
            <span>Urgências</span>
            {urgentCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${filterUrgentOnly ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'}`}>
                {urgentCount}
              </span>
            )}
          </button>

          {/* Hot Leads / Fechamentos filter pill */}
          <button
            onClick={() => {
              setFilterHotOnly(!filterHotOnly);
              if (!filterHotOnly) setFilterUrgentOnly(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              filterHotOnly
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
                : hotCount > 0
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 border-amber-400 hover:from-amber-100 hover:to-orange-100 ring-1 ring-amber-400/40'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Filtrar oportunidades quentes com pedido de PIX / fechamento / compra"
          >
            <Flame className={`w-3.5 h-3.5 ${filterHotOnly ? 'text-white' : hotCount > 0 ? 'text-amber-600 fill-amber-500 animate-bounce' : 'text-slate-400'}`} />
            <span>Fechamentos 🔥</span>
            {hotCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${filterHotOnly ? 'bg-white text-amber-800' : 'bg-amber-500 text-white'}`}>
                {hotCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear / Reset CRM Data Button (Available for Admin) */}
          {isAdmin && (
            leads.length > 0 ? (
              <button
                id="btn-kanban-clear-data"
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Zerar dados de teste para iniciar produção limpa para o cliente (Admin)"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Limpar Base</span>
              </button>
            ) : (
              <button
                id="btn-kanban-restore-demo"
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Restaurar dados de demonstração para testar (Admin)"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Restaurar Demo</span>
              </button>
            )
          )}

          <button
            id="btn-import-base"
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Importar lista de pacientes antigos ou sincronizar histórico do WhatsApp para reativação"
          >
            <Database className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Importar / Sincronizar Base</span>
          </button>

          <button
            id="btn-reactivate-campaign-top"
            onClick={() => setShowCampaignModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
            title="Disparar campanha de reativação para pacientes e contatos da base antiga"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Disparar Reativação ({baseLeads.length})</span>
          </button>

          <a
            href="/api/leads/export/csv"
            download
            className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-2 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Exportar base de leads em CSV / Excel"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </a>

          <button
            id="btn-add-lead-top"
            onClick={() => {
              setLeadToEdit(null);
              setTargetStageForNewLead(undefined);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Oportunidade</span>
          </button>
        </div>
      </div>

      {/* Dynamic Niche Funnel Switcher Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 mb-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            nicheFilter === 'restaurant'
              ? 'bg-amber-600 text-white'
              : nicheFilter === 'health'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-900 text-white'
          } shadow-2xs`}>
            {nicheFilter === 'restaurant' ? (
              <UtensilsCrossed className="w-5 h-5 text-amber-100" />
            ) : nicheFilter === 'health' ? (
              <Stethoscope className="w-5 h-5 text-blue-100" />
            ) : (
              <LayoutDashboard className="w-5 h-5 text-indigo-300" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Funil do CRM Ativo:
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                nicheFilter === 'restaurant'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : nicheFilter === 'health'
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-slate-100 text-slate-800 border-slate-200'
              }`}>
                {nicheFilter === 'restaurant'
                  ? 'Modo Gastronomia & Delivery'
                  : nicheFilter === 'health'
                  ? 'Modo Clínicas & Saúde'
                  : 'Modo Geral & Vendas B2B'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {nicheFilter === 'restaurant' && 'Colunas adaptadas para pedidos: Novo Pedido ➔ Na Cozinha ➔ Saiu p/ Entrega ➔ Chegando ➔ Entregue.'}
              {nicheFilter === 'health' && 'Colunas para clínicas & consultórios: 📂 Base Antiga (+6m) ➔ ⚡ Em Reativação (IA) ➔ 📥 Novo Paciente ➔ 💬 Avaliação ➔ 📅 Agendado ➔ 🩺 Tratamento ➔ 🌟 Alta ➔ 🔄 Retorno.'}
              {nicheFilter === 'all' && 'Colunas adaptadas para vendas B2B e serviços: Base Antiga ➔ Novo Lead ➔ Qualificação ➔ Proposta ➔ Fechado.'}
            </p>
          </div>
        </div>

        {/* 3 Niches Switcher Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200 self-start md:self-auto overflow-x-auto">
          <button
            onClick={() => setNicheFilter('restaurant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              nicheFilter === 'restaurant'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-amber-900 hover:bg-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>🍔 Restaurantes & Delivery ({restaurantLeadsCount})</span>
          </button>

          <button
            onClick={() => setNicheFilter('health')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              nicheFilter === 'health'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-blue-900 hover:bg-white'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>🏥 Clínicas & Saúde ({healthLeadsCount})</span>
          </button>

          <button
            onClick={() => setNicheFilter('all')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              nicheFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <span>💼 Vendas & Geral ({leads.length})</span>
          </button>

          {onNavigateToDelivery && (
            <button
              onClick={onNavigateToDelivery}
              className="ml-1 flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
            >
              <Bike className="w-3.5 h-3.5 text-indigo-600" />
              <span>Painel Motoboys ➔</span>
            </button>
          )}
        </div>
      </div>

      {/* Clinic & Health Specialized Reativação Banner */}
      {nicheFilter === 'health' && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-800/80 rounded-2xl p-4 mb-4 text-white shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 shrink-0">
              <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-blue-300" />
                  <span>Base Antiga & Reativação Ativa de Pacientes (Sofia IA)</span>
                </h4>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                  {healthBaseLeadsCount} na Base Antiga • {healthReactivationLeadsCount} em Reativação
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-1 max-w-2xl">
                Prontuários e pacientes sem retorno há mais de 6 meses (profilaxia preventiva, retoque de toxina/bioestimulador, continuidade de tratamentos/próteses e exames de rotina). A Sofia aborda com acolhimento e resgata horários na agenda!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              id="btn-health-campaign-launch"
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              title="Disparar campanha de reativação humanizada via WhatsApp para pacientes da base antiga"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Disparar Resgate de Pacientes ({healthBaseLeadsCount + healthReactivationLeadsCount})</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Importar lista de prontuários antigos do seu software odontológico/médico (CSV ou Excel)"
            >
              <Database className="w-3.5 h-3.5 text-blue-200" />
              <span>Importar Prontuários</span>
            </button>
          </div>
        </div>
      )}

      {/* Clean Production Banner when leads === 0 */}
      {leads.length === 0 && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">CRM 100% Zerado & Pronto para Receber Clientes Reais!</p>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                Assim que um cliente enviar mensagem no WhatsApp conectado, ele aparecerá automaticamente na coluna &quot;Novo Lead&quot;.
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
            >
              Restaurar Demonstração
            </button>
          )}
        </div>
      )}

      {/* Kanban Stages Columns */}
      <div className="flex-1 flex gap-4 overflow-x-auto pb-4 min-h-0 items-stretch" id="kanban-columns-container">
        {effectiveStages.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => getLeadStageIdForNiche(l) === stage.id);
          const stageTotalValue = stageLeads.reduce((acc, l) => acc + (l.value || 0), 0);

          return (
            <div
              key={stage.id}
              id={`kanban-col-${stage.id}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-80 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-xl flex flex-col overflow-hidden"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-white/90">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: stage.color }}
                  ></span>
                  <h3 className="text-xs font-bold text-slate-800 tracking-tight">
                    {stage.name}
                  </h3>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono border border-slate-200">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-emerald-700 font-mono font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      notation: 'compact',
                    }).format(stageTotalValue)}
                  </span>
                  <button
                    id={`btn-add-to-stage-${stage.id}`}
                    onClick={() => openNewLeadInStage(stage.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors ml-1 cursor-pointer"
                    title="Adicionar lead nesta etapa"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Special Column Action for Base Antiga and Reativação */}
              {(stage.id === 'stage-base' ||
                stage.id === 'stage-reativacao' ||
                stage.id === 'health-base' ||
                stage.id === 'health-reativacao' ||
                stage.name.toLowerCase().includes('base') ||
                stage.name.toLowerCase().includes('reativação') ||
                stage.name.toLowerCase().includes('reativacao')) && (
                <div className="px-3 py-1.5 bg-indigo-50/90 border-b border-indigo-100 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-indigo-700">
                    {stageLeads.length} {stage.id.includes('reativacao') ? 'em reativação' : 'pacientes na base'}
                  </span>
                  <button
                    onClick={() => setShowCampaignModal(true)}
                    className="flex items-center gap-1 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs transition-colors cursor-pointer"
                    title="Disparar mensagens de reativação para contatos da base antiga"
                  >
                    <Send className="w-2.5 h-2.5" />
                    <span>Disparar Campanha</span>
                  </button>
                </div>
              )}

              {/* Cards Container */}
              <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5 min-h-[150px]">
                {stageLeads.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-300/80 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs text-center p-4">
                    <span>Nenhum lead nesta etapa</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      Arraste um card para cá
                    </span>
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      id={`lead-card-${lead.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className={`p-3 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group relative ${
                        lead.isHotLead
                          ? 'bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 border-2 border-amber-400 shadow-amber-100/90 ring-2 ring-amber-400/40'
                          : lead.isUrgent
                          ? 'bg-white border border-rose-300 ring-1 ring-rose-200'
                          : 'bg-white hover:border-slate-300 border border-slate-200/90'
                      }`}
                    >
                      {/* Top row: Name & Value */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {lead.isUrgent && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                          )}
                          {lead.isHotLead && (
                            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0 animate-pulse" />
                          )}
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-slate-700 transition-colors">
                            {lead.name}
                          </h4>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 font-mono shrink-0">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(lead.value || 0)}
                        </span>
                      </div>

                      {/* Hot Lead / Closing Request Banner */}
                      {lead.isHotLead && (
                        <div className="flex items-center justify-between gap-1.5 p-1.5 mb-2 bg-gradient-to-r from-amber-100/95 to-orange-100/95 border border-amber-300 rounded text-[10px] text-amber-950 font-bold shadow-2xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0 animate-pulse" />
                            <div className="truncate">
                              <span className="uppercase tracking-tight text-amber-900 font-extrabold mr-1">Fechamento:</span>
                              <span className="font-medium text-amber-800">{lead.hotReason || 'Pedido de PIX / Compra'}</span>
                            </div>
                          </div>
                          {onToggleHotLead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleHotLead(lead.id);
                              }}
                              className="text-[9px] bg-amber-200/90 hover:bg-amber-300 text-amber-950 font-semibold px-1.5 py-0.5 rounded transition-colors cursor-pointer shrink-0"
                              title="Concluir / Desmarcar alerta de fechamento"
                            >
                              Concluir
                            </button>
                          )}
                        </div>
                      )}

                      {/* Urgent banner if flagged by AI */}
                      {lead.isUrgent && (
                        <div className="flex items-center justify-between gap-1.5 p-1.5 mb-2 bg-rose-50 border border-rose-200 rounded text-[10px] text-rose-800">
                          <div className="flex items-center gap-1 min-w-0">
                            <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                            <span className="font-bold truncate">{lead.urgencyReason || 'Urgência reportada'}</span>
                          </div>
                          {onResolveUrgency && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onResolveUrgency(lead.id);
                              }}
                              className="text-[9px] bg-rose-200/80 hover:bg-rose-300 text-rose-900 font-semibold px-1.5 py-0.5 rounded transition-colors cursor-pointer shrink-0"
                              title="Marcar urgência como atendida"
                            >
                              Resolver
                            </button>
                          )}
                        </div>
                      )}

                      {/* Phone, Channel Origin & Arrival Timestamp */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                        <div className="flex items-center gap-1.5 font-mono">
                          {lead.tags?.includes('Google Calendar') || lead.scheduledDate ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-700 bg-blue-100/90 px-1.5 py-0.5 rounded border border-blue-200" title="Origem: Agendamento">
                              <Calendar className="w-2.5 h-2.5 text-blue-600" />
                              <span>Agenda</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-200" title="Origem: WhatsApp">
                              <Phone className="w-2.5 h-2.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </span>
                          )}
                          <span className="truncate max-w-[130px] text-slate-600">{lead.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[9.5px] text-slate-500 font-medium shrink-0 bg-slate-100/80 px-1.5 py-0.5 rounded" title={`Data e Hora do contato: ${new Date(lead.createdAt || lead.lastInteraction).toLocaleString('pt-BR')}`}>
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
                          <span>
                            {new Date(lead.lastInteraction || lead.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {new Date(lead.lastInteraction || lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Pre-Appointment Triage Card */}
                      {lead.triage && (
                        <div className="p-1.5 mb-2 bg-indigo-50/70 border border-indigo-200/80 rounded text-[10px] text-indigo-900 space-y-0.5">
                          <div className="flex items-center justify-between font-bold">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5 text-indigo-600" />
                              <span>{lead.triage.procedure || 'Triagem Agendamento'}</span>
                            </span>
                            <span className={`text-[9px] px-1 rounded font-semibold ${lead.triage.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {lead.triage.status === 'confirmed' ? 'Confirmado' : 'A Confirmar'}
                            </span>
                          </div>
                          {(lead.triage.preferredPeriod || lead.triage.preferredDays) && (
                            <div className="flex items-center gap-1 text-[10px] text-indigo-700">
                              <Clock className="w-2.5 h-2.5 text-indigo-500" />
                              <span>{lead.triage.preferredPeriod ? `Período ${lead.triage.preferredPeriod}` : ''} {lead.triage.preferredDays ? `(${lead.triage.preferredDays})` : ''}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pedido de Delivery Badge (Restaurantes & Comércio) */}
                      {lead.deliveryInfo ? (
                        <div className="p-2 mb-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg text-[10px] text-amber-900 flex items-center justify-between font-bold shadow-2xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <Bike className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate font-mono">
                              #{lead.deliveryInfo.orderNumber} • {
                                lead.deliveryInfo.status === 'preparing' ? '🍳 Na Cozinha' :
                                lead.deliveryInfo.status === 'dispatched' ? '🛵 Em Rota' :
                                lead.deliveryInfo.status === 'arriving' ? '⏱️ Chegando (5min)' :
                                '✅ Entregue'
                              }
                            </span>
                          </div>
                          {onNavigateToDelivery && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToDelivery();
                              }}
                              className="text-[9px] bg-amber-600 hover:bg-amber-700 text-white px-2 py-0.5 rounded font-bold shrink-0 cursor-pointer shadow-2xs transition-colors"
                              title="Acompanhar no Kanban de Pedidos & Motoboys"
                            >
                              Ver Pedido ➔
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Scheduled Appointment Date/Time Badge in Kanban (Clínicas e Consultas) */
                        (lead.scheduledDate || lead.tags?.includes('📅 Agendado')) && (
                          <div className="p-1.5 mb-2 bg-blue-50/90 border border-blue-200 rounded text-[10px] text-blue-900 flex items-center justify-between font-semibold shadow-2xs">
                            <div className="flex items-center gap-1.5 truncate">
                              <Calendar className="w-3 h-3 text-blue-600 shrink-0" />
                              <span className="truncate">
                                {lead.scheduledDate
                                  ? new Date(lead.scheduledDate).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) + ' às ' + (lead.scheduledTime || new Date(lead.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
                                  : 'Consulta Agendada'}
                              </span>
                            </div>
                            <span className="text-[9px] bg-blue-200/80 text-blue-950 px-1 py-0.5 rounded font-bold shrink-0">
                              Agenda
                            </span>
                          </div>
                        )
                      )}

                      {/* Base Antiga & Inativos (+6 Meses) */}
                      {(lead.stageId === 'stage-base' ||
                        lead.stageId === 'health-base' ||
                        lead.tags?.some(
                          (t) => t.toLowerCase().includes('base antiga') || t.toLowerCase().includes('sem consulta')
                        )) && (
                        <div className="p-2 mb-2 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-200/90 rounded-lg text-[10px] text-indigo-950 flex items-center justify-between font-bold shadow-2xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">
                              📂 Base Antiga (+6m sem retorno)
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowCampaignModal(true);
                            }}
                            className="text-[9px] bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white px-2 py-0.5 rounded font-bold shrink-0 cursor-pointer shadow-2xs transition-colors"
                            title="Disparar mensagem personalizada de reativação"
                          >
                            ⚡ Reativar
                          </button>
                        </div>
                      )}

                      {/* Em Reativação Ativa */}
                      {(lead.stageId === 'stage-reativacao' ||
                        lead.stageId === 'health-reativacao' ||
                        lead.tags?.some(
                          (t) =>
                            t.toLowerCase().includes('em reativação') ||
                            t.toLowerCase().includes('reativação disparada') ||
                            t.toLowerCase().includes('reativacao')
                        )) && (
                        <div className="p-2 mb-2 bg-gradient-to-r from-pink-50/90 to-rose-50/90 border border-pink-200 rounded-lg text-[10px] text-pink-950 flex items-center justify-between font-bold shadow-2xs">
                          <div className="flex items-center gap-1.5 truncate">
                            <Send className="w-3.5 h-3.5 text-pink-600 shrink-0 animate-pulse" />
                            <span className="truncate">
                              ⚡ Em Reativação Ativa (IA Sofia)
                            </span>
                          </div>
                          <span className="text-[9px] bg-pink-100 text-pink-800 border border-pink-300 px-1.5 py-0.5 rounded font-extrabold shrink-0">
                            Aguardando
                          </span>
                        </div>
                      )}

                      {lead.interest && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-150 mb-2">
                          {lead.interest}
                        </p>
                      )}

                      {/* Tags */}
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {lead.tags.slice(0, 4).map((tag, idx) => {
                            const isHot = tag.toLowerCase().includes('quente') || tag.toLowerCase().includes('urgente');
                            return (
                              <span
                                key={idx}
                                className={`text-[10px] px-1.5 py-0.2 rounded font-medium inline-flex items-center gap-1 ${
                                  isHot
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                #{tag}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Bottom Footer: AI status & Action triggers */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                        {/* AI Status Badge with 1-click toggle */}
                        <button
                          onClick={() => onToggleAi(lead.id)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border cursor-pointer transition-colors ${
                            lead.aiPaused
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title={
                            lead.aiPaused
                              ? 'Atendimento Humano Ativo. Clique para reativar IA.'
                              : 'IA Ativa no WhatsApp. Clique para pausar e assumir atendimento.'
                          }
                        >
                          {lead.aiPaused ? (
                            <>
                              <UserCheck className="w-2.5 h-2.5 text-amber-700" />
                              <span>Humano</span>
                            </>
                          ) : (
                            <>
                              <Bot className="w-2.5 h-2.5 text-emerald-700" />
                              <span>IA Ativa</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          {/* Hot Lead manual toggle */}
                          {onToggleHotLead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleHotLead(lead.id);
                              }}
                              className={`p-1 rounded transition-colors cursor-pointer ${
                                lead.isHotLead
                                  ? 'text-amber-600 hover:text-amber-700 bg-amber-100 hover:bg-amber-200'
                                  : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              }`}
                              title={lead.isHotLead ? 'Lead Quente ativo. Clique para desmarcar.' : 'Marcar como Lead Quente / Pedido de Fechamento'}
                            >
                              <Flame className={`w-3.5 h-3.5 ${lead.isHotLead ? 'fill-amber-500' : ''}`} />
                            </button>
                          )}

                          <button
                            onClick={() => openEditLead(lead)}
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Editar Oportunidade"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setLeadToDelete({ id: lead.id, name: lead.name });
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir Oportunidade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenChat(lead.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-semibold transition-all cursor-pointer"
                            title="Abrir Central de Chat do WhatsApp"
                          >
                            <MessageSquare className="w-3 h-3 text-slate-600" />
                            <span>Chat</span>
                          </button>

                          {/* Quick stage selector */}
                          <select
                            value={lead.stageId}
                            onChange={(e) => onMoveLead(lead.id, e.target.value)}
                            className="text-[10px] bg-white border border-slate-200 text-slate-700 rounded px-1.5 py-1 focus:outline-hidden"
                            title="Mover de etapa rapidamente"
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmação de Exclusão de Lead */}
      {leadToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-slate-200">
            <div className="w-11 h-11 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 text-center">
              Excluir Lead Permanentemente?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-1.5 leading-relaxed">
              Tem certeza que deseja excluir o lead <strong className="text-slate-900 font-semibold">"{leadToDelete.name}"</strong>? O histórico de mensagens e dados serão removidos.
            </p>
            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteLead(leadToDelete.id);
                  setLeadToDelete(null);
                }}
                className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Lead Modal */}
      <NewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          onSaveLead(data, leadToEdit ? leadToEdit.id : undefined);
        }}
        stages={stages}
        initialStageId={targetStageForNewLead}
        leadToEdit={leadToEdit}
      />

      {/* Reset / Clean CRM Data Modal */}
      <ResetDataModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        totalLeads={leads.length}
        onClearAll={async () => {
          if (onClearAllLeads) await onClearAllLeads();
        }}
        onRestoreDemo={async () => {
          if (onRestoreDemoLeads) await onRestoreDemoLeads();
        }}
      />

      {/* Import & WhatsApp Contacts Sync Modal */}
      <ImportLeadsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        stages={stages}
        evolutionConfig={evolutionConfig}
        onImportSuccess={async () => {
          if (onRefreshLeads) await onRefreshLeads();
        }}
      />

      {/* Bulk Reactivation Campaign Modal */}
      <ReactivationCampaignModal
        isOpen={showCampaignModal}
        onClose={() => setShowCampaignModal(false)}
        baseLeads={baseLeads}
        onLeadsUpdated={async () => {
          if (onRefreshLeads) await onRefreshLeads();
        }}
      />
    </div>
  );
};
