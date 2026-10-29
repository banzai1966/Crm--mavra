import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { LiveChat } from './components/LiveChat';
import { AgentBuilder } from './components/AgentBuilder';
import { EvolutionSettings } from './components/EvolutionSettings';
import { SupabaseSettings } from './components/SupabaseSettings';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { CalendarIntegration } from './components/CalendarIntegration';
import { SalesPlaybook } from './components/SalesPlaybook';
import { DeliveryTracking } from './components/DeliveryTracking';
import { PublicOrderTracking } from './components/PublicOrderTracking';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePWA } from './hooks/usePWA';
import { PWAUpdateBanner } from './components/PWAUpdateBanner';
import {
  Lead,
  KanbanStage,
  AgentConfig,
  EvolutionConfig,
  SupabaseConfig,
  KnowledgeDocument,
} from './types';

export const WORKSPACE_PRESETS: Record<string, Partial<AgentConfig>> = {
  clinic: {
    activeWorkspaceName: 'Clínica & Saúde Integrativa (Dra. Lucy Murata)',
    personaName: 'Sofia (Recepção Clínica)',
    role: 'Coordenadora de Atendimento & Triagem Clínica da Dra. Lucy Murata',
    followUpNiche: 'dental',
    salesGoal: 'Acolher pacientes, realizar pré-triagem de sintomas/horários e agendar consultas e retornos da base antiga',
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se você conseguiu verificar o melhor dia para a sua consulta de avaliação com a Dra. Lucy Murata. Nossa equipe tem horários exclusivos esta semana no consultório do Euroville Mall! 🌿✨',
  },
  cantareira: {
    activeWorkspaceName: 'Cemitério Parque da Cantareira',
    personaName: 'Sofia do Parque Cantareira',
    role: 'Consultora de Atendimento Humanizado & Planejamento Familiar do Cemitério Parque da Cantareira',
    toneOfVoice: 'Extremamente empático, respeitoso, compassivo, sereno, profissional e acolhedor em momentos delicados',
    salesGoal: 'Acolher a família com máximo respeito e compaixão, esclarecer dúvidas sobre jazigos, velório 24h, cremação e planos preventivos',
    followUpNiche: 'b2b_services',
    followUpCustomMessage: 'Olá! Tudo bem? Passando para colocar nossa equipe à sua disposição para qualquer dúvida sobre nossos serviços, jazigos ou planejamento preventivo familiar no Parque da Cantareira. Estamos sempre prontos para ampará-los com todo o respeito e acolhimento. 🕊️🌿',
  },
  delivery: {
    activeWorkspaceName: 'Restaurante & Pizzaria Delivery',
    personaName: 'Sofia (Central de Pedidos)',
    role: 'Atendente Especialista em Pedidos & Delivery Rápido',
    followUpNiche: 'restaurant_delivery',
    salesGoal: 'Anotar pedidos completos, sugerir bebidas/bordas, calcular taxa de entrega por bairro e validar PIX na hora',
  },
  ecommerce: {
    activeWorkspaceName: 'E-commerce & Distribuidora',
    personaName: 'Sofia (Consultora de Vendas & Logística)',
    role: 'Especialista em Catálogo, Cotação de Frete e Fechamento PIX',
    followUpNiche: 'retail',
    salesGoal: 'Consultar catálogo completo em PDF, calcular frete por região/CEP, enviar chave PIX e liberar expedição',
  },
  b2b: {
    activeWorkspaceName: 'NEXA B2B & Vendas Comerciais',
    personaName: 'Sofia Mendes (Executiva B2B)',
    role: 'Especialista em Soluções Comerciais & Fechamento',
    followUpNiche: 'sales',
    salesGoal: 'Qualificar decisores, contornar objeções, apresentar ROI e agendar reunião ou fechar contrato via PIX',
  },
  surfacebrasil: {
    activeWorkspaceName: 'Surfacebrasil – Tratamento por Plasma',
    personaName: 'Sofia da Surfacebrasil',
    role: 'Consultora Técnica e Especialista em Tratamento de Superfície por Plasma da Surfacebrasil',
    toneOfVoice: 'Altamente técnica, consultiva, profissional, acolhedora, objetiva e focada em engenharia de aplicação e solução definitiva de problemas de ancoragem, pintura e adesão.',
    salesGoal: 'Identificar o substrato/material do cliente e o tipo de falha de adesão, entender a velocidade e o volume da linha fabril, e agendar uma reunião técnica com os engenheiros de aplicação ou o envio de amostras para testes no laboratório Surface Test em Campinas/SP.',
    followUpNiche: 'b2b_services',
    catalogPdfName: 'Dossie_Tecnico_Surfacebrasil_Plasma.pdf',
    preRecordedAudiosEnabled: false,
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se você conseguiu analisar a viabilidade do tratamento por plasma para as peças da sua fábrica. Nossos engenheiros de aplicação estão com a bancada do Surface Test disponível esta semana para testar suas amostras de material ou agendar uma rápida conversa técnica online. Como está sua disponibilidade? ⚡🔬',
  },
  verzel: {
    activeWorkspaceName: 'Verzel – Fábrica de Software & AI',
    personaName: 'Sofia da Verzel',
    role: 'Consultora Comercial & Estrategista de Soluções de TI da Verzel',
    toneOfVoice: 'Executiva, consultiva, altamente técnica, orientada a valor de negócio, agilidade e excelência em engenharia de software.',
    salesGoal: 'Identificar a necessidade do cliente (novo software sob medida, app mobile iOS/Android, alocação de AI Talent Hub, integração de sistemas ou sustentação 24/7), entender o estágio e prazo, e agendar uma reunião técnica de Discovery com os arquitetos e diretores da Verzel.',
    followUpNiche: 'b2b_services',
    catalogPdfName: 'Dossie_Tecnico_Verzel_Sistemas.pdf',
    preRecordedAudiosEnabled: false,
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber como estão os planos para o desenvolvimento do seu projeto de software na Verzel. Nossa equipe de arquitetura técnica está com slots abertos esta semana para uma sessão de Discovery gratuita e mapeamento de escopo. Quer marcar 20 minutinhos online? 💻🚀',
  },
  primo: {
    activeWorkspaceName: 'Primo Equipamentos (Vendas e Equipamentos)',
    personaName: 'Sofia da Primo Equipamentos',
    role: 'Consultora Especialista em Equipamentos Gastronômicos & Cozinhas Profissionais',
    toneOfVoice: 'Consultivo, técnico, ágil, atencioso, seguro e conhecedor prático da rotina de cozinhas comerciais e restaurantes',
    salesGoal: 'Identificar a necessidade da cozinha ou comércio (abertura, ampliação ou reposição de maquinário), apresentar as especificações técnicas ideais (capacidade, potência e voltagem correta 110V/220V), calcular prazos/frete e direcionar para fechamento com condições no Pix ou cartão.',
    followUpNiche: 'b2b_services',
    preRecordedAudiosEnabled: false,
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se você conseguiu avaliar os equipamentos e utensílios que conversamos para o seu negócio na Primo Equipamentos. Temos condições com desconto no Pix e pronta-entrega para agilizar sua cozinha! Qualquer dúvida sobre capacidade ou voltagem, estou por aqui! 🍳🧑‍🍳',
  },
  equipamentospsi: {
    activeWorkspaceName: 'Equipamentos PSI (Terapia EMDR & Psicologia)',
    personaName: 'Sofia da Equipamentos PSI',
    role: 'Consultora Especialista em Equipamentos e Tecnologia para Terapia EMDR & Psicologia Clínica',
    toneOfVoice: 'Acolhedor, técnico, respeitoso, empático com a rotina clínica de psicólogos e terapeutas, conhecedor profundo da terapia EMDR e estimulação bilateral',
    salesGoal: 'Compreender a necessidade do terapeuta (atendimento clínico infantil, adulto, espaço físico ou consultório compacto), orientar o modelo ideal (Barra de Luz 74cm vs Baby 51cm, Aparelho Tátil com Pulsers/Buzzers ou Kit Integrado), calcular frete por CEP e direcionar para fechamento com desconto no PIX à vista ou parcelado em até 12x no cartão.',
    followUpNiche: 'b2b_services',
    catalogPdfName: 'Manual_Tecnico_Equipamentos_PSI_EMDR.txt',
    preRecordedAudiosEnabled: false,
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se conseguiu avaliar os detalhes da Barra de Luz e do Aparelho Tátil para os seus atendimentos de EMDR na Equipamentos PSI. Temos condições com desconto especial no Pix e envio ágil para o seu consultório! Qualquer dúvida sobre os modelos ou frete, estou por aqui! 🧠🌿',
  },
};

export const CLINIC_STAGES: KanbanStage[] = [
  { id: 'stage-base', name: '📂 Base Pacientes Inativos (+6m)', color: '#6366f1', order: 0 },
  { id: 'stage-reativacao', name: '⚡ Reativação Preventiva (IA)', color: '#ec4899', order: 1 },
  { id: 'stage-1', name: 'Novos Pacientes / Contato', color: '#3b82f6', order: 2, isDefault: true },
  { id: 'stage-2', name: 'Triagem Clínica & Preferências', color: '#f59e0b', order: 3 },
  { id: 'stage-3', name: 'Avaliação Integrativa Agendada', color: '#8b5cf6', order: 4 },
  { id: 'stage-4', name: 'Plano de Tratamento Apresentado', color: '#06b6d4', order: 5 },
  { id: 'stage-5', name: 'Tratamento em Curso / Concluído', color: '#10b981', order: 6 },
  { id: 'stage-6', name: 'Remarcação / Não Compareceu', color: '#ef4444', order: 7 },
];

export const PRIMO_STAGES: KanbanStage[] = [
  { id: 'stage-base', name: '📂 Base Restaurantes Inativos (+6m)', color: '#6366f1', order: 0 },
  { id: 'stage-reativacao', name: '⚡ Reativação Comercial (IA)', color: '#ec4899', order: 1 },
  { id: 'stage-1', name: 'Novos Orçamentos / Dúvidas', color: '#3b82f6', order: 2, isDefault: true },
  { id: 'stage-2', name: 'Especificação & Voltagem (110/220V)', color: '#f59e0b', order: 3 },
  { id: 'stage-3', name: 'Cotação & Frete Calculado', color: '#8b5cf6', order: 4 },
  { id: 'stage-4', name: 'Negociação / Fechamento PIX', color: '#06b6d4', order: 5 },
  { id: 'stage-5', name: 'Pedido Pago / Expedição', color: '#10b981', order: 6 },
  { id: 'stage-6', name: 'Perdido / Desistência', color: '#ef4444', order: 7 },
];

export const SURFACE_STAGES: KanbanStage[] = [
  { id: 'stage-base', name: '📂 Base Industrial Inativa (+6m)', color: '#6366f1', order: 0 },
  { id: 'stage-reativacao', name: '⚡ Reativação Técnica (IA)', color: '#ec4899', order: 1 },
  { id: 'stage-1', name: 'Nova Aplicação / Contato', color: '#3b82f6', order: 2, isDefault: true },
  { id: 'stage-2', name: 'Análise de Substrato (Dyne)', color: '#f59e0b', order: 3 },
  { id: 'stage-3', name: 'Amostras no Lab Surface Test', color: '#8b5cf6', order: 4 },
  { id: 'stage-4', name: 'Proposta Comercial do Sistema', color: '#06b6d4', order: 5 },
  { id: 'stage-5', name: 'Sistema Vendido / Implantado', color: '#10b981', order: 6 },
  { id: 'stage-6', name: 'Invigilância / Standby', color: '#ef4444', order: 7 },
];

export const VERZEL_STAGES: KanbanStage[] = [
  { id: 'stage-base', name: '📂 Base Antiga / Leads Frios', color: '#6366f1', order: 0 },
  { id: 'stage-reativacao', name: '⚡ Reativação Executiva (IA)', color: '#ec4899', order: 1 },
  { id: 'stage-1', name: 'Nova Demanda de TI / App', color: '#3b82f6', order: 2, isDefault: true },
  { id: 'stage-2', name: 'Qualificação de Escopo & Stack', color: '#f59e0b', order: 3 },
  { id: 'stage-3', name: 'Discovery Técnico Agendado', color: '#8b5cf6', order: 4 },
  { id: 'stage-4', name: 'Proposta de Squad / Projeto', color: '#06b6d4', order: 5 },
  { id: 'stage-5', name: 'Contrato Assinado / Kickoff', color: '#10b981', order: 6 },
  { id: 'stage-6', name: 'Sem Budget / Pausado', color: '#ef4444', order: 7 },
];

export const CANTAREIRA_STAGES: KanbanStage[] = [
  { id: 'stage-base', name: '📂 Base Familiar Inativa (+6m)', color: '#6366f1', order: 0 },
  { id: 'stage-reativacao', name: '⚡ Acolhimento Preventivo (IA)', color: '#ec4899', order: 1 },
  { id: 'stage-1', name: 'Nova Família / Primeiro Acolhimento', color: '#3b82f6', order: 2, isDefault: true },
  { id: 'stage-2', name: 'Orientação de Jazigo & Velório', color: '#f59e0b', order: 3 },
  { id: 'stage-3', name: 'Visita ao Parque Agendada', color: '#8b5cf6', order: 4 },
  { id: 'stage-4', name: 'Apresentação de Plano Preventivo', color: '#06b6d4', order: 5 },
  { id: 'stage-5', name: 'Jazigo / Plano Formalizado', color: '#10b981', order: 6 },
  { id: 'stage-6', name: 'Atendimento Concluído', color: '#ef4444', order: 7 },
];

export const EQUIPAMENTOS_PSI_STAGES: KanbanStage[] = [
  { id: 'stage-base', name: '📂 Base Terapeutas / Inativos (+6m)', color: '#6366f1', order: 0 },
  { id: 'stage-reativacao', name: '⚡ Reativação & Upgrades (IA)', color: '#ec4899', order: 1 },
  { id: 'stage-1', name: 'Novos Terapeutas / Dúvidas EMDR', color: '#3b82f6', order: 2, isDefault: true },
  { id: 'stage-2', name: 'Especificação (Barra/Pulsers) & CEP', color: '#f59e0b', order: 3 },
  { id: 'stage-3', name: 'Proposta & Condições (PIX/Cartão)', color: '#8b5cf6', order: 4 },
  { id: 'stage-4', name: 'Pedido Fechado / Aguardando PIX', color: '#06b6d4', order: 5 },
  { id: 'stage-5', name: 'Pago / Embalado & Enviado', color: '#10b981', order: 6 },
  { id: 'stage-6', name: 'Perdido / Desistência', color: '#ef4444', order: 7 },
];

export function getStagesForNiche(niche?: string): KanbanStage[] {
  if (niche === 'primo') return PRIMO_STAGES;
  if (niche === 'surfacebrasil') return SURFACE_STAGES;
  if (niche === 'verzel') return VERZEL_STAGES;
  if (niche === 'cantareira') return CANTAREIRA_STAGES;
  if (niche === 'equipamentospsi') return EQUIPAMENTOS_PSI_STAGES;
  return CLINIC_STAGES;
}

export function normalizeNicheKey(raw?: string | null): string {
  if (!raw) return 'clinic';
  const clean = raw
    .toString()
    .trim()
    .toLowerCase()
    .replace(/^inst[aâ]ncia:\s*/i, '')
    .replace(/[^a-z0-9_-]/g, '-');
  if (!clean) return 'clinic';
  if (
    clean === 'clinic' ||
    clean === 'dental' ||
    clean.includes('lucy') ||
    clean.includes('murata') ||
    clean.includes('dental-integrative') ||
    clean.includes('odonto') ||
    clean.includes('saude') ||
    clean.includes('health') ||
    clean.includes('medica')
  ) {
    return 'clinic';
  }
  if (clean.includes('cantareira') || clean.includes('cemiterio')) {
    return 'cantareira';
  }
  if (
    clean === 'equipamentospsi' ||
    clean === 'psi' ||
    clean === 'equipamentos-psi' ||
    clean === 'equipamentos_psi' ||
    clean.includes('emdr') ||
    clean.includes('barra-de-luz')
  ) {
    return 'equipamentospsi';
  }
  if (clean.includes('surface')) {
    return 'surfacebrasil';
  }
  if (clean.includes('verzel')) {
    return 'verzel';
  }
  if (clean === 'primo' || clean.includes('primo-equipamento') || clean.includes('primo_equipamento')) {
    return 'primo';
  }
  if (clean === 'delivery' || clean === 'restaurant_delivery' || clean === 'pizzaria' || clean === 'restaurante') {
    return 'delivery';
  }
  if (clean === 'ecommerce' || clean === 'retail') {
    return 'ecommerce';
  }
  if (clean === 'b2b' || clean === 'agente-ia' || clean === 'nexa' || clean === 'nexa-crm' || clean === 'nexa_crm' || clean === 'sales') {
    return 'b2b';
  }
  return clean;
}

export function resolveClientLeadWorkspace(lead: Lead): string {
  if (lead.workspaceId && lead.workspaceId.trim()) {
    return normalizeNicheKey(lead.workspaceId);
  }
  if (lead.instanceName && lead.instanceName.trim()) {
    return normalizeNicheKey(lead.instanceName);
  }
  const lowerTags = (lead.tags || []).map((t) => String(t).toLowerCase());
  const notes = (lead.notes || '').toLowerCase();
  const interest = (lead.interest || '').toLowerCase();
  const idStr = String(lead.id || '').toLowerCase();

  for (const t of lowerTags) {
    if (t.startsWith('instância:') || t.startsWith('instancia:')) {
      const instPart = t.replace(/^inst[aâ]ncia:\s*/i, '').trim();
      if (instPart) return normalizeNicheKey(instPart);
    }
  }

  if (lowerTags.some((t) => t.includes('primo')) || notes.includes('primo')) return 'primo';
  if (lowerTags.some((t) => t.includes('surface') || t.includes('plasma')) || notes.includes('surface') || interest.includes('sap02')) return 'surfacebrasil';
  if (lowerTags.some((t) => t.includes('verzel')) || notes.includes('verzel') || interest.includes('verzel')) return 'verzel';
  if (lowerTags.some((t) => t.includes('cantareira') || t.includes('cemiterio') || t.includes('jazigo')) || notes.includes('cantareira')) return 'cantareira';
  if (
    lowerTags.some((t) => t.includes('psi') || t.includes('emdr') || t.includes('terapeuta')) ||
    notes.includes('equipamentospsi') ||
    notes.includes('barra de luz') ||
    interest.includes('emdr') ||
    interest.includes('barra de luz') ||
    interest.includes('pulser')
  ) {
    return 'equipamentospsi';
  }
  if (Boolean(lead.deliveryInfo) || lowerTags.some((t) => t.includes('delivery') || t.includes('pizza'))) return 'delivery';
  if (
    Boolean(lead.triage) ||
    idStr.includes('health') ||
    lowerTags.some((t) => t.includes('murata') || t.includes('lucy') || t.includes('odonto') || t.includes('paciente') || t.includes('dental')) ||
    notes.includes('lucy') ||
    notes.includes('euroville')
  ) {
    return 'clinic';
  }
  return 'b2b';
}

export const getUrlParamNiche = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const raw =
    params.get('empresa') ||
    params.get('company') ||
    params.get('instance') ||
    params.get('instancia') ||
    params.get('nicho') ||
    params.get('workspace') ||
    params.get('cliente') ||
    params.get('c');
  
  if (raw && raw.trim()) {
    const normalized = normalizeNicheKey(raw);
    try {
      localStorage.setItem('nexa_client_nicho', normalized);
    } catch {}
    return normalized;
  }
  
  try {
    const saved = localStorage.getItem('nexa_client_nicho');
    if (saved && saved.trim()) return normalizeNicheKey(saved);
  } catch {}
  return 'clinic';
};

export default function App() {
  const [activeUrlNiche, setActiveUrlNiche] = useState<string>(() => getUrlParamNiche() || 'clinic');

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'kanban' | 'chat' | 'calendar' | 'sales' | 'delivery' | 'agent' | 'evolution' | 'supabase'
  >(() => (activeUrlNiche === 'delivery' ? 'delivery' : 'kanban'));

  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [stages, setStages] = useState<KanbanStage[]>(() => getStagesForNiche(activeUrlNiche));

  useEffect(() => {
    setStages(getStagesForNiche(activeUrlNiche));
  }, [activeUrlNiche]);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Sync workspace from URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const empresa = params.get('empresa') || params.get('nicho');
      if (empresa) {
        const normalized = normalizeNicheKey(empresa);
        if (normalized !== activeUrlNiche) {
          setActiveUrlNiche(normalized);
        }
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [activeUrlNiche]);

  const [agentConfig, setAgentConfig] = useState<AgentConfig>(() => {
    const base: AgentConfig = {
      personaName: 'Sofia Mendes',
      role: 'Especialista em Soluções Comerciais NEXA',
      toneOfVoice: 'Profissional, empático, consultivo e focado em conversão',
      salesGoal: 'Qualificar leads, tirar dúvidas pelo catálogo e conduzir fechamento',
      activeProvider: 'gemini',
      activeModel: 'gemini-2.5-flash',
      knowledgeFaq: '',
      knowledgeCatalog: '',
      knowledgePricing: '',
      knowledgeRules: '',
      strictKnowledgeOnly: true,
      autoTriggerCRMStages: true,
      isGlobalAiActive: true,
      testModeEnabled: false,
      testNumberWhitelist: '',
    };
    if (activeUrlNiche && WORKSPACE_PRESETS[activeUrlNiche]) {
      return { ...base, ...WORKSPACE_PRESETS[activeUrlNiche] };
    }
    return base;
  });

  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>({
    serverUrl: '',
    apiKey: '',
    instanceName: '',
    isConnected: false,
    state: 'disconnected',
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: '',
    serviceKey: '',
    anonKey: '',
    isConnected: false,
  });

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Admin Mestre state (defaults to true unless explicitly in client mode)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('modo') === 'cliente' || params.get('cliente') === 'true' || params.get('client') === 'true') {
        return false;
      }
    }
    const stored = localStorage.getItem('nexa_admin_unlocked');
    if (stored === 'false') return false;
    // Default to true
    localStorage.setItem('nexa_admin_unlocked', 'true');
    return true;
  });

  // Restrict tabs in client mode (!isAdminUnlocked)
  React.useEffect(() => {
    if (!isAdminUnlocked && (activeTab === 'sales' || activeTab === 'agent' || activeTab === 'evolution' || activeTab === 'supabase')) {
      setActiveTab('kanban');
    }
  }, [isAdminUnlocked, activeTab]);

  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [showExecutiveGuide, setShowExecutiveGuide] = useState(true);
  const pwaState = usePWA();
  const [showIOSGuideModal, setShowIOSGuideModal] = useState(false);

  const handleUnlockAdmin = () => {
    setIsAdminUnlocked(true);
  };

  const handleLockAdmin = () => {
    localStorage.removeItem('nexa_admin_unlocked');
    setIsAdminUnlocked(false);
    // If on a technical tab, return safely to kanban
    if (activeTab === 'agent' || activeTab === 'evolution' || activeTab === 'supabase') {
      setActiveTab('kanban');
    }
  };

  // Helper to sanitize Lead objects against null/undefined fields & enrich Cognitive DNA
  const sanitizeLeads = (rawLeads: any): Lead[] => {
    if (!Array.isArray(rawLeads)) return [];
    return rawLeads
      .filter((l) => l && typeof l === 'object' && l.id)
      .map((l) => {
        const tags: string[] = Array.isArray(l.tags) ? l.tags.filter(Boolean).map(String) : [];
        const isDelivery = Boolean(l.deliveryInfo) || tags.some((t) => t.toLowerCase().includes('delivery') || t.toLowerCase().includes('restaurante'));
        const isClinic = Boolean(l.triage) || tags.some((t) => /consulta|paciente|odonto|clínica|clinica|retorno|exame/i.test(t)) || String(l.id).includes('health');

        const defaultCognitive = l.cognitiveProfile || (
          isDelivery
            ? {
                preferences: ['Sem cebola / ponto bem passado', 'Bebida bem gelada', 'Pagamento rápido via PIX'],
                restrictionsOrObjections: ['Sensível a atrasos acima de 40 min'],
                recurringHabits: 'Costuma pedir à noite e finais de semana no mesmo endereço',
                vipNotes: 'Cliente recorrente — oferecer combo ou sobremesa com desconto aumenta ticket em 30%',
              }
            : isClinic
            ? {
                preferences: ['Horários no fim da tarde', 'Atendimento acolhedor e sem pressa', 'Explicação detalhada do procedimento'],
                restrictionsOrObjections: ['Receio de procedimentos invasivos / sensibilidade'],
                recurringHabits: 'Paciente preventivo — responde muito bem a lembretes semestrais no WhatsApp',
                vipNotes: 'Priorizar encaixe com a especialista titular e envio de áudio de boas-vindas',
              }
            : {
                preferences: ['Atendimento objetivo pelo WhatsApp', 'Proposta comercial em PDF claro'],
                restrictionsOrObjections: ['Compara custo-benefício e retorno sobre investimento (ROI)'],
                recurringHabits: 'Interage principalmente em horário comercial',
                vipNotes: 'Decisor comercial — destacar economia de tempo e automação 24/7',
              }
        );

        return {
          ...l,
          name: String(l.name || 'Lead Sem Nome'),
          phone: String(l.phone || ''),
          stageId: String(l.stageId || 'stage-1'),
          value: typeof l.value === 'number' && !Number.isNaN(l.value) ? l.value : Number(l.value) || 0,
          tags,
          aiPaused: Boolean(l.aiPaused),
          lastInteraction: l.lastInteraction || new Date().toISOString(),
          createdAt: l.createdAt || new Date().toISOString(),
          cognitiveProfile: defaultCognitive,
        };
      });
  };

  // Initial load
  const loadAllData = async () => {
    try {
      const [stagesRes, leadsRes, agentRes, evoRes, supaRes, docsRes] = await Promise.all([
        fetch('/api/stages').catch(() => null),
        fetch('/api/leads').catch(() => null),
        fetch('/api/agent-config').catch(() => null),
        fetch('/api/evolution-config').catch(() => null),
        fetch('/api/supabase-config').catch(() => null),
        fetch('/api/documents').catch(() => null),
      ]);

      if (stagesRes && stagesRes.ok) {
        const rawStages = await stagesRes.json();
        if (Array.isArray(rawStages)) setStages(rawStages);
      }
      if (leadsRes && leadsRes.ok) {
        const loadedLeads = sanitizeLeads(await leadsRes.json());
        setLeads(loadedLeads);
        if (!selectedLeadId && loadedLeads.length > 0) {
          setSelectedLeadId(loadedLeads[0].id);
        }
      }
      if (agentRes && agentRes.ok) {
        const cfg = await agentRes.json();
        if (cfg && typeof cfg === 'object') {
          const defaultZones = [
            { id: 'zone-1', regionName: 'Centro & Bairros Próximos (Até 3km)', keywords: 'centro, paulista, jardins, vila mariana, euroville', fee: 6.0, etaMinutes: 20 },
            { id: 'zone-2', regionName: 'Zona Sul / Zona Oeste (3km a 7km)', keywords: 'moema, itaim, pinheiros, perdizes, santana, tatuapé', fee: 12.0, etaMinutes: 35 },
            { id: 'zone-3', regionName: 'Regiões Afastadas / Condomínios (+7km)', keywords: 'alphaville, granja, interlagos, morumbi, barra funda', fee: 18.0, etaMinutes: 45 },
          ];
          setAgentConfig((prev) => {
            let merged = {
              ...prev,
              ...cfg,
              deliveryZones: Array.isArray(cfg.deliveryZones) && cfg.deliveryZones.length > 0 ? cfg.deliveryZones : defaultZones,
              freeShippingMinimum: cfg.freeShippingMinimum ?? 120,
            };
            if (activeUrlNiche && WORKSPACE_PRESETS[activeUrlNiche]) {
              merged = { ...merged, ...WORKSPACE_PRESETS[activeUrlNiche] };
            }
            return merged;
          });
        }
      }
      // Re-fetch specific agent config if workspace changed
      const workspaceSpecificAgentRes = await fetch(`/api/agent-config?workspace=${encodeURIComponent(activeUrlNiche)}`).catch(() => null);
      if (workspaceSpecificAgentRes && workspaceSpecificAgentRes.ok) {
        const workspaceCfg = await workspaceSpecificAgentRes.json();
        if (workspaceCfg && typeof workspaceCfg === 'object') {
           setAgentConfig((prev) => ({ ...prev, ...workspaceCfg }));
        }
      }

      if (evoRes && evoRes.ok) {
        const evo = await evoRes.json();
        if (evo && typeof evo === 'object') {
          setEvolutionConfig((prev) => ({
            ...prev,
            ...evo,
          }));
        }
      }
      if (supaRes && supaRes.ok) {
        const supa = await supaRes.json();
        if (supa && typeof supa === 'object') setSupabaseConfig((prev) => ({ ...prev, ...supa }));
      }
      if (docsRes && docsRes.ok) {
        const docs = await docsRes.json();
        if (Array.isArray(docs)) setDocuments(docs);
      }
    } catch (err) {
      console.error('Falha ao carregar dados do servidor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Periodic polling for real-time CRM updates (when webhook receives new messages)
  useEffect(() => {
    let pollCount = 0;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          const freshLeads = sanitizeLeads(await res.json());
          setLeads(freshLeads);
        }

        // Check Evolution connection status every ~5s
        pollCount++;
        if (pollCount % 2 === 0) {
          const evoRes = await fetch('/api/evolution-config');
          if (evoRes.ok) {
            const freshEvo = await evoRes.json();
            if (freshEvo && typeof freshEvo === 'object') {
              const isViewingEvolutionTab = activeTabRef.current === 'evolution';
              setEvolutionConfig((prev) => {
                // If the user is on the Evolution Settings tab, keep their active instance stable and only update connection status/instanceApiKeys
                if (isViewingEvolutionTab) {
                  return {
                    ...prev,
                    isConnected: freshEvo.isConnected,
                    state: freshEvo.state,
                    qrcode: freshEvo.qrcode,
                    serverUrl: prev.serverUrl || freshEvo.serverUrl,
                    instanceApiKeys: {
                      ...(freshEvo.instanceApiKeys || {}),
                      ...(prev.instanceApiKeys || {}),
                    },
                  };
                }

                let targetInst = freshEvo.instanceName;
                if (activeUrlNiche === 'surfacebrasil') targetInst = 'surfacebrasil';
                else if (activeUrlNiche === 'verzel') targetInst = 'verzel';
                else if (activeUrlNiche === 'primo') targetInst = 'primo-equipamentos';
                else if (activeUrlNiche === 'equipamentospsi') targetInst = 'equipamentospsi';
                else if (activeUrlNiche === 'clinic') targetInst = 'dental-integrative';
                else if (activeUrlNiche === 'cantareira') targetInst = 'cemiterio-cantareira';
                else if (activeUrlNiche === 'b2b') targetInst = 'agente-ia';
                
                const targetKey = (targetInst && freshEvo.instanceApiKeys?.[targetInst]) || freshEvo.apiKey;
                return {
                  ...prev,
                  ...freshEvo,
                  instanceName: targetInst,
                  apiKey: targetKey || prev.apiKey,
                };
              });
            }
          }
        }
      } catch (err) {}
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Action Handlers
  const handleMoveLead = async (leadId: string, targetStageId: string) => {
    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stageId: targetStageId } : l))
    );

    try {
      await fetch(`/api/leads/${leadId}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId: targetStageId }),
      });
    } catch (err) {
      console.error('Erro ao mover estágio:', err);
    }
  };

  const handleSaveLead = async (leadData: Partial<Lead>, leadId?: string): Promise<Lead | undefined> => {
    try {
      if (leadId) {
        const res = await fetch(`/api/leads/${leadId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
        });
        if (res.ok) {
          const updated = await res.json();
          setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
          return updated;
        }
      } else {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...leadData,
            workspaceId: activeUrlNiche,
            instanceName: evolutionConfig.instanceName || activeUrlNiche,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setLeads((prev) => [created, ...prev]);
          return created;
        }
      }
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
    }
    return undefined;
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, { method: 'DELETE' });
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      if (selectedLeadId === leadId) {
        setSelectedLeadId(leads.find((l) => l.id !== leadId)?.id || null);
      }
    } catch (err) {
      console.error('Erro ao excluir lead:', err);
    }
  };

  const handleClearAllLeads = async () => {
    try {
      const res = await fetch('/api/leads/clear-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace: activeUrlNiche }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(Array.isArray(data.leads) ? sanitizeLeads(data.leads) : []);
        setSelectedLeadId(null);
      }
    } catch (err) {
      console.error('Erro ao limpar base de leads:', err);
    }
  };

  const handleRestoreDemoLeads = async () => {
    try {
      const res = await fetch('/api/leads/restore-demo', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        if (data.leads.length > 0) {
          setSelectedLeadId(data.leads[0].id);
        }
      }
    } catch (err) {
      console.error('Erro ao restaurar dados de demo:', err);
    }
  };

  const handleOpenChat = (leadId: string) => {
    setSelectedLeadId(leadId);
    setActiveTab('chat');
  };

  const handleToggleAi = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/ai-toggle`, { method: 'PUT' });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
      }
    } catch (err) {
      console.error('Erro ao alternar IA:', err);
    }
  };

  const handleResolveUrgency = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/resolve-urgency`, { method: 'PUT' });
      if (res.ok) {
        const updatedLead = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));
      }
    } catch (err) {
      console.error('Erro ao resolver urgência:', err);
    }
  };

  const handleConfirmTriage = async (leadId: string, confirmedDate: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/confirm-triage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmedDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
      }
    } catch (err) {
      console.error('Erro ao confirmar triagem:', err);
    }
  };

  const handleSendManualMessage = async (
    leadId: string,
    text: string,
    sendViaWhatsApp: boolean
  ) => {
    try {
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, text, sendViaWhatsApp }),
      });
    } catch (err) {
      console.error('Erro ao enviar mensagem manual:', err);
    }
  };

  const handleUpdateLeadNotes = async (leadId: string, notes: string) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, notes } : l)));
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } catch (err) {
      console.error('Erro ao atualizar anotações:', err);
    }
  };

  const handleSaveAgentConfig = async (updated: Partial<AgentConfig> | AgentConfig) => {
    try {
      const merged = { ...agentConfig, ...updated };
      setAgentConfig(merged);
      const res = await fetch('/api/agent-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged),
      });
      if (res.ok) {
        setAgentConfig(await res.json());
      }
    } catch (err) {
      console.error('Erro ao salvar agente:', err);
    }
  };

  const handleUploadDocument = async (doc: {
    name: string;
    type: 'pdf' | 'txt' | 'docx';
    contentText: string;
    size: number;
  }) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments((prev) => [...prev, newDoc]);
      }
    } catch (err) {
      console.error('Erro ao salvar documento:', err);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Erro ao deletar documento:', err);
    }
  };

  const handleSaveEvolutionConfig = async (config: EvolutionConfig) => {
    try {
      const res = await fetch('/api/evolution-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        const savedEvo = await res.json();
        setEvolutionConfig(savedEvo);
        if (config.instanceName) {
          const newWk = normalizeNicheKey(config.instanceName);
          setActiveUrlNiche(newWk);
          try {
            localStorage.setItem('nexa_client_nicho', newWk);
          } catch {}
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('nicho', newWk);
            window.history.replaceState({}, '', url.pathname + url.search);
          }
          const preset = WORKSPACE_PRESETS[newWk];
          if (preset) {
            setAgentConfig((prev) => ({ ...prev, ...preset }));
          }
        }
      }
    } catch (err) {
      console.error('Erro ao salvar Evolution config:', err);
    }
  };

  const handleTestEvolutionConnection = async () => {
    try {
      const res = await fetch('/api/evolution/test-connection', { method: 'POST' });
      if (res.ok) {
        setEvolutionConfig(await res.json());
      }
    } catch (err) {
      console.error('Erro ao testar conexão Evolution:', err);
    }
  };

  const handleSimulateWebhook = async (
    phone: string,
    message: string,
    pushName: string,
    mediaType?: 'text' | 'audio' | 'document' | 'image',
    fileName?: string
  ) => {
    try {
      await fetch('/api/webhook/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          message,
          pushName,
          mediaType,
          fileName,
          instanceName: evolutionConfig.instanceName,
          workspaceId: activeUrlNiche,
        }),
      });
      // Quick refresh of leads
      setTimeout(async () => {
        const res = await fetch('/api/leads');
        if (res.ok) setLeads(sanitizeLeads(await res.json()));
      }, 1500);
    } catch (err) {
      console.error('Erro ao simular webhook:', err);
    }
  };

  const handleSaveSupabaseConfig = async (config: SupabaseConfig) => {
    try {
      const res = await fetch('/api/supabase-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSupabaseConfig(await res.json());
      }
    } catch (err) {
      console.error('Erro ao salvar Supabase config:', err);
    }
  };

  const handleToggleGlobalAi = async () => {
    const updated = {
      ...agentConfig,
      isGlobalAiActive: agentConfig.isGlobalAiActive === false ? true : false,
    };
    await handleSaveAgentConfig(updated);
  };

  const handleToggleHotLead = async (leadId: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/toggle-hot`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotReason: 'Marcado pelo operador' }),
      });
      if (res.ok) {
        const updatedLead = await res.json();
        setLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));
      } else {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  isHotLead: !l.isHotLead,
                  hotReason: !l.isHotLead ? 'Marcado manualmente' : undefined,
                }
              : l
          )
        );
      }
    } catch (err) {
      console.error('Erro ao alternar status de lead quente:', err);
    }
  };

  const handleConfirmPixReceipt = async (leadId: string, paidAmount?: number) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/confirm-pix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidAmount, sendWhatsAppConfirmation: true }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lead) {
          const [sanitized] = sanitizeLeads([data.lead]);
          if (sanitized) {
            setLeads((prev) => prev.map((l) => (l.id === leadId ? sanitized : l)));
          }
        }
      }
    } catch (err) {
      console.error('Erro ao validar comprovante PIX:', err);
    }
  };

  const handleSwitchWorkspacePreset = async (workspaceId: string) => {
    const normalizedWk = normalizeNicheKey(workspaceId);
    setActiveUrlNiche(normalizedWk);
    try {
      localStorage.setItem('nexa_client_nicho', normalizedWk);
      const kanbanMode =
        normalizedWk === 'clinic'
          ? 'health'
          : normalizedWk === 'delivery'
          ? 'restaurant'
          : 'all';
      localStorage.setItem('nexa_crm_kanban_niche', kanbanMode);
      const url = new URL(window.location.href);
      url.searchParams.set('nicho', normalizedWk);
      window.history.replaceState({}, '', url.pathname + url.search);
    } catch {}

    const chosen = WORKSPACE_PRESETS[normalizedWk];
    const targetInst =
      normalizedWk === 'surfacebrasil'
        ? 'surfacebrasil'
        : normalizedWk === 'verzel'
        ? 'verzel'
        : normalizedWk === 'primo'
        ? 'primo-equipamentos'
        : normalizedWk === 'equipamentospsi'
        ? 'equipamentospsi'
        : normalizedWk === 'cantareira'
        ? 'cemiterio-cantareira'
        : normalizedWk === 'clinic'
        ? 'dental-integrative'
        : normalizedWk === 'b2b'
        ? 'agente-ia'
        : normalizedWk;

    const dedicatedKey = evolutionConfig.instanceApiKeys?.[targetInst] || evolutionConfig.apiKey;
    const updatedEvo = {
      ...evolutionConfig,
      instanceName: targetInst,
      ...(dedicatedKey ? { apiKey: dedicatedKey } : {}),
    };
    setEvolutionConfig(updatedEvo);
    fetch('/api/evolution-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedEvo),
    }).catch(() => {});

    if (chosen) {
      setAgentConfig((prev) => ({ ...prev, ...chosen }));
    } else {
      // Custom instance/box: fetch its isolated config from backend
      fetch(`/api/agent-config?workspace=${encodeURIComponent(normalizedWk)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((cfg) => {
          if (cfg) setAgentConfig((prev) => ({ ...prev, ...cfg }));
        })
        .catch(() => {});
    }

    if (normalizedWk === 'delivery') {
      setActiveTab('delivery');
    } else if (activeTab !== 'agent' && activeTab !== 'evolution') {
      setActiveTab('kanban');
    }
  };

  // Strictly isolate leads per workspace box! Never fallback to returning all leads when a box is empty.
  const filteredLeads = React.useMemo(() => {
    if (!activeUrlNiche || activeUrlNiche === 'all') {
      return leads;
    }
    const targetWk = normalizeNicheKey(activeUrlNiche);
    return leads.filter((l) => resolveClientLeadWorkspace(l) === targetWk);
  }, [leads, activeUrlNiche]);

  // Keep selectedLeadId strictly inside the active workspace's filteredLeads so LiveChat never shows another box's conversation
  useEffect(() => {
    if (filteredLeads.length === 0) {
      if (selectedLeadId !== null) setSelectedLeadId(null);
    } else if (!selectedLeadId || !filteredLeads.some((l) => l.id === selectedLeadId)) {
      setSelectedLeadId(filteredLeads[0].id);
    }
  }, [activeUrlNiche, filteredLeads, selectedLeadId]);

  const totalPipelineValue = filteredLeads.reduce((acc, l) => acc + (l.value || 0), 0);
  const totalUnreadCount = filteredLeads.reduce((acc, l) => acc + (l.unreadCount || 0), 0);
  const urgentCount = filteredLeads.filter((l) => l.isUrgent).length;
  const hotCount = filteredLeads.filter((l) => l.isHotLead).length;
  const deliveryOrdersCount = filteredLeads.filter((l) => Boolean(l.deliveryInfo)).length;

  // Check if current URL is in public order tracking mode (?rastreio=PED-XXX or ?track=PED-XXX)
  const [publicTrackingOrder, setPublicTrackingOrder] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const trackingCode = params.get('rastreio') || params.get('track') || params.get('pedido');
      if (trackingCode) return trackingCode;
      if (window.location.pathname.startsWith('/track/')) {
        return window.location.pathname.replace('/track/', '');
      }
    }
    return null;
  });

  if (publicTrackingOrder) {
    return (
      <PublicOrderTracking
        orderNumber={publicTrackingOrder}
        onBackToCrm={
          isAdminUnlocked
            ? () => {
                const url = new URL(window.location.href);
                url.searchParams.delete('rastreio');
                url.searchParams.delete('track');
                url.searchParams.delete('pedido');
                window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
                setPublicTrackingOrder(null);
              }
            : undefined
        }
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 space-y-3">
        <div className="w-9 h-9 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono tracking-wider text-slate-600">Carregando plataforma NEXA CRM...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Global Header with Admin Controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        evolutionConfig={evolutionConfig}
        agentConfig={agentConfig}
        totalLeads={filteredLeads.length}
        totalPipelineValue={totalPipelineValue}
        unreadCount={totalUnreadCount}
        urgentCount={urgentCount}
        hotCount={hotCount}
        deliveryOrdersCount={deliveryOrdersCount}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminAuth={() => setShowAdminAuthModal(true)}
        onLockAdmin={handleLockAdmin}
        onToggleGlobalAi={handleToggleGlobalAi}
        activeWorkspaceId={activeUrlNiche}
        onSwitchWorkspace={handleSwitchWorkspacePreset}
        onShowGuide={() => setShowExecutiveGuide(true)}
        pwaState={pwaState}
        onOpenIOSGuide={() => setShowIOSGuideModal(true)}
      />

      {/* Main Content Modules */}
      <main className="flex-1 flex min-h-0 overflow-hidden bg-slate-50">
        {activeTab === 'dashboard' && (
          <ErrorBoundary moduleName="Dashboard Executivo">
            <ExecutiveDashboard
              leads={filteredLeads}
              stages={stages}
              agentConfig={agentConfig}
              evolutionConfig={evolutionConfig}
              onOpenChat={handleOpenChat}
              onNavigateToTab={(tab) => setActiveTab(tab)}
              onUpdateEvolutionConfig={handleSaveEvolutionConfig}
              onUpdateAgentConfig={handleSaveAgentConfig}
              onClearAllLeads={handleClearAllLeads}
              onRestoreDemoLeads={handleRestoreDemoLeads}
              isAdmin={isAdminUnlocked}
              showExecutiveGuide={showExecutiveGuide}
              setShowExecutiveGuide={setShowExecutiveGuide}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'kanban' && (
          <ErrorBoundary moduleName="CRM Kanban">
            <KanbanBoard
              stages={stages}
              leads={filteredLeads}
              onMoveLead={handleMoveLead}
              onSaveLead={handleSaveLead}
              onDeleteLead={handleDeleteLead}
              onOpenChat={handleOpenChat}
              onToggleAi={handleToggleAi}
              onResolveUrgency={handleResolveUrgency}
              onToggleHotLead={handleToggleHotLead}
              onConfirmPixReceipt={handleConfirmPixReceipt}
              onClearAllLeads={handleClearAllLeads}
              onRestoreDemoLeads={handleRestoreDemoLeads}
              onRefreshLeads={loadAllData}
              onNavigateToDelivery={() => setActiveTab('delivery')}
              evolutionConfig={evolutionConfig}
              isAdmin={isAdminUnlocked}
              agentConfig={agentConfig}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'chat' && (
          <ErrorBoundary moduleName="Central de Chat">
            <LiveChat
              leads={filteredLeads}
              selectedLeadId={selectedLeadId}
              onSelectLead={(id) => setSelectedLeadId(id)}
              stages={stages}
              onMoveLead={handleMoveLead}
              onToggleAi={handleToggleAi}
              onSendManualMessage={handleSendManualMessage}
              onUpdateLeadNotes={handleUpdateLeadNotes}
              onResolveUrgency={handleResolveUrgency}
              onConfirmTriage={handleConfirmTriage}
              onConfirmPixReceipt={handleConfirmPixReceipt}
              onDeleteLead={handleDeleteLead}
              onSaveLead={handleSaveLead}
              personaName={agentConfig?.personaName || 'Sofia'}
              pixKey={agentConfig?.pixKey || 'financeiro@nexacrm.com.br'}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'calendar' && (
          <ErrorBoundary moduleName="Agendamentos & Agenda">
            <CalendarIntegration
              agentConfig={agentConfig}
              leads={filteredLeads}
              onUpdateAgentConfig={handleSaveAgentConfig}
              onRefreshLeads={loadAllData}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'sales' && (
          <ErrorBoundary moduleName="Guia Comercial & Vendas">
            <SalesPlaybook />
          </ErrorBoundary>
        )}

        {activeTab === 'delivery' && (
          <ErrorBoundary moduleName="Pedidos & Entregas">
            <DeliveryTracking
              leads={filteredLeads}
              onSaveLead={handleSaveLead}
              onOpenChat={handleOpenChat}
              evolutionConfig={evolutionConfig}
              agentConfig={agentConfig}
              onUpdateAgentConfig={handleSaveAgentConfig}
              onConfirmPixReceipt={handleConfirmPixReceipt}
            />
          </ErrorBoundary>
        )}

        {/* Technical Modules (Protected: only rendered if admin is unlocked) */}
        {activeTab === 'agent' && isAdminUnlocked && (
          <ErrorBoundary moduleName="Agente & Conhecimento">
            <AgentBuilder
              agentConfig={agentConfig}
              documents={documents}
              onSaveConfig={handleSaveAgentConfig}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              onSwitchWorkspace={handleSwitchWorkspacePreset}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'evolution' && isAdminUnlocked && (
          <ErrorBoundary moduleName="Evolution API">
            <EvolutionSettings
              evolutionConfig={evolutionConfig}
              onSaveConfig={handleSaveEvolutionConfig}
              onTestConnection={handleTestEvolutionConnection}
              onSimulateWebhook={handleSimulateWebhook}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'supabase' && isAdminUnlocked && (
          <ErrorBoundary moduleName="Supabase">
            <SupabaseSettings
              supabaseConfig={supabaseConfig}
              onSaveConfig={handleSaveSupabaseConfig}
            />
          </ErrorBoundary>
        )}
      </main>

      {/* Admin Authentication Modal */}
      <AdminAuthModal
        isOpen={showAdminAuthModal}
        onClose={() => setShowAdminAuthModal(false)}
        onSuccess={handleUnlockAdmin}
      />

      {/* PWA Version Update Banner and iOS Install Modal */}
      <PWAUpdateBanner
        pwaState={pwaState}
        showIOSModal={showIOSGuideModal}
        setShowIOSModal={setShowIOSGuideModal}
      />
    </div>
  );
}
