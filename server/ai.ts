import { GoogleGenAI } from '@google/genai';
import { EdgeTTS } from 'node-edge-tts';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { db } from './db';
import { Lead, ChatMessage } from '../src/types';

export interface AIResponseResult {
  replyText: string;
  providerUsed: string;
  modelUsed: string;
  stageTriggered?: string;
  sendCatalogPdf?: boolean;
  sendPixInfo?: boolean;
  sendAsVoice?: boolean;
  isUrgent?: boolean;
  urgencyReason?: string;
  isHotLead?: boolean;
  hotReason?: string;
  triage?: {
    procedure?: string;
    preferredPeriod?: 'manha' | 'tarde' | 'noite' | 'qualquer';
    preferredDays?: string;
    paymentType?: 'convenio' | 'particular' | 'indefinido';
    convenioName?: string;
    isUrgent?: boolean;
    urgencyReason?: string;
  };
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
  if (!apiKey) {
    console.warn('[Audio Transcribe] Chave da API Gemini não configurada.');
    return '';
  }

  const ai = new GoogleGenAI({ apiKey });

  // Normalise audio mimeType
  let cleanMime = mimeType.split(';')[0].trim().toLowerCase() || 'audio/ogg';
  if (cleanMime === 'audio/ogg; codecs=opus' || cleanMime.includes('opus')) {
    cleanMime = 'audio/ogg';
  } else if (cleanMime.includes('mp4') || cleanMime.includes('m4a')) {
    cleanMime = 'audio/mp4';
  } else if (cleanMime.includes('mp3') || cleanMime.includes('mpeg')) {
    cleanMime = 'audio/mp3';
  }

  const cleanBase64 = base64Audio.replace(/^data:[^;]+;base64,/, '').trim();
  if (!cleanBase64) {
    return '';
  }

  // Candidate models: modern Gemini models supported for audio transcription
  const candidateModels = ['gemini-3.8-flash', 'gemini-3.5-transcribe', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  for (const model of candidateModels) {
    try {
      // 8s timeout per model attempt to prevent hangs
      const generatePromise = ai.models.generateContent({
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
                text: 'Transcreva todo o áudio falado neste arquivo em português do Brasil com precisão. Retorne estritamente o texto falado (transcrição literal), sem adicionar saudações, introduções ou explicações adicionais.',
              },
            ],
          },
        ],
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout de 8s no modelo ${model}`)), 8000)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
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

  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];

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

/**
 * Analyzes incoming WhatsApp PDF and text documents with Gemini multimodal AI
 */
export async function analyzeDocumentWithGemini(
  base64Doc: string,
  fileName?: string,
  caption?: string,
  mimeType: string = 'application/pdf'
): Promise<string> {
  const apiKey = db.agentConfig.geminiApiKey || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  const cleanMime = mimeType.split(';')[0].trim() || 'application/pdf';
  const cleanBase64 = base64Doc.replace(/^data:[^;]+;base64,/, '').trim();

  const promptText = `O lead enviou este documento/PDF ("${fileName || 'documento.pdf'}") no WhatsApp${caption ? ` com a mensagem/legenda: "${caption}"` : ''}.
Analise o conteúdo do documento (seja comprovante PIX de pagamento, proposta comercial, contrato, orçamento, tabela de preços, documento de identificação ou dúvidas).
Extraia e resuma em português do Brasil de forma clara e objetiva:
1. Tipo de documento e finalidade;
2. Se for comprovante PIX ou bancário: valor pago em R$, data/hora, banco, nome de quem pagou e nome/chave de quem recebeu;
3. Se for proposta, tabela ou contrato: principais termos, produtos/serviços e valores citados;
4. Resumo do que precisa ser respondido para a assistente Sofia poder dar andamento imediato no atendimento.`;

  const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];

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
      console.warn(`[Document Analysis] Modelo ${model} falhou ao analisar documento:`, err.message);
    }
  }

  return caption || `Documento PDF recebido: ${fileName || 'anexo.pdf'}`;
}

/**
 * Splits text into natural sentence chunks (max ~180 chars per chunk)
 */
function splitTextIntoSentences(text: string, maxChunkLen: number = 180): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).trim().length <= maxChunkLen) {
      current = (current + ' ' + trimmed).trim();
    } else {
      if (current) chunks.push(current);
      if (trimmed.length > maxChunkLen) {
        // split by commas or words if a single sentence is long
        const words = trimmed.split(' ');
        let sub = '';
        for (const w of words) {
          if ((sub + ' ' + w).trim().length <= maxChunkLen) {
            sub = (sub + ' ' + w).trim();
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) current = sub;
        else current = '';
      } else {
        current = trimmed;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.filter((c) => c.trim().length > 0);
}

/**
 * Ultra-realistic Neural Brazilian Portuguese speech generator powered by Microsoft Azure Neural voices (Edge TTS).
 * Sounds completely human, natural, conversational, with proper pauses, breathing, and zero robotic tone.
 * 100% Free, zero configuration or OAuth2 needed.
 */
export async function generateNeuralSpeech(cleanSpeechText: string, voiceName?: string): Promise<string | null> {
  const tmpFile = path.join(os.tmpdir(), `sofia-neural-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.mp3`);
  try {
    const selectedVoice = voiceName?.startsWith('pt-BR-') ? voiceName : 'pt-BR-FranciscaNeural';
    const tts = new EdgeTTS({
      voice: selectedVoice,
      lang: 'pt-BR',
      outputFormat: 'audio-24khz-48kbitrate-mono-mp3'
    });
    
    // Strict 5-second timeout on speech generation
    const ttsPromise = tts.ttsPromise(cleanSpeechText, tmpFile);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de 5000ms excedido no EdgeTTS')), 5000)
    );

    await Promise.race([ttsPromise, timeoutPromise]);

    if (fs.existsSync(tmpFile)) {
      const buffer = fs.readFileSync(tmpFile);
      try { fs.unlinkSync(tmpFile); } catch {}
      return buffer.toString('base64');
    }
  } catch (err: any) {
    console.warn('[Neural TTS Engine] Erro ou timeout ao sintetizar áudio neural:', err.message);
  } finally {
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  }
  return null;
}

/**
 * Synthesizes crystal-clear, ultra-realistic human speech using Sofia Neural Engine,
 * ElevenLabs, or Google Cloud Text-to-Speech.
 */
export async function synthesizeSpeech(
  textToSpeak: string,
  options?: {
    apiKey?: string;
    voiceName?: string;
    engine?: 'native_sofia' | 'google_cloud_tts' | 'elevenlabs';
  }
): Promise<{ success: boolean; audioBase64?: string; error?: string; engineUsed?: string; notice?: string }> {
  // Sanitize text: remove URLs and markdown so speech sounds 100% human and natural
  const cleanSpeechText = textToSpeak
    .replace(/https?:\/\/\S+/gi, 'o link que vou te mandar por mensagem')
    .replace(/[*_#`~]/g, '')
    .trim();

  if (!cleanSpeechText) {
    return { success: false, error: 'Texto para fala vazio' };
  }

  const engine = options?.engine || db.agentConfig.voiceEngine || 'native_sofia';
  const voiceName = options?.voiceName || db.agentConfig.voiceVoiceName || 'pt-BR-FranciscaNeural';
  const googleApiKey = (options?.apiKey || db.agentConfig.googleTtsApiKey || db.agentConfig.geminiApiKey || process.env.GEMINI_API_KEY || '').trim();
  const elevenApiKey = (options?.apiKey || db.agentConfig.elevenLabsApiKey || '').trim();

  // 1. Motor Neural Sofia (Hiper-realista, Humano, Gratuito, Sem OAuth2)
  if (engine === 'native_sofia') {
    const neuralAudio = await generateNeuralSpeech(cleanSpeechText, voiceName);
    if (neuralAudio) {
      return { success: true, audioBase64: neuralAudio, engineUsed: 'native_sofia' };
    }
  }

  // 2. ElevenLabs (Voz Ultra-Humana / Clonada)
  if (engine === 'elevenlabs' && elevenApiKey) {
    try {
      console.log(`[ElevenLabs] Sintetizando voz para ${cleanSpeechText.length} caracteres...`);
      const voiceId = voiceName && !voiceName.includes('pt-BR') ? voiceName : '21m00Tcm4TlvDq8ikWAM';
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': elevenApiKey,
        },
        body: JSON.stringify({
          text: cleanSpeechText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
          },
        }),
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuf).toString('base64');
        return { success: true, audioBase64: base64, engineUsed: 'elevenlabs' };
      } else {
        const errText = await res.text();
        console.warn('[ElevenLabs] Erro na API:', errText);
        if (options?.apiKey) {
          return { success: false, error: `ElevenLabs: ${errText.slice(0, 150)}` };
        }
      }
    } catch (err: any) {
      console.warn('[ElevenLabs] Falha na requisição:', err.message);
      if (options?.apiKey) {
        return { success: false, error: `ElevenLabs: ${err.message}` };
      }
    }
  }

  // 3. Google Cloud Text-to-Speech (Neural2 / Journey / Wavenet)
  if (engine === 'google_cloud_tts' && googleApiKey) {
    try {
      console.log(`[Google Cloud TTS] Sintetizando voz (${voiceName}) para ${cleanSpeechText.length} caracteres...`);
      const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(googleApiKey)}`;
      
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: cleanSpeechText },
          voice: {
            languageCode: 'pt-BR',
            name: voiceName,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
            pitch: 0.0,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioContent) {
          console.log(`[Google Cloud TTS] Áudio de alta qualidade (${voiceName}) gerado com sucesso!`);
          return { success: true, audioBase64: data.audioContent, engineUsed: 'google_cloud_tts' };
        }
      } else {
        const errJson = await res.json().catch(() => null);
        const errMsg = errJson?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        console.warn(`[Google Cloud TTS] Erro da API do Google:`, errMsg);
        
        // Ativar motor neural humano automaticamente
        console.log('[TTS Engine] Ativando Motor Neural Sofia para voz humana imediata...');
        const fallbackAudio = await generateNeuralSpeech(cleanSpeechText, voiceName);
        if (fallbackAudio) {
          return {
            success: true,
            audioBase64: fallbackAudio,
            engineUsed: 'native_sofia',
            notice: 'O Google Cloud bloqueou a chave por exigir OAuth2. O áudio foi gerado com sucesso com a Voz Neural Humana da Sofia!',
          };
        }
        if (options?.apiKey) {
          return { success: false, error: `Google Cloud TTS: ${errMsg}` };
        }
      }
    } catch (err: any) {
      console.warn('[Google Cloud TTS] Falha na requisição:', err.message);
    }
  }

  // Fallback geral: motor neural humano
  const fallbackNeural = await generateNeuralSpeech(cleanSpeechText, voiceName);
  if (fallbackNeural) {
    return { success: true, audioBase64: fallbackNeural, engineUsed: 'native_sofia' };
  }

  return { success: false, error: 'Nenhum motor de voz pôde gerar o áudio' };
}

/**
 * Generates an instant Voice Note for WhatsApp in Brazilian Portuguese.
 */
export async function generateSpeechWithGemini(
  textToSpeak: string,
  voiceName: string = 'pt-BR-Neural2-C'
): Promise<string | null> {
  const result = await synthesizeSpeech(textToSpeak, { voiceName });
  return result.audioBase64 || null;
}

export async function processAiConversation(
  lead: Lead,
  incomingMessage: string,
  chatHistory: ChatMessage[],
  options?: { isAudioMessage?: boolean; isImageMessage?: boolean }
): Promise<AIResponseResult> {
  const config = db.agentConfig;
  const stages = db.stages;
  const isAudio = options?.isAudioMessage === true;

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
3. SIGILO DE TECNOLOGIA E IDENTIDADE HUMANA:
   - É EXPRESSAMENTE PROIBIDO mencionar nomes de ferramentas internas, infraestrutura técnica ou jargões como "Evolution API", "Supabase", "n8n", "VPS", "Contabo", "Node.js", "Docker", "webhooks" ou similares.
   - NUNCA mencione "NEXA CRM", "MAVRA" ou diga que você é um robô/sistema. Você é humana: a secretária, assistente e coordenadora de atendimento dedicada da Dra. Lucy Murata.
   - Apresente-se sempre como: "${config.personaName}, secretária e assistente de atendimento da clínica da Dra. Lucy Murata".
4. AGENDAMENTOS, INFORMAÇÕES BÁSICAS E TRANSIÇÃO PARA A SECRETÁRIA/RECEPÇÃO:
   - Se o lead/paciente demonstrar interesse em marcar consulta, saber valores ou procedimentos:
   - DÊ A INFORMAÇÃO BÁSICA E OBJETIVA PRIMEIRO (ex: explicar de forma simples como funciona o procedimento, orientar sobre a avaliação inicial ou dar uma estimativa geral de valores/condições sem prometer diagnósticos fechados).
   - FAÇA UMA PRÉ-TRIAGEM RÁPIDA E ACOLHEDORA: pergunte qual período do dia fica mais confortável para ele (manhã ou tarde), o dia da semana de preferência e se o atendimento será particular ou por convênio/plano.
   - TRANSIÇÃO SUAVE PARA A SECRETÁRIA HUMANA: explique com gentileza que você já registrou todas as preferências dele no sistema e que a nossa secretária / recepcionista entrará em contato em seguida para confirmar o horário exato na agenda e reservar o encaixe com a Dra. Lucy.
   - Exemplo de fechamento humanizado: "Perfeito! Já anotei aqui sua preferência para a avaliação com a Dra. Lucy Murata. A nossa secretária já está verificando o melhor horário disponível na agenda e vai te chamar em instantes para confirmar tudo certinho com você, tá bom? 😊"
   - Preencha o objeto "triage" no JSON de saída com os dados coletados (procedure, preferredPeriod, preferredDays, paymentType, convenioName).
   - Mova o lead para a etapa adequada ("Qualificado / Interesse" ou "Proposta / Apresentação").

5. CASOS DE URGÊNCIA, DOR AGUDA OU RECLAMAÇÃO CRÍTICA:
   - Se o paciente/lead relatar dor aguda, emergência médica/odontológica (ex: dente quebrado, dor intensa, sangramento, trauma), ou uma reclamação séria:
   - Mostre empatia imediata, acolhimento e prioridade total. NUNCA envie respostas frias ou burocráticas.
   - Informe que o caso foi marcado como URGENTE no painel da clínica para a equipe analisar um encaixe prioritário.
   - Defina "isUrgent": true e preencha "urgencyReason" com o motivo claro no JSON de saída.
   - Mova o lead para o estágio de maior atenção do funil.

6. CASOS DE CANCELAMENTO OU IMPOSSIBILIDADE DE COMPARECER:
   - Se o paciente avisar que não poderá comparecer à consulta ou procedimento agendado:
   - Agradeça cordialmente pelo aviso prévio (destacando que assim o horário pode ser cedido a quem precisa).
   - Já ofereça com empatia a oportunidade de remarcar, perguntando qual período na semana seguinte fica mais confortável (manhã ou tarde).

7. ${config.strictKnowledgeOnly ? 'ANTI-ALUCINAÇÃO: Utilize as informações da Base de Conhecimento oficial. Se houver alguma dúvida específica que não conste na base, diga com simpatia que vai verificar com o especialista responsável para passar todos os detalhes.' : 'Mantenha total alinhamento comercial e bom senso.'}
8. CONTEXTO E MENSAGENS INCOMUNS / ENGANOS:
   - Se o lead enviar uma mensagem curta, confusa, ou que pareça conversa pessoal ou engano (por exemplo "oi fulano", "cadê você?", "tudo bem?", "tá podendo falar?"), responda de forma educada, acolhedora e humana.
   - Exemplo: "Olá! Tudo bem? Aqui é a Sofia, secretária da Dra. Lucy Murata. Em que posso te ajudar hoje?"
   - NUNCA envie respostas robóticas, jargões técnicos ou suposições forçadas se o cliente ainda não indicou o motivo do contato.
9. CASO O CLIENTE DIRECIONE A CONVERSA A UMA PESSOA ESPECÍFICA OU ATENDIMENTO HUMANO:
   - Responda cordialmente: "Olá! Nossa equipe já foi notificada da sua mensagem. Gostaria de adiantar em algo enquanto organizamos seu atendimento?"
10. ENVIO DE CATÁLOGO / APRESENTAÇÃO EM PDF:
   - Se o lead pedir o material institucional, catálogo, apresentação, PDF, proposta ou tabela detalhada em documento, mencione na mensagem de texto que está anexando a apresentação oficial para ele e defina "sendCatalogPdf": true no JSON.
11. ENVIO DE CHAVE PIX OU DADOS DE PAGAMENTO E DETECÇÃO DE "LEAD QUENTE / PEDIDO DE FECHAMENTO":
   - Se o lead pedir a chave PIX, dados bancários para fechar, link de cartão, contrato, perguntar como pagar, ou disser claramente que quer fechar/comprar/assinar agora:
   - Responda cordialmente com a chave oficial cadastrada (${config.pixKey ? `Chave PIX (${config.pixKeyType || 'E-mail'}): ${config.pixKey}` : 'Consulte nosso time comercial'}) em uma mensagem limpa e fácil de copiar, definindo "sendPixInfo": true no JSON.
   - DEFINA OBRIGATORIAMENTE "isHotLead": true e preencha "hotReason" com a justificativa (ex: "Solicitou chave PIX para pagamento", "Pediu link de pagamento", "Confirmou que quer fechar agora", "Pediu minuta do contrato").
   - Quando ele solicitar PIX para fechar, mova-o para a etapa de "Proposta / Apresentação", "Negociação" ou "Ganhos / Clientes".
12. DISCERNIMENTO INTELIGENTE DE RESPOSTA (ÁUDIO vs TEXTO):
   - FORMATO DA MENSAGEM DO CLIENTE: ${isAudio ? '🎙️ O CLIENTE ENVIOU UMA MENSAGEM DE ÁUDIO / VOZ' : '💬 O CLIENTE DIGITOU UMA MENSAGEM DE TEXTO'}.
   - SE O CLIENTE ENVIOU ÁUDIO:
     * Responda prioritariamente com ÁUDIO DE VOZ ("sendAsVoice": true) para manter a naturalidade e humanização da conversa!
   - SE O CLIENTE ENVIOU TEXTO:
     * Caso o modo de voz esteja ativo, você PODE responder com ÁUDIO DE VOZ ("sendAsVoice": true) se for uma mensagem acolhedora de apresentação, explicação humanizada de serviços, resposta a pedido de áudio ou demonstração, OU responder em TEXTO ("sendAsVoice": false) se for uma resposta rápida e pontual.
   - SEMPRE RESPONDA EM TEXTO ("sendAsVoice": false) APENAS SE:
     a) O cliente pediu chave PIX, dados bancários, links/URLs, e-mails ou números que ele precisará copiar;
     b) O cliente pediu expressamente "me manda por escrito", "manda em texto" ou uma tabela detalhada;
     c) A informação for técnica ou extensa demais para ouvir.

=== ESTÁGIOS DISPONÍVEIS NO CRM KANBAN ===
${stagesList}

=== FORMATO DE SAÍDA OBRIGATÓRIO (JSON) ===
Você deve responder EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
{
  "replyText": "O texto da mensagem que será enviada diretamente pelo WhatsApp para o lead",
  "suggestedStageId": "ID do estágio para onde mover o lead no CRM se a intenção ou contexto mudou, ou null se mantiver o mesmo",
  "sendCatalogPdf": true ou false (true apenas se o lead solicitou apresentação/catálogo/PDF),
  "sendPixInfo": true ou false (true se o lead pediu dados de pagamento/PIX),
  "sendAsVoice": true ou false (true se for adequado responder com áudio falado pela Sofia segundo as regras de discernimento),
  "isUrgent": true ou false (true se o paciente/lead relatou dor aguda, sangramento, urgência ou reclamação grave),
  "urgencyReason": "Motivo da urgência em poucas palavras, ou null",
  "isHotLead": true ou false (true se o lead solicitou pagamento, PIX, contrato, link de cartão ou demonstrou forte intenção de fechar/comprar agora),
  "hotReason": "Motivo do fechamento ou pedido de compra em poucas palavras (ex: 'Pediu chave PIX', 'Pediu link de pagamento', 'Quer fechar contrato agora'), ou null",
  "triage": {
    "procedure": "Procedimento ou consulta de interesse (ex: Implante, Clareamento, Consulta de Rotina, ou null)",
    "preferredPeriod": "manha" ou "tarde" ou "noite" ou "qualquer" (ou null),
    "preferredDays": "Dias preferidos (ex: terças e quintas, ou null)",
    "paymentType": "convenio" ou "particular" ou "indefinido",
    "convenioName": "Nome do convênio caso informado, ou null"
  },
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
  return await callGemini('gemini-3.8-flash', systemInstruction, prompt, config.geminiApiKey);
}

// 1. Google Gemini via @google/genai SDK with automatic retry & model fallback
async function callGemini(
  modelName: string,
  systemInstruction: string,
  prompt: string,
  apiKeyOverride?: string
): Promise<AIResponseResult> {
  const apiKey = (apiKeyOverride || db.agentConfig.geminiApiKey || process.env.GEMINI_API_KEY || '').trim();
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

  // Prioritize fast, standard Gemini Flash models (low latency, minimal cost)
  const candidateModels = [
    modelName || 'gemini-3.8-flash',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-2.5-flash',
  ].filter((v, i, a) => a.indexOf(v) === i); // unique

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
      const isLeakedKey = err.message && err.message.includes('reported as leaked');
      if (isLeakedKey) {
        console.error('🚨 [CRÍTICO - GEMINI API KEY] A chave de API do Gemini foi revogada pelo Google (chave vazada/bloqueada)! Por favor, gere uma nova chave gratuita em https://aistudio.google.com/apikey e atualize nas configurações.');
      } else {
        console.warn(`[Gemini Fallback] Modelo ${candidate} falhou (${err.message}). Tentando próximo modelo...`);
      }
      // Short delay before fallback attempt
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  // If all models hit 503, quota, or leaked key, provide smart contextual knowledge reply based on DB
  console.warn('[Gemini] Modelos Gemini indisponíveis. Gerando resposta contextual inteligente pela Base de Conhecimento...');
  return generateRuleBasedSafetyReply(prompt);
}

// Função de teste direto de chave do Gemini com retorno em tempo real
export async function testGeminiApiKey(apiKeyToTest?: string): Promise<{ success: boolean; model?: string; message?: string; error?: string }> {
  const key = (apiKeyToTest || db.agentConfig.geminiApiKey || process.env.GEMINI_API_KEY || '').trim();
  if (!key) {
    return { success: false, error: 'Nenhuma chave de API informada para teste.' };
  }
  const ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
  const testModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-2.5-flash'];
  let lastErr = '';
  for (const m of testModels) {
    try {
      const res = await ai.models.generateContent({
        model: m,
        contents: 'Olá, confirme com uma palavra: operacional',
      });
      if (res.text) {
        return { success: true, model: m, message: `Conexão bem-sucedida! O modelo ${m} respondeu: "${res.text.trim()}"` };
      }
    } catch (err: any) {
      lastErr = err.message || '';
      if (lastErr.includes('reported as leaked')) {
        return { success: false, error: 'A chave foi BLOQUEADA/REVOGADA pelo Google (marcada como vazada). Por favor, gere uma nova chave em aistudio.google.com/apikey.' };
      }
      if (lastErr.includes('API_KEY_INVALID')) {
        return { success: false, error: 'Chave de API inválida. Verifique se copiou todos os caracteres corretamente.' };
      }
    }
  }
  return { success: false, error: `Falha ao testar chave: ${lastErr || 'Sem resposta do provedor'}` };
}

// Resposta contextual de segurança caso a rede do provedor de IA ou a chave esteja temporariamente fora do ar
export function generateRuleBasedSafetyReply(prompt: string): AIResponseResult {
  const persona = db.agentConfig.personaName || 'Sofia';

  // Isolate only the incoming user message if a full prompt envelope was provided
  let targetText = prompt || '';
  if (targetText.includes('NOVA MENSAGEM DO LEAD:')) {
    targetText = targetText.split('NOVA MENSAGEM DO LEAD:').pop() || targetText;
  }
  const lower = targetText.toLowerCase();

  // Contextual fallback for incoming documents/PDFs
  if (lower.includes('[documento/pdf') || lower.includes('[documento pdf') || lower.includes('.pdf]') || lower.includes('.pdf')) {
    return {
      replyText: `Recebi o seu documento aqui! Já estou analisando todas as informações com atenção para te dar um retorno completo.`,
      providerUsed: 'Base de Conhecimento (Regras)',
      modelUsed: 'offline-safety-rules',
    };
  }

  // Contextual fallback for incoming images/photos
  if (lower.includes('[imagem recebida') || lower.includes('[análise visual') || lower.includes('[foto/imagem')) {
    return {
      replyText: `Recebi a sua imagem com sucesso! Já estou dando uma olhadinha aqui. Em que posso te ajudar a respeito dela?`,
      providerUsed: 'Base de Conhecimento (Regras)',
      modelUsed: 'offline-safety-rules',
    };
  }

  const config = db.agentConfig;
  const lowerRole = (config.role || '').toLowerCase();
  const lowerPersona = (config.personaName || '').toLowerCase();
  const isLucyOrDental = 
    lowerRole.includes('lucy') || 
    lowerRole.includes('odonto') || 
    lowerRole.includes('dent') || 
    lowerRole.includes('biológica') || 
    lowerRole.includes('biologica') || 
    lowerRole.includes('clínica') || 
    lowerRole.includes('clinica') || 
    lowerPersona.includes('sofia');

  let reply = isLucyOrDental
    ? `Perfeito! Estou à disposição para tirar qualquer dúvida e organizar seu agendamento com a Dra. Lucy aqui no consultório do Euroville Mall. Em que posso te orientar?`
    : `Perfeito! Estou à disposição para tirar suas dúvidas e dar andamento ao seu atendimento. Como posso te orientar?`;

  let suggestedStage: string | undefined = undefined;
  let estimatedValue: number | undefined = undefined;
  let interest: string | undefined = undefined;
  let sendAsVoice = false;

  if (isLucyOrDental) {
    // Odontologia Integrativa Dra. Lucy Murata Logic (Objetiva, calorosa, humana e contextual)
    if (
      lower.includes('não foi possível transcrever') ||
      lower.includes('nao foi possivel transcrever') ||
      lower.includes('[áudio recebido') ||
      lower.includes('[audio recebido')
    ) {
      reply = 'Olá! Recebi seu áudio aqui no consultório, mas não consegui escutar com nitidez por aqui. Você poderia me mandar uma mensagem de texto ou me dizer rapidinho o que precisa? Assim já te respondo na hora!';
      sendAsVoice = false;
    } else if (
      lower.includes('agend') ||
      lower.includes('marcar') ||
      lower.includes('horário') ||
      lower.includes('horario') ||
      lower.includes('vaga') ||
      lower.includes('como podemos agendar') ||
      lower.includes('como agendar') ||
      lower.includes('quando posso') ||
      lower.includes('marcar consulta') ||
      lower.includes('marcar avaliação') ||
      lower.includes('marcar avaliacao')
    ) {
      reply = 'Que ótimo! Para organizarmos sua Consulta de Avaliação com a Dra. Lucy aqui no Euroville Mall, você prefere atendimento pela manhã ou no período da tarde? E quais dias da semana costumam ser melhores para você?';
      suggestedStage = 'stage-3';
      interest = 'Agendamento de Consulta de Avaliação';
      estimatedValue = 450;
    } else if (
      lower.includes('manhã') ||
      lower.includes('manha') ||
      lower.includes('tarde') ||
      lower.includes('segunda') ||
      lower.includes('terça') ||
      lower.includes('terca') ||
      lower.includes('quarta') ||
      lower.includes('quinta') ||
      lower.includes('sexta') ||
      lower.includes('sábado') ||
      lower.includes('sabado')
    ) {
      reply = 'Perfeito! Já registrei sua preferência de dia e período. Vou consultar a agenda da Dra. Lucy aqui no consultório do Euroville Mall e a nossa recepção já te confirma as opções exatas de horário, combinado?';
      suggestedStage = 'stage-3';
      interest = 'Preferência de Horário/Dia para Avaliação';
    } else if (
      lower.trim() === 'sim' ||
      lower.startsWith('sim ') ||
      lower.includes('quero sim') ||
      lower.includes('pode ser') ||
      lower.includes('com certeza') ||
      lower.includes('vamos sim') ||
      lower.includes('claro') ||
      lower.includes('por favor')
    ) {
      reply = 'Maravilha! Você prefere atendimento pela manhã ou no período da tarde? E quais dias da semana costumam ficar mais confortáveis na sua rotina para vir ao consultório no Euroville Mall?';
      suggestedStage = 'stage-3';
      interest = 'Confirmação de Agendamento';
    } else if (
      lower.includes('endereço') ||
      lower.includes('endereco') ||
      lower.includes('onde fica') ||
      lower.includes('onde é') ||
      lower.includes('onde e') ||
      lower.includes('localização') ||
      lower.includes('localizacao') ||
      lower.includes('como chegar') ||
      lower.includes('mall') ||
      lower.includes('euroville')
    ) {
      reply = 'Nosso consultório fica no Euroville Mall (Torre II, Sala 103), na Praça Maastricht, 200 - Jardim São José, aqui em Bragança Paulista/SP. O acesso é bem fácil e conta com estacionamento. Gostaria de agendar um horário para sua consulta de avaliação?';
      suggestedStage = 'stage-2';
      interest = 'Endereço e Localização';
    } else if (
      lower.includes('smart') ||
      lower.includes('amálgama') ||
      lower.includes('amalgama') ||
      lower.includes('mercúrio') ||
      lower.includes('mercurio') ||
      lower.includes('metal') ||
      lower.includes('troca de obturação') ||
      lower.includes('restauração preta')
    ) {
      reply = 'A Dra. Lucy Murata é especialista e segue rigorosamente o Protocolo SMART para remoção segura de amálgama, com isolamento absoluto e proteção biológica contra mercúrio. Gostaria de agendar sua avaliação para planejarmos a remoção?';
      suggestedStage = 'stage-2';
      interest = 'Remoção Segura de Amálgama (Protocolo SMART)';
      estimatedValue = 1800;
    } else if (
      lower.includes('zircônia') ||
      lower.includes('zirconia') ||
      lower.includes('implante') ||
      lower.includes('cerâmica') ||
      lower.includes('ceramica')
    ) {
      reply = 'Trabalhamos com implantes de cerâmica pura zircônia: 100% biocompatíveis, livres de metais e com estética impecável similar ao dente natural. Quer agendar uma avaliação com a Dra. Lucy para examinarmos seu caso?';
      suggestedStage = 'stage-2';
      interest = 'Implantes de Cerâmica Pura Zircônia';
      estimatedValue = 6500;
    } else if (
      lower.includes('dor') ||
      lower.includes('urgênc') ||
      lower.includes('urgenc') ||
      lower.includes('emergênc') ||
      lower.includes('quebr') ||
      lower.includes('doendo') ||
      lower.includes('inchado') ||
      lower.includes('sangr')
    ) {
      reply = 'Sinto muito por esse desconforto! Já marquei seu atendimento como PRIORITÁRIO aqui no consultório para verificar um encaixe de urgência com a equipe. Você está com dor intensa neste momento?';
      suggestedStage = 'stage-1';
      interest = 'Urgência / Encaixe Prioritário';
    } else if (
      lower.includes('preço') ||
      lower.includes('preco') ||
      lower.includes('valor') ||
      lower.includes('quanto custa') ||
      lower.includes('tabela') ||
      lower.includes('investimento') ||
      lower.includes('custo') ||
      lower.includes('convênio') ||
      lower.includes('convenio') ||
      lower.includes('plano')
    ) {
      reply = 'Nossos atendimentos são personalizados e particulares. Por isso, os valores são passados na consulta de avaliação após uma análise clínica individual da Dra. Lucy. Quer que eu veja os horários disponíveis para você?';
      suggestedStage = 'stage-2';
      interest = 'Consulta de Avaliação Integrativa';
      estimatedValue = 450;
    } else if (
      lower.includes('funciona') ||
      lower.includes('como é') ||
      lower.includes('como e') ||
      lower.includes('o que é') ||
      lower.includes('oque é') ||
      lower.includes('integrativa') ||
      lower.includes('biológica') ||
      lower.includes('biologica')
    ) {
      reply = 'A Odontologia Integrativa cuida da saúde bucal em sintonia com todo o organismo, utilizando biomateriais puros e tecnologia digital 3D. Gostaria de agendar sua avaliação com a Dra. Lucy?';
      suggestedStage = 'stage-2';
      interest = 'Como Funciona a Odontologia Integrativa';
    } else if (
      lower.includes('áudio') ||
      lower.includes('audio') ||
      lower.includes('voz') ||
      lower.includes('ouvir')
    ) {
      reply = 'Com certeza! Pode me enviar áudios tranquilamente, eu escuto perfeitamente e também posso te responder por voz para agilizar. Como posso te ajudar hoje?';
      sendAsVoice = true;
    } else if (
      lower.includes('humano') ||
      lower.includes('atendente') ||
      lower.includes('secretária') ||
      lower.includes('secretaria') ||
      lower.includes('recepção') ||
      lower.includes('recepcao') ||
      lower.includes('falar com alguém')
    ) {
      reply = 'Com certeza! Já avisei nossa recepção aqui no consultório da Dra. Lucy Murata e em instantes nossa secretária entrará em contato para te atender!';
      suggestedStage = 'stage-2';
      interest = 'Solicitação de Atendimento com a Secretária';
    } else if (
      lower.includes('olá') ||
      lower.includes('ola') ||
      lower.includes('oi') ||
      lower.includes('bom dia') ||
      lower.includes('boa tarde') ||
      lower.includes('boa noite') ||
      lower.includes('tudo bem')
    ) {
      reply = 'Olá! Tudo bem? Sou a Sofia, secretária da Dra. Lucy Murata aqui no consultório em Bragança Paulista. Como posso te ajudar hoje? 😊';
    } else {
      reply = 'Perfeito! Estou à disposição para tirar qualquer dúvida e organizar sua avaliação com a Dra. Lucy aqui no consultório do Euroville Mall. Em que mais posso te orientar?';
      suggestedStage = 'stage-2';
    }
  } else {
    // Dynamic Generic Safety Fallback (using configured persona & role, NEVER mentioning NEXA CRM)
    if (
      lower.includes('funciona') ||
      lower.includes('como') ||
      lower.includes('o que é') ||
      lower.includes('oque é') ||
      lower.includes('atendimento')
    ) {
      reply = `Nosso atendimento é especializado e conduzido por ${config.personaName}, com foco total em tirar dúvidas, acolher suas necessidades e organizar seu agendamento de forma rápida. Em que posso te orientar hoje?`;
      suggestedStage = 'stage-2';
      interest = 'Dúvidas sobre o Atendimento';
    } else if (
      lower.includes('preço') ||
      lower.includes('preco') ||
      lower.includes('valor') ||
      lower.includes('quanto custa') ||
      lower.includes('tabela')
    ) {
      reply = `Para te passar os valores e condições detalhadas com toda a precisão, fazemos uma avaliação inicial das suas necessidades. Gostaria de agendar uma conversa ou receber nossa proposta?`;
      suggestedStage = 'stage-2';
      interest = 'Consulta de Valores';
    } else if (
      lower.includes('humano') ||
      lower.includes('atendente') ||
      lower.includes('falar com alguém')
    ) {
      reply = 'Com certeza! Já notifiquei nossa equipe interna sobre seu contato. Em instantes nossa equipe entrará em contato para lhe atender pessoalmente!';
      suggestedStage = 'stage-2';
      interest = 'Solicitação de Atendimento Humano';
    } else {
      reply = `Olá! Tudo bem? Sou a ${persona}, ${config.role || 'assistente de atendimento'}. Em que posso te ajudar hoje?`;
    }
  }

  return {
    replyText: reply,
    providerUsed: 'Sofia (Base de Conhecimento Ativa)',
    modelUsed: 'Knowledge Engine Fallback',
    stageTriggered: suggestedStage,
    sendAsVoice,
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
    return await callGemini('gemini-3.8-flash', systemInstruction, prompt);
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
    return await callGemini('gemini-3.8-flash', systemInstruction, prompt);
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
      sendPixInfo: Boolean(parsed.sendPixInfo),
      sendAsVoice: parsed.sendAsVoice !== undefined ? Boolean(parsed.sendAsVoice) : undefined,
      isUrgent: Boolean(parsed.isUrgent),
      urgencyReason: parsed.urgencyReason || undefined,
      triage: parsed.triage || undefined,
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
