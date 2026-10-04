export type AIProvider = 'gemini' | 'openai' | 'anthropic';

export interface PreAppointmentTriage {
  procedure?: string;
  preferredPeriod?: 'manha' | 'tarde' | 'noite' | 'qualquer';
  preferredDays?: string;
  paymentType?: 'convenio' | 'particular' | 'indefinido';
  convenioName?: string;
  isUrgent?: boolean;
  urgencyReason?: string;
  status?: 'pending_confirmation' | 'confirmed' | 'rescheduled';
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  stageId: string;
  value: number;
  interest?: string;
  tags: string[];
  notes?: string;
  aiPaused: boolean; // True if human took over
  lastInteraction: string;
  createdAt: string;
  unreadCount?: number;
  isUrgent?: boolean;
  urgencyReason?: string;
  isHotLead?: boolean;
  hotReason?: string;
  triage?: PreAppointmentTriage;
  lastFollowUpAt?: string;
  followUpCount?: number;
}

export interface KanbanStage {
  id: string;
  name: string;
  color: string;
  order: number;
  isDefault?: boolean;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  phone: string;
  sender: 'lead' | 'ai' | 'agent' | 'system';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'pending';
  stageTriggered?: string;
  mediaUrl?: string;
  mediaType?: 'pdf' | 'image' | 'audio';
  fileName?: string;
  extractedInfo?: {
    name?: string;
    email?: string;
    interest?: string;
    value?: number;
  };
  providerUsed?: string;
  modelUsed?: string;
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'docx';
  size: number;
  contentText: string;
  uploadedAt: string;
}

export type BusinessNiche =
  | 'dental'
  | 'medical'
  | 'retail'
  | 'sales'
  | 'real_estate'
  | 'legal'
  | 'services'
  | 'general'
  | 'custom';

export interface AgentConfig {
  personaName: string;
  role: string;
  toneOfVoice: string;
  salesGoal: string;
  activeProvider: AIProvider;
  activeModel: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  anthropicApiKey?: string;
  knowledgeFaq: string;
  knowledgeCatalog: string;
  knowledgePricing: string;
  knowledgeRules: string;
  strictKnowledgeOnly: boolean;
  autoTriggerCRMStages: boolean;
  isGlobalAiActive: boolean;
  testModeEnabled: boolean;
  testNumberWhitelist: string;
  autoTranscribeAudio?: boolean;
  typingDelayMs?: number;
  catalogPdfUrl?: string;
  catalogPdfName?: string;
  voiceResponseEnabled?: boolean;
  voiceResponseMode?: 'smart_discernment' | 'always_audio' | 'only_text';
  voiceEngine?: 'native_sofia' | 'google_cloud_tts' | 'elevenlabs';
  voiceVoiceName?: string;
  maxConsecutiveAudios?: number;
  maxAudioChars?: number;
  googleTtsApiKey?: string;
  elevenLabsApiKey?: string;
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  autoFollowUpEnabled?: boolean;
  followUpDelayHours?: number;
  followUpNiche?: BusinessNiche;
  followUpCustomMessage?: string;
  maxFollowUpsPerLead?: number;
  operatingScheduleEnabled?: boolean;
  operatingScheduleMode?: 'always_24_7' | 'outside_hours_only' | 'business_hours_only';
  businessHoursStart?: string;
  businessHoursEnd?: string;
  businessDays?: number[];
  outsideHoursNotice?: string;
  // Módulo de Agendamentos / Google Calendar
  calendarEnabled?: boolean;
  calendarConnectedEmail?: string;
  calendarDefaultDurationMinutes?: number;
  calendarDefaultTitle?: string;
  calendarDefaultLocation?: string;
  calendarAllowAiBooking?: boolean;
  showCalendarModuleInMenu?: boolean;
  instagramConfig?: InstagramConfig;
}

export interface InstagramConfig {
  enabled: boolean;
  isConnected: boolean;
  username: string; // Ex: dra.lucymurata
  fullName?: string;
  profilePicUrl?: string;
  pageId?: string;
  instagramId?: string;
  accessToken?: string;
  tokenExpiresAt?: string;
  autoReplyComments: boolean;
  commentTriggerKeywords: string[]; // ['AVALIACAO', 'AGENDA', 'CRM', 'SORRISO', 'CANAL']
  commentPublicReplyText: string;
  directWelcomePrompt: string;
  directAutoQualify: boolean;
  leadCaptureMoveToStage: string;
  connectedAt?: string;
}

export interface AppointmentSlot {
  id: string;
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  summary: string;
  description?: string;
  startIso: string;
  endIso: string;
  googleEventId?: string;
  htmlLink?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface EvolutionConfig {
  serverUrl: string;
  apiKey: string;
  instanceName: string;
  isConnected: boolean;
  state: 'connecting' | 'connected' | 'disconnected' | 'qrcode';
  qrcode?: string;
  lastTestedAt?: string;
  wasEverConnected?: boolean;
}

export interface SupabaseConfig {
  url: string;
  serviceKey: string;
  anonKey: string;
  isConnected: boolean;
}

export interface WebhookEventLog {
  id: string;
  timestamp: string;
  event?: string;
  senderPhone?: string;
  messageText?: string;
  status: 'processed' | 'ignored_from_me' | 'ignored_group' | 'no_text' | 'error';
  details?: string;
  rawPayloadSnippet?: string;
}

export interface SentinelAlertConfig {
  enabled: boolean;
  notifyOnWhatsApp: boolean;
  notifyPhone: string; // Ex: 5511976143323
  notifyOnTelegram?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  notifyOnEmail?: boolean;
  notifyEmail?: string;
  alertOnWhatsAppDisconnect: boolean;
  alertOnHighMemory: boolean; // > 85%
  alertOnHighDisk: boolean; // > 90%
  alertOnAiFailure: boolean;
  cooldownMinutes: number; // Intervalo para não floodar (padrão: 30 min)
  lastAlertSentAt?: string;
}

export interface SystemMetrics {
  uptimeSeconds: number;
  uptimeFormatted: string;
  nodeVersion: string;
  platform: string;
  memory: {
    totalMb: number;
    usedMb: number;
    freeMb: number;
    usagePercent: number;
    processRssMb: number;
    processHeapUsedMb: number;
  };
  disk: {
    totalGb: number;
    usedGb: number;
    freeGb: number;
    usagePercent: number;
  };
  database: {
    storageFile: string;
    fileSizeBytes: number;
    fileSizeFormatted: string;
    leadsCount: number;
    messagesCount: number;
    documentsCount: number;
    stagesCount: number;
  };
  services: {
    evolutionApi: {
      status: 'connected' | 'disconnected' | 'connecting';
      instance: string;
      url: string;
    };
    supabase: {
      status: 'connected' | 'disconnected';
      url: string;
    };
    aiEngine: {
      provider: string;
      model: string;
      isGlobalActive: boolean;
    };
  };
  uptimeProbe: {
    status: 'operational' | 'degraded' | 'down';
    latencyMs: number;
    lastCheckedAt: string;
    uptimePercentage: number;
    checksCount: number;
    evolutionPingMs: number;
    supabasePingMs: number;
  };
  sentinelAlerts: SentinelAlertConfig;
  timestamp: string;
}
