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

  public leads: Lead[] = [
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
      interest: 'MAVRA CRM Starter',
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
    }
  ];

  public messages: ChatMessage[] = [
    {
      id: 'msg-1',
      leadId: 'lead-1',
      phone: '5511987654321',
      sender: 'lead',
      text: 'Olá! Vi a plataforma MAVRA de vocês. Como funciona o agente de IA para WhatsApp?',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      status: 'read',
    },
    {
      id: 'msg-2',
      leadId: 'lead-1',
      phone: '5511987654321',
      sender: 'ai',
      text: 'Olá, Dr. Roberto! Que prazer falar com você. O MAVRA conecta sua Evolution API v2 diretamente ao nosso CRM com atendimento Multi-IA (Gemini, GPT-4o ou Claude). Ele responde em tempo real com base no seu catálogo e move os leads automaticamente no funil de vendas! Qual é o tamanho da sua equipe?',
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
    }
  ];

  public agentConfig: AgentConfig = {
    personaName: 'Sofia Mendes',
    role: 'Especialista em Soluções Comerciais MAVRA',
    toneOfVoice: 'Profissional, empático, dinâmico, consultivo e focado em conversão de vendas',
    salesGoal: 'Descobrir as dores do lead, tirar dúvidas com base no catálogo oficial, qualificar o tamanho da operação e avançar a oportunidade no funil de vendas',
    activeProvider: 'gemini',
    activeModel: 'gemini-2.5-flash',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    knowledgeFaq: `P: Como funciona a conexão com o WhatsApp?
R: O MAVRA se conecta de forma nativa e sem intermediários com a Evolution API v2 instalada na sua VPS, garantindo latência zero e total controle.

P: O que acontece se o atendente humano quiser assumir?
R: Basta clicar no botão "Assumir Atendimento" na Central de Chat. A IA pausa instantaneamente para aquele lead e você conversa normalmente.

P: Posso usar mais de um provedor de IA?
R: Sim! Você pode alternar instantaneamente entre Google Gemini (2.5 Flash / Pro), OpenAI (GPT-4o) e Anthropic Claude 3.5 Sonnet.

P: Como funciona a garantia e suporte?
R: Oferecemos suporte dedicado liderado pelo arquiteto Marco Duarte, com onboarding expresso em até 15 minutos.`,
    knowledgeCatalog: `CATÁLOGO DE SOLUÇÕES MAVRA:
1. MAVRA Starter: R$ 890/mês. Ideal para até 2 números de WhatsApp, 5.000 mensagens com IA/mês, CRM Kanban visual integrado.
2. MAVRA Professional: R$ 1.950/mês. Até 5 números de WhatsApp, 25.000 mensagens com IA/mês, base de conhecimento com upload de documentos, gatilhos automáticos de funil.
3. MAVRA Enterprise: A partir de R$ 4.500/mês. Números ilimitados, alta concorrência de mensagens, instâncias dedicadas de Evolution API v2, multi-provedor de IA e suporte SLA 2h.`,
    knowledgePricing: `TABELA DE PREÇOS E FORMAS DE PAGAMENTO:
- Pagamento via PIX com 10% de desconto ou Cartão de Crédito em até 12x.
- Setup e Onboarding guiado: R$ 1.200 (gratuito no plano anual).
- Mensagens adicionais: R$ 0,02 por mensagem enviada.`,
    knowledgeRules: `REGRAS DE NEGÓCIO E ANTI-ALUCINAÇÃO:
1. NUNCA invente preços, prazos ou recursos que não constem expressamente neste catálogo.
2. Se o cliente perguntar algo fora da sua base, diga educadamente: "Vou encaminhar essa sua dúvida técnica para nosso arquiteto especialista Marco Duarte para lhe passar o detalhamento preciso".
3. Mantenha mensagens concisas e fluidas, com no máximo 2 a 3 parágrafos curtos, ideais para leitura no WhatsApp.
4. Identifique o nome do cliente, e-mail e interesse para registrar no CRM.`,
    strictKnowledgeOnly: true,
    autoTriggerCRMStages: true,
  };

  public documents: KnowledgeDocument[] = [
    {
      id: 'doc-1',
      name: 'Guia_Comercial_MAVRA_2026.txt',
      type: 'txt',
      size: 4520,
      contentText: 'Documento de Especificação Comercial MAVRA: Automação completa de canais de atendimento corporativo com Evolution API v2 e Inteligência Artificial generativa com Function Calling para movimentação de funil de vendas.',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'doc-2',
      name: 'Politica_Privacidade_e_SLA.txt',
      type: 'txt',
      size: 3200,
      contentText: 'SLA de Atendimento: Disponibilidade de 99.9% para endpoints da Evolution API v2, criptografia de ponta a ponta e total conformidade com a LGPD.',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    }
  ];

  public evolutionConfig: EvolutionConfig = {
    serverUrl: process.env.EVOLUTION_API_URL || 'https://api.makprojetosmake.com.br',
    apiKey: process.env.EVOLUTION_API_KEY || 'CE08ADFF7647-4B88-91A4-55E66D9A0620',
    instanceName: process.env.EVOLUTION_INSTANCE || 'agente-ia',
    isConnected: true,
    state: 'connected',
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
