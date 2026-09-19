import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Lead,
  KanbanStage,
  ChatMessage,
  AgentConfig,
  KnowledgeDocument,
  EvolutionConfig,
  SupabaseConfig,
  WebhookEventLog,
} from '../src/types';

function getStorageFilePath(): string {
  if (process.env.DATA_PATH) return process.env.DATA_PATH;
  const dockerDataDir = path.join(process.cwd(), 'data');
  if (fs.existsSync(dockerDataDir)) {
    return path.join(dockerDataDir, 'mavra_data.json');
  }
  return path.join(process.cwd(), 'mavra_data.json');
}

const STORAGE_FILE = getStorageFilePath();

function cleanUrl(url?: string): string {
  if (!url) return '';
  const match = url.match(/https?:\/\/[^\s"'<>]+/i);
  return (match ? match[0] : url.trim()).replace(/\/+$/, '');
}

export const DEFAULT_DEMO_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Dr. Roberto Silva',
    phone: '5511987654321',
    email: 'roberto.silva@clinica.com.br',
    stageId: 'stage-3',
    value: 12500,
    interest: 'Plano Enterprise + Integração WhatsApp',
    tags: ['Clínica Médica', 'Decisor', 'Alta Prioridade'],
    notes: 'Solicitou proposta para 10 atendentes com IA conversacional.',
    aiPaused: false,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'lead-2',
    name: 'Camila Castro',
    phone: '5521991234567',
    email: 'camila@castromarketing.com',
    stageId: 'stage-2',
    value: 4800,
    interest: 'Agente de Atendimento 24/7',
    tags: ['E-commerce', 'Lead Quente'],
    notes: 'Quer automatizar respostas para 200 pedidos/dia.',
    aiPaused: false,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    unreadCount: 1,
  },
  {
    id: 'lead-3',
    name: 'Lucas Mendes',
    phone: '5531988887777',
    email: 'lucas@techmendes.io',
    stageId: 'stage-1',
    value: 2900,
    interest: 'NEXA CRM Starter',
    tags: ['SaaS', 'Trial'],
    notes: 'Chegou pelo anúncio do Instagram querendo demonstração.',
    aiPaused: false,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'lead-4',
    name: 'Mariana Rios',
    phone: '5541999990000',
    email: 'mariana.rios@imoveisprime.com',
    stageId: 'stage-4',
    value: 18000,
    interest: 'Qualificação Imobiliária Automatizada',
    tags: ['Imobiliária', 'Contrato Anual'],
    notes: 'Revisando minuta contratual. IA respondeu dúvidas jurídicas com sucesso.',
    aiPaused: true,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'lead-5',
    name: 'Carlos Albuquerque',
    phone: '5581977776666',
    email: 'carlos@albuquerquelaw.adv.br',
    stageId: 'stage-5',
    value: 9500,
    interest: 'Atendimento Jurídico Pré-triagem',
    tags: ['Advocacia', 'Cliente Ativo'],
    notes: 'Assinou contrato trimestral com sucesso!',
    aiPaused: false,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    unreadCount: 0,
  },
];

export const DEFAULT_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    leadId: 'lead-1',
    phone: '5511987654321',
    sender: 'lead',
    text: 'Olá! Vi a plataforma NEXA de vocês. Como funciona o agente de IA para WhatsApp?',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-2',
    leadId: 'lead-1',
    phone: '5511987654321',
    sender: 'ai',
    text: 'Olá, Dr. Roberto! Que prazer falar com você. Nossa Inteligência Artificial corporativa atende diretamente no WhatsApp da sua clínica com respostas ágeis, personalizadas e integração direta ao CRM em tempo real! Qual é o tamanho da sua equipe?',
    timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-3',
    leadId: 'lead-1',
    phone: '5511987654321',
    sender: 'lead',
    text: 'Temos 10 atendentes na clínica. Vocês conseguem enviar proposta para esse volume?',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-4',
    leadId: 'lead-1',
    phone: '5511987654321',
    sender: 'ai',
    text: 'Perfeito! Para 10 atendentes temos o Plano Enterprise com instâncias dedicadas e suporte prioritário. Já atualizei seu cadastro no nosso CRM para "Proposta / Apresentação". Nosso especialista Marco Duarte entrará em contato para agendar uma demonstração exclusiva!',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'delivered',
    stageTriggered: 'stage-3',
  },
  {
    id: 'msg-5',
    leadId: 'lead-2',
    phone: '5521991234567',
    sender: 'lead',
    text: 'Boa tarde, consigo colocar catálogo de produtos em PDF para a IA ler?',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'read',
  },
];

// In-memory / persistent fallback state
class Database {
  public stages: KanbanStage[] = [
    { id: 'stage-1', name: 'Novo Lead', color: '#3b82f6', order: 1, isDefault: true },
    { id: 'stage-2', name: 'Qualificado / Interesse', color: '#f59e0b', order: 2 },
    { id: 'stage-3', name: 'Proposta / Apresentação', color: '#8b5cf6', order: 3 },
    { id: 'stage-4', name: 'Em Negociação', color: '#06b6d4', order: 4 },
    { id: 'stage-5', name: 'Ganho / Fechado', color: '#10b981', order: 5 },
    { id: 'stage-6', name: 'Perdido', color: '#ef4444', order: 6 },
  ];

  public leads: Lead[] = JSON.parse(JSON.stringify(DEFAULT_DEMO_LEADS));
  public messages: ChatMessage[] = JSON.parse(JSON.stringify(DEFAULT_DEMO_MESSAGES));

  public clearAllLeads(): void {
    this.leads = [];
    this.messages = [];
    this.saveToFile();
  }

  public restoreDemoLeads(): void {
    this.leads = JSON.parse(JSON.stringify(DEFAULT_DEMO_LEADS));
    this.messages = JSON.parse(JSON.stringify(DEFAULT_DEMO_MESSAGES));
    this.saveToFile();
  }

  public agentConfig: AgentConfig = {
    personaName: 'Sofia Mendes',
    role: 'Especialista em Soluções Comerciais NEXA CRM',
    toneOfVoice: 'Profissional, empático, dinâmico, consultivo e focado em conversão de vendas',
    salesGoal: 'Descobrir as dores do lead, tirar dúvidas com base no catálogo oficial, qualificar o tamanho da operação e avançar a oportunidade no funil de vendas',
    activeProvider: 'gemini',
    activeModel: 'gemini-2.5-flash',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    knowledgeFaq: `P: Como funciona o atendimento inteligente do NEXA CRM?
R: O NEXA CRM integra inteligência artificial avançada diretamente ao WhatsApp da sua empresa, atendendo clientes 24 horas por dia com respostas personalizadas e atualizando o CRM em tempo real.

P: O que acontece se o atendente humano quiser assumir?
R: Basta clicar no botão "Assumir Atendimento" na Central de Chat. A inteligência artificial pausa instantaneamente para aquele cliente e a equipe humana continua a conversa com total naturalidade.

P: Como a IA sabe sobre os produtos ou serviços da empresa?
R: O sistema possui uma base de conhecimento exclusiva alimentada com catálogos, tabela de serviços e documentos oficiais do seu negócio.

P: Como funciona a garantia e suporte?
R: Oferecemos suporte dedicado e acompanhamento completo, com implementação ágil e personalizada para a sua empresa.`,
    knowledgeCatalog: `SOLUÇÕES DISPONÍVEIS:
1. NEXA Starter: Ideal para empresas em crescimento, com atendimento automatizado inteligente no WhatsApp e CRM visual integrado.
2. NEXA Professional: Para equipes comerciais ativas, com múltiplos números de atendimento, qualificação avançada de clientes e movimentação automática de funil.
3. NEXA Enterprise: Solução corporativa de alta performance, com personalização completa de regras de negócio, suporte prioritário e capacidade ilimitada de atendimentos.`,
    knowledgePricing: `CONDIÇÕES COMERCIAIS E FORMAS DE PAGAMENTO:
- Pagamento facilitado via PIX ou Cartão de Crédito em até 12x.
- Implantação e treinamento assistido para sua equipe.
- Planos flexíveis conforme a necessidade da sua empresa.`,
    knowledgeRules: `REGRAS DE CONDUTA E DIRETRIZES:
1. Jamais cite nomes de ferramentas de tecnologia de bastidores (Evolution, Supabase, etc). Refira-se à solução como nossa Inteligência Artificial Comercial proprietária.
2. Seja sempre ágil, cordial e transmita autoridade e acolhimento.
3. Responda em no máximo 2 a 3 frases curtas e objetivas, com quebras de linha limpas.
4. Conduza o lead para agendamento de uma demonstração ou consulta, perguntando qual dia ou horário é mais conveniente para ele.`,
    strictKnowledgeOnly: true,
    autoTriggerCRMStages: true,
    isGlobalAiActive: true,
    testModeEnabled: false,
    testNumberWhitelist: '',
    autoTranscribeAudio: true,
    typingDelayMs: 1500,
    catalogPdfUrl: '',
    catalogPdfName: 'Apresentacao_Oficial_NEXA_CRM.pdf',
    voiceResponseEnabled: true,
    voiceResponseMode: 'smart_discernment',
    voiceEngine: 'native_sofia',
    voiceVoiceName: 'pt-BR-FranciscaNeural',
    maxConsecutiveAudios: 4,
    maxAudioChars: 450,
    googleTtsApiKey: '',
    elevenLabsApiKey: '',
    pixKey: 'marco.agduarte22@gmail.com',
    pixKeyType: 'email',
    autoFollowUpEnabled: true,
    followUpDelayHours: 4,
    followUpNiche: 'dental',
    followUpCustomMessage: '',
    maxFollowUpsPerLead: 2,
  };

  public documents: KnowledgeDocument[] = [
    {
      id: 'doc-1',
      name: 'Guia_Institucional_MAVRA.txt',
      type: 'txt',
      size: 1520,
      contentText: 'Apresentação Institucional MAVRA: Solução corporativa de atendimento inteligente e gestão de relacionamento com clientes no WhatsApp. Utilizamos Inteligência Artificial proprietária de última geração treinada exclusivamente para qualificação ágil de clientes e conversão comercial.',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'doc-2',
      name: 'SLA_e_Qualidade_de_Atendimento.txt',
      type: 'txt',
      size: 1200,
      contentText: 'Padrão de Atendimento MAVRA: Disponibilidade contínua 24/7, privacidade e conformidade rigorosa com a LGPD, garantindo respostas rápidas, acolhedoras e personalizadas para cada lead.',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    }
  ];

  public evolutionConfig: EvolutionConfig = {
    serverUrl: process.env.EVOLUTION_API_URL || 'https://api.makprojetosmake.com.br',
    apiKey: process.env.EVOLUTION_API_KEY || 'b2efa885a71ee22edf72b597df1a0ce9',
    instanceName: process.env.EVOLUTION_INSTANCE || 'agente-ia',
    isConnected: false,
    state: 'disconnected',
    lastTestedAt: new Date().toISOString(),
  };

  public webhookLogs: WebhookEventLog[] = [];

  public logWebhookEvent(event: Omit<WebhookEventLog, 'id' | 'timestamp'>): WebhookEventLog {
    const entry: WebhookEventLog = {
      id: 'wh-log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.webhookLogs.unshift(entry);
    if (this.webhookLogs.length > 50) {
      this.webhookLogs.pop();
    }
    return entry;
  }

  public supabaseConfig: SupabaseConfig = {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    isConnected: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)),
  };

  private supabaseClient: SupabaseClient | null = null;

  constructor() {
    this.initSupabaseClient();
    this.loadFromFile();
  }

  public async saveToFile(): Promise<void> {
    try {
      const payload = {
        stages: this.stages,
        leads: this.leads,
        messages: this.messages,
        agentConfig: this.agentConfig,
        documents: this.documents,
        evolutionConfig: this.evolutionConfig,
        supabaseConfig: this.supabaseConfig,
      };
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB Storage] Falha ao salvar dados em disco:', err);
    }

    // Se o cliente Supabase estiver conectado, sincronizar também na nuvem
    if (this.supabaseClient && this.supabaseConfig.isConnected) {
      try {
        await this.syncToSupabase();
      } catch (err: any) {
        // Fallback silencioso sem travar o aplicativo
        console.warn('[Supabase Sync] Aviso ao sincronizar na nuvem:', err.message);
      }
    }
  }

  public async syncToSupabase(): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      // Upsert leads no Supabase
      if (this.leads.length > 0) {
        const dbLeads = this.leads.map((l) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email || null,
          stage_id: l.stageId,
          value: l.value || 0,
          interest: l.interest || null,
          tags: l.tags || [],
          notes: l.notes || null,
          ai_paused: Boolean(l.aiPaused),
          last_interaction: l.lastInteraction,
          created_at: l.createdAt,
        }));
        await this.supabaseClient.from('leads').upsert(dbLeads, { onConflict: 'id' });
      }

      // Upsert últimas mensagens do chat
      if (this.messages.length > 0) {
        const recentMessages = this.messages.slice(-50).map((m) => ({
          id: m.id,
          lead_id: m.leadId,
          phone: m.phone,
          sender: m.sender,
          text: m.text,
          status: m.status || 'delivered',
          created_at: m.timestamp,
        }));
        await this.supabaseClient.from('mensagens_chat').upsert(recentMessages, { onConflict: 'id' });
      }
    } catch (err: any) {
      // Tabela pode ainda não ter sido criada pelo script SQL
    }
  }

  public loadFromFile(): void {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.stages && Array.isArray(data.stages)) this.stages = data.stages;
        if (data.leads && Array.isArray(data.leads)) this.leads = data.leads;
        if (data.messages && Array.isArray(data.messages)) this.messages = data.messages;
        if (data.agentConfig) {
          this.agentConfig = {
            ...this.agentConfig,
            ...data.agentConfig,
            geminiApiKey: (process.env.GEMINI_API_KEY || data.agentConfig.geminiApiKey || this.agentConfig.geminiApiKey || '').trim(),
            openaiApiKey: (process.env.OPENAI_API_KEY || data.agentConfig.openaiApiKey || this.agentConfig.openaiApiKey || '').trim(),
            anthropicApiKey: (process.env.ANTHROPIC_API_KEY || data.agentConfig.anthropicApiKey || this.agentConfig.anthropicApiKey || '').trim(),
          };
        }
        if (data.documents && Array.isArray(data.documents)) this.documents = data.documents;
        if (data.evolutionConfig) {
          this.evolutionConfig = {
            ...this.evolutionConfig,
            ...data.evolutionConfig,
            serverUrl: cleanUrl(process.env.EVOLUTION_API_URL || data.evolutionConfig.serverUrl || this.evolutionConfig.serverUrl),
            apiKey: (process.env.EVOLUTION_API_KEY || data.evolutionConfig.apiKey || this.evolutionConfig.apiKey || '').trim(),
            instanceName: (process.env.EVOLUTION_INSTANCE || data.evolutionConfig.instanceName || this.evolutionConfig.instanceName || '').trim(),
          };
        }
        if (data.supabaseConfig) {
          this.supabaseConfig = {
            ...this.supabaseConfig,
            ...data.supabaseConfig,
          };
          this.initSupabaseClient();
        }
        console.log(`[DB Storage] Dados restaurados com sucesso do disco (${this.leads.length} leads, ${this.messages.length} mensagens).`);
      }
    } catch (err) {
      console.error('[DB Storage] Falha ao ler dados do disco:', err);
    }
  }

  public clearAllLeads(): void {
    this.leads = [];
    this.messages = [];
    this.saveToFile();
    console.log('[DB Storage] Todos os leads e mensagens foram limpos.');
  }

  public restoreDemoLeads(): void {
    this.leads = [...DEFAULT_DEMO_LEADS];
    this.messages = [...DEFAULT_DEMO_MESSAGES];
    this.saveToFile();
    console.log(`[DB Storage] Leads de demonstração restaurados (${this.leads.length} leads).`);
  }

  public initSupabaseClient(): boolean {
    if (this.supabaseConfig.url && (this.supabaseConfig.serviceKey || this.supabaseConfig.anonKey)) {
      try {
        const key = this.supabaseConfig.serviceKey || this.supabaseConfig.anonKey;
        this.supabaseClient = createClient(this.supabaseConfig.url, key);
        this.supabaseConfig.isConnected = true;
        return true;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.supabaseConfig.isConnected = false;
        this.supabaseClient = null;
        return false;
      }
    }
    this.supabaseConfig.isConnected = false;
    this.supabaseClient = null;
    return false;
  }

  public getSupabaseClient(): SupabaseClient | null {
    return this.supabaseClient;
  }

  // Generate Supabase SQL Script
  public getSupabaseMigrationSQL(): string {
    return `-- ===================================================
-- MAVRA - CRM Conversacional Autônomo
-- Script de Migração Oficial para Supabase
-- Criador & Administrador: Marco Duarte (marco.agduarte22@gmail.com)
-- ===================================================

-- 1. Tabela de Etapas do Funil Kanban
CREATE TABLE IF NOT EXISTS public.etapas_kanban (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  stage_id TEXT REFERENCES public.etapas_kanban(id) ON DELETE SET NULL,
  value NUMERIC(12,2) DEFAULT 0,
  interest TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  ai_paused BOOLEAN DEFAULT false,
  last_interaction TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Mensagens do Chat
CREATE TABLE IF NOT EXISTS public.mensagens_chat (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('lead', 'ai', 'agent', 'system')),
  text TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  stage_triggered TEXT,
  extracted_info JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Configurações do Agente de IA
CREATE TABLE IF NOT EXISTS public.configuracoes_agente (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  persona_name TEXT NOT NULL,
  role TEXT NOT NULL,
  tone_of_voice TEXT NOT NULL,
  sales_goal TEXT NOT NULL,
  active_provider TEXT DEFAULT 'gemini',
  active_model TEXT DEFAULT 'gemini-2.5-flash',
  knowledge_faq TEXT,
  knowledge_catalog TEXT,
  knowledge_pricing TEXT,
  knowledge_rules TEXT,
  strict_knowledge_only BOOLEAN DEFAULT true,
  auto_trigger_crm_stages BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Documentos de Conhecimento
CREATE TABLE IF NOT EXISTS public.documentos_conhecimento (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  content_text TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_chat_lead_id ON public.mensagens_chat(lead_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON public.mensagens_chat(created_at);

-- Habilitar RLS (Opcional - Políticas Permissivas para Serviço)
ALTER TABLE public.etapas_kanban ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_agente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_conhecimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso completo via service_role" ON public.leads FOR ALL USING (true);
CREATE POLICY "Acesso completo via service_role etapas" ON public.etapas_kanban FOR ALL USING (true);
CREATE POLICY "Acesso completo via service_role chat" ON public.mensagens_chat FOR ALL USING (true);
CREATE POLICY "Acesso completo via service_role agente" ON public.configuracoes_agente FOR ALL USING (true);
CREATE POLICY "Acesso completo via service_role documentos" ON public.documentos_conhecimento FOR ALL USING (true);
`;
  }
}

export const db = new Database();
