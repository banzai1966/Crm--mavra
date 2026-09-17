import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { LiveChat } from './components/LiveChat';
import { AgentBuilder } from './components/AgentBuilder';
import { EvolutionSettings } from './components/EvolutionSettings';
import { SupabaseSettings } from './components/SupabaseSettings';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
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
    'dashboard' | 'kanban' | 'chat' | 'agent' | 'evolution' | 'supabase'
  >('kanban');

  const [stages, setStages] = useState<KanbanStage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    personaName: 'Sofia Mendes',
    role: 'Especialista em Soluções Comerciais MAVRA',
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
    return localStorage.getItem('nexa_admin_unlocked') === 'true';
  });
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);

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

  // Initial load
  const loadAllData = async () => {
    try {
      const [stagesRes, leadsRes, agentRes, evoRes, supaRes, docsRes] = await Promise.all([
        fetch('/api/stages'),
        fetch('/api/leads'),
        fetch('/api/agent-config'),
        fetch('/api/evolution-config'),
        fetch('/api/supabase-config'),
        fetch('/api/documents'),
      ]);

      if (stagesRes.ok) setStages(await stagesRes.json());
      if (leadsRes.ok) {
        const loadedLeads: Lead[] = await leadsRes.json();
        setLeads(loadedLeads);
        if (!selectedLeadId && loadedLeads.length > 0) {
          setSelectedLeadId(loadedLeads[0].id);
        }
      }
      if (agentRes.ok) setAgentConfig(await agentRes.json());
      if (evoRes.ok) setEvolutionConfig(await evoRes.json());
      if (supaRes.ok) setSupabaseConfig(await supaRes.json());
      if (docsRes.ok) setDocuments(await docsRes.json());
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
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          const freshLeads: Lead[] = await res.json();
          setLeads(freshLeads);
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

  const handleSaveAgentConfig = async (updated: AgentConfig) => {
    try {
      const res = await fetch('/api/agent-config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
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

  const totalPipelineValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
  const totalUnreadCount = leads.reduce((acc, l) => acc + (l.unreadCount || 0), 0);
  const urgentCount = leads.filter((l) => l.isUrgent).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500 space-y-3">
        <div className="w-9 h-9 border-3 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-mono tracking-wider text-slate-600">Carregando plataforma MAVRA CRM...</p>
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
        isAdminUnlocked={isAdminUnlocked}
        onOpenAdminAuth={() => setShowAdminAuthModal(true)}
        onLockAdmin={handleLockAdmin}
      />

      {/* Main Content Modules */}
      <main className="flex-1 flex min-h-0 overflow-hidden bg-slate-50">
        {activeTab === 'dashboard' && (
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
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard
            stages={stages}
            leads={leads}
            onMoveLead={handleMoveLead}
            onSaveLead={handleSaveLead}
            onDeleteLead={handleDeleteLead}
            onOpenChat={handleOpenChat}
            onToggleAi={handleToggleAi}
            onResolveUrgency={handleResolveUrgency}
            onClearAllLeads={handleClearAllLeads}
            onRestoreDemoLeads={handleRestoreDemoLeads}
            isAdmin={isAdminUnlocked}
          />
        )}

        {activeTab === 'chat' && (
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
            onDeleteLead={handleDeleteLead}
          />
        )}

        {/* Technical Modules (Protected: only rendered if admin is unlocked) */}
        {activeTab === 'agent' && isAdminUnlocked && (
          <AgentBuilder
            agentConfig={agentConfig}
            documents={documents}
            onSaveConfig={handleSaveAgentConfig}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
        )}

        {activeTab === 'evolution' && isAdminUnlocked && (
          <EvolutionSettings
            evolutionConfig={evolutionConfig}
            onSaveConfig={handleSaveEvolutionConfig}
            onTestConnection={handleTestEvolutionConnection}
            onSimulateWebhook={handleSimulateWebhook}
          />
        )}

        {activeTab === 'supabase' && isAdminUnlocked && (
          <SupabaseSettings
            supabaseConfig={supabaseConfig}
            onSaveConfig={handleSaveSupabaseConfig}
          />
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
