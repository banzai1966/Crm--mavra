import { db } from './db';
import {
  processAiConversation,
  transcribeAudioWithGemini,
  analyzeImageWithGemini,
} from './ai';
import {
  sendWhatsAppMessage,
  sendWhatsAppMedia,
  getBase64FromMediaMessage,
} from './evolution';
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
  let messageText: string =
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

  // Check if message is a voice message / audio note (audioMessage)
  const isAudioMessage = Boolean(
    data?.message?.audioMessage ||
    body?.message?.audioMessage ||
    data?.messageType === 'audioMessage' ||
    body?.messageType === 'audioMessage'
  );

  // Check if message is an image/photo (imageMessage)
  const isImageMessage = Boolean(
    data?.message?.imageMessage ||
    body?.message?.imageMessage ||
    data?.messageType === 'imageMessage' ||
    body?.messageType === 'imageMessage'
  );

  let isAudioTranscribed = false;
  let isImageAnalyzed = false;

  if (!messageText.trim() && isAudioMessage && db.agentConfig.autoTranscribeAudio !== false) {
    console.log(`[Webhook] Mensagem de áudio recebida de ${cleanPhone}. Processando transcrição de voz...`);
    const audioObj = data?.message?.audioMessage || body?.message?.audioMessage;
    let base64Audio = data?.base64 || body?.base64 || audioObj?.base64;
    const mimeType = audioObj?.mimetype || 'audio/ogg';

    // If base64 was not sent in webhook payload, fetch directly from Evolution API
    if (!base64Audio && (data?.key || body?.key)) {
      base64Audio = await getBase64FromMediaMessage(data?.key || body?.key);
    }

    if (base64Audio) {
      try {
        const transcribedText = await transcribeAudioWithGemini(base64Audio, mimeType);
        if (transcribedText) {
          messageText = transcribedText;
          isAudioTranscribed = true;
          console.log(`[Webhook] Áudio de ${cleanPhone} transcrito com sucesso: "${messageText}"`);
        }
      } catch (err: any) {
        console.error('[Webhook] Falha ao transcrever áudio:', err.message);
      }
    }
  } else if (isImageMessage) {
    // Process image with Gemini Vision AI
    console.log(`[Webhook] Imagem recebida de ${cleanPhone}. Processando análise visual com IA...`);
    const imageObj = data?.message?.imageMessage || body?.message?.imageMessage;
    let base64Image = data?.base64 || body?.base64 || imageObj?.base64;
    const caption = messageText.trim() || imageObj?.caption || '';
    const mimeType = imageObj?.mimetype || 'image/jpeg';

    if (!base64Image && (data?.key || body?.key)) {
      base64Image = await getBase64FromMediaMessage(data?.key || body?.key);
    }

    if (base64Image) {
      try {
        const analysis = await analyzeImageWithGemini(base64Image, caption, mimeType);
        if (analysis) {
          messageText = caption ? `${caption}\n[Análise Visual da Imagem]: ${analysis}` : `[Imagem Recebida]: ${analysis}`;
          isImageAnalyzed = true;
          console.log(`[Webhook] Imagem de ${cleanPhone} analisada com sucesso: "${analysis.slice(0, 60)}..."`);
        }
      } catch (err: any) {
        console.error('[Webhook] Falha ao analisar imagem com IA:', err.message);
      }
    }
  }

  if (!messageText.trim()) {
    db.logWebhookEvent({
      event: eventName,
      senderPhone: cleanPhone,
      status: 'no_text',
      details: isAudioMessage
        ? 'Áudio recebido, mas sem base64 disponível ou não foi possível transcrever.'
        : 'Payload recebido sem texto reconhecível (mídia sem legenda ou evento de presença)',
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
  let displayText = messageText.trim();
  if (isAudioTranscribed) {
    displayText = `🎤 [Áudio Transcrito]: "${messageText.trim()}"`;
  } else if (isImageAnalyzed && !displayText.startsWith('[')) {
    displayText = `📷 [Foto Recebida]: ${displayText}`;
  }

  const incomingMsg: ChatMessage = {
    id: 'msg-' + Date.now() + '-in',
    leadId: lead.id,
    phone: cleanPhone,
    sender: 'lead',
    text: displayText,
    timestamp: new Date().toISOString(),
    status: 'delivered',
  };
  db.messages.push(incomingMsg);
  db.saveToFile();

  // 4. Check Global AI Switch (ON / OFF)
  if (db.agentConfig.isGlobalAiActive === false) {
    console.log(`[Webhook] IA Global DESLIGADA no painel. Ignorando resposta automática para ${cleanPhone}.`);
    db.logWebhookEvent({
      event: eventName,
      senderPhone: cleanPhone,
      status: 'ignored_from_me',
      details: 'IA Global desativada pelo administrador. Mensagem salva apenas para histórico.',
    });
    return;
  }

  // 4b. Check Test Mode Whitelist (Prevent replying to friends/family on personal WhatsApp)
  if (db.agentConfig.testModeEnabled) {
    const whitelist = (db.agentConfig.testNumberWhitelist || '')
      .split(/[,;\s]+/)
      .map((p) => p.replace(/\D/g, ''))
      .filter(Boolean);

    const isAuthorized = whitelist.length === 0 || whitelist.some((w) => cleanPhone.endsWith(w) || w.endsWith(cleanPhone));

    if (!isAuthorized) {
      console.log(`[Webhook] MODO TESTE ATIVO: Número ${cleanPhone} não está na lista autorizada (${whitelist.join(', ')}). Ignorando silenciosamente.`);
      db.logWebhookEvent({
        event: eventName,
        senderPhone: cleanPhone,
        status: 'ignored_from_me',
        details: `Modo de Teste ativo: Número ${cleanPhone} ignorado para proteger contatos pessoais.`,
      });
      return;
    }
  }

  // 4c. Check if AI is paused for this specific lead (human agent has taken over)
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

    // 10. If the lead requested catalog/presentation and a PDF URL is configured, send the PDF document
    if (aiResult.sendCatalogPdf && db.agentConfig.catalogPdfUrl) {
      console.log(`[Webhook] Enviando PDF de apresentação para ${cleanPhone}...`);
      const pdfUrl = db.agentConfig.catalogPdfUrl;
      const pdfName = db.agentConfig.catalogPdfName || 'Apresentacao_Oficial_MAVRA.pdf';
      await sendWhatsAppMedia(
        cleanPhone,
        pdfUrl,
        pdfName,
        'Segue em anexo nossa apresentação oficial em PDF com todos os detalhes!'
      );
      db.messages.push({
        id: 'msg-' + Date.now() + '-pdf',
        leadId: lead.id,
        phone: cleanPhone,
        sender: 'ai',
        text: `📄 [Documento Enviado]: "${pdfName}"`,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      });
    }

    db.saveToFile();
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
    db.saveToFile();
  }
}
