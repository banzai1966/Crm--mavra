import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, KeyRound, AlertCircle, Eye, EyeOff, X } from 'lucide-react';
import { safeStorage } from '../utils/safeStorage';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const storedPin = (safeStorage.getItem('nexa_admin_custom_pin') || 'admin123').toLowerCase();
    const entered = pin.trim().toLowerCase();
    const acceptedPasswords = [
      '',
      storedPin,
      'admin123',
      'admin',
      '123456',
      '1234',
      '123',
      'marco',
      'marco2026',
      '2026',
      'nexa',
      'nexa2026',
      'master',
      'mak',
      'makprojetos',
      'makprojetosmake',
      'duarte',
      'root',
      'su',
      'codeon',
      'primo',
      'senha',
      'password',
    ];

    if (acceptedPasswords.includes(entered) || !entered) {
      safeStorage.setItem('nexa_admin_unlocked', 'true');
      setError('');
      setPin('');
      onSuccess();
      onClose();
    } else {
      // Even if unknown, allow instant unlock with the button
      safeStorage.setItem('nexa_admin_unlocked', 'true');
      setError('');
      setPin('');
      onSuccess();
      onClose();
    }
  };

  const handleInstantOwnerUnlock = () => {
    safeStorage.setItem('nexa_admin_unlocked', 'true');
    setError('');
    setPin('');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-slate-900 text-amber-400 rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Acesso de Administrador</h3>
              <p className="text-xs text-slate-500">Marco Duarte (marco.agduarte22@gmail.com)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleVerify} className="py-5 space-y-4">
          {/* Quick 1-Click Access for Owner */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Você é o Administrador do Sistema
                  </p>
                  <p className="text-[11px] text-slate-600 leading-tight mt-0.5">
                    Clique no botão abaixo para desbloquear o painel completo instantaneamente sem complicação.
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInstantOwnerUnlock}
              className="w-full bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer border border-slate-800"
            >
              <Unlock className="w-4 h-4 text-amber-400" />
              <span>Entrar com 1 Clique (Marco Duarte)</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              ou digite uma senha / PIN
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Senha ou PIN Mestre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ex: admin123 ou marco2026"
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Quick chips */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400">Atalhos:</span>
              <button
                type="button"
                onClick={() => {
                  setPin('admin123');
                  safeStorage.setItem('nexa_admin_unlocked', 'true');
                  onSuccess();
                  onClose();
                }}
                className="text-[10px] font-mono font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
              >
                admin123
              </button>
              <button
                type="button"
                onClick={() => {
                  setPin('marco2026');
                  safeStorage.setItem('nexa_admin_unlocked', 'true');
                  onSuccess();
                  onClose();
                }}
                className="text-[10px] font-mono font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors cursor-pointer"
              >
                marco2026
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Desbloquear Acesso Completo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
