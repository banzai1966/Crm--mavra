import { db } from './db';
import { processAiConversation } from './ai';

export interface MetaWebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    time: number;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text?: string;
        is_echo?: boolean;
      };
      postback?: {
        mid: string;
        title: string;
        payload: string;
      };
    }>;
    changes?: Array<{
      field: string;
      value: {
        from?: {
          id: string;
          username?: string;
        };
        media?: {
          id: string;
          media_product_type?: string;
        };
        id?: string; // comment_id
        text?: string; // comment text
        parent_id?: string;
      };
    }>;
  }>;
}

/**
 * Responde um comentário público no Instagram via Meta Graph API
 */
export async function replyInstagramComment(
  commentId: string,
  replyText: string,
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${commentId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: replyText,
        access_token: accessToken,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('[Meta Graph API] Erro ao responder comentário:', data);
      return { success: false, error: data?.error?.message || 'Falha na resposta do comentário' };
    }
    console.log('[Meta Graph API] Comentário respondido com sucesso:', data);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Meta Graph API] Exceção ao responder comentário:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Envia uma mensagem de Direct para o usuário do Instagram via Meta Graph API
 */
export async function sendInstagramDirectMessage(
  recipientId: string,
  messageText: string,
  accessToken: string,
  pageOrInstaId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Tenta primeiro com o endpoint 'me/messages' que é o padrão da Meta para o token da página/Instagram
    console.log(`[Meta Graph API] Enviando Direct para recipientId=${recipientId} via access_token (${accessToken.slice(0, 15)}...)...`);
    
    let res = await fetch(`https://graph.facebook.com/v19.0/me/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: messageText },
        access_token: accessToken,
      }),
    });

    let data = await res.json();

    // Se falhar e tivermos um pageId específico, tenta com pageId/messages
    if (!res.ok && pageOrInstaId && pageOrInstaId !== 'me') {
      console.warn(`[Meta Graph API] Tentativa com 'me/messages' retornou: ${data?.error?.message}. Tentando com '${pageOrInstaId}/messages'...`);
      res = await fetch(`https://graph.facebook.com/v19.0/${pageOrInstaId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: messageText },
          access_token: accessToken,
        }),
      });
      data = await res.json();
    }

    if (!res.ok) {
      console.error('[Meta Graph API] Erro ao enviar Direct:', JSON.stringify(data));
      return { success: false, error: data?.error?.message || 'Falha ao enviar Direct' };
    }
    console.log('[Meta Graph API] Direct enviado com sucesso:', data);
    return { success: true, data };
  } catch (err: any) {
    console.error('[Meta Graph API] Exceção ao enviar Direct:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Processador principal de eventos vindos do Webhook Oficial da Meta
 */
export async function handleMetaInstagramWebhook(body: MetaWebhookPayload): Promise<void> {
  if (!body.entry || !Array.isArray(body.entry)) return;

  const instaConfig = db.agentConfig.instagramConfig;
  const token = instaConfig?.accessToken;
  const triggerKeywords = instaConfig?.commentTriggerKeywords || ['AVALIACAO', 'AGENDA', 'CRM', 'SORRISO', 'BIOODONTO'];
  const publicReplyText = instaConfig?.commentPublicReplyText || 'Olá! Te respondi com todos os detalhes no seu Direct, dá uma olhadinha lá! ✨😊';
  const welcomePrompt = instaConfig?.directWelcomePrompt || 'Olá! Vi que você comentou no nosso post. Sou a Sofia, especialista em atendimento! Como posso te ajudar hoje?';

  for (const entry of body.entry) {
    // 1. Processar Comentários em Posts/Reels (entry.changes)
    if (entry.changes && Array.isArray(entry.changes)) {
      for (const change of entry.changes) {
        if (change.field === 'comments') {
          const val = change.value;
          const commentId = val?.id;
          const commentText = val?.text || '';
          const authorUser = val?.from?.username || val?.from?.id || 'usuario_instagram';
          const authorId = val?.from?.id;

          console.log(`[Instagram Webhook] Comentário recebido de @${authorUser}: "${commentText}"`);

          const commentUpper = commentText.toUpperCase();
          const matchedKw = triggerKeywords.find((kw) => commentUpper.includes(kw.toUpperCase()));

          // Se tiver palavra-chave configurada ou o modo de resposta estiver ativo
          if (matchedKw || instaConfig?.autoReplyComments) {
            console.log(`[Instagram Webhook] Gatilho ativado (${matchedKw || 'TODOS'}). Disparando automação...`);

            // 1. Criar/atualizar lead no CRM Kanban
            let lead = db.leads.find((l) => l.name.includes(authorUser) || l.tags.includes(`@${authorUser}`));
            if (!lead) {
              lead = {
                id: `lead-insta-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                name: `@${authorUser}`,
                phone: 'Aguardando no Direct',
                stageId: instaConfig?.leadCaptureMoveToStage || 'stage-1',
                value: 4500,
                interest: `Interesse via Instagram: "${commentText}"`,
                tags: ['📸 Instagram Direct', matchedKw ? `Comentou ${matchedKw}` : 'Comentário Geral', '🔥 LEAD QUENTE'],
                notes: `Comentou no Instagram com "${commentText}". Resposta e Direct disparados pela Sofia.`,
                aiPaused: false,
                isHotLead: true,
                hotReason: `Interagiu com #${matchedKw || 'INSTA'} nos comentários`,
                lastInteraction: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                unreadCount: 1,
              };
              db.leads.unshift(lead);
            } else {
              lead.lastInteraction = new Date().toISOString();
              lead.unreadCount = (lead.unreadCount || 0) + 1;
              if (matchedKw && !lead.tags.includes(`Comentou ${matchedKw}`)) {
                lead.tags.push(`Comentou ${matchedKw}`);
              }
            }

            // Registrar histórico no chat do CRM
            db.messages.push({
              id: `msg-insta-in-${Date.now()}`,
              leadId: lead.id,
              phone: `instagram:${authorUser}`,
              sender: 'lead',
              text: `[Comentário no Post]: "${commentText}"`,
              timestamp: new Date().toISOString(),
              status: 'read',
            });

            db.messages.push({
              id: `msg-insta-out-${Date.now()}`,
              leadId: lead.id,
              phone: `instagram:${authorUser}`,
              sender: 'ai',
              text: `[Direct Enviado]: ${welcomePrompt}`,
              timestamp: new Date().toISOString(),
              status: 'delivered',
            });

            db.saveToFile();

            // 2. Chamar a API da Meta se o token estiver configurado
            if (token && commentId) {
              // Resposta pública no comentário
              await replyInstagramComment(commentId, publicReplyText, token);

              // Mensagem privada no Direct (se o authorId estiver disponível)
              if (authorId) {
                await sendInstagramDirectMessage(authorId, welcomePrompt, token, instaConfig?.pageId);
              }
            }
          }
        }
      }
    }

    // 2. Processar Mensagens do Direct Recebidas (entry.messaging)
    if (entry.messaging && Array.isArray(entry.messaging)) {
      for (const msg of entry.messaging) {
        // Ignora ecos (mensagens enviadas por nós mesmos)
        if (msg.message?.is_echo) continue;

        const senderId = msg.sender?.id;
        const msgText = msg.message?.text || msg.postback?.title || '';

        if (!senderId || !msgText) continue;

        console.log(`[Instagram Direct] Mensagem recebida de ID ${senderId}: "${msgText}"`);

        // Localizar ou criar Lead
        let lead = db.leads.find((l) => l.name === `@ig_${senderId}` || l.phone === `instagram:${senderId}`);
        if (!lead) {
          lead = {
            id: `lead-insta-direct-${Date.now()}`,
            name: `@ig_${senderId}`,
            phone: `instagram:${senderId}`,
            stageId: 'stage-1',
            value: 4500,
            interest: `Iniciou conversa no Direct: "${msgText}"`,
            tags: ['📸 Instagram Direct', '🔥 LEAD QUENTE'],
            notes: `Conversa iniciada diretamente pelo Direct do Instagram.`,
            aiPaused: false,
            lastInteraction: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            unreadCount: 1,
          };
          db.leads.unshift(lead);
        } else {
          lead.lastInteraction = new Date().toISOString();
          lead.unreadCount = (lead.unreadCount || 0) + 1;
        }

        db.messages.push({
          id: `msg-dir-in-${Date.now()}`,
          leadId: lead.id,
          phone: `instagram:${senderId}`,
          sender: 'lead',
          text: msgText,
          timestamp: new Date().toISOString(),
          status: 'read',
        });

        // Se a Sofia estiver ativa e o lead não estiver pausado por humano, responder com a IA
        if (!lead.aiPaused && db.agentConfig.isGlobalAiActive !== false) {
          try {
            const aiResp = await processAiConversation(lead, msgText, []);
            const replyText = aiResp.replyText || 'Obrigada pelo contato! Como podemos te ajudar hoje?';

            db.messages.push({
              id: `msg-dir-out-${Date.now()}`,
              leadId: lead.id,
              phone: `instagram:${senderId}`,
              sender: 'ai',
              text: replyText,
              timestamp: new Date().toISOString(),
              status: 'delivered',
            });

            // Enviar resposta no Direct do Instagram via Meta Graph API
            if (token) {
              await sendInstagramDirectMessage(senderId, replyText, token, instaConfig?.pageId);
            }
          } catch (aiErr: any) {
            console.error('[Instagram Direct AI] Erro ao gerar resposta:', aiErr);
          }
        }

        db.saveToFile();
      }
    }
  }
}
