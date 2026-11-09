import { db } from './db';
import { sendWhatsAppMessage } from './evolution';
import { getCompanyPresetByInstance, resolveLeadWorkspaceId } from './companyConfigs';
import { ChatMessage, Lead, BusinessNiche } from '../src/types';

export interface FollowUpLog {
  leadId: string;
  leadName: string;
  phone: string;
  messageSent: string;
  timestamp: string;
  nicheUsed: string;
}

export const followUpLogs: FollowUpLog[] = [];

/**
 * Generates an intelligent, human follow-up message depending on the lead context & niche
 */
export function generateFollowUpMessage(
  lead: Lead,
  niche: BusinessNiche | 'dental' | 'medical' | 'sales' | 'custom' = 'dental',
  customTemplate?: string,
  followUpStep: number = 1,
  workspaceId?: string
): string {
  const firstName = (lead.name || 'tudo bem').split(' ')[0];
  const ws = (workspaceId || resolveLeadWorkspaceId(lead) || '').toLowerCase();

  // Se for o 2º follow-up (toque 2), envia uma mensagem amigável e educada de encerramento, personalizada para cada empresa
  if (followUpStep >= 2) {
    if (ws.includes('primo') || ws.includes('gastronomia')) {
      return `Olá, ${firstName}! Tudo bem? Imagino que a rotina da cozinha ou do comércio esteja corrida! Passando só para avisar que a equipe da Primo Equipamentos segue à disposição caso precise de cotações, voltagem ou condições no Pix. Um ótimo dia! 🍳🧑‍🍳`;
    }
    if (ws.includes('psi') || ws.includes('emdr')) {
      return `Olá, ${firstName}! Tudo bem? Sei que a rotina clínica de atendimentos com EMDR costuma ser intensa! Passando só para deixar nosso contato à disposição caso deseje tirar qualquer dúvida sobre a Barra de Luz ou Aparelho Tátil na Equipamentos PSI. Um abraço! 🧠🌿`;
    }
    if (ws.includes('cantareira')) {
      return `Olá, ${firstName}! Tudo bem? Passando com todo o respeito e carinho para deixar a equipe do Parque da Cantareira à disposição da sua família para quando for o melhor momento. Estamos sempre por aqui para acolhê-los. 🕊️🌿`;
    }
    if (ws.includes('surface')) {
      return `Olá, ${firstName}! Tudo bem? Imagino que o ritmo da sua linha fabril esteja acelerado! Passando só para avisar que nossos engenheiros e o laboratório Surface Test seguem disponíveis para testar suas amostras de peças ou bater um papo técnico sobre o plasma. Um abraço! ⚡🔬`;
    }
    if (ws.includes('verzel')) {
      return `Olá, ${firstName}! Tudo bem? Sei que as demandas de tecnologia e projetos costumam ser corridas! Nossa equipe sênior de arquitetura de software da Verzel continua à disposição para quando for o momento oportuno de desenhar o escopo da sua solução. Excelente dia! 💻🚀`;
    }
    if (ws.includes('amaro') || niche === 'legal') {
      return `Olá, ${firstName}! Tudo bem? Sei que sua rotina deve estar corrida! Passando só para avisar que nossa equipe jurídica da Amaro Advogados continua à disposição caso deseje tirar qualquer dúvida sobre o seu caso no momento mais oportuno para você. Um abraço e um ótimo dia! ⚖️🏛️`;
    }
    if (ws.includes('lucy') || ws.includes('dental') || niche === 'dental') {
      return `Olá, ${firstName}! Imagino que seu dia esteja corrido! Só passando para deixar nosso canal aberto caso precise de alguma orientação ou queira reservar sua avaliação integrativa com a Dra. Lucy mais adiante. Tenha uma ótima semana! 🦷🌿`;
    }
    if (niche === 'sales') {
      return `Olá, ${firstName}! Imagino que as coisas estejam corridas por aí! Passando só para deixar nosso contato à disposição caso ainda queira ver as opções de ${lead.interest || 'equipamentos'} ou tirar dúvidas. Conte sempre com a gente! 🚀`;
    }
    return `Olá, ${firstName}! Imagino que sua rotina esteja corrida por aí! Passando apenas para deixar o nosso contato à disposição caso queira retomar o atendimento no momento que for melhor para você. Tenha um excelente dia! ✨`;
  }

  if (customTemplate && customTemplate.trim()) {
    return customTemplate
      .replace(/\{nome\}/gi, firstName)
      .replace(/\{procedimento\}/gi, lead.triage?.procedure || lead.interest || 'atendimento')
      .replace(/\{interesse\}/gi, lead.interest || 'nossos serviços');
  }

  // Dental / Odontologia Follow-up Niche
  if (niche === 'dental') {
    if (lead.triage?.procedure) {
      return `Olá, ${firstName}! Tudo bem por aí? Passando rapidinho para saber se você conseguiu ver os horários para a sua avaliação de ${lead.triage.procedure} ou se prefere que a gente veja outro período para você! 😊`;
    }
    if (lead.isUrgent) {
      return `Olá, ${firstName}! Tudo bem? A equipe clínica está acompanhando seu caso com prioridade. Como está a sua dor/desconforto hoje? Conseguimos um encaixe na grade para você!`;
    }
    return `Olá, ${firstName}! Tudo bem? Passando para saber se ficou com alguma dúvida sobre os nossos tratamentos odontológicos ou se gostaria de agendar uma consulta com nossa equipe esta semana! 🦷✨`;
  }

  // Medical / Clínica Médica Niche
  if (niche === 'medical') {
    if (lead.triage?.procedure) {
      return `Olá, ${firstName}! Como você está? Gostaria de confirmar se podemos reservar o seu horário para ${lead.triage.procedure} na clínica ou se prefere uma outra data!`;
    }
    return `Olá, ${firstName}! Tudo bem? Gostaria de saber se você conseguiu verificar a sua disponibilidade para a consulta ou se precisa de auxílio com convênio/horários! 🩺`;
  }

  // Retail / Varejo e E-commerce
  if (niche === 'retail') {
    return `Olá, ${firstName}! Tudo bem? Vi que você estava interessado em ${lead.interest || 'nossos produtos'}. Ficou com alguma dúvida sobre disponibilidade, tamanhos ou formas de pagamento? Posso te ajudar a garantir o seu pedido! 🛍️`;
  }

  // Real Estate / Imobiliária
  if (niche === 'real_estate') {
    return `Olá, ${firstName}! Tudo bem? Gostaria de saber se você gostaria de agendar uma visita para conhecer o imóvel ou receber mais fotos e detalhes sobre as condições! 🏡`;
  }

  // Legal / Advocacia
  if (niche === 'legal') {
    return `Olá, ${firstName}! Tudo bem? Nosso time jurídico está à disposição para analisar o seu caso com sigilo e atenção. Gostaria de agendar uma consulta orientativa com nosso advogado? ⚖️`;
  }

  // Services / Serviços & Consultoria
  if (niche === 'services') {
    return `Olá, ${firstName}! Tudo bem? Conseguiu avaliar o escopo do nosso serviço? Posso te passar um orçamento detalhado ou tirar qualquer dúvida técnica! 💼`;
  }

  // B2B / Commercial / Corporate Niche
  if (niche === 'sales') {
    return `Olá, ${firstName}! Tudo bem? Passando para saber se conseguiu dar uma olhada na nossa apresentação ou se ficou alguma dúvida que eu possa esclarecer para avançarmos! 🚀`;
  }

  return `Olá, ${firstName}! Tudo bem? Gostaria de saber se podemos te ajudar com mais alguma informação sobre o seu atendimento!`;
}

/**
 * Runs the automated follow-up worker to check for leads that stopped responding
 */
export async function runFollowUpCycle(): Promise<{ evaluated: number; sent: number; logs: FollowUpLog[] }> {
  const config = db.agentConfig;
  if (!config.autoFollowUpEnabled) {
    return { evaluated: 0, sent: 0, logs: [] };
  }

  const delayHours = config.followUpDelayHours || 4;
  const maxFollowUps = config.maxFollowUpsPerLead || 2;
  const niche = config.followUpNiche || 'dental';
  const customMessage = config.followUpCustomMessage || '';

  const now = Date.now();
  const thresholdMs = delayHours * 60 * 60 * 1000;

  let sentCount = 0;
  const newlySentLogs: FollowUpLog[] = [];

  for (const lead of db.leads) {
    // Lead is not eligible if AI paused, or already won/lost stage, or exceeded max followups
    if (lead.aiPaused) continue;
    if (lead.stageId === 'stage-5' || lead.stageId === 'stage-lost') continue;
    if ((lead.followUpCount || 0) >= maxFollowUps) continue;

    // Horário comercial humano (08:30 às 21:00 no horário de Brasília / UTC-3):
    // Jamais enviar mensagens de madrugada (ex: 01:00 ou 05:00 da manhã) para respeitar o sono do cliente
    const nowUtc = new Date();
    const brHour = (nowUtc.getUTCHours() - 3 + 24) % 24;
    if (brHour < 8 || brHour >= 21) {
      continue;
    }

    // Check last interaction time
    const lastInteractionTime = lead.lastInteraction ? new Date(lead.lastInteraction).getTime() : 0;
    const timeSinceLastInteraction = now - lastInteractionTime;

    if (timeSinceLastInteraction < thresholdMs) {
      continue; // Not enough time passed yet
    }

    // Check last message sender: only send follow-up if the last message was from AI/agent OR lead hasn't answered
    const leadMessages = db.messages.filter((m) => m.leadId === lead.id || m.phone === lead.phone);
    if (leadMessages.length === 0) continue;

    const lastMessage = leadMessages[leadMessages.length - 1];
    // If the last message was already a recent follow up sent less than thresholdMs ago, skip
    if (lead.lastFollowUpAt) {
      const timeSinceLastFollowUp = now - new Date(lead.lastFollowUpAt).getTime();
      if (timeSinceLastFollowUp < thresholdMs) continue;
    }

    // Determine lead's company and isolated config
    const leadWorkspaceId = resolveLeadWorkspaceId(lead);
    const leadPreset = getCompanyPresetByInstance(leadWorkspaceId);
    const leadNiche = (leadPreset?.agentConfig?.followUpNiche || niche) as any;
    const leadCustomMsg = leadPreset?.agentConfig?.followUpCustomMessage || customMessage;
    const leadInstanceName = leadPreset?.instanceName || undefined;

    const nextStep = (lead.followUpCount || 0) + 1;
    // Generate tailored message strictly for this lead's company (varies text on step 2)
    const messageToSend = generateFollowUpMessage(lead, leadNiche, leadCustomMsg, nextStep, leadWorkspaceId);

    console.log(`[Follow-Up Automático] Disparando follow-up #${nextStep} (${leadWorkspaceId} / ${leadNiche}) para ${lead.name} (${lead.phone})...`);

    try {
      await sendWhatsAppMessage(lead.phone, messageToSend, leadInstanceName);

      const msgObj: ChatMessage = {
        id: 'msg-' + Date.now() + '-followup',
        leadId: lead.id,
        phone: lead.phone,
        sender: 'ai',
        text: messageToSend,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      };
      db.messages.push(msgObj);

      lead.followUpCount = (lead.followUpCount || 0) + 1;
      lead.lastFollowUpAt = new Date().toISOString();
      lead.lastInteraction = new Date().toISOString();
      if (!lead.tags.includes('Follow-up Enviado')) {
        lead.tags.push('Follow-up Enviado');
      }
      lead.notes = `${lead.notes || ''}\n🔁 [Follow-up Automático #${lead.followUpCount}]: ${new Date().toLocaleTimeString('pt-BR')}`;

      const logItem: FollowUpLog = {
        leadId: lead.id,
        leadName: lead.name,
        phone: lead.phone,
        messageSent: messageToSend,
        timestamp: new Date().toISOString(),
        nicheUsed: niche,
      };

      followUpLogs.unshift(logItem);
      newlySentLogs.push(logItem);
      if (followUpLogs.length > 50) followUpLogs.pop();

      sentCount++;
    } catch (err) {
      console.error(`[Follow-Up Erro] Falha ao enviar para ${lead.phone}:`, err);
    }
  }

  if (sentCount > 0) {
    db.saveToFile();
  }

  return {
    evaluated: db.leads.length,
    sent: sentCount,
    logs: newlySentLogs,
  };
}

// Background scheduler interval (checks every 5 minutes)
let followUpInterval: NodeJS.Timeout | null = null;

export function startFollowUpScheduler() {
  if (followUpInterval) clearInterval(followUpInterval);
  console.log('[Follow-Up Engine] Motor de Reativação Automática iniciado (verificação periódica ativa).');
  // Check every 5 minutes
  followUpInterval = setInterval(async () => {
    try {
      await runFollowUpCycle();
    } catch (e) {
      console.error('[Follow-Up Interval Error]:', e);
    }
  }, 5 * 60 * 1000);
}
