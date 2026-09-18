import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import { handleIncomingWebhook } from './server/webhook';
import {
  sendWhatsAppMessage,
  checkEvolutionStatus,
  fetchRemoteWebhookConfig,
  setRemoteWebhookConfig,
  sanitizeEvolutionUrl,
  getEvolutionQRCode,
  createEvolutionInstance,
  logoutEvolutionInstance,
  fetchAllEvolutionInstances,
} from './server/evolution';
import { processAiConversation, synthesizeSpeech, testGeminiApiKey } from './server/ai';
import { runFollowUpCycle, startFollowUpScheduler, followUpLogs, generateFollowUpMessage } from './server/followup';
import { ChatMessage } from './src/types';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // CORS middleware for safety
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'MAVRA CRM Conversacional Autônomo',
      admin: 'Marco Duarte (marco.agduarte22@gmail.com)',
      time: new Date().toISOString(),
    });
  });

  // =========================================================================
  // 1. BLINDED EVOLUTION API WEBHOOK (<50ms Guaranteed Response)
  // Supports both /api/webhook and /api/whatsapp/webhook for compatibility
  // =========================================================================
  const webhookHandler = (req: Request, res: Response) => {
    // 1. Respond immediately to Evolution API to prevent timeouts (<50ms)
    res.status(200).json({ status: 'received' });

    // 2. Process asynchronous pipeline in background
    handleIncomingWebhook(req.body);
  };

  app.post('/api/webhook', webhookHandler);
  app.post('/api/whatsapp/webhook', webhookHandler);

  // Simulator route to simulate incoming WhatsApp message directly from the UI
  app.post('/api/webhook/simulate', (req: Request, res: Response) => {
    const { phone, message, pushName, mediaType, fileName } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const simulatedPayload: any = {
      event: 'messages.upsert',
      data: {
        key: {
          remoteJid: `${cleanPhone}@s.whatsapp.net`,
          fromMe: false,
          id: 'SIM-' + Date.now(),
        },
        pushName: pushName || 'Lead WhatsApp',
        message: {},
      },
    };

    if (mediaType === 'audio') {
      simulatedPayload.data.messageType = 'audioMessage';
      simulatedPayload.data.message = {
        conversation: message,
        audioMessage: {
          mimetype: 'audio/ogg; codecs=opus',
          seconds: 8,
        },
      };
    } else if (mediaType === 'document') {
      simulatedPayload.data.messageType = 'documentMessage';
      simulatedPayload.data.message = {
        documentMessage: {
          fileName: fileName || 'comprovante_pix.pdf',
          mimetype: 'application/pdf',
          caption: message,
        },
      };
    } else if (mediaType === 'image') {
      simulatedPayload.data.messageType = 'imageMessage';
      simulatedPayload.data.message = {
        imageMessage: {
          caption: message,
          mimetype: 'image/jpeg',
        },
      };
    } else {
      simulatedPayload.data.messageType = 'conversation';
      simulatedPayload.data.message = {
        conversation: message,
      };
    }

    // Return immediate confirmation
    res.status(200).json({ status: 'simulated_queued' });

    // Pass to webhook background handler
    handleIncomingWebhook(simulatedPayload);
  });

  // =========================================================================
  // 2. CRM LEADS & STAGES API
  // =========================================================================
  app.get('/api/stages', (req: Request, res: Response) => {
    res.json(db.stages);
  });

  app.put('/api/stages', (req: Request, res: Response) => {
    const { stages } = req.body;
    if (Array.isArray(stages)) {
      db.stages = stages;
      return res.json({ success: true, stages: db.stages });
    }
    res.status(400).json({ error: 'Formato inválido de estágios' });
  });

  app.get('/api/leads', (req: Request, res: Response) => {
    res.json(db.leads);
  });

  app.post('/api/leads', (req: Request, res: Response) => {
    const { name, phone, email, stageId, value, interest, tags, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const newLead = {
      id: 'lead-' + Date.now(),
      name,
      phone: cleanPhone,
      email: email || '',
      stageId: stageId || db.stages[0]?.id || 'stage-1',
      value: Number(value) || 0,
      interest: interest || '',
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || '',
      aiPaused: false,
      lastInteraction: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      unreadCount: 0,
    };

    db.leads.unshift(newLead);
    db.saveToFile();
    res.status(201).json(newLead);
  });

  app.put('/api/leads/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.leads.findIndex((l) => l.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    db.leads[index] = {
      ...db.leads[index],
      ...req.body,
      phone: req.body.phone ? req.body.phone.replace(/\D/g, '') : db.leads[index].phone,
    };

    db.saveToFile();
    res.json(db.leads[index]);
  });

  app.delete('/api/leads/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.leads = db.leads.filter((l) => l.id !== id);
    db.messages = db.messages.filter((m) => m.leadId !== id);
    db.saveToFile();
    res.json({ success: true });
  });

  // Clear all leads and messages to start with a 100% clean CRM for production
  app.post('/api/leads/clear-all', (req: Request, res: Response) => {
    db.clearAllLeads();
    res.json({ success: true, count: 0, leads: [] });
  });

  // Restore initial demo leads for presentations and testing
  app.post('/api/leads/restore-demo', (req: Request, res: Response) => {
    db.restoreDemoLeads();
    res.json({ success: true, count: db.leads.length, leads: db.leads });
  });

  app.put('/api/leads/:id/stage', (req: Request, res: Response) => {
    const { id } = req.params;
    const { stageId } = req.body;
    const lead = db.leads.find((l) => l.id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    const stage = db.stages.find((s) => s.id === stageId);
    if (!stage) {
      return res.status(400).json({ error: 'Estágio inválido' });
    }

    lead.stageId = stageId;
    lead.notes = `${lead.notes || ''}\n[${new Date().toLocaleDateString('pt-BR')}] Movido manualmente para "${stage.name}".`;
    db.saveToFile();
    res.json(lead);
  });

  app.put('/api/leads/:id/ai-toggle', (req: Request, res: Response) => {
    const { id } = req.params;
    const lead = db.leads.find((l) => l.id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    lead.aiPaused = !lead.aiPaused;

    // Log status in chat
    const systemMsg = {
      id: 'msg-' + Date.now() + '-sys',
      leadId: lead.id,
      phone: lead.phone,
      sender: 'system' as const,
      text: lead.aiPaused
        ? '⚠️ Atendimento Humano ativado: O atendente assumiu a conversa. A IA está pausada.'
        : '🤖 Atendimento com IA reativado: As respostas voltarão a ser automáticas.',
      timestamp: new Date().toISOString(),
      status: 'read' as const,
    };
    db.messages.push(systemMsg);

    res.json({ lead, message: systemMsg });
  });

  app.put('/api/leads/:id/resolve-urgency', (req: Request, res: Response) => {
    const { id } = req.params;
    const lead = db.leads.find((l) => l.id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    lead.isUrgent = false;
    lead.tags = lead.tags.filter((t) => t !== 'URGENTE');
    lead.notes = `${lead.notes || ''}\n✅ [URGÊNCIA ATENDIDA ${new Date().toLocaleTimeString('pt-BR')}]: Situação acolhida pela equipe humana.`;
    db.saveToFile();
    res.json(lead);
  });

  app.put('/api/leads/:id/confirm-triage', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { confirmedDate, message } = req.body;
    const lead = db.leads.find((l) => l.id === id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    if (!lead.triage) {
      lead.triage = { status: 'confirmed' };
    } else {
      lead.triage.status = 'confirmed';
    }

    const confirmText = message || `Olá, ${lead.name.split(' ')[0]}! Aqui é da equipe da clínica. Confirmamos seu agendamento com a Dra. para ${confirmedDate || 'a data solicitada'}! Qualquer dúvida antes do horário, estamos à disposição.`;
    
    // Send confirmation message via WhatsApp
    await sendWhatsAppMessage(lead.phone, confirmText);

    const systemMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-triage-confirmed',
      leadId: lead.id,
      phone: lead.phone,
      sender: 'agent',
      text: `🗓️ [Agendamento Confirmado via WhatsApp]: ${confirmText}`,
      timestamp: new Date().toISOString(),
      status: 'delivered',
    };
    db.messages.push(systemMsg);

    lead.notes = `${lead.notes || ''}\n[${new Date().toLocaleDateString('pt-BR')}] Agendamento confirmado para ${confirmedDate || 'horário agendado'}.`;
    db.saveToFile();

    res.json({ success: true, lead, message: systemMsg });
  });

  // Export leads as CSV
  app.get('/api/leads/export/csv', (req: Request, res: Response) => {
    const headers = ['ID', 'Nome', 'Telefone', 'Email', 'Etapa', 'Valor', 'Urgente', 'Motivo Urgencia', 'Triagem Procedimento', 'Triagem Periodo', 'Tags', 'Criado Em', 'Ultima Interacao'];
    const rows = db.leads.map((l) => {
      const stageName = db.stages.find((s) => s.id === l.stageId)?.name || l.stageId;
      return [
        `"${l.id}"`,
        `"${(l.name || '').replace(/"/g, '""')}"`,
        `"${l.phone}"`,
        `"${(l.email || '').replace(/"/g, '""')}"`,
        `"${stageName}"`,
        `${l.value || 0}`,
        `"${l.isUrgent ? 'SIM' : 'NAO'}"`,
        `"${(l.urgencyReason || '').replace(/"/g, '""')}"`,
        `"${(l.triage?.procedure || '').replace(/"/g, '""')}"`,
        `"${(l.triage?.preferredPeriod || '').replace(/"/g, '""')}"`,
        `"${(l.tags || []).join('; ')}"`,
        `"${l.createdAt}"`,
        `"${l.lastInteraction}"`,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="nexa-crm-leads-${Date.now()}.csv"`);
    res.send(csvContent);
  });

  // =========================================================================
  // 3. LIVE CHAT API
  // =========================================================================
  app.get('/api/chat/:leadId', (req: Request, res: Response) => {
    const { leadId } = req.params;
    const lead = db.leads.find((l) => l.id === leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    // Reset unread count when opening conversation
    lead.unreadCount = 0;

    const msgs = db.messages.filter((m) => m.leadId === leadId);
    res.json(msgs);
  });

  app.post('/api/chat/send', async (req: Request, res: Response) => {
    const { leadId, text, sendViaWhatsApp } = req.body;
    if (!leadId || !text) {
      return res.status(400).json({ error: 'leadId e text são obrigatórios' });
    }

    const lead = db.leads.find((l) => l.id === leadId);
    if (!lead) {
      return res.status(404).json({ error: 'Lead não encontrado' });
    }

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now() + '-agent',
      leadId: lead.id,
      phone: lead.phone,
      sender: 'agent',
      text: text.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
    };

    db.messages.push(newMsg);
    lead.lastInteraction = new Date().toISOString();

    // Optionally send via Evolution API
    if (sendViaWhatsApp !== false) {
      const sendResult = await sendWhatsAppMessage(lead.phone, text.trim());
      if (sendResult.success) {
        newMsg.status = 'delivered';
      }
    }

    res.status(201).json(newMsg);
  });

  // =========================================================================
  // 4. AGENT BUILDER & KNOWLEDGE BASE API
  // =========================================================================
  app.get('/api/agent-config', (req: Request, res: Response) => {
    res.json(db.agentConfig);
  });

  app.put('/api/agent-config', (req: Request, res: Response) => {
    db.agentConfig = {
      ...db.agentConfig,
      ...req.body,
    };
    db.saveToFile();
    res.json(db.agentConfig);
  });

  // Test Gemini API key live
  app.post('/api/agent-config/test-key', async (req: Request, res: Response) => {
    const { apiKey } = req.body;
    try {
      const result = await testGeminiApiKey(apiKey);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Trigger manual or background follow-up check for dormant leads
  app.post('/api/followup/run', async (req: Request, res: Response) => {
    const executed = await runFollowUpCycle();
    res.json({ success: true, count: executed.sent, leadsFollowedUp: executed.logs.map(l => l.leadName) });
  });

  // Instant AI playground testing endpoint
  app.post('/api/test-ai', async (req: Request, res: Response) => {
    const { prompt, leadMock } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Mensagem de teste obrigatória' });
    }

    const testLead = leadMock || db.leads[0] || {
      id: 'test-lead',
      name: 'Lead Teste',
      phone: '5511999998888',
      stageId: db.stages[0]?.id || 'stage-1',
      value: 0,
      interest: 'Demonstração do MAVRA',
      tags: ['Teste'],
      aiPaused: false,
      lastInteraction: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await processAiConversation(testLead, prompt, []);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Voice synthesis testing endpoint for instant audio preview in UI
  app.post('/api/test-voice', async (req: Request, res: Response) => {
    const { text, apiKey, voiceName, engine } = req.body;
    const testText = text || 'Olá! Aqui é a Sofia da MAVRA. Tudo bem com você? Como posso te ajudar hoje?';
    try {
      const result = await synthesizeSpeech(testText, {
        apiKey,
        voiceName,
        engine,
      });
      if (result.success && result.audioBase64) {
        res.json({ success: true, audioBase64: result.audioBase64, engineUsed: result.engineUsed, notice: result.notice });
      } else {
        res.status(400).json({ success: false, error: result.error || 'Falha ao sintetizar áudio' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Documents
  app.get('/api/documents', (req: Request, res: Response) => {
    res.json(db.documents);
  });

  app.post('/api/documents', (req: Request, res: Response) => {
    const { name, type, contentText, size } = req.body;
    if (!name || !contentText) {
      return res.status(400).json({ error: 'Nome e conteúdo do documento são obrigatórios' });
    }

    const newDoc = {
      id: 'doc-' + Date.now(),
      name,
      type: type || 'txt',
      size: size || contentText.length,
      contentText,
      uploadedAt: new Date().toISOString(),
    };

    db.documents.push(newDoc);
    res.status(201).json(newDoc);
  });

  app.delete('/api/documents/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.documents = db.documents.filter((d) => d.id !== id);
    res.json({ success: true });
  });

  // =========================================================================
  // 5. EVOLUTION API & SUPABASE CONFIGURATION
  // =========================================================================
  app.get('/api/evolution-config', async (req: Request, res: Response) => {
    // Dynamically check live connection state with the VPS
    try {
      const status = await checkEvolutionStatus();
      db.evolutionConfig.isConnected = status.isConnected;
      db.evolutionConfig.state = status.state;
      if (status.qrcode) db.evolutionConfig.qrcode = status.qrcode;
    } catch (e) {}
    res.json(db.evolutionConfig);
  });

  app.put('/api/evolution-config', (req: Request, res: Response) => {
    const raw = req.body || {};
    db.evolutionConfig = {
      ...db.evolutionConfig,
      ...raw,
      serverUrl: raw.serverUrl ? sanitizeEvolutionUrl(raw.serverUrl) : db.evolutionConfig.serverUrl,
      apiKey: raw.apiKey ? raw.apiKey.trim() : db.evolutionConfig.apiKey,
      instanceName: raw.instanceName ? raw.instanceName.trim() : db.evolutionConfig.instanceName,
    };
    res.json(db.evolutionConfig);
  });

  app.post('/api/evolution/test-connection', async (req: Request, res: Response) => {
    const status = await checkEvolutionStatus();
    db.evolutionConfig.isConnected = status.isConnected;
    db.evolutionConfig.state = status.state;
    db.evolutionConfig.qrcode = status.qrcode;
    db.evolutionConfig.lastTestedAt = new Date().toISOString();
    res.json(db.evolutionConfig);
  });

  // Fetch live QR Code for connecting WhatsApp
  app.get('/api/evolution/qrcode', async (req: Request, res: Response) => {
    const instance = req.query.instance as string | undefined;
    const result = await getEvolutionQRCode(instance);
    res.json(result);
  });

  // Fetch all instances from VPS
  app.get('/api/evolution/instances', async (req: Request, res: Response) => {
    const result = await fetchAllEvolutionInstances();
    res.json(result);
  });

  // Create a new instance dynamically
  app.post('/api/evolution/create-instance', async (req: Request, res: Response) => {
    const { instanceName } = req.body;
    if (!instanceName) {
      return res.status(400).json({ error: 'instanceName é obrigatório' });
    }
    const result = await createEvolutionInstance(instanceName);
    res.json(result);
  });

  // Logout / Disconnect instance
  app.post('/api/evolution/logout', async (req: Request, res: Response) => {
    const { instanceName } = req.body;
    const result = await logoutEvolutionInstance(instanceName);
    if (result.success) {
      db.evolutionConfig.isConnected = false;
      db.evolutionConfig.state = 'disconnected';
    }
    res.json(result);
  });

  // Check what webhook URL is currently configured inside the Evolution API VPS
  app.get('/api/evolution/remote-webhook', async (req: Request, res: Response) => {
    const result = await fetchRemoteWebhookConfig();
    res.json(result);
  });

  // Automatically save the current Mavra webhook URL into the Evolution API VPS with 1 click
  app.post('/api/evolution/auto-set-webhook', async (req: Request, res: Response) => {
    const { webhookUrl } = req.body;
    if (!webhookUrl) {
      return res.status(400).json({ error: 'webhookUrl é obrigatória' });
    }
    const result = await setRemoteWebhookConfig(webhookUrl);
    res.json(result);
  });

  // Real-time Webhook Event Logs for debugging
  app.get('/api/webhook/logs', (req: Request, res: Response) => {
    res.json(db.webhookLogs);
  });

  app.delete('/api/webhook/logs', (req: Request, res: Response) => {
    db.webhookLogs = [];
    res.json({ success: true });
  });

  app.get('/api/supabase-config', (req: Request, res: Response) => {
    res.json(db.supabaseConfig);
  });

  app.put('/api/supabase-config', async (req: Request, res: Response) => {
    db.supabaseConfig = {
      ...db.supabaseConfig,
      ...req.body,
    };
    const connected = db.initSupabaseClient();
    await db.saveToFile();
    if (connected) {
      await db.syncToSupabase();
    }
    res.json({
      ...db.supabaseConfig,
      isConnected: connected,
    });
  });

  app.post('/api/supabase/sync', async (req: Request, res: Response) => {
    if (!db.supabaseConfig.isConnected || !db.getSupabaseClient()) {
      return res.status(400).json({ error: 'Supabase não conectado' });
    }
    await db.syncToSupabase();
    res.json({ success: true, message: 'Dados sincronizados com o Supabase' });
  });

  app.get('/api/supabase/schema', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(db.getSupabaseMigrationSQL());
  });

  // =========================================================================
  // 5. AUTOMATED FOLLOW-UP API & LOGS
  // =========================================================================
  app.get('/api/followup/logs', (req: Request, res: Response) => {
    res.json(followUpLogs);
  });

  app.post('/api/followup/run-now', async (req: Request, res: Response) => {
    const result = await runFollowUpCycle();
    res.json({
      success: true,
      message: `Ciclo executado com sucesso: ${result.sent} mensagens de follow-up disparadas para ${result.evaluated} leads analisados.`,
      result,
    });
  });

  app.post('/api/followup/preview', (req: Request, res: Response) => {
    const { leadId, niche, customMessage } = req.body;
    const lead = db.leads.find((l) => l.id === leadId) || db.leads[0];
    if (!lead) {
      return res.status(404).json({ error: 'Nenhum lead encontrado' });
    }
    const sampleMsg = generateFollowUpMessage(lead, niche || db.agentConfig.followUpNiche || 'dental', customMessage);
    res.json({ previewText: sampleMsg, leadName: lead.name });
  });

  // =========================================================================
  // 6. VITE MIDDLEWARE (DEV) & STATIC SERVING (PROD)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAVRA Server running on http://0.0.0.0:${PORT}`);
    console.log(`Master Admin: Marco Duarte (marco.agduarte22@gmail.com)`);

    // Start background automated follow-up loop
    startFollowUpScheduler();
  });
}

startServer();
