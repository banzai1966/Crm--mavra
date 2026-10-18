import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  RotateCcw,
  Users,
  Mic,
  FileText,
  ChevronRight,
  Info,
  BookmarkPlus,
  Trash2,
  Plus,
  Star,
  Check,
} from 'lucide-react';
import { Lead } from '../types';

interface ReactivationCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseLeads: Lead[];
  onLeadsUpdated?: () => void;
  initialNiche?: 'all' | 'delivery' | 'auto' | 'health' | 'retail' | 'b2b';
}

interface DispatchLog {
  leadId: string;
  name: string;
  phone: string;
  status: 'pending' | 'sending' | 'success' | 'failed';
  error?: string;
  timestamp?: string;
}

export type TemplateCategory = 'all' | 'delivery' | 'auto' | 'health' | 'retail' | 'b2b' | 'custom';

export interface TemplatePreset {
  id: string;
  category: 'delivery' | 'auto' | 'health' | 'retail' | 'b2b' | 'custom';
  categoryLabel: string;
  name: string;
  text: string;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  // 🍕 1. PIZZARIA, HAMBURGUERIA & GASTRONOMIA
  {
    id: 'delivery_pizza_nostalgia',
    category: 'delivery',
    categoryLabel: '🍕 Pizzaria & Delivery',
    name: '🍕 Pizzaria (Saudade da Pizza Favorita + Borda Recheada Grátis)',
    text: 'Olá {nome}, tudo bem? Sentimos sua falta por aqui! 😋 Notamos que já faz um tempinho do seu último pedido de {pizza_favorita}. Hoje no forno à lenha preparamos um mimo para o seu retorno: pedindo qualquer pizza grande, a borda recheada de Catupiry ou o Guaraná 2L é por nossa conta! Bora jantar bem hoje? 🍕✨',
  },
  {
    id: 'delivery_burger_sextou',
    category: 'delivery',
    categoryLabel: '🍕 Pizzaria & Delivery',
    name: '🍔 Hamburgueria & Lanches (Sextou VIP / Cupom 15% OFF)',
    text: 'Fala {nome}! Tudo bem? Sexta-feira oficial pede aquele burger artesanal quentinho! 🍔 Como faz um tempinho que você não pede no {restaurante}, liberamos um cupom exclusivo de 15% OFF só pra você hoje: use o cupom {cupom} no seu pedido. Quer dar uma olhada no cardápio de hoje?',
  },
  {
    id: 'delivery_sumido_mimo',
    category: 'delivery',
    categoryLabel: '🍕 Pizzaria & Delivery',
    name: '🎁 Delivery Geral (Cliente Sumido +30 dias + Sobremesa Cortesia)',
    text: 'Oi {nome}, tudo bem? Passando para te dar um oi e saber como você está! Vimos que faz mais de um mês que você não pede no {restaurante}. Aconteceu algo ou podemos melhorar em algum detalhe? Preparamos uma sobremesa cortesia exclusiva no seu próximo pedido! Podemos te enviar o cardápio atualizado? 🍰✨',
  },
  {
    id: 'delivery_combo_familia',
    category: 'delivery',
    categoryLabel: '🍕 Pizzaria & Delivery',
    name: '👨‍👩‍👧‍👦 Delivery (Combo Família / Domingo à Noite com Entrega Grátis)',
    text: 'Olá {nome}! Domingo à noite ninguém quer ir pro fogão, né? Preparamos o Combo Família Especial no {restaurante} com entrega grátis no seu endereço hoje! Que tal garantir o jantar da galera com aquela pizza quentinha saindo do forno? Posso anotar o seu pedido? 🍕🛵',
  },

  // 🚗 2. AUTOPEÇAS, OFICINAS MECÂNICAS & AUTOMOTIVO
  {
    id: 'auto_oleo_revisao',
    category: 'auto',
    categoryLabel: '🚗 Autopeças & Oficina',
    name: '🚗 Autopeças & Oficina (Revisão Periódica & Troca de Óleo +6m)',
    text: 'Olá {nome}, tudo bem? Estávamos revisando o histórico aqui na {empresa} e notamos que já se passaram quase 6 meses da última manutenção preventiva do seu veículo ({veiculo}). Rodar com óleo vencido desgasta o motor e eleva o consumo. Gostaria de agendar um horário rápido para a troca esta semana? 🚗🔧',
  },
  {
    id: 'auto_pneus_freios',
    category: 'auto',
    categoryLabel: '🚗 Autopeças & Oficina',
    name: '🛞 Freios, Pneus & Alinhamento (Check-up Preventivo Gratuito)',
    text: 'Olá {nome}! Tudo bem? Passando para te lembrar que a checagem periódica das pastilhas de freio e o alinhamento dos pneus são essenciais para a sua segurança e economia. Estamos com check-up gratuito de 15 itens de segurança aqui na oficina esta semana. Vamos agendar para você passar aqui? 🛞⚙️',
  },
  {
    id: 'auto_peca_estoque',
    category: 'auto',
    categoryLabel: '🚗 Autopeças & Oficina',
    name: '📦 Autopeças (Orçamento Cotado / Peça em Promoção)',
    text: 'Olá {nome}! Tudo bem? Aquele orçamento da peça {peca} que você cotou conosco chegou em um lote especial de fábrica com desconto de 15% à vista aqui na {empresa}. Ainda tem interesse para eu segurar essa peça no balcão para você? 📦🔩',
  },

  // 🩺 3. ODONTOLOGIA, CLÍNICAS & HARMONIZAÇÃO
  {
    id: 'dental_checkup',
    category: 'health',
    categoryLabel: '🩺 Clínicas & Odonto',
    name: '🦷 Odontologia (Revisão Preventiva & Check-up Semestral Dra. Lucy)',
    text: 'Olá {nome}, tudo bem por aí? Passando rapidinho para saber como está a sua saúde bucal e te lembrar da importância da avaliação preventiva semestral com a Dra. Lucy Murata. Nossa equipe tem horários especiais abertos esta semana aqui no Euroville Mall! 🌿✨',
  },
  {
    id: 'dental_prophylaxis',
    category: 'health',
    categoryLabel: '🩺 Clínicas & Odonto',
    name: '🦷 Odontologia (Limpeza & Profilaxia Preventiva Vencida)',
    text: 'Olá {nome}! Tudo bem? Estávamos revisando sua ficha clínica e notamos que já se passaram mais de 6 meses desde a sua última profilaxia e remoção de biofilme. A prevenção é o segredo para manter o sorriso impecável. Gostaria que eu verificasse os horários disponíveis com a Dra. Lucy esta semana? 🦷✨',
  },
  {
    id: 'dental_treatment',
    category: 'health',
    categoryLabel: '🩺 Clínicas & Odonto',
    name: '🦷 Odontologia (Retomada de Tratamento / Implante / Alinhador)',
    text: 'Olá {nome}! Tudo bem? A equipe da Dra. Lucy Murata estava revisando os prontuários e lembramos de você. Conseguiu verificar a continuidade do seu tratamento de {procedimento}? Estamos com condições especiais de retomada esta semana! 🦷',
  },
  {
    id: 'aesthetic_care',
    category: 'health',
    categoryLabel: '🩺 Clínicas & Odonto',
    name: '💆‍♀️ Estética & Harmonização Facial (Retorno Semestral)',
    text: 'Olá {nome}, querida! Tudo bem? Passando para lembrar que já completamos 6 meses da sua última aplicação e estamos no período ideal para o retoque do bioestimulador e toxina botulínica. Vamos realçar ainda mais a sua beleza natural? ✨💖',
  },
  {
    id: 'medical_routine',
    category: 'health',
    categoryLabel: '🩺 Clínicas & Odonto',
    name: '🩺 Clínica Médica (Exames de Rotina & Check-up Anual)',
    text: 'Olá {nome}! Como você tem passado? Passando para saber como está a sua saúde e se você já realizou os seus exames de rotina deste ano. Acompanhar preventivamente é fundamental para o seu bem-estar. Gostaria de verificar os horários de consulta para esta semana? 🩺',
  },

  // 🛒 4. VAREJO, MODA & E-COMMERCE
  {
    id: 'retail_novidades',
    category: 'retail',
    categoryLabel: '🛒 Varejo & Moda',
    name: '🛍️ Varejo & Moda (Coleção Nova + Cupom de Boas-Vindas)',
    text: 'Olá {nome}! Tudo bem? Sentimos sua falta aqui na {empresa}! Acabou de chegar uma coleção linda com lançamentos que combinam perfeitamente com o seu estilo. Liberamos o cupom especial {cupom} com 10% OFF + Frete Grátis só para você matar a saudade hoje. Quer que eu te mande o catálogo? 🛍️✨',
  },
  {
    id: 'retail_carrinho',
    category: 'retail',
    categoryLabel: '🛒 Varejo & Moda',
    name: '🛒 Varejo (Interesse em Aberto / Poucas Unidades)',
    text: 'Olá {nome}! Tudo bem? Notamos que você tinha se interessado por {interesse}. Conseguimos uma condição especial de parcelamento sem juros para você finalizar hoje. Ainda tem interesse para eu reservar para você?',
  },

  // 💼 5. B2B & SERVIÇOS
  {
    id: 'b2b_proposta',
    category: 'b2b',
    categoryLabel: '💼 B2B & Serviços',
    name: '💼 Comercial B2B (Retomada de Proposta Comercial Parada)',
    text: 'Olá {nome}! Tudo bem? Passando para saber se você conseguiu avaliar a proposta de {interesse} e se ficou alguma dúvida com a sua diretoria. Conseguimos viabilizar uma condição especial e bônus de implantação se fecharmos ainda este mês. Consegue falar 5 minutinhos hoje?',
  },
  {
    id: 'b2b_followup',
    category: 'b2b',
    categoryLabel: '💼 B2B & Serviços',
    name: '💼 Consultoria & Serviços (Follow-up de Resultados & Novos Projetos)',
    text: 'Olá {nome}! Tudo bem por aí? Passando para saber como estão os resultados e o ritmo dos negócios na sua empresa neste trimestre. Estamos com uma nova solução focada em aumento de produtividade que pode somar muito para o seu time. Posso te apresentar um resumo?',
  },
];

export const ReactivationCampaignModal: React.FC<ReactivationCampaignModalProps> = ({
  isOpen,
  onClose,
  baseLeads,
  onLeadsUpdated,
  initialNiche = 'all',
}) => {
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>(initialNiche);
  
  // Custom templates stored locally
  const [customTemplates, setCustomTemplates] = useState<TemplatePreset[]>(() => {
    try {
      const saved = localStorage.getItem('nexa_custom_reactivation_templates_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showSaveCustomModal, setShowSaveCustomModal] = useState<boolean>(false);
  const [newModelName, setNewModelName] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Default to appropriate template based on initialNiche
  const getDefaultTemplate = () => {
    if (initialNiche === 'delivery') return TEMPLATE_PRESETS[0].text;
    if (initialNiche === 'auto') return TEMPLATE_PRESETS[4].text;
    if (initialNiche === 'health') return TEMPLATE_PRESETS[7].text;
    if (initialNiche === 'retail') return TEMPLATE_PRESETS[12].text;
    if (initialNiche === 'b2b') return TEMPLATE_PRESETS[14].text;
    return TEMPLATE_PRESETS[0].text;
  };

  const [messageTemplate, setMessageTemplate] = useState<string>(getDefaultTemplate());
  const [delaySeconds, setDelaySeconds] = useState<number>(25);
  const [sendAsVoice, setSendAsVoice] = useState<boolean>(false);
  const [customLimit, setCustomLimit] = useState<string>('');

  // Execution state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [campaignFinished, setCampaignFinished] = useState<boolean>(false);

  const abortControllerRef = useRef<boolean>(false);
  const pauseRef = useRef<boolean>(false);

  // All combined presets
  const allPresets = [...customTemplates, ...TEMPLATE_PRESETS];
  const displayedPresets = allPresets.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  // Initialize selected leads
  useEffect(() => {
    if (isOpen) {
      if (initialNiche && initialNiche !== 'all') {
        setSelectedCategory(initialNiche);
      }
      const initialIds = baseLeads.map((l) => l.id);
      setSelectedLeadIds(initialIds);
      setLogs(
        baseLeads.map((l) => ({
          leadId: l.id,
          name: l.name,
          phone: l.phone,
          status: 'pending',
        }))
      );
      setIsRunning(false);
      setIsPaused(false);
      setCurrentIndex(0);
      setCountdown(0);
      setCampaignFinished(false);
      abortControllerRef.current = false;
      pauseRef.current = false;
    }
  }, [isOpen, baseLeads, initialNiche]);

  if (!isOpen) return null;

  const toggleSelectLead = (id: string) => {
    if (isRunning) return;
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isRunning) return;
    if (selectedLeadIds.length === baseLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(baseLeads.map((l) => l.id));
    }
  };

  const selectBatchLimit = (limit: number) => {
    if (isRunning) return;
    if (limit <= 0) {
      setSelectedLeadIds([]);
      return;
    }
    const sliced = baseLeads.slice(0, limit).map((l) => l.id);
    setSelectedLeadIds(sliced);
  };

  const insertVariable = (variable: string) => {
    setMessageTemplate((prev) => prev + ' ' + variable);
  };

  const handleSaveCustomTemplate = () => {
    if (!newModelName.trim() || !messageTemplate.trim()) return;
    const newPreset: TemplatePreset = {
      id: 'custom_' + Date.now(),
      category: 'custom',
      categoryLabel: '⭐ Modelo Personalizado',
      name: `⭐ ${newModelName.trim()}`,
      text: messageTemplate.trim(),
    };
    const updated = [newPreset, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('nexa_custom_reactivation_templates_v2', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save template to localStorage', e);
    }
    setNewModelName('');
    setShowSaveCustomModal(false);
    setSelectedCategory('custom');
    setSaveSuccessMsg('Modelo salvo com sucesso na sua lista!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleDeleteCustomTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customTemplates.filter((t) => t.id !== id);
    setCustomTemplates(updated);
    try {
      localStorage.setItem('nexa_custom_reactivation_templates_v2', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

  // Preview generated message for the first selected lead
  const previewLead = baseLeads.find((l) => selectedLeadIds.includes(l.id)) || baseLeads[0];
  const previewText = previewLead
    ? messageTemplate
        .replace(/\{nome\}/gi, (previewLead.name || 'Cliente').split(' ')[0])
        .replace(/\{procedimento\}/gi, previewLead.triage?.procedure || previewLead.interest || 'atendimento')
        .replace(/\{interesse\}/gi, previewLead.interest || 'nossos produtos')
        .replace(/\{clinica\}/gi, 'clínica da Dra. Lucy Murata')
        .replace(/\{restaurante\}|\{pizzaria\}/gi, previewLead.deliveryInfo ? 'Pizzaria Bella Gourmet' : 'nossa Pizzaria & Restaurante')
        .replace(/\{empresa\}/gi, 'nossa empresa')
        .replace(
          /\{ultimo_pedido\}|\{pizza_favorita\}|\{preferencia\}/gi,
          previewLead.deliveryInfo?.itemsDescription || previewLead.interest || 'sua pizza favorita'
        )
        .replace(/\{cupom\}/gi, 'VOLTA15')
        .replace(
          /\{veiculo\}/gi,
          previewLead.notes?.match(/veículo:\s*([^).\n]+)/i)?.[1]?.trim() || 'seu veículo (Corolla 2021)'
        )
        .replace(/\{peca\}/gi, previewLead.interest || 'Kit Pastilhas de Freio')
        .replace(/\{dias_sem_pedir\}/gi, 'mais de 20 dias')
    : messageTemplate;

  // Run the batch sequence
  const startCampaign = async () => {
    if (selectedLeadIds.length === 0) {
      return;
    }

    const leadsToProcess = baseLeads.filter((l) => selectedLeadIds.includes(l.id));
    setIsRunning(true);
    setIsPaused(false);
    setCampaignFinished(false);
    abortControllerRef.current = false;
    pauseRef.current = false;

    // Reset log statuses
    setLogs(
      leadsToProcess.map((l) => ({
        leadId: l.id,
        name: l.name,
        phone: l.phone,
        status: 'pending',
      }))
    );

    for (let i = 0; i < leadsToProcess.length; i++) {
      if (abortControllerRef.current) break;

      // Handle pause
      while (pauseRef.current) {
        if (abortControllerRef.current) break;
        await new Promise((r) => setTimeout(r, 500));
      }

      if (abortControllerRef.current) break;

      setCurrentIndex(i);
      const lead = leadsToProcess[i];

      // Mark as sending
      setLogs((prev) =>
        prev.map((log) => (log.leadId === lead.id ? { ...log, status: 'sending' } : log))
      );

      try {
        const response = await fetch('/api/campaigns/send-reactivation-single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: lead.id,
            messageTemplate,
            sendAsVoice,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setLogs((prev) =>
            prev.map((log) =>
              log.leadId === lead.id
                ? {
                    ...log,
                    status: 'success',
                    timestamp: new Date().toLocaleTimeString('pt-BR'),
                  }
                : log
            )
          );
        } else {
          setLogs((prev) =>
            prev.map((log) =>
              log.leadId === lead.id
                ? {
                    ...log,
                    status: 'failed',
                    error: data.error || 'Falha no envio',
                    timestamp: new Date().toLocaleTimeString('pt-BR'),
                  }
                : log
            )
          );
        }
      } catch (err: any) {
        setLogs((prev) =>
          prev.map((log) =>
            log.leadId === lead.id
              ? {
                  ...log,
                  status: 'failed',
                  error: err.message || 'Erro de conexão',
                  timestamp: new Date().toLocaleTimeString('pt-BR'),
                }
              : log
          )
        );
      }

      // If not the last lead and not cancelled, wait anti-ban delay
      if (i < leadsToProcess.length - 1 && !abortControllerRef.current) {
        // Random variance between -3s and +5s to look completely human
        const effectiveDelay = Math.max(10, delaySeconds + Math.floor(Math.random() * 8) - 3);
        for (let cd = effectiveDelay; cd > 0; cd--) {
          if (abortControllerRef.current) break;
          while (pauseRef.current) {
            if (abortControllerRef.current) break;
            await new Promise((r) => setTimeout(r, 500));
          }
          setCountdown(cd);
          await new Promise((r) => setTimeout(r, 1000));
        }
        setCountdown(0);
      }
    }

    setIsRunning(false);
    setCampaignFinished(true);
    if (onLeadsUpdated) {
      onLeadsUpdated();
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      pauseRef.current = false;
      setIsPaused(false);
    } else {
      pauseRef.current = true;
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    abortControllerRef.current = true;
    pauseRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    setCountdown(0);
    if (onLeadsUpdated) {
      onLeadsUpdated();
    }
  };

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;
  const pendingCount = logs.filter((l) => l.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Campanha de Reativação da Base Antiga
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Proteção Anti-Ban Ativa
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Disparo cadenciado para reatar contato com pacientes e leads inativos com total segurança.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isRunning) {
                abortControllerRef.current = true;
                pauseRef.current = false;
                setIsRunning(false);
              }
              onClose();
            }}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Audience Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <Users className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Contatos na Base
                </span>
                <span className="text-lg font-bold text-slate-800 font-mono">
                  {baseLeads.length} <span className="text-xs font-normal text-slate-500">pacientes</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Selecionados para Envio
                </span>
                <span className="text-lg font-bold text-indigo-700 font-mono">
                  {selectedLeadIds.length} <span className="text-xs font-normal text-slate-500">contatos</span>
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Cadência Anti-Bloqueio
                </span>
                <span className="text-lg font-bold text-amber-700 font-mono">
                  ~{delaySeconds}s <span className="text-xs font-normal text-slate-500">entre envios</span>
                </span>
              </div>
            </div>
          </div>

          {/* Running State View vs Setup View */}
          {isRunning || campaignFinished ? (
            <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {campaignFinished ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Disparo Concluído com Sucesso!</span>
                      </>
                    ) : isPaused ? (
                      <>
                        <Pause className="w-4 h-4 text-amber-600" />
                        <span>Disparo Pausado</span>
                      </>
                    ) : (
                      <>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                        </span>
                        <span>Disparando Campanha em Lote...</span>
                      </>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {campaignFinished
                      ? `${successCount} mensagens entregues com sucesso. Conforme os pacientes responderem, a Sofia atenderá e os moverá automaticamente para o funil ativo!`
                      : `Processando contato ${currentIndex + 1} de ${selectedLeadIds.length}...`}
                  </p>
                </div>

                {!campaignFinished && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePauseResume}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 cursor-pointer shadow-2xs"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-600" />}
                      <span>{isPaused ? 'Continuar' : 'Pausar'}</span>
                    </button>
                    <button
                      onClick={handleStop}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer shadow-2xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-mono">
                  <span>
                    Progresso: {successCount + failedCount} / {selectedLeadIds.length}
                  </span>
                  <span>
                    {Math.round(((successCount + failedCount) / (selectedLeadIds.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.round(((successCount + failedCount) / (selectedLeadIds.length || 1)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Countdown ticker */}
              {countdown > 0 && !isPaused && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                    <span>Intervalo anti-bloqueio entre mensagens...</span>
                  </div>
                  <span className="font-mono font-bold text-amber-700 text-sm">
                    Próximo envio em {countdown}s
                  </span>
                </div>
              )}

              {/* Live Logs Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="py-2 px-3">Contato</th>
                      <th className="py-2 px-3">Telefone</th>
                      <th className="py-2 px-3">Status</th>
                      <th className="py-2 px-3 text-right">Horário</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.leadId} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{log.name}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{log.phone}</td>
                        <td className="py-2 px-3">
                          {log.status === 'success' && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" /> Enviado
                            </span>
                          )}
                          {log.status === 'sending' && (
                            <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 text-[10px] animate-pulse">
                              <Send className="w-3 h-3" /> Enviando...
                            </span>
                          )}
                          {log.status === 'failed' && (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[10px]" title={log.error}>
                              <AlertCircle className="w-3 h-3" /> Erro: {log.error?.slice(0, 30)}
                            </span>
                          )}
                          {log.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 text-slate-400 font-medium text-[10px]">
                              Na fila
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-400 font-mono text-[11px]">
                          {log.timestamp || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {campaignFinished && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Fechar e Voltar ao CRM
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Setup View */
            <div className="space-y-6">
              {/* Presets and Template Editor */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Modelos de Mensagem Validados para Alta Conversão</span>
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Selecione um modelo pronto por nicho ou digite e salve seu próprio texto
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSaveCustomModal(!showSaveCustomModal)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer"
                      title="Salvar o texto atual como um novo modelo permanente"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Salvar Meu Modelo</span>
                    </button>
                  </div>
                </div>

                {/* Save Custom Template Popover / Inline Box */}
                {showSaveCustomModal && (
                  <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                    <span className="text-xs font-bold text-indigo-950 block">
                      Salvar Mensagem Atual como Novo Modelo
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        placeholder="Nome do modelo (Ex: Quarta da Pizza com Borda Grátis)..."
                        className="flex-1 bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomTemplate}
                        disabled={!newModelName.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Salvar
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSaveCustomModal(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs px-2 cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {saveSuccessMsg && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{saveSuccessMsg}</span>
                  </div>
                )}

                {/* Category Pills Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                  {[
                    { id: 'all', label: '🌟 Todos os Nichos' },
                    { id: 'delivery', label: '🍕 Pizzaria & Delivery' },
                    { id: 'auto', label: '🚗 Autopeças & Oficina' },
                    { id: 'health', label: '🩺 Clínicas & Odonto' },
                    { id: 'retail', label: '🛒 Varejo & Moda' },
                    { id: 'b2b', label: '💼 B2B & Serviços' },
                    { id: 'custom', label: `⭐ Meus Modelos (${customTemplates.length})` },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id as TemplateCategory)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Presets Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {displayedPresets.length === 0 ? (
                    <div className="col-span-2 text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
                      Nenhum modelo personalizado salvo ainda. Digite sua mensagem no campo abaixo e clique em <b>"Salvar Meu Modelo"</b>!
                    </div>
                  ) : (
                    displayedPresets.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => setMessageTemplate(preset.text)}
                        className={`text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer relative group flex flex-col justify-between ${
                          messageTemplate === preset.text
                            ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-2xs ring-1 ring-indigo-500'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-900 text-[11px] line-clamp-1">
                              {preset.name}
                            </span>
                            {preset.category === 'custom' && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteCustomTemplate(preset.id, e)}
                                className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer opacity-80 group-hover:opacity-100"
                                title="Excluir este modelo personalizado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="line-clamp-2 text-[11px] text-slate-500">{preset.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Variable Tags Inserter */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Inserir:</span>
                  {[
                    { label: '{nome}', tip: 'Primeiro nome do cliente ou paciente' },
                    { label: '{pizza_favorita}', tip: 'Pizza ou prato favorito (ex: Pizza Calabresa)' },
                    { label: '{ultimo_pedido}', tip: 'Descrição do último pedido de delivery' },
                    { label: '{cupom}', tip: 'Código de cupom especial (ex: VOLTA15)' },
                    { label: '{restaurante}', tip: 'Nome da sua pizzaria ou restaurante' },
                    { label: '{veiculo}', tip: 'Modelo do veículo (ex: Corolla 2021)' },
                    { label: '{peca}', tip: 'Peça ou produto cotado anteriormente' },
                    { label: '{procedimento}', tip: 'Procedimento clínico ou consulta' },
                    { label: '{clinica}', tip: 'Nome da clínica (Dra. Lucy Murata)' },
                    { label: '{empresa}', tip: 'Nome fantasia da empresa' },
                  ].map((tag) => (
                    <button
                      key={tag.label}
                      type="button"
                      onClick={() => insertVariable(tag.label)}
                      title={tag.tip}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-800 text-slate-700 border border-slate-200 rounded-md text-[11px] font-mono font-semibold transition-colors cursor-pointer"
                    >
                      +{tag.label}
                    </button>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  rows={4}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  placeholder="Digite a mensagem de reativação que será enviada para os contatos..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs leading-relaxed"
                />
              </div>

              {/* Message Preview (WhatsApp Balloon) */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-emerald-800 block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prévia Real no WhatsApp (para {previewLead?.name || 'Paciente'}):</span>
                </span>
                <div className="bg-white rounded-xl p-3 shadow-2xs border border-emerald-100 text-xs text-slate-800 max-w-lg leading-relaxed">
                  {previewText}
                  <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
                    {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </div>
                </div>
              </div>

              {/* Sending Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-4">
                {/* Delay Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Intervalo entre Mensagens (Anti-Ban)</span>
                  </label>
                  <select
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={15}>15 segundos (Rápido - Para bases pequenas &lt; 10)</option>
                    <option value={25}>25 segundos ⭐ (Recomendado - Equilíbrio Perfeito)</option>
                    <option value={40}>40 segundos (Alta Segurança - Bases grandes &gt; 30)</option>
                    <option value={60}>60 segundos (Máxima Prudência / Chips Novos)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Uma pequena variação humana de ±3 segundos é aplicada automaticamente para o WhatsApp não identificar padrão de máquina.
                  </p>
                </div>

                {/* Voice or Text Mode */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Formato do Envio</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSendAsVoice(false)}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center cursor-pointer transition-all ${
                        !sendAsVoice
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      💬 Mensagem de Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendAsVoice(true)}
                      className={`p-2 rounded-lg border text-xs font-semibold text-center cursor-pointer transition-all ${
                        sendAsVoice
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      🎙️ Áudio de Voz (Sofia)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {sendAsVoice
                      ? 'A Sofia sintetizará o áudio humano para cada contato com pronúncia fluida!'
                      : 'Texto limpo e natural com o nome de cada paciente no início.'}
                  </p>
                </div>
              </div>

              {/* Lead Selection Table */}
              <div className="border-t border-slate-200 pt-4">
                {/* Batch Limit Selection Bar */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Definir Lote de Envio ({selectedLeadIds.length} de {baseLeads.length} selecionados)</span>
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Selecione a quantidade de contatos que deseja ativar hoje:
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[20, 50, 100, 200].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => selectBatchLimit(count)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          selectedLeadIds.length === Math.min(count, baseLeads.length) && baseLeads.length > 0
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-indigo-700'
                        }`}
                        title={`Selecionar os primeiros ${count} contatos`}
                      >
                        {count} leads
                      </button>
                    ))}

                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">Qtd:</span>
                      <input
                        type="number"
                        min="1"
                        max={baseLeads.length}
                        placeholder="Ex: 30"
                        value={customLimit}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomLimit(val);
                          const num = parseInt(val, 10);
                          if (!isNaN(num) && num > 0) {
                            selectBatchLimit(num);
                          }
                        }}
                        className="w-14 text-xs font-bold text-slate-800 focus:outline-hidden"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-indigo-600 hover:bg-indigo-50 border border-indigo-200 cursor-pointer transition-colors"
                    >
                      {selectedLeadIds.length === baseLeads.length ? 'Desmarcar' : 'Todos'}
                    </button>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-2 px-3 w-8"></th>
                        <th className="py-2 px-3">Nome</th>
                        <th className="py-2 px-3">Telefone</th>
                        <th className="py-2 px-3">Interesse / Tags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {baseLeads.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-xs text-slate-400">
                            Nenhum contato na coluna Base Antiga no momento. Arraste cards para a coluna ou use "Importar / Sincronizar Base".
                          </td>
                        </tr>
                      ) : (
                        baseLeads.map((lead) => {
                          const isSelected = selectedLeadIds.includes(lead.id);
                          return (
                            <tr
                              key={lead.id}
                              onClick={() => toggleSelectLead(lead.id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="py-2 px-3">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                              </td>
                              <td className="py-2 px-3 font-semibold text-slate-800">{lead.name}</td>
                              <td className="py-2 px-3 font-mono text-slate-500">{lead.phone}</td>
                              <td className="py-2 px-3 text-slate-500">
                                <span className="truncate max-w-[200px] block">
                                  {lead.interest || lead.tags.join(', ')}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!isRunning && !campaignFinished && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>
                Tempo estimado: ~{Math.ceil((selectedLeadIds.length * delaySeconds) / 60)} minuto(s).
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={startCampaign}
                disabled={selectedLeadIds.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Iniciar Disparo ({selectedLeadIds.length})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
