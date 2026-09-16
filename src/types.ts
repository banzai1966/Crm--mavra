export type AIProvider = 'gemini' | 'openai' | 'anthropic';

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
  extractedInfo?: {
    name?: string;
    email?: string;
    interest?: string;
    value?: number;
  };
}

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'docx';
  size: number;
  contentText: string;
  uploadedAt: string;
}

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
}

export interface EvolutionConfig {
  serverUrl: string;
  apiKey: string;
  instanceName: string;
  isConnected: boolean;
  state: 'connecting' | 'connected' | 'disconnected' | 'qrcode';
  qrcode?: string;
  lastTestedAt?: string;
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
