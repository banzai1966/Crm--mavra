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
  ArrowLeft,
  X,
  Info,
  Paperclip,
  Smile,
  FileUp,
  Square,
  Play,
  Pause,
  Download,
  ExternalLink,
  ChevronUp,
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
  personaName?: string;
}

const COMMON_EMOJIS = [
  '👋', '😊', '👍', '🙏', '💙', '✨',
  '🩺', '💊', '🏥', '🦷', '📅', '🕒',
  '📍', '💰', '💳', '📝', '📞', '🤝',
  '✅', '⭐', '❤️', '🙌', '🔔', '💬',
];

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
  personaName = 'Sofia',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sendViaWhatsApp, setSendViaWhatsApp] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Attachment & Emoji state
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Media upload preview modal state
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean;
    type: 'pdf' | 'image';
    fileName: string;
    fileBase64: string;
    caption: string;
  }>({
    isOpen: false,
    type: 'image',
    fileName: '',
    fileBase64: '',
    caption: '',
  });

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const fileInputPdfRef = useRef<HTMLInputElement>(null);
  const fileInputImageRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Handle standard text message sending
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeLead || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setShowEmojiPicker(false);
    setShowAttachMenu(false);
    setShowQuickReplies(false);
    setIsSending(true);

    try {
      await onSendManualMessage(activeLead.id, text, sendViaWhatsApp);
      await fetchMessages(activeLead.id);
    } finally {
      setIsSending(false);
    }
  };

  // Handle File Input selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setMediaModal({
        isOpen: true,
        type,
        fileName: file.name,
        fileBase64: base64,
        caption: '',
      });
      setShowAttachMenu(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send selected PDF / Image
  const handleSendMediaModal = async () => {
    if (!activeLead || !mediaModal.fileBase64 || isSending) return;
    setIsSending(true);

    try {
      const res = await fetch('/api/chat/send-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: activeLead.id,
          mediaType: mediaModal.type,
          data: mediaModal.fileBase64,
          fileName: mediaModal.fileName,
          caption: mediaModal.caption,
          sendViaWhatsApp,
        }),
      });

      if (res.ok) {
        setMediaModal({ isOpen: false, type: 'image', fileName: '', fileBase64: '', caption: '' });
        await fetchMessages(activeLead.id);
      }
    } catch (err) {
      console.error('Erro ao enviar mídia:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Quick PDF Preset sender (e.g., Tabela de Procedimentos)
  const handleSendPresetPdf = async () => {
    if (!activeLead || isSending) return;
    setIsSending(true);
    setShowAttachMenu(false);

    try {
      const res = await fetch('/api/chat/send-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: activeLead.id,
          mediaType: 'pdf',
          data: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          fileName: 'Tabela_de_Procedimentos_Dra_Lucy_Murata.pdf',
          caption: 'Segue em anexo a nossa Tabela de Procedimentos e Orientações Oficiais da Clínica.',
          sendViaWhatsApp,
        }),
      });
      if (res.ok) {
        await fetchMessages(activeLead.id);
      }
    } catch (err) {
      console.error('Erro ao enviar PDF:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Start Real Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length === 0) return;

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          if (activeLead && base64Audio) {
            setIsSending(true);
            try {
              await fetch('/api/chat/send-media', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  leadId: activeLead.id,
                  mediaType: 'audio',
                  data: base64Audio,
                  caption: `Áudio de voz (${recordingSeconds}s)`,
                  sendViaWhatsApp,
                }),
              });
              await fetchMessages(activeLead.id);
            } catch (err) {
              console.error('Erro ao enviar áudio:', err);
            } finally {
              setIsSending(false);
            }
          }
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Não foi possível acessar o microfone:', err);
      alert('Permissão de microfone negada ou indisponível no navegador.');
    }
  };

  // Stop and send audio recording
  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingTimerRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Cancel audio recording without sending
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(recordingTimerRef.current);
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  };

  // Toggle Audio Playback in Chat Bubbles
  const handleToggleAudioPlay = (msgId: string, audioUrl?: string) => {
    if (playingAudioId === msgId) {
      audioPlayerRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioUrl) {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio(audioUrl);
        } else {
          audioPlayerRef.current.src = audioUrl;
        }
        audioPlayerRef.current.play();
        setPlayingAudioId(msgId);
        audioPlayerRef.current.onended = () => {
          setPlayingAudioId(null);
        };
      }
    }
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    inputRef.current?.focus();
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
    <div className="flex-1 flex min-h-0 bg-slate-100 overflow-hidden relative" id="live-chat-module">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputPdfRef}
        accept="application/pdf,.doc,.docx,.txt"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'pdf')}
      />
      <input
        type="file"
        ref={fileInputImageRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, 'image')}
      />

      {/* 1. LEFT SIDEBAR: Conversation List */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0 ${
          mobileView === 'list' ? 'flex' : 'hidden md:flex'
        }`}
      >
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
                onClick={() => {
                  onSelectLead(lead.id);
                  setMobileView('chat');
                }}
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
                      className="text-[10px] px-1.5 py-0.5 rounded font-semibold truncate max-w-[130px]"
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
      <div
        className={`flex-1 flex flex-col min-w-0 bg-[#efeae2] relative ${
          mobileView === 'chat' ? 'flex' : 'hidden md:flex'
        }`}
      >
        {activeLead ? (
          <>
            {/* Chat Room Top Bar */}
            <div className="px-3 md:px-5 py-2.5 border-b border-slate-200 bg-white flex items-center justify-between gap-2 shrink-0 shadow-2xs z-10">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-slate-100 text-slate-700 cursor-pointer shrink-0"
                  title="Voltar para lista de conversas"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {activeLead.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <h3 className="text-xs md:text-sm font-bold text-slate-900 truncate">
                      {activeLead.name}
                    </h3>
                    <span
                      className="text-[9px] md:text-[10px] px-1.5 py-0.2 rounded font-medium shrink-0 truncate max-w-[90px] md:max-w-none"
                      style={{
                        backgroundColor: `${activeStage?.color}15`,
                        color: activeStage?.color,
                        border: `1px solid ${activeStage?.color}35`,
                      }}
                    >
                      {activeStage?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                    <span className="truncate">{activeLead.phone}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-emerald-700 font-medium hidden sm:inline">WhatsApp Conectado</span>
                  </div>
                </div>
              </div>

              {/* Action buttons on header */}
              <div className="flex items-center gap-1.5 md:gap-2">
                <button
                  type="button"
                  id="btn-toggle-ai-chat"
                  onClick={() => onToggleAi(activeLead.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                    activeLead.aiPaused
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                  title={
                    activeLead.aiPaused
                      ? 'Clique para devolver o controle para a IA'
                      : 'Clique para assumir a conversa (pausar IA)'
                  }
                >
                  {activeLead.aiPaused ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Assumido (IA Pausada)</span>
                      <span className="sm:hidden">Humano</span>
                    </>
                  ) : (
                    <>
                      <Bot className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">IA Ativa</span>
                      <span className="sm:hidden">IA</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className={`p-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer ${
                    showDetails ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-100 text-slate-700'
                  }`}
                  title="Ver detalhes do lead"
                >
                  {showDetails ? (
                    <PanelRightClose className="w-4 h-4" />
                  ) : (
                    <PanelRightOpen className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Chat Messages Feed with WhatsApp Doodle Background */}
            <div
              className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3"
              style={{
                backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)',
                backgroundSize: '16px 16px',
              }}
            >
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Carregando histórico do WhatsApp...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <p>Nenhuma mensagem trocada ainda com este lead.</p>
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
                        <span className="bg-slate-200/90 text-slate-700 text-[11px] px-3 py-1 rounded-full shadow-2xs border border-slate-300">
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
                        className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 shadow-xs relative ${
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
                            <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                              <Sparkles className="w-3 h-3 text-emerald-700" />
                              <span>{personaName || 'Sofia'}</span>
                            </span>
                          )}
                          {isAgent && (
                            <span className="flex items-center gap-1 text-slate-300">
                              <UserCheck className="w-3 h-3 text-slate-300" />
                              <span>Atendente Humano</span>
                            </span>
                          )}
                        </div>

                        {/* PDF / Document Bubble */}
                        {msg.mediaType === 'pdf' || msg.text.startsWith('📄 [') ? (
                          <div className="space-y-2">
                            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                              isAgent ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
                            }`}>
                              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-xs font-bold truncate block">
                                  {msg.fileName || msg.text.split(']:')[0]?.replace('📄 [', '').replace(']', '') || 'Documento.pdf'}
                                </span>
                                <span className="text-[10px] text-slate-400">Documento PDF Oficial</span>
                              </div>
                              {msg.mediaUrl && (
                                <a
                                  href={msg.mediaUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={msg.fileName || 'documento.pdf'}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0"
                                  title="Baixar PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                            {msg.text.includes(']:') && (
                              <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                {msg.text.split(']:')[1]?.trim()}
                              </p>
                            )}
                          </div>
                        ) : msg.mediaType === 'image' || msg.text.startsWith('📷 [Foto') ? (
                          /* Image Bubble */
                          <div className="space-y-1.5">
                            {msg.mediaUrl && (
                              <div className="rounded-lg overflow-hidden border border-black/10 max-w-sm">
                                <img
                                  src={msg.mediaUrl}
                                  alt="Imagem enviada"
                                  className="w-full h-auto object-cover max-h-60 rounded-lg cursor-pointer hover:opacity-95"
                                  onClick={() => window.open(msg.mediaUrl, '_blank')}
                                />
                              </div>
                            )}
                            {!msg.mediaUrl && (
                              <div className="flex items-center gap-1.5 p-2 bg-amber-50/90 rounded-lg text-amber-900 border border-amber-200">
                                <ImageIcon className="w-4 h-4 text-amber-700 shrink-0" />
                                <span className="text-xs font-semibold">Foto / Imagem WhatsApp</span>
                              </div>
                            )}
                            <p className="text-xs leading-relaxed whitespace-pre-wrap">
                              {msg.text.replace(/^📷\s*\[[^\]]+\]:\s*/, '')}
                            </p>
                          </div>
                        ) : msg.mediaType === 'audio' || msg.text.startsWith('🎙️ [Áudio') || msg.text.startsWith('🎤 [Áudio') ? (
                          /* Audio Bubble */
                          <div className="space-y-1.5">
                            <div className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${
                              isAgent ? 'bg-slate-800 border-slate-700' : 'bg-purple-50/90 border-purple-200'
                            }`}>
                              <button
                                type="button"
                                onClick={() => handleToggleAudioPlay(msg.id, msg.mediaUrl)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer ${
                                  playingAudioId === msg.id ? 'bg-purple-700 animate-pulse' : 'bg-purple-600 hover:bg-purple-700'
                                }`}
                              >
                                {playingAudioId === msg.id ? (
                                  <Pause className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4 ml-0.5" />
                                )}
                              </button>
                              <div className="flex-1 flex items-center gap-1">
                                <span className="h-2 w-0.5 bg-purple-500 rounded-full"></span>
                                <span className="h-4 w-0.5 bg-purple-600 rounded-full"></span>
                                <span className="h-6 w-0.5 bg-purple-700 rounded-full"></span>
                                <span className="h-3 w-0.5 bg-purple-500 rounded-full"></span>
                                <span className="h-5 w-0.5 bg-purple-600 rounded-full"></span>
                                <span className="h-2 w-0.5 bg-purple-400 rounded-full"></span>
                                <span className="h-4 w-0.5 bg-purple-600 rounded-full"></span>
                              </div>
                              <span className={`text-[10px] font-bold ${isAgent ? 'text-purple-300' : 'text-purple-900'}`}>
                                {msg.text.startsWith('🎙️') ? 'Áudio PTT' : 'Áudio Recebido'}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed whitespace-pre-wrap italic opacity-90">
                              {msg.text.replace(/^[🎙️🎤]\s*\[[^\]]+\]:\s*/, '')}
                            </p>
                          </div>
                        ) : (
                          /* Standard Text Message */
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

            {/* 3. WHATSAPP WEB STYLE BOTTOM BAR */}
            <div className="bg-[#f0f2f5] border-t border-slate-200 flex flex-col shrink-0 relative z-20">
              
              {/* Urgent Banner in Active Chat */}
              {activeLead.isUrgent && (
                <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 flex items-center justify-between gap-2 text-xs text-rose-900">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold">Atenção Prioritária: </span>
                      <span>{activeLead.urgencyReason || 'Paciente reportou dor ou urgência'}</span>
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

              {/* ATTACHMENT POPUP MENU (📎 Clips) */}
              {showAttachMenu && (
                <div className="absolute bottom-16 left-2 sm:left-3 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 w-[calc(100vw-24px)] max-w-xs sm:w-72 flex flex-col gap-1.5 animate-in slide-in-from-bottom-3 duration-150 z-50">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 border-b border-slate-100 flex items-center justify-between">
                    <span>Anexar no WhatsApp</span>
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 📄 Documento / PDF (NATIVE LABEL FOR MOBILE COMPATIBILITY) */}
                  <label className="flex items-center gap-3 p-3 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-colors text-left cursor-pointer border border-transparent hover:border-slate-100 select-none">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,application/pdf"
                      className="sr-only"
                      onChange={(e) => handleFileChange(e, 'pdf')}
                    />
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Documento / PDF</span>
                      <span className="text-[10px] text-slate-400">PDF, exames, receitas ou contratos</span>
                    </div>
                  </label>

                  {/* 🖼️ Fotos e Vídeos (NATIVE LABEL FOR MOBILE COMPATIBILITY) */}
                  <label className="flex items-center gap-3 p-3 hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-colors text-left cursor-pointer border border-transparent hover:border-slate-100 select-none">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="sr-only"
                      onChange={(e) => handleFileChange(e, 'image')}
                    />
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Fotos e Vídeos</span>
                      <span className="text-[10px] text-slate-400">Galeria, câmera ou fotos de exames</span>
                    </div>
                  </label>

                  {/* 📑 Enviar Tabela de Preços Pré-configurada */}
                  <button
                    type="button"
                    onClick={handleSendPresetPdf}
                    className="flex items-center gap-3 p-3 hover:bg-purple-50 active:bg-purple-100 rounded-xl transition-colors text-left cursor-pointer border-t border-slate-100 select-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-purple-900 block">Tabela da Clínica (PDF)</span>
                      <span className="text-[10px] text-purple-600">Disparo com 1 toque</span>
                    </div>
                  </button>
                </div>
              )}

              {/* EMOJI PICKER POPUP (😊) */}
              {showEmojiPicker && (
                <div className="absolute bottom-16 left-2 sm:left-12 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 w-[calc(100vw-24px)] max-w-xs sm:w-64 animate-in slide-in-from-bottom-3 duration-150 z-50">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[11px] font-bold text-slate-400">
                    <span>Emojis Rápidos</span>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-2 text-lg">
                    {COMMON_EMOJIS.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                        className="p-2 hover:bg-slate-100 active:bg-slate-200 rounded-lg text-center cursor-pointer transition-transform hover:scale-125 select-none"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QUICK REPLIES BAR (Collapsible) */}
              {showQuickReplies && (
                <div className="px-3 py-2 bg-white border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] animate-in slide-in-from-top-2 duration-150">
                  <span className="text-slate-400 font-semibold flex items-center gap-1 shrink-0 text-[10px]">
                    <Zap className="w-3 h-3 text-amber-500" /> Respostas Rápidas:
                  </span>
                  <button
                    type="button"
                    onClick={() => setInputText(`Olá, ${activeLead.name.split(' ')[0]}! Tudo bem? Como posso te ajudar hoje?`)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    👋 Saudação
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(`Para realizarmos seu agendamento, qual período fica mais confortável para você: manhã (09h-12h) ou tarde (14h-18h)?`)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    🗓️ Opções de Horário
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(`Olá, ${activeLead.name.split(' ')[0]}! Sou a secretária da clínica. Vi que você conversou com nossa assistente virtual. Vamos confirmar o seu melhor horário agora?`)}
                    className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    👩‍💼 Assumir Atendimento
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(`Confirmamos o recebimento e já reservamos o seu horário na grade! Em caso de dúvidas, estamos por aqui.`)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    ✅ Confirmar Horário
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(`Segue a nossa chave PIX oficial para confirmação do agendamento: financeiro@consultorio.com.br (Chave E-mail). Assim que efetuar, nos envie o comprovante por aqui!`)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-800 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors cursor-pointer shrink-0"
                  >
                    💰 Chave PIX
                  </button>
                </div>
              )}

              {/* Status Indicator / Human takeover bar */}
              <div className="px-3 pt-1.5 pb-0.5 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sendViaWhatsApp}
                      onChange={(e) => setSendViaWhatsApp(e.target.checked)}
                      className="rounded text-slate-900 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] font-medium">Disparar no WhatsApp Real</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{showQuickReplies ? 'Ocultar Atalhos' : 'Ver Atalhos'}</span>
                  </button>
                </div>

                {activeLead.aiPaused ? (
                  <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Humano Ativo
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    IA Automática Ativa
                  </span>
                )}
              </div>

              {/* THE NATIVE WHATSAPP WEB INPUT ROW */}
              <div className="p-2 md:p-3 flex items-center gap-1.5 md:gap-2">
                {isRecording ? (
                  /* Audio Recording in Progress Bar */
                  <div className="flex-1 bg-white border border-rose-300 rounded-full px-4 py-2 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 text-rose-600 text-xs font-bold">
                      <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                      <span>Gravando áudio: {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:{String(recordingSeconds % 60).padStart(2, '0')}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={cancelRecording}
                        className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Cancelar gravação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={stopAndSendRecording}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-full shadow-xs transition-colors cursor-pointer flex items-center justify-center"
                        title="Enviar áudio"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard WhatsApp Web Input Controls */
                  <>
                    {/* 📎 Attachment Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowAttachMenu(!showAttachMenu);
                        setShowEmojiPicker(false);
                      }}
                      className={`p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0 ${
                        showAttachMenu ? 'bg-slate-200 text-slate-900' : ''
                      }`}
                      title="Anexar Documento, Foto ou Tabela"
                    >
                      <Paperclip className="w-5 h-5 rotate-45" />
                    </button>

                    {/* 😊 Emoji Picker Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmojiPicker(!showEmojiPicker);
                        setShowAttachMenu(false);
                      }}
                      className={`p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer shrink-0 ${
                        showEmojiPicker ? 'bg-slate-200 text-slate-900' : ''
                      }`}
                      title="Emojis"
                    >
                      <Smile className="w-5 h-5" />
                    </button>

                    {/* Message Input Pill */}
                    <form
                      onSubmit={handleSendMessage}
                      className="flex-1 flex items-center"
                    >
                      <input
                        ref={inputRef}
                        id="chat-input-message"
                        type="text"
                        placeholder="Digite uma mensagem"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full bg-white border border-slate-300 focus:border-slate-400 rounded-lg md:rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden shadow-2xs transition-colors"
                      />
                    </form>

                    {/* 🎙️ Microphone OR ✈️ Send Button */}
                    {inputText.trim() ? (
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={isSending}
                        id="btn-send-chat"
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2.5 rounded-full transition-all shadow-xs cursor-pointer shrink-0 flex items-center justify-center"
                        title="Enviar mensagem"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startRecording}
                        disabled={isSending}
                        id="btn-record-audio"
                        className="p-2.5 rounded-full hover:bg-slate-200 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                        title="Gravar mensagem de voz"
                      >
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
            Selecione uma conversa ao lado para visualizar o atendimento.
          </div>
        )}
      </div>

      {/* MODAL: Media Preview Before Sending (PDF or Image) */}
      {mediaModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {mediaModal.type === 'pdf' ? (
                  <>
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>Enviar Documento PDF</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Enviar Imagem</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setMediaModal({ ...mediaModal, isOpen: false })}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col items-center justify-center">
              {mediaModal.type === 'image' ? (
                <img
                  src={mediaModal.fileBase64}
                  alt="Preview"
                  className="max-h-56 rounded-lg object-contain"
                />
              ) : (
                <div className="text-center py-4 space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-800">{mediaModal.fileName}</p>
                  <p className="text-[11px] text-slate-400">Pronto para envio no WhatsApp</p>
                </div>
              )}
            </div>

            {/* Optional Caption */}
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">
                Legenda (Opcional):
              </label>
              <input
                type="text"
                placeholder="Adicione uma mensagem junto com o arquivo..."
                value={mediaModal.caption}
                onChange={(e) => setMediaModal({ ...mediaModal, caption: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMediaModal({ ...mediaModal, isOpen: false })}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendMediaModal}
                disabled={isSending}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? 'Enviando...' : 'Enviar no WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RIGHT DRAWER: Lead Details & Quick CRM Controls */}
      {/* Desktop sidebar */}
      {showDetails && activeLead && (
        <div className="hidden lg:flex w-80 border-l border-slate-200 bg-white p-4 overflow-y-auto flex-col gap-4 shrink-0">
          <DetailsContent
            activeLead={activeLead}
            stages={stages}
            onMoveLead={onMoveLead}
            onResolveUrgency={onResolveUrgency}
            onConfirmTriage={onConfirmTriage}
            onUpdateLeadNotes={onUpdateLeadNotes}
          />
        </div>
      )}

      {/* Mobile slide-over modal drawer */}
      {showDetails && activeLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end lg:hidden animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white h-full p-4 overflow-y-auto flex flex-col gap-4 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Detalhes da Oportunidade</h3>
              <button
                type="button"
                onClick={() => setShowDetails(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <DetailsContent
              activeLead={activeLead}
              stages={stages}
              onMoveLead={onMoveLead}
              onResolveUrgency={onResolveUrgency}
              onConfirmTriage={onConfirmTriage}
              onUpdateLeadNotes={onUpdateLeadNotes}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Details Content Component
interface DetailsContentProps {
  activeLead: Lead;
  stages: KanbanStage[];
  onMoveLead: (leadId: string, stageId: string) => void;
  onResolveUrgency?: (leadId: string) => void;
  onConfirmTriage?: (leadId: string, dateStr: string) => Promise<void>;
  onUpdateLeadNotes: (leadId: string, notes: string) => void;
}

const DetailsContent: React.FC<DetailsContentProps> = ({
  activeLead,
  stages,
  onMoveLead,
  onResolveUrgency,
  onConfirmTriage,
  onUpdateLeadNotes,
}) => {
  return (
    <>
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
      <div className="flex-1 flex flex-col min-h-[140px]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Anotações Internas
        </h3>
        <textarea
          rows={5}
          value={activeLead.notes || ''}
          onChange={(e) => onUpdateLeadNotes(activeLead.id, e.target.value)}
          placeholder="Adicione observações sobre a negociação..."
          className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-slate-400 resize-none"
        />
      </div>
    </>
  );
};
