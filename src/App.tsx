import React, { useState, useEffect } from 'react';
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
import {
  Lead,
  KanbanStage,
  AgentConfig,
  EvolutionConfig,
  SupabaseConfig,
  KnowledgeDocument,
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'kanban' | 'chat' | 'calendar' | 'sales' | 'delivery' | 'agent' | 'evolution' | 'supabase'
  >('kanban');

  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
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

  // Admin Mestre state (defaults to true if unlocked in localStorage, or false for clean client mode)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('modo') || params.has('cliente') || params.has('client')) {
        return false;
      }
    }
    return localStorage.getItem('nexa_admin_unlocked') === 'true';
  });

  // Restrict tabs in client mode (!isAdminUnlocked)
  React.useEffect(() => {
    if (!isAdminUnlocked && (activeTab === 'sales' || activeTab === 'agent' || activeTab === 'evolution' || activeTab === 'supabase')) {
      setActiveTab('kanban');
    }
  }, [isAdminUnlocked, activeTab]);

  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [showExecutiveGuide, setShowExecutiveGuide] = useState(true);

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
          setAgentConfig((prev) => ({
            ...prev,
            ...cfg,
            deliveryZones: Array.isArray(cfg.deliveryZones) && cfg.deliveryZones.length > 0 ? cfg.deliveryZones : defaultZones,
            freeShippingMinimum: cfg.freeShippingMinimum ?? 120,
          }));
        }
      }
      if (evoRes && evoRes.ok) {
        const evo = await evoRes.json();
        if (evo && typeof evo === 'object') setEvolutionConfig((prev) => ({ ...prev, ...evo }));
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
              setEvolutionConfig((prev) => ({ ...prev, ...freshEvo }));
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

  const handleSaveLead = async (leadData: Partial<Lead>, leadId?: string) => {
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
        }
      } else {
        const res = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadData),
        });
        if (res.ok) {
          const created = await res.json();
          setLeads((prev) => [created, ...prev]);
        }
      }
    } catch (err) {
      console.error('Erro ao salvar lead:', err);
    }
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
      const res = await fetch('/api/leads/clear-all', { method: 'POST' });
      if (res.ok) {
        setLeads([]);
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
        setEvolutionConfig(await res.json());
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
        body: JSON.stringify({ phone, message, pushName, mediaType, fileName }),
      });
      // Quick refresh of leads
      setTimeout(async () => {
        const res = await fetch('/api/leads');
        if (res.ok) setLeads(await res.json());
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

  const handleSwitchWorkspacePreset = async (workspaceId: 'clinic' | 'delivery' | 'ecommerce' | 'b2b' | 'surfacebrasil') => {
    const presets: Record<string, Partial<AgentConfig>> = {
      clinic: {
        activeWorkspaceName: 'Clínica & Saúde Integrativa',
        personaName: 'Sofia (Recepção Clínica)',
        role: 'Coordenadora de Atendimento & Triagem Clínica',
        followUpNiche: 'dental',
        salesGoal: 'Acolher pacientes, realizar pré-triagem de sintomas/horários e agendar consultas e retornos da base antiga',
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
    };
    const chosen = presets[workspaceId];
    if (chosen) {
      await handleSaveAgentConfig(chosen);
      if (workspaceId === 'surfacebrasil') {
        const updatedEvo = { ...evolutionConfig, instanceName: 'surfacebrasil' };
        setEvolutionConfig(updatedEvo);
        try {
          await fetch('/api/evolution-config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedEvo),
          });
        } catch (e) {}
      }
      if (workspaceId === 'delivery') {
        setActiveTab('delivery');
      } else {
        setActiveTab('kanban');
      }
    }
  };

  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const totalUnreadCount = leads.reduce((acc, l) => acc + (l.unreadCount || 0), 0);
  const urgentCount = leads.filter((l) => l.isUrgent).length;
  const hotCount = leads.filter((l) => l.isHotLead).length;
  const deliveryOrdersCount = leads.filter((l) => Boolean(l.deliveryInfo)).length;

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Global Header with Admin Controls */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        evolutionConfig={evolutionConfig}
        agentConfig={agentConfig}
        totalLeads={leads.length}
        totalPipelineValue={totalPipelineValue}
        unreadCount={totalUnreadCount}
        urgentCount={urgentCount}
        hotCount={hotCount}
        deliveryOrdersCount={deliveryOrdersCount}
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminAuth={() => setShowAdminAuthModal(true)}
        onLockAdmin={handleLockAdmin}
        onToggleGlobalAi={handleToggleGlobalAi}
        onSwitchWorkspace={handleSwitchWorkspacePreset}
        onShowGuide={() => setShowExecutiveGuide(true)}
      />

      {/* Main Content Modules */}
      <main className="flex-1 flex min-h-0 overflow-hidden bg-slate-50">
        {activeTab === 'dashboard' && (
          <ErrorBoundary moduleName="Dashboard Executivo">
            <ExecutiveDashboard
              leads={leads}
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
              leads={leads}
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
            />
          </ErrorBoundary>
        )}

        {activeTab === 'chat' && (
          <ErrorBoundary moduleName="Central de Chat">
            <LiveChat
              leads={leads}
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
              personaName={agentConfig?.personaName || 'Sofia'}
              pixKey={agentConfig?.pixKey || 'financeiro@nexacrm.com.br'}
            />
          </ErrorBoundary>
        )}

        {activeTab === 'calendar' && (
          <ErrorBoundary moduleName="Agendamentos & Agenda">
            <CalendarIntegration
              agentConfig={agentConfig}
              leads={leads}
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
              leads={leads}
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
    </div>
  );
}
