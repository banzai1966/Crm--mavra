import { db } from './db';
import {
  processAiConversation,
  generateRuleBasedSafetyReply,
  transcribeAudioWithGemini,
  analyzeImageWithGemini,
  analyzeDocumentWithGemini,
  synthesizeSpeech,
} from './ai';
import {
  sendWhatsAppMessage,
  sendWhatsAppMedia,
  sendWhatsAppVoiceAudio,
  getBase64FromMediaMessage,
} from './evolution';
import { Lead, ChatMessage } from '../src/types';

// In-memory cache for processed message IDs to prevent double processing & infinite duplicate loops
const processedMessageIds = new Map<string, number>();
// In-memory lock per phone to prevent concurrent processing of the same conversation
const phoneInFlight = new Set<string>();

function isDuplicateMessage(messageId?: string): boolean {
  if (!messageId) return false;
  const now = Date.now();

  // Garbage collect entries older than 3 minutes
  if (processedMessageIds.size > 200) {
    for (const [id, time] of processedMessageIds.entries()) {
      if (now - time > 180000) {
        processedMessageIds.delete(id);
      }
    }
  }

  if (processedMessageIds.has(messageId)) {
    return true;
  }

  processedMessageIds.set(messageId, now);
  return false;
}

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

  const eventName = (body.event || body.type || 'webhook').toLowerCase();

  // Only ignore pure presence, contacts sync, status updates, or receipt confirmations
  if (
    eventName === 'presence.update' ||
    eventName === 'chats.update' ||
    eventName === 'contacts.update' ||
    eventName === 'messages.update' ||
    eventName === 'message.update' ||
    eventName === 'message.ack' ||
    eventName === 'send.message'
  ) {
    return;
  }

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

  // Check and discard duplicate events sent by Evolution API retries
  const messageId = key?.id || data?.id || body?.id;
  if (messageId && isDuplicateMessage(messageId)) {
    console.log(`[Webhook] Evento duplicado ignorado (ID: ${messageId})`);
    return;
  }

  // Extract remoteJid (phone identifier)
  // WhatsApp Business LID mode sends remoteJid as @lid and actual phone in remoteJidAlt
  const candidateJid =
    (key?.remoteJidAlt && !key.remoteJidAlt.includes('@lid') ? key.remoteJidAlt : null) ||
    (data?.remoteJidAlt && !data.remoteJidAlt.includes('@lid') ? data.remoteJidAlt : null) ||
    (body?.remoteJidAlt && !body.remoteJidAlt.includes('@lid') ? body.remoteJidAlt : null) ||
    key?.remoteJid ||
    data?.remoteJid ||
    body?.remoteJid ||
    body?.sender ||
    data?.sender ||
    '';
  const rawJid: string = candidateJid;

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
      senderPhone: cleanPhone,
      status: 'error',
      details: `Número de telefone não identificado no payload (rawJid: ${rawJid})`,
      rawPayloadSnippet: JSON.stringify(body).slice(0, 200),
    });
    return;
  }

  // Prevent concurrent webhook executions for the same contact number
  if (phoneInFlight.has(cleanPhone)) {
    console.log(`[Webhook] Mensagem de ${cleanPhone} já em processamento ativo. Ignorando evento concorrente.`);
    return;
  }
  phoneInFlight.add(cleanPhone);

  try {

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

  // Check if message is a voice message / audio note (audioMessage, PTT or audio media)
  const audioObj =
    data?.message?.audioMessage ||
    body?.message?.audioMessage ||
    data?.message?.documentWithCaptionMessage?.message?.audioMessage ||
    data?.message?.ephemeralMessage?.message?.audioMessage ||
    data?.message?.viewOnceMessage?.message?.audioMessage ||
    data?.audioMessage ||
    body?.audioMessage;

  const isAudioMessage = Boolean(
    audioObj ||
    data?.messageType === 'audioMessage' ||
    body?.messageType === 'audioMessage' ||
    data?.messageType === 'ptt' ||
    body?.messageType === 'ptt' ||
    data?.messageType === 'audio' ||
    body?.messageType === 'audio' ||
    data?.mediaType === 'audio' ||
    body?.mediaType === 'audio' ||
    data?.message?.audio ||
    body?.message?.audio
  );

  // Check if message is an image/photo (imageMessage)
  const imageObj =
    data?.message?.imageMessage ||
    body?.message?.imageMessage ||
    data?.message?.documentWithCaptionMessage?.message?.imageMessage ||
    data?.message?.ephemeralMessage?.message?.imageMessage ||
    data?.message?.viewOnceMessage?.message?.imageMessage;

  const isImageMessage = Boolean(
    imageObj ||
    data?.messageType === 'imageMessage' ||
    body?.messageType === 'imageMessage' ||
    data?.mediaType === 'image' ||
    body?.mediaType === 'image'
  );

  // Check if message is a document (PDF, DOCX, TXT, etc.)
  const documentObj =
    data?.message?.documentMessage ||
    body?.message?.documentMessage ||
    data?.message?.documentWithCaptionMessage?.message?.documentMessage ||
    data?.message?.ephemeralMessage?.message?.documentMessage ||
    data?.message?.viewOnceMessage?.message?.documentMessage;

  const isDocumentMessage = Boolean(
    documentObj ||
    data?.messageType === 'documentMessage' ||
    body?.messageType === 'documentMessage' ||
    data?.mediaType === 'document' ||
    body?.mediaType === 'document'
  );

  let isAudioTranscribed = false;
  let isImageAnalyzed = false;
  let isDocumentAnalyzed = false;

  if (!messageText.trim() && isAudioMessage && db.agentConfig.autoTranscribeAudio !== false) {
    console.log(`[Webhook] Mensagem de áudio recebida de ${cleanPhone}. Processando transcrição de voz com Gemini...`);
    let base64Audio =
      data?.base64 ||
      body?.base64 ||
      audioObj?.base64 ||
      data?.message?.base64 ||
      body?.message?.base64 ||
      data?.message?.audioMessage?.base64 ||
      body?.message?.audioMessage?.base64;

    const mimeType = audioObj?.mimetype || 'audio/ogg';

    // If base64 was not sent in webhook payload, fetch directly from Evolution API with brief retry
    if (!base64Audio) {
      const payloadToFetch = data || body || (audioObj ? { message: { audioMessage: audioObj } } : null);
      const keyToFetch = data?.key || body?.key;
      console.log(`[Webhook] Baixando base64 do áudio diretamente da Evolution API (ID: ${keyToFetch?.id || 'direto'})...`);

      for (let attempt = 1; attempt <= 3; attempt++) {
        base64Audio = await getBase64FromMediaMessage(payloadToFetch, keyToFetch);
        if (base64Audio) break;
        if (attempt < 3) {
          console.log(`[Webhook] Mídia ainda não disponível na Evolution API (tentativa ${attempt}/3). Aguardando ${attempt * 600}ms...`);
          await new Promise((r) => setTimeout(r, attempt * 600));
        }
      }
    }

    if (base64Audio) {
      try {
        const transcribedText = await transcribeAudioWithGemini(base64Audio, mimeType);
        if (transcribedText) {
          messageText = transcribedText;
          isAudioTranscribed = true;
          console.log(`[Webhook] Áudio de ${cleanPhone} transcrito com sucesso: "${messageText}"`);
        } else {
          console.warn('[Webhook] Transcrição do Gemini retornou vazia. Ignorando evento para evitar mensagem indevida.');
          if (messageId) processedMessageIds.delete(messageId);
          return;
        }
      } catch (err: any) {
        console.error('[Webhook] Falha ao transcrever áudio com Gemini:', err.message);
        if (messageId) processedMessageIds.delete(messageId);
        return;
      }
    } else {
      console.warn('[Webhook] Não foi possível obter o arquivo de áudio (base64 ausente na Evolution API). Ignorando evento preliminar.');
      if (messageId) processedMessageIds.delete(messageId);
      return;
    }
  } else if (isImageMessage) {
    // Process image with Gemini Vision AI
    console.log(`[Webhook] Imagem recebida de ${cleanPhone}. Processando análise visual com IA...`);
    let base64Image =
      data?.base64 ||
      body?.base64 ||
      imageObj?.base64 ||
      data?.message?.base64 ||
      body?.message?.base64;

    const caption = messageText.trim() || imageObj?.caption || '';
    const mimeType = imageObj?.mimetype || 'image/jpeg';

    // Retry fetching media base64 from Evolution API if not present in initial webhook payload
    if (!base64Image) {
      const payloadToFetch = data || body || (imageObj ? { message: { imageMessage: imageObj } } : null);
      const keyToFetch = data?.key || body?.key;
      console.log(`[Webhook] Baixando base64 da imagem diretamente da Evolution API (ID: ${keyToFetch?.id || 'direto'})...`);

      for (let attempt = 1; attempt <= 4; attempt++) {
        base64Image = await getBase64FromMediaMessage(payloadToFetch, keyToFetch);
        if (base64Image) break;
        if (attempt < 4) {
          console.log(`[Webhook] Imagem ainda não disponível na Evolution API (tentativa ${attempt}/4). Aguardando ${attempt * 700}ms...`);
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
    }

    if (base64Image) {
      try {
        const analysis = await analyzeImageWithGemini(base64Image, caption, mimeType);
        if (analysis) {
          messageText = caption ? `${caption}\n[Análise Visual da Imagem]: ${analysis}` : `[Imagem Recebida]: ${analysis}`;
          isImageAnalyzed = true;
          console.log(`[Webhook] Imagem de ${cleanPhone} analisada com sucesso: "${analysis.slice(0, 60)}..."`);
        } else {
          messageText = caption || '[Foto/Imagem recebida pelo WhatsApp]';
        }
      } catch (err: any) {
        console.error('[Webhook] Falha ao analisar imagem com IA:', err.message);
        messageText = caption || '[Foto/Imagem recebida pelo WhatsApp]';
      }
    } else {
      // If base64 is still null, this is an incomplete preliminary event from Evolution API.
      // Do NOT send a generic reply or trigger the AI without the actual image!
      console.warn('[Webhook] Imagem sem base64 disponível na Evolution API. Ignorando evento preliminar para evitar mensagem genérica/duplicada.');
      if (messageId) processedMessageIds.delete(messageId);
      return;
    }
  } else if (isDocumentMessage) {
    // Process PDF or document with Gemini Multimodal AI
    console.log(`[Webhook] Documento/PDF recebido de ${cleanPhone}. Processando leitura com IA...`);
    let base64Doc =
      data?.base64 ||
      body?.base64 ||
      documentObj?.base64 ||
      data?.message?.base64 ||
      body?.message?.base64;

    const docFileName = documentObj?.fileName || data?.message?.documentMessage?.fileName || 'documento.pdf';
    const docCaption = messageText.trim() || documentObj?.caption || '';
    const docMime = documentObj?.mimetype || 'application/pdf';

    // Retry fetching document base64 from Evolution API if not present in initial webhook payload
    if (!base64Doc) {
      const payloadToFetch = data || body || (documentObj ? { message: { documentMessage: documentObj } } : null);
      const keyToFetch = data?.key || body?.key;
      console.log(`[Webhook] Baixando base64 do documento/PDF diretamente da Evolution API (ID: ${keyToFetch?.id || 'direto'})...`);

      for (let attempt = 1; attempt <= 4; attempt++) {
        base64Doc = await getBase64FromMediaMessage(payloadToFetch, keyToFetch);
        if (base64Doc) break;
        if (attempt < 4) {
          console.log(`[Webhook] Documento/PDF ainda não disponível na Evolution API (tentativa ${attempt}/4). Aguardando ${attempt * 700}ms...`);
          await new Promise((r) => setTimeout(r, attempt * 700));
        }
      }
    }

    if (base64Doc) {
      try {
        const docAnalysis = await analyzeDocumentWithGemini(base64Doc, docFileName, docCaption, docMime);
        if (docAnalysis) {
          messageText = docCaption
            ? `${docCaption}\n[Documento/PDF Anexo "${docFileName}"]: ${docAnalysis}`
            : `[Documento/PDF Anexo "${docFileName}"]: ${docAnalysis}`;
          isDocumentAnalyzed = true;
          console.log(`[Webhook] Documento "${docFileName}" de ${cleanPhone} analisado com sucesso!`);
        } else {
          messageText = docCaption
            ? `${docCaption}\n[Documento PDF Recebido: ${docFileName}]`
            : `[Documento PDF Recebido: ${docFileName}]`;
        }
      } catch (err: any) {
        console.error('[Webhook] Falha ao analisar documento/PDF com IA:', err.message);
        messageText = docCaption
          ? `${docCaption}\n[Documento PDF Recebido: ${docFileName}]`
          : `[Documento PDF Recebido: ${docFileName}]`;
      }
    } else {
      // If base64 is still null, this is an incomplete preliminary event from Evolution API.
      // Do NOT send a generic reply with just the file name!
      console.warn('[Webhook] Documento/PDF sem base64 disponível na Evolution API. Ignorando evento preliminar para evitar mensagem genérica/duplicada.');
      if (messageId) processedMessageIds.delete(messageId);
      return;
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

  const extractedPushName =
    data?.pushName ||
    body?.pushName ||
    data?.message?.pushName ||
    body?.message?.pushName ||
    data?.senderName ||
    body?.senderName ||
    data?.verifiedBizName ||
    body?.verifiedBizName ||
    '';

  if (!lead) {
    const defaultStage = db.stages[0]?.id || 'stage-1';
    lead = {
      id: 'lead-' + Date.now(),
      name: extractedPushName || `Lead ${cleanPhone.slice(-4)}`,
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
    if (extractedPushName && (lead.name.startsWith('Lead ') || lead.name === `Lead ${cleanPhone.slice(-4)}`)) {
      lead.name = extractedPushName;
    }
  }

  // 3. Register incoming message in chat history
  let displayText = messageText.trim();
  if (isAudioTranscribed) {
    displayText = `🎤 [Áudio Transcrito]: "${messageText.trim()}"`;
  } else if (isImageAnalyzed && !displayText.startsWith('[')) {
    displayText = `📷 [Foto Recebida]: ${displayText}`;
  } else if (isDocumentAnalyzed && !displayText.startsWith('[')) {
    displayText = `📄 [Documento/PDF]: ${displayText}`;
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
    const aiResult = await processAiConversation(lead, messageText.trim(), leadHistory, {
      isAudioMessage,
      isImageMessage,
    });

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

    // Handle Urgency Detection
    if (aiResult.isUrgent) {
      lead.isUrgent = true;
      lead.urgencyReason = aiResult.urgencyReason || 'Paciente/lead relatou dor aguda ou situação crítica';
      if (!lead.tags.includes('URGENTE')) {
        lead.tags.unshift('URGENTE');
      }
      lead.notes = `${lead.notes || ''}\n🚨 [URGÊNCIA ${new Date().toLocaleTimeString('pt-BR')}]: ${lead.urgencyReason}`;
      console.log(`[Webhook 🚨 URGÊNCIA DETECTADA] Lead ${lead.name} (${cleanPhone}): ${lead.urgencyReason}`);
    }

    // Handle Hot Lead / Closing Request Detection (Pix, Payment, Contract, Buying intent)
    const hotKeywordsRegex = /\b(pix|chave pix|pagamento|pagar|link de pagamento|fechar|contrato|comprar|fazer o pagamento|passa a chave|manda o pix|dados bancarios|gerar fatura|boleto)\b/i;
    const isHotFromText = hotKeywordsRegex.test(messageText);
    if (aiResult.isHotLead || aiResult.sendPixInfo || isHotFromText) {
      lead.isHotLead = true;
      lead.hotReason = aiResult.hotReason || (aiResult.sendPixInfo ? 'Solicitou chave PIX / Pagamento' : 'Demonstrou forte intenção de fechamento / compra');
      if (!lead.tags.includes('🔥 LEAD QUENTE')) {
        lead.tags.unshift('🔥 LEAD QUENTE');
      }
      lead.notes = `${lead.notes || ''}\n🔥 [LEAD QUENTE ${new Date().toLocaleTimeString('pt-BR')}]: ${lead.hotReason}`;
      console.log(`[Webhook 🔥 LEAD QUENTE / FECHAMENTO] Lead ${lead.name} (${cleanPhone}): ${lead.hotReason}`);
    }

    // Handle Pre-appointment Triage Extraction
    if (aiResult.triage && (aiResult.triage.procedure || aiResult.triage.preferredPeriod || aiResult.triage.preferredDays)) {
      lead.triage = {
        ...(lead.triage || {}),
        procedure: aiResult.triage.procedure || lead.triage?.procedure,
        preferredPeriod: aiResult.triage.preferredPeriod || lead.triage?.preferredPeriod,
        preferredDays: aiResult.triage.preferredDays || lead.triage?.preferredDays,
        paymentType: aiResult.triage.paymentType || lead.triage?.paymentType || 'particular',
        convenioName: aiResult.triage.convenioName || lead.triage?.convenioName,
        isUrgent: aiResult.isUrgent || lead.isUrgent,
        urgencyReason: aiResult.urgencyReason || lead.urgencyReason,
        status: lead.triage?.status || 'pending_confirmation',
      };
      if (!lead.tags.includes('Triagem Agendada')) {
        lead.tags.push('Triagem Agendada');
      }
      lead.notes = `${lead.notes || ''}\n🗓️ [Triagem ${new Date().toLocaleDateString('pt-BR')}]: ${lead.triage.procedure || 'Consulta'} - Período: ${lead.triage.preferredPeriod || 'A definir'} (${lead.triage.preferredDays || 'dias flexíveis'})`;
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
    // Check if voice note (PTT) is enabled
    const voiceMode = db.agentConfig.voiceResponseMode || 'smart_discernment';
    const voiceEnabled = db.agentConfig.voiceResponseEnabled !== false && voiceMode !== 'only_text';
    const maxChars = db.agentConfig.maxAudioChars ?? 500;
    const maxConsecutive = db.agentConfig.maxConsecutiveAudios ?? 4;

    // Count consecutive audios sent recently to this lead
    const previousAiMessages = leadHistory.filter((m) => m.sender === 'ai');
    let consecutiveAudioCount = 0;
    for (let i = previousAiMessages.length - 1; i >= 0; i--) {
      if (previousAiMessages[i].text?.startsWith('🎙️ [Áudio de Voz Enviado]')) {
        consecutiveAudioCount++;
      } else {
        break;
      }
    }

    // Discernment determination:
    let shouldSendVoice = false;
    if (voiceEnabled) {
      if (voiceMode === 'always_audio') {
        shouldSendVoice = true;
      } else if (voiceMode === 'smart_discernment') {
        if (isAudioMessage) {
          // O cliente enviou áudio: responde SEMPRE em áudio por padrão no discernimento inteligente
          shouldSendVoice = true;
        } else {
          // Se o cliente enviou texto, a IA decide se é adequado mandar áudio (ex: sendAsVoice === true)
          // ou se o cliente pediu expressamente por áudio no texto
          const requestedVoiceInText = /áudio|audio|grava|voz|ouvir|fala comigo|manda voz/i.test(messageText);
          shouldSendVoice = requestedVoiceInText || aiResult.sendAsVoice === true;
        }
      }
    }

    // =========================================================================
    // TRAVAS INTELIGENTES DE ÁUDIO (Economia de tokens, clareza e anti-spam)
    // =========================================================================
    // Trava 1: Se a resposta for excessivamente longa (> maxChars), mandar em TEXTO
    const effectiveMaxChars = Math.max(maxChars, 450);
    if (shouldSendVoice && aiResult.replyText.length > effectiveMaxChars) {
      console.log(`[Trava de Áudio] Mensagem tem ${aiResult.replyText.length} caracteres (> limite ${effectiveMaxChars}). Forçando envio em TEXTO para clareza e economia.`);
      shouldSendVoice = false;
    }

    // Trava 2: Se atingiu o limite de áudios seguidos (ex: 4 seguidos), alternar para TEXTO
    if (shouldSendVoice && consecutiveAudioCount >= maxConsecutive) {
      console.log(`[Trava de Áudio] Limite atingido (${consecutiveAudioCount} áudios seguidos >= ${maxConsecutive}). Alternando para TEXTO.`);
      shouldSendVoice = false;
    }

    // Trava 3: Se houver PIX explícito, URLs ou e-mails, SEMPRE mandar em TEXTO para cópia fácil
    const hasTechnicalOrCopyableData =
      aiResult.sendPixInfo ||
      /https?:\/\/|[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(aiResult.replyText) ||
      /\b\d{10,}\b/.test(aiResult.replyText); // apenas números longos como telefones/contas/chaves com 10+ dígitos
    if (shouldSendVoice && hasTechnicalOrCopyableData) {
      console.log(`[Trava de Áudio] Conteúdo com dados copiáveis/PIX/links detectado. Forçando envio em TEXTO.`);
      shouldSendVoice = false;
    }

    if (shouldSendVoice) {
      console.log(`[Webhook] Gerando áudio de voz Sofia (${db.agentConfig.voiceEngine || 'native_sofia'}) para ${cleanPhone}...`);
      try {
        const speechRes = await synthesizeSpeech(aiResult.replyText, {
          engine: db.agentConfig.voiceEngine || 'native_sofia',
          voiceName: db.agentConfig.voiceVoiceName || 'pt-BR-FranciscaNeural',
          apiKey:
            db.agentConfig.voiceEngine === 'elevenlabs'
              ? db.agentConfig.elevenLabsApiKey
              : db.agentConfig.googleTtsApiKey,
        });

        if (speechRes.success && speechRes.audioBase64) {
          const voiceSendResult = await sendWhatsAppVoiceAudio(cleanPhone, speechRes.audioBase64);
          if (voiceSendResult.success) {
            aiMsg.text = `🎙️ [Áudio de Voz Enviado]: "${aiResult.replyText}"`;
            aiMsg.status = 'delivered';
          } else {
            console.warn('[Webhook] Envio de áudio na Evolution não teve sucesso. Disparando texto como garantia:', voiceSendResult.error);
            await sendWhatsAppMessage(cleanPhone, aiResult.replyText);
            aiMsg.status = 'delivered';
          }
        } else {
          // Fallback to text if speech synthesis fails
          console.warn('[Webhook] Falha ao sintetizar áudio, enviando texto:', speechRes.error);
          await sendWhatsAppMessage(cleanPhone, aiResult.replyText);
          aiMsg.status = 'delivered';
        }
      } catch (voiceErr: any) {
        console.warn('[Webhook] Erro no envio de áudio, caindo para texto:', voiceErr.message);
        await sendWhatsAppMessage(cleanPhone, aiResult.replyText);
        aiMsg.status = 'delivered';
      }
    } else {
      await sendWhatsAppMessage(cleanPhone, aiResult.replyText);
      aiMsg.status = 'delivered';
    }

    // 10. If the lead requested catalog/presentation and a PDF URL is configured, send the PDF document
    if (aiResult.sendCatalogPdf && db.agentConfig.catalogPdfUrl) {
      console.log(`[Webhook] Enviando PDF de apresentação para ${cleanPhone}...`);
      const pdfUrl = db.agentConfig.catalogPdfUrl;
      const pdfName = db.agentConfig.catalogPdfName || 'Apresentacao_Oficial_NEXA_CRM.pdf';
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

    // 11. If the lead requested PIX information, send copy-paste key box
    if (aiResult.sendPixInfo && db.agentConfig.pixKey) {
      console.log(`[Webhook] Enviando chave PIX oficial para ${cleanPhone}...`);
      const pixMessage = `💳 *Chave PIX Oficial NEXA CRM:*\n\`${db.agentConfig.pixKey}\`\n(Tipo: ${db.agentConfig.pixKeyType || 'E-mail'})\n\nAssim que efetuar o pagamento, basta me enviar o comprovante por aqui que já daremos andamento na sua ativação! ✨`;
      await sendWhatsAppMessage(cleanPhone, pixMessage);
      db.messages.push({
        id: 'msg-' + Date.now() + '-pix',
        leadId: lead.id,
        phone: cleanPhone,
        sender: 'ai',
        text: pixMessage,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      });
    }

    db.saveToFile();
  } catch (aiErr: any) {
    console.error('[Webhook] Falha ao gerar resposta da IA:', aiErr.message);

    // Resposta inteligente da base de conhecimento mesmo em caso de erro da API
    const fallbackResult = generateRuleBasedSafetyReply(messageText);
    const fallbackText = fallbackResult.replyText;

    const aiFallbackMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-ai',
      leadId: lead.id,
      phone: cleanPhone,
      sender: 'ai',
      text: fallbackText,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      stageTriggered: fallbackResult.stageTriggered,
      extractedInfo: fallbackResult.extractedInfo,
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
} finally {
  phoneInFlight.delete(cleanPhone);
}
}
