import { db } from './db';
import { handleIncomingWebhook, isDuplicateMessage, isWebhookActive } from './webhook';
import { sanitizeEvolutionUrl } from './evolution';

let isSyncRunning = false;
let isInitialBoot = true;
let syncIntervalTimer: NodeJS.Timeout | null = null;
const processedExternalMessageIds = new Set<string>();
const lastReplyTimestampPerPhone = new Map<string, number>();

/**
 * Active bidirectional Live Sync with Evolution API.
 * This acts as a reliable fallback in environments where incoming webhooks are blocked.
 * When incoming webhooks are active and flowing normally, this polling automatically yields
 * to prevent double-processing and duplicate responses.
 */
export function startEvolutionSync(): void {
  if (syncIntervalTimer) return;

  console.log('[Evolution Live Sync] Iniciando monitoramento sincronizado com a VPS Evolution API...');

  // Initial immediate poll
  setTimeout(pollEvolutionMessages, 1500);

  // Poll every 3.5 seconds
  syncIntervalTimer = setInterval(pollEvolutionMessages, 3500);
}

export async function pollEvolutionMessages(): Promise<void> {
  if (isSyncRunning) return;

  // If webhooks are actively receiving messages from Evolution API, yield polling completely
  // to avoid dual processing, race conditions, and duplicate replies.
  if (isWebhookActive()) {
    return;
  }

  const config = db.evolutionConfig;
  const baseUrl = sanitizeEvolutionUrl(config.serverUrl);
  const currentInstance = (config.instanceName || 'agente-ia').trim();
  const apiKey = (config.apiKey || '').trim();

  // If dummy or missing, skip
  if (!baseUrl || !apiKey || !currentInstance || baseUrl.includes('seuservidor.com')) {
    return;
  }

  // Poll current instance first, and check known instances if configured
  const candidateInstances = new Set<string>();
  candidateInstances.add(currentInstance);
  if (currentInstance !== 'agente-ia') {
    candidateInstances.add('agente-ia');
  }

  isSyncRunning = true;
  try {
    for (const instance of candidateInstances) {
      await pollSingleInstance(baseUrl, apiKey, instance);
    }
  } catch (err: any) {
    // Suppress network jitter errors
  } finally {
    isSyncRunning = false;
  }
}

async function pollSingleInstance(baseUrl: string, apiKey: string, instance: string): Promise<void> {
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
        offset: 20,
      }),
    });

    if (!response.ok) {
      return;
    }

    const json = await response.json();
    const records = json?.messages?.records || [];
    const nowSec = Math.floor(Date.now() / 1000);

    // On the very first boot check, mark historical messages (>10 min old) as already processed
    // so we never spam contacts with retroactive replies from hours or days ago,
    // but still allow recent unread messages (<10 min) to be captured immediately
    if (isInitialBoot) {
      isInitialBoot = false;
      for (const record of records) {
        const msgTimestamp = record?.messageTimestamp || 0;
        if (record?.key?.id && (nowSec - msgTimestamp > 600)) {
          processedExternalMessageIds.add(record.key.id);
          isDuplicateMessage(record.key.id);
        }
      }
      return;
    }

    // Sort records oldest first so conversation flows in order
    const sortedRecords = [...records].sort((a, b) => (a.messageTimestamp || 0) - (b.messageTimestamp || 0));

    for (const record of sortedRecords) {
      if (!record || record.key?.fromMe === true) continue;
      const msgId = record.key?.id;
      if (!msgId) continue;

      // Check both local set AND shared global deduplicator
      if (processedExternalMessageIds.has(msgId) || isDuplicateMessage(msgId)) {
        continue;
      }

      // Ignore messages older than 10 minutes (allows catching messages during VPS reboot or deployment)
      const msgTimestamp = record.messageTimestamp || 0;
      if (msgTimestamp > 0 && nowSec - msgTimestamp > 600) {
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

      console.log(`[Evolution Live Sync] Nova mensagem capturada da VPS (${instance}): "${record.pushName || ''}" (${msgId})`);

      // Dispatch to full AI & CRM webhook processing pipeline
      handleIncomingWebhook({
        event: 'messages.upsert',
        instance: instance,
        data: record,
      });
    }
  } catch (err: any) {
    // Suppress individual instance failure
  }
}
