import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Bot,
  UserCheck,
  Search,
  Phone,
  Mail,
  DollarSign,
  Tag,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  CheckCheck,
  Check,
  PanelRightClose,
  PanelRightOpen,
  MessageSquare
} from 'lucide-react';
import { Lead, ChatMessage, KanbanStage } from '../types';

interface LiveChatProps {
  leads: Lead[];
  selectedLeadId: string | null;
  onSelectLead: (leadId: string) => void;
  stages: KanbanStage[];
  onMoveLead: (leadId: string, stageId: string) => void;
  onToggleAi: (leadId: string) => void;
  onSendManualMessage: (leadId: string, text: string, sendViaWhatsApp: boolean) => Promise<void>;
  onUpdateLeadNotes: (leadId: string, notes: string) => void;
}

export const LiveChat: React.FC<LiveChatProps> = ({
  leads,
  selectedLeadId,
  onSelectLead,
  stages,
  onMoveLead,
  onToggleAi,
  onSendManualMessage,
  onUpdateLeadNotes,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
  const [showDetails, setShowDetails] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages for selected lead
  const fetchMessages = async (leadId: string) => {
    try {
      setIsLoadingMessages(true);
      const res = await fetch(`/api/chat/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Falha ao carregar mensagens:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (activeLead) {
      fetchMessages(activeLead.id);
    }
  }, [activeLead?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Periodic polling for live chat updates
  useEffect(() => {
    if (!activeLead) return;
    const interval = setInterval(() => {
      fetch(`/api/chat/${activeLead.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMessages((prev) => (prev.length !== data.length ? data : prev));
          }
        })
        .catch(() => {});
    }, 3000);

    return () => clearInterval(interval);
  }, [activeLead?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeLead || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await onSendManualMessage(activeLead.id, text, sendViaWhatsApp);
      await fetchMessages(activeLead.id);
    } finally {
      setIsSending(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    const term = searchTerm.toLowerCase();
    return (
      l.name.toLowerCase().includes(term) ||
      l.phone.includes(term) ||
      l.tags.some((t) => t.toLowerCase().includes(term))
    );
  });

  const activeStage = stages.find((s) => s.id === activeLead?.stageId);

  return (
    <div className="flex-1 flex min-h-0 bg-slate-100 overflow-hidden" id="live-chat-module">
      {/* 1. LEFT SIDEBAR: Conversation List */}
      <div className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
        {/* Search header */}
        <div className="p-3 border-b border-slate-200 bg-slate-50/70">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="chat-search-input"
              type="text"
              placeholder="Buscar conversas no WhatsApp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* Leads conversation list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredLeads.map((lead) => {
            const isSelected = activeLead?.id === lead.id;
            const stage = stages.find((s) => s.id === lead.stageId);

            return (
              <button
                key={lead.id}
                id={`chat-item-${lead.id}`}
                onClick={() => onSelectLead(lead.id)}
                className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-100/90 border-l-4 border-slate-900'
                    : 'hover:bg-slate-50'
                }`}
              >
                {/* Avatar circle */}
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0 border border-slate-200">
                  {lead.name.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{lead.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(lead.lastInteraction).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mb-1.5 truncate">
                    <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    <span>{lead.phone}</span>
                  </div>

                  <div className="flex items-center justify-between gap-1">
                    {/* Stage badge */}
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-semibold truncate max-w-[140px]"
                      style={{
                        backgroundColor: `${stage?.color}15`,
                        color: stage?.color,
                        border: `1px solid ${stage?.color}35`,
                      }}
                    >
                      {stage?.name || 'Novo Lead'}
                    </span>

                    {/* AI status pill */}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1 shrink-0 border ${
                        lead.aiPaused
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {lead.aiPaused ? (
                        <>
                          <UserCheck className="w-2.5 h-2.5 text-amber-700" />
                          <span>Humano</span>
                        </>
                      ) : (
                        <>
                          <Bot className="w-2.5 h-2.5 text-emerald-700" />
                          <span>IA</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN CHAT AREA (WhatsApp Web Style) */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {activeLead ? (
          <>
            {/* Chat Room Top Bar */}
            <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between gap-3 shrink-0 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {activeLead.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {activeLead.name}
                    </h3>
                    <span
                      className="text-[10px] px-2 py-0.2 rounded font-medium shrink-0"
                      style={{
                        backgroundColor: `${activeStage?.color}15`,
                        color: activeStage?.color,
                        border: `1px solid ${activeStage?.color}35`,
                      }}
                    >
                      {activeStage?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>{activeLead.phone}</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">Evolution API v2</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Pause/Resume AI & Stage Change */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Takeover toggle */}
                <button
                  id="btn-toggle-ai-takeover"
                  onClick={() => onToggleAi(activeLead.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer border ${
                    activeLead.aiPaused
                      ? 'bg-amber-500 hover:bg-amber-400 text-white border-amber-600'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-700'
                  }`}
                  title={
                    activeLead.aiPaused
                      ? 'Atendimento Humano está ativo. Clique para reativar a IA.'
                      : 'IA está respondendo automaticamente. Clique para assumir o atendimento humano.'
                  }
                >
                  {activeLead.aiPaused ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Atendimento Humano (IA Pausada)</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      <span>Assumir Atendimento (Pausar IA)</span>
                    </>
                  )}
                </button>

                {/* Toggle details drawer */}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  title="Ver Detalhes do Lead"
                >
                  {showDetails ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRightOpen className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div
              className="flex-1 p-4 md:p-6 overflow-y-auto space-y-3 bg-[#f0f2f5]"
              id="chat-messages-thread"
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Carregando mensagens do WhatsApp...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-400" />
                  <p className="text-xs">Nenhuma mensagem registrada ainda para este lead.</p>
                  <p className="text-[11px] text-slate-400">
                    Envie uma mensagem abaixo ou use o Simulador do WhatsApp.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isLead = msg.sender === 'lead';
                  const isAi = msg.sender === 'ai';
                  const isAgent = msg.sender === 'agent';
                  const isSystem = msg.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="bg-white text-slate-600 text-[11px] px-3 py-1 rounded-full border border-slate-200 font-mono shadow-2xs">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isLead ? 'justify-start' : 'justify-end'} group`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 shadow-xs relative ${
                          isLead
                            ? 'bg-white text-slate-900 rounded-tl-xs border border-slate-200'
                            : isAi
                            ? 'bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-[#c4e8bd]'
                            : 'bg-slate-900 text-white rounded-tr-xs'
                        }`}
                      >
                        {/* Sender header badge */}
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold">
                          {isLead && (
                            <span className="text-slate-500">
                              {activeLead.name} (Cliente)
                            </span>
                          )}
                          {isAi && (
                            <span className="flex items-center gap-1 text-emerald-800">
                              <Sparkles className="w-3 h-3 text-emerald-700" />
                              <span>Sofia (IA Autônoma MAVRA)</span>
                            </span>
                          )}
                          {isAgent && (
                            <span className="flex items-center gap-1 text-slate-300">
                              <UserCheck className="w-3 h-3 text-slate-300" />
                              <span>Atendente Humano</span>
                            </span>
                          )}
                        </div>

                        {/* Message text */}
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>

                        {/* Stage trigger tag if AI moved the lead */}
                        {msg.stageTriggered && (
                          <div className="mt-2 pt-1.5 border-t border-emerald-300/60 text-[10px] text-emerald-900 flex items-center gap-1 font-mono">
                            <ArrowRightLeft className="w-3 h-3" />
                            <span>
                              Movido para:{' '}
                              {stages.find((s) => s.id === msg.stageTriggered)?.name ||
                                msg.stageTriggered}
                            </span>
                          </div>
                        )}

                        {/* Timestamp and delivery status */}
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-mono ${
                            isLead ? 'text-slate-400' : isAi ? 'text-emerald-800/80' : 'text-slate-400'
                          }`}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {!isLead && (
                            <CheckCheck className="w-3 h-3 text-current ml-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 md:p-3.5 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0 shadow-xs"
            >
              <div className="flex items-center justify-between text-xs px-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={sendViaWhatsApp}
                    onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                    className="rounded bg-white border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
                  />
                  <span>Disparar mensagem no WhatsApp do lead via Evolution API</span>
                </label>

                {activeLead.aiPaused ? (
                  <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Atendimento Humano Ativo
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    IA responderá mensagens recebidas
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="chat-input-message"
                  type="text"
                  placeholder={`Responder como atendente humano para ${activeLead.name}...`}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  id="btn-send-chat"
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
                  title="Enviar mensagem"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Selecione uma conversa ao lado para visualizar o atendimento.
          </div>
        )}
      </div>

      {/* 3. RIGHT DRAWER: Lead Details & Quick CRM Controls */}
      {showDetails && activeLead && (
        <div className="w-80 border-l border-slate-200 bg-white p-4 overflow-y-auto flex flex-col gap-4 shrink-0">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Detalhes da Oportunidade
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
              <div>
                <span className="text-[11px] text-slate-400 block">Lead / Empresa</span>
                <span className="text-xs font-bold text-slate-900">{activeLead.name}</span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">WhatsApp</span>
                <span className="text-xs font-mono text-slate-900 font-semibold">
                  {activeLead.phone}
                </span>
              </div>

              {activeLead.email && (
                <div>
                  <span className="text-[11px] text-slate-400 block">E-mail</span>
                  <span className="text-xs text-slate-700">{activeLead.email}</span>
                </div>
              )}

              <div>
                <span className="text-[11px] text-slate-400 block">Valor Estimado</span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(activeLead.value || 0)}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">
                  Estágio no Funil
                </span>
                <select
                  value={activeLead.stageId}
                  onChange={(e) => onMoveLead(activeLead.id, e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs focus:outline-hidden"
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

          {/* Tags */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Tags do Lead
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeLead.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Anotações Internas
            </h3>
            <textarea
              rows={6}
              value={activeLead.notes || ''}
              onChange={(e) => onUpdateLeadNotes(activeLead.id, e.target.value)}
              placeholder="Adicione observações sobre a negociação..."
              className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
};
