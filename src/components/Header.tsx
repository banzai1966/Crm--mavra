import React from 'react';
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
  UserCheck
} from 'lucide-react';
import { EvolutionConfig, AgentConfig } from '../types';

interface HeaderProps {
  activeTab: 'kanban' | 'chat' | 'agent' | 'evolution' | 'supabase';
  setActiveTab: (tab: 'kanban' | 'chat' | 'agent' | 'evolution' | 'supabase') => void;
  evolutionConfig: EvolutionConfig;
  agentConfig: AgentConfig;
  totalLeads: number;
  totalPipelineValue: number;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  evolutionConfig,
  agentConfig,
  totalLeads,
  totalPipelineValue,
  unreadCount,
}) => {
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
            NEXA CRM v2.6 ENTERPRISE
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
            <span>Criador & Admin Mestre:</span>
            <span className="font-semibold text-slate-900">Marco Duarte</span>
            <span className="text-slate-500 text-[11px]">(marco.agduarte22@gmail.com)</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          {/* Test Mode / Protection Badge */}
          {agentConfig.testModeEnabled ? (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 text-amber-900 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Modo Teste Ativo</span>
            </div>
          ) : agentConfig.isGlobalAiActive === false ? (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 text-rose-800 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>IA Desligada</span>
            </div>
          ) : null}

          {/* Active AI model */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200 text-xs shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span className="text-slate-500">Motor IA:</span>
            <span className="text-slate-900 font-semibold">{providerLabel}</span>
          </div>

          {/* Evolution status */}
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
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-xs text-white font-black text-lg tracking-wider border border-indigo-700">
            N
          </div>
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
        </nav>
      </div>
    </header>
  );
};
