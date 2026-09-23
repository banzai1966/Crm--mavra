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
  MessageSquare,
  FileText,
  Mic,
  Image as ImageIcon,
  AlertTriangle,
  Calendar,
  Zap,
  CalendarCheck,
  Trash2,
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
  onResolveUrgency?: (leadId: string) => void;
  onConfirmTriage?: (leadId: string, dateStr: string) => Promise<void>;
  onDeleteLead?: (leadId: string) => void;
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
  onResolveUrgency,
  onConfirmTriage,
  onDeleteLead,
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

                {/* Delete lead button */}
                {onDeleteLead && activeLead && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Deseja excluir permanentemente o lead "${activeLead.name}" e todas as suas mensagens?`
                        )
                      ) {
                        onDeleteLead(activeLead.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Excluir este Lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

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
                              {msg.modelUsed && (
                                <span
                                  className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded ml-1 ${
                                    msg.modelUsed.includes('fallback') || msg.modelUsed.includes('offline') || msg.modelUsed.includes('rules')
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  }`}
                                  title={`Processado por: ${msg.providerUsed || 'IA'} (${msg.modelUsed})`}
                                >
                                  {msg.modelUsed.includes('fallback') || msg.modelUsed.includes('offline') || msg.modelUsed.includes('rules')
                                    ? '🛡️ Modo Contingência'
                                    : `⚡ ${msg.modelUsed}`}
                                </span>
                              )}
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
                        {msg.text.startsWith('📄 [Documento') ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 p-2 bg-slate-100/90 rounded-lg text-slate-800 border border-slate-200">
                              <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span className="font-semibold text-xs truncate">
                                {msg.text.split(']:')[0].replace('📄 [', '').replace(']', '')}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">
                              {msg.text.includes(']:') ? msg.text.split(']:')[1]?.trim() : msg.text}
                            </p>
                          </div>
                        ) : msg.text.startsWith('🎙️ [Áudio') || msg.text.startsWith('🎤 [Áudio') ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 p-2 bg-purple-50/90 rounded-lg text-purple-900 border border-purple-200">
                              <Mic className="w-4 h-4 text-purple-700 shrink-0" />
                              <div className="flex-1 flex items-center gap-0.5">
                                <span className="h-2 w-0.5 bg-purple-500 rounded-full"></span>
                                <span className="h-3 w-0.5 bg-purple-600 rounded-full"></span>
                                <span className="h-4 w-0.5 bg-purple-700 rounded-full"></span>
                                <span className="h-2 w-0.5 bg-purple-500 rounded-full"></span>
                                <span className="h-3.5 w-0.5 bg-purple-600 rounded-full"></span>
                                <span className="h-2 w-0.5 bg-purple-400 rounded-full"></span>
                              </div>
                              <span className="text-[10px] font-bold text-purple-800">
                                {msg.text.startsWith('🎙️') ? 'Voz Sofia Enviada' : 'Áudio Recebido'}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap italic">
                              {msg.text.replace(/^[🎙️🎤]\s*\[[^\]]+\]:\s*/, '')}
                            </p>
                          </div>
                        ) : msg.text.startsWith('📷 [Foto') ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 p-2 bg-amber-50/90 rounded-lg text-amber-900 border border-amber-200">
                              <ImageIcon className="w-4 h-4 text-amber-700 shrink-0" />
                              <span className="text-xs font-semibold">Foto / Imagem WhatsApp</span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">
                              {msg.text.replace(/^📷\s*\[[^\]]+\]:\s*/, '')}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                        )}

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

              {/* Input Bar with Quick Snippets */}
              <div className="bg-white border-t border-slate-200 flex flex-col shrink-0 shadow-xs">
                {/* Urgent Banner in Active Chat */}
                {activeLead.isUrgent && (
                  <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between gap-2 text-xs text-rose-900">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                      <div>
                        <span className="font-bold">Atenção Prioritária: </span>
                        <span>{activeLead.urgencyReason || 'Paciente reportou dor ou situação urgente'}</span>
                      </div>
                    </div>
                    {onResolveUrgency && (
                      <button
                        type="button"
                        onClick={() => onResolveUrgency(activeLead.id)}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                      >
                        Marcar como Atendido
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Snippets for Human Agent */}
                <div className="px-3 pt-2 pb-1 flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 text-[11px]">
                  <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 text-[10px]">
                    <Zap className="w-3 h-3 text-amber-500" /> Respostas Rápidas:
                  </span>
                  <button
                    type="button"
                    onClick={() => setInputText(`Olá, ${activeLead.name.split(' ')[0]}! Tudo bem? Como posso te ajudar hoje?`)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    👋 Saudação
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(`Para realizarmos seu agendamento, qual período fica mais confortável para você: manhã (09h-12h) ou tarde (14h-18h)?`)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    🗓️ Opções de Horário
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(`Olá, ${activeLead.name.split(' ')[0]}! Sou a secretária da clínica. Vi que você conversou com nossa assistente virtual. Vamos confirmar o seu melhor horário agora?`)}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    👩‍💼 Assumir Atendimento (Secretária)
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(`Confirmamos o recebimento e já reservamos o seu horário na grade! Em caso de dúvidas, estamos por aqui.`)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    ✅ Confirmar Horário
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(`Segue a nossa chave PIX oficial para ativação imediata: contato@mavra.com.br (E-mail). Assim que efetuar, nos envie o comprovante por aqui!`)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    💰 Chave PIX
                  </button>
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="p-3 md:p-3.5 flex flex-col gap-2"
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
              </div>
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

          {/* Urgency Alert if marked */}
          {activeLead.isUrgent && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>Urgência / Dor Reportada</span>
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed bg-white/70 p-2 rounded border border-rose-150">
                {activeLead.urgencyReason || 'Paciente necessita de atenção prioritária ou encaixe.'}
              </p>
              {onResolveUrgency && (
                <button
                  type="button"
                  onClick={() => onResolveUrgency(activeLead.id)}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  Resolver e Remover Alerta
                </button>
              )}
            </div>
          )}

          {/* Pre-Appointment Triage Card */}
          {activeLead.triage && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Triagem do Agendamento
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${activeLead.triage.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {activeLead.triage.status === 'confirmed' ? 'Confirmado' : 'A Confirmar'}
                </span>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 space-y-2 text-xs text-indigo-950">
                <div>
                  <span className="text-[10px] text-indigo-700 block font-semibold">Procedimento / Consulta</span>
                  <span className="font-bold text-indigo-950">{activeLead.triage.procedure || 'Consulta Geral'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-indigo-700 block font-semibold">Período Preferido</span>
                    <span className="font-medium capitalize">{activeLead.triage.preferredPeriod || 'A definir'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-700 block font-semibold">Dias Preferidos</span>
                    <span className="font-medium">{activeLead.triage.preferredDays || 'Flexível'}</span>
                  </div>
                </div>

                {activeLead.triage.paymentType && (
                  <div className="text-[11px]">
                    <span className="text-[10px] text-indigo-700 block font-semibold">Tipo de Pagamento</span>
                    <span className="font-medium capitalize">
                      {activeLead.triage.paymentType} {activeLead.triage.convenioName ? `(${activeLead.triage.convenioName})` : ''}
                    </span>
                  </div>
                )}

                {onConfirmTriage && activeLead.triage.status !== 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => {
                      const datePrompt = window.prompt(
                        'Informe a data e horário confirmado para enviar ao paciente no WhatsApp:',
                        'Quinta-feira às 10:30'
                      );
                      if (datePrompt) {
                        onConfirmTriage(activeLead.id, datePrompt);
                      }
                    }}
                    className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Confirmar e Disparar no WhatsApp</span>
                  </button>
                )}
              </div>
            </div>
          )}
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
