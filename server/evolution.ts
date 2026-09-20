import { db } from './db';

export function sanitizeEvolutionUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  // If the user inadvertently copied the label text or other characters into the field
  const match = cleaned.match(/https?:\/\/[^\s"'<>]+/i);
  if (match) {
    cleaned = match[0];
  }
  return cleaned.replace(/\/+$/, '');
}

export interface EvolutionSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  phone: string,
  text: string
): Promise<EvolutionSendResult> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);

  // Format clean digits phone
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) {
    return { success: false, error: 'Telefone inválido ou ausente' };
  }

  // If URL or API key is not configured or placeholder, log and return simulated delivery
  const isDummyUrl =
    !baseUrl ||
    baseUrl.includes('seuservidor.com') ||
    baseUrl.includes('exemplo');

  if (isDummyUrl || !config.apiKey) {
    console.log(
      `[Evolution API Simulada] Mensagem enviada para ${cleanPhone}: "${text.slice(0, 60)}..."`
    );
    return {
      success: true,
      messageId: 'simulated-' + Date.now(),
    };
  }

  try {
    const typingDelay = db.agentConfig.typingDelayMs || 1500;
    const endpoint = `${baseUrl}/message/sendText/${encodeURIComponent(config.instanceName.trim())}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey.trim(),
      },
      body: JSON.stringify({
        number: cleanPhone,
        text: text,
        delay: typingDelay, // configurable human typing latency
        linkPreview: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Evolution API HTTP ${response.status}:`, errText);
      return {
        success: false,
        error: `Evolution API HTTP ${response.status}: ${errText.slice(0, 100)}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data?.key?.id || data?.id || 'msg-' + Date.now(),
    };
  } catch (err: any) {
    console.error('Falha ao conectar na Evolution API:', err.message);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function sendWhatsAppMedia(
  phone: string,
  mediaUrl: string,
  fileName: string,
  caption?: string
): Promise<EvolutionSendResult> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const cleanPhone = phone.replace(/\D/g, '');

  if (!cleanPhone || !mediaUrl) {
    return { success: false, error: 'Telefone ou URL do documento ausente' };
  }

  const isDummyUrl = !baseUrl || baseUrl.includes('seuservidor.com') || baseUrl.includes('exemplo');
  if (isDummyUrl || !config.apiKey) {
    console.log(`[Evolution API Simulada] Documento PDF enviado para ${cleanPhone}: "${fileName}" (${mediaUrl})`);
    return { success: true, messageId: 'simulated-media-' + Date.now() };
  }

  try {
    const endpoint = `${baseUrl}/message/sendMedia/${encodeURIComponent(config.instanceName.trim())}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey.trim(),
      },
      body: JSON.stringify({
        number: cleanPhone,
        mediatype: 'document',
        mimetype: 'application/pdf',
        caption: caption || '',
        media: mediaUrl,
        fileName: fileName || 'Apresentacao_MAVRA.pdf',
        delay: 1500,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Evolution sendMedia HTTP ${response.status}:`, errText);
      return { success: false, error: `Evolution sendMedia HTTP ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data?.key?.id || data?.id || 'media-' + Date.now(),
    };
  } catch (err: any) {
    console.error('Falha ao enviar documento na Evolution API:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a real WhatsApp Voice Note (PTT / Blue Microphone Waveform)
 * Accepts base64 audio (MP3/OGG) or public URL
 */
export async function sendWhatsAppVoiceAudio(
  phone: string,
  base64OrUrl: string
): Promise<EvolutionSendResult> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const cleanPhone = phone.replace(/\D/g, '');

  if (!cleanPhone || !base64OrUrl) {
    return { success: false, error: 'Telefone ou áudio ausente' };
  }

  const isDummyUrl = !baseUrl || baseUrl.includes('seuservidor.com') || baseUrl.includes('exemplo');
  if (isDummyUrl || !config.apiKey) {
    console.log(`[Evolution API Simulada] Áudio de voz (PTT) enviado para ${cleanPhone} (${base64OrUrl.slice(0, 30)}...)`);
    return { success: true, messageId: 'simulated-voice-' + Date.now() };
  }

  try {
    const instanceName = (config.instanceName || process.env.EVOLUTION_INSTANCE || 'agente-ia').trim();
    const endpoint = `${baseUrl}/message/sendWhatsAppAudio/${encodeURIComponent(instanceName)}`;
    
    const rawBase64 = base64OrUrl.replace(/^data:[^;]+;base64,/, '');

    console.log(`[Evolution API] Disparando áudio de voz PTT para ${cleanPhone} (${rawBase64.length} chars base64)...`);

    // Attempt 1: Standard sendWhatsAppAudio with raw base64 and encoding: true (WhatsApp PTT voice note)
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey.trim(),
      },
      body: JSON.stringify({
        number: cleanPhone,
        audio: rawBase64,
        delay: 500,
        encoding: true,
      }),
    });

    // Attempt 2: sendWhatsAppAudio with raw base64 and encoding: false (in case server lacks ffmpeg)
    if (!response.ok) {
      console.warn(`[Evolution] Tentativa 1 de áudio falhou (${response.status}). Tentando com encoding: false...`);
      
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.apiKey.trim(),
        },
        body: JSON.stringify({
          number: cleanPhone,
          audio: rawBase64,
          delay: 500,
          encoding: false,
        }),
      });
    }

    // Attempt 3: sendMedia fallback as audio/mp3
    if (!response.ok) {
      console.warn(`[Evolution] Tentativa 2 de áudio falhou (${response.status}). Tentando via sendMedia...`);
      const altEndpoint = `${baseUrl}/message/sendMedia/${encodeURIComponent(instanceName)}`;
      const altResponse = await fetch(altEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.apiKey.trim(),
        },
        body: JSON.stringify({
          number: cleanPhone,
          mediatype: 'audio',
          mimetype: 'audio/mp3',
          media: rawBase64,
          delay: 500,
        }),
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log(`[Evolution API] Áudio enviado com sucesso via sendMedia para ${cleanPhone}!`);
        return {
          success: true,
          messageId: altData?.key?.id || altData?.id || 'voice-' + Date.now(),
        };
      }

      const errText = await response.text();
      console.warn(`Evolution sendWhatsAppAudio HTTP ${response.status}:`, errText);
      return { success: false, error: `Evolution sendWhatsAppAudio HTTP ${response.status}: ${errText.slice(0, 100)}` };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data?.key?.id || data?.id || 'voice-' + Date.now(),
    };
  } catch (err: any) {
    console.warn('Falha ao enviar áudio na Evolution API:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Downloads base64 audio/media directly from Evolution API v2 if not included in the webhook payload
 */
export async function getBase64FromMediaMessage(
  messagePayload: any,
  messageKey?: { id?: string; remoteJid?: string; fromMe?: boolean }
): Promise<string | null> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl || process.env.EVOLUTION_API_URL || 'https://api.makprojetosmake.com.br');
  const apiKey = (config.apiKey || process.env.EVOLUTION_API_KEY || 'b2efa885a71ee22edf72b597df1a0ce9').trim();
  const instanceName = (config.instanceName || process.env.EVOLUTION_INSTANCE || 'agente-ia').trim();

  if (!baseUrl || !apiKey || !instanceName) {
    console.warn('[Evolution API Media] Configuração incompleta para download de mídia.');
    return null;
  }

  // Extract key and inner message structure
  const key = messageKey || messagePayload?.key || messagePayload?.data?.key;
  const msgId = key?.id || messagePayload?.id;
  if (!msgId) {
    console.warn('[Evolution API Media] ID da mensagem ausente para download de mídia.');
    return null;
  }

  const endpoint = `${baseUrl}/chat/getBase64FromMediaMessage/${encodeURIComponent(instanceName)}`;

  // Construct message object payloads for Evolution API v2 compatibility
  const candidatePayloads = [
    // 1. Full Evolution v2 message structure (with crypto keys, audioMessage/imageMessage)
    {
      message: messagePayload?.message ? messagePayload : { key, message: messagePayload },
      convertToMp4: false,
    },
    // 2. Direct message envelope
    {
      message: {
        key: {
          id: msgId,
          remoteJid: key?.remoteJid || '',
          fromMe: Boolean(key?.fromMe),
        },
        message: messagePayload?.message || messagePayload,
      },
      convertToMp4: false,
    },
    // 3. Simple key reference (if media is cached server-side)
    {
      message: {
        key: {
          id: msgId,
          remoteJid: key?.remoteJid || '',
          fromMe: Boolean(key?.fromMe),
        },
      },
      convertToMp4: false,
    },
  ];

  for (let i = 0; i < candidatePayloads.length; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify(candidatePayloads[i]),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const base64Data = data?.base64 || data?.data;
        if (base64Data && typeof base64Data === 'string' && base64Data.length > 50) {
          console.log(`[Evolution API Media] Base64 da mídia obtido com sucesso (${base64Data.length} chars) na tentativa ${i + 1}!`);
          return base64Data.replace(/^data:[^;]+;base64,/, '');
        }
      } else {
        const errText = await response.text().catch(() => '');
        console.warn(`[Evolution API Media] Tentativa ${i + 1} falhou (HTTP ${response.status}): ${errText.slice(0, 100)}`);
      }
    } catch (err: any) {
      console.warn(`[Evolution API Media] Tentativa ${i + 1} erro de conexão:`, err.message);
    }
  }

  return null;
}

export async function checkEvolutionStatus(): Promise<{
  isConnected: boolean;
  state: 'connecting' | 'connected' | 'disconnected' | 'qrcode';
  qrcode?: string;
  rawResponse?: any;
}> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);

  if (!baseUrl || baseUrl.includes('seuservidor.com') || !config.apiKey) {
    // In dev / unconfigured mode, keep as connected/simulated for instant testing
    return {
      isConnected: true,
      state: 'connected',
    };
  }

  try {
    const endpoint = `${baseUrl}/instance/connectionState/${encodeURIComponent(config.instanceName.trim())}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(endpoint, {
      headers: {
        apikey: config.apiKey.trim(),
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const state = data?.instance?.state || data?.state || 'connected';
      const isOpen = state === 'open' || state === 'connected';
      return {
        isConnected: isOpen,
        state: isOpen ? 'connected' : 'disconnected',
        rawResponse: data,
      };
    }

    console.warn(`[Evolution Status Check] Resposta HTTP ${response.status} ao consultar ${endpoint}`);
    return {
      isConnected: false,
      state: 'disconnected',
    };
  } catch (err: any) {
    console.error('[Evolution Status Check] Erro de conexão:', err.message);
    return {
      isConnected: false,
      state: 'disconnected',
    };
  }
}

export async function fetchRemoteWebhookConfig(): Promise<{
  success: boolean;
  webhookData?: any;
  error?: string;
}> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  if (!baseUrl || !config.apiKey) {
    return { success: false, error: 'Credenciais não configuradas' };
  }

  try {
    const endpoint = `${baseUrl}/webhook/find/${encodeURIComponent(config.instanceName.trim())}`;
    const response = await fetch(endpoint, {
      headers: { apikey: config.apiKey.trim() },
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, webhookData: data };
    }
    return { success: false, error: `HTTP ${response.status}: ${await response.text()}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function setRemoteWebhookConfig(targetWebhookUrl: string, targetInstance?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  if (!baseUrl || !config.apiKey) {
    return { success: false, error: 'Credenciais não configuradas' };
  }

  try {
    const inst = (targetInstance || config.instanceName || 'agente-ia').trim();
    const cleanInstance = encodeURIComponent(inst);
    const endpoint = `${baseUrl}/webhook/set/${cleanInstance}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey.trim(),
      },
      body: JSON.stringify({
        webhook: {
          enabled: true,
          url: targetWebhookUrl.trim(),
          byEvents: false,
          base64: true,
          events: [
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE',
            'SEND_MESSAGE',
            'CONNECTION_UPDATE',
          ],
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: `Webhook gravado na Evolution API para ${inst} com sucesso!`, error: undefined };
    }
    const errText = await response.text();
    return { success: false, error: `HTTP ${response.status}: ${errText}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch QR Code or connection state for an instance from Evolution API v2
 */
export async function getEvolutionQRCode(targetInstance?: string): Promise<{
  success: boolean;
  state: string;
  qrcode?: string; // base64 string or image url
  pairingCode?: string;
  count?: number;
  error?: string;
}> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const instance = encodeURIComponent((targetInstance || config.instanceName).trim());

  if (!baseUrl || !config.apiKey) {
    return { success: false, state: 'disconnected', error: 'Servidor Evolution não configurado' };
  }

  try {
    const endpoint = `${baseUrl}/instance/connect/${instance}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: config.apiKey.trim(),
      },
    });

    if (response.ok) {
      const data = await response.json();
      // Evolution returns { base64: "data:image/png;base64,...", code: "...", pairingCode: "..." } or similar
      const qrcode = data?.base64 || data?.qrcode?.base64 || (typeof data?.code === 'string' && data.code.startsWith('data:') ? data.code : undefined);
      const pairingCode = data?.pairingCode || data?.pairing;
      const state = data?.instance?.state || data?.state || (qrcode ? 'connecting' : 'open');
      
      return {
        success: true,
        state,
        qrcode: qrcode || (data?.code ? data.code : undefined),
        pairingCode,
        count: data?.count,
      };
    }

    const errText = await response.text();
    return { success: false, state: 'disconnected', error: `HTTP ${response.status}: ${errText.slice(0, 150)}` };
  } catch (err: any) {
    return { success: false, state: 'disconnected', error: err.message };
  }
}

/**
 * Create a new Evolution instance directly via API
 */
export async function createEvolutionInstance(
  instanceName: string,
  webhookUrl?: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const cleanName = instanceName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');

  if (!baseUrl || !config.apiKey) {
    return { success: false, error: 'Servidor Evolution não configurado' };
  }
  if (!cleanName) {
    return { success: false, error: 'Nome de instância inválido' };
  }

  try {
    const endpoint = `${baseUrl}/instance/create`;
    const bodyPayload: any = {
      instanceName: cleanName,
      token: config.apiKey.trim(),
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    };

    if (webhookUrl && webhookUrl.trim()) {
      bodyPayload.webhook = {
        enabled: true,
        url: webhookUrl.trim(),
        byEvents: false,
        base64: true,
        events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'SEND_MESSAGE', 'CONNECTION_UPDATE'],
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey.trim(),
      },
      body: JSON.stringify(bodyPayload),
    });

    const data = await response.json().catch(() => ({}));
    if (response.ok || response.status === 201 || (data?.message && data.message.includes('already in use'))) {
      // If a webhook URL was provided, also ensure webhook is explicitly configured on the instance
      if (webhookUrl && webhookUrl.trim()) {
        try {
          await setRemoteWebhookConfig(webhookUrl.trim(), cleanName);
        } catch (wbErr) {
          console.warn('[CreateInstance] Falha ao registrar webhook imediato:', wbErr);
        }
      }
      return { success: true, data };
    }

    return {
      success: false,
      error: data?.response?.message?.[0] || data?.message || `HTTP ${response.status}`,
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Disconnect (Logout) an Evolution instance
 */
export async function logoutEvolutionInstance(targetInstance?: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const instance = encodeURIComponent((targetInstance || config.instanceName).trim());

  if (!baseUrl || !config.apiKey) {
    return { success: false, error: 'Servidor Evolution não configurado' };
  }

  try {
    const endpoint = `${baseUrl}/instance/logout/${instance}`;
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        apikey: config.apiKey.trim(),
      },
    });

    if (response.ok) {
      return { success: true, message: 'Instância desconectada com sucesso!' };
    }
    const errText = await response.text();
    return { success: false, error: `HTTP ${response.status}: ${errText.slice(0, 100)}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetch all available instances directly from Evolution API VPS
 */
export async function fetchAllEvolutionInstances(): Promise<{
  success: boolean;
  instances: Array<{
    name: string;
    connectionStatus: string;
    profileName?: string;
    profilePictureUrl?: string;
  }>;
  error?: string;
}> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);

  if (!baseUrl || !config.apiKey) {
    return { success: false, instances: [], error: 'Servidor Evolution não configurado' };
  }

  try {
    const endpoint = `${baseUrl}/instance/fetchInstances`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: config.apiKey.trim(),
      },
    });

    if (response.ok) {
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data?.instances || []);
      const mapped = list.map((item: any) => {
        const inst = item?.instance || item;
        return {
          name: inst?.instanceName || inst?.name || '',
          connectionStatus: inst?.status || inst?.state || item?.connectionStatus || 'close',
          profileName: inst?.profileName || item?.profileName,
          profilePictureUrl: inst?.profilePictureUrl || item?.profilePictureUrl,
        };
      }).filter((item: any) => item.name);

      return { success: true, instances: mapped };
    }

    const errText = await response.text();
    return { success: false, instances: [], error: `HTTP ${response.status}: ${errText.slice(0, 100)}` };
  } catch (err: any) {
    return { success: false, instances: [], error: err.message };
  }
}

