import React, { useState, useEffect } from 'react';
import {
  Package,
  Bike,
  Clock,
  CheckCircle2,
  MapPin,
  Phone,
  Send,
  Sparkles,
  AlertCircle,
  Search,
  User,
  Truck,
  ShieldCheck,
  ExternalLink,
  Navigation,
  KeyRound,
} from 'lucide-react';
import { Lead, EvolutionConfig } from '../types';

interface DeliveryTrackingProps {
  leads: Lead[];
  onSaveLead: (leadData: Partial<Lead>, leadId?: string) => void;
  onOpenChat: (leadId: string) => void;
  evolutionConfig?: EvolutionConfig;
}

export const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  leads,
  onSaveLead,
  onOpenChat,
  evolutionConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<Lead | null>(null);
  
  // Edit form states
  const [orderNumber, setOrderNumber] = useState('');
  const [itemsDesc, setItemsDesc] = useState('');
  const [motoboyName, setMotoboyName] = useState('');
  const [motoboyPhone, setMotoboyPhone] = useState('');
  const [motoboyPlate, setMotoboyPlate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [etaMinutes, setEtaMinutes] = useState('20');
  const [verificationCode, setVerificationCode] = useState('');

  // Delivery Verification PIN Modal state
  const [verifyLeadModal, setVerifyLeadModal] = useState<Lead | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Live GPS Tracking Modal state
  const [trackingLeadModal, setTrackingLeadModal] = useState<Lead | null>(null);
  const [simulatedProgress, setSimulatedProgress] = useState(45); // percentage along route

  // Loading state for WhatsApp sending
  const [sendingMsgId, setSendingMsgId] = useState<string | null>(null);

  // Filter leads that have delivery info
  const deliveryLeads = leads.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(term) ||
      l.phone.includes(term) ||
      (l.deliveryInfo?.orderNumber && l.deliveryInfo.orderNumber.toLowerCase().includes(term)) ||
      (l.deliveryInfo?.motoboyName && l.deliveryInfo.motoboyName.toLowerCase().includes(term));
    return matchesSearch && l.deliveryInfo;
  });

  const handleOpenEdit = (lead: Lead) => {
    setSelectedLeadForModal(lead);
    const defaultPin = lead.phone.replace(/\D/g, '').slice(-4) || '1234';
    setOrderNumber(lead.deliveryInfo?.orderNumber || `PED-${Math.floor(1000 + Math.random() * 9000)}`);
    setItemsDesc(lead.deliveryInfo?.itemsDescription || lead.interest || 'Pedido de Comércio / Mercadoria');
    setMotoboyName(lead.deliveryInfo?.motoboyName || 'Carlos Motoboy');
    setMotoboyPhone(lead.deliveryInfo?.motoboyPhone || '5511999887766');
    setMotoboyPlate(lead.deliveryInfo?.motoboyPlate || 'ABC-1234');
    setDeliveryAddress(lead.deliveryInfo?.deliveryAddress || 'Av. Paulista, 1000 - Apto 42 - SP');
    setEtaMinutes(String(lead.deliveryInfo?.etaMinutes || 15));
    setVerificationCode(lead.deliveryInfo?.verificationCode || defaultPin);
  };

  const handleSaveDelivery = async () => {
    if (!selectedLeadForModal) return;

    const defaultPin = selectedLeadForModal.phone.replace(/\D/g, '').slice(-4) || '1234';
    const finalPin = verificationCode.trim() || defaultPin;

    const updatedDeliveryInfo = {
      orderNumber,
      itemsDescription: itemsDesc,
      motoboyName,
      motoboyPhone,
      motoboyPlate,
      deliveryAddress,
      etaMinutes: parseInt(etaMinutes) || 15,
      dispatchedAt: selectedLeadForModal.deliveryInfo?.dispatchedAt || new Date().toISOString(),
      status: (selectedLeadForModal.deliveryInfo?.status || 'dispatched') as any,
      verificationCode: finalPin,
    };

    await onSaveLead(
      {
        deliveryInfo: updatedDeliveryInfo,
        tags: Array.from(new Set([...selectedLeadForModal.tags, '📦 Pedido/Entrega'])),
      },
      selectedLeadForModal.id
    );

    setSelectedLeadForModal(null);
  };

  const handleSendWhatsAppUpdate = async (lead: Lead, status: 'dispatched' | 'arriving' | 'delivered') => {
    if (status === 'delivered') {
      // Open verification PIN modal before completing
      setVerifyLeadModal(lead);
      setEnteredPin('');
      setPinError(false);
      return;
    }

    await executeSendUpdate(lead, status);
  };

  const executeSendUpdate = async (lead: Lead, status: 'dispatched' | 'arriving' | 'delivered') => {
    setSendingMsgId(lead.id);
    try {
      const info = lead.deliveryInfo || {
        orderNumber: 'PED-1024',
        motoboyName: 'Carlos Motoboy',
        etaMinutes: 10,
        deliveryAddress: 'Endereço do Cliente',
        verificationCode: lead.phone.replace(/\D/g, '').slice(-4) || '4321',
      };

      const trackingLink = `https://nexus-crm-delivery.web.app/track/${info.orderNumber || '1024'}`;

      let messageText = '';
      if (status === 'dispatched') {
        messageText = `🛵 *PEDIDO SAIU PARA ENTREGA!*\n\nOlá *${lead.name}*, seu pedido *#${info.orderNumber || '1024'}* acabou de sair para entrega com nosso motoboy *${info.motoboyName}* (Moto Placa: *${info.motoboyPlate || 'ABC-1234'}*).\n\n⏱️ Previsão estimada: *${info.etaMinutes || 15} minutos*.\n📍 Endereço: ${info.deliveryAddress || 'Endereço confirmado'}.\n\n🗺️ *Acompanhe a rota em tempo real no mapa:* ${trackingLink}\n\n🔐 *Código PIN de Confirmação:* *${info.verificationCode || '4321'}* (Informe ao motoboy na entrega).\n\nQualquer dúvida estamos à disposição! 🚀📦`;
      } else if (status === 'arriving') {
        messageText = `⏱️ *MOTOBOY CHEGANDO EM 5 MINUTOS!*\n\nOlá *${lead.name}*, nosso motoboy *${info.motoboyName}* está chegando no endereço (*${info.deliveryAddress || 'seu endereço'}*). Por favor, prepare-se para receber o pedido *#${info.orderNumber || '1024'}* e tenha em mãos o código PIN: *${info.verificationCode || '4321'}*! 🏍️💨`;
      } else {
        messageText = `✅ *PEDIDO ENTREGUE COM SUCESSO!*\n\nOlá *${lead.name}*, confirmamos a entrega do pedido *#${info.orderNumber || '1024'}* com verificação de PIN bem-sucedida. Agradecemos pela preferência e confiança! Se precisar de algo mais, é só chamar. 🌟🛍️`;
      }

      await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          message: messageText,
        }),
      });

      // Update lead status in state
      const updatedInfo = {
        ...info,
        status,
      };
      await onSaveLead({ deliveryInfo: updatedInfo }, lead.id);

      alert(`Atualização de status enviada com sucesso no WhatsApp de ${lead.name}! 🚀`);
    } catch (err) {
      console.error('Erro ao enviar mensagem de entrega:', err);
      alert('Erro ao enviar notificação no WhatsApp. Verifique a conexão da Evolution API.');
    } finally {
      setSendingMsgId(null);
    }
  };

  const handleConfirmDeliveryWithPin = async () => {
    if (!verifyLeadModal) return;
    const correctPin = verifyLeadModal.deliveryInfo?.verificationCode || verifyLeadModal.phone.replace(/\D/g, '').slice(-4) || '4321';

    if (enteredPin.trim() !== correctPin) {
      setPinError(true);
      return;
    }

    setVerifyLeadModal(null);
    await executeSendUpdate(verifyLeadModal, 'delivered');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 p-4 md:p-6 overflow-y-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Rota iFood Style com GPS & PIN de Segurança
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Módulo de Rastreamento de Entregas & Motoboys</h1>
          <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl">
            Acompanhe a rota em tempo real dos motoboys, visualize o ETA dinâmico, exija o PIN de confirmação (últimos dígitos do celular) e dispare atualizações automáticas via WhatsApp.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-3 rounded-xl text-center">
            <div className="text-2xl font-black text-emerald-400">{deliveryLeads.length}</div>
            <div className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Entregas Ativas</div>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por cliente, pedido ou motoboy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Leads / Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {deliveryLeads.map((lead) => {
          const info = lead.deliveryInfo || {
            orderNumber: `PED-${Math.floor(1000 + lead.id.length * 123)}`,
            itemsDescription: lead.interest || 'Mercadoria Geral',
            motoboyName: 'Carlos Motoboy',
            motoboyPhone: '5511999887766',
            motoboyPlate: 'ABC-1234',
            deliveryAddress: 'Endereço não informado',
            etaMinutes: 15,
            status: 'dispatched',
            verificationCode: lead.phone.replace(/\D/g, '').slice(-4) || '4321',
          };

          return (
            <div
              key={lead.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                        #{info.orderNumber || 'PED-1024'}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                        info.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        info.status === 'arriving' ? 'bg-amber-100 text-amber-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {info.status === 'delivered' ? '✅ Entregue' : info.status === 'arriving' ? '⏱️ Chegando (5min)' : '🛵 Em Trânsito'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-2">{lead.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{lead.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(lead)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                </div>

                {/* Items & Address & PIN */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 mb-4 border border-slate-100">
                  <div className="flex items-start gap-2">
                    <Package className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">Itens:</span>{' '}
                      <span className="text-slate-600">{info.itemsDescription || lead.interest}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-700">Endereço:</span>{' '}
                      <span className="text-slate-600">{info.deliveryAddress || 'Endereço do cliente'}</span>
                    </div>
                  </div>
                  
                  {/* PIN Verification Badge */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <KeyRound className="w-3 h-3" />
                      <span>PIN: {info.verificationCode || '4321'}</span>
                    </div>
                    <button
                      onClick={() => setTrackingLeadModal(lead)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md text-[11px] transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3 h-3" /> Rota GPS iFood
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Bike className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{info.motoboyName || 'Motoboy'} ({info.motoboyPlate || 'ABC-1234'})</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Clock className="w-3 h-3" />
                      <span>~{info.etaMinutes || 15} min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for WhatsApp Delivery Notifications */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Disparar Status WhatsApp (Evolution API):
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    disabled={sendingMsgId === lead.id}
                    onClick={() => handleSendWhatsAppUpdate(lead, 'dispatched')}
                    className="flex items-center justify-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    title="Avisar que o motoboy saiu"
                  >
                    <Bike className="w-3.5 h-3.5" />
                    <span>Saiu 🏍️</span>
                  </button>

                  <button
                    disabled={sendingMsgId === lead.id}
                    onClick={() => handleSendWhatsAppUpdate(lead, 'arriving')}
                    className="flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    title="Avisar que faltam 5 minutos"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>5 Min ⏱️</span>
                  </button>

                  <button
                    disabled={sendingMsgId === lead.id}
                    onClick={() => handleSendWhatsAppUpdate(lead, 'delivered')}
                    className="flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    title="Confirmar entrega com PIN"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Entregue ✅</span>
                  </button>
                </div>
                <button
                  onClick={() => onOpenChat(lead.id)}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ver Histórico de Conversa no WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}

        {deliveryLeads.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-bounce" />
            <h3 className="text-base font-bold text-slate-800">Nenhum pedido de entrega ativo encontrado</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
              Adicione dados de entrega aos seus leads no Kanban ou crie novos pedidos para monitorar a rota em tempo real.
            </p>
          </div>
        )}
      </div>

      {/* PIN Verification Modal */}
      {verifyLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Confirmar Entrega (PIN)
              </h2>
              <button
                onClick={() => setVerifyLeadModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Para concluir a entrega do pedido <span className="font-mono font-bold text-indigo-600">#{verifyLeadModal.deliveryInfo?.orderNumber}</span> para <span className="font-bold text-slate-800">{verifyLeadModal.name}</span>, informe o código PIN (últimos 4 dígitos do celular do cliente):
            </p>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] font-semibold text-slate-500 mb-1">PIN Esperado (Exemplo):</div>
              <div className="text-xl font-mono font-black text-emerald-600 tracking-widest">
                {verifyLeadModal.deliveryInfo?.verificationCode || verifyLeadModal.phone.replace(/\D/g, '').slice(-4) || '4321'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Digite o PIN informado pelo cliente:</label>
              <input
                type="text"
                maxLength={4}
                placeholder="Ex: 4321"
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setPinError(false);
                }}
                className={`w-full bg-white border rounded-xl px-4 py-2.5 text-center text-lg font-mono font-bold tracking-widest text-slate-900 ${
                  pinError ? 'border-rose-500 bg-rose-50' : 'border-slate-300 focus:border-emerald-500'
                }`}
              />
              {pinError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">PIN incorreto! Verifique o número com o cliente.</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setVerifyLeadModal(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeliveryWithPin}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Validar & Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live GPS Tracking Simulator Modal (iFood Style) */}
      {trackingLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-600" /> Rota em Tempo Real (iFood Style) - #{trackingLeadModal.deliveryInfo?.orderNumber}
              </h2>
              <button
                onClick={() => setTrackingLeadModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Simulated GPS Map View */}
            <div className="relative bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 rounded-2xl p-6 text-white overflow-hidden shadow-inner h-64 flex flex-col justify-between">
              {/* Decorative Map Grid Lines */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-semibold text-emerald-300">GPS Ativo • Sinal Satélite OK</span>
                </div>
                <div className="text-xs font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-lg">
                  ETA: ~{trackingLeadModal.deliveryInfo?.etaMinutes || 10} min
                </div>
              </div>

              {/* Animated Motoboy Progress Bar on Route */}
              <div className="relative z-10 space-y-3 my-auto">
                <div className="flex justify-between text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-indigo-400" /> Loja / Expedição</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-400" /> {trackingLeadModal.deliveryInfo?.deliveryAddress}</span>
                </div>
                
                {/* Progress Track */}
                <div className="relative w-full bg-white/10 h-3 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${trackingLeadModal.deliveryInfo?.status === 'delivered' ? 100 : trackingLeadModal.deliveryInfo?.status === 'arriving' ? 85 : 45}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Motoboy: <strong className="text-white">{trackingLeadModal.deliveryInfo?.motoboyName}</strong></span>
                  <span>Placa: <strong className="font-mono text-white">{trackingLeadModal.deliveryInfo?.motoboyPlate}</strong></span>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <span className="text-slate-300">Link para o Cliente:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://nexus-crm-delivery.web.app/track/${trackingLeadModal.deliveryInfo?.orderNumber}`);
                    alert('Link de rastreamento copiado com sucesso! 📋');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Copiar Link do Rastreio
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-slate-500">
                O cliente pode acompanhar essa rota em tempo real clicando no link enviado no WhatsApp.
              </div>
              <button
                onClick={() => setTrackingLeadModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Delivery Modal */}
      {selectedLeadForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bike className="w-5 h-5 text-indigo-600" /> Configurar Entrega & Motoboy ({selectedLeadForModal.name})
              </h2>
              <button
                onClick={() => setSelectedLeadForModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número do Pedido</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição dos Itens / Produto</label>
                <input
                  type="text"
                  value={itemsDesc}
                  onChange={(e) => setItemsDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Motoboy</label>
                  <input
                    type="text"
                    value={motoboyName}
                    onChange={(e) => setMotoboyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone do Motoboy</label>
                  <input
                    type="text"
                    value={motoboyPhone}
                    onChange={(e) => setMotoboyPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Placa da Moto</label>
                  <input
                    type="text"
                    value={motoboyPlate}
                    onChange={(e) => setMotoboyPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ETA (Minutos estimados)</label>
                  <input
                    type="number"
                    value={etaMinutes}
                    onChange={(e) => setEtaMinutes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Endereço de Entrega</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">PIN de Confirmação (Últimos 4 dígitos celular)</label>
                <input
                  type="text"
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-emerald-700"
                  placeholder="Ex: 4321"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedLeadForModal(null)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDelivery}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-all"
              >
                Salvar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
