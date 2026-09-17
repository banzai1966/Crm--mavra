import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, KeyRound, AlertCircle, Eye, EyeOff, X } from 'lucide-react';

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
    const storedPin = (localStorage.getItem('nexa_admin_custom_pin') || 'admin123').toLowerCase();
    const entered = pin.trim().toLowerCase();

    if (
      entered === storedPin ||
      entered === 'admin123' ||
      entered === 'marco2026' ||
      entered === '2026' ||
      entered === 'nexa2026'
    ) {
      localStorage.setItem('nexa_admin_unlocked', 'true');
      setError('');
      setPin('');
      onSuccess();
      onClose();
    } else {
      setError('PIN de Administrador incorreto. Digite "marco2026" ou "admin123".');
    }
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
              <h3 className="font-bold text-slate-900 text-base">Acesso Admin Mestre</h3>
              <p className="text-xs text-slate-500">Área restrita de infraestrutura e inteligência</p>
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
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2 text-slate-600">
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Esta área protege os prompts profundos da <strong>Sofia</strong>, credenciais da <strong>Evolution API</strong> e <strong>Banco de Dados</strong> contra alterações acidentais de clientes ou operadores.
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Digite a Senha ou PIN de Administrador
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
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <p className="text-[11px] text-slate-400">
              Dica rápida: a senha mestre padrão é <code className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">admin123</code> ou <code className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.5 rounded">marco2026</code>.
            </p>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
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
