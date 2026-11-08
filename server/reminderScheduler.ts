import { db } from './db';
import { sendWhatsAppMessage } from './evolution';
import { ChatMessage } from '../src/types';

let reminderInterval: NodeJS.Timeout | null = null;

/**
 * Motor Inteligente de Lembretes Anti-Falta (Redução de No-Show).
 * Verifica agendamentos a cada 2 minutos e dispara confirmações humanizadas no WhatsApp
 * com antecedência de 24 horas e 2 horas.
 */
export function startReminderScheduler(): void {
  if (reminderInterval) clearInterval(reminderInterval);

  console.log('[Anti-Falta Engine] Motor de Lembretes Inteligentes Anti-Falta iniciado.');

  // Run initial check after 5 seconds
  setTimeout(runReminderCycle, 5000);

  // Check every 2 minutes
  reminderInterval = setInterval(async () => {
    try {
      await runReminderCycle();
    } catch (err) {
      console.error('[Anti-Falta Interval Error]:', err);
    }
  }, 2 * 60 * 1000);
}

export async function runReminderCycle(): Promise<{ checked: number; sent: number }> {
  if (!db.evolutionConfig.isConnected && !db.evolutionConfig.serverUrl) {
    return { checked: 0, sent: 0 };
  }

  const now = Date.now();
  let sentCount = 0;

  for (const apt of db.appointments) {
    if (apt.status === 'cancelled') continue;

    const aptTime = new Date(apt.startIso).getTime();
    if (isNaN(aptTime)) continue;

    const timeUntilMs = aptTime - now;
    const hoursUntil = timeUntilMs / (1000 * 60 * 60);

    // Find corresponding lead
    const lead = apt.leadId
      ? db.leads.find((l) => l.id === apt.leadId)
      : apt.leadPhone
      ? db.leads.find((l) => l.phone.replace(/\D/g, '') === (apt.leadPhone || '').replace(/\D/g, ''))
      : null;

    const phone = apt.leadPhone || lead?.phone;
    if (!phone) continue;

    const leadName = lead?.name || apt.leadName || 'Cliente';
    const isLegal = (lead?.workspaceId || '').includes('amaro') || apt.summary.toLowerCase().includes('amaro');
    const instanceName = lead?.instanceName || (isLegal ? 'amaro-advogados' : db.evolutionConfig.instanceName);

    const aptDateFormatted = new Date(apt.startIso).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
    });
    const aptTimeFormatted = new Date(apt.startIso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // 1. GATILHO 24 HORAS (Janela entre 26h e 18h de antecedência)
    if (hoursUntil > 0 && hoursUntil <= 26 && hoursUntil >= 18 && !apt.reminder24hSent) {
      const msg = isLegal
        ? `Olá ${leadName}, tudo bem? Aqui é a Sofia da Amaro Advogados Associados! 🏛️\n\nPassando para confirmar nossa *Consulta de Avaliação Estratégica* com o Dr. Bruno Amaro e nossa equipe agendada para amanhã (${aptDateFormatted}) às *${aptTimeFormatted}*.\n\nEstá tudo confirmado para você ou prefere algum ajuste no horário? Estamos com sua pasta e apontamentos preparados!`
        : `Olá ${leadName}, tudo bem? Passando para confirmar nossa reunião agendada para amanhã às *${aptTimeFormatted}*. Está tudo certo para você? Caso precise de algum ajuste, nos avise por aqui! 📅`;

      try {
        await sendWhatsAppMessage(phone, msg, instanceName);
        apt.reminder24hSent = true;
        apt.lastReminderAt = new Date().toISOString();
        if (lead) {
          lead.reminder24hSent = true;
          lead.lastReminderAt = apt.lastReminderAt;
        }

        const chatMsg: ChatMessage = {
          id: `msg-reminder24h-${Date.now()}`,
          leadId: lead?.id || apt.id,
          phone: phone,
          sender: 'ai',
          text: msg,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };
        db.messages.push(chatMsg);
        sentCount++;
        console.log(`[Anti-Falta 24h] Lembrete disparado com sucesso para ${leadName} (${phone})`);
      } catch (err) {
        console.warn(`[Anti-Falta Erro 24h] Falha ao enviar lembrete para ${phone}:`, err);
      }
    }

    // 2. GATILHO 2 HORAS (Janela entre 2h30min e 30min de antecedência)
    if (hoursUntil > 0 && hoursUntil <= 2.5 && hoursUntil >= 0.5 && !apt.reminder2hSent) {
      const msg = isLegal
        ? `Olá ${leadName}! Lembrando que nossa reunião com o Dr. Bruno Amaro acontece hoje em cerca de 2 horas, às *${aptTimeFormatted}* (presencial em nossa sede em Moema ou pelo Google Meet).\n\nJá estamos te esperando com todo o carinho e discrição. Até breve! ⚖️🏛️`
        : `Olá ${leadName}! Passando para lembrar que nossa reunião acontece hoje em cerca de 2 horas (às *${aptTimeFormatted}*). Nos vemos em breve! ⏱️`;

      try {
        await sendWhatsAppMessage(phone, msg, instanceName);
        apt.reminder2hSent = true;
        apt.lastReminderAt = new Date().toISOString();
        if (lead) {
          lead.reminder2hSent = true;
          lead.lastReminderAt = apt.lastReminderAt;
        }

        const chatMsg: ChatMessage = {
          id: `msg-reminder2h-${Date.now()}`,
          leadId: lead?.id || apt.id,
          phone: phone,
          sender: 'ai',
          text: msg,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };
        db.messages.push(chatMsg);
        sentCount++;
        console.log(`[Anti-Falta 2h] Lembrete disparado com sucesso para ${leadName} (${phone})`);
      } catch (err) {
        console.warn(`[Anti-Falta Erro 2h] Falha ao enviar lembrete de 2h para ${phone}:`, err);
      }
    }
  }

  if (sentCount > 0) {
    db.saveToFile();
  }

  return { checked: db.appointments.length, sent: sentCount };
}

/**
 * Permite que a secretária ou advogado dispare manualmente o lembrete a qualquer momento pelo CRM.
 */
export async function sendManualReminder(
  appointmentId: string,
  type: '24h' | '2h' = '24h'
): Promise<{ success: boolean; message: string }> {
  const apt = db.appointments.find((a) => a.id === appointmentId);
  if (!apt) throw new Error('Agendamento não encontrado.');

  const lead = apt.leadId
    ? db.leads.find((l) => l.id === apt.leadId)
    : apt.leadPhone
    ? db.leads.find((l) => l.phone.replace(/\D/g, '') === (apt.leadPhone || '').replace(/\D/g, ''))
    : null;

  const phone = apt.leadPhone || lead?.phone;
  if (!phone) throw new Error('Telefone do contato não informado.');

  const leadName = lead?.name || apt.leadName || 'Cliente';
  const isLegal = (lead?.workspaceId || '').includes('amaro') || apt.summary.toLowerCase().includes('amaro');
  const instanceName = lead?.instanceName || (isLegal ? 'amaro-advogados' : db.evolutionConfig.instanceName);

  const aptTimeFormatted = new Date(apt.startIso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const msg =
    type === '24h'
      ? `Olá ${leadName}, tudo bem? Aqui é a Sofia! Passando para confirmar nosso compromisso agendado para às *${aptTimeFormatted}*. Está tudo certo para você? Caso precise de ajuste, nos avise por aqui! 📅`
      : `Olá ${leadName}! Lembrando que nosso compromisso acontece hoje às *${aptTimeFormatted}*. Já estamos com tudo pronto para o seu atendimento. Até breve! ✨`;

  await sendWhatsAppMessage(phone, msg, instanceName);

  if (type === '24h') apt.reminder24hSent = true;
  if (type === '2h') apt.reminder2hSent = true;
  apt.lastReminderAt = new Date().toISOString();

  if (lead) {
    if (type === '24h') lead.reminder24hSent = true;
    if (type === '2h') lead.reminder2hSent = true;
    lead.lastReminderAt = apt.lastReminderAt;
  }

  const chatMsg: ChatMessage = {
    id: `msg-manual-reminder-${Date.now()}`,
    leadId: lead?.id || apt.id,
    phone: phone,
    sender: 'ai',
    text: msg,
    timestamp: new Date().toISOString(),
    status: 'delivered',
  };
  db.messages.push(chatMsg);
  db.saveToFile();

  return { success: true, message: `Lembrete de ${type} enviado com sucesso para ${leadName}!` };
}
