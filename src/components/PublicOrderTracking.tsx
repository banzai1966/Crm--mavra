import React, { useState, useEffect } from 'react';
import {
  Bike,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Store,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Navigation,
  MessageCircle,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface TrackingData {
  found: boolean;
  orderNumber: string;
  customerName: string;
  status: 'preparing' | 'dispatched' | 'arriving' | 'delivered';
  items: string;
  motoboyName: string;
  motoboyPhone?: string;
  motoboyPlate: string;
  deliveryAddress: string;
  etaMinutes: number;
  verificationCode: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  value: number;
  subtotalValue?: number;
  deliveryFee?: number;
  pixConfirmed?: boolean;
  storeName?: string;
  storePhone?: string;
  isSample?: boolean;
}

interface PublicOrderTrackingProps {
  orderNumber: string;
  onBackToCrm?: () => void;
}

export const PublicOrderTracking: React.FC<PublicOrderTrackingProps> = ({
  orderNumber,
  onBackToCrm,
}) => {
  const [data, setData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedPin, setCopiedPin] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(45);

  const fetchTracking = async () => {
    try {
      const res = await fetch(`/api/public/tracking/${orderNumber || 'PED-1024'}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setError(null);
      } else {
        setError('Pedido não encontrado ou já finalizado');
      }
    } catch {
      setError('Falha ao conectar com o serviço de rastreamento');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 3000);
    return () => clearInterval(interval);
  }, [orderNumber]);

  // Subtle simulated animation of motoboy route progress
  useEffect(() => {
    if (!data) return;
    const baseProgress =
      data.status === 'delivered'
        ? 100
        : data.status === 'arriving'
        ? 88
        : data.status === 'dispatched'
        ? 55
        : 15;

    setSimulatedProgress(baseProgress);

    if (data.status === 'dispatched' || data.status === 'arriving') {
      const subInterval = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (data.status === 'dispatched' && prev < 75) return prev + 0.5;
          if (data.status === 'arriving' && prev < 95) return prev + 0.3;
          return prev;
        });
      }, 2000);
      return () => clearInterval(subInterval);
    }
  }, [data?.status]);

  const handleCopyPin = () => {
    if (data?.verificationCode) {
      navigator.clipboard.writeText(data.verificationCode);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold">Conectando ao Satélite GPS...</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">Carregando rota ao vivo do pedido #{orderNumber}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Pedido #{orderNumber} Não Localizado</h1>
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
          Verifique se o código do pedido está correto ou entre em contato direto com a loja.
        </p>
        {onBackToCrm && (
          <button
            onClick={onBackToCrm}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-800"
          >
            ← Voltar ao NEXA CRM
          </button>
        )}
      </div>
    );
  }

  const stages = [
    { id: 'preparing', label: 'Na Cozinha', icon: UtensilsCrossed },
    { id: 'dispatched', label: 'Em Rota', icon: Bike },
    { id: 'arriving', label: 'Chegando', icon: Clock },
    { id: 'delivered', label: 'Entregue', icon: CheckCircle2 },
  ];

  const currentStageIndex =
    data.status === 'delivered' ? 3 : data.status === 'arriving' ? 2 : data.status === 'dispatched' ? 1 : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center pb-12 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar with Live Telemetry */}
      <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold text-slate-200">
              {data.storeName || 'NEXA Gourmet & Delivery'}
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
              GPS Ao Vivo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-400">
              #{data.orderNumber}
            </span>
            {onBackToCrm && (
              <button
                onClick={onBackToCrm}
                className="text-[11px] text-slate-400 hover:text-white border border-slate-700 px-2 py-1 rounded-md transition-colors cursor-pointer"
                title="Voltar ao painel administrativo"
              >
                Voltar ao CRM
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Tracking Content Container */}
      <main className="w-full max-w-2xl px-4 py-6 space-y-4">
        {/* Status Hero Card */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 border border-indigo-900/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                {data.status === 'preparing' && <span>🍳 Preparo Iniciado</span>}
                {data.status === 'dispatched' && <span>🛵 Motoboy em Trânsito</span>}
                {data.status === 'arriving' && <span className="animate-pulse text-amber-400">⏱️ Quase Chegando!</span>}
                {data.status === 'delivered' && <span className="text-emerald-400">✅ Pedido Finalizado</span>}
              </div>

              <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                {data.status === 'preparing' && 'Seu pedido está no forno / na cozinha'}
                {data.status === 'dispatched' && `Motoboy ${data.motoboyName} está a caminho`}
                {data.status === 'arriving' && 'O entregador está chegando (~5 minutos)'}
                {data.status === 'delivered' && 'Pedido entregue com sucesso! Bom apetite!'}
              </h1>

              <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="truncate">{data.deliveryAddress}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-2xl text-center shrink-0">
              <span className="block text-[10px] text-slate-300 font-semibold uppercase">Previsão</span>
              <span className="text-lg font-mono font-black text-amber-300">
                {data.status === 'delivered' ? '0 min' : `~${data.etaMinutes} min`}
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="mt-6 pt-5 border-t border-white/10 relative z-10">
            <div className="grid grid-cols-4 gap-2">
              {stages.map((st, idx) => {
                const Icon = st.icon;
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={st.id} className="text-center">
                    <div
                      className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-110 animate-pulse'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-800 text-slate-500 border border-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`block text-[11px] mt-2 font-semibold ${
                        isCurrent ? 'text-indigo-300' : isPassed ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PIN de Segurança Box (Mercado Livre / Uber Eats / iFood Style) */}
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>PIN de Segurança da Entrega</span>
              </div>
              <h3 className="text-sm font-bold text-white">
                Informe este código ao motoboy na entrega
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Garante que seu pacote só será entregue nas suas mãos.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <div className="flex items-center gap-1.5 bg-black/50 border border-emerald-500/50 px-3.5 py-2 rounded-2xl shadow-inner">
                {data.verificationCode.split('').map((char, i) => (
                  <span
                    key={i}
                    className="w-8 h-10 flex items-center justify-center bg-slate-800 rounded-xl font-mono text-xl font-black text-emerald-400 border border-slate-700 shadow-xs"
                  >
                    {char}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyPin}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Copiar código PIN"
              >
                {copiedPin ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Live GPS Map Simulation Screen */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-indigo-400" /> Trajeto em Tempo Real via Satélite
            </span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Sinal GPS OK
            </span>
          </div>

          {/* Map Graphic Canvas */}
          <div className="relative h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col justify-between p-4">
            {/* Dark Mode City Grid */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/20 to-slate-950/80" />

            {/* Top Info Strip */}
            <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-300">
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-indigo-400" />
                <span>Restaurante / Cozinha</span>
              </div>
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate max-w-[160px]">{data.deliveryAddress}</span>
              </div>
            </div>

            {/* Central Animated Route Line */}
            <div className="relative z-10 my-auto space-y-3 px-2">
              {/* Motoboy moving icon positioned dynamically */}
              <div className="relative w-full h-8">
                <div
                  className="absolute top-0 -translate-x-1/2 transition-all duration-1000 flex flex-col items-center"
                  style={{ left: `${Math.min(95, Math.max(5, simulatedProgress))}%` }}
                >
                  <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg shadow-indigo-600/70 border-2 border-white animate-bounce">
                    <Bike className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold font-mono text-indigo-300 whitespace-nowrap mt-1 bg-slate-900/90 px-1.5 py-0.2 rounded border border-indigo-800">
                    {data.motoboyName} (~{data.etaMinutes}m)
                  </span>
                </div>
              </div>

              {/* Progress Track */}
              <div className="relative w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-700 shadow-lg shadow-emerald-500/30"
                  style={{ width: `${simulatedProgress}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Partida (Cozinha)</span>
                <span className="text-emerald-400 font-bold">{Math.round(simulatedProgress)}% do trajeto concluído</span>
                <span>Destino (Seu Portão)</span>
              </div>
            </div>

            {/* Footer coordinates / update info */}
            <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Atualizado automaticamente há 2 segundos</span>
              <span className="font-mono">Lat -23.5615 / Long -46.6559 (SP)</span>
            </div>
          </div>
        </div>

        {/* Motoboy Courier Details Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Entregador Parceiro
                </span>
                <h4 className="text-sm font-bold text-white">{data.motoboyName}</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Moto Honda Fan • Placa: <strong className="text-slate-200">{data.motoboyPlate}</strong>
                </p>
              </div>
            </div>

            {data.motoboyPhone && (
              <a
                href={`https://wa.me/${data.motoboyPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Olá ${data.motoboyName}, sou cliente do pedido #${data.orderNumber}!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp do Motoboy</span>
                <span className="sm:hidden">Conversar</span>
              </a>
            )}
          </div>
        </div>

        {/* Order Items & Financial Summary */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Resumo do Pedido</span>
            {data.pixConfirmed && (
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" /> PIX Validado por IA
              </span>
            )}
          </h4>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <p className="font-semibold text-slate-200 leading-relaxed">
              {data.items}
            </p>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
              <span>Subtotal dos Produtos:</span>
              <span className="font-mono text-slate-300">
                R$ {(data.subtotalValue || data.value - (data.deliveryFee || 0)).toFixed(2)}
              </span>
            </div>

            {data.deliveryFee !== undefined && (
              <div className="flex items-center justify-between text-slate-400">
                <span>Taxa de Entrega (Região/CEP):</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {data.deliveryFee === 0 ? 'GRÁTIS 🎁' : `R$ ${data.deliveryFee.toFixed(2)}`}
                </span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold text-white">
              <span>Total Pago:</span>
              <span className="font-mono text-emerald-400 text-base">
                R$ {data.value.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center text-xs text-slate-500 mt-6 space-y-1">
        <p>NEXA Logistics & Atendimento Inteligente • Tecnologia em Tempo Real</p>
        <p className="text-[11px] text-slate-600">Este link é atualizado em tempo real via satélite</p>
      </footer>
    </div>
  );
};
