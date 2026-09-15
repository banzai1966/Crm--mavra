import { GoogleGenAI } from '@google/genai';
import { db } from './db';
import { Lead, ChatMessage } from '../src/types';

export interface AIResponseResult {
  replyText: string;
  providerUsed: string;
  modelUsed: string;
  stageTriggered?: string;
  sendCatalogPdf?: boolean;
  extractedInfo?: {
    name?: string;
    email?: string;
    interest?: string;
    value?: number;
  };
}

/**
 * Transcribes incoming WhatsApp voice audio using Google GenAI
 */
export async function transcribeAudioWithGemini(
  base64Audio: string,
  mimeType: string = 'audio/ogg'
): Promise<string> {
  const apiKey = db.agentConfig.geminiApiKey || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const cleanMime = mimeType.split(';')[0].trim() || 'audio/ogg';
  const cleanBase64 = base64Audio.replace(/^data:[^;]+;base64,/, '').trim();

  // Try gemini-2.5-flash which handles native multimodal audio transcription with ultra low latency
  const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: cleanBase64,
                },
              },
              {
                text: 'Transcreva com exatidão todo o áudio falado em português do Brasil. Retorne apenas o texto falado transcrito, sem introduções ou comentários.',
              },
            ],
          },
        ],
      });

      const transcription = response.text?.trim();
      if (transcription) {
        return transcription;
      }
    } catch (err: any) {
      console.warn(`[Audio Transcribe] Modelo ${model} falhou:`, err.message);
    }
  }

  return '';
}

/**
 * Analyzes incoming WhatsApp images/photos (Vision AI) with Gemini
 */
export async function analyzeImageWithGemini(
  base64Image: string,
  caption?: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const apiKey = db.agentConfig.geminiApiKey || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const cleanMime = mimeType.split(';')[0].trim() || 'image/jpeg';
  const cleanBase64 = base64Image.replace(/^data:[^;]+;base64,/, '').trim();

  const promptText = caption?.trim()
    ? `O usuário enviou esta imagem no WhatsApp acompanhada da seguinte legenda/pergunta: "${caption}". Descreva e interprete o conteúdo relevante da imagem (se for comprovante, documento, print de tela, foto de produto ou dúvida) para que possamos entender e responder comercialmente de forma precisa.`
    : 'O usuário enviou esta foto/imagem no WhatsApp sem texto. Descreva sucintamente o que há na imagem (se for comprovante de pagamento, documento, foto de erro, produto ou tabela) em português brasileiro para contexto de atendimento.';

  const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-pro'];

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: cleanBase64,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
      });

      const description = response.text?.trim();
      if (description) {
        return description;
      }
    } catch (err: any) {
      console.warn(`[Image Vision] Modelo ${model} falhou ao analisar imagem:`, err.message);
    }
  }

  return caption || 'Imagem recebida pelo WhatsApp';
}

export async function processAiConversation(
  lead: Lead,
  incomingMessage: string,
  chatHistory: ChatMessage[]
): Promise<AIResponseResult> {
  const config = db.agentConfig;
  const stages = db.stages;

  // Compile full dynamic knowledge base
  const documentsContext = db.documents
    .map((doc) => `[DOCUMENTO: ${doc.name}]\n${doc.contentText}`)
    .join('\n\n');

  const stagesList = stages
    .map((s) => `- ID: "${s.id}" | Nome: "${s.name}"`)
    .join('\n');

  const historyFormatted = chatHistory
    .slice(-10) // Last 10 messages for immediate context
    .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
    .join('\n');

  const systemInstruction = `Você é ${config.personaName}, atuando como ${config.role}.
Seu tom de voz é: ${config.toneOfVoice}.
Seu objetivo comercial primordial é: ${config.salesGoal}.

O lead com quem você está conversando é:
- Nome atual no CRM: ${lead.name}
- Telefone: ${lead.phone}
- E-mail cadastrado: ${lead.email || 'Ainda não informado'}
- Estágio atual do funil: ${stages.find((s) => s.id === lead.stageId)?.name || 'Desconhecido'} (ID: ${lead.stageId})
- Interesse atual: ${lead.interest || 'Não especificado'}

=== BASE DE CONHECIMENTO OFICIAL (VERDADE ABSOLUTA) ===
[FAQ]
${config.knowledgeFaq}

[CATÁLOGO DE PRODUTOS / SERVIÇOS]
${config.knowledgeCatalog}

[TABELA DE PREÇOS E CONDIÇÕES]
${config.knowledgePricing}

[REGRAS DE NEGÓCIO E LIMITES]
${config.knowledgeRules}

${documentsContext ? `[DOCUMENTOS ANEXOS]\n${documentsContext}` : ''}

=== DIRETRIZES E REGRAS DE ATENDIMENTO NO WHATSAPP (MUITO IMPORTANTE) ===
1. Responda SEMPRE em mensagens CURTAS, DINÂMICAS e NATURAIS (máximo de 2 a 3 frases por resposta).
2. NUNCA envie blocos gigantes de texto. Seja caloroso, direto ao ponto e termine sempre com UMA pergunta amigável para continuar a conversa.
3. SIGILO DE TECNOLOGIA E INFRAESTRUTURA:
   - É EXPRESSAMENTE PROIBIDO mencionar nomes de ferramentas internas, infraestrutura técnica ou jargões como "Evolution API", "Supabase", "n8n", "VPS", "Contabo", "Node.js", "Docker", "webhooks" ou similares.
   - Quando questionada sobre a tecnologia do atendimento, apresente a solução como: "uma Inteligência Artificial corporativa de última geração, desenvolvida exclusivamente para atendimento humano, ágil e personalizado da nossa empresa".
4. AGENDAMENTOS E CONSULTAS:
   - Se o lead demonstrar interesse em marcar uma consulta, reunião ou agendamento, pergunte com gentileza qual dia e período (manhã ou tarde) fica melhor para ele.
   - Assim que o lead disser a preferência, confirme o agendamento amigavelmente, registre nas notas e mova o lead no funil para a etapa apropriada ("Qualificado / Interesse" ou "Proposta / Apresentação").
5. ${config.strictKnowledgeOnly ? 'ANTI-ALUCINAÇÃO: Utilize as informações da Base de Conhecimento oficial. Se houver alguma dúvida específica que não conste na base, diga com simpatia que vai verificar com o especialista responsável para passar todos os detalhes.' : 'Mantenha total alinhamento comercial e bom senso.'}
6. CONTEXTO E MENSAGENS INCOMUNS / ENGANOS:
   - Se o lead enviar uma mensagem curta, confusa, ou que pareça conversa pessoal ou engano (por exemplo "oi fulano", "cadê você?", "tudo bem?", "tá podendo falar?"), responda de forma educada, acolhedora e humana.
   - Exemplo: "Olá! Tudo bem? Aqui é a Sofia da MAVRA. Em que posso te ajudar hoje?"
   - NUNCA envie respostas robóticas, jargões técnicos ou suposições forçadas sobre vendas se o cliente ainda não indicou o motivo do contato.
7. CASO O CLIENTE DIRECIONE A CONVERSA DIRETAMENTE AO MARCO DUARTE:
   - Responda cordialmente: "Olá! O Marco já foi avisado da sua mensagem. Gostaria de adiantar em algo enquanto ele assume o atendimento?"
8. ENVIO DE CATÁLOGO / APRESENTAÇÃO EM PDF:
   - Se o lead pedir o material institucional, catálogo, apresentação, PDF, proposta ou tabela detalhada em documento, mencione na mensagem de texto que está anexando a apresentação oficial para ele e defina "sendCatalogPdf": true no JSON.

=== ESTÁGIOS DISPONÍVEIS NO CRM KANBAN ===
${stagesList}

=== FORMATO DE SAÍDA OBRIGATÓRIO (JSON) ===
Você deve responder EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
{
  "replyText": "O texto da mensagem que será enviada diretamente pelo WhatsApp para o lead",
  "suggestedStageId": "ID do estágio para onde mover o lead no CRM se a intenção ou contexto mudou, ou null se mantiver o mesmo",
  "sendCatalogPdf": true ou false (true apenas se o lead solicitou apresentação/catálogo/PDF),
  "extractedInfo": {
    "name": "Nome da pessoa caso ela tenha dito ou corrigido (ou null)",
    "email": "E-mail informado pelo lead (ou null)",
    "interest": "Resumo do produto/serviço que ele demonstrou interesse (ou null)",
    "value": 0 ou valor numérico estimado se aplicável (ou null)
  }
}`;

  const prompt = `HISTÓRICO RECENTE DO CHAT:\n${historyFormatted}\n\nNOVA MENSAGEM DO LEAD:\n${incomingMessage}`;

  // Check which provider is active
  const provider = config.activeProvider;

  if (provider === 'gemini') {
    return await callGemini(config.activeModel, systemInstruction, prompt, config.geminiApiKey);
  } else if (provider === 'openai') {
    return await callOpenAI(config.activeModel, systemInstruction, prompt, config.openaiApiKey);
  } else if (provider === 'anthropic') {
    return await callAnthropic(config.activeModel, systemInstruction, prompt, config.anthropicApiKey);
  }

  // Default fallback to Gemini
  return await callGemini('gemini-2.5-flash', systemInstruction, prompt, config.geminiApiKey);
}

// 1. Google Gemini via @google/genai SDK with automatic retry & model fallback
async function callGemini(
  modelName: string,
  systemInstruction: string,
  prompt: string,
  apiKeyOverride?: string
): Promise<AIResponseResult> {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Chave de API do Gemini (GEMINI_API_KEY) não configurada.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Try prioritized models in sequence in case of 503 / high demand spikes
  const candidateModels = [
    modelName || 'gemini-2.5-flash',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const candidate of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: candidate,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const rawText = response.text || '';
      if (rawText) {
        return parseAIJsonOutput(rawText, 'Google Gemini', candidate);
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Fallback] Modelo ${candidate} falhou (${err.message}). Tentando próximo modelo...`);
      // Short delay before fallback attempt
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // If all models hit 503 or quota, provide smart contextual knowledge reply based on DB
  console.warn('[Gemini] Todos os modelos Gemini esgotaram retries. Gerando resposta contextual de segurança...');
  return generateRuleBasedSafetyReply(prompt);
}

// Resposta contextual de segurança caso a rede do provedor de IA esteja temporariamente fora do ar
function generateRuleBasedSafetyReply(prompt: string): AIResponseResult {
  const lower = prompt.toLowerCase();
  let reply = 'Olá! Recebi sua mensagem com sucesso. Nosso arquiteto especialista Marco Duarte já foi notificado e responderá você em instantes!';
  let suggestedStage: string | undefined = undefined;
  let estimatedValue: number | undefined = undefined;
  let interest: string | undefined = undefined;

  if (lower.includes('enterprise') || lower.includes('atendente') || lower.includes('empresa')) {
    reply = 'Olá! Que excelente iniciativa. Nosso Plano Enterprise conta com atendimento multi-atendente, IA autônoma para WhatsApp e integrações sob medida. Nosso especialista Marco Duarte entrará em contato em instantes para alinhar sua proposta personalizada!';
    suggestedStage = 'stage-3'; // Proposta
    estimatedValue = 12500;
    interest = 'Plano Enterprise';
  } else if (lower.includes('preço') || lower.includes('valor') || lower.includes('quanto custa') || lower.includes('plano')) {
    reply = 'Olá! Nossos planos começam a partir de R$ 980/mês para o plano Pro até soluções Enterprise customizadas para grandes operações. O que você gostaria de automatizar no seu atendimento hoje?';
    suggestedStage = 'stage-2'; // Qualificado
    interest = 'Consulta de Preços/Planos';
  }

  return {
    replyText: reply,
    providerUsed: 'Sofia (Modo de Contingência Ativo)',
    modelUsed: 'Knowledge Engine Fallback',
    stageTriggered: suggestedStage,
    extractedInfo: {
      interest,
      value: estimatedValue,
    },
  };
}

// 2. OpenAI Provider (GPT-4o / GPT-4o-mini)
async function callOpenAI(
  modelName: string,
  systemInstruction: string,
  prompt: string,
  apiKeyOverride?: string
): Promise<AIResponseResult> {
  const apiKey = apiKeyOverride || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // If OpenAI key is not provided, fall back to Gemini smoothly with note
    console.warn('OpenAI API Key não encontrada, usando Gemini como fallback seguro.');
    return await callGemini('gemini-2.5-flash', systemInstruction, prompt);
  }

  const selectedModel = modelName || 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: selectedModel,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('OpenAI API Error:', errText);
    throw new Error(`OpenAI API falhou: ${res.statusText}`);
  }

  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content || '';
  return parseAIJsonOutput(rawText, 'OpenAI', selectedModel);
}

// 3. Anthropic Provider (Claude 3.5 Sonnet)
async function callAnthropic(
  modelName: string,
  systemInstruction: string,
  prompt: string,
  apiKeyOverride?: string
): Promise<AIResponseResult> {
  const apiKey = apiKeyOverride || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('Anthropic API Key não encontrada, usando Gemini como fallback seguro.');
    return await callGemini('gemini-2.5-flash', systemInstruction, prompt);
  }

  const selectedModel = modelName || 'claude-3-5-sonnet-20241022';

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: selectedModel,
      max_tokens: 1024,
      system: systemInstruction + '\nIMPORTANTE: Retorne APENAS o bloco JSON válido sem markdown ou backticks.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Anthropic API Error:', errText);
    throw new Error(`Anthropic API falhou: ${res.statusText}`);
  }

  const data = await res.json();
  const rawText = data.content?.[0]?.text || '';
  return parseAIJsonOutput(rawText, 'Anthropic', selectedModel);
}

// Helper: Parse structured AI JSON output
function parseAIJsonOutput(rawText: string, provider: string, model: string): AIResponseResult {
  try {
    // Strip markdown code fences if present
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      replyText: parsed.replyText || 'Olá! Como posso ajudar você hoje?',
      providerUsed: provider,
      modelUsed: model,
      stageTriggered: parsed.suggestedStageId || undefined,
      sendCatalogPdf: Boolean(parsed.sendCatalogPdf),
      extractedInfo: parsed.extractedInfo || undefined,
    };
  } catch (err) {
    console.error('Erro ao interpretar JSON da IA:', err, 'Raw:', rawText);
    return {
      replyText: rawText || 'Olá! Recebi sua mensagem e nosso time de especialistas entrará em contato em breve.',
      providerUsed: provider,
      modelUsed: model,
    };
  }
}
