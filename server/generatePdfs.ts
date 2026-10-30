import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateAllPdfs(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Equipamentos PSI
  await generateEquipamentosPsiPdf(path.join(publicDir, 'Dossie_Tecnico_Equipamentos_PSI.pdf'));

  // 2. Surfacebrasil Plasma
  await generateSurfacebrasilPdf(path.join(publicDir, 'Dossie_Tecnico_Surfacebrasil_Plasma.pdf'));

  // 3. Verzel Sistemas
  await generateVerzelPdf(path.join(publicDir, 'Dossie_Tecnico_Verzel_Sistemas.pdf'));

  // 4. Dra. Lucy Murata
  await generateDraLucyPdf(path.join(publicDir, 'Apresentacao_Dra_Lucy_Murata.pdf'));

  // 5. Primo Equipamentos
  await generatePrimoPdf(path.join(publicDir, 'Catalogo_Primo_Equipamentos.pdf'));

  console.log('[PDF Generator] Todos os 5 PDFs oficiais foram gerados com sucesso em /public!');
}

async function generateEquipamentosPsiPdf(outputPath: string) {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  // --- PAGE 1: Capa & Apresentação Técnica ---
  let page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  // Top header bar (Purple / Emerald)
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.42, 0.16, 0.82), // #6d28d9
  });

  page.drawRectangle({
    x: 0,
    y: height - 126,
    width: width,
    height: 6,
    color: rgb(0.06, 0.72, 0.51), // #10b981
  });

  page.drawText('EQUIPAMENTOS PSI', {
    x: 40,
    y: height - 55,
    size: 24,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Dossiê Técnico & Catálogo Oficial de Equipamentos EMDR', {
    x: 40,
    y: height - 80,
    size: 13,
    font: fontRegular,
    color: rgb(0.93, 0.91, 1),
  });

  page.drawText('Estimulação Bilateral Visual e Tátil para Psicologia Clínica', {
    x: 40,
    y: height - 100,
    size: 10,
    font: fontOblique,
    color: rgb(0.85, 0.85, 0.95),
  });

  let y = height - 160;

  // Box 1: Sobre a Empresa & Abordagem EMDR
  page.drawRectangle({
    x: 40,
    y: y - 110,
    width: width - 80,
    height: 110,
    color: rgb(0.97, 0.96, 1),
    borderColor: rgb(0.85, 0.80, 0.98),
    borderWidth: 1,
  });

  page.drawText('1. SOBRE A EQUIPAMENTOS PSI & A TECNOLOGIA EMDR', {
    x: 55,
    y: y - 25,
    size: 11,
    font: fontBold,
    color: rgb(0.35, 0.15, 0.75),
  });

  const aboutText = [
    '• Fundada em 2015 pela psicóloga Priscila Alves e pelo analista Eliab Caetano.',
    '• Missão: Desenvolver tecnologia nacional de alta precisão para a prática do EMDR.',
    '• O EMDR (Dessensibilização e Reprocessamento por Movimentos Oculares) é validado pela',
    '  Organização Mundial da Saúde (OMS) para TEPT, traumas, fobias e ansiedade.',
    '• Elimina a fadiga muscular e dor nos braços do terapeuta, mantendo ritmo bilateral constante.',
  ];

  let ty = y - 45;
  for (const line of aboutText) {
    page.drawText(line, { x: 55, y: ty, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    ty -= 13;
  }

  y -= 135;

  // Box 2: Produtos Principais
  page.drawText('2. EQUIPAMENTOS DE ESTIMULAÇÃO BILATERAL', {
    x: 40,
    y: y,
    size: 13,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.2),
  });
  y -= 18;

  // Produto 1: Barra Tradicional
  page.drawRectangle({
    x: 40,
    y: y - 105,
    width: width - 80,
    height: 105,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.88, 0.88, 0.92),
    borderWidth: 1,
  });

  page.drawText('A. Barra de Luz Tradicional (74 cm) - Modelo Clínico Padrão', {
    x: 55,
    y: y - 22,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.35),
  });

  const p1Details = [
    '• Especificações: 26 LEDs verdes difusos de alta definição (cor relaxante, sem fotofobia).',
    '• Funções: Controle remoto com ajuste contínuo de velocidade e botão de memória de ritmo.',
    '• Estrutura: Tripé articulado em metal reforçado com regulagem telescópica de altura.',
    '• Alimentação: Fonte bivolt automática 110V/220V inclusa.',
    '• Faixa de Investimento: R$ 1.314,80 (à vista com desconto PIX) a R$ 1.384,00 (em até 12x).',
  ];
  ty = y - 40;
  for (const line of p1Details) {
    page.drawText(line, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    ty -= 12;
  }

  y -= 120;

  // Produto 2: Barra Baby
  page.drawRectangle({
    x: 40,
    y: y - 105,
    width: width - 80,
    height: 105,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.88, 0.88, 0.92),
    borderWidth: 1,
  });

  page.drawText('B. Barra de Luz Baby (51 cm) - Compacta & Portátil', {
    x: 55,
    y: y - 22,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.35),
  });

  const p2Details = [
    '• Indicação: Consultórios compactos, atendimento infantil ou profissionais em sublocação.',
    '• Recursos: 51 cm de extensão, controle remoto, ajuste fino de velocidade e memória integrada.',
    '• Incluso: Tripé telescópico completo, suporte metálico e fonte bivolt automática.',
    '• Vantagem: Ultraleve para transporte seguro em atendimentos domiciliares ou múltiplas clínicas.',
    '• Faixa de Investimento: R$ 1.286,60 (à vista com desconto PIX) a R$ 1.354,32 (em até 12x).',
  ];
  ty = y - 40;
  for (const line of p2Details) {
    page.drawText(line, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    ty -= 12;
  }

  y -= 120;

  // Produto 3: Aparelho Tátil
  page.drawRectangle({
    x: 40,
    y: y - 105,
    width: width - 80,
    height: 105,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.88, 0.88, 0.92),
    borderWidth: 1,
  });

  page.drawText('C. Aparelho Tátil Completo (Pulsers / Buzzers Vibratórios)', {
    x: 55,
    y: y - 22,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.35),
  });

  const p3Details = [
    '• Descrição: Central de comando digital com display indicador de intensidade e velocidade.',
    '• Pulsers Táteis: 2 manoplas anatômicas com vibração alternada suave e sem ruído mecânico.',
    '• Ergonomia: Cabos de 1,5 metro de alta flexibilidade, bolsa de veludo para proteção e fonte bivolt.',
    '• Aplicação: Indispensável para pacientes com sensibilidade visual, baixa visão ou idosos.',
    '• Faixa de Investimento: R$ 687,42 (à vista com desconto PIX) a R$ 723,60 (em até 12x).',
  ];
  ty = y - 40;
  for (const line of p3Details) {
    page.drawText(line, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    ty -= 12;
  }

  y -= 120;

  // Rodapé da página 1
  page.drawText('Equipamentos PSI • CNPJ: 22.384.195/0001-44 • WhatsApp Oficial: (11) 96631-0256 • Página 1 de 2', {
    x: 40,
    y: 30,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });

  // --- PAGE 2: Acessórios, Garantia & Condições Comerciais ---
  page = doc.addPage([595.28, 841.89]);

  // Top header slim bar
  page.drawRectangle({
    x: 0,
    y: height - 50,
    width: width,
    height: 50,
    color: rgb(0.42, 0.16, 0.82),
  });

  page.drawText('EQUIPAMENTOS PSI • TABELA DE ACESSÓRIOS & CONDIÇÕES COMERCIAIS', {
    x: 40,
    y: height - 32,
    size: 11,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  y = height - 85;

  // Seção Acessórios
  page.drawText('3. BOLSAS ACOLCHOADAS & ACESSÓRIOS DE REPOSIÇÃO', {
    x: 40,
    y: y,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.2),
  });
  y -= 20;

  const accessories = [
    { item: 'Bolsa de Transporte Acolchoada para Barra Tradicional (74cm)', val: 'R$ 302,67 (Pix) / R$ 318,60' },
    { item: 'Bolsa de Transporte Acolchoada para Barra Baby (51cm)', val: 'R$ 292,41 (Pix) / R$ 307,80' },
    { item: 'Conjunto de Cabos P2 com Pulsers Táteis de Reposição', val: 'R$ 135,00' },
    { item: 'Cabo de Reposição sem Pulsers (P2 Estéreo)', val: 'R$ 69,00' },
    { item: 'Fonte Bivolt Automática de Reposição (Original Equipamentos PSI)', val: 'R$ 89,00' },
    { item: 'Tripé Metálico Telescópico Articulado Avulso', val: 'R$ 180,00' },
  ];

  for (const acc of accessories) {
    page.drawRectangle({
      x: 40,
      y: y - 28,
      width: width - 80,
      height: 28,
      color: rgb(0.98, 0.98, 0.99),
      borderColor: rgb(0.9, 0.9, 0.93),
      borderWidth: 1,
    });
    page.drawText(acc.item, { x: 50, y: y - 18, size: 8.5, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    page.drawText(acc.val, { x: width - 185, y: y - 18, size: 8.5, font: fontBold, color: rgb(0.1, 0.5, 0.35) });
    y -= 33;
  }

  y -= 15;

  // Seção Condições Comerciais & Garantia
  page.drawText('4. GARANTIA, FRETE & ATENDIMENTO AO TERAPEUTA', {
    x: 40,
    y: y,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.2),
  });
  y -= 18;

  page.drawRectangle({
    x: 40,
    y: y - 150,
    width: width - 80,
    height: 150,
    color: rgb(0.96, 0.99, 0.98),
    borderColor: rgb(0.7, 0.9, 0.8),
    borderWidth: 1,
  });

  const terms = [
    '• GARANTIA DE FÁBRICA: 1 ano integral contra qualquer defeito de fabricação ou circuito elétrico.',
    '• SUPORTE TÉCNICO VITALÍCIO: Atendimento direto por técnicos especializados da fábrica.',
    '• ENVIO PARA TODO O BRASIL: Parceria com Correios (SEDEX / PAC) e transportadoras certificadas.',
    '• RASTREAMENTO IMEDIATO: Código de envio informado no WhatsApp assim que o pacote é despachado.',
    '• DESCONTO EXCLUSIVO NO PIX: 5% de desconto imediato com liberação prioritária do pedido.',
    '• PARCELAMENTO FACILITADO: Até 12x no cartão de crédito em link de pagamento blindado.',
    '• ATENDIMENTO CONSULTIVO: Auxiliamos na escolha da melhor barra para as dimensões da sua sala.',
  ];

  ty = y - 25;
  for (const t of terms) {
    page.drawText(t, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.15, 0.3, 0.25) });
    ty -= 17;
  }

  y -= 175;

  // Box de Contato Direto
  page.drawRectangle({
    x: 40,
    y: y - 90,
    width: width - 80,
    height: 90,
    color: rgb(0.94, 0.92, 1),
    borderColor: rgb(0.5, 0.3, 0.9),
    borderWidth: 1.5,
  });

  page.drawText('SOLICITE SEU ORÇAMENTO PERSONALIZADO COM FRETE PARA O SEU CEP:', {
    x: 55,
    y: y - 25,
    size: 10,
    font: fontBold,
    color: rgb(0.3, 0.1, 0.7),
  });

  page.drawText('WhatsApp Comercial: (11) 96631-0256 • Suporte Técnico: (62) 9223-8416', {
    x: 55,
    y: y - 48,
    size: 10,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.2),
  });

  page.drawText('E-mail Oficial: comercial@equipamentospsi.com • Website: equipamentospsi.com.br', {
    x: 55,
    y: y - 68,
    size: 9.5,
    font: fontRegular,
    color: rgb(0.3, 0.3, 0.4),
  });

  // Rodapé da página 2
  page.drawText('Equipamentos PSI • CNPJ: 22.384.195/0001-44 • Todos os direitos reservados • Página 2 de 2', {
    x: 40,
    y: 30,
    size: 8,
    font: fontRegular,
    color: rgb(0.5, 0.5, 0.55),
  });

  const pdfBytes = await doc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

async function generateSurfacebrasilPdf(outputPath: string) {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.08, 0.36, 0.73), // Deep Sky Blue
  });

  page.drawText('SURFACE BRASIL - TRATAMENTO DE SUPERFÍCIE POR PLASMA', {
    x: 40,
    y: height - 45,
    size: 16,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Dossiê Técnico & Catálogo de Soluções Industriais (Plasma Atmosférico)', {
    x: 40,
    y: height - 70,
    size: 11,
    font: fontRegular,
    color: rgb(0.9, 0.95, 1),
  });

  let y = height - 140;
  page.drawText('SOLUÇÕES EM ATIVAÇÃO E LIMPEZA DE SUPERFÍCIES:', { x: 40, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.2) });
  y -= 25;

  const items = [
    '• Sistemas de Plasma Atmosférico com bicos rotativos e pontuais de alta precisão.',
    '• Aumento drástico de energia superficial (Dyne/cm) em polímeros, metais, vidro e borrachas.',
    '• Eliminação de primers químicos nocivos e solventes voláteis (solução 100% ecológica e sustentável).',
    '• Adesão perfeita para tintas, colas estruturais, vernizes e fita dupla-face.',
    '• Linha contínua para indústria automotiva, cabos ópticos, eletroeletrônicos e calçadista.',
    '• Laboratório próprio em Campinas/SP para testes práticos gratuitos de adesão com suas amostras.',
  ];

  for (const it of items) {
    page.drawText(it, { x: 45, y, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.3) });
    y -= 18;
  }

  y -= 30;
  page.drawRectangle({
    x: 40,
    y: y - 80,
    width: width - 80,
    height: 80,
    color: rgb(0.95, 0.98, 1),
    borderColor: rgb(0.6, 0.8, 1),
    borderWidth: 1,
  });

  page.drawText('Laboratório Surface Test & Contato Comercial:', { x: 55, y: y - 25, size: 11, font: fontBold, color: rgb(0.08, 0.36, 0.73) });
  page.drawText('Envie suas peças para análise e receba laudo completo de energia superficial em até 48h.', { x: 55, y: y - 45, size: 9, font: fontRegular, color: rgb(0.2, 0.3, 0.4) });
  page.drawText('Website: surfacebrasil.com.br • Atendimento Comercial B2B', { x: 55, y: y - 65, size: 9, font: fontBold, color: rgb(0.1, 0.2, 0.3) });

  const pdfBytes = await doc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

async function generateVerzelPdf(outputPath: string) {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.12, 0.15, 0.35),
  });

  page.drawText('VERZEL SISTEMAS & AI TALENT HUB', {
    x: 40,
    y: height - 45,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Fábrica de Software Corporativo, Apps Mobile & Squads de Engenharia', {
    x: 40,
    y: height - 70,
    size: 11,
    font: fontRegular,
    color: rgb(0.85, 0.9, 1),
  });

  let y = height - 140;
  page.drawText('CAPACIDADES & DIFERENCIAIS VERZEL:', { x: 40, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.2) });
  y -= 25;

  const items = [
    '• Desenvolvimento de Aplicativos Mobile de Alta Performance (iOS e Android nativo/híbrido).',
    '• Plataformas Web Corporativas com arquitetura Cloud moderna, escalável e resiliente.',
    '• Alocação de Squads Ágeis dedicados pelo programa AI Talent Hub com início em menos de 7 dias.',
    '• Integração com ERPs legados (SAP, Totvs, Protheus, Oracle) e APIs bancárias/fintechs.',
    '• Portfólio com grandes corporações atendidas (como Shell e Zignet).',
  ];

  for (const it of items) {
    page.drawText(it, { x: 45, y, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.3) });
    y -= 18;
  }

  const pdfBytes = await doc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

async function generateDraLucyPdf(outputPath: string) {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.05, 0.45, 0.35),
  });

  page.drawText('DRA. LUCY MURATA - ODONTOLOGIA BIOLÓGICA & INTEGRATIVA', {
    x: 40,
    y: height - 45,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Carta de Apresentação Clínica & Protocolos Biológicos Metal-Free', {
    x: 40,
    y: height - 70,
    size: 11,
    font: fontRegular,
    color: rgb(0.9, 1, 0.95),
  });

  const pdfBytes = await doc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}

async function generatePrimoPdf(outputPath: string) {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);

  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  page.drawRectangle({
    x: 0,
    y: height - 100,
    width: width,
    height: 100,
    color: rgb(0.85, 0.45, 0.1),
  });

  page.drawText('PRIMO EQUIPAMENTOS - COZINHAS INDUSTRIAIS & GASTRONOMIA', {
    x: 40,
    y: height - 45,
    size: 15,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Catálogo Oficial de Maquinário Gastronômico, Refrigeração e Cocção', {
    x: 40,
    y: height - 70,
    size: 11,
    font: fontRegular,
    color: rgb(1, 0.95, 0.9),
  });

  const pdfBytes = await doc.save();
  fs.writeFileSync(outputPath, pdfBytes);
}
