import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Lead,
  KanbanStage,
  ChatMessage,
  AgentConfig,
  KnowledgeDocument,
  EvolutionConfig,
  SupabaseConfig,
  WebhookEventLog,
  SentinelAlertConfig,
  AppointmentSlot,
  ClientProfile,
} from '../src/types';

function getStorageFilePath(): string {
  if (process.env.DATA_PATH) return process.env.DATA_PATH;
  const dockerDataDir = path.join(process.cwd(), 'data');
  const targetDir = fs.existsSync(dockerDataDir) ? dockerDataDir : process.cwd();

  // If nexa_data.json already exists in target directory, use it
  const nexaPath = path.join(targetDir, 'nexa_data.json');
  if (fs.existsSync(nexaPath)) return nexaPath;

  // Se estiver rodando com volume Docker (/app/data) e o volume estiver vazio,
  // clonar o nexa_data.json da raiz do repositório para o volume persistente
  const rootSeedPath = path.join(process.cwd(), 'nexa_data.json');
  if (targetDir !== process.cwd() && fs.existsSync(rootSeedPath)) {
    try {
      fs.copyFileSync(rootSeedPath, nexaPath);
      console.log('[DB Storage] Base inicial sincronizada para o volume persistente com sucesso:', nexaPath);
      return nexaPath;
    } catch (err) {
      console.warn('[DB Storage] Aviso ao copiar base inicial para o volume:', err);
    }
  }

  // If legacy file exists from previous deployment, use it to avoid data loss
  const legacyPath = path.join(targetDir, 'mavra_data.json');
  if (fs.existsSync(legacyPath)) return legacyPath;

  return nexaPath;
}

export const STORAGE_FILE = getStorageFilePath();

function cleanUrl(url?: string): string {
  if (!url) return '';
  const match = url.match(/https?:\/\/[^\s"'<>]+/i);
  return (match ? match[0] : url.trim()).replace(/\/+$/, '');
}

function cleanSupabaseUrl(url?: string): string {
  if (!url) return '';
  const match = url.match(/https?:\/\/[^\s"'<>]+/i);
  let cleaned = (match ? match[0] : url.trim()).replace(/\/+$/, '');
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  return cleaned;
}

export const DEFAULT_DEMO_LEADS: Lead[] = [
  {
    id: 'lead-ind-1',
    name: 'Indústria Metalúrgica SAP S.A.',
    phone: '5511994328811',
    email: 'compras@metalurgicasap.com.br',
    stageId: 'stage-1',
    value: 28500,
    interest: 'Sistema SAP02 de Plasma Atmosférico para Linha de Alumínio',
    tags: ['⚡ Surfacebrasil Plasma', 'Cotação Industrial', '🔥 LEAD QUENTE'],
    notes: 'Engenheiro de produção solicitou cotação do SAP02 para eliminar falhas de pintura em perfis de alumínio. Agendada reunião técnica com engenharia.',
    aiPaused: false,
    isHotLead: true,
    hotReason: 'Solicitou proposta comercial detalhada e teste de Dyne nas amostras',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    unreadCount: 1,
    workspaceId: 'surfacebrasil',
    instanceName: 'surfacebrasil',
  },
  {
    id: 'lead-ind-base-1',
    name: 'Embalagens Flexíveis Poloplast',
    phone: '5511976543210',
    email: 'contato@poloplast.ind.br',
    stageId: 'stage-base',
    value: 19800,
    interest: 'Tratamento de Filme PEAD e BOPP para Impressão Flexográfica',
    tags: ['📂 Base Industrial', 'Inativo > 6m', 'Surfacebrasil'],
    notes: 'Cliente de bobinas plásticas com histórico de problemas de ancoragem de tinta em polietileno de alta densidade.',
    aiPaused: false,
    isHotLead: false,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 240).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 260).toISOString(),
    unreadCount: 0,
    workspaceId: 'surfacebrasil',
    instanceName: 'surfacebrasil',
  },
  {
    id: 'lead-ind-base-2',
    name: 'Auto Peças do Brasil Ltda',
    phone: '5511981234567',
    email: 'suprimentos@autopecasbrasil.com',
    stageId: 'stage-base',
    value: 45000,
    interest: 'Célula Robotizada de Plasma para Para-choques em PP',
    tags: ['📂 Base Industrial', '⚠️ Cotação Pendente', 'Surfacebrasil'],
    notes: 'Fabricante de autopeças automotivas. Busca substituir flambagem a gás por plasma atmosférico por exigência de segurança da montadora.',
    aiPaused: false,
    isHotLead: true,
    hotReason: 'Quer validar teste prático no laboratório Surface Test em Campinas',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 210).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 230).toISOString(),
    unreadCount: 0,
    workspaceId: 'surfacebrasil',
    instanceName: 'surfacebrasil',
  },
  {
    id: 'lead-ind-base-3',
    name: 'Fábrica de Cabos Ópticos FiberLink',
    phone: '5511993456789',
    email: 'engenharia@fiberlink.net.br',
    stageId: 'stage-reativacao',
    value: 32000,
    interest: 'Sistema Contínuo de Alta Velocidade (1.000m/min)',
    tags: ['⚡ Em Reativação', 'Linha Contínua', 'Surfacebrasil'],
    notes: 'Enviou amostras de cabos para teste de adesão de capa protetora. Sofia disparou mensagem de reativação e o engenheiro respondeu confirmando os resultados do teste.',
    aiPaused: false,
    isHotLead: true,
    hotReason: 'Aprovou o teste de Dyne no laboratório e quer fechar o pedido',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString(),
    unreadCount: 1,
    workspaceId: 'surfacebrasil',
    instanceName: 'surfacebrasil',
  },
  {
    id: 'lead-verzel-1',
    name: 'Diretoria de Inovação - Grupo Logística S.A.',
    phone: '5511985443322',
    email: 'inovacao@grupologistica.com.br',
    stageId: 'stage-1',
    value: 145000,
    interest: 'Novo App Mobile iOS/Android para Motoristas & Integração SAP',
    tags: ['💻 Verzel Software', 'AI Talent Hub', '🔥 LEAD QUENTE'],
    notes: 'Solicitou reunião de Discovery com arquitetos da Verzel para escopo de aplicativo mobile com tracking em tempo real e integração ERP SAP.',
    aiPaused: false,
    isHotLead: true,
    hotReason: 'Solicitou sessão de Discovery técnica com arquiteto de software da Verzel',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    unreadCount: 1,
    workspaceId: 'verzel',
    instanceName: 'verzel',
  },
  {
    id: 'lead-verzel-2',
    name: 'CTO Fintech GlobalPay Brasil',
    phone: '5511971224488',
    email: 'ti@globalpayfintech.com.br',
    stageId: 'stage-3',
    value: 98000,
    interest: 'Squad Dedicado de Engenharia Backend (Node/Python) com AI Talent Hub',
    tags: ['💻 Verzel Squad', 'Fintech', 'Shell / Zignet Ref'],
    notes: 'Interessado no modelo de contratação de Squad Dedicado com metodologia ágil e acelerado pelo AI Talent Hub.',
    aiPaused: false,
    isHotLead: true,
    hotReason: 'Validou referências corporativas (Shell e Zignet) e aguarda proposta de Squad',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    unreadCount: 0,
    workspaceId: 'verzel',
    instanceName: 'verzel',
  },
  {
    id: 'lead-psi-1',
    name: 'Dra. Camila Vasconcelos (Psicóloga Clínica)',
    phone: '5511984219988',
    email: 'dra.camila@clinicapensar.com.br',
    stageId: 'stage-1',
    value: 1384,
    interest: 'Barra de Luz Tradicional (74cm) com Tripé para EMDR',
    tags: ['🧠 Equipamentos PSI', 'Terapia EMDR', '🔥 LEAD QUENTE'],
    notes: 'Psicóloga clínica especialista em TEPT. Busca Barra de Luz para substituir movimentos manuais que estão gerando dor no ombro. Solicitou cálculo de frete para Campinas/SP.',
    aiPaused: false,
    isHotLead: true,
    hotReason: 'Quer fechar pedido hoje com desconto no PIX para entrega rápida em Campinas',
    lastInteraction: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    unreadCount: 1,
    workspaceId: 'equipamentospsi',
    instanceName: 'equipamentospsi',
  },
  {
    id: 'lead-psi-base-1',
    name: 'Espaço Terapêutico Integrar (Dr. Marcelo Santos)',
    phone: '5511971123344',
    email: 'contato@espacointegrar.med.br',
    stageId: 'stage-base',
    value: 723,
    interest: 'Aparelho Tátil com Pulsers/Buzzers para pacientes com olhos fechados',
    tags: ['📂 Base Terapeutas', 'Inativo > 6m', 'Equipamentos PSI'],
    notes: 'Compraram a Barra de Luz há 8 meses e manifestaram interesse em adquirir o Aparelho Tátil com pulsers para complementar as sessões.',
    aiPaused: false,
    isHotLead: false,
    lastInteraction: new Date(Date.now() - 1000 * 60 * 60 * 24 * 220).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 240).toISOString(),
    unreadCount: 0,
    workspaceId: 'equipamentospsi',
    instanceName: 'equipamentospsi',
  },
  {
    id: 'lead-psi-marco',
    name: 'Marco',
    phone: '5511976143323',
    email: 'marco.agduarte22@gmail.com',
    stageId: 'stage-2',
    value: 1973,
    interest: 'Barra de Luz Tradicional e Aparelho Tátil com Pulsers para EMDR',
    tags: ['🧠 Equipamentos PSI', 'Qualificado / Interesse', 'WhatsApp Conectado', '🔥 LEAD QUENTE'],
    notes: 'Interessado em estimulação bilateral (Barra de Luz e Aparelho Tátil com pulsers). Enviado dossiê técnico com fotos e catálogo.',
    aiPaused: false,
    isHotLead: true,
    hotReason: 'Demonstrou interesse nos dois equipamentos e recebeu catálogo técnico oficial',
    lastInteraction: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    unreadCount: 0,
    workspaceId: 'equipamentospsi',
    instanceName: 'equipamentospsi',
  },
];

export const DEFAULT_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-psi-marco-1',
    leadId: 'lead-psi-marco',
    phone: '5511976143323',
    sender: 'lead',
    text: 'Oi de onde fala?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'read',
    workspaceId: 'equipamentospsi',
    instanceName: 'equipamentospsi',
  },
  {
    id: 'msg-psi-marco-2',
    leadId: 'lead-psi-marco',
    phone: '5511976143323',
    sender: 'ai',
    text: 'Olá! Tudo bem? Aqui é a Sofia, da Equipamentos PSI. Nós fabricamos equipamentos de estimulação bilateral visual e tátil para terapia EMDR e psicologia clínica. Como posso te ajudar hoje?',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    status: 'read',
    workspaceId: 'equipamentospsi',
    instanceName: 'equipamentospsi',
  },
  {
    id: 'msg-psi-marco-3',
    leadId: 'lead-psi-marco',
    phone: '5511976143323',
    sender: 'lead',
    text: '🎤 [Áudio Transcrito]: "Oi, Sofia, me desculpe. Que equipamentos vocês trabalham? Como é esse estimulador bilateral, por gentileza? E quanto ele custa? E você teria alguma imagem dele ou coisa parecida?"',
    mediaType: 'audio',
    timestamp: new Date(Date.now() - 1000 * 60 * 13).toISOString(),
    status: 'read',
    workspaceId: 'equipamentospsi',
    instanceName: 'equipamentospsi',
  },
  {
    id: 'msg-psi-marco-4',
    leadId: 'lead-psi-marco',
    phone: '5511976143323',
    sender: 'ai',
    text: 'Trabalhamos com a Barra de Luz para estimulação visual, a partir de R$ 1.286,00, e o Aparelho Tátil com pulsers vibratórios a partir de R$ 687,00. Eles garantem um ritmo bilateral constante e evitam a fadiga muscular do terapeuta nas sessões de EMDR. Já estou anexando aqui o nosso catálogo oficial com todas as fotos e detalhes técnicos. Você costuma atender em consultório fixo ou precisa de algo mais compacto para transportar?',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'read',
    workspaceId: 'equipamentospsi',
    instanceName: 'equipamentospsi',
  },
  {
    id: 'msg-psi-marco-5',
    leadId: 'lead-psi-marco',
    phone: '5511976143323',
    sender: 'ai',
    text: '📄 Documento Enviado: "Dossie_Tecnico_Equipamentos_PSI.pdf"',
    mediaType: 'pdf',
    mediaUrl: '/api/pdf/equipamentospsi',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    status: 'read',
    workspaceId: 'equipamentospsi',
    instanceName: 'equipamentospsi',
  },
  {
    id: 'msg-psi-1',
    leadId: 'lead-psi-1',
    phone: '5511984219988',
    sender: 'lead',
    text: 'Olá! Sou psicóloga e atendo com EMDR aqui em Campinas. Estou tendo muita dor no braço e tendinite de fazer o movimento com os dedos. A Barra de Luz de vocês de 74cm acompanha o tripé? E qual o valor com envio para o CEP 13010-111?',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-psi-2',
    leadId: 'lead-psi-1',
    phone: '5511984219988',
    sender: 'ai',
    text: 'Olá, Dra. Camila! Que alegria falar com você! Sou a Sofia, consultora técnica da Equipamentos PSI. Compreendo perfeitamente o seu relato; inclusive, nossa fundadora, a psicóloga Priscila Alves, criou a empresa em 2015 exatamente para proteger a saúde física dos terapeutas contra a sobrecarga nos braços e punhos. Sim! A nossa Barra de Luz Tradicional de 74 cm já acompanha o tripé metálico robusto com regulagem de altura e cabeça articulada, além de controle remoto com ajuste de velocidade e fonte bivolt automática. Comprando no PIX à vista, fica por apenas R$ 1.314,80 (ou parcelado no cartão em até 12x). Para o seu CEP em Campinas, o SEDEX expresso chega em até 2 dias úteis! Gostaria que eu formalizasse o seu pedido agora com garantia oficial de 1 ano?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    status: 'delivered',
  },
  {
    id: 'msg-v-1',
    leadId: 'lead-verzel-1',
    phone: '5511985443322',
    sender: 'lead',
    text: 'Olá! Sou diretor de operações de um grupo logístico. Estamos precisando desenvolver um aplicativo mobile para nossos 400 motoristas com integração ao nosso ERP SAP. A Verzel tem experiência nesse tipo de projeto?',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-v-2',
    leadId: 'lead-verzel-1',
    phone: '5511985443322',
    sender: 'ai',
    text: 'Olá! Que excelente iniciativa! Sou a Sofia, consultora técnica da Verzel. Há mais de 16 anos desenvolvemos sistemas sob medida e aplicativos móveis de alta performance para empresas como Shell Brasil, Mutant e Zignet. Temos vasta experiência em apps corporativos com conectividade offline e integração profunda com ERPs de grande porte como SAP e Totvs. O app precisa rodar tanto em Android quanto iOS?',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-v-3',
    leadId: 'lead-verzel-1',
    phone: '5511985443322',
    sender: 'lead',
    text: 'Sim, a maioria dos motoristas usa Android mas os coordenadores usam iPhone. Queremos também saber sobre prazos e se vocês usam inteligência artificial.',
    timestamp: new Date(Date.now() - 1000 * 60 * 16).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-v-4',
    leadId: 'lead-verzel-1',
    phone: '5511985443322',
    sender: 'ai',
    text: 'Perfeito! Para esse cenário híbrido recomendamos Flutter ou React Native, garantindo uma única base de código nativa, fluida e com custo otimizado. E sobre inteligência artificial: com o nosso AI Talent Hub, nossos squads seniores utilizam IA generativa em todo o ciclo de desenvolvimento, acelerando as entregas em até 40%! Para desenharmos o escopo e a estimativa precisa, podemos marcar uma Reunião Técnica de Discovery online (gratuita e sem compromisso) com nossos arquitetos de software? Qual o melhor horário para você esta semana?',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    status: 'delivered',
  },
  {
    id: 'msg-1',
    leadId: 'lead-1',
    phone: '5511987654321',
    sender: 'lead',
    text: 'Olá! Vi a plataforma NEXA de vocês. Como funciona o agente de IA para WhatsApp?',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-2',
    leadId: 'lead-1',
    phone: '5511987654321',
    sender: 'ai',
    text: 'Olá, Dr. Roberto! Que prazer falar com você. Nossa Inteligência Artificial corporativa atende diretamente no WhatsApp da sua clínica com respostas ágeis, personalizadas e integração direta ao CRM em tempo real! Qual é o tamanho da sua equipe?',
    timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-3',
    leadId: 'lead-1',
    phone: '5511987654321',
    sender: 'lead',
    text: 'Temos 10 atendentes na clínica. Vocês conseguem enviar proposta para esse volume?',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-4',
    leadId: 'lead-1',
    phone: '5511987654321',
    sender: 'ai',
    text: 'Perfeito! Para 10 atendentes temos o Plano Enterprise com instâncias dedicadas e suporte prioritário. Já atualizei seu cadastro no nosso CRM para "Proposta / Apresentação". Nosso especialista Marco Duarte entrará em contato para agendar uma demonstração exclusiva!',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    status: 'delivered',
    stageTriggered: 'stage-3',
  },
  {
    id: 'msg-5',
    leadId: 'lead-2',
    phone: '5521991234567',
    sender: 'lead',
    text: 'Boa tarde, consigo colocar catálogo de produtos em PDF para a IA ler?',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'read',
  },
];

export function createNexaAgentConfig(baseConfig?: Partial<AgentConfig>): AgentConfig {
  return {
    personaName: 'Alex',
    role: 'Consultor Especialista em Inteligência Conversacional & Automação Comercial NEXA CRM',
    toneOfVoice: 'Inovador, consultivo, altamente profissional, empático e focado em ROI e conversão comercial',
    salesGoal: 'Mapear gargalos no atendimento via WhatsApp da empresa do lead, demonstrar o impacto do NEXA CRM no faturamento e agendar uma demonstração executiva de 15 minutos ao vivo.',
    activeProvider: baseConfig?.activeProvider || 'gemini',
    activeModel: baseConfig?.activeModel || 'gemini-3.8-flash',
    geminiApiKey: baseConfig?.geminiApiKey || (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('p80qfADWas1aX40qx1TMkUmwGf6kg') && !process.env.GEMINI_API_KEY.startsWith('AQ.Ab8RN6J') ? process.env.GEMINI_API_KEY : ''),
    openaiApiKey: baseConfig?.openaiApiKey || '',
    anthropicApiKey: baseConfig?.anthropicApiKey || '',
    followUpNiche: 'nexa_sales',
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se você conseguiu dar uma olhada na proposta do NEXA CRM. Separei um horário amanhã para te mostrar o sistema atendendo e qualificando clientes ao vivo na tela. Qual período fica melhor para você: manhã ou tarde? 🚀📊',
    knowledgeFaq: `PERGUNTAS FREQUENTES (NEXA CRM - AUTOMAÇÃO CONVERSACIONAL COM IA):

P: O que é o NEXA CRM e como ele funciona na prática?
R: O NEXA CRM é uma plataforma completa de automação de vendas e atendimento inteligente para WhatsApp. Ele une Inteligência Artificial generativa humanizada (que atende texto e áudios de voz 24 horas por dia), CRM Kanban visual com extração automática dos dados do cliente, agendamentos automáticos e motor de follow-up para reativar contatos que pararam de responder.

P: Ele é aquele chatbot antigo e irritante de menus com "digite 1 para vendas, 2 para suporte"?
R: De jeito nenhum! O NEXA CRM aboliu os menus robóticos. Ele opera com IA generativa moderna (baseada em modelos avançados como Gemini), compreendendo áudios de voz, textos informais, gírias e contextos complexos, respondendo com a mesma empatia, inteligência e autoridade do seu melhor vendedor ou secretária.

P: O sistema envia áudios reais com voz humana?
R: Sim! Esse é um dos maiores diferenciais da plataforma. Você pode gravar áudios com a sua própria voz (ou de quem preferir) e a IA sabe o momento exato de dispará-los na conversa (boas-vindas acolhedoras, explicação de diferenciais, confirmação de reunião), além de síntese de voz ultra-realista. Mais de 90% dos clientes têm certeza absoluta de que estão falando com uma pessoa real.

P: Preciso deixar meu computador ou celular ligado o dia todo?
R: Não! O NEXA CRM opera 100% em nuvem em servidores dedicados de alta performance. Mesmo que você desligue seu telefone ou esteja dormindo, seus clientes são atendidos, acolhidos e qualificados dia e noite (24/7).

P: Como funciona a conexão com o WhatsApp? É seguro?
R: A conexão é ultra simples e estável: você só precisa escanear um QR Code na tela (via integração oficial com a Evolution API). Não há burocracia complexa e a conexão fica ativa em menos de 2 minutos.

P: E se o cliente fizer uma pergunta muito difícil ou exigir um atendente humano?
R: O NEXA possui o recurso de Transbordo Humanizado (Handoff Inteligente). Se o cliente pedir para falar com uma pessoa, ou se o assunto exigir negociação especial da diretoria, o robô pausa as respostas para aquele contato e notifica instantaneamente sua equipe no painel para assumir o atendimento.

P: O NEXA CRM funciona para o meu tipo de negócio?
R: Sim! O NEXA já possui bibliotecas de nichos prontas para Clínicas Médicas e Odontológicas, Estética, Imobiliárias e Corretores, Escritórios de Advocacia, Concessionárias e Venda de Veículos, Energia Solar, Serviços B2B, SaaS e Comércio em geral. Tudo é 100% adaptável para a realidade da sua empresa em poucos minutos.

P: Como funciona a demonstração do sistema?
R: Nós agendamos uma demonstração rápida de 15 minutos via videoconferência ou pelo próprio WhatsApp, onde você vê o robô conversando, extraindo dados para o Kanban e organizando os agendamentos em tempo real na tela!`,

    knowledgeCatalog: `MÓDULOS E RECURSOS DA PLATAFORMA NEXA CRM:

1. ATENDENTE DE IA CONVERSACIONAL 24/7 (TEXTO & VOZ):
- Atendimento humanizado e instantâneo no WhatsApp em menos de 10 segundos.
- Compreensão e transcrição de áudios longos enviados pelos clientes.
- Disparo de áudios reais gravados no momento oportuno do fluxo.
- Blindagem anti-alucinação: a IA segue rigorosamente as regras da sua empresa sem inventar promessas falsas.

2. CRM KANBAN INTELIGENTE COM AUTO-EXTRAÇÃO:
- Funil de vendas visual: Novo Lead, Qualificado, Agendado, Negociação, Ganho e Perdido.
- A IA extrai da conversa e preenche sozinha: Nome, Telefone, E-mail, Interesse, Dores e Valor Estimado do Negócio.
- Histórico completo de conversas centralizado.

3. AGENDAMENTO & CALENDÁRIO AUTOMÁTICO:
- Marcação de consultas e reuniões diretamente pelo WhatsApp respeitando a disponibilidade da agenda.
- Notificações automáticas para reduzir faltas (no-show).

4. MOTOR DE FOLLOW-UP & RETARGETING:
- Reativação inteligente de clientes que pararam de responder após o primeiro contato.
- Mensagens estratégicas de resgate que aumentam a taxa de conversão em até 35%.

5. LABORATÓRIO DE TESTES AUTOMATIZADOS COM IA:
- Simulador integrado que audita as respostas da IA contra clientes difíceis e reescreve diretrizes com 1 clique.

6. GESTÃO MULTI-CLIENTES & BIBLIOTECA DE NICHOS:
- Permite gerenciar múltiplos perfis de empresas ou filiais no mesmo painel com facilidade.`,

    knowledgePricing: `PLANOS E CONDIÇÕES COMERCIAIS NEXA CRM:

- PLANO STARTER (Para Profissionais Autônomos e Pequenos Negócios):
  * R$ 297,00/mês
  * 1 Número de WhatsApp conectado.
  * IA Conversacional 24/7 para texto.
  * CRM Kanban completo com extração automática de dados.
  * Até 1.500 atendimentos mensais.
  * Suporte técnico via WhatsApp.

- PLANO PRO (Mais Vendido & Recomendado):
  * R$ 597,00/mês
  * 1 Número de WhatsApp com atendimento Ilimitado.
  * IA com Suporte a Voz e Áudios Reais Contextuais.
  * Módulo de Follow-up Inteligente e Reativação de Leads.
  * Agendamento de Consultas/Reuniões integrado.
  * Laboratório de Testes Automatizados com IA.
  * Onboarding e Configuração Personalizada inclusos.

- PLANO ENTERPRISE / MULTI-EMPRESAS:
  * Sob Consulta Personalizada.
  * Múltiplas instâncias de WhatsApp e equipes grandes.
  * Treinamento de IA dedicado e suporte prioritário.

- CONDIÇÕES & FACILIDADES:
  * Sem taxa de adesão em planos anuais (com 20% de desconto no pagamento à vista via PIX).
  * Garantia incondicional de 7 dias com acompanhamento de implantação.`,

    knowledgeRules: `DIRETRIZES E REGRAS DE VENDAS DO NEXA CRM:

1. POSTURA E CONDUTA:
- Apresente-se como Alex (ou consultor comercial da NEXA CRM).
- Seja enérgico, educado, empático e focado nas dores práticas do empresário: demora para responder clientes, perda de vendas à noite ou fins de semana, secretária sobrecarregada e leads esquecidos sem follow-up.

2. ROTEIRO DE QUALIFICAÇÃO & CONVERSÃO EM 4 PASSOS:
- Passo 1 (Identificação): Pergunte qual é o segmento da empresa do cliente e se ele já atende clientes via WhatsApp diariamente.
- Passo 2 (Mapeamento da Dor): Descubra o maior gargalo:
  * "Hoje você sente que perde vendas por demorar para responder fora do horário comercial?"
  * "Ou os clientes chegam dos anúncios e esfriam sem um acompanhamento rápido?"
- Passo 3 (Apresentação de Valor): Mostre como o NEXA resolve exatamente essa dor com atendimento em menos de 10 segundos, áudios com voz humana e CRM Kanban que se atualiza sozinho.
- Passo 4 (Chamada para Ação): Convide para a demonstração ao vivo:
  "Para você ver na tela como o NEXA atenderia os clientes da sua empresa na prática, podemos fazer uma demonstração rápida de 15 minutos amanhã. Qual horário fica melhor para você: manhã ou tarde?"

3. QUEBRA DE OBJEÇÕES:
- "É difícil de usar ou configurar?": "Não! Nós entregamos tudo praticamente pronto para o seu nicho e a conexão com seu WhatsApp é feita em 2 minutos lendo um QR Code."
- "Robô afasta os clientes": "Isso acontecia com os robôs antigos de menu! O NEXA usa IA generativa de ponta com respostas naturais e voz humana real. Nossos clientes relatam que os clientes elogiam o atendimento achando que é uma pessoa."
- "Já tenho equipe de atendimento": "Excelente! O NEXA não substitui sua equipe, ele potencializa: faz a triagem inicial 24 horas por dia, filtra curiosos e entrega o cliente qualificado e pronto para seu vendedor fechar."`,
    strictKnowledgeOnly: false,
    preRecordedAudiosEnabled: true,
    autoTriggerCRMStages: true,
    isGlobalAiActive: true,
    testModeEnabled: false,
    testNumberWhitelist: '',
    autoTranscribeAudio: true,
  };
}

// In-memory / persistent fallback state
class Database {
  public stages: KanbanStage[] = [
    { id: 'stage-base', name: '📂 Base Antiga / Inativos (+6m)', color: '#6366f1', order: 0 },
    { id: 'stage-reativacao', name: '⚡ Em Reativação (Disparo IA)', color: '#ec4899', order: 1 },
    { id: 'stage-1', name: 'Novo Lead', color: '#3b82f6', order: 2, isDefault: true },
    { id: 'stage-2', name: 'Qualificado / Interesse', color: '#f59e0b', order: 3 },
    { id: 'stage-3', name: 'Proposta / Apresentação', color: '#8b5cf6', order: 4 },
    { id: 'stage-4', name: 'Em Negociação', color: '#06b6d4', order: 5 },
    { id: 'stage-5', name: 'Ganho / Fechado', color: '#10b981', order: 6 },
    { id: 'stage-6', name: 'Perdido', color: '#ef4444', order: 7 },
  ];

  public leads: Lead[] = JSON.parse(JSON.stringify(DEFAULT_DEMO_LEADS));
  public messages: ChatMessage[] = JSON.parse(JSON.stringify(DEFAULT_DEMO_MESSAGES));

  public agentConfig: AgentConfig = {
    personaName: 'Sofia',
    role: 'Coordenadora de Atendimento e Triagem Integrativa da Clínica Dra. Lucy Murata',
    toneOfVoice: 'Altamente refinado, acolhedor, empático, científico, sereno e focado na saúde sistêmica e integrativa',
    salesGoal: 'Compreender a necessidade ou queixa biofuncional do paciente, acolher com autoridade e agendar a Consulta de Avaliação Integrativa no consultório do Euroville Mall.',
    activeProvider: 'gemini',
    activeModel: 'gemini-3.8-flash',
    geminiApiKey: (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('p80qfADWas1aX40qx1TMkUmwGf6kg') && !process.env.GEMINI_API_KEY.startsWith('AQ.Ab8RN6J')) ? process.env.GEMINI_API_KEY : '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    knowledgeFaq: `PERGUNTAS FREQUENTES (ODONTOLOGIA INTEGRATIVA & BIOLÓGICA - DRA. LUCY MURATA):

P: O que é a Odontologia Integrativa e Biológica?
R: É a prática odontológica que enxerga o ser humano de forma holística e sistêmica. Compreendemos que cada dente, tecido e material utilizado na cavidade bucal interage diretamente com os órgãos, meridianos, imunidade e saúde celular do organismo como um todo.

P: Vocês informam valores ou orçamentos por WhatsApp?
R: Não passamos orçamentos sem consulta prévia. Na odontologia biológica de alta performance e conforme as normas éticas do CFO, cada organismo é biologicamente único. A Dra. Lucy Murata realiza uma Consulta de Avaliação Integrativa completa (com análise clínica, histórico de saúde e tecnologia de escaneamento 3D) para estruturar um plano de tratamento preciso, personalizado e biocompatível para o seu caso.

P: O que é a Remoção Segura de Amálgama (Protocolo SMART)?
R: O amálgama contém mercúrio, um metal pesado altamente tóxico que libera vapores contínuos. A Dra. Lucy Murata é membro da IAOMT (International Academy of Oral Medicine and Toxicology - EUA) e segue rigorosamente o protocolo internacional SMART: isolamento absoluto, aspiração de alta potência com filtros específicos, paramentação de proteção e suplementação/desintoxicação biológica para garantir que nem o paciente nem a equipe inalem vapores de mercúrio durante o procedimento.

P: Como funcionam os Implantes de Zircônia (Metal-Free)?
R: São implantes cerâmicos totalmente livres de metais, biocompatíveis e com coloração branca natural semelhante à raiz do dente. Não geram correntes galvânicas, reduzem drasticamente o risco de inflamações peri-implantares e preservam a harmonia bioenergética do corpo.

P: Onde fica localizado o consultório da Dra. Lucy Murata?
R: O consultório está situado em Bragança Paulista/SP, no Euroville Mall (Torre II - Praça Maastricht, 200 - Sala 103, Jardim São José), em um ambiente tranquilo, seguro e de fácil acesso com estacionamento.

P: A clínica atende convênios?
R: Nossos atendimentos são exclusivamente particulares, garantindo tempo dedicado, materiais biológicos de padrão internacional e atendimento sem pressa. Fornecemos nota fiscal e relatórios detalhados caso o paciente deseje solicitar reembolso junto ao seu plano de saúde.`,
    knowledgeCatalog: `TRATAMENTOS & ESPECIALIDADES - DRA. LUCY MURATA:

1. Bio-Odontologia & Desintoxicação:
- Remoção Segura de Restaurações de Amálgama (Protocolo SMART - IAOMT EUA).
- Substituição por resinas biocompatíveis de última geração e cerâmicas puras (livres de bisfenol A e metais pesados).
- Terapia Neural, Biorressonância e Práticas Integrativas aplicadas à odontologia.

2. Implantodontia Cerâmica (Metal-Free):
- Implantes Dentários de Zircônia (Cerâmica pura de alto desempenho, biocompatibilidade total e integração tecidual superior).
- Reabilitação Oral Funcional e Biológica para restauração da mastigação e equilíbrio neuromuscular.

3. Tecnologia & Diagnóstico Digital:
- Escaneamento Intraoral 3D de alta precisão (conforto máximo sem moldagens com massinha).
- Planejamento estético e funcional com previsibilidade biomimética.

4. Prótese & Estética Biomimética:
- Coroas, facetas e lentes de contato em cerâmica pura que mimetizam perfeitamente o esmalte dental natural.
- Preservação máxima da estrutura biológica do dente.`,
    knowledgePricing: `POLÍTICA DE ATENDIMENTO & INVESTIMENTO:

- Princípio de Transparência & Ética: Não praticamos valores tabelados por mensagem. O investimento definitivo depende da avaliação clínica individualizada realizada pela Dra. Lucy Murata.
- Consulta de Avaliação Integrativa: Compreende anamnese detalhada do histórico de saúde sistêmica do paciente, exame clínico minucioso da saúde bucal e análise com tecnologias digitais para traçar o mapa bio-odontológico.
- Condições de Pagamento: A clínica oferece opções flexíveis para viabilizar o plano de tratamento completo (parcelamento no cartão de crédito ou condições diferenciadas à vista via PIX). A secretária detalha todas as opções confortavelmente após o plano apresentado pela doutora.`,
    knowledgeRules: `DIRETRIZES FUNDAMENTAIS DE ATENDIMENTO (DRA. LUCY MURATA):

1. NUNCA dê orçamentos ou valores pelo WhatsApp. Explique que na odontologia integrativa cada ser humano tem particularidades biológicas únicas e que a conduta ética e segura começa na Consulta de Avaliação Integrativa.
2. Posicionamento de Autoridade & Acolhimento: A Dra. Lucy Murata é Mestre em Bioodontologia e membro da conceituada IAOMT dos EUA. Transmita essa excelência técnica com palavras gentis, seguras e acolhedoras.
3. Roteiro de Triagem:
   - Passo 1: Ouça e compreenda a queixa ou objetivo do paciente (ex: quer trocar restaurações escuras com segurança? precisa de implantes sem metal? busca alívio de queixas funcionais?).
   - Passo 2: Valide a preocupação do paciente com empatia e explique resumidamente a abordagem biológica.
   - Passo 3: Pergunte se o paciente prefere atendimento pela manhã ou tarde e quais dias da semana são mais convenientes.
   - Passo 4: Transfira com cordialidade para a recepção/secretária da clínica confirmar o melhor horário na agenda no Euroville Mall.
4. Jamais cite nomes de tecnologias internas (Evolution API, Gemini, robô, IA). A Sofia é a assistente e coordenadora humana e atenciosa do consultório da Dra. Lucy Murata.`,
    strictKnowledgeOnly: true,
    autoTriggerCRMStages: true,
    isGlobalAiActive: true,
    testModeEnabled: false,
    testNumberWhitelist: '',
    autoTranscribeAudio: true,
    typingDelayMs: 1500,
    catalogPdfUrl: '',
    catalogPdfName: 'Apresentacao_Dra_Lucy_Murata.pdf',
    voiceResponseEnabled: true,
    voiceResponseMode: 'smart_discernment',
    voiceEngine: 'native_sofia',
    voiceVoiceName: 'pt-BR-FranciscaNeural',
    voiceSpeed: 0.90,
    maxConsecutiveAudios: 4,
    maxAudioChars: 500,
    googleTtsApiKey: '',
    elevenLabsApiKey: '',
    pixKey: 'marco.agduarte22@gmail.com',
    pixKeyType: 'email',
    preRecordedAudiosEnabled: true,
    preRecordedAudios: [
      {
        id: 'audio-welcome-dra-lucy',
        title: 'Boas-Vindas & Acolhimento Humanizado',
        speakerName: 'Dra. Lucy Murata',
        triggerType: 'welcome',
        contextDescription: 'Disparar na abertura da conversa quando o lead fizer uma saudação inicial (olá, bom dia) querendo conhecer os serviços, se ele ainda não ouviu a Dra. NUNCA disparar se ele veio com pergunta técnica/pontual (ex: preço, convênio, horário específico) ou se já foi recepcionado.',
        transcript: 'Olá! Tudo bem? Sou a Dra. Lucy Murata! Que bom que você entrou em contato com o nosso consultório. A Sofia, da minha equipe, já vai te dar todas as informações, mas eu fiz questão de te dar as boas-vindas pessoalmente. Me conta: o que você gostaria de cuidar no seu sorriso hoje?',
        durationSeconds: 16,
        enabled: true,
        maxPerLead: 1,
      },
      {
        id: 'audio-pitch-dra-lucy',
        title: 'Convite para Consulta de Avaliação Integrativa',
        speakerName: 'Dra. Lucy Murata',
        triggerType: 'schedule_pitch',
        contextDescription: 'Disparar quando o lead já tirou as primeiras dúvidas e demonstrar interesse em marcar consulta, agendar ou conhecer os horários da agenda. Acalma a decisão e reforça a importância da avaliação presencial no Euroville Mall.',
        transcript: 'Oi! Que excelente decisão. Fazer uma avaliação com calma é o melhor passo pra gente entender direitinho a sua saúde bucal e indicar o melhor tratamento pra você. Já avisei a recepção pra priorizar os melhores horários pra você. Pode escolher o dia e a hora que ficarem mais confortáveis pra você, tá bom? Te espero aqui!',
        durationSeconds: 18,
        enabled: true,
        maxPerLead: 1,
      },
      {
        id: 'audio-urgency-dra-lucy',
        title: 'Acolhimento Cuidadoso em Dor ou Desconforto',
        speakerName: 'Dra. Lucy Murata',
        triggerType: 'urgency_care',
        contextDescription: 'Disparar quando o paciente relatar dor forte, incômodo ou urgência confirmada pela triagem clínica. Transmite calma, empatia e compromisso de encaixe prioritário.',
        transcript: 'Oi, tudo bem? Sou a Dra. Lucy. Vi aqui que você mencionou que está com incômodo ou dor. Não se preocupa, a gente cuida de você. Minha equipe vai verificar o quanto antes a nossa escala pra te encaixar com carinho e resolver isso logo. Fica tranquilo(a), tá bom?',
        durationSeconds: 15,
        enabled: true,
        maxPerLead: 1,
      },
    ],
    autoFollowUpEnabled: true,
    followUpDelayHours: 4,
    followUpNiche: 'dental',
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se você conseguiu verificar o melhor dia para a sua consulta de avaliação com a Dra. Lucy Murata. Nossa equipe tem horários exclusivos esta semana no consultório do Euroville Mall! 🌿✨',
    maxFollowUpsPerLead: 2,
    calendarEnabled: false,
    calendarConnectedEmail: '',
    calendarDefaultDurationMinutes: 45,
    calendarDefaultTitle: '',
    calendarDefaultLocation: '',
    calendarAllowAiBooking: true,
    showCalendarModuleInMenu: true,
    instagramConfig: {
      enabled: true,
      isConnected: false,
      username: '',
      fullName: '',
      profilePicUrl: '',
      pageId: '1625068255684485',
      instagramId: '',
      autoReplyComments: true,
      commentTriggerKeywords: ['AVALIACAO', 'AGENDA', 'CRM', 'SORRISO', 'BIOODONTO'],
      commentPublicReplyText: 'Olá! Te respondi com todos os detalhes no seu Direct, dá uma olhadinha lá! ✨😊',
      directWelcomePrompt: 'Olá! Vi que você comentou no nosso post. Sou a Sofia, especialista de atendimento! Como posso te ajudar hoje?',
      directAutoQualify: true,
      leadCaptureMoveToStage: 'stage-1',
      tokenExpiresAt: '02081193cf850572d4e22a378e01dff2',
      accessToken: 'IGAAXFZCbAdp4VBZAGEzaXk4anMxZAkJabmpKS0RLUm44d25hQjFtaGprVGNrb3VPalJ4a3l0T2lzMmgwMFlsWGw4YXZAza3o3bldaRERSWFA1X1QzdTNPUENHc1k4R2psVzRTX01VOFBHZA29oZAFNHU0Q1X2wyVHI0NU5Bd3FIMkJOSQZDZD',
    },
  };

  public documents: KnowledgeDocument[] = [
    {
      id: 'doc-primo-equipamentos',
      name: 'Catalogo_Completo_Primo_Equipamentos.txt',
      type: 'txt',
      size: 5100,
      contentText: `MANUAL E CATÁLOGO COMPLETO — PRIMO EQUIPAMENTOS
Website Oficial: https://primo-equipamentos.lojaintegrada.com.br/
Razão Social / CNPJ: PRIMO EQUIPAMENTOS LTDA. — CNPJ: 18.154.896/0001-29
Segmento: Equipamentos, máquinas, utensílios e soluções completas para cozinhas industriais, bares, restaurantes, lanchonetes, pizzarias, padarias e estabelecimentos comerciais.

1. PORTFÓLIO DE PRODUTOS & EQUIPAMENTOS:
- Fritadeiras Industriais: Modelos elétricos e a gás de alta performance (marcas renomadas como Croydon, Skymsen, etc.), com termostato de precisão e cestos robustos em aço inox.
- Extratores de Suco e Liquidificadores: Extratores bivolt em alumínio/inox para lanchonetes, liquidificadores industriais de alta rotação (para vitaminas) e baixa rotação (para pastas, massas e molhos) de 2 a 25 litros.
- Processadores de Alimentos & Fatiadores de Frios: Multiprocessadores para ralar, desfiar e fatiar legumes e queijos; fatiadores de frios profissionais com lâminas temperadas para açougues, mercados e restaurantes.
- Masseiras, Moedores e Equipamentos de Preparo: Masseiras planetárias e espirais, moedores de carne boca 5, 8, 22 e 32, descascadores de batatas e serras fita para carne.
- Fogões Industriais & Indução: Fogões de alta e baixa pressão em ferro fundido, chapas sanduicheiras a gás/elétricas e fogões por indução profissionais.
- Refrigeradores e Expositores: Balcões refrigerados para açougue e frios, cervejeiras, expositores verticais e ilhas congeladas.
- Utensílios de Inox & Cozinha: Panelas industriais, caldeirões, travessas, pegadores de gelo, kits de churrasco e utensílios gerais para operação gastronômica.

2. CANAIS DE CONTATO E SUPORTE:
- Telefone Fixo: (11) 3313-2875
- WhatsApp Comercial: (11) 97333-4135
- E-mail: primoequipamentos@hotmail.com

3. PAGAMENTO, FRETE E ENTREGAS:
- Formas de Pagamento: Pix com confirmação instantânea, boleto bancário e cartões de crédito/débito via intermediador seguro na Loja Integrada.
- Frete e Prazos: O cálculo exato do frete e o prazo de entrega são realizados de forma automatizada no site ao informar o CEP de destino. Atendimento para todo o Brasil, com agilidade em envios para São Paulo e Grande SP.
- Garantia: Equipamentos com garantia de fábrica contra defeitos de fabricação e assistência técnica especializada.`,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'doc-mentoria-dra-luci',
      name: 'Mentoria_Dra_Luci_Murata_Odontologia_Biologica_Ambulatorio_IA.txt',
      type: 'txt',
      size: 4200,
      contentText: `PROGRAMA OFICIAL DE MENTORIA - DRA. LUCI MURATA
Website Oficial: https://mentoria.lucymurata.com.br/
Título: Mentoria Dra. Luci Murata - Odontologia Biológica & Ambulatório IA
Subtítulo: Programa de mentoria executiva VIP em Odontologia Biológica, Cirurgias Metal-Free em Zircônia, L-PRF e o pioneiro ecossistema Ambulatório IA com imersão presencial na Clínica Euroville.

1. PÚBLICO-ALVO & REQUISITOS:
- Exclusivo para Cirurgiões-Dentistas com inscrição ativa no CRO.
- Formato VIP restrito: Apenas 10 vagas exclusivas por turma.
- Processo Seletivo Oficial: Seleção curricular criteriosa avaliada individualmente pela banca clínica da Dra. Luci Murata para garantir a homogeneidade de excelência da turma.

2. PILARES CLÍNICOS E CONTEÚDO PROGRAMÁTICO:
- Odontologia Biológica & Integrativa: Princípios de biocompatibilidade celular, destoxificação, imunologia bucal e protocolo seguro de remoção de restaurações metálicas e amálgama (SMART).
- Cirurgias Metal-Free em Zircônia: Implantes cerâmicos 100% livres de metal, técnicas cirúrgicas atraumáticas, osseointegração bioativa e reabilitação protética de alta estética biológica.
- L-PRF (Fibrina Rica em Plaquetas e Leucócitos): Coleta venosa, protocolos de centrifugação, confecção de plugues, membranas e sticky bone autólogo para regeneração tecidual guiada e cicatrização acelerada.
- Ozonioterapia Medicinal em Odontologia: Protocolos de aplicação antimicrobiana, bioestimulação, descontaminação cavitária e cirúrgica com ozônio medicinal.
- Diagnóstico Digital & Tomografia (CBCT): Planejamento digital avançado, escaneamento intraoral e navegação guiada tridimensional.
- Ecossistema "Ambulatório IA": Implementação pioneira de Inteligência Artificial e automações no consultório do dentista — triagem inteligente de pacientes, prontuários acelerados, pós-operatório automatizado e conversão de planos de tratamento de alto valor.

3. IMERSÃO PRESENCIAL & LOCALIZAÇÃO:
- Imersão prática presencial no consultório modelo da Dra. Luci Murata: Euroville Mall - Torre II - Praça Maastricht, 200 - Sala 103, Bragança Paulista/SP.
- Cirurgias demonstrativas ao vivo com pacientes reais e mentoria direta com a Dra. Luci.

4. INVESTIMENTO E CONDIÇÕES:
- O valor da mentoria é reservado e informado exclusivamente aos candidatos aprovados na etapa de análise curricular e entrevista seletiva individual com a equipe da Dra. Luci.
- Candidaturas são realizadas pelo site oficial com geração de Protocolo VIP e envio direto para o WhatsApp da equipe.`,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'doc-surfacebrasil-plasma',
      name: 'Dossie_Tecnico_Surfacebrasil_Plasma.pdf',
      type: 'pdf',
      size: 18500,
      contentText: `DOSSIÊ TÉCNICO & MANUAL COMERCIAL COMPLETO — SURFACEBRASIL
Website Oficial: https://surfacebrasil.com.br/
Sede: Rua Vitório Casellato, 30 – Campinas/SP | Tel: (19) 3365-2506 | contato@surfacebrasil.com.br
Unidades: Campinas/SP, Carlos Barbosa/RS, Estados Unidos (Maryland) e Argentina (Buenos Aires).

1. TECNOLOGIA DE TRATAMENTO DE SUPERFÍCIE POR PLASMA ATMOSFÉRICO A FRIO:
- O plasma é o quarto estado da matéria. Utilizando apenas ar comprimido industrial e energia elétrica, o bico injetor gera uma descarga de plasma que atua em nível molecular sobre a superfície de polímeros inertes (PP, PEAD, PEBD, PET, XLPE, Silicone, Borrachas) e metais (Alumínio).
- Aumenta a energia superficial (tensão superficial de Dyne) de ~28 dynas/cm para mais de 50 a 70 dynas/cm.
- Garante ancoragem definitiva para tintas automotivas/industriais, colas, vernizes, fitas adesivas e datação inkjet.
- Vantagem radical sobre flambador a gás: não usa fogo direto, elimina risco de incêndio/explosão fabril, barateia seguros e NÃO deforma ou derrete peças plásticas.
- Vantagem sobre primers químicos: processo 100% ecológico, sem solventes tóxicos (Zero VOC), sem tempo de secagem/cura e sem custo recorrente por litro.

2. EQUIPAMENTOS E SOLUÇÕES:
- SAP02 (Flambador Eletrônico Compacto Plug & Play): sistema industrial robusto, de fácil instalação em linhas contínuas de extrusão (fios, cabos, perfis plásticos) suportando velocidades de até 1.000 metros por minuto.
- Mesa Automatizada CNC 3 Eixos (X-Y-Z): tratamento robotizado para peças tridimensionais, geometrias complexas, bandejas e peças automotivas com receitas salvas na memória.
- Bicos e Aplicadores Customizados: desenvolvimento sob medida para linhas de embalagens, farmacêutica, médica e cosmética.

3. LABORATÓRIO SURFACE TEST:
- Centro avançado em Campinas/SP para testes práticos de aderência. Os clientes industriais podem enviar amostras das suas peças plásticas para ensaios de Dyne e teste de arrancamento, recebendo um Laudo Técnico de Viabilidade gratuito antes de investir no equipamento.

4. DIRETRIZES DE ATENDIMENTO DA SOFIA:
- Qualificar o material da peça (PP, PEAD, Alumínio, etc.).
- Identificar o processo e tipo de falha (descolamento de fita, descascamento de tinta, datação borrada).
- Perguntar a velocidade da linha ou se é peça unitária.
- Agendar reunião online com engenharia de aplicação ou agendar envio de amostras para o Surface Test.`,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'doc-verzel-software',
      name: 'Dossie_Tecnico_Verzel_Sistemas.pdf',
      type: 'pdf',
      size: 21500,
      contentText: `DOSSIÊ TÉCNICO & MANUAL COMERCIAL COMPLETO — VERZEL SOLUÇÕES EM SISTEMAS
Website Oficial: https://www.verzel.com.br/pt/
CNPJ: 11.845.885/0001-46 (Fundada em 2010 — 16 anos de mercado)
Sede SP: Rua Aníbal Benévolo, 94 - 2º Andar, Santana — São Paulo/SP
Hubs: São Paulo, Rio de Janeiro, Lisboa (Portugal) e Berlim (Alemanha)
Braço Educacional: Devaria (formação de talentos tech)
Grandes Clientes: Shell Brasil, Mutant, Zignet, Bunzl, Grupo Avenida, AON, BR COM.

1. PORTFÓLIO DE SOLUÇÕES & SERVIÇOS:
- Fábrica de Software Sob Medida: desenvolvimento web, portais corporativos, plataformas SaaS e microsserviços escaláveis (React, Next.js, Node.js, Python, Java, AWS, GCP, Docker/Kubernetes).
- Aplicativos Mobile: apps nativos e híbridos para iOS e Android (Flutter, React Native, Swift, Kotlin), design UX/UI centrado no usuário e publicação nas lojas.
- AI Talent Hub & IA Aplicada: desenvolvimento acelerado por inteligência artificial (até 40% mais rápido com redução de custos) e construção de fluxos com agentes de IA autônomos.
- Integração de Sistemas & APIs: conexão de ERPs (SAP, Totvs, Senior, Sankhya), CRMs (Salesforce, HubSpot), gateways de pagamento (Pix instantâneo) e modernização de legados.
- Sustentação & Suporte 24/7: monitoramento proativo, manutenção preventiva/evolutiva e SLA corporativo para sistemas críticos.

2. MODELOS DE CONTRATAÇÃO:
- Squad Dedicado (Alocação Ágil): time multidisciplinar exclusivo (PO, Tech Lead, Devs, QA, UX/UI) com sprints quinzenais e sem passivo trabalhista.
- Escopo Fechado (Turnkey): projetos com escopo, prazo e investimento pré-definidos para novos softwares ou MVPs rápidos.
- Sustentação Contínua: banco de horas e plantão com SLA garantido.

3. DIRETRIZES DA SOFIA (VERZEL):
- Atuar como consultora executiva técnica e cordial.
- Qualificar o tipo de projeto (novo software/app do zero, modernização de legado ou alocação de squad dedicado).
- Identificar plataforma (web, mobile iOS/Android ou ambos) e estágio (ideia/requisitos ou protótipo pronto).
- Destacar autoridade com clientes como Shell Brasil, Mutant e Zignet.
- Agendar Reunião Técnica de Discovery (online, gratuita e sem compromisso) com os arquitetos e diretores técnicos da Verzel.`,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'doc-1',
      name: 'Guia_Institucional_NEXA.txt',
      type: 'txt',
      size: 1520,
      contentText: 'Apresentação Institucional NEXA CRM: Solução corporativa de atendimento inteligente e gestão de relacionamento com clientes no WhatsApp. Utilizamos Inteligência Artificial de última geração treinada exclusivamente para qualificação ágil de clientes e conversão comercial.',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'doc-nexa-comercial',
      name: 'Manual_Comercial_e_Apresentacao_NEXA_CRM.txt',
      type: 'txt',
      size: 4800,
      contentText: `MANUAL COMERCIAL E APRESENTAÇÃO INSTITUCIONAL - PLATAFORMA NEXA CRM
Website Oficial: https://crm.makprojetosmake.com.br/
Solução: CRM Conversacional com Inteligência Artificial Integrada para WhatsApp

1. O QUE É O NEXA CRM:
O NEXA CRM é o ecossistema definitivo para transformar o WhatsApp de qualquer empresa em uma máquina de vendas autônoma e humanizada. Ele elimina a lentidão no atendimento, o esquecimento de leads e a desorganização comercial através da combinação de IA Generativa, CRM Kanban visual e automação de follow-up.

2. DIFERENCIAIS COMPETITIVOS:
- Atendimento Instantâneo 24/7: Reduz o tempo de resposta de horas para menos de 10 segundos.
- Compreensão Real de Contexto: Escuta e responde áudios de clientes com naturalidade.
- Disparo de Áudios com Voz Humana: Conexão emocional profunda sem sensação de robô engessado.
- CRM Kanban Auto-preenchível: Identifica dados de contato, interesse e valor sem digitação manual.
- Conexão em 1 Clique: Conecta ao WhatsApp lendo QR Code em 2 minutos via Evolution API.

3. PLANOS E PREÇOS:
- Starter: R$ 297,00/mês (1 WhatsApp, IA texto 24/7, Kanban até 1.500 conversas/mês).
- Pro (Recomendado): R$ 597,00/mês (Atendimento ilimitado, suporte a Voz e Áudios reais, Follow-up automático).
- Enterprise: Sob consulta para grandes operações e franquias.

4. OBJETIVO DA CONVERSA:
Agendar uma demonstração ao vivo de 15 minutos onde o lead assiste à IA atendendo e movimentando o Kanban em tempo real na tela.`,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'doc-equipamentos-psi',
      name: 'Manual_Tecnico_Equipamentos_PSI_EMDR.txt',
      type: 'txt',
      size: 16500,
      contentText: `MANUAL TÉCNICO & CATÁLOGO COMPLETO — EQUIPAMENTOS PSI (EMDR)
Website Oficial: https://equipamentospsi.com/
Fundadores: Priscila Alves (Psicóloga clínica) e Eliab Caetano (Analista de sistemas) — Fundada em abril de 2015.
Canais Oficiais: WhatsApp Comercial (11) 96631-0256 | Suporte Técnico (62) 9223-8416 | comercial@equipamentospsi.com

1. CONTEXTO & TERAPIA EMDR:
A Equipamentos PSI projeta e fabrica no Brasil dispositivos para estimulação bilateral alternada (visual e tátil) voltados para psicoterapia EMDR (Eye Movement Desensitization and Reprocessing), Brainspotting e neuroterapias.
Automatiza a estimulação, garantindo ritmo constante e eliminando dores musculares (LER/DORT) do psicólogo causadas por movimentos manuais repetitivos com os dedos durante as sessões.

2. CATÁLOGO DE PRODUTOS & PREÇOS:
- Barra de Luz Tradicional (74 cm): 26 LEDs verdes suaves com difusores ópticos, controle remoto com ajuste de velocidade e memória, tripé telescópico metálico com regulagem de altura e inclinação, fonte bivolt automática (110V/220V). Faixa: R$ 1.314,80 a R$ 1.384,00.
- Barra de Luz Baby (51 cm): versão compacta e portátil, mesmas funções e tripé grande. Ideal para salas compactas, atendimento infantil e profissionais em trânsito. Faixa: R$ 1.286,60 a R$ 1.354,32.
- Aparelho Tátil Completo (Pulsers / Buzzers): caixa de comando digital com display numérico, regulagem independente de velocidade e intensidade vibratória, 2 pulsers anatômicos em formato de gota com cabos de 1,5m, bolsa e fonte bivolt. Faixa: R$ 687,42 a R$ 723,60.
- Bolsas de Transporte Acolchoadas: proteção antichoque para Barra Tradicional (R$ 302,67) ou Barra Baby (R$ 292,41).
- Conjunto de cabos P2 com pulsers: R$ 135,00 | Cabos sem pulsers: R$ 69,00.

3. POLÍTICA COMERCIAL:
- Desconto no PIX à vista ou em até 12x no cartão de crédito em ambiente seguro.
- Envio via Correios (SEDEX / PAC) calculado pelo CEP do consultório.
- Garantia de fábrica de 1 ano com peças de reposição e assistência técnica no Brasil.`,
      uploadedAt: new Date().toISOString(),
    },
    {
      id: 'doc-2',
      name: 'SLA_e_Qualidade_de_Atendimento.txt',
      type: 'txt',
      size: 1200,
      contentText: 'Padrão de Atendimento NEXA CRM: Disponibilidade contínua 24/7, privacidade e conformidade rigorosa com a LGPD, garantindo respostas rápidas, acolhedoras e personalizadas para cada lead.',
      uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    }
  ];

  public evolutionConfig: EvolutionConfig = {
    serverUrl: process.env.EVOLUTION_API_URL || 'https://api.makprojetosmake.com.br',
    apiKey: process.env.EVOLUTION_API_KEY || 'b2efa885a71ee22edf72b597df1a0ce9',
    instanceName: process.env.EVOLUTION_INSTANCE || 'primo-equipamentos',
    isConnected: false,
    state: 'disconnected',
    lastTestedAt: new Date().toISOString(),
    wasEverConnected: false,
    instanceApiKeys: {
      'verzel': '8B4CDFF9-8C33-415D-9877-EBE5E74134F4',
      'primo-equipamentos': '43BF031A-3A5D-4C32-81DD-A305F6575384',
      'surfacebrasil': 'DE151DAD-79C8-49F5-BFE3-5E129987F773',
      'dental-integrative': 'dental-integrative-oqn06i',
      'cemiterio-cantareira': 'cemiterio-cantareira-48zvof',
      'cemiterio-cantareira-48zvof': 'cemiterio-cantareira-48zvof',
      'equipamentospsi': '2EE0711F-2838-41E5-9BE0-466D03995E3F',
      'psi': '2EE0711F-2838-41E5-9BE0-466D03995E3F',
    },
  };

  public sentinelAlerts: SentinelAlertConfig = {
    enabled: true,
    notifyOnWhatsApp: false,
    notifyPhone: '5511976143323', // Número do Marco Duarte
    notifyOnTelegram: true,
    telegramBotToken: '8799978414:AAEemup1ywf71hueEKfgzPmx8J7VjPz73tQ',
    telegramChatId: '6789341084',
    notifyOnEmail: true,
    notifyEmail: 'marco.agduarte22@gmail.com',
    alertOnWhatsAppDisconnect: true,
    alertOnHighMemory: true,
    alertOnHighDisk: true,
    alertOnAiFailure: true,
    cooldownMinutes: 30,
    lastAlertSentAt: '',
  };

  public webhookLogs: WebhookEventLog[] = [];
  public appointments: AppointmentSlot[] = [
    {
      id: 'apt-1',
      leadId: 'lead-1',
      leadName: 'Dr. Roberto Silva',
      leadPhone: '5511987654321',
      summary: 'Consulta de Avaliação Integrativa - Dr. Roberto Silva',
      description: 'Avaliação clínica odontológica biológica com a Dra. Lucy Murata. Paciente deseja diagnóstico para remoção segura de restaurações antigas.',
      startIso: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      endIso: new Date(Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 45).toISOString(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    },
  ];

  public activeProfileId: string = 'profile-dra-lucy';
  public workspaceConfigs: Record<string, AgentConfig> = {};
  public savedProfiles: ClientProfile[] = [
    {
      id: 'profile-dra-lucy',
      name: 'Dra. Lucy Murata (Odontologia Integrativa)',
      nicheTag: 'Odontologia',
      evolutionInstanceName: 'dra-lucy-murata',
      agentConfig: JSON.parse(JSON.stringify(this.agentConfig)),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'profile-nexa-crm',
      name: 'NEXA CRM Oficial (Automação & Vendas)',
      nicheTag: 'Tecnologia / SaaS',
      evolutionInstanceName: 'nexa-crm-comercial',
      agentConfig: createNexaAgentConfig(this.agentConfig),
      updatedAt: new Date().toISOString(),
    },
  ];

  public logWebhookEvent(event: Omit<WebhookEventLog, 'id' | 'timestamp'>): WebhookEventLog {
    const entry: WebhookEventLog = {
      id: 'wh-log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.webhookLogs.unshift(entry);
    if (this.webhookLogs.length > 50) {
      this.webhookLogs.pop();
    }
    return entry;
  }

  public supabaseConfig: SupabaseConfig = {
    url: process.env.SUPABASE_URL || '',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    isConnected: Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)),
  };

  private supabaseClient: SupabaseClient | null = null;

  constructor() {
    this.initSupabaseClient();
    this.loadFromFile();
  }

  public async saveToFile(): Promise<void> {
    try {
      const payload = {
        stages: this.stages,
        leads: this.leads,
        messages: this.messages,
        agentConfig: this.agentConfig,
        workspaceConfigs: this.workspaceConfigs,
        documents: this.documents,
        evolutionConfig: this.evolutionConfig,
        supabaseConfig: this.supabaseConfig,
        sentinelAlerts: this.sentinelAlerts,
        appointments: this.appointments,
        activeProfileId: this.activeProfileId,
        savedProfiles: this.savedProfiles,
      };
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB Storage] Falha ao salvar dados em disco:', err);
    }

    // Se o cliente Supabase estiver conectado, sincronizar também na nuvem
    if (this.supabaseClient && this.supabaseConfig.isConnected) {
      try {
        await this.syncToSupabase();
      } catch (err: any) {
        // Fallback silencioso sem travar o aplicativo
        console.warn('[Supabase Sync] Aviso ao sincronizar na nuvem:', err.message);
      }
    }
  }

  public async syncToSupabase(): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      // Upsert leads no Supabase
      if (this.leads.length > 0) {
        const dbLeads = this.leads.map((l) => ({
          id: l.id,
          name: l.name,
          phone: l.phone,
          email: l.email || null,
          stage_id: l.stageId,
          value: l.value || 0,
          interest: l.interest || null,
          tags: l.tags || [],
          notes: l.notes || null,
          ai_paused: Boolean(l.aiPaused),
          last_interaction: l.lastInteraction,
          created_at: l.createdAt,
        }));
        await this.supabaseClient.from('leads').upsert(dbLeads, { onConflict: 'id' });
      }

      // Upsert últimas mensagens do chat
      if (this.messages.length > 0) {
        const recentMessages = this.messages.slice(-50).map((m) => ({
          id: m.id,
          lead_id: m.leadId,
          phone: m.phone,
          sender: m.sender,
          text: m.text,
          status: m.status || 'delivered',
          created_at: m.timestamp,
        }));
        await this.supabaseClient.from('mensagens_chat').upsert(recentMessages, { onConflict: 'id' });
      }
    } catch (err: any) {
      // Tabela pode ainda não ter sido criada pelo script SQL
    }
  }

  public loadFromFile(): void {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        if (data.stages && Array.isArray(data.stages)) {
          let loadedStages: KanbanStage[] = [...data.stages];
          const hasBaseStage = loadedStages.some(
            (s: any) => s.id === 'stage-base' || s.name?.toLowerCase().includes('base antiga')
          );

          if (!hasBaseStage) {
            loadedStages.unshift({
              id: 'stage-base',
              name: '📂 Base Antiga / Inativos',
              color: '#6366f1',
              order: 0,
            });
          } else {
            // Normalize name to avoid confusion with merged reactivacao
            loadedStages = loadedStages.map((s) => {
              if (s.id === 'stage-base' && (s.name === 'Base Antiga / Reativação' || s.name === 'Base Antiga')) {
                return { ...s, name: '📂 Base Antiga / Inativos' };
              }
              return s;
            });
          }

          // Ensure stage-reativacao exists in loaded stages
          const hasReactivacaoStage = loadedStages.some(
            (s: any) => s.id === 'stage-reativacao' || s.name?.toLowerCase().includes('em reativação')
          );

          if (!hasReactivacaoStage) {
            const baseIndex = loadedStages.findIndex((s: any) => s.id === 'stage-base');
            const reactivationStage: KanbanStage = {
              id: 'stage-reativacao',
              name: '⚡ Em Reativação (Disparo IA)',
              color: '#ec4899',
              order: 1,
            };
            if (baseIndex >= 0) {
              loadedStages.splice(baseIndex + 1, 0, reactivationStage);
            } else {
              loadedStages.unshift(reactivationStage);
            }
          }

          this.stages = loadedStages;
        }
        if (data.leads && Array.isArray(data.leads)) {
          this.leads = data.leads;
          for (const demoLead of DEFAULT_DEMO_LEADS) {
            if (!this.leads.some((l) => l.id === demoLead.id)) {
              this.leads.push(demoLead);
            }
          }
        }
        if (data.messages && Array.isArray(data.messages)) this.messages = data.messages;
        if (data.workspaceConfigs && typeof data.workspaceConfigs === 'object') {
          this.workspaceConfigs = data.workspaceConfigs;
        }
        if (data.agentConfig) {
          const loadedMaxChars = data.agentConfig.maxAudioChars;
          const isLegacyNexa = typeof data.agentConfig.role === 'string' && data.agentConfig.role.includes('NEXA CRM');
          
          let loadedInstagram = data.agentConfig.instagramConfig;
          // Se for a conta de exemplo inicial de desenvolvimento, manter desconectado por padrão para que o cliente veja a tela inicial
          if (loadedInstagram && (loadedInstagram.username === 'dra.lucymurata' || loadedInstagram.username === 'anuncio_destaque')) {
            loadedInstagram = {
              ...loadedInstagram,
              isConnected: false,
              username: '',
              fullName: '',
              profilePicUrl: '',
            };
          }

          // Sanitize followUpCustomMessage if a Clinic/Lucy config accidentally had Verzel/Surface follow-up text
          let cleanFollowUpMsg = data.agentConfig.followUpCustomMessage;
          const roleLower = (data.agentConfig.role || '').toLowerCase();
          if (
            (roleLower.includes('lucy') || roleLower.includes('odonto') || data.agentConfig.followUpNiche === 'dental') &&
            typeof cleanFollowUpMsg === 'string' &&
            (cleanFollowUpMsg.toLowerCase().includes('verzel') || cleanFollowUpMsg.toLowerCase().includes('plasma'))
          ) {
            cleanFollowUpMsg = 'Olá! Tudo bem? Passando para saber se você conseguiu verificar o melhor dia para a sua consulta de avaliação com a Dra. Lucy Murata. Nossa equipe tem horários exclusivos esta semana no consultório do Euroville Mall! 🌿✨';
          }

          this.agentConfig = {
            ...this.agentConfig,
            ...(isLegacyNexa ? {} : data.agentConfig),
            followUpCustomMessage: cleanFollowUpMsg || this.agentConfig.followUpCustomMessage,
            preRecordedAudios: data.agentConfig.preRecordedAudios && data.agentConfig.preRecordedAudios.length > 0
              ? data.agentConfig.preRecordedAudios
              : this.agentConfig.preRecordedAudios,
            preRecordedAudiosEnabled: data.agentConfig.preRecordedAudiosEnabled !== undefined
              ? data.agentConfig.preRecordedAudiosEnabled
              : (this.agentConfig.preRecordedAudiosEnabled ?? true),
            instagramConfig: loadedInstagram || this.agentConfig.instagramConfig,
            maxAudioChars: (!loadedMaxChars || loadedMaxChars <= 220) ? 500 : loadedMaxChars,
            geminiApiKey: (() => {
              const savedKey = (data.agentConfig.geminiApiKey || '').trim();
              const envKey = (process.env.GEMINI_API_KEY || '').trim();
              // Ignore the old known blocked key from early deployments
              const isOldBlocked = (k: string) => k.includes('p80qfADWas1aX40qx1TMkUmwGf6kg') || k.startsWith('AQ.Ab8RN6J');
              if (savedKey && !isOldBlocked(savedKey)) return savedKey;
              if (envKey && !isOldBlocked(envKey)) return envKey;
              return savedKey || envKey || (this.agentConfig.geminiApiKey || '').trim();
            })(),
            openaiApiKey: ((data.agentConfig.openaiApiKey || '').trim() || (process.env.OPENAI_API_KEY || '').trim() || this.agentConfig.openaiApiKey || '').trim(),
            anthropicApiKey: ((data.agentConfig.anthropicApiKey || '').trim() || (process.env.ANTHROPIC_API_KEY || '').trim() || this.agentConfig.anthropicApiKey || '').trim(),
          };
        }
        if (data.documents && Array.isArray(data.documents)) {
          this.documents = data.documents;
          const hasMentoriaDoc = this.documents.some((d) => d.id === 'doc-mentoria-dra-luci' || d.name?.includes('Mentoria'));
          if (!hasMentoriaDoc) {
            const defaultMentoriaDoc = this.documents.find((d) => d.id === 'doc-mentoria-dra-luci') || {
              id: 'doc-mentoria-dra-luci',
              name: 'Mentoria_Dra_Luci_Murata_Odontologia_Biologica_Ambulatorio_IA.txt',
              type: 'txt',
              size: 4200,
              contentText: `PROGRAMA OFICIAL DE MENTORIA - DRA. LUCI MURATA
Website Oficial: https://mentoria.lucymurata.com.br/
Título: Mentoria Dra. Luci Murata - Odontologia Biológica & Ambulatório IA
Subtítulo: Programa de mentoria executiva VIP em Odontologia Biológica, Cirurgias Metal-Free em Zircônia, L-PRF e o pioneiro ecossistema Ambulatório IA com imersão presencial na Clínica Euroville.

1. PÚBLICO-ALVO & REQUISITOS:
- Exclusivo para Cirurgiões-Dentistas com inscrição ativa no CRO.
- Formato VIP restrito: Apenas 10 vagas exclusivas por turma.
- Processo Seletivo Oficial: Seleção curricular criteriosa avaliada individualmente pela banca clínica da Dra. Luci Murata para garantir a homogeneidade de excelência da turma.

2. PILARES CLÍNICOS E CONTEÚDO PROGRAMÁTICO:
- Odontologia Biológica & Integrativa: Princípios de biocompatibilidade celular, destoxificação, imunologia bucal e protocolo seguro de remoção de restaurações metálicas e amálgama (SMART).
- Cirurgias Metal-Free em Zircônia: Implantes cerâmicos 100% livres de metal, técnicas cirúrgicas atraumáticas, osseointegração bioativa e reabilitação protética de alta estética biológica.
- L-PRF (Fibrina Rica em Plaquetas e Leucócitos): Coleta venosa, protocolos de centrifugação, confecção de plugues, membranas e sticky bone autólogo para regeneração tecidual guiada e cicatrização acelerada.
- Ozonioterapia Medicinal em Odontologia: Protocolos de aplicação antimicrobiana, bioestimulação, descontaminação cavitária e cirúrgica com ozônio medicinal.
- Diagnóstico Digital & Tomografia (CBCT): Planejamento digital avançado, escaneamento intraoral e navegação guiada tridimensional.
- Ecossistema "Ambulatório IA": Implementação pioneira de Inteligência Artificial e automações no consultório do dentista — triagem inteligente de pacientes, prontuários acelerados, pós-operatório automatizado e conversão de planos de tratamento de alto valor.

3. IMERSÃO PRESENCIAL & LOCALIZAÇÃO:
- Imersão prática presencial no consultório modelo da Dra. Luci Murata: Euroville Mall - Torre II - Praça Maastricht, 200 - Sala 103, Bragança Paulista/SP.
- Cirurgias demonstrativas ao vivo com pacientes reais e mentoria direta com a Dra. Luci.

4. INVESTIMENTO E CONDIÇÕES:
- O valor da mentoria é reservado e informado exclusivamente aos candidatos aprovados na etapa de análise curricular e entrevista seletiva individual com a equipe da Dra. Luci.
- Candidaturas são realizadas pelo site oficial com geração de Protocolo VIP e envio direto para o WhatsApp da equipe.`,
              uploadedAt: new Date().toISOString(),
            };
            this.documents.unshift(defaultMentoriaDoc);
          }
          const hasSurfaceDoc = this.documents.some((d) => d.id === 'doc-surfacebrasil-plasma' || d.name?.includes('Surfacebrasil'));
          if (!hasSurfaceDoc) {
            this.documents.unshift({
              id: 'doc-surfacebrasil-plasma',
              name: 'Dossie_Tecnico_Surfacebrasil_Plasma.pdf',
              type: 'pdf',
              size: 18500,
              contentText: `DOSSIÊ TÉCNICO & MANUAL COMERCIAL COMPLETO — SURFACEBRASIL
Website Oficial: https://surfacebrasil.com.br/
Sede: Rua Vitório Casellato, 30 – Campinas/SP | Tel: (19) 3365-2506 | contato@surfacebrasil.com.br
Unidades: Campinas/SP, Carlos Barbosa/RS, Estados Unidos (Maryland) e Argentina (Buenos Aires).

1. TECNOLOGIA DE TRATAMENTO DE SUPERFÍCIE POR PLASMA ATMOSFÉRICO A FRIO:
- O plasma é o quarto estado da matéria. Utilizando apenas ar comprimido industrial e eletricidade, gera descarga que atua em nível molecular em polímeros inertes (PP, PEAD, PEBD, PET, XLPE, Silicone) e metais (Alumínio).
- Aumenta a energia superficial (tensão superficial de Dyne) de ~28 dynas/cm para mais de 50 a 70 dynas/cm.
- Garante ancoragem definitiva para tintas automotivas/industriais, colas, vernizes, fitas adesivas e datação inkjet.
- Vantagem radical sobre flambador a gás: não usa fogo direto, elimina risco de incêndio/explosão fabril e NÃO deforma ou derrete peças plásticas.
- Vantagem sobre primers químicos: processo ecológico, sem solventes tóxicos (Zero VOC), sem tempo de secagem/cura e sem custo recorrente por litro.

2. EQUIPAMENTOS E SOLUÇÕES:
- SAP02 (Flambador Eletrônico Compacto Plug & Play): sistema industrial robusto para linhas contínuas de extrusão (fios, cabos, perfis plásticos) até 1.000 m/min.
- Mesa Automatizada CNC 3 Eixos (X-Y-Z): tratamento robotizado para peças tridimensionais, geometrias complexas e bandejas com receitas programadas.
- Bicos e Aplicadores Customizados: desenvolvimento sob medida para linhas fabris.

3. LABORATÓRIO SURFACE TEST:
- Centro em Campinas/SP para testes práticos de aderência. Os clientes enviam amostras de peças plásticas para ensaios de Dyne e teste de arrancamento, recebendo Laudo Técnico gratuito antes da compra.

4. DIRETRIZES DE ATENDIMENTO DA SOFIA:
- Qualificar material da peça (PP, PEAD, Alumínio, etc.).
- Identificar o processo e tipo de falha (descolamento de fita, descascamento de tinta, datação borrada).
- Perguntar a velocidade da linha ou se é peça unitária.
- Agendar reunião online com engenharia ou agendar envio de amostras para o Surface Test.`,
              uploadedAt: new Date().toISOString(),
            });
          }
          const hasVerzelDoc = this.documents.some((d) => d.id === 'doc-verzel-software' || d.name?.includes('Verzel'));
          if (!hasVerzelDoc) {
            this.documents.unshift({
              id: 'doc-verzel-software',
              name: 'Dossie_Tecnico_Verzel_Sistemas.pdf',
              type: 'pdf',
              size: 21500,
              contentText: `DOSSIÊ TÉCNICO & MANUAL COMERCIAL COMPLETO — VERZEL SOLUÇÕES EM SISTEMAS
Website Oficial: https://www.verzel.com.br/pt/
CNPJ: 11.845.885/0001-46 (Fundada em 2010 — 16 anos de mercado)
Sede SP: Rua Aníbal Benévolo, 94 - 2º Andar, Santana — São Paulo/SP
Hubs: São Paulo, Rio de Janeiro, Lisboa (Portugal) e Berlim (Alemanha)
Braço Educacional: Devaria (formação de talentos tech)
Grandes Clientes: Shell Brasil, Mutant, Zignet, Bunzl, Grupo Avenida, AON, BR COM.

1. PORTFÓLIO DE SOLUÇÕES & SERVIÇOS:
- Fábrica de Software Sob Medida: desenvolvimento web, portais corporativos, plataformas SaaS e microsserviços escaláveis (React, Next.js, Node.js, Python, Java, AWS, GCP, Docker/Kubernetes).
- Aplicativos Mobile: apps nativos e híbridos para iOS e Android (Flutter, React Native, Swift, Kotlin), design UX/UI centrado no usuário e publicação nas lojas.
- AI Talent Hub & IA Aplicada: desenvolvimento acelerado por inteligência artificial (até 40% mais rápido com redução de custos) e construção de fluxos com agentes de IA autônomos.
- Integração de Sistemas & APIs: conexão de ERPs (SAP, Totvs, Senior, Sankhya), CRMs (Salesforce, HubSpot), gateways de pagamento (Pix instantâneo) e modernização de legados.
- Sustentação & Suporte 24/7: monitoramento proativo, manutenção preventiva/evolutiva e SLA corporativo para sistemas críticos.

2. MODELOS DE CONTRATAÇÃO:
- Squad Dedicado (Alocação Ágil): time multidisciplinar exclusivo (PO, Tech Lead, Devs, QA, UX/UI) com sprints quinzenais e sem passivo trabalhista.
- Escopo Fechado (Turnkey): projetos com escopo, prazo e investimento pré-definidos para novos softwares ou MVPs rápidos.
- Sustentação Contínua: banco de horas e plantão com SLA garantido.

3. DIRETRIZES DA SOFIA (VERZEL):
- Atuar como consultora executiva técnica e cordial.
- Qualificar o tipo de projeto (novo software/app do zero, modernização de legado ou alocação de squad dedicado).
- Identificar plataforma (web, mobile iOS/Android ou ambos) e estágio (ideia/requisitos ou protótipo pronto).
- Destacar autoridade com clientes como Shell Brasil, Mutant e Zignet.
- Agendar Reunião Técnica de Discovery (online, gratuita e sem compromisso) com os arquitetos e diretores técnicos da Verzel.`,
              uploadedAt: new Date().toISOString(),
            });
          }
        }
        if (data.evolutionConfig) {
          const loadedKey = (data.evolutionConfig.apiKey || '').trim();
          const effectiveKey =
            !loadedKey ||
            loadedKey === 'CE08ADFF7647-4B88-91A4-55E66D9A0620' ||
            loadedKey.includes('exemplo')
              ? 'b2efa885a71ee22edf72b597df1a0ce9'
              : loadedKey;

          let instName = (data.evolutionConfig.instanceName || '').trim();
          if (instName === 'dra-lucy-morata' || instName === 'agente-ia') {
            instName = 'dra-lucy-murata';
          }

          this.evolutionConfig = {
            ...this.evolutionConfig,
            ...data.evolutionConfig,
            serverUrl: cleanUrl(process.env.EVOLUTION_API_URL || data.evolutionConfig.serverUrl || this.evolutionConfig.serverUrl),
            apiKey: effectiveKey,
            instanceName: instName || this.evolutionConfig.instanceName || 'primo-equipamentos',
            instanceApiKeys: {
              ...this.evolutionConfig.instanceApiKeys,
              ...(data.evolutionConfig.instanceApiKeys || {}),
              'verzel': (data.evolutionConfig.instanceApiKeys?.['verzel'] || '8B4CDFF9-8C33-415D-9877-EBE5E74134F4').trim(),
              'primo-equipamentos': (data.evolutionConfig.instanceApiKeys?.['primo-equipamentos'] || '43BF031A-3A5D-4C32-81DD-A305F6575384').trim(),
              'surfacebrasil': (data.evolutionConfig.instanceApiKeys?.['surfacebrasil'] || 'DE151DAD-79C8-49F5-BFE3-5E129987F773').trim(),
              'dental-integrative': (data.evolutionConfig.instanceApiKeys?.['dental-integrative'] || 'dental-integrative-oqn06i').trim(),
              'cemiterio-cantareira': (
                data.evolutionConfig.instanceApiKeys?.['cemiterio-cantareira'] &&
                data.evolutionConfig.instanceApiKeys?.['cemiterio-cantareira'] !== 'b2efa885a71ee22edf72b597df1a0ce9'
                  ? data.evolutionConfig.instanceApiKeys['cemiterio-cantareira']
                  : 'cemiterio-cantareira-48zvof'
              ).trim(),
              'cemiterio-cantareira-48zvof': (
                data.evolutionConfig.instanceApiKeys?.['cemiterio-cantareira-48zvof'] ||
                'cemiterio-cantareira-48zvof'
              ).trim(),
              'equipamentospsi': (
                data.evolutionConfig.instanceApiKeys?.['equipamentospsi'] &&
                data.evolutionConfig.instanceApiKeys?.['equipamentospsi'] !== 'b2efa885a71ee22edf72b597df1a0ce9'
                  ? data.evolutionConfig.instanceApiKeys['equipamentospsi']
                  : '2EE0711F-2838-41E5-9BE0-466D03995E3F'
              ).trim(),
              'psi': (
                data.evolutionConfig.instanceApiKeys?.['psi'] &&
                data.evolutionConfig.instanceApiKeys?.['psi'] !== 'b2efa885a71ee22edf72b597df1a0ce9'
                  ? data.evolutionConfig.instanceApiKeys['psi']
                  : '2EE0711F-2838-41E5-9BE0-466D03995E3F'
              ).trim(),
            },
          };
        }
        if (data.supabaseConfig) {
          this.supabaseConfig = {
            ...this.supabaseConfig,
            ...data.supabaseConfig,
          };
          this.initSupabaseClient();
        }
        if (data.sentinelAlerts) {
          this.sentinelAlerts = {
            ...this.sentinelAlerts,
            ...data.sentinelAlerts,
          };
        }
        if (data.appointments && Array.isArray(data.appointments)) {
          this.appointments = data.appointments;
        }
        if (data.activeProfileId) {
          this.activeProfileId = data.activeProfileId;
        }
        if (data.savedProfiles && Array.isArray(data.savedProfiles) && data.savedProfiles.length > 0) {
          this.savedProfiles = data.savedProfiles;
          // Garante que os perfis da Dra. Lucy e do NEXA CRM Oficial estejam sempre disponíveis
          const hasLucy = this.savedProfiles.some((p) => p.id === 'profile-dra-lucy');
          if (!hasLucy) {
            this.savedProfiles.unshift({
              id: 'profile-dra-lucy',
              name: 'Dra. Lucy Murata (Odontologia Integrativa)',
              nicheTag: 'Odontologia',
              evolutionInstanceName: 'dra-lucy-murata',
              agentConfig: JSON.parse(JSON.stringify(this.agentConfig)),
              updatedAt: new Date().toISOString(),
            });
          }
          const hasNexa = this.savedProfiles.some((p) => p.id === 'profile-nexa-crm');
          if (!hasNexa) {
            this.savedProfiles.push({
              id: 'profile-nexa-crm',
              name: 'NEXA CRM Oficial (Automação & Vendas)',
              nicheTag: 'Tecnologia / SaaS',
              evolutionInstanceName: 'nexa-crm-comercial',
              agentConfig: createNexaAgentConfig(this.agentConfig),
              updatedAt: new Date().toISOString(),
            });
          }
        } else {
          // Garante os perfis base iniciais
          this.savedProfiles = [
            {
              id: 'profile-dra-lucy',
              name: 'Dra. Lucy Murata (Odontologia Integrativa)',
              nicheTag: 'Odontologia',
              evolutionInstanceName: 'dra-lucy-murata',
              agentConfig: JSON.parse(JSON.stringify(this.agentConfig)),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'profile-nexa-crm',
              name: 'NEXA CRM Oficial (Automação & Vendas)',
              nicheTag: 'Tecnologia / SaaS',
              evolutionInstanceName: 'nexa-crm-comercial',
              agentConfig: createNexaAgentConfig(this.agentConfig),
              updatedAt: new Date().toISOString(),
            },
          ];
        }
        console.log(`[DB Storage] Dados restaurados com sucesso do disco (${this.leads.length} leads, ${this.messages.length} mensagens).`);
      }
    } catch (err) {
      console.error('[DB Storage] Falha ao ler dados do disco:', err);
    }
  }

  public clearAllLeads(workspaceId?: string): void {
    if (workspaceId && workspaceId !== 'all') {
      const targetWk = workspaceId.trim().toLowerCase();
      const removedLeadIds = new Set<string>();
      this.leads = this.leads.filter((l) => {
        const lWk = (l.workspaceId || '').toLowerCase();
        if (lWk === targetWk) {
          removedLeadIds.add(l.id);
          return false;
        }
        return true;
      });
      this.messages = this.messages.filter((m) => !removedLeadIds.has(m.leadId) && (m.workspaceId || '').toLowerCase() !== targetWk);
      this.saveToFile();
      console.log(`[DB Storage] Leads e mensagens do workspace "${targetWk}" foram limpos (${removedLeadIds.size} removidos).`);
      return;
    }
    this.leads = [];
    this.messages = [];
    this.saveToFile();
    console.log('[DB Storage] Todos os leads e mensagens foram limpos.');
  }

  public restoreDemoLeads(): void {
    this.leads = JSON.parse(JSON.stringify(DEFAULT_DEMO_LEADS));
    this.messages = JSON.parse(JSON.stringify(DEFAULT_DEMO_MESSAGES));
    this.saveToFile();
    console.log(`[DB Storage] Leads de demonstração restaurados (${this.leads.length} leads).`);
  }

  public initSupabaseClient(): boolean {
    const rawUrl = this.supabaseConfig.url || process.env.SUPABASE_URL || '';
    const cleanedUrl = cleanSupabaseUrl(rawUrl);
    const key = (this.supabaseConfig.serviceKey || process.env.SUPABASE_SERVICE_ROLE_KEY || this.supabaseConfig.anonKey || process.env.SUPABASE_ANON_KEY || '').trim();

    if (cleanedUrl && key) {
      try {
        this.supabaseConfig.url = cleanedUrl;
        this.supabaseClient = createClient(cleanedUrl, key);
        this.supabaseConfig.isConnected = true;
        console.log(`[Supabase] Conectado com sucesso ao banco na nuvem: ${cleanedUrl}`);
        // Tentar carregar leads existentes do Supabase
        this.loadFromSupabase().catch((err) => {
          console.warn('[Supabase] Aviso ao tentar carregar registros iniciais:', err.message);
        });
        return true;
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.supabaseConfig.isConnected = false;
        this.supabaseClient = null;
        return false;
      }
    }
    this.supabaseConfig.isConnected = false;
    this.supabaseClient = null;
    return false;
  }

  public async loadFromSupabase(): Promise<void> {
    if (!this.supabaseClient) return;
    try {
      const { data: dbLeads, error: leadsErr } = await this.supabaseClient.from('leads').select('*').order('last_interaction', { ascending: false });
      if (!leadsErr && dbLeads && dbLeads.length > 0) {
        this.leads = dbLeads.map((row: any) => {
          const existingLocal = this.leads.find((l) => l.id === row.id);
          return {
            id: row.id,
            name: row.name,
            phone: row.phone,
            email: row.email || '',
            stageId: row.stage_id || 'stage-1',
            value: Number(row.value) || 0,
            interest: row.interest || '',
            tags: row.tags || [],
            notes: row.notes || '',
            aiPaused: Boolean(row.ai_paused),
            isHotLead: Boolean(row.is_hot_lead),
            hotReason: row.hot_reason || '',
            lastInteraction: row.last_interaction || new Date().toISOString(),
            createdAt: row.created_at || new Date().toISOString(),
            unreadCount: row.unread_count || 0,
            deliveryInfo: row.delivery_info || existingLocal?.deliveryInfo,
          };
        });
        console.log(`[Supabase] ${this.leads.length} leads restaurados diretamente da nuvem.`);
      }

      const { data: dbMessages, error: msgErr } = await this.supabaseClient.from('mensagens_chat').select('*').order('created_at', { ascending: true });
      if (!msgErr && dbMessages && dbMessages.length > 0) {
        this.messages = dbMessages.map((m: any) => ({
          id: m.id,
          leadId: m.lead_id,
          phone: m.phone,
          sender: m.sender,
          text: m.text,
          status: m.status || 'read',
          stageTriggered: m.stage_triggered,
          extractedInfo: m.extracted_info,
          timestamp: m.created_at,
        }));
        console.log(`[Supabase] ${this.messages.length} mensagens de chat restauradas da nuvem.`);
      }
    } catch (err: any) {
      console.warn('[Supabase Sync] Não foi possível carregar do Supabase (tabelas ainda não criadas):', err.message);
    }
  }

  public getSupabaseClient(): SupabaseClient | null {
    return this.supabaseClient;
  }

  // Generate Supabase SQL Script
  public getSupabaseMigrationSQL(): string {
    return `-- ===================================================
-- NEXA CRM - Conversacional Autônomo
-- Script de Migração Oficial para Supabase
-- Criador & Administrador: Marco Duarte (marco.agduarte22@gmail.com)
-- ===================================================

-- 1. Tabela de Etapas do Funil Kanban
CREATE TABLE IF NOT EXISTS public.etapas_kanban (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  stage_id TEXT REFERENCES public.etapas_kanban(id) ON DELETE SET NULL,
  value NUMERIC(12,2) DEFAULT 0,
  interest TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  ai_paused BOOLEAN DEFAULT false,
  last_interaction TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Mensagens do Chat
CREATE TABLE IF NOT EXISTS public.mensagens_chat (
  id TEXT PRIMARY KEY,
  lead_id TEXT REFERENCES public.leads(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('lead', 'ai', 'agent', 'system')),
  text TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  stage_triggered TEXT,
  extracted_info JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Configurações do Agente de IA
CREATE TABLE IF NOT EXISTS public.configuracoes_agente (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  persona_name TEXT NOT NULL,
  role TEXT NOT NULL,
  tone_of_voice TEXT NOT NULL,
  sales_goal TEXT NOT NULL,
  active_provider TEXT DEFAULT 'gemini',
  active_model TEXT DEFAULT 'gemini-2.5-flash',
  knowledge_faq TEXT,
  knowledge_catalog TEXT,
  knowledge_pricing TEXT,
  knowledge_rules TEXT,
  strict_knowledge_only BOOLEAN DEFAULT true,
  auto_trigger_crm_stages BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Documentos de Conhecimento
CREATE TABLE IF NOT EXISTS public.documentos_conhecimento (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  content_text TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices de Performance
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_chat_lead_id ON public.mensagens_chat(lead_id);
CREATE INDEX IF NOT EXISTS idx_chat_created_at ON public.mensagens_chat(created_at);

-- Habilitar RLS (Opcional - Políticas Permissivas para Serviço)
ALTER TABLE public.etapas_kanban ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_agente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_conhecimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso completo via service_role" ON public.leads FOR ALL USING (true);
CREATE POLICY "Acesso completo via service_role etapas" ON public.etapas_kanban FOR ALL USING (true);
CREATE POLICY "Acesso completo via service_role chat" ON public.mensagens_chat FOR ALL USING (true);
CREATE POLICY "Acesso completo via service_role agente" ON public.configuracoes_agente FOR ALL USING (true);
CREATE POLICY "Acesso completo via service_role documentos" ON public.documentos_conhecimento FOR ALL USING (true);
`;
  }
}

export const db = new Database();
