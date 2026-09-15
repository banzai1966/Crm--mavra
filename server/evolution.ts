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
 * Downloads base64 audio/media directly from Evolution API v2 if not included in the webhook payload
 */
export async function getBase64FromMediaMessage(messageKey: {
  id?: string;
  remoteJid?: string;
  fromMe?: boolean;
}): Promise<string | null> {
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  if (!baseUrl || !config.apiKey || !messageKey.id) {
    return null;
  }

  try {
    const endpoint = `${baseUrl}/chat/getBase64FromMediaMessage/${encodeURIComponent(config.instanceName.trim())}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.apiKey.trim(),
      },
      body: JSON.stringify({
        message: {
          key: messageKey,
        },
        convertToMp4: false,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const base64Data = data?.base64 || data?.data;
      if (base64Data && typeof base64Data === 'string') {
        // Strip data:audio/ogg;base64, prefix if present
        return base64Data.replace(/^data:[^;]+;base64,/, '');
      }
    }
  } catch (err: any) {
    console.warn('[Evolution API] Não foi possível obter base64 da mídia remota:', err.message);
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

export async function setRemoteWebhookConfig(targetWebhookUrl: string): Promise<{
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
    const cleanInstance = encodeURIComponent(config.instanceName.trim());
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
      return { success: true, message: 'Webhook gravado na Evolution API com sucesso!', error: undefined };
    }
    const errText = await response.text();
    return { success: false, error: `HTTP ${response.status}: ${errText}` };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
