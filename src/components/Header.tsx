import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Radio,
  Database,
  BarChart3,
  Lock,
  Unlock,
  Eye,
  Share2,
  Check,
  ExternalLink,
  Activity,
  Calendar as CalendarIcon,
  Briefcase,
  Bike,
  Settings,
  ChevronDown,
  Layers,
  Sparkles,
  Stethoscope,
  UtensilsCrossed,
  ShoppingBag,
  Building2,
  Zap,
  Code2,
  FileText,
  HelpCircle,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { EvolutionConfig, AgentConfig } from '../types';
import { ClientLinkModal } from './ClientLinkModal';
import { ServerHealthModal } from './ServerHealthModal';

interface HeaderProps {
  activeTab: 'dashboard' | 'kanban' | 'chat' | 'calendar' | 'sales' | 'delivery' | 'agent' | 'evolution' | 'supabase';
  setActiveTab: (tab: 'dashboard' | 'kanban' | 'chat' | 'calendar' | 'sales' | 'delivery' | 'agent' | 'evolution' | 'supabase') => void;
  evolutionConfig: EvolutionConfig;
  agentConfig: AgentConfig;
  totalLeads: number;
  totalPipelineValue: number;
  unreadCount: number;
  urgentCount?: number;
  hotCount?: number;
  deliveryOrdersCount?: number;
  isAdminUnlocked?: boolean;
  onOpenAdminAuth?: () => void;
  onLockAdmin?: () => void;
  onToggleGlobalAi?: () => void;
  onSwitchWorkspace?: (workspaceId: 'clinic' | 'delivery' | 'ecommerce' | 'b2b' | 'surfacebrasil' | 'verzel' | 'primo') => void;
  onShowGuide?: () => void;
  pwaState?: {
    isInstallable: boolean;
    isInstalled: boolean;
    isIOS: boolean;
    hasUpdate: boolean;
    isCheckingUpdate: boolean;
    install: () => Promise<boolean>;
    checkForUpdates: () => Promise<boolean>;
    reloadApp: () => void;
  };
  onOpenIOSGuide?: () => void;
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
  deliveryOrdersCount = 0,
  isAdminUnlocked = false,
  onOpenAdminAuth,
  onLockAdmin,
  onToggleGlobalAi,
  onSwitchWorkspace,
  onShowGuide,
  pwaState,
  onOpenIOSGuide,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showClientLinkModal, setShowClientLinkModal] = useState(false);
  const [showServerHealthModal, setShowServerHealthModal] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showMoreModulesDropdown, setShowMoreModulesDropdown] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);

  const adminDropdownRef = useRef<HTMLDivElement>(null);
  const moreModulesDropdownRef = useRef<HTMLDivElement>(null);
  const workspaceDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(target)) {
        setShowAdminDropdown(false);
      }
      if (moreModulesDropdownRef.current && !moreModulesDropdownRef.current.contains(target)) {
        setShowMoreModulesDropdown(false);
      }
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(target)) {
        setShowWorkspaceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Secret keyboard shortcut for master admin: Ctrl + Shift + A or Cmd + Shift + A (Desktop only)
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

  const handleCopyClientUrl = () => {
    setShowClientLinkModal(true);
    setShowAdminDropdown(false);
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

  const handleOpenInExternalBrowser = () => {
    try {
      const fullUrl = window.location.href.replace(/^https?:\/\//, '');
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        window.location.href = `intent://${fullUrl}#Intent;scheme=https;package=com.android.chrome;end;`;
      } else {
        window.open(window.location.href, '_system');
      }
    } catch {
      window.open(window.location.href, '_blank');
    }
  };

  // Determine current niche
  const currentNiche =
    agentConfig.personaName?.toLowerCase().includes('primo') ||
    agentConfig.role?.toLowerCase().includes('primo') ||
    agentConfig.activeWorkspaceName?.toLowerCase().includes('primo')
      ? 'primo'
      : agentConfig.personaName?.toLowerCase().includes('verzel') ||
        agentConfig.role?.toLowerCase().includes('verzel') ||
        agentConfig.followUpCustomMessage?.toLowerCase().includes('verzel')
      ? 'verzel'
      : agentConfig.followUpNiche === 'restaurant_delivery'
      ? 'delivery'
      : agentConfig.followUpNiche === 'retail'
      ? 'ecommerce'
      : agentConfig.followUpNiche === 'b2b_services' || agentConfig.personaName?.toLowerCase().includes('surface')
      ? 'surfacebrasil'
      : agentConfig.followUpNiche === 'sales'
      ? 'b2b'
      : 'clinic';

  const nicheMeta = {
    primo: { label: 'Primo Equipamentos', icon: Building2, badge: 'Vendas & Geral' },
    clinic: { label: 'Clínica & Saúde', icon: Stethoscope, badge: 'Saúde' },
    delivery: { label: 'Pizzaria & Delivery', icon: UtensilsCrossed, badge: 'Delivery' },
    ecommerce: { label: 'E-commerce & Varejo', icon: ShoppingBag, badge: 'Varejo' },
    b2b: { label: 'Comercial B2B', icon: Building2, badge: 'B2B' },
    surfacebrasil: { label: 'Surfacebrasil (Plasma)', icon: Zap, badge: 'Indústria' },
    verzel: { label: 'Verzel (Software & AI)', icon: Code2, badge: 'Tech' },
  }[currentNiche] || { label: 'Vendas & Equipamentos', icon: Building2, badge: 'Vendas' };

  const CurrentNicheIcon = nicheMeta.icon;

  // Is active tab one of the technical admin settings?
  const isTechnicalTab = activeTab === 'agent' || activeTab === 'evolution' || activeTab === 'supabase';

  // Which specialized operational tab is primary for this niche?
  const isDeliveryPrimary = currentNiche === 'delivery' || currentNiche === 'ecommerce';

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Main Top Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Left Section: Brand Logo & Niche Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center select-none"
            title="NEXA CRM"
          >
            <img
              src="/logo.png"
              alt="NEXA CRM"
              className="h-7 md:h-7.5 w-auto max-w-[125px] object-contain"
            />
          </div>

          {/* Vertical divider */}
          <div className="hidden sm:block h-5 w-px bg-slate-200" />

          {/* Smart Niche Environment Selector */}
          {onSwitchWorkspace && (
            isAdminUnlocked ? (
              <div className="relative" ref={workspaceDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="Alternar o Nicho da IA e Perfil da Empresa em 1 clique"
                >
                  <CurrentNicheIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline text-slate-500 font-normal">Nicho:</span>
                  <span className="font-semibold">{nicheMeta.label}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showWorkspaceDropdown && (
                  <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="font-bold text-slate-800">Selecione o Nicho da Empresa</p>
                      <p className="text-[11px] text-slate-500">Muda o cérebro da IA e adapta as telas</p>
                    </div>

                    <button
                      onClick={() => {
                        onSwitchWorkspace('clinic');
                        setShowWorkspaceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentNiche === 'clinic' ? 'bg-indigo-50/70 font-bold text-indigo-900' : 'text-slate-700'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Clínica & Saúde</span>
                          {currentNiche === 'clinic' && <span className="text-[10px] text-indigo-600 font-bold">(Ativo)</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Foco: Agendamentos, consultas & exames</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchWorkspace('delivery');
                        setShowWorkspaceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentNiche === 'delivery' ? 'bg-indigo-50/70 font-bold text-indigo-900' : 'text-slate-700'
                      }`}
                    >
                      <UtensilsCrossed className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Pizzaria & Delivery</span>
                          {currentNiche === 'delivery' && <span className="text-[10px] text-indigo-600 font-bold">(Ativo)</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Foco: Pedidos rápidos, motoboy & taxa por CEP</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchWorkspace('ecommerce');
                        setShowWorkspaceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentNiche === 'ecommerce' ? 'bg-indigo-50/70 font-bold text-indigo-900' : 'text-slate-700'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>E-commerce & Varejo</span>
                          {currentNiche === 'ecommerce' && <span className="text-[10px] text-indigo-600 font-bold">(Ativo)</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Foco: Catálogo, cotação de frete & vendas</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchWorkspace('b2b');
                        setShowWorkspaceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentNiche === 'b2b' ? 'bg-indigo-50/70 font-bold text-indigo-900' : 'text-slate-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Comercial B2B</span>
                          {currentNiche === 'b2b' && <span className="text-[10px] text-indigo-600 font-bold">(Ativo)</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Foco: Qualificação, propostas & fechamento</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchWorkspace('surfacebrasil');
                        setShowWorkspaceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentNiche === 'surfacebrasil' ? 'bg-sky-50/70 font-bold text-sky-900' : 'text-slate-700'
                      }`}
                    >
                      <Zap className="w-4 h-4 text-sky-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Surfacebrasil (Plasma)</span>
                          {currentNiche === 'surfacebrasil' && <span className="text-[10px] text-sky-600 font-bold">(Ativo)</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Foco: Tratamento por plasma, SAP02 & testes</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchWorkspace('verzel');
                        setShowWorkspaceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentNiche === 'verzel' ? 'bg-indigo-50/80 font-bold text-indigo-950' : 'text-slate-700'
                      }`}
                    >
                      <Code2 className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Verzel (Software House & AI)</span>
                          {currentNiche === 'verzel' && <span className="text-[10px] text-indigo-600 font-bold">(Ativo)</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Foco: Fábrica de software, Apps, AI Talent Hub & Shell</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onSwitchWorkspace('primo');
                        setShowWorkspaceDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                        currentNiche === 'primo' ? 'bg-amber-50/80 font-bold text-amber-950' : 'text-slate-700'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span>Primo Equipamentos (Vendas)</span>
                          {currentNiche === 'primo' && <span className="text-[10px] text-amber-700 font-bold">(Ativo)</span>}
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">Foco: Cozinhas industriais, maquinário gastronômico & televendas B2B</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold">
                <CurrentNicheIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">{nicheMeta.label}</span>
              </div>
            )
          )}
        </div>

        {/* Center Section: Core Operational Navigation (Desktop md: and above) */}
        <nav className="hidden md:flex items-center gap-1 overflow-visible relative" id="main-navigation">
          {/* 1. Dashboard Executivo & Conexão WhatsApp */}
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dashboard</span>
          </button>

          {/* 2. CRM Kanban */}
          <button
            id="nav-tab-kanban"
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'kanban'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Kanban</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${
                activeTab === 'kanban' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {totalLeads}
            </span>
          </button>

          {/* 3. Central de Chat */}
          <button
            id="nav-tab-chat"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative whitespace-nowrap shrink-0 ${
              activeTab === 'chat'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat ao Vivo</span>
            {unreadCount > 0 && (
              <span className="bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full text-[10px] tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 4. Contextual Niche Primary Tab (Clean & Relevant) */}
          {isDeliveryPrimary ? (
            <button
              id="nav-tab-delivery"
              onClick={() => setActiveTab('delivery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'delivery'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bike className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pedidos & Entregas</span>
              {deliveryOrdersCount > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold tabular-nums ${
                    activeTab === 'delivery' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {deliveryOrdersCount}
                </span>
              )}
            </button>
          ) : (
            <button
              id="nav-tab-calendar"
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'calendar'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
              <span>Agendamentos</span>
            </button>
          )}

          {/* Show non-primary module if actively selected so it never vanishes */}
          {!isDeliveryPrimary && activeTab === 'delivery' && (
            <button
              id="nav-tab-delivery-active"
              onClick={() => setActiveTab('delivery')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 bg-slate-900 text-white shadow-xs"
            >
              <Bike className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pedidos & Entregas</span>
            </button>
          )}

          {isDeliveryPrimary && activeTab === 'calendar' && (
            <button
              id="nav-tab-calendar-active"
              onClick={() => setActiveTab('calendar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 bg-slate-900 text-white shadow-xs"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Agendamentos</span>
            </button>
          )}

          {/* 5. More Modules Dropdown (Sales Playbook, Secondary modules - Admin Only) */}
          {isAdminUnlocked && (
            <div className="relative" ref={moreModulesDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMoreModulesDropdown((prev) => !prev);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === 'sales'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : showMoreModulesDropdown
                    ? 'bg-slate-200 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Acessar outros módulos e ferramentas"
              >
                <span>Mais</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showMoreModulesDropdown && (
                <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                    <p className="font-bold text-slate-800">Mais Módulos</p>
                    <p className="text-[10px] text-slate-500">Ferramentas de apoio e vendas</p>
                  </div>

                  <div className="py-1">
                    {/* Secondary niche module option - only if delivery niche or if orders exist */}
                    {(isDeliveryPrimary || deliveryOrdersCount > 0) && (
                      <button
                        onClick={() => {
                          setActiveTab('delivery');
                          setShowMoreModulesDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer ${
                          activeTab === 'delivery' ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        <Bike className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-semibold">Pedidos & Entregas</p>
                          <p className="text-[10px] text-slate-400 font-normal">Acompanhar fila de delivery</p>
                        </div>
                      </button>
                    )}

                    {/* Sales Playbook */}
                    <button
                      onClick={() => {
                        setActiveTab('sales');
                        setShowMoreModulesDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer ${
                        activeTab === 'sales' ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <div>
                        <p className="font-semibold">Guia Comercial & Vendas</p>
                        <p className="text-[10px] text-slate-400 font-normal">Scripts e manual do vendedor</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Right Section: System Status & Admin Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick status on mobile */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={handleOpenInExternalBrowser}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
              title="Abrir no navegador externo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Global AI Status Button */}
          {onToggleGlobalAi && (
            <button
              onClick={onToggleGlobalAi}
              className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                agentConfig.isGlobalAiActive !== false
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
              }`}
              title={
                agentConfig.isGlobalAiActive !== false
                  ? 'IA Sofia está Ativa. Clique para pausar.'
                  : 'IA Sofia está PAUSADA. Clique para reativar.'
              }
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  agentConfig.isGlobalAiActive !== false ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <span className="hidden sm:inline">
                {agentConfig.isGlobalAiActive !== false ? 'IA Ativa' : 'IA Pausada'}
              </span>
            </button>
          )}

          {/* PWA Update / Refresh Button (Instant Version Reload) */}
          <button
            type="button"
            onClick={pwaState?.reloadApp || (() => window.location.reload())}
            disabled={pwaState?.isCheckingUpdate}
            className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              pwaState?.hasUpdate
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500 shadow-xs animate-pulse'
                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
            }`}
            title={pwaState?.hasUpdate ? 'Nova versão pronta! Clique para recarregar' : 'Recarregar sistema / Buscar atualizações'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pwaState?.hasUpdate ? 'text-white' : 'text-emerald-600'} ${pwaState?.isCheckingUpdate ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {pwaState?.hasUpdate ? 'Atualizar Versão' : 'Atualizar'}
            </span>
          </button>

          {/* PWA In-App Install Button (Only visible if not installed yet) */}
          {pwaState && !pwaState.isInstalled && (pwaState.isInstallable || pwaState.isIOS) && (
            <button
              type="button"
              onClick={() => {
                if (pwaState.isInstallable) {
                  pwaState.install();
                } else if (pwaState.isIOS && onOpenIOSGuide) {
                  onOpenIOSGuide();
                }
              }}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-all cursor-pointer"
              title="Instalar NEXA CRM como aplicativo no seu dispositivo"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Instalar App</span>
            </button>
          )}

          {/* Admin Controls: Grouped cleanly under Settings Dropdown */}
          {isAdminUnlocked ? (
            <div className="flex items-center gap-1 sm:gap-1.5 pl-1.5 border-l border-slate-200" ref={adminDropdownRef}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                  className={`flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    isTechnicalTab || showAdminDropdown
                      ? 'bg-indigo-900 text-white border-indigo-900 shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  }`}
                  title="Configurações Administrativas, Banco de Dados e Integrações"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Configurações</span>
                  <ChevronDown className="w-3 h-3 opacity-70 hidden sm:inline" />
                </button>

                {showAdminDropdown && (
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                      <p className="font-bold text-slate-800 flex items-center justify-between">
                        <span>Painel Administrativo</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                          Master
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-500">Módulos de infraestrutura e IA</p>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          onShowGuide?.();
                          setActiveTab('dashboard');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          setShowAdminDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors text-slate-700 cursor-pointer"
                      >
                        <HelpCircle className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="font-semibold">Manual & Guia de IA</p>
                          <p className="text-[10px] text-slate-400 font-normal">Como conectar e operar o sistema</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('agent');
                          setShowAdminDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                          activeTab === 'agent' ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        <Bot className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="font-semibold">Agente & Conhecimento</p>
                          <p className="text-[10px] text-slate-400 font-normal">Prompts, documentos PDF e metas da Sofia</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('evolution');
                          setShowAdminDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                          activeTab === 'evolution' ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        <Radio className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-semibold">Evolution API (WhatsApp)</p>
                          <p className="text-[10px] text-slate-400 font-normal">Instâncias VPS, QR Code e Webhook</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('supabase');
                          setShowAdminDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 transition-colors ${
                          activeTab === 'supabase' ? 'bg-indigo-50 font-bold text-indigo-900' : 'text-slate-700'
                        }`}
                      >
                        <Database className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="font-semibold">Supabase (PostgreSQL)</p>
                          <p className="text-[10px] text-slate-400 font-normal">Banco de dados em nuvem e backups</p>
                        </div>
                      </button>
                    </div>

                    <div className="border-t border-slate-100 py-1">
                      <button
                        onClick={() => {
                          setShowServerHealthModal(true);
                          setShowAdminDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                        <div>
                          <p className="font-semibold">Servidor & Recursos</p>
                          <p className="text-[10px] text-slate-400 font-normal">Telemetria de RAM, disco e tempo de resposta</p>
                        </div>
                      </button>

                      <button
                        onClick={handleCopyClientUrl}
                        className="w-full text-left px-3 py-2 flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="font-semibold">Gerar Link do Cliente</p>
                          <p className="text-[10px] text-slate-400 font-normal">Link 100% blindado sem abas técnicas</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Lock Button (Quick lock before handing screen to client) */}
              {onLockAdmin && (
                <button
                  onClick={onLockAdmin}
                  className="flex items-center gap-1 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="Bloquear Modo Administrador (proteger sistema antes de mostrar ao cliente)"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Bloquear</span>
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Navigation Bar (< md) - Clean, 100% responsive native mobile app style */}
      <nav
        id="mobile-navigation"
        className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xs px-2 py-1.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar w-full max-w-full"
      >
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 min-w-[62px] flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5 text-indigo-400" />
          <span>Dashboard</span>
        </button>

        {/* 2. Kanban */}
        <button
          type="button"
          onClick={() => setActiveTab('kanban')}
          className={`flex-1 min-w-[62px] flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer relative whitespace-nowrap shrink-0 ${
            activeTab === 'kanban'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            {totalLeads > 0 && (
              <span
                className={`absolute -top-1 -right-2.5 px-1 py-0.2 rounded-full text-[9px] font-mono leading-none ${
                  activeTab === 'kanban' ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {totalLeads}
              </span>
            )}
          </div>
          <span>Kanban</span>
        </button>

        {/* 3. Chat */}
        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`flex-1 min-w-[62px] flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer relative whitespace-nowrap shrink-0 ${
            activeTab === 'chat'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 mb-0.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-emerald-600 text-white font-bold px-1 py-0.2 rounded-full text-[9px] leading-none">
                {unreadCount}
              </span>
            )}
          </div>
          <span>Chat</span>
        </button>

        {/* 4. Contextual Niche Primary Tab (Pedidos / Agendamentos) */}
        {isDeliveryPrimary ? (
          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`flex-1 min-w-[62px] flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer relative whitespace-nowrap shrink-0 ${
              activeTab === 'delivery'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <div className="relative">
              <Bike className="w-4 h-4 mb-0.5 text-emerald-500" />
              {deliveryOrdersCount > 0 && (
                <span
                  className={`absolute -top-1 -right-2.5 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold leading-none ${
                    activeTab === 'delivery' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {deliveryOrdersCount}
                </span>
              )}
            </div>
            <span>Pedidos</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 min-w-[62px] flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarIcon className="w-4 h-4 mb-0.5 text-blue-500" />
            <span>Agenda</span>
          </button>
        )}

        {/* Show secondary if actively selected */}
        {!isDeliveryPrimary && activeTab === 'delivery' && (
          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className="flex-1 min-w-[62px] flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 bg-slate-900 text-white shadow-xs"
          >
            <Bike className="w-4 h-4 mb-0.5 text-emerald-400" />
            <span>Pedidos</span>
          </button>
        )}

        {isDeliveryPrimary && activeTab === 'calendar' && (
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className="flex-1 min-w-[62px] flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 bg-slate-900 text-white shadow-xs"
          >
            <CalendarIcon className="w-4 h-4 mb-0.5 text-blue-400" />
            <span>Agenda</span>
          </button>
        )}

        {/* If Admin is unlocked and on a technical tab, provide quick shortcut button */}
        {isAdminUnlocked && isTechnicalTab && (
          <button
            type="button"
            onClick={() => setActiveTab('agent')}
            className="flex-1 min-w-[62px] flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 bg-indigo-900 text-white shadow-xs"
          >
            <Settings className="w-4 h-4 mb-0.5 text-indigo-300" />
            <span>Técnico</span>
          </button>
        )}
      </nav>

      {/* Technical Admin Contextual Sub-Nav Bar (Visible only when inside Agent, Evolution or Supabase) */}
      {isAdminUnlocked && isTechnicalTab && (
        <div className="bg-slate-900 border-t border-slate-800 px-3 md:px-4 py-1.5 transition-all overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                <span>Gestão Técnica & Infraestrutura:</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('agent')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'agent'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Agente & Prompts</span>
                </button>
                <button
                  onClick={() => setActiveTab('evolution')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'evolution'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Evolution WhatsApp</span>
                </button>
                <button
                  onClick={() => setActiveTab('supabase')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'supabase'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Banco Supabase</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('kanban')}
              className="text-slate-400 hover:text-white text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>← Voltar à Operação (Kanban)</span>
            </button>
          </div>
        </div>
      )}

      {/* Client White-Label Link Modal */}
      <ClientLinkModal
        isOpen={showClientLinkModal}
        onClose={() => setShowClientLinkModal(false)}
        currentNiche={currentNiche}
      />

      {/* Server Health & Resources Telemetry Modal */}
      <ServerHealthModal
        isOpen={showServerHealthModal}
        onClose={() => setShowServerHealthModal(false)}
      />
    </header>
  );
};

