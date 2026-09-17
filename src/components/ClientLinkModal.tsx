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
  Layers,
  Lock,
} from 'lucide-react';

interface ClientLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientLinkModal: React.FC<ClientLinkModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Derive the cleanest public URL
  let clientUrl = '';
  try {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    clientUrl = `${origin}${pathname}?modo=cliente`;
  } catch {
    clientUrl = 'https://ais-pre-jzarqr4svxoptyu6k7dkrk-51327969358.us-east1.run.app/?modo=cliente';
  }

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(clientUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback using textarea
      const textArea = document.createElement('textarea');
      textArea.value = clientUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleOpenTestTab = () => {
    window.open(clientUrl, '_blank');
  };

  return (
    <div
      id="modal-client-link-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="modal-client-link-card"
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 border border-indigo-400/30 rounded-xl">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Link de Entrega para o Cliente</h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Visão 100% White-Label sem rastros de administração
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

        {/* Modal Body */}
        <div className="p-5 space-y-5">
          {/* Main instructions */}
          <p className="text-xs text-slate-600 leading-relaxed">
            Este é o link direto que você deve enviar para o dono da clínica, loja ou empresa. Ao abrir por este endereço, o sistema entra em <strong>Modo Operacional Limpo</strong>: nenhum botão de admin ou termo de infraestrutura será exibido.
          </p>

          {/* URL Box with Copy & Test Buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Link Seguro do Cliente:</span>
              <span className="text-[11px] text-emerald-600 font-medium">Modo Cliente Ativado</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={clientUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                id="btn-modal-copy-link"
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                onClick={handleOpenTestTab}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir em nova aba para ver como o cliente enxerga</span>
              </button>
            </div>
          </div>

          {/* Comparison Cards: What client sees vs What is hidden */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* What is visible */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>O que o Cliente VÊ:</span>
              </div>
              <ul className="text-[11px] text-emerald-800 space-y-1.5 leading-snug">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Dashboard Executivo & Nicho
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  CRM Kanban com todos os Leads
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Central de Chat com WhatsApp
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Botão Conectar WhatsApp (QR Code)
                </li>
              </ul>
            </div>

            {/* What is hidden */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                <EyeOff className="w-4 h-4 text-rose-500" />
                <span>O que fica OCULTO:</span>
              </div>
              <ul className="text-[11px] text-slate-600 space-y-1.5 leading-snug">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Botão de "Acesso Admin"
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Aba Agente Sofia & Prompts
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Aba Evolution API & Chaves
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  Aba Supabase & Credenciais
                </li>
              </ul>
            </div>
          </div>

          {/* Secret hint for Marco */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>Como você acessa o Admin nesse link:</strong> Se você estiver no computador do cliente, basta dar <strong>3 cliques rápidos no logotipo N</strong> (canto superior esquerdo) ou pressionar <strong>Ctrl + Shift + A</strong> no teclado para abrir o PIN de administrador (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">marco2026</code>).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Entendido, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
