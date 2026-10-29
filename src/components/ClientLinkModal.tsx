import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  EyeOff,
  Sparkles,
  Smartphone,
  Lock,
  Building2,
  Code2,
  Zap,
  Stethoscope,
  UtensilsCrossed,
  MessageCircle,
} from 'lucide-react';

interface ClientLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNiche?: string;
}

interface CompanyOption {
  id: string;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  badgeColor: string;
  aliases?: string[];
}

const COMPANIES: CompanyOption[] = [
  {
    id: 'clinic',
    name: 'Dra. Lucy Murata',
    subtitle: 'Odontologia Integrativa & Biológica',
    icon: Stethoscope,
    tag: 'Saúde & Biológica',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    aliases: ['clinic', 'dra-lucy-murata', 'dra_lucy_murata', 'dra-lucy', 'dental-integrative'],
  },
  {
    id: 'cantareira',
    name: 'Cemitério Parque Cantareira',
    subtitle: 'Jazigos Perpétuos & Assistência 24h',
    icon: Building2,
    tag: 'Parque Cantareira',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    aliases: ['cantareira', 'cemiterio-cantareira', 'cemiterio_parque_cantareira'],
  },
  {
    id: 'surfacebrasil',
    name: 'Surfacebrasil',
    subtitle: 'Tratamento de Superfície por Plasma',
    icon: Zap,
    tag: 'Indústria Plasma',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    aliases: ['surfacebrasil', 'surface-brasil', 'surface_brasil_plasma'],
  },
  {
    id: 'verzel',
    name: 'Verzel Sistemas & AI',
    subtitle: 'Fábrica de Software & AI Talent Hub',
    icon: Code2,
    tag: 'Tech & Software',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    aliases: ['verzel', 'verzel_software_consultoria'],
  },
  {
    id: 'primo',
    name: 'Primo Equipamentos',
    subtitle: 'Gastronomia & Cozinhas Profissionais',
    icon: Building2,
    tag: 'Vendas & Equipamentos',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    aliases: ['primo', 'primo-equipamentos'],
  },
  {
    id: 'equipamentospsi',
    name: 'Equipamentos PSI',
    subtitle: 'Terapia EMDR & Estimuladores Bilaterais',
    icon: Sparkles,
    tag: 'Terapia EMDR',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    aliases: ['equipamentospsi', 'equipamentos-psi', 'psi', 'emdr'],
  },
  {
    id: 'delivery',
    name: 'Pizzaria & Delivery',
    subtitle: 'Pedidos Rápidos, Motoboy & Bairros',
    icon: UtensilsCrossed,
    tag: 'Alimentação',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    aliases: ['delivery', 'restaurant_delivery'],
  },
  {
    id: 'b2b',
    name: 'Comercial B2B Geral',
    subtitle: 'Qualificação de Decisores & Propostas',
    icon: Building2,
    tag: 'Corporativo B2B',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    aliases: ['b2b', 'nexa_sales', 'sales'],
  },
];

export const ClientLinkModal: React.FC<ClientLinkModalProps> = ({
  isOpen,
  onClose,
  currentNiche,
}) => {
  const [selectedNiche, setSelectedNiche] = useState<string>(() => {
    if (currentNiche) {
      const match = COMPANIES.find(
        (c) => c.id === currentNiche || (c.aliases && c.aliases.includes(currentNiche))
      );
      if (match) return match.id;
    }
    return 'clinic';
  });

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedWhatsapp, setCopiedWhatsapp] = useState(false);

  if (!isOpen) return null;

  const activeCompany = COMPANIES.find(
    (c) => c.id === selectedNiche || (c.aliases && c.aliases.includes(selectedNiche))
  ) || {
    id: selectedNiche,
    name: selectedNiche ? selectedNiche.toUpperCase().replace(/-/g, ' ') : 'Empresa Personalizada',
    subtitle: 'Cliente / Empresa Registrada',
    icon: Building2,
    tag: 'Cliente',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  // Build clean link carrying mode and unique niche identifier
  let clientUrl = '';
  try {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    clientUrl = `${origin}${pathname}?modo=cliente&empresa=${selectedNiche}`;
  } catch {
    clientUrl = `/?modo=cliente&empresa=${selectedNiche}`;
  }

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(clientUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2800);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = clientUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2800);
    }
  };

  const handleCopyWhatsappMessage = () => {
    const msg = `Olá! Segue o seu link de acesso exclusivo ao NEXA CRM da ${activeCompany.name}:\n\n🔗 ${clientUrl}\n\n📱 *Dica de Instalação:* Abra pelo Google Chrome ou Safari e toque em "Instalar App" para fixar o aplicativo direto na tela inicial do seu celular!`;
    try {
      navigator.clipboard.writeText(msg);
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2800);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = msg;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedWhatsapp(true);
      setTimeout(() => setCopiedWhatsapp(false), 2800);
    }
  };

  const handleOpenTestTab = () => {
    window.open(clientUrl, '_blank');
  };

  return (
    <div
      id="modal-client-link-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="modal-client-link-card"
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white p-4 sm:p-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">
                Gerador de Links Exclusivos por Cliente
              </h3>
              <p className="text-[11px] sm:text-xs text-indigo-200 mt-0.5">
                Cada empresa possui link isolado, blindado e sem acesso administrativo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs text-slate-700">
          {/* Step 1: Company Selector & Dynamic Custom Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span>1. Selecione a empresa ou digite o nome de qualquer nova empresa:</span>
              </label>
            </div>

            {/* Dynamic Custom Slug Input for Unlimited Scale */}
            <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-950">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Gerador Dinâmico para Infinitas Empresas (Sem limite)</span>
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold bg-white px-2 py-0.5 rounded border border-indigo-200">
                  Qualquer Nome / Slug
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={selectedNiche}
                    onChange={(e) => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
                      setSelectedNiche(clean);
                    }}
                    placeholder="Digite o nome da empresa (ex: dra-lucy-murata, empresa-xyz)"
                    className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                💡 Digite qualquer identificador acima (ex: <code className="text-indigo-700 font-bold">dra-lucy-murata</code>, <code className="text-indigo-700 font-bold">cliente-1000</code>). O link é gerado na hora sem precisar de programação ou novos botões.
              </p>
            </div>

            {/* Quick Atalhos / Presets */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Ou selecione um dos atalhos rápidos ativos:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COMPANIES.map((company) => {
                  const isSelected = selectedNiche === company.id || (company.aliases && company.aliases.includes(selectedNiche));
                  const Icon = company.icon;
                  return (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => setSelectedNiche(company.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${company.badgeColor}`}>
                          {company.tag}
                        </span>
                      </div>
                      <div>
                        <p className={`font-bold text-[11px] leading-tight ${isSelected ? 'text-indigo-950' : 'text-slate-800'}`}>
                          {company.name}
                        </p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {company.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 2: Generated URL Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>Link Seguro para:</span>
                <span className="text-indigo-700 font-extrabold">{activeCompany.name}</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Blindado & Isolado
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={clientUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-[11px] sm:text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                  copiedLink
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={handleCopyWhatsappMessage}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copia uma mensagem pronta de envio com link e orientações de instalação"
              >
                {copiedWhatsapp ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Texto WhatsApp Copiado!</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiar Mensagem Pronta de WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenTestTab}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Testar como o cliente enxerga</span>
              </button>
            </div>
          </div>

          {/* Guarantee of Multi-Tenant Isolation */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 flex items-start gap-2.5 text-[11px] text-indigo-950 leading-snug">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Garantia de Isolamento Total:</span>
              Este link está travado exclusivamente para <strong>{activeCompany.name}</strong>. Mesmo que você teste outros nichos no seu computador administrativo, o cliente deste link <strong>sempre abrirá na empresa dele</strong>, sem qualquer risco de misturar informações.
            </div>
          </div>

          {/* Comparison Cards: What client sees vs What is hidden */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* What is visible */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>O que o Cliente VÊ:</span>
              </div>
              <ul className="text-[10px] text-emerald-800 space-y-1 leading-snug">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Logo NEXA & {activeCompany.name}
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Dashboard Executivo & Métricas
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  CRM Kanban com Leads e Etapas
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Chat ao Vivo & Botão de Atualizar
                </li>
              </ul>
            </div>

            {/* What is hidden */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
                <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                <span>O que fica 100% OCULTO:</span>
              </div>
              <ul className="text-[10px] text-slate-600 space-y-1 leading-snug">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Painel e Menu de Configurações
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Aba Agente Sofia & Engenharia de Prompts
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Aba Evolution WhatsApp & Supabase
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Nenhum clique no logo desbloqueia o sistema
                </li>
              </ul>
            </div>
          </div>

          {/* Master Admin Note */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-700 flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              <strong>Acesso Master:</strong> Se você precisar acessar a área técnica no seu computador, basta pressionar o atalho de teclado <code className="bg-white px-1 py-0.5 rounded border border-slate-300 font-mono font-bold">Ctrl + Shift + A</code>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-5 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Nicho Ativo: <strong className="text-slate-800">{activeCompany.name}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
