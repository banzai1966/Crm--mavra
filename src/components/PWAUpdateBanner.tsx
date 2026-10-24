import React, { useState } from 'react';
import { Sparkles, RefreshCw, X, Smartphone, Share, PlusSquare, Check } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

interface PWAUpdateBannerProps {
  pwaState: ReturnType<typeof usePWA>;
  showIOSModal?: boolean;
  setShowIOSModal?: (val: boolean) => void;
}

export const PWAUpdateBanner: React.FC<PWAUpdateBannerProps> = ({
  pwaState,
  showIOSModal,
  setShowIOSModal,
}) => {
  const { hasUpdate, reloadApp, dismissUpdate } = pwaState;
  const [isReloading, setIsReloading] = useState(false);

  const handleUpdateClick = () => {
    setIsReloading(true);
    reloadApp();
  };

  return (
    <>
      {/* Floating Update Notification Banner */}
      {hasUpdate && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/40 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse text-indigo-300" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h4 className="text-xs font-bold text-white tracking-wide">
                  Nova Versão do NEXA CRM!
                </h4>
                <button
                  type="button"
                  onClick={dismissUpdate}
                  className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
                  title="Fechar aviso"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug mb-3">
                Uma atualização com melhorias foi publicada no servidor. Clique abaixo para carregar a versão mais recente.
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUpdateClick}
                  disabled={isReloading}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-bold py-2 px-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin' : ''}`} />
                  <span>{isReloading ? 'Atualizando...' : 'Atualizar Agora'}</span>
                </button>

                <button
                  type="button"
                  onClick={dismissUpdate}
                  className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Mais tarde
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Safari Guided Installation Modal */}
      {showIOSModal && setShowIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Instalar no iPhone / iPad</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para usar o NEXA CRM como um aplicativo em tela cheia no iOS:
            </p>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  Toque no botão de <strong>Compartilhar</strong>{' '}
                  <Share className="w-3.5 h-3.5 inline text-blue-600 -mt-0.5" /> na barra inferior do Safari.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  Role para cima e toque em{' '}
                  <strong className="text-slate-900">Adicionar à Tela de Início</strong>{' '}
                  <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 -mt-0.5" />.
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  Toque em <strong>Adicionar</strong> no canto superior direito. Pronto! O app aparecerá na sua tela inicial.
                </div>
              </li>
            </ol>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
