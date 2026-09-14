import { db } from './db';
import { processAiConversation } from './ai';
import { sendWhatsAppMessage } from './evolution';
import { Lead, ChatMessage } from '../src/types';

export function handleIncomingWebhook(body: any): void {
  // CRITICAL: We execute the entire pipeline inside setImmediate / background async queue
  // so the caller function in server.ts has already returned HTTP 200 within <5ms.
  setImmediate(async () => {
    try {
      await executeWebhookPipeline(body);
    } catch (err) {
      console.error('[Webhook Background Error]:', err);
    }
  });
}

async function executeWebhookPipeline(body: any): Promise<void> {
  if (!body) return;

  const eventName = body.event || body.type || 'webhook';

  // 1. Detect and parse Evolution API v2 event payload
  const data = body.data || body;

  // Key details
  const key = data?.key || body?.key;
  const isFromMe = key?.fromMe === true;

  // Ignore outbound messages from the bot/instance to prevent echo loops
  if (isFromMe) {
    db.logWebhookEvent({
      event: eventName,
      status: 'ignored_from_me',
      details: 'Mensagem enviada pelo próprio bot/instância (fromMe=true)',
      rawPayloadSnippet: JSON.stringify(body).slice(0, 150),
    });
    return;
  }

  // Extract remoteJid (phone identifier)
  const rawJid: string =
    key?.remoteJid ||
    data?.remoteJid ||
    body?.remoteJid ||
    body?.sender ||
    data?.sender ||
    '';

  // Ignore group chats if not targeted (e.g. ends with @g.us)
  if (rawJid.includes('@g.us') || rawJid.includes('@broadcast')) {
    db.logWebhookEvent({
      event: eventName,
      status: 'ignored_group',
      details: `Mensagem de grupo ignorada: ${rawJid}`,
    });
    return;
  }

  // Clean phone: remove @s.whatsapp.net and keep only digits
  const cleanPhone = rawJid.replace(/@.*$/, '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 8) {
    db.logWebhookEvent({
      event: eventName,
      status: 'error',
      details: `Número de telefone não identificado no payload (rawJid: ${rawJid})`,
      rawPayloadSnippet: JSON.stringify(body).slice(0, 200),
    });
    return;
  }

  // Extract message content according to Evolution API v2 spec
  const messageText: string =
    data?.message?.conversation ||
    data?.message?.extendedTextMessage?.text ||
    data?.messageText ||
    data?.message?.imageMessage?.caption ||
    data?.message?.documentMessage?.caption ||
    data?.message?.videoMessage?.caption ||
    body?.message?.conversation ||
    body?.message?.extendedTextMessage?.text ||
    body?.messageText ||
    '';

  if (!messageText.trim()) {
    db.logWebhookEvent({
      event: eventName,
      senderPhone: cleanPhone,
      status: 'no_text',
      details: 'Payload recebido sem texto reconhecível (áudio/mídia sem legenda ou evento de presença)',
      rawPayloadSnippet: JSON.stringify(body).slice(0, 200),
    });
    return;
  }

  console.log(`[Webhook] Mensagem recebida de ${cleanPhone}: "${messageText.slice(0, 50)}..."`);

  // Log successful reception
  db.logWebhookEvent({
    event: eventName,
    senderPhone: cleanPhone,
    messageText: messageText.trim(),
    status: 'processed',
    details: 'Processando com IA Sofia e funil de CRM',
  });

  // 2. Find or create lead in CRM database
  let lead = db.leads.find((l) => l.phone === cleanPhone);

  if (!lead) {
    const defaultStage = db.stages[0]?.id || 'stage-1';
    lead = {
      id: 'lead-' + Date.now(),
      name: data?.pushName || `Lead ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      stageId: defaultStage,
      value: 0,
      interest: 'Novo contato via WhatsApp',
      tags: ['WhatsApp', 'Novo Lead'],
      notes: 'Lead criado automaticamente via Evolution API v2.',
      aiPaused: false,
      lastInteraction: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      unreadCount: 1,
    };
    db.leads.unshift(lead);
  } else {
    lead.lastInteraction = new Date().toISOString();
    lead.unreadCount = (lead.unreadCount || 0) + 1;
    if (data?.pushName && lead.name.startsWith('Lead ')) {
      lead.name = data.pushName;
    }
  }

  // 3. Register incoming message in chat history
  const incomingMsg: ChatMessage = {
    id: 'msg-' + Date.now() + '-in',
    leadId: lead.id,
    phone: cleanPhone,
    sender: 'lead',
    text: messageText.trim(),
    timestamp: new Date().toISOString(),
    status: 'delivered',
  };
  db.messages.push(incomingMsg);

  // 4. Check if AI is paused for this lead (human agent has taken over)
  if (lead.aiPaused) {
    console.log(`[Webhook] Atendimento humano ativo para ${lead.name} (${cleanPhone}). IA pausada.`);
    return;
  }

  // 5. Query chat history for this lead
  const leadHistory = db.messages.filter((m) => m.leadId === lead!.id);

  // 6. Process with Multi-IA Engine (Gemini / OpenAI / Anthropic)
  try {
    const aiResult = await processAiConversation(lead, messageText.trim(), leadHistory);

    // 7. Update CRM if Function Calling / Intent detection triggered stage move or info extraction
    let stageTriggered: string | undefined;

    if (db.agentConfig.autoTriggerCRMStages && aiResult.stageTriggered) {
      const targetStage = db.stages.find((s) => s.id === aiResult.stageTriggered);
      if (targetStage && targetStage.id !== lead.stageId) {
        lead.stageId = targetStage.id;
        stageTriggered = targetStage.id;
        lead.notes = `${lead.notes || ''}\n[${new Date().toLocaleDateString('pt-BR')}] Movido para "${targetStage.name}" pela IA.`;
      }
    }

    if (aiResult.extractedInfo) {
      if (aiResult.extractedInfo.name && aiResult.extractedInfo.name.length > 2) {
        lead.name = aiResult.extractedInfo.name;
      }
      if (aiResult.extractedInfo.email && aiResult.extractedInfo.email.includes('@')) {
        lead.email = aiResult.extractedInfo.email;
      }
      if (aiResult.extractedInfo.interest) {
        lead.interest = aiResult.extractedInfo.interest;
      }
      if (aiResult.extractedInfo.value && aiResult.extractedInfo.value > 0) {
        lead.value = aiResult.extractedInfo.value;
      }
    }

    // 8. Register AI reply in chat history
    const aiMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-ai',
      leadId: lead.id,
      phone: cleanPhone,
      sender: 'ai',
      text: aiResult.replyText,
      timestamp: new Date().toISOString(),
      status: 'sent',
      stageTriggered,
      extractedInfo: aiResult.extractedInfo,
    };
    db.messages.push(aiMsg);

    // 9. Send response back to WhatsApp via Evolution API v2
    await sendWhatsAppMessage(cleanPhone, aiResult.replyText);
    aiMsg.status = 'delivered';
  } catch (aiErr: any) {
    console.error('[Webhook] Falha ao gerar resposta da IA:', aiErr.message);

    // Friendly fallback message directly from Sofia to the customer
    const fallbackText =
      'Olá! Agradecemos o seu contato. Nosso especialista Marco Duarte já foi notificado sobre sua solicitação e entrará em contato com você em instantes para lhe atender com total atenção!';
    
    const aiFallbackMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-ai',
      leadId: lead.id,
      phone: cleanPhone,
      sender: 'ai',
      text: fallbackText,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    db.messages.push(aiFallbackMsg);

    // Send fallback to WhatsApp
    await sendWhatsAppMessage(cleanPhone, fallbackText);

    // Alert for admin only in internal notes
    const adminAlertMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-alert',
      leadId: lead.id,
      phone: cleanPhone,
      sender: 'system',
      text: `[Sistema]: Sofia ativou modo de contingência inteligente devido a oscilação no provedor de IA (${aiErr.message?.slice(0, 80)}). Mensagem enviada ao lead.`,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    db.messages.push(adminAlertMsg);
  }
}
