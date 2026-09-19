import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Radio,
  Database,
  ShieldCheck,
  Zap,
  Sparkles,
  PhoneCall,
  UserCheck,
  BarChart3,
  Lock,
  Unlock,
  Eye,
  Share2,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Flame,
} from 'lucide-react';
import { EvolutionConfig, AgentConfig } from '../types';
import { ClientLinkModal } from './ClientLinkModal';

interface HeaderProps {
  activeTab: 'dashboard' | 'kanban' | 'chat' | 'agent' | 'evolution' | 'supabase';
  setActiveTab: (tab: 'dashboard' | 'kanban' | 'chat' | 'agent' | 'evolution' | 'supabase') => void;
  evolutionConfig: EvolutionConfig;
  agentConfig: AgentConfig;
  totalLeads: number;
  totalPipelineValue: number;
  unreadCount: number;
  urgentCount?: number;
  hotCount?: number;
  isAdminUnlocked?: boolean;
  onOpenAdminAuth?: () => void;
  onLockAdmin?: () => void;
  onToggleGlobalAi?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  evolutionConfig,
  agentConfig,
  totalLeads,
  totalPipelineValue,
  unreadCount,
  urgentCount = 0,
  hotCount = 0,
  isAdminUnlocked = false,
  onOpenAdminAuth,
  onLockAdmin,
  onToggleGlobalAi,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showClientLinkModal, setShowClientLinkModal] = useState(false);
  const logoClicksRef = useRef<number>(0);
  const logoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if current URL is in pure client mode (?modo=cliente or ?cliente=1)
  const isExplicitClientMode =
    typeof window !== 'undefined' &&
    (new URLSearchParams(window.location.search).has('cliente') ||
      new URLSearchParams(window.location.search).has('client') ||
      new URLSearchParams(window.location.search).has('modo'));

  // Secret keyboard shortcut: Ctrl + Shift + A or Cmd + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onOpenAdminAuth?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenAdminAuth]);

  // Secret 3-click trigger on the logo for Marco
  const handleLogoSecretClick = () => {
    logoClicksRef.current += 1;
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);

    if (logoClicksRef.current >= 3) {
      logoClicksRef.current = 0;
      onOpenAdminAuth?.();
    } else {
      logoTimerRef.current = setTimeout(() => {
        logoClicksRef.current = 0;
      }, 1400);
    }
  };

  // Function for Marco to open the link modal & copy the 100% clean link for the client
  const handleCopyClientUrl = () => {
    setShowClientLinkModal(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('modo', 'cliente');
      navigator.clipboard.writeText(url.toString());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Provider badge styling
  const providerLabel = {
    gemini: 'Google Gemini',
    openai: 'OpenAI GPT-4o',
    anthropic: 'Claude 3.5 Sonnet',
  }[agentConfig.activeProvider] || 'Multi-IA';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner: Master Admin & System Status */}
      <div className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            NEXA CRM ENTERPRISE
          </div>
          <span className="text-slate-300">|</span>
          {isAdminUnlocked ? (
            <div className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Mestre:</span>
              <span className="font-semibold text-slate-900">Marco Duarte</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">(marco.agduarte22@gmail.com)</span>
              <span className="ml-1 bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded text-[10px] border border-amber-300">
                Acesso Total
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold px-2 py-0.5 rounded text-[10px]">
                ● Painel Operacional Ativo
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-2.5 text-slate-600">
          {/* Admin Lock/Unlock Switcher & Client Link Tools */}
          {isAdminUnlocked ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyClientUrl}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Gera e copia o link 100% limpo para enviar ao cliente (sem botões ou termos de admin)"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Copiar Link p/ Cliente</span>
                  </>
                )}
              </button>

              <button
                onClick={onLockAdmin}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Voltar para a visão do cliente/operador (oculta abas técnicas)"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Visão do Cliente (Bloquear)</span>
                <span className="sm:hidden">Bloquear</span>
              </button>
            </div>
          ) : isExplicitClientMode ? (
            // In explicit client mode, completely hide any admin button!
            // Marco can still open with 3 clicks on logo or Ctrl+Shift+A
            null
          ) : (
            // Default subtle admin entry
            <button
              onClick={onOpenAdminAuth}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-2 py-1 rounded-md text-xs font-medium shadow-2xs transition-all cursor-pointer opacity-75 hover:opacity-100"
              title="Acesso de Administrador (Marco Duarte) - ou clique 3x no logotipo N"
            >
              <Lock className="w-3 h-3 text-slate-500" />
              <span className="text-[11px]">Admin</span>
            </button>
          )}

          {/* Test Mode / Protection Badge */}
          {agentConfig.testModeEnabled && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Modo Teste</span>
            </div>
          )}

          {/* Master Global AI Silence/Active Quick Button */}
          {onToggleGlobalAi ? (
            <button
              onClick={onToggleGlobalAi}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs transition-all cursor-pointer border ${
                agentConfig.isGlobalAiActive !== false
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
              }`}
              title={
                agentConfig.isGlobalAiActive !== false
                  ? 'IA Comercial está Ativa. Clique para silenciar a IA em todos os chats.'
                  : 'IA Comercial está SILENCIADA (muda). Clique para reativar o atendimento automático.'
              }
            >
              {agentConfig.isGlobalAiActive !== false ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <Bot className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">IA Ativa</span>
                  <span className="text-[10px] text-emerald-600 font-normal hidden md:inline">(Silenciar)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <VolumeX className="w-3.5 h-3.5 text-rose-600" />
                  <span className="font-bold text-rose-800">IA Silenciada</span>
                  <span className="text-[10px] text-rose-600 font-normal hidden sm:inline">(Ligar)</span>
                </>
              )}
            </button>
          ) : agentConfig.isGlobalAiActive === false ? (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 text-rose-800 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>IA Desligada</span>
            </div>
          ) : null}

          {/* Active AI model - Restricted to Admin */}
          {isAdminUnlocked && (
            <div className="hidden lg:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-xs shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span className="text-slate-500">Motor IA:</span>
              <span className="text-slate-900 font-semibold">{providerLabel}</span>
            </div>
          )}

          {/* Evolution status - Technical for Admin, Clean for Client */}
          {isAdminUnlocked ? (
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-xs shadow-2xs">
              <Radio
                className={`w-3 h-3 ${
                  evolutionConfig.isConnected ? 'text-emerald-600' : 'text-rose-600'
                }`}
              />
              <span className="text-slate-500">Evolution API:</span>
              <span
                className={
                  evolutionConfig.isConnected ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-medium'
                }
              >
                {evolutionConfig.isConnected ? 'Conectado' : 'Aguardando'}
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-xs shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  evolutionConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              ></span>
              <span className="text-slate-500">WhatsApp:</span>
              <span
                className={
                  evolutionConfig.isConnected ? 'text-emerald-700 font-semibold' : 'text-slate-600'
                }
              >
                {evolutionConfig.isConnected ? 'Conectado' : 'Pronto para Atendimento'}
              </span>
            </div>
          )}

          {/* Urgent alert counter badge */}
          {urgentCount > 0 && (
            <div
              onClick={() => setActiveTab('kanban')}
              className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 text-rose-800 px-2.5 py-1 rounded-md text-xs font-bold shadow-2xs cursor-pointer hover:bg-rose-100 transition-colors animate-pulse"
              title="Existem leads com prioridade ou urgência reportada"
            >
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>{urgentCount} Urgência{urgentCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Hot Closing Leads counter badge */}
          {hotCount > 0 && (
            <div
              onClick={() => setActiveTab('kanban')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-400 text-amber-900 px-2.5 py-1 rounded-md text-xs font-bold shadow-2xs cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-all animate-pulse ring-1 ring-amber-400/40"
              title="Existem oportunidades quentes pedindo fechamento / PIX / compra!"
            >
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
              <span>{hotCount} Fechamento{hotCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Pipeline quick total */}
          <div className="hidden md:flex items-center gap-1.5 text-slate-600 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-md text-xs">
            <span className="text-emerald-800">Pipeline:</span>
            <span className="text-emerald-900 font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalPipelineValue
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Main Header & Nav Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoSecretClick}
            className="w-9 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center shadow-xs text-white font-black text-lg tracking-wider border border-indigo-700 cursor-pointer transition-colors focus:outline-none"
            title="NEXA CRM"
          >
            N
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">NEXA CRM</h1>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200">
                Conversacional Autônomo
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              WhatsApp Nativo via Evolution API v2 • Multi-IA • Base Dinâmica
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" id="main-navigation">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dashboard Executivo</span>
          </button>

          <button
            id="nav-tab-kanban"
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'kanban'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>CRM Kanban</span>
            <span className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono ${
              activeTab === 'kanban' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalLeads}
            </span>
          </button>

          <button
            id="nav-tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Central de Chat</span>
            {unreadCount > 0 && (
              <span className="bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Admin Protected Tabs: Only visible when unlocked */}
          {isAdminUnlocked && (
            <>
              <button
                id="nav-tab-agent"
                onClick={() => setActiveTab('agent')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'agent'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Agente & Conhecimento</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200 font-mono font-medium">
                  15 min
                </span>
              </button>

              <button
                id="nav-tab-evolution"
                onClick={() => setActiveTab('evolution')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'evolution'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Evolution API</span>
              </button>

              <button
                id="nav-tab-supabase"
                onClick={() => setActiveTab('supabase')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'supabase'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase</span>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Client White-Label Link Modal */}
      <ClientLinkModal
        isOpen={showClientLinkModal}
        onClose={() => setShowClientLinkModal(false)}
      />
    </header>
  );
};
