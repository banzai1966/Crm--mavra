import fs from 'fs';
import path from 'path';
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
  sendWhatsAppImage,
  getBase64FromMediaMessage,
  normalizeInstanceName,
} from './evolution';
import { Lead, ChatMessage } from '../src/types';
import {
  getAgentConfigForInstance,
  getCompanyPresetByInstance,
  normalizeWorkspaceKey,
  resolveLeadWorkspaceId,
} from './companyConfigs';

// In-memory cache for processed message IDs to prevent double processing & infinite duplicate loops
const processedMessageIds = new Map<string, number>();
// In-memory debounce cache (instance + phone + text hash -> timestamp) to prevent duplicate webhook dispatches
const recentMessageFingerprints = new Map<string, number>();
// In-memory lock per instance+phone to prevent concurrent processing of the same conversation
const phoneInFlight = new Set<string>();

let lastWebhookTimestamp = 0;

export function isWebhookActive(): boolean {
  return Date.now() - lastWebhookTimestamp < 60000;
}

export function isDuplicateMessage(messageId?: string): boolean {
  if (!messageId) return false;
  const now = Date.now();

  // Garbage collect entries older than 5 minutes
  if (processedMessageIds.size > 250) {
    for (const [id, time] of processedMessageIds.entries()) {
      if (now - time > 300000) {
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

function isDuplicateContent(phone: string, text: string, instanceKey: string = 'default'): boolean {
  if (!phone || !text) return false;
  const now = Date.now();

  // Garbage collect entries older than 30 seconds
  if (recentMessageFingerprints.size > 200) {
    for (const [key, time] of recentMessageFingerprints.entries()) {
      if (now - time > 30000) {
        recentMessageFingerprints.delete(key);
      }
    }
  }

  const normalized = `${instanceKey}:${phone}:${text.trim().toLowerCase().slice(0, 100)}`;
  const lastTime = recentMessageFingerprints.get(normalized);
  if (lastTime && now - lastTime < 10000) {
    // Exact same message from same phone on same instance received within 10 seconds (webhook duplicate)
    return true;
  }

  recentMessageFingerprints.set(normalized, now);
  return false;
}

export function isWithinBusinessHours(config: any): boolean {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short',
    }).formatToParts(now);

    let hour = 0;
    let minute = 0;
    let weekdayStr = 'Mon';
    for (const part of parts) {
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
      if (part.type === 'weekday') weekdayStr = part.value;
    }

    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dayOfWeek = weekdayMap[weekdayStr] ?? now.getDay();

    const allowedDays: number[] = config.businessDays && Array.isArray(config.businessDays) && config.businessDays.length > 0
      ? config.businessDays
      : [1, 2, 3, 4, 5]; // Segunda a Sexta por padrão

    if (!allowedDays.includes(dayOfWeek)) {
      return false; // Fora dos dias úteis (fim de semana ou folga)
    }

    const startStr = config.businessHoursStart || '08:00';
    const endStr = config.businessHoursEnd || '18:00';
    const [startH, startM] = startStr.split(':').map((v: string) => parseInt(v, 10) || 0);
    const [endH, endM] = endStr.split(':').map((v: string) => parseInt(v, 10) || 0);

    const currentMinutes = hour * 60 + minute;
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } catch (e) {
    return true;
  }
}

export function handleIncomingWebhook(body: any, fallbackInstance?: string): void {
  // CRITICAL: We execute the entire pipeline inside setImmediate / background async queue
  // so the caller function in server.ts has already returned HTTP 200 within <5ms.
  setImmediate(async () => {
    try {
      await executeWebhookPipeline(body, fallbackInstance);
    } catch (err) {
      console.error('[Webhook Background Error]:', err);
    }
  });
}

async function executeWebhookPipeline(body: any, fallbackInstance?: string): Promise<void> {
  if (!body) return;

  const rawEvent = (body.event || body.type || 'webhook').toString().toLowerCase();
  const normalizedEvent = rawEvent.replace(/[._]/g, '.');

  // Strictly ignore status updates, acks, sending confirmations, presence updates, and connection pings
  if (
    normalizedEvent === 'messages.update' ||
    normalizedEvent === 'message.update' ||
    normalizedEvent === 'message.ack' ||
    normalizedEvent === 'send.message' ||
    normalizedEvent === 'presence.update' ||
    normalizedEvent === 'chats.update' ||
    normalizedEvent === 'contacts.update' ||
    normalizedEvent === 'connection.update' ||
    normalizedEvent === 'qrcode.updated'
  ) {
    return;
  }

  // 1. Detect and parse Evolution API v2 event payload
  lastWebhookTimestamp = Date.now();
  const rawData = body.data || body;
  const data = Array.isArray(rawData) ? rawData[0] : rawData;
  if (!data) return;

  // Key details
  const key = data?.key || body?.key;
  const isFromMe = key?.fromMe === true;

  // Ignore outbound messages from the bot/instance to prevent echo loops
  if (isFromMe) {
    db.logWebhookEvent({
      event: rawEvent,
      status: 'ignored_from_me',
      details: 'Mensagem enviada pelo próprio bot/instância (fromMe=true)',
      rawPayloadSnippet: JSON.stringify(body).slice(0, 150),
    });
    return;
  }

  // Check and discard duplicate events sent by Evolution API retries
  const messageId = key?.id || data?.id || body?.id || data?.messageId;
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
      event: rawEvent,
      status: 'ignored_group',
      details: `Mensagem de grupo ignorada: ${rawJid}`,
    });
    return;
  }

  // Clean phone: remove @s.whatsapp.net and keep only digits
  const cleanPhone = rawJid.replace(/@.*$/, '').replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 8) {
    db.logWebhookEvent({
      event: rawEvent,
      senderPhone: cleanPhone,
      status: 'error',
      details: `Número de telefone não identificado no payload (rawJid: ${rawJid})`,
      rawPayloadSnippet: JSON.stringify(body).slice(0, 200),
    });
    return;
  }

  // Extract and strictly normalize instance name from webhook payload, URL route, or fallback
  const rawInstance = (
    body?.instance ||
    data?.instance ||
    body?.instanceName ||
    data?.instanceName ||
    fallbackInstance ||
    db.evolutionConfig.instanceName ||
    'primo-equipamentos'
  ).toString().trim();

  const incomingInstance = normalizeInstanceName(rawInstance);

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

  let incomingAudioDataUrl: string | undefined = undefined;

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
      console.log(`[Webhook] Baixando base64 do áudio da Evolution API (${incomingInstance}, ID: ${keyToFetch?.id || 'direto'})...`);

      for (let attempt = 1; attempt <= 2; attempt++) {
        base64Audio = await getBase64FromMediaMessage(payloadToFetch, keyToFetch, incomingInstance);
        if (base64Audio) break;
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }

    if (base64Audio) {
      incomingAudioDataUrl = base64Audio.startsWith('data:') ? base64Audio : `data:${mimeType};base64,${base64Audio}`;
      try {
        const transcribedText = await transcribeAudioWithGemini(base64Audio, mimeType);
        if (transcribedText) {
          messageText = transcribedText;
          isAudioTranscribed = true;
          console.log(`[Webhook] Áudio de ${cleanPhone} transcrito com sucesso: "${messageText}"`);
        } else {
          console.warn('[Webhook] Transcrição do áudio retornou vazia. Solicitando mensagem em texto com cordialidade.');
          messageText = '[Áudio recebido, mas não foi possível transcrever]';
          isAudioTranscribed = false;
        }
      } catch (err: any) {
        console.error('[Webhook] Falha ao transcrever áudio com Gemini:', err.message);
        messageText = '[Áudio recebido, mas não foi possível transcrever]';
        isAudioTranscribed = false;
      }
    } else {
      console.warn('[Webhook] Arquivo de áudio não disponível na Evolution API. Solicitando mensagem em texto.');
      messageText = '[Áudio recebido, mas não foi possível transcrever]';
      isAudioTranscribed = false;
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
      event: rawEvent,
      senderPhone: cleanPhone,
      status: 'no_text',
      details: isAudioMessage
        ? 'Áudio recebido, mas sem base64 disponível ou não foi possível transcrever.'
        : 'Payload recebido sem texto reconhecível (mídia sem legenda ou evento de presença)',
      rawPayloadSnippet: JSON.stringify(body).slice(0, 200),
    });
    return;
  }

  const targetWorkspaceId = normalizeWorkspaceKey(incomingInstance);

  // Deduplication check by content: if the exact same message from this phone on this instance arrived in <10s, discard
  if (isDuplicateContent(cleanPhone, messageText, targetWorkspaceId)) {
    console.log(`[Webhook] Mensagem duplicada de ${cleanPhone} (${incomingInstance}) ignorada pelo filtro anti-duplicação (<10s): "${messageText.slice(0, 40)}"`);
    return;
  }

  console.log(`[Webhook] Mensagem recebida de ${cleanPhone} [Box: ${targetWorkspaceId} | Instância: ${incomingInstance}]: "${messageText.slice(0, 50)}..."`);

  // Log successful reception
  db.logWebhookEvent({
    event: rawEvent,
    senderPhone: cleanPhone,
    messageText: `[${incomingInstance}] ${messageText.trim()}`,
    status: 'processed',
    details: `Processando com IA Sofia (${targetWorkspaceId}) e funil de CRM isolado`,
  });

  // 2. Find or create lead in CRM database STRICTLY SCOPED to targetWorkspaceId!
  // This guarantees that testing with the same WhatsApp number on Instance 1 and Instance 2 never mixes leads or chats.
  let lead = db.leads.find(
    (l) => l.phone === cleanPhone && resolveLeadWorkspaceId(l) === targetWorkspaceId
  );

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

  const companyPreset = getCompanyPresetByInstance(incomingInstance);
  const instanceTag = `Instância: ${incomingInstance}`;
  const companyTag = companyPreset.companyName;

  if (!lead) {
    const defaultStage = db.stages.find((s) => s.id === 'stage-1')?.id || db.stages[0]?.id || 'stage-1';
    lead = {
      id: `lead-${targetWorkspaceId}-${Date.now()}`,
      name: extractedPushName || `Lead ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      stageId: defaultStage,
      value: 0,
      interest: `Novo contato via WhatsApp (${companyPreset.companyName})`,
      tags: ['WhatsApp', instanceTag, companyTag],
      notes: `Lead recebido pela instância "${incomingInstance}" (${companyPreset.companyName}).`,
      aiPaused: false,
      lastInteraction: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      unreadCount: 1,
      workspaceId: targetWorkspaceId,
      instanceName: incomingInstance,
    };
    db.leads.unshift(lead);
  } else {
    lead.workspaceId = targetWorkspaceId;
    lead.instanceName = incomingInstance;
    lead.lastInteraction = new Date().toISOString();
    lead.unreadCount = (lead.unreadCount || 0) + 1;
    if (extractedPushName && (lead.name.startsWith('Lead ') || lead.name === `Lead ${cleanPhone.slice(-4)}`)) {
      lead.name = extractedPushName;
    }
    if (!lead.tags.includes(instanceTag)) {
      lead.tags.push(instanceTag);
    }
    if (!lead.tags.includes(companyTag)) {
      lead.tags.push(companyTag);
    }
  }

  // 3. Register incoming message in chat history (scoped to leadId and workspaceId)
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
    mediaType: isAudioMessage ? 'audio' : undefined,
    mediaUrl: incomingAudioDataUrl,
    timestamp: new Date().toISOString(),
    status: 'delivered',
    workspaceId: targetWorkspaceId,
    instanceName: incomingInstance,
  };
  db.messages.push(incomingMsg);
  db.saveToFile();

  const activeInstanceConfig = getAgentConfigForInstance(incomingInstance);

  // 4. Check Global AI Switch (ON / OFF)
  if (activeInstanceConfig.isGlobalAiActive === false || db.agentConfig.isGlobalAiActive === false) {
    console.log(`[Webhook] IA Global DESLIGADA no painel. Ignorando resposta automática para ${cleanPhone}.`);
    db.logWebhookEvent({
      event: rawEvent,
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
        event: rawEvent,
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

  // 4d. Check Automatic Operating Schedule (Escala de Horários & Modo Fora de Expediente)
  if (db.agentConfig.operatingScheduleEnabled) {
    const isBusinessHours = isWithinBusinessHours(db.agentConfig);
    const scheduleMode = db.agentConfig.operatingScheduleMode || 'outside_hours_only';

    if (scheduleMode === 'outside_hours_only' && isBusinessHours) {
      console.log(`[Webhook] HORÁRIO COMERCIAL ATIVO (Equipe Humana no Expediente): IA pausada automaticamente para ${cleanPhone} até o fim do expediente.`);
      db.logWebhookEvent({
        event: rawEvent,
        senderPhone: cleanPhone,
        status: 'ignored_from_me',
        details: 'Horário comercial ativo: atendimento realizado pela equipe humana / secretária. IA entrará automaticamente no plantão fora de expediente.',
      });
      return;
    }

    if (scheduleMode === 'business_hours_only' && !isBusinessHours) {
      console.log(`[Webhook] FORA DO HORÁRIO COMERCIAL: Modo restrito ao expediente comercial. IA não responderá à noite.`);
      return;
    }
  }

  // 5. Query chat history for this lead
  const leadHistory = db.messages.filter((m) => m.leadId === lead!.id);

  // 6. Process with Multi-IA Engine (Gemini / OpenAI / Anthropic)
  try {
    const aiResult = await processAiConversation(lead, messageText.trim(), leadHistory, {
      isAudioMessage,
      isImageMessage,
      instanceName: incomingInstance,
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
    } else if (lead.stageId === 'stage-base' || lead.stageId === 'stage-reativacao' || lead.tags.includes('Base Antiga') || lead.tags.includes('Reativação')) {
      // Se o lead estava na base de reativação e respondeu, avança automaticamente para Qualificado / Interesse
      const qualifiedStage = db.stages.find((s) => s.id === 'stage-2') || db.stages[1] || db.stages[0];
      if (qualifiedStage && qualifiedStage.id !== lead.stageId) {
        lead.stageId = qualifiedStage.id;
        stageTriggered = qualifiedStage.id;
        if (!lead.tags.includes('Reativado com Sucesso')) {
          lead.tags.push('Reativado com Sucesso');
        }
        lead.notes = `${lead.notes || ''}\n🔄 [REATIVAÇÃO DE BASE ${new Date().toLocaleTimeString('pt-BR')}]: Paciente inativo respondeu e avançou para "${qualifiedStage.name}"!`;
        console.log(`[Webhook 🔄 REATIVAÇÃO DE BASE SUCESSO] ${lead.name} (${cleanPhone}) respondeu e avançou para ${qualifiedStage.name}!`);
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
      if (aiResult.extractedInfo.tag) {
        if (!lead.tags.includes(aiResult.extractedInfo.tag)) {
          lead.tags.push(aiResult.extractedInfo.tag);
        }
      }
      if (aiResult.extractedInfo.channelOrigin === 'mentoria_vip' || /candidatura vip|mentoria|cro\b/i.test(messageText)) {
        if (!lead.tags.includes('Mentoria VIP')) {
          lead.tags.push('Mentoria VIP');
        }
        lead.notes = `${lead.notes || ''}\n🎓 [MENTORIA VIP ${new Date().toLocaleTimeString('pt-BR')}]: Cirurgião-dentista aplicando para a turma seletiva da Mentoria Dra. Luci Murata.`;
      } else if (aiResult.extractedInfo.channelOrigin === 'consultorio_clinica' || /consulta|consultorio|dente|dor|sorriso|euroville/i.test(messageText)) {
        if (!lead.tags.includes('Paciente Consultório') && !lead.tags.includes('Mentoria VIP')) {
          lead.tags.push('Paciente Consultório');
        }
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

    // Handle Explicit Human Handoff (Transbordo Humano quando o cliente insistiu ou caso delicado)
    if (aiResult.requestHuman) {
      lead.aiPaused = true;
      if (!lead.tags.includes('#Humano')) {
        lead.tags.unshift('#Humano');
      }
      lead.notes = `${lead.notes || ''}\n👤 [TRANSBORDO HUMANO ${new Date().toLocaleTimeString('pt-BR')}]: ${aiResult.humanHandoffReason || 'Cliente solicitou atendimento humano direto'}`;
      console.log(`[Webhook 👤 TRANSBORDO HUMANO] Lead ${lead.name} (${cleanPhone}) direcionado para secretária humana: ${aiResult.humanHandoffReason}`);
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
      if (!lead.tags.includes('Triagem Registrada')) {
        lead.tags.push('Triagem Registrada');
      }
      lead.notes = `${lead.notes || ''}\n🗓️ [Triagem ${new Date().toLocaleDateString('pt-BR')}]: ${lead.triage.procedure || 'Consulta'} - Período: ${lead.triage.preferredPeriod || 'A definir'} (${lead.triage.preferredDays || 'dias flexíveis'})`;
    }

    // 7c. Update Long-Term Episodic Customer Memory ("DNA Cognitivo do Cliente")
    if (aiResult.cognitiveProfile) {
      const prevDna = lead.cognitiveProfile || {};
      const mergedPrefs = Array.from(
        new Set([...(prevDna.preferences || []), ...(aiResult.cognitiveProfile.preferences || [])].filter(Boolean))
      ).slice(0, 8);
      const mergedRestrictions = Array.from(
        new Set([
          ...(prevDna.restrictionsOrObjections || []),
          ...(aiResult.cognitiveProfile.restrictionsOrObjections || []),
        ].filter(Boolean))
      ).slice(0, 6);

      lead.cognitiveProfile = {
        preferences: mergedPrefs,
        restrictionsOrObjections: mergedRestrictions,
        recurringHabits: aiResult.cognitiveProfile.recurringHabits || prevDna.recurringHabits,
        vipNotes: aiResult.cognitiveProfile.vipNotes || prevDna.vipNotes,
        updatedAt: new Date().toISOString(),
      };
    }

    // 7d. Handle Automatic Pix Payment / Receipt Verification (Multimodal Vision / PDF / Confirmation)
    const isReceiptTextMatch =
      /\b(comprovante|pix enviado|paguei|acabei de pagar|pagamento realizado|transferência realizada)\b/i.test(messageText) &&
      (isImageAnalyzed || isDocumentAnalyzed || /\b(r\$|reais|pix|comprovante)\b/i.test(messageText));

    if (aiResult.paymentConfirmation?.isPixPaid || isReceiptTextMatch) {
      const paidVal = aiResult.paymentConfirmation?.paidAmount || lead.value || 0;
      lead.paymentInfo = {
        isPaid: true,
        paidAmount: paidVal,
        paidAt: new Date().toISOString(),
        method: 'pix',
        receiptSummary:
          aiResult.paymentConfirmation?.receiptSummary ||
          `Comprovante PIX validado automaticamente pela IA (${paidVal > 0 ? `R$ ${paidVal}` : 'Valor integral'})`,
      };
      if (!lead.tags.includes('✅ Pix Confirmado IA')) {
        lead.tags.push('✅ Pix Confirmado IA');
      }
      if (!lead.deliveryInfo) {
        lead.stageId = 'stage-4'; // Fechado / Ganho / Pago
      }
      lead.notes = `${lead.notes || ''}\n💳 [PAGAMENTO PIX VALIDADO PELA IA ${new Date().toLocaleTimeString('pt-BR')}]: ${lead.paymentInfo.receiptSummary}`;
      console.log(`[Webhook 💳 PIX VALIDADO PELA IA] Lead ${lead.name} (${cleanPhone}) teve o comprovante validado automaticamente!`);
    }

    // Handle Automatic Delivery / Food Order Detection & Smart Freight Calculation
    const isFoodOrDeliveryContext =
      aiResult.deliveryOrder?.isDeliveryOrder ||
      (db.agentConfig.followUpNiche === 'restaurant_delivery') ||
      (db.agentConfig.personaName?.toLowerCase().includes('pizzaria') || (db.agentConfig.role || '').toLowerCase().includes('delivery') || (db.agentConfig.role || '').toLowerCase().includes('restaurante')) ||
      /\b(pedido|pizza|burger|hambúrguer|lanche|combo|marmita|marmitex|sushi|temaki|refrigerante|coca|guaraná|batata|borda|delivery|endereço|rua|entregar)\b/i.test(messageText);

    if (isFoodOrDeliveryContext && (aiResult.deliveryOrder?.itemsDescription || /\b(pedido|pizza|burger|hambúrguer|combo|marmita|marmitex|sushi|porção)\b/i.test(messageText))) {
      const defaultPin = cleanPhone.slice(-4) || '1234';
      const addressText = (aiResult.deliveryOrder?.deliveryAddress || messageText || '').toLowerCase();
      const zones = db.agentConfig.deliveryZones || [];
      const matchedZone = zones.find((z) =>
        z.keywords
          .toLowerCase()
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean)
          .some((kw) => addressText.includes(kw))
      );

      const subtotal = aiResult.deliveryOrder?.subtotalValue || aiResult.deliveryOrder?.orderValue || lead.value || 65;
      const freeAbove = db.agentConfig.freeShippingMinimum || 0;
      const calculatedFee =
        freeAbove > 0 && subtotal >= freeAbove
          ? 0
          : aiResult.deliveryOrder?.deliveryFee ?? (matchedZone ? matchedZone.fee : 8);
      const totalWithFee = subtotal + calculatedFee;

      if (!lead.deliveryInfo) {
        lead.deliveryInfo = {
          orderNumber: aiResult.deliveryOrder?.orderNumber || `PED-${Math.floor(1000 + Math.random() * 9000)}`,
          itemsDescription: aiResult.deliveryOrder?.itemsDescription || aiResult.extractedInfo?.interest || lead.interest || 'Pedido Delivery Recebido',
          deliveryAddress: aiResult.deliveryOrder?.deliveryAddress || 'Endereço informado no WhatsApp',
          deliveryNeighborhood: aiResult.deliveryOrder?.deliveryNeighborhood || matchedZone?.regionName || 'Região Central',
          subtotalValue: subtotal,
          deliveryFee: calculatedFee,
          motoboyName: 'Carlos Motoboy',
          motoboyPhone: '5511999887766',
          motoboyPlate: 'ABC-1234',
          etaMinutes: aiResult.deliveryOrder?.etaMinutes || matchedZone?.etaMinutes || 25,
          dispatchedAt: new Date().toISOString(),
          status: 'preparing',
          verificationCode: defaultPin,
        };
        if (!lead.tags.includes('🍔 Restaurante/Delivery')) {
          lead.tags.push('🍔 Restaurante/Delivery');
        }
        if (!lead.tags.includes('📦 Na Cozinha')) {
          lead.tags.push('📦 Na Cozinha');
        }
        if (lead.stageId === 'stage-1') {
          lead.stageId = 'stage-2'; // Na Cozinha / Preparo
        }
        lead.value = totalWithFee;
        lead.notes = `${lead.notes || ''}\n🍕 [PEDIDO DELIVERY AUTOMÁTICO ${new Date().toLocaleTimeString('pt-BR')}]: Pedido #${lead.deliveryInfo.orderNumber} (Subtotal: R$ ${subtotal.toFixed(2)} + Entrega: R$ ${calculatedFee.toFixed(2)} = R$ ${totalWithFee.toFixed(2)}) enviado para a cozinha! PIN: ${defaultPin}`;
        console.log(`[Webhook 🍕 NOVO PEDIDO DELIVERY] Lead ${lead.name} (${cleanPhone}) gerou pedido #${lead.deliveryInfo.orderNumber} na cozinha!`);
      } else if (aiResult.deliveryOrder?.deliveryAddress && (!lead.deliveryInfo.deliveryAddress || lead.deliveryInfo.deliveryAddress.includes('confirmar') || lead.deliveryInfo.deliveryAddress.includes('informado'))) {
        lead.deliveryInfo.deliveryAddress = aiResult.deliveryOrder.deliveryAddress;
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
      providerUsed: aiResult.providerUsed,
      modelUsed: aiResult.modelUsed,
      workspaceId: targetWorkspaceId,
      instanceName: incomingInstance,
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
        shouldSendVoice = isAudioTranscribed === true;
      } else if (voiceMode === 'smart_discernment') {
        if (isAudioMessage) {
          // Se o áudio foi transcrito com sucesso, responde em áudio; caso contrário, responde em texto cordial
          shouldSendVoice = isAudioTranscribed === true;
        } else {
          // Se o cliente enviou texto, a IA decide se é adequado mandar áudio (ex: sendAsVoice === true)
          // ou se o cliente pediu expressamente por áudio no texto
          const requestedVoiceInText = /áudio|audio|grava|voz|ouvir|fala comigo|manda voz/i.test(messageText);
          shouldSendVoice = requestedVoiceInText || aiResult.sendAsVoice === true;
        }
      }
    }

    if (messageText.includes('[Áudio recebido, mas não foi possível transcrever]')) {
      shouldSendVoice = false;
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

    const instanceConfig = getAgentConfigForInstance(incomingInstance);

    if (shouldSendVoice) {
      console.log(`[Webhook] Gerando áudio de voz Sofia (${instanceConfig.voiceEngine || 'native_sofia'}) para ${cleanPhone} (Instância: ${incomingInstance})...`);
      try {
        const speechRes = await synthesizeSpeech(aiResult.replyText, {
          engine: instanceConfig.voiceEngine || 'native_sofia',
          voiceName: instanceConfig.voiceVoiceName || 'pt-BR-FranciscaNeural',
          speed: instanceConfig.voiceSpeed || 0.90,
          apiKey:
            instanceConfig.voiceEngine === 'elevenlabs'
              ? instanceConfig.elevenLabsApiKey
              : instanceConfig.googleTtsApiKey,
        });

        if (speechRes.success && speechRes.audioBase64) {
          const voiceSendResult = await sendWhatsAppVoiceAudio(cleanPhone, speechRes.audioBase64, incomingInstance);
          if (voiceSendResult.success) {
            aiMsg.text = `🎙️ [Áudio de Voz Enviado]: "${aiResult.replyText}"`;
            aiMsg.mediaType = 'audio';
            aiMsg.mediaUrl = speechRes.audioBase64.startsWith('data:')
              ? speechRes.audioBase64
              : `data:audio/mp3;base64,${speechRes.audioBase64}`;
            aiMsg.status = 'delivered';
          } else {
            console.warn('[Webhook] Envio de áudio na Evolution não teve sucesso. Disparando texto como garantia:', voiceSendResult.error);
            await sendWhatsAppMessage(cleanPhone, aiResult.replyText, incomingInstance);
            aiMsg.status = 'delivered';
          }
        } else {
          // Fallback to text if speech synthesis fails
          console.warn('[Webhook] Falha ao sintetizar áudio, enviando texto:', speechRes.error);
          await sendWhatsAppMessage(cleanPhone, aiResult.replyText, incomingInstance);
          aiMsg.status = 'delivered';
        }
      } catch (voiceErr: any) {
        console.warn('[Webhook] Erro no envio de áudio, caindo para texto:', voiceErr.message);
        await sendWhatsAppMessage(cleanPhone, aiResult.replyText, incomingInstance);
        aiMsg.status = 'delivered';
      }
    } else {
      await sendWhatsAppMessage(cleanPhone, aiResult.replyText, incomingInstance);
      aiMsg.status = 'delivered';
    }

    // 10. If the lead requested catalog/presentation and a PDF URL is strictly configured for THIS instance, send the PDF document
    const targetPdfUrl = instanceConfig.catalogPdfUrl;
    if (aiResult.sendCatalogPdf && targetPdfUrl) {
      console.log(`[Webhook] Enviando PDF de apresentação exclusivo para ${cleanPhone} (${incomingInstance}): ${targetPdfUrl}`);
      const pdfUrl = targetPdfUrl;
      const pdfName = instanceConfig.catalogPdfName || 'Catalogo_Apresentacao.pdf';
      await sendWhatsAppMedia(
        cleanPhone,
        pdfUrl,
        pdfName,
        'Segue em anexo nossa apresentação oficial em PDF com todos os detalhes!',
        incomingInstance
      );
      db.messages.push({
        id: 'msg-' + Date.now() + '-pdf',
        leadId: lead.id,
        phone: cleanPhone,
        sender: 'ai',
        text: `📄 [Documento Enviado]: "${pdfName}"`,
        mediaType: 'pdf',
        mediaUrl: pdfUrl,
        fileName: pdfName,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      });
    }

    // 10b. If the lead specifically asked for photos of Equipamentos PSI, send high-res photo directly via WhatsApp
    const isPsiWorkspace = incomingInstance === 'equipamentospsi' || targetWorkspaceId === 'equipamentospsi' || (instanceConfig.role || '').includes('Equipamentos PSI');
    const userAskedForPhoto = /foto|imagem|fotos|imagens|aparelho|estimulador/i.test(messageText);

    if (isPsiWorkspace && userAskedForPhoto) {
      const lower = messageText.toLowerCase();
      let photoFileName = 'barra-de-luz-grande-74cm.jpg';
      let photoCaption = 'Barra de Luz Tradicional (74cm) com Tripé Metálico Regulável — Equipamentos PSI';

      if (lower.includes('tatil') || lower.includes('tátil') || lower.includes('pulser') || lower.includes('buzzer')) {
        photoFileName = 'aparelho-tatil-pulsers.jpg';
        photoCaption = 'Aparelho Tátil Digital com Pulsers Ergonômicos Vibratórios — Equipamentos PSI';
      } else if (lower.includes('baby') || lower.includes('51') || lower.includes('portatil') || lower.includes('portátil')) {
        photoFileName = 'barra-de-luz-baby-51cm.jpg';
        photoCaption = 'Barra de Luz Baby (51cm) Compacta e Portátil — Equipamentos PSI';
      }

      const photoPath = path.join(process.cwd(), 'public', 'assets', 'psi', photoFileName);
      if (fs.existsSync(photoPath)) {
        try {
          const photoBase64 = fs.readFileSync(photoPath).toString('base64');
          console.log(`[Webhook] Enviando foto real (${photoFileName}) do equipamento para ${cleanPhone}...`);
          await sendWhatsAppImage(cleanPhone, `data:image/jpeg;base64,${photoBase64}`, photoCaption, incomingInstance);
          db.messages.push({
            id: 'msg-' + Date.now() + '-photo',
            leadId: lead.id,
            phone: cleanPhone,
            sender: 'ai',
            text: `📷 [Foto Enviada]: ${photoCaption}`,
            mediaType: 'image',
            mediaUrl: `/assets/psi/${photoFileName}`,
            timestamp: new Date().toISOString(),
            status: 'delivered',
            workspaceId: targetWorkspaceId,
            instanceName: incomingInstance,
          });
        } catch (imgSendErr: any) {
          console.warn('[Webhook] Falha ao enviar foto do equipamento:', imgSendErr.message);
        }
      }
    }

    // 11. If the lead requested PIX information, send copy-paste key box
    const targetPixKey = instanceConfig.pixKey || db.agentConfig.pixKey;
    if (aiResult.sendPixInfo && targetPixKey) {
      console.log(`[Webhook] Enviando chave PIX oficial para ${cleanPhone} (${incomingInstance})...`);
      const pixType = instanceConfig.pixKeyType || db.agentConfig.pixKeyType || 'E-mail';
      const pixMessage = `💳 *Chave PIX Oficial (${pixType}):*\n\`${targetPixKey}\`\n\nAssim que efetuar o pagamento, basta me enviar o comprovante por aqui! ✨`;
      await sendWhatsAppMessage(cleanPhone, pixMessage, incomingInstance);
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

    // 12. Disparo de Áudio Real Pré-Gravado do Especialista / Dono (Decisão Contextual da IA)
    if (aiResult.dispatchPreRecordedAudioId && db.agentConfig.preRecordedAudiosEnabled !== false) {
      const audioToDispatch = (db.agentConfig.preRecordedAudios || []).find(
        (a) => a.id === aiResult.dispatchPreRecordedAudioId && a.enabled
      );

      if (audioToDispatch) {
        console.log(`[Webhook 🎧 Áudio Real Humanizado] Disparando "${audioToDispatch.title}" (${audioToDispatch.speakerName}) para ${cleanPhone}...`);

        lead.dispatchedAudioIds = lead.dispatchedAudioIds || [];
        if (!lead.dispatchedAudioIds.includes(audioToDispatch.id)) {
          lead.dispatchedAudioIds.push(audioToDispatch.id);
        }

        const audioData = audioToDispatch.audioBase64 || audioToDispatch.audioUrl;
        if (audioData) {
          try {
            await sendWhatsAppVoiceAudio(cleanPhone, audioData, incomingInstance);
          } catch (audioSendErr: any) {
            console.warn('[Webhook] Falha ao disparar áudio pré-gravado para WhatsApp:', audioSendErr.message);
          }
        }

        db.messages.push({
          id: 'msg-' + Date.now() + '-real-audio',
          leadId: lead.id,
          phone: cleanPhone,
          sender: 'ai',
          text: `🎧 [Áudio Real de ${audioToDispatch.speakerName}]: "${audioToDispatch.title}" (${audioToDispatch.durationSeconds || 15}s)`,
          mediaUrl: audioToDispatch.audioUrl || (audioToDispatch.audioBase64 ? 'audio-real' : undefined),
          mediaType: 'audio',
          timestamp: new Date().toISOString(),
          status: 'delivered',
        });
      }
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
    await sendWhatsAppMessage(cleanPhone, fallbackText, incomingInstance);

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
