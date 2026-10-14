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
  Store,
  Plus,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Layers,
  Check,
  Play,
  Timer,
  Flame,
  UtensilsCrossed,
  LayoutDashboard,
  Columns,
  List,
  ChevronRight,
} from 'lucide-react';
import { Lead, EvolutionConfig } from '../types';

interface DeliveryTrackingProps {
  leads: Lead[];
  onSaveLead: (leadData: Partial<Lead>, leadId?: string) => void;
  onOpenChat: (leadId: string) => void;
  evolutionConfig?: EvolutionConfig;
}

export type DeliveryStatus = 'preparing' | 'dispatched' | 'arriving' | 'delivered';

interface DeliveryStage {
  id: DeliveryStatus;
  title: string;
  shortTitle: string;
  badgeColor: string;
  headerBg: string;
  borderColor: string;
  icon: React.ReactNode;
  description: string;
}

const DELIVERY_STAGES: DeliveryStage[] = [
  {
    id: 'preparing',
    title: '🍳 Na Cozinha / Em Preparo',
    shortTitle: 'Na Cozinha',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    headerBg: 'bg-amber-50 text-amber-900 border-b-2 border-amber-400',
    borderColor: 'border-amber-200',
    icon: <UtensilsCrossed className="w-4 h-4 text-amber-600" />,
    description: 'Pedido registrado e em montagem/forno',
  },
  {
    id: 'dispatched',
    title: '🛵 Saiu para Entrega',
    shortTitle: 'Em Rota',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    headerBg: 'bg-indigo-50 text-indigo-900 border-b-2 border-indigo-500',
    borderColor: 'border-indigo-200',
    icon: <Bike className="w-4 h-4 text-indigo-600" />,
    description: 'Motoboy a caminho com rastreamento GPS',
  },
  {
    id: 'arriving',
    title: '⏱️ Chegando no Local (~5 min)',
    shortTitle: 'Chegando (5min)',
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200 animate-pulse',
    headerBg: 'bg-orange-50 text-orange-900 border-b-2 border-orange-500',
    borderColor: 'border-orange-200',
    icon: <Clock className="w-4 h-4 text-orange-600" />,
    description: 'Avisar cliente para receber na portaria/portão',
  },
  {
    id: 'delivered',
    title: '✅ Entregue & Concluído (PIN)',
    shortTitle: 'Entregue',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    headerBg: 'bg-emerald-50 text-emerald-900 border-b-2 border-emerald-500',
    borderColor: 'border-emerald-200',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    description: 'Entrega finalizada com PIN validado',
  },
];

export const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({
  leads,
  onSaveLead,
  onOpenChat,
  evolutionConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'grid'>('kanban');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  // Modal states
  const [selectedLeadForModal, setSelectedLeadForModal] = useState<Lead | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);

  // Edit/New Form fields
  const [orderNumber, setOrderNumber] = useState('');
  const [itemsDesc, setItemsDesc] = useState('');
  const [motoboyName, setMotoboyName] = useState('Carlos Motoboy');
  const [motoboyPhone, setMotoboyPhone] = useState('5511999887766');
  const [motoboyPlate, setMotoboyPlate] = useState('ABC-1234');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [etaMinutes, setEtaMinutes] = useState('20');
  const [verificationCode, setVerificationCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderValue, setOrderValue] = useState('65.00');

  // Delivery Verification PIN Modal state
  const [verifyLeadModal, setVerifyLeadModal] = useState<Lead | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Live GPS Tracking Modal state
  const [trackingLeadModal, setTrackingLeadModal] = useState<Lead | null>(null);

  // WhatsApp Sending state
  const [sendingMsgId, setSendingMsgId] = useState<string | null>(null);
  const [autoTimerActive, setAutoTimerActive] = useState(true);

  // Filter leads that have delivery info
  const deliveryLeads = leads.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(term) ||
      l.phone.includes(term) ||
      (l.deliveryInfo?.orderNumber && l.deliveryInfo.orderNumber.toLowerCase().includes(term)) ||
      (l.deliveryInfo?.motoboyName && l.deliveryInfo.motoboyName.toLowerCase().includes(term)) ||
      (l.deliveryInfo?.itemsDescription && l.deliveryInfo.itemsDescription.toLowerCase().includes(term));
    return matchesSearch && l.deliveryInfo;
  });

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: DeliveryStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    const lead = leads.find((l) => l.id === leadId);
    if (!lead || !lead.deliveryInfo) return;

    if (targetStatus === 'delivered') {
      // Require PIN verification
      setVerifyLeadModal(lead);
      setEnteredPin('');
      setPinError(false);
      setDraggedLeadId(null);
      return;
    }

    await updateDeliveryStatus(lead, targetStatus);
    setDraggedLeadId(null);
  };

  const updateDeliveryStatus = async (lead: Lead, nextStatus: DeliveryStatus) => {
    if (!lead.deliveryInfo) return;

    const updatedInfo = {
      ...lead.deliveryInfo,
      status: nextStatus,
    };

    // Calculate simulated remaining ETA
    if (nextStatus === 'arriving') {
      updatedInfo.etaMinutes = 5;
    } else if (nextStatus === 'delivered') {
      updatedInfo.etaMinutes = 0;
    }

    await onSaveLead(
      {
        deliveryInfo: updatedInfo,
        tags: Array.from(new Set([...lead.tags, `Status: ${nextStatus}`])),
      },
      lead.id
    );

    // Prompt or trigger WhatsApp update
    executeSendUpdate(lead, nextStatus);
  };

  const handleOpenEdit = (lead: Lead) => {
    setSelectedLeadForModal(lead);
    const defaultPin = lead.phone.replace(/\D/g, '').slice(-4) || '1234';
    setOrderNumber(lead.deliveryInfo?.orderNumber || `PED-${Math.floor(1000 + Math.random() * 9000)}`);
    setItemsDesc(lead.deliveryInfo?.itemsDescription || lead.interest || 'Combo Burger Artesanal + Fritas');
    setMotoboyName(lead.deliveryInfo?.motoboyName || 'Carlos Motoboy');
    setMotoboyPhone(lead.deliveryInfo?.motoboyPhone || '5511999887766');
    setMotoboyPlate(lead.deliveryInfo?.motoboyPlate || 'ABC-1234');
    setDeliveryAddress(lead.deliveryInfo?.deliveryAddress || 'Av. Paulista, 1000 - Apto 42 - SP');
    setEtaMinutes(String(lead.deliveryInfo?.etaMinutes || 20));
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
      status: (selectedLeadForModal.deliveryInfo?.status || 'dispatched') as DeliveryStatus,
      verificationCode: finalPin,
    };

    await onSaveLead(
      {
        deliveryInfo: updatedDeliveryInfo,
        tags: Array.from(new Set([...selectedLeadForModal.tags, '🍔 Restaurante/Delivery', '📦 Pedido Ativo'])),
      },
      selectedLeadForModal.id
    );

    setSelectedLeadForModal(null);
  };

  const handleCreateNewOrder = async () => {
    if (!customerName || !customerPhone) {
      alert('Por favor, informe ao menos o nome e o WhatsApp do cliente!');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const defaultPin = finalPhone.slice(-4) || '1234';

    const newLeadData: Partial<Lead> = {
      name: customerName,
      phone: finalPhone,
      value: parseFloat(orderValue) || 60,
      interest: itemsDesc || '1x Combo Burger Artesanal Duplo + Fritas + Refrigerante',
      stageId: 'stage-2',
      tags: ['🍔 Restaurante/Delivery', '📦 Na Cozinha', 'Novo Pedido'],
      notes: `Pedido criado no Kanban de Restaurante & Delivery. Endereço: ${deliveryAddress || 'Retirada ou Entrega rápida'}`,
      aiPaused: false,
      deliveryInfo: {
        orderNumber: orderNumber || `PED-${Math.floor(1000 + Math.random() * 9000)}`,
        itemsDescription: itemsDesc || '1x Combo Burger Artesanal Duplo + Fritas + Refrigerante',
        motoboyName: motoboyName || 'Carlos Motoboy',
        motoboyPhone: motoboyPhone || '5511999887766',
        motoboyPlate: motoboyPlate || 'ABC-1234',
        deliveryAddress: deliveryAddress || 'Av. Paulista, 1000 - Apto 42 - SP',
        etaMinutes: parseInt(etaMinutes) || 25,
        dispatchedAt: new Date().toISOString(),
        status: 'preparing',
        verificationCode: verificationCode.trim() || defaultPin,
      },
    };

    await onSaveLead(newLeadData);
    setShowNewOrderModal(false);
    resetNewOrderForm();
  };

  const resetNewOrderForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setItemsDesc('');
    setDeliveryAddress('');
    setOrderNumber(`PED-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const executeSendUpdate = async (lead: Lead, status: DeliveryStatus) => {
    setSendingMsgId(lead.id);
    try {
      const info = lead.deliveryInfo || {
        orderNumber: 'PED-1024',
        motoboyName: 'Carlos Motoboy',
        etaMinutes: 10,
        deliveryAddress: 'Endereço do Cliente',
        verificationCode: lead.phone.replace(/\D/g, '').slice(-4) || '4321',
      };

      const trackingLink = `https://crm.makprojetosmake.com.br/track/${info.orderNumber || '1024'}`;

      let messageText = '';
      if (status === 'preparing') {
        messageText = `🍳 *PEDIDO RECEBIDO NA COZINHA!*\n\nOlá *${lead.name}*, recebemos com sucesso seu pedido *#${info.orderNumber}*!\n\n📋 *Itens:* ${info.itemsDescription || lead.interest}\n🏠 *Entrega em:* ${info.deliveryAddress || 'Endereço cadastrado'}\n\nNossos chefs já estão preparando com todo o carinho. Avisaremos assim que o motoboy sair! 🍕🍔✨`;
      } else if (status === 'dispatched') {
        messageText = `🛵 *PEDIDO SAIU PARA ENTREGA!*\n\nOlá *${lead.name}*, seu pedido *#${info.orderNumber}* acabou de sair com nosso motoboy *${info.motoboyName}* (Moto Placa: *${info.motoboyPlate || 'ABC-1234'}*).\n\n⏱️ Previsão estimada: *~${info.etaMinutes || 15} minutos*.\n📍 Endereço: ${info.deliveryAddress || 'Endereço confirmado'}.\n\n🗺️ *Acompanhe a rota em tempo real no mapa:* ${trackingLink}\n\n🔐 *Código PIN de Confirmação:* *${info.verificationCode || '4321'}* (Informe ao motoboy na entrega).\n\nObrigado pela preferência! 🚀📦`;
      } else if (status === 'arriving') {
        messageText = `⏱️ *MOTOBOY CHEGANDO EM 5 MINUTOS!*\n\nOlá *${lead.name}*, nosso motoboy *${info.motoboyName}* está chegando no seu endereço (*${info.deliveryAddress || 'seu endereço'}*). Por favor, prepare-se para receber o pedido *#${info.orderNumber}* e tenha em mãos o código PIN: *${info.verificationCode || '4321'}*! 🏍️💨`;
      } else {
        messageText = `✅ *PEDIDO ENTREGUE COM SUCESSO!*\n\nOlá *${lead.name}*, confirmamos a entrega do pedido *#${info.orderNumber}* com validação do código PIN. Tenha um excelente momento e um ótimo apetite! 🌟😋 Se precisar de algo mais, é só chamar no WhatsApp.`;
      }

      await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          message: messageText,
        }),
      });

      // Update lead in state
      const updatedInfo = { ...info, status };
      await onSaveLead({ deliveryInfo: updatedInfo }, lead.id);
    } catch (err) {
      console.error('Erro ao enviar mensagem de entrega:', err);
    } finally {
      setSendingMsgId(null);
    }
  };

  const handleConfirmDeliveryWithPin = async () => {
    if (!verifyLeadModal) return;
    const correctPin =
      verifyLeadModal.deliveryInfo?.verificationCode ||
      verifyLeadModal.phone.replace(/\D/g, '').slice(-4) ||
      '4321';

    if (enteredPin.trim() !== correctPin) {
      setPinError(true);
      return;
    }

    const currentLead = verifyLeadModal;
    setVerifyLeadModal(null);
    await updateDeliveryStatus(currentLead, 'delivered');
  };

  // Quick action to advance to next stage
  const getNextStage = (current: DeliveryStatus): DeliveryStatus | null => {
    if (current === 'preparing') return 'dispatched';
    if (current === 'dispatched') return 'arriving';
    if (current === 'arriving') return 'delivered';
    return null;
  };

  const handleAdvanceStage = async (lead: Lead) => {
    const currentStatus = lead.deliveryInfo?.status || 'preparing';
    const next = getNextStage(currentStatus);
    if (!next) return;

    if (next === 'delivered') {
      setVerifyLeadModal(lead);
      setEnteredPin('');
      setPinError(false);
      return;
    }

    await updateDeliveryStatus(lead, next);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100/70 p-4 md:p-6 overflow-hidden">
      {/* Top Banner with Stats & Controls */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-xl mb-4 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" /> CRM de Restaurantes, Gastronomia & Delivery
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PIN de Segurança Ativo
            </span>
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-indigo-400" /> Rota GPS ao Vivo
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
            <span>Quadro Kanban de Pedidos & Motoboys</span>
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            Aqui chegam e se movimentam todos os pedidos de delivery. Arraste os cards entre as colunas, acompanhe o motoboy no GPS e valide a entrega informando o PIN de 4 dígitos do cliente.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          <button
            onClick={() => {
              resetNewOrderForm();
              setShowNewOrderModal(true);
            }}
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Novo Pedido de Delivery</span>
          </button>
        </div>
      </div>

      {/* Action Bar: Search, View Mode Toggle & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente, pedido, item ou motoboy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        {/* View Mode Toggle: Kanban vs Grid */}
        <div className="flex items-center gap-2">
          <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center gap-1 shadow-2xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Colunas Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Grade / Lista</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Total de Pedidos: <strong className="text-slate-900 font-mono font-bold">{deliveryLeads.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Area: KANBAN COLUMNS VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 overflow-x-auto pb-2">
          {DELIVERY_STAGES.map((stage) => {
            const stageLeads = deliveryLeads.filter(
              (l) => (l.deliveryInfo?.status || 'dispatched') === stage.id
            );

            return (
              <div
                key={stage.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
                className="bg-slate-50/90 border border-slate-200/90 rounded-2xl flex flex-col min-h-0 overflow-hidden shadow-2xs hover:border-slate-300 transition-colors"
              >
                {/* Stage Header */}
                <div className={`p-3.5 ${stage.headerBg} flex items-center justify-between shrink-0`}>
                  <div className="flex items-center gap-2">
                    {stage.icon}
                    <span className="font-bold text-xs uppercase tracking-wide">{stage.shortTitle}</span>
                  </div>
                  <span className="bg-white/80 backdrop-blur-xs font-mono font-black text-xs px-2 py-0.5 rounded-full border border-slate-200/60 shadow-2xs text-slate-800">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="px-3 py-1.5 text-[10px] text-slate-500 border-b border-slate-200/40 bg-white/40">
                  {stage.description}
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-3 min-h-[220px]">
                  {stageLeads.map((lead) => {
                    const info = lead.deliveryInfo!;
                    const nextStage = getNextStage(info.status || 'preparing');

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className="bg-white border border-slate-200/80 hover:border-indigo-400 rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing flex flex-col justify-between gap-2.5 group"
                      >
                        {/* Order Header */}
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                              #{info.orderNumber || 'PED-1024'}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(lead.value || 45)}
                              </span>
                              <button
                                onClick={() => handleOpenEdit(lead)}
                                className="text-[10px] text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 p-1 rounded-md transition-colors"
                                title="Editar dados da entrega"
                              >
                                Editar
                              </button>
                            </div>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                            {lead.name}
                          </h4>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{lead.phone}</span>
                          </div>
                        </div>

                        {/* Items & Address */}
                        <div className="bg-slate-50/80 rounded-lg p-2 text-[11px] space-y-1.5 border border-slate-100">
                          <div className="flex items-start gap-1.5">
                            <Package className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span className="text-slate-700 line-clamp-2 leading-snug font-medium">
                              {info.itemsDescription || lead.interest || 'Combo Lanche Artesanal'}
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                            <span className="text-slate-600 line-clamp-1">
                              {info.deliveryAddress || 'Endereço a confirmar'}
                            </span>
                          </div>
                        </div>

                        {/* Motoboy, ETA & PIN */}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <Bike className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate max-w-[100px]">{info.motoboyName || 'Motoboy'}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 text-[10px]">
                            <KeyRound className="w-3 h-3" />
                            <span>PIN: {info.verificationCode || lead.phone.slice(-4)}</span>
                          </div>
                        </div>

                        {/* GPS Tracking & Stage Buttons */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setTrackingLeadModal(lead)}
                              className="flex-1 flex items-center justify-center gap-1 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                            >
                              <Navigation className="w-3 h-3 text-indigo-600" />
                              <span>Rota GPS</span>
                            </button>
                            <button
                              onClick={() => onOpenChat(lead.id)}
                              className="flex items-center justify-center p-1.5 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                              title="Abrir WhatsApp"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                            </button>
                          </div>

                          {/* Action to advance stage */}
                          {nextStage && (
                            <button
                              disabled={sendingMsgId === lead.id}
                              onClick={() => handleAdvanceStage(lead)}
                              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold shadow-2xs transition-all cursor-pointer ${
                                nextStage === 'dispatched'
                                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                  : nextStage === 'arriving'
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              }`}
                            >
                              <span>Avançar para {DELIVERY_STAGES.find((s) => s.id === nextStage)?.shortTitle}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                      <Truck className="w-6 h-6 mb-1 opacity-40" />
                      <span className="text-[11px] font-medium">Nenhum pedido nesta etapa</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Arraste um pedido aqui</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID / LIST VIEW (Classic view) */
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryLeads.map((lead) => {
              const info = lead.deliveryInfo!;
              const stageMeta = DELIVERY_STAGES.find((s) => s.id === info.status) || DELIVERY_STAGES[1];

              return (
                <div
                  key={lead.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                            #{info.orderNumber || 'PED-1024'}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase ${stageMeta.badgeColor}`}>
                            {stageMeta.title}
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
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        disabled={sendingMsgId === lead.id}
                        onClick={() => executeSendUpdate(lead, 'preparing')}
                        className={`flex items-center justify-center gap-1 px-1.5 py-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          info.status === 'preparing'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                        title="Na Cozinha"
                      >
                        <span>Cozinha 🍳</span>
                      </button>

                      <button
                        disabled={sendingMsgId === lead.id}
                        onClick={() => executeSendUpdate(lead, 'dispatched')}
                        className={`flex items-center justify-center gap-1 px-1.5 py-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          info.status === 'dispatched'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
                        }`}
                        title="Avisar que o motoboy saiu"
                      >
                        <span>Saiu 🏍️</span>
                      </button>

                      <button
                        disabled={sendingMsgId === lead.id}
                        onClick={() => executeSendUpdate(lead, 'arriving')}
                        className={`flex items-center justify-center gap-1 px-1.5 py-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          info.status === 'arriving'
                            ? 'bg-orange-600 text-white border-orange-600'
                            : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border-orange-200'
                        }`}
                        title="Avisar que faltam 5 minutos"
                      >
                        <span>5 Min ⏱️</span>
                      </button>

                      <button
                        disabled={sendingMsgId === lead.id}
                        onClick={() => {
                          setVerifyLeadModal(lead);
                          setEnteredPin('');
                          setPinError(false);
                        }}
                        className={`flex items-center justify-center gap-1 px-1.5 py-2 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                          info.status === 'delivered'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                        title="Confirmar entrega com PIN"
                      >
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
                  Clique no botão &quot;Novo Pedido de Delivery&quot; acima para registrar um pedido ou importe do cardápio do WhatsApp.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

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
              <div className="text-[11px] font-semibold text-slate-500 mb-1">PIN Esperado (Cadastrado):</div>
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
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
                  <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-indigo-400" /> Restaurante / Cozinha</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-rose-400" /> {trackingLeadModal.deliveryInfo?.deliveryAddress}</span>
                </div>

                {/* Progress Track */}
                <div className="relative w-full bg-white/10 h-3 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        trackingLeadModal.deliveryInfo?.status === 'delivered'
                          ? 100
                          : trackingLeadModal.deliveryInfo?.status === 'arriving'
                          ? 85
                          : trackingLeadModal.deliveryInfo?.status === 'dispatched'
                          ? 50
                          : 15
                      }%`,
                    }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Motoboy: <strong className="text-white">{trackingLeadModal.deliveryInfo?.motoboyName}</strong></span>
                  <span>Placa: <strong className="font-mono text-white">{trackingLeadModal.deliveryInfo?.motoboyPlate}</strong></span>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10 text-xs">
                <span className="text-slate-300">Link para o Cliente no WhatsApp:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://crm.makprojetosmake.com.br/track/${trackingLeadModal.deliveryInfo?.orderNumber}`);
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
                O cliente pode acompanhar a rota em tempo real clicando no link enviado no WhatsApp.
              </div>
              <button
                onClick={() => setTrackingLeadModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
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
                <Bike className="w-5 h-5 text-indigo-600" /> Configurar Pedido & Motoboy ({selectedLeadForModal.name})
              </h2>
              <button
                onClick={() => setSelectedLeadForModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
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
                <label className="block font-semibold text-slate-700 mb-1">Itens do Pedido (Cardápio / Bebidas)</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Endereço de Entrega Completo</label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código PIN de Confirmação (Últimos 4 dígitos celular)</label>
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
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDelivery}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-all cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW ORDER MODAL */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-600" /> Cadastrar Novo Pedido de Restaurante / Delivery
              </h2>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Cliente *</label>
                  <input
                    type="text"
                    placeholder="Ex: Camila Castro"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp do Cliente *</label>
                  <input
                    type="text"
                    placeholder="Ex: 11987654321"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block font-semibold text-slate-700 mb-1">Valor Total (R$)</label>
                  <input
                    type="text"
                    value={orderValue}
                    onChange={(e) => setOrderValue(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-emerald-700 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Itens do Pedido (Ex: 1x Burger + Fritas + Refri)</label>
                <input
                  type="text"
                  placeholder="Ex: 1x Smash Burger Duplo com Cheddar + Batata + Coca Zero"
                  value={itemsDesc}
                  onChange={(e) => setItemsDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Endereço de Entrega</label>
                <input
                  type="text"
                  placeholder="Ex: Av. Paulista, 1000 - Apto 42 - SP"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Motoboy Responsável</label>
                  <input
                    type="text"
                    value={motoboyName}
                    onChange={(e) => setMotoboyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempo Estimado (min)</label>
                  <input
                    type="number"
                    value={etaMinutes}
                    onChange={(e) => setEtaMinutes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-amber-700 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewOrder}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Salvar no Kanban de Pedidos</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
