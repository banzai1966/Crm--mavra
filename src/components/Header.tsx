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
      {/* Main Header & Nav Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between md:justify-start gap-3">
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

          {/* Quick status on mobile / compact */}
          <div className="flex items-center gap-2 md:hidden">
            {onToggleGlobalAi && (
              <button
                onClick={onToggleGlobalAi}
                className={`p-1.5 rounded-md text-xs border ${
                  agentConfig.isGlobalAiActive !== false
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
                title="Status da IA"
              >
                <Bot className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs & Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
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

          {/* Clean Top Action Buttons (IA toggle & Admin) */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
            {onToggleGlobalAi && (
              <button
                onClick={onToggleGlobalAi}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs transition-all cursor-pointer border ${
                  agentConfig.isGlobalAiActive !== false
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                }`}
                title={
                  agentConfig.isGlobalAiActive !== false
                    ? 'IA Comercial está Ativa. Clique para silenciar a IA.'
                    : 'IA Comercial está SILENCIADA. Clique para reativar.'
                }
              >
                <span className={`w-2 h-2 rounded-full ${agentConfig.isGlobalAiActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span>{agentConfig.isGlobalAiActive !== false ? 'IA Ativa' : 'IA Silenciada'}</span>
              </button>
            )}

            {/* Gerador de Link do Cliente */}
            {isAdminUnlocked && (
              <button
                onClick={handleCopyClientUrl}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Abrir gerador e copiar link 100% limpo para o cliente"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Link do Cliente</span>
                  </>
                )}
              </button>
            )}

            {isAdminUnlocked && (
              <button
                onClick={onLockAdmin}
                className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2 py-1 rounded-md text-xs font-medium cursor-pointer"
                title="Bloquear painel admin"
              >
                <Eye className="w-3 h-3 text-slate-500" />
                <span>Bloquear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Client White-Label Link Modal */}
      <ClientLinkModal
        isOpen={showClientLinkModal}
        onClose={() => setShowClientLinkModal(false)}
      />
    </header>
  );
};
