import { db } from './db';

export const MASTER_EVOLUTION_KEY = 'b2efa885a71ee22edf72b597df1a0ce9';

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

/**
 * Returns the effective API key for Evolution API.
 * Defaults to the master key if unset, dummy, or set to the instance-restricted token.
 */
export function getEvolutionApiKey(): string {
  const configured = (db.evolutionConfig.apiKey || '').trim();
  if (
    !configured ||
    configured === 'CE08ADFF7647-4B88-91A4-55E66D9A0620' ||
    configured.includes('seuservidor.com') ||
    configured.includes('exemplo')
  ) {
    return MASTER_EVOLUTION_KEY;
  }
  return configured;
}

/**
 * Normalizes instance name:
 * Maps 'dra-lucy-morata' or 'dra-lucy-murata' to the actual instance 'dra-lucy-murata' on VPS
 */
export function normalizeInstanceName(inst?: string): string {
  const raw = (inst || db.evolutionConfig.instanceName || 'dra-lucy-murata')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  if (raw === 'dra-lucy-morata' || raw === 'dra-lucy-murata') {
    return 'dra-lucy-murata';
  }
  return raw || 'dra-lucy-murata';
}

export interface EvolutionSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendWhatsAppMessage(
  phone: string,
  text: string,
  instanceNameOverride?: string
): Promise<EvolutionSendResult> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const targetInstance = normalizeInstanceName(instanceNameOverride || config.instanceName);

  // Format clean digits phone
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) {
    return { success: false, error: 'Telefone inválido ou ausente' };
  }

  // If URL is not configured or placeholder, log and return simulated delivery
  const isDummyUrl =
    !baseUrl ||
    baseUrl.includes('seuservidor.com') ||
    baseUrl.includes('exemplo');

  const apiKey = getEvolutionApiKey();

  if (isDummyUrl || !apiKey) {
    console.log(
      `[Evolution API Simulada (${targetInstance})] Mensagem enviada para ${cleanPhone}: "${text.slice(0, 60)}..."`
    );
    return {
      success: true,
      messageId: 'simulated-' + Date.now(),
    };
  }

  try {
    const typingDelay = db.agentConfig.typingDelayMs || 1500;
    const endpoint = `${baseUrl}/message/sendText/${encodeURIComponent(targetInstance)}`;
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: cleanPhone,
        text: text,
        delay: typingDelay, // configurable human typing latency
        linkPreview: true,
      }),
    });

    // Auto-retry with MASTER key if 401 Unauthorized
    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      console.warn(`[Evolution (${targetInstance})] 401 Unauthorized. Retentando com chave mestra...`);
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: MASTER_EVOLUTION_KEY,
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: text,
          delay: typingDelay,
          linkPreview: true,
        }),
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Evolution API (${targetInstance}) HTTP ${response.status}:`, errText);
      return {
        success: false,
        error: `Evolution API (${targetInstance}) HTTP ${response.status}: ${errText.slice(0, 100)}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data?.key?.id || data?.id || 'msg-' + Date.now(),
    };
  } catch (err: any) {
    console.error(`Falha ao conectar na Evolution API (${targetInstance}):`, err.message);
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
  caption?: string,
  instanceNameOverride?: string
): Promise<EvolutionSendResult> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const targetInstance = normalizeInstanceName(instanceNameOverride || config.instanceName);
  const cleanPhone = phone.replace(/\D/g, '');

  if (!cleanPhone || !mediaUrl) {
    return { success: false, error: 'Telefone ou URL do documento ausente' };
  }

  const apiKey = getEvolutionApiKey();
  const isDummyUrl = !baseUrl || baseUrl.includes('seuservidor.com') || baseUrl.includes('exemplo');
  if (isDummyUrl || !apiKey) {
    console.log(`[Evolution API Simulada (${targetInstance})] Documento PDF enviado para ${cleanPhone}: "${fileName}" (${mediaUrl})`);
    return { success: true, messageId: 'simulated-media-' + Date.now() };
  }

  try {
    const endpoint = `${baseUrl}/message/sendMedia/${encodeURIComponent(targetInstance)}`;
    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: cleanPhone,
        mediatype: 'document',
        mimetype: 'application/pdf',
        caption: caption || '',
        media: mediaUrl,
        fileName: fileName || 'Apresentacao_Dra_Lucy_Murata.pdf',
        delay: 1500,
      }),
    });

    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: MASTER_EVOLUTION_KEY },
        body: JSON.stringify({
          number: cleanPhone,
          mediatype: 'document',
          mimetype: 'application/pdf',
          caption: caption || '',
          media: mediaUrl,
          fileName: fileName || 'Apresentacao_Dra_Lucy_Murata.pdf',
          delay: 1500,
        }),
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Evolution sendMedia (${targetInstance}) HTTP ${response.status}:`, errText);
      return { success: false, error: `Evolution sendMedia HTTP ${response.status}` };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data?.key?.id || data?.id || 'media-' + Date.now(),
    };
  } catch (err: any) {
    console.error(`Falha ao enviar documento na Evolution API (${targetInstance}):`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a real WhatsApp Voice Note (PTT / Blue Microphone Waveform)
 * Accepts base64 audio (MP3/OGG) or public URL
 */
export async function sendWhatsAppVoiceAudio(
  phone: string,
  base64OrUrl: string,
  instanceNameOverride?: string
): Promise<EvolutionSendResult> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const targetInstance = normalizeInstanceName(instanceNameOverride || config.instanceName);
  const cleanPhone = phone.replace(/\D/g, '');

  if (!cleanPhone || !base64OrUrl) {
    return { success: false, error: 'Telefone ou áudio ausente' };
  }

  const apiKey = getEvolutionApiKey();
  const isDummyUrl = !baseUrl || baseUrl.includes('seuservidor.com') || baseUrl.includes('exemplo');
  if (isDummyUrl || !apiKey) {
    console.log(`[Evolution API Simulada (${targetInstance})] Áudio PTT enviado para ${cleanPhone} (${base64OrUrl.length} bytes)`);
    return { success: true, messageId: 'simulated-voice-' + Date.now() };
  }

  try {
    const rawBase64 = base64OrUrl.replace(/^data:[^;]+;base64,/, '').trim();
    const endpoint = `${baseUrl}/message/sendWhatsAppAudio/${encodeURIComponent(targetInstance)}`;

    console.log(`[Evolution API (${targetInstance})] Disparando áudio de voz PTT para ${cleanPhone} (${rawBase64.length} chars base64)...`);

    // Helper for fetch with strict 7s timeout to prevent thread blocking
    const fetchWithTimeout = async (url: string, opts: RequestInit, timeoutMs = 7000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const res = await fetch(url, { ...opts, signal: controller.signal });
        clearTimeout(id);
        return res;
      } catch (err: any) {
        clearTimeout(id);
        throw err;
      }
    };

    // Attempt 1: Standard sendWhatsAppAudio with raw base64 and encoding: true (WhatsApp PTT voice note)
    let response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: cleanPhone,
        audio: rawBase64,
        delay: 800,
        encoding: true,
      }),
    });

    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: MASTER_EVOLUTION_KEY },
        body: JSON.stringify({ number: cleanPhone, audio: rawBase64, delay: 800, encoding: true }),
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

    // Attempt 2: sendWhatsAppAudio with raw base64 and encoding: false (in case server lacks ffmpeg)
    if (!response.ok) {
      console.warn(`[Evolution (${targetInstance})] Tentativa 1 de áudio falhou (${response.status}). Tentando com encoding: false...`);
      
      response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify({
          number: cleanPhone,
          audio: rawBase64,
          delay: 800,
          encoding: false,
        }),
      });
    }

    // Attempt 3: sendMedia fallback as audio/mp3
    if (!response.ok) {
      console.warn(`[Evolution (${targetInstance})] Tentativa 2 de áudio falhou (${response.status}). Tentando via sendMedia...`);
      const altEndpoint = `${baseUrl}/message/sendMedia/${encodeURIComponent(targetInstance)}`;
      const altResponse = await fetchWithTimeout(altEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey,
        },
        body: JSON.stringify({
          number: cleanPhone,
          mediatype: 'audio',
          mimetype: 'audio/mp3',
          media: rawBase64,
          delay: 800,
        }),
      });

      if (altResponse.ok) {
        const altData = await altResponse.json();
        console.log(`[Evolution API (${targetInstance})] Áudio enviado com sucesso via sendMedia para ${cleanPhone}!`);
        return {
          success: true,
          messageId: altData?.key?.id || altData?.id || 'voice-' + Date.now(),
        };
      }

      const errText = await response.text();
      console.warn(`Evolution sendWhatsAppAudio (${targetInstance}) HTTP ${response.status}:`, errText);
      return { success: false, error: `Evolution sendWhatsAppAudio (${targetInstance}) HTTP ${response.status}: ${errText.slice(0, 100)}` };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data?.key?.id || data?.id || 'voice-' + Date.now(),
    };
  } catch (err: any) {
    console.warn(`Falha ao enviar áudio na Evolution API (${targetInstance}):`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Downloads base64 audio/media directly from Evolution API v2 if not included in the webhook payload
 */
export async function getBase64FromMediaMessage(
  messagePayload: any,
  messageKey?: { id?: string; remoteJid?: string; fromMe?: boolean },
  instanceNameOverride?: string
): Promise<string | null> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl || process.env.EVOLUTION_API_URL || 'https://api.makprojetosmake.com.br');
  const apiKey = getEvolutionApiKey();
  const instanceName = normalizeInstanceName(instanceNameOverride || config.instanceName || 'dra-lucy-murata');

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
    // 1. Direct message envelope with full message or audio object
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
    // 2. Simple key reference (if media is cached server-side in Evolution)
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
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout per attempt

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
          console.log(`[Evolution API Media (${instanceName})] Base64 obtido com sucesso (${base64Data.length} chars) na tentativa ${i + 1}!`);
          return base64Data.replace(/^data:[^;]+;base64,/, '');
        }
      } else {
        const errText = await response.text().catch(() => '');
        console.warn(`[Evolution API Media (${instanceName})] Tentativa ${i + 1} falhou (HTTP ${response.status}): ${errText.slice(0, 80)}`);
      }
    } catch (err: any) {
      console.warn(`[Evolution API Media (${instanceName})] Tentativa ${i + 1} conexão/timeout:`, err.message);
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
  const targetInstance = normalizeInstanceName(config.instanceName);
  const apiKey = getEvolutionApiKey();

  if (!baseUrl || baseUrl.includes('seuservidor.com') || !apiKey) {
    // In dev / unconfigured mode, keep as connected/simulated for instant testing
    return {
      isConnected: true,
      state: 'connected',
    };
  }

  try {
    const endpoint = `${baseUrl}/instance/connectionState/${encodeURIComponent(targetInstance)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let response = await fetch(endpoint, {
      headers: {
        apikey: apiKey,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      response = await fetch(endpoint, {
        headers: { apikey: MASTER_EVOLUTION_KEY },
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

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
  const targetInstance = normalizeInstanceName(config.instanceName);
  const apiKey = getEvolutionApiKey();
  if (!baseUrl || !apiKey) {
    return { success: false, error: 'Credenciais não configuradas' };
  }

  try {
    const endpoint = `${baseUrl}/webhook/find/${encodeURIComponent(targetInstance)}`;
    let response = await fetch(endpoint, {
      headers: { apikey: apiKey },
    });

    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      response = await fetch(endpoint, {
        headers: { apikey: MASTER_EVOLUTION_KEY },
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

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
  const apiKey = getEvolutionApiKey();
  if (!baseUrl || !apiKey) {
    return { success: false, error: 'Credenciais não configuradas' };
  }

  try {
    const inst = normalizeInstanceName(targetInstance || config.instanceName);
    const cleanInstance = encodeURIComponent(inst);
    const endpoint = `${baseUrl}/webhook/set/${cleanInstance}`;

    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        webhook: {
          enabled: true,
          url: targetWebhookUrl.trim(),
          byEvents: false,
          base64: true,
          events: [
            'MESSAGES_UPSERT',
            'CONNECTION_UPDATE',
          ],
        },
      }),
    });

    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: MASTER_EVOLUTION_KEY,
        },
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: targetWebhookUrl.trim(),
            byEvents: false,
            base64: true,
            events: [
              'MESSAGES_UPSERT',
              'CONNECTION_UPDATE',
            ],
          },
        }),
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

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
  const rawInstance = normalizeInstanceName(targetInstance || config.instanceName);
  const instance = encodeURIComponent(rawInstance);
  const apiKey = getEvolutionApiKey();

  if (!baseUrl || !apiKey) {
    return { success: false, state: 'disconnected', error: 'Servidor Evolution não configurado' };
  }

  try {
    const endpoint = `${baseUrl}/instance/connect/${instance}`;
    let response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: apiKey,
      },
    });

    // Auto-retry with master key if 401 Unauthorized
    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      console.warn(`[Evolution getEvolutionQRCode (${rawInstance})] 401 Unauthorized. Retentando com chave mestra...`);
      response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: MASTER_EVOLUTION_KEY,
        },
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

    // If instance doesn't exist (HTTP 404), auto-create it immediately
    if (response.status === 404 || !response.ok) {
      const errPeek = await response.clone().text().catch(() => '');
      if (response.status === 404 || errPeek.toLowerCase().includes('not exist')) {
        console.log(`[Evolution Auto-Provision] Instância ${rawInstance} não existe. Criando automaticamente...`);
        const webhookUrl = `https://crm.makprojetosmake.com.br/api/webhook`;
        await createEvolutionInstance(rawInstance, webhookUrl);
        
        // Wait 800ms and retry connecting
        await new Promise((r) => setTimeout(r, 800));
        response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            apikey: MASTER_EVOLUTION_KEY,
          },
        });
      }
    }

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
  const cleanName = normalizeInstanceName(instanceName);
  const apiKey = getEvolutionApiKey();

  if (!baseUrl || !apiKey) {
    return { success: false, error: 'Servidor Evolution não configurado' };
  }
  if (!cleanName) {
    return { success: false, error: 'Nome de instância inválido' };
  }

  try {
    const endpoint = `${baseUrl}/instance/create`;
    const bodyPayload: any = {
      instanceName: cleanName,
      token: apiKey,
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

    let response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify(bodyPayload),
    });

    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      bodyPayload.token = MASTER_EVOLUTION_KEY;
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: MASTER_EVOLUTION_KEY,
        },
        body: JSON.stringify(bodyPayload),
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

    const data = await response.json().catch(() => ({}));
    if (response.ok || response.status === 201 || (data?.message && data.message.includes('already in use'))) {
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
  const instance = encodeURIComponent(normalizeInstanceName(targetInstance || config.instanceName));
  const apiKey = getEvolutionApiKey();

  if (!baseUrl || !apiKey) {
    return { success: false, error: 'Servidor Evolution não configurado' };
  }

  try {
    const endpoint = `${baseUrl}/instance/logout/${instance}`;
    let response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        apikey: apiKey,
      },
    });

    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { apikey: MASTER_EVOLUTION_KEY },
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

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
  const apiKey = getEvolutionApiKey();

  if (!baseUrl || !apiKey) {
    return { success: false, instances: [], error: 'Servidor Evolution não configurado' };
  }

  try {
    const endpoint = `${baseUrl}/instance/fetchInstances`;
    let response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: apiKey,
      },
    });

    if (response.status === 401 && apiKey !== MASTER_EVOLUTION_KEY) {
      response = await fetch(endpoint, {
        method: 'GET',
        headers: { apikey: MASTER_EVOLUTION_KEY },
      });
      if (response.ok) {
        db.evolutionConfig.apiKey = MASTER_EVOLUTION_KEY;
        db.saveToFile();
      }
    }

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

