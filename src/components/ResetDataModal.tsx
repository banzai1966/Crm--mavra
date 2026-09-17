import React, { useState } from 'react';
import {
  X,
  Trash2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalLeads: number;
  onClearAll: () => Promise<void> | void;
  onRestoreDemo: () => Promise<void> | void;
}

export const ResetDataModal: React.FC<ResetDataModalProps> = ({
  isOpen,
  onClose,
  totalLeads,
  onClearAll,
  onRestoreDemo,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClear = async () => {
    setIsProcessing(true);
    try {
      await onClearAll();
      setSuccessMessage('Base de leads e mensagens 100% zerada com sucesso!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      await onRestoreDemo();
      setSuccessMessage('Dados de demonstração restaurados com sucesso!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      id="modal-reset-data-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
    >
      <div
        id="modal-reset-data-card"
        className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 border border-rose-400/30 rounded-xl">
              <Trash2 className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Gerenciamento da Base de Dados</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Iniciar base 100% zerada ou restaurar exemplos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {successMessage ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-emerald-900">{successMessage}</p>
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-600 leading-relaxed space-y-2">
                <p>
                  Atualmente existem <strong>{totalLeads} lead(s)</strong> e históricos de conversa carregados no seu CRM.
                </p>
                <p>
                  Para entregar o sistema para a clínica/cliente ou iniciar sua operação real, você pode <strong>zerar todos os dados de teste</strong>. Seus estágios de funil e configurações da IA serão preservados intactos!
                </p>
              </div>

              {/* Option 1: Clear all */}
              <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900">
                      Zerar Base (Iniciar Produção Limpa)
                    </h4>
                    <p className="text-[11px] text-rose-800/80 mt-0.5 leading-snug">
                      Remove todos os leads, mensagens e métricas de teste. O CRM fica 100% vazio e pronto para receber apenas os clientes reais pelo WhatsApp.
                    </p>
                  </div>
                </div>

                <button
                  id="btn-confirm-clear-leads"
                  onClick={handleClear}
                  disabled={isProcessing || totalLeads === 0}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    totalLeads === 0
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Limpando...' : 'Sim, Zerar Todos os Leads Agora'}</span>
                </button>
              </div>

              {/* Option 2: Restore demo */}
              <div className="border border-indigo-200 bg-indigo-50/50 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900">
                      Restaurar Dados de Demonstração
                    </h4>
                    <p className="text-[11px] text-indigo-800/80 mt-0.5 leading-snug">
                      Recarrega os leads de exemplo com conversas do WhatsApp (ideal para demonstrações comerciais).
                    </p>
                  </div>
                </div>

                <button
                  id="btn-confirm-restore-demo"
                  onClick={handleRestore}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isProcessing ? 'Restaurando...' : 'Restaurar Exemplos de Demonstração'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex justify-end">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
