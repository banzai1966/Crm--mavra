import { db } from './db';
import { handleIncomingWebhook } from './webhook';
import { sanitizeEvolutionUrl } from './evolution';

let isSyncRunning = false;
let isInitialBoot = true;
let syncIntervalTimer: NodeJS.Timeout | null = null;
const processedExternalMessageIds = new Set<string>();
const lastReplyTimestampPerPhone = new Map<string, number>();

/**
 * Active bidirectional Live Sync with Evolution API.
 * This guarantees real-time message reception and automatic responses
 * even in environments where incoming webhooks are blocked by firewalls or auth cookies (such as Cloud Run / AI Studio).
 */
export function startEvolutionSync(): void {
  if (syncIntervalTimer) return;

  console.log('[Evolution Live Sync] Iniciando sincronização ativa com a VPS Evolution API (intervalo: 2.5s)...');

  // Initial immediate poll
  setTimeout(pollEvolutionMessages, 1500);

  // Poll every 2.5 seconds
  syncIntervalTimer = setInterval(pollEvolutionMessages, 2500);
}

export async function pollEvolutionMessages(): Promise<void> {
  if (isSyncRunning) return;
  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const instance = (config.instanceName || 'agente-ia').trim();
  const apiKey = (config.apiKey || '').trim();

  // If dummy or missing, skip
  if (!baseUrl || !apiKey || !instance || baseUrl.includes('seuservidor.com')) {
    return;
  }

  isSyncRunning = true;
  try {
    const endpoint = `${baseUrl}/chat/findMessages/${encodeURIComponent(instance)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: apiKey,
      },
      body: JSON.stringify({
        page: 1,
        offset: 15,
      }),
    });

    if (!response.ok) {
      return;
    }

    const json = await response.json();
    const records = json?.messages?.records || [];
    const nowSec = Math.floor(Date.now() / 1000);

    // On the very first boot check, mark all historical messages as already processed
    // so we never spam contacts with retroactive replies from hours or days ago
    if (isInitialBoot) {
      isInitialBoot = false;
      for (const record of records) {
        if (record?.key?.id) {
          processedExternalMessageIds.add(record.key.id);
        }
      }
      return;
    }

    // Sort records oldest first so conversation flows in order
    const sortedRecords = [...records].sort((a, b) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));

    for (const record of sortedRecords) {
      if (!record || record.key?.fromMe === true) continue;
      const msgId = record.key?.id;
      if (!msgId || processedExternalMessageIds.has(msgId)) continue;

      // Ignore messages older than 2 minutes
      const msgTimestamp = record.messageTimestamp || 0;
      if (msgTimestamp > 0 && nowSec - msgTimestamp > 120) {
        processedExternalMessageIds.add(msgId);
        continue;
      }

      processedExternalMessageIds.add(msgId);

      // Keep set bounded
      if (processedExternalMessageIds.size > 1000) {
        const first = processedExternalMessageIds.values().next().value;
        if (first) processedExternalMessageIds.delete(first);
      }

      // Check debouncing per sender phone: if we just replied to this phone within the last 3s, skip rapid dupes
      const phoneId = record.key?.remoteJidAlt || record.key?.remoteJid || '';
      const lastReply = lastReplyTimestampPerPhone.get(phoneId) || 0;
      const nowMs = Date.now();
      if (nowMs - lastReply < 3000) {
        console.log(`[Evolution Live Sync] Mensagem ${msgId} de ${phoneId} ignorada para evitar resposta duplicada rápida.`);
        continue;
      }
      lastReplyTimestampPerPhone.set(phoneId, nowMs);

      console.log(`[Evolution Live Sync] Nova mensagem capturada da VPS: "${record.pushName || ''}" (${msgId})`);

      // Dispatch to full AI & CRM webhook processing pipeline
      handleIncomingWebhook({
        event: 'messages.upsert',
        instance: instance,
        data: record,
      });
    }
  } catch (err: any) {
    // Suppress network jitter errors
  } finally {
    isSyncRunning = false;
  }
}
