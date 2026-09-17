import { db } from './db';
import { sendWhatsAppMessage } from './evolution';
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
  customTemplate?: string
): string {
  const firstName = (lead.name || 'tudo bem').split(' ')[0];

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

    // Generate tailored message
    const messageToSend = generateFollowUpMessage(lead, niche, customMessage);

    console.log(`[Follow-Up Automático] Disparando follow-up (${niche}) para ${lead.name} (${lead.phone})...`);

    try {
      await sendWhatsAppMessage(lead.phone, messageToSend);

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
