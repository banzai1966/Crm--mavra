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
        delay: 1200, // natural human typing latency
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
          base64: false,
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
