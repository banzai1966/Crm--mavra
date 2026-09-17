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
  Download
} from 'lucide-react';
import { Lead, KanbanStage } from '../types';
import { NewLeadModal } from './NewLeadModal';
import { ResetDataModal } from './ResetDataModal';

interface KanbanBoardProps {
  stages: KanbanStage[];
  leads: Lead[];
  onMoveLead: (leadId: string, targetStageId: string) => void;
  onSaveLead: (leadData: Partial<Lead>, leadId?: string) => void;
  onDeleteLead: (leadId: string) => void;
  onOpenChat: (leadId: string) => void;
  onToggleAi: (leadId: string) => void;
  onResolveUrgency?: (leadId: string) => void;
  onClearAllLeads?: () => Promise<void> | void;
  onRestoreDemoLeads?: () => Promise<void> | void;
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
  onClearAllLeads,
  onRestoreDemoLeads,
  isAdmin = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgentOnly, setFilterUrgentOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [targetStageForNewLead, setTargetStageForNewLead] = useState<string | undefined>();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Filter leads based on search term & urgency toggle
  const filteredLeads = leads.filter((lead) => {
    if (filterUrgentOnly && !lead.isUrgent) return false;
    const term = searchTerm.toLowerCase();
    return (
      lead.name.toLowerCase().includes(term) ||
      lead.phone.includes(term) ||
      (lead.interest && lead.interest.toLowerCase().includes(term)) ||
      lead.tags.some((t) => t.toLowerCase().includes(term)) ||
      (lead.triage?.procedure && lead.triage.procedure.toLowerCase().includes(term))
    );
  });

  const totalValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const urgentCount = leads.filter((l) => l.isUrgent).length;
  const triageCount = leads.filter((l) => Boolean(l.triage)).length;

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      onMoveLead(leadId, stageId);
    }
    setDraggedLeadId(null);
  };

  const openNewLeadInStage = (stageId: string) => {
    setLeadToEdit(null);
    setTargetStageForNewLead(stageId);
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
            onClick={() => setFilterUrgentOnly(!filterUrgentOnly)}
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
        {stages.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stageId === stage.id);
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
                      className="bg-white hover:border-slate-300 border border-slate-200/90 p-3 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group relative"
                    >
                      {/* Top row: Name & Value */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {lead.isUrgent && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
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

                      {/* Phone & interest */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-2 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{lead.phone}</span>
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

                      {lead.interest && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 bg-slate-50 p-2 rounded border border-slate-150 mb-2">
                          {lead.interest}
                        </p>
                      )}

                      {/* Tags */}
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {lead.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200"
                            >
                              #{tag}
                            </span>
                          ))}
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
                              if (window.confirm(`Deseja excluir permanentemente o lead "${lead.name}"?`)) {
                                onDeleteLead(lead.id);
                              }
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
    </div>
  );
};
