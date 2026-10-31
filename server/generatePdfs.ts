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

  // 6. Cemitério Parque da Cantareira
  await generateCantareiraPdf(path.join(publicDir, 'Dossie_Tecnico_Cemiterio_Cantareira.pdf'));

  console.log('[PDF Generator] Todos os 6 PDFs oficiais foram gerados com sucesso em /public!');
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
  const psiDir = path.join(process.cwd(), 'public', 'assets', 'psi');
  const imgGrandePath = path.join(psiDir, 'barra-de-luz-grande-74cm.jpg');
  const imgBabyPath = path.join(psiDir, 'barra-de-luz-baby-51cm.jpg');
  const imgTatilPath = path.join(psiDir, 'aparelho-tatil-pulsers.jpg');
  const imgCabosPath = path.join(psiDir, 'cabos-com-pulsers.jpg');

  let imgGrande = null;
  let imgBaby = null;
  let imgTatil = null;
  let imgCabos = null;

  try {
    if (fs.existsSync(imgGrandePath)) imgGrande = await doc.embedJpg(fs.readFileSync(imgGrandePath));
    if (fs.existsSync(imgBabyPath)) imgBaby = await doc.embedJpg(fs.readFileSync(imgBabyPath));
    if (fs.existsSync(imgTatilPath)) imgTatil = await doc.embedJpg(fs.readFileSync(imgTatilPath));
    if (fs.existsSync(imgCabosPath)) imgCabos = await doc.embedJpg(fs.readFileSync(imgCabosPath));
  } catch (imgErr) {
    console.warn('[PDF Generator] Aviso ao carregar fotos da PSI para o PDF:', imgErr);
  }

  y -= 18;

  // Produto 1: Barra Tradicional (74 cm) com Foto Real
  page.drawRectangle({
    x: 40,
    y: y - 108,
    width: width - 80,
    height: 108,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.90),
    borderWidth: 1,
  });

  page.drawText('A. Barra de Luz Tradicional (74 cm) - Modelo Clínico Padrão', {
    x: 52,
    y: y - 20,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.35),
  });

  const p1Details = [
    '• 26 LEDs verdes difusos de alta definição (relaxante, sem fotofobia).',
    '• Controle remoto com velocidade contínua e memória de ritmo.',
    '• Tripé telescópico articulado em metal reforçado com regulagem.',
    '• Fonte bivolt automática 110V/220V inclusa com garantia de 1 ano.',
    '• Investimento: R$ 1.314,80 (PIX à vista) a R$ 1.384,00 (em até 12x).',
  ];
  ty = y - 36;
  for (const line of p1Details) {
    page.drawText(line, { x: 52, y: ty, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    ty -= 13;
  }

  if (imgGrande) {
    // Moldura e Foto Real do Equipamento
    page.drawRectangle({
      x: width - 185,
      y: y - 102,
      width: 135,
      height: 94,
      color: rgb(0.97, 0.97, 0.99),
      borderColor: rgb(0.80, 0.75, 0.90),
      borderWidth: 1,
    });
    page.drawImage(imgGrande, {
      x: width - 183,
      y: y - 100,
      width: 131,
      height: 90,
    });
  }

  y -= 120;

  // Produto 2: Barra Baby (51 cm) com Foto Real
  page.drawRectangle({
    x: 40,
    y: y - 108,
    width: width - 80,
    height: 108,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.90),
    borderWidth: 1,
  });

  page.drawText('B. Barra de Luz Baby (51 cm) - Compacta, Infantil & Portátil', {
    x: 52,
    y: y - 20,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.35),
  });

  const p2Details = [
    '• Para consultórios compactos, clínica infantil ou salas sublocadas.',
    '• 51 cm de extensão, ultraleve, controle remoto e memória integrada.',
    '• Acompanha tripé telescópico completo e fonte bivolt automática.',
    '• Praticidade máxima para transporte em atendimentos itinerantes.',
    '• Investimento: R$ 1.286,60 (PIX à vista) a R$ 1.354,32 (em até 12x).',
  ];
  ty = y - 36;
  for (const line of p2Details) {
    page.drawText(line, { x: 52, y: ty, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    ty -= 13;
  }

  if (imgBaby) {
    page.drawRectangle({
      x: width - 185,
      y: y - 102,
      width: 135,
      height: 94,
      color: rgb(0.97, 0.97, 0.99),
      borderColor: rgb(0.80, 0.75, 0.90),
      borderWidth: 1,
    });
    page.drawImage(imgBaby, {
      x: width - 183,
      y: y - 100,
      width: 131,
      height: 90,
    });
  }

  y -= 120;

  // Produto 3: Aparelho Tátil Completo com Foto Real
  page.drawRectangle({
    x: 40,
    y: y - 108,
    width: width - 80,
    height: 108,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.90),
    borderWidth: 1,
  });

  page.drawText('C. Aparelho Tátil Completo (Pulsers / Buzzers Vibratórios)', {
    x: 52,
    y: y - 20,
    size: 10.5,
    font: fontBold,
    color: rgb(0.1, 0.5, 0.35),
  });

  const p3Details = [
    '• Central digital com display indicador de intensidade e velocidade.',
    '• 2 pulsers táteis anatômicos com vibração alternada silenciosa.',
    '• Cabos de 1,5m de alta flexibilidade, bolsa de veludo e fonte bivolt.',
    '• Essencial para pacientes com olhos fechados, baixa visão ou idosos.',
    '• Investimento: R$ 687,42 (PIX à vista) a R$ 723,60 (em até 12x).',
  ];
  ty = y - 36;
  for (const line of p3Details) {
    page.drawText(line, { x: 52, y: ty, size: 8, font: fontRegular, color: rgb(0.2, 0.2, 0.25) });
    ty -= 13;
  }

  if (imgTatil) {
    page.drawRectangle({
      x: width - 185,
      y: y - 102,
      width: 135,
      height: 94,
      color: rgb(0.97, 0.97, 0.99),
      borderColor: rgb(0.80, 0.75, 0.90),
      borderWidth: 1,
    });
    page.drawImage(imgTatil, {
      x: width - 183,
      y: y - 100,
      width: 131,
      height: 90,
    });
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

async function generateCantareiraPdf(outputPath: string) {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const cantareiraDir = path.join(process.cwd(), 'public', 'assets', 'cantareira');
  const imgParquePath = path.join(cantareiraDir, 'parque_panoramica.jpg');
  const imgCapelaPath = path.join(cantareiraDir, 'capela_jardins.jpg');
  const imgSalaPath = path.join(cantareiraDir, 'sala_acolhimento.jpg');

  let imgParque: any = null;
  let imgCapela: any = null;
  let imgSala: any = null;

  try {
    if (fs.existsSync(imgParquePath)) imgParque = await doc.embedJpg(fs.readFileSync(imgParquePath));
    if (fs.existsSync(imgCapelaPath)) imgCapela = await doc.embedJpg(fs.readFileSync(imgCapelaPath));
    if (fs.existsSync(imgSalaPath)) imgSala = await doc.embedJpg(fs.readFileSync(imgSalaPath));
  } catch (err) {
    console.warn('[PDF Generator Cantareira] Aviso ao carregar fotos do Cantareira:', err);
  }

  // Helper de cabeçalho padrão para páginas internas
  const drawPageHeader = (page: any, pageTitle: string, pageNum: number) => {
    const { width, height } = page.getSize();
    // Top bar verde escuro floresta
    page.drawRectangle({
      x: 0,
      y: height - 50,
      width: width,
      height: 50,
      color: rgb(0.08, 0.28, 0.18),
    });
    // Linha dourada
    page.drawRectangle({
      x: 0,
      y: height - 54,
      width: width,
      height: 4,
      color: rgb(0.82, 0.68, 0.25),
    });
    page.drawText('CEMITÉRIO PARQUE DA CANTAREIRA', {
      x: 35,
      y: height - 32,
      size: 11,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText(pageTitle.toUpperCase(), {
      x: 35,
      y: height - 44,
      size: 8,
      font: fontRegular,
      color: rgb(0.85, 0.95, 0.9),
    });
    page.drawText(`Página ${pageNum} de 4`, {
      x: width - 95,
      y: height - 35,
      size: 8,
      font: fontRegular,
      color: rgb(0.85, 0.95, 0.9),
    });

    // Rodapé sutil
    page.drawLine({
      start: { x: 35, y: 35 },
      end: { x: width - 35, y: 35 },
      thickness: 0.8,
      color: rgb(0.85, 0.88, 0.85),
    });
    page.drawText('Cemitério Parque da Cantareira • Serra da Cantareira / Mairiporã-SP • Central de Acolhimento 24h: (11) 4485-1122', {
      x: 35,
      y: 23,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.42),
    });
  };

  // =========================================================================
  // PÁGINA 1: CAPA & APRESENTAÇÃO INSTITUCIONAL DO PARQUE MEMORIAL
  // =========================================================================
  const page1 = doc.addPage([595.28, 841.89]);
  const { width, height } = page1.getSize();

  // Header nobre
  page1.drawRectangle({
    x: 0,
    y: height - 130,
    width: width,
    height: 130,
    color: rgb(0.08, 0.28, 0.18), // #14472e
  });
  page1.drawRectangle({
    x: 0,
    y: height - 136,
    width: width,
    height: 6,
    color: rgb(0.82, 0.68, 0.25), // Dourado clássico
  });

  page1.drawText('CEMITÉRIO PARQUE DA CANTAREIRA', {
    x: 40,
    y: height - 60,
    size: 22,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page1.drawText('Dossiê Institucional & Guia Oficial de Planejamento Familiar', {
    x: 40,
    y: height - 85,
    size: 13,
    font: fontRegular,
    color: rgb(0.92, 0.98, 0.94),
  });

  page1.drawText('Tradição, Serenidade e Respeito em Harmonia com a Biosfera da Serra da Cantareira • Desde 1984', {
    x: 40,
    y: height - 105,
    size: 9.5,
    font: fontOblique,
    color: rgb(0.82, 0.88, 0.84),
  });

  // Imagem Panorâmica do Parque Memorial (240px de altura)
  let y = height - 155;
  if (imgParque) {
    page1.drawRectangle({
      x: 38,
      y: y - 224,
      width: width - 76,
      height: 224,
      color: rgb(0.96, 0.98, 0.96),
      borderColor: rgb(0.78, 0.86, 0.80),
      borderWidth: 1.5,
    });
    page1.drawImage(imgParque, {
      x: 40,
      y: y - 222,
      width: width - 80,
      height: 220,
    });
    y -= 238;
  } else {
    y -= 20;
  }

  // Caixa 1: O Conceito de Cemitério-Parque
  page1.drawRectangle({
    x: 40,
    y: y - 130,
    width: width - 80,
    height: 130,
    color: rgb(0.97, 0.99, 0.97),
    borderColor: rgb(0.80, 0.88, 0.82),
    borderWidth: 1,
  });

  page1.drawText('O CONCEITO DE CEMITÉRIO-PARQUE: DIGNIDADE, PAZ E NATUREZA', {
    x: 55,
    y: y - 24,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.35, 0.22),
  });

  const p1Text = [
    '• Modelo Memorial Americano: Vasto gramado florido e bem cuidado, sem túmulos de alvenaria',
    '  ou concreto aparente. As identificações são feitas por discretas placas de bronze no solo.',
    '• Preservação da Mata Atlântica: Localizado no sopé da Serra da Cantareira (Mairiporã/SP),',
    '  com brisa fresca, canto dos pássaros e total isolamento acústico dos centros urbanos.',
    '• Tradição e Confiança: Fundado em 1984, conta com mais de 40 anos de história prestando',
    '  serviços de excelência, acolhimento e amparo humanizado a famílias de todo o estado de SP.',
    '• Acolhimento Permanente: Funcionamento ininterrupto 24 horas por dia, 365 dias ao ano.',
  ];

  let ty = y - 44;
  for (const line of p1Text) {
    page1.drawText(line, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.2, 0.25, 0.22) });
    ty -= 14;
  }

  y -= 145;

  // Caixa 2: Destaques Institucionais
  page1.drawRectangle({
    x: 40,
    y: y - 95,
    width: width - 80,
    height: 95,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.88),
    borderWidth: 1,
  });

  page1.drawText('INFRAESTRUTURA COMPLETA À DISPOSIÇÃO DAS FAMÍLIAS:', {
    x: 55,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: rgb(0.12, 0.15, 0.14),
  });

  const infraItems = [
    '• 6 Salas de Velório Climatizadas 24h com Suítes VIP de Repouso Exclusivas para a Família',
    '• Capela Ecumênica em Meio ao Bosque Nativo para Homenagens e Orações de Todas as Crenças',
    '• Floricultura 24h com Coroas de Flores Frescas e Lanchonete Completa em Funcionamento Integral',
    '• Amplo Estacionamento com Vigilância Patrimonial e Monitoramento Eletrônico 24 Horas',
  ];

  ty = y - 38;
  for (const it of infraItems) {
    page1.drawText(it, { x: 55, y: ty, size: 8, font: fontRegular, color: rgb(0.25, 0.3, 0.28) });
    ty -= 13;
  }

  // =========================================================================
  // PÁGINA 2: POR QUE COMPRAR UM JAZIGO? O VALOR DO PLANEJAMENTO PREVENTIVO
  // =========================================================================
  const page2 = doc.addPage([595.28, 841.89]);
  drawPageHeader(page2, 'Por Que Comprar um Jazigo? O Valor do Planejamento Preventivo', 2);

  y = height - 75;

  page2.drawText('1. POR QUE COMPRAR UM JAZIGO ANTECIPADAMENTE?', {
    x: 40,
    y: y,
    size: 13,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.18),
  });
  page2.drawText('Entenda por que a aquisição preventiva é um dos maiores gestos de amor e cuidado com quem você ama.', {
    x: 40,
    y: y - 16,
    size: 9,
    font: fontOblique,
    color: rgb(0.35, 0.45, 0.4),
  });

  y -= 38;

  // Bloco 1: Tranquilidade no Luto
  page2.drawRectangle({
    x: 40,
    y: y - 100,
    width: width - 80,
    height: 100,
    color: rgb(0.97, 0.99, 0.97),
    borderColor: rgb(0.82, 0.88, 0.84),
    borderWidth: 1,
  });

  page2.drawText('A. TRANQUILIDADE EMOCIONAL EM MOMENTOS DE DOR', {
    x: 55,
    y: y - 22,
    size: 10.5,
    font: fontBold,
    color: rgb(0.08, 0.35, 0.22),
  });

  const b1Lines = [
    'O momento do falecimento de um ente querido é marcado por um impacto emocional avassalador.',
    'Ter que escolher cemitério, negociar contratos, avaliar tipos de jazigo e providenciar pagamentos',
    'urgentes sob efeito de choque e desespero gera um desgaste imenso entre os familiares.',
    'Com o planejamento preventivo, sua família é poupada de todas as decisões burocráticas e financeiras,',
    'podendo dedicar-se unicamente ao acolhimento mútuo, às homenagens e à despedida serena.',
  ];
  ty = y - 38;
  for (const l of b1Lines) {
    page2.drawText(l, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.2, 0.25, 0.22) });
    ty -= 12;
  }

  y -= 115;

  // Bloco 2: Proteção Financeira e Economia Real
  page2.drawRectangle({
    x: 40,
    y: y - 105,
    width: width - 80,
    height: 105,
    color: rgb(1, 0.99, 0.96),
    borderColor: rgb(0.90, 0.85, 0.75),
    borderWidth: 1,
  });

  page2.drawText('B. ECONOMIA SIGNIFICATIVA E PARCELAMENTO SUAVE', {
    x: 55,
    y: y - 22,
    size: 10.5,
    font: fontBold,
    color: rgb(0.65, 0.40, 0.10),
  });

  const b2Lines = [
    '• Contratação Preventiva: Pode ser parcelada em condições facilitadas (em até 24x ou 36x),',
    '  com valores fixos e suaves que cabem perfeitamente no orçamento familiar sem sustos.',
    '• Contratação Imediata (Emergência): No momento da perda, as opções de pagamento são reduzidas,',
    '  exigindo entrada imediata e valores que podem custar até 3 vezes mais do que no plano planejado.',
    '• Eliminação de Taxas Oportunistas: Você congela os custos hoje e protege o patrimônio da sua família',
    '  contra a inflação do setor funerário e reajustes futuros.',
  ];
  ty = y - 38;
  for (const l of b2Lines) {
    page2.drawText(l, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.25, 0.22, 0.18) });
    ty -= 12;
  }

  y -= 120;

  // Bloco 3: Perpetuidade vs Cemitérios Públicos
  page2.drawRectangle({
    x: 40,
    y: y - 110,
    width: width - 80,
    height: 110,
    color: rgb(0.97, 0.97, 1),
    borderColor: rgb(0.80, 0.80, 0.92),
    borderWidth: 1,
  });

  page2.drawText('C. JAZIGO PERPÉTUO VS A INSEGURANÇA DOS CEMITÉRIOS PÚBLICOS', {
    x: 55,
    y: y - 22,
    size: 10.5,
    font: fontBold,
    color: rgb(0.20, 0.25, 0.65),
  });

  const b3Lines = [
    '• Cemitérios Públicos / Municipais: Trabalham apenas com gavetas provisórias por prazo determinado',
    '  (geralmente 3 anos). Vencido o prazo, a família é notificada para a exumação obrigatória e remoção',
    '  dos despojos para ossários comunitários, gerando dor, insegurança e desamparo contínuo.',
    '• Parque da Cantareira (Jazigo Perpétuo): O título de cessão é VITALÍCIO E HEREDITÁRIO.',
    '  O jazigo pertence para sempre à sua família e passará de geração em geração, oferecendo',
    '  um ponto de referência definitivo, digno e protegido para a memória dos seus antepassados.',
  ];
  ty = y - 38;
  for (const l of b3Lines) {
    page2.drawText(l, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.2, 0.22, 0.3) });
    ty -= 12;
  }

  y -= 125;

  // Tabela Comparativa Resumida
  page2.drawText('QUADRO COMPARATIVO: AQUISIÇÃO PREVENTIVA VS AQUISIÇÃO DE URGÊNCIA', {
    x: 40,
    y: y,
    size: 9.5,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.12),
  });

  y -= 14;
  page2.drawRectangle({
    x: 40,
    y: y - 85,
    width: width - 80,
    height: 85,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 1,
  });

  // Header da tabela
  page2.drawRectangle({
    x: 40,
    y: y - 20,
    width: width - 80,
    height: 20,
    color: rgb(0.08, 0.28, 0.18),
  });
  page2.drawText('CRITÉRIO', { x: 50, y: y - 14, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page2.drawText('PLANO PREVENTIVO (RECOMENDADO)', { x: 180, y: y - 14, size: 8, font: fontBold, color: rgb(1, 1, 1) });
  page2.drawText('USO IMEDIATO (EMERGÊNCIA)', { x: 390, y: y - 14, size: 8, font: fontBold, color: rgb(1, 1, 1) });

  const compData = [
    ['Forma de Pagamento', 'Parcelamento suave em até 24x ou 36x sem juros', 'À vista ou com poucas parcelas sob pressão'],
    ['Custo Total', 'Tabelas promocionais com desconto preventivo', 'Preços majorados de tabela cheia emergencial'],
    ['Estado Emocional', 'Decisão consciente, lúcida e em família', 'Decisão precipitada sob luto e estresse extremo'],
    ['Escolha da Localização', 'Família escolhe a melhor quadra e vista do parque', 'Fica restrita às poucas gavetas vagas no dia'],
  ];

  ty = y - 34;
  for (const row of compData) {
    page2.drawText(row[0], { x: 50, y: ty, size: 7.5, font: fontBold, color: rgb(0.2, 0.25, 0.22) });
    page2.drawText(row[1], { x: 180, y: ty, size: 7.5, font: fontRegular, color: rgb(0.05, 0.45, 0.2) });
    page2.drawText(row[2], { x: 390, y: ty, size: 7.5, font: fontRegular, color: rgb(0.6, 0.2, 0.15) });
    ty -= 15;
  }

  // =========================================================================
  // PÁGINA 3: MODALIDADES DE JAZIGOS & INFRAESTRUTURA COMPLETA
  // =========================================================================
  const page3 = doc.addPage([595.28, 841.89]);
  drawPageHeader(page3, 'Modalidades de Jazigos & Infraestrutura Completa 24h', 3);

  y = height - 75;

  page3.drawText('2. MODALIDADES DE JAZIGOS DISPONÍVEIS', {
    x: 40,
    y: y,
    size: 13,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.18),
  });
  page3.drawText('Conheça os modelos de jazigos e serviços cerimoniais desenvolvidos para amparar cada perfil familiar.', {
    x: 40,
    y: y - 16,
    size: 9,
    font: fontOblique,
    color: rgb(0.35, 0.45, 0.4),
  });

  y -= 40;

  // Caixa Jazigo Perpétuo
  page3.drawRectangle({
    x: 40,
    y: y - 105,
    width: width - 80,
    height: 105,
    color: rgb(0.97, 0.99, 0.97),
    borderColor: rgb(0.80, 0.88, 0.82),
    borderWidth: 1,
  });

  page3.drawText('JAZIGO FAMILIAR PERPÉTUO (PATRIMÔNIO VITALÍCIO)', {
    x: 55,
    y: y - 22,
    size: 11,
    font: fontBold,
    color: rgb(0.08, 0.35, 0.22),
  });

  const jazigoLines = [
    '• Capacidade: Disponível em opções de 3 ou 4 gavetas subterrâneas amplas e impermeabilizadas.',
    '• Compartimento de Ossário Privativo: Área exclusiva no próprio jazigo para acondicionamento perpétuo',
    '  dos despojos exumados, liberando as gavetas para novos sepultamentos ao longo das gerações.',
    '• Identificação Nobre: Placa em bronze fundido gravada com o nome dos entes queridos, datas e homenagens.',
    '• Direito Hereditário: Protegido por escritura e termo de cessão vitalícia irrevogável.',
    '• Condição Especial: Parcelamento preventivo facilitado e desconto especial à vista no Pix.',
  ];
  ty = y - 38;
  for (const l of jazigoLines) {
    page3.drawText(l, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.2, 0.25, 0.22) });
    ty -= 12;
  }

  y -= 120;

  // Caixa Locação Temporária & Cremação
  page3.drawRectangle({
    x: 40,
    y: y - 85,
    width: width - 80,
    height: 85,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.88),
    borderWidth: 1,
  });

  page3.drawText('LOCAÇÃO TEMPORÁRIA (4 ANOS) & ASSISTÊNCIA DE CREMAÇÃO', {
    x: 55,
    y: y - 20,
    size: 10.5,
    font: fontBold,
    color: rgb(0.12, 0.15, 0.14),
  });

  const locLines = [
    '• Locação por 4 Anos: Atende famílias em situação de necessidade imediata que não possuem jazigo próprio.',
    '  Após o período legal de 4 anos, a família pode optar pela aquisição de ossário perpétuo ou cremação.',
    '• Cremação & Columbários: Orientação cerimonial completa para cinzas, com nichos ecológicos no bosque.',
    '• Assistência Burocrática: Apoio 24h para liberação de certidões, cartórios, translado e guia de sepultamento.',
  ];
  ty = y - 36;
  for (const l of locLines) {
    page3.drawText(l, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.25, 0.3, 0.28) });
    ty -= 12;
  }

  y -= 105;

  // Seção de Fotos da Infraestrutura (2 fotos lado a lado: Capela e Sala de Velório VIP)
  page3.drawText('INFRAESTRUTURA DE ACOLHIMENTO E HOMENAGENS:', {
    x: 40,
    y: y,
    size: 10.5,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.18),
  });

  y -= 18;
  const colWidth = (width - 95) / 2;
  const photoHeight = 150;

  // Foto 1: Capela
  if (imgCapela) {
    page3.drawRectangle({
      x: 39,
      y: y - photoHeight - 1,
      width: colWidth + 2,
      height: photoHeight + 2,
      color: rgb(0.96, 0.98, 0.96),
      borderColor: rgb(0.80, 0.88, 0.82),
      borderWidth: 1,
    });
    page3.drawImage(imgCapela, {
      x: 40,
      y: y - photoHeight,
      width: colWidth,
      height: photoHeight,
    });
  }
  // Legenda Capela
  page3.drawText('Capela Ecumênica do Bosque Nativo', {
    x: 45,
    y: y - photoHeight - 15,
    size: 8,
    font: fontBold,
    color: rgb(0.1, 0.3, 0.2),
  });
  page3.drawText('Espaço ecumênico para orações e celebrações de todas as fés.', {
    x: 45,
    y: y - photoHeight - 25,
    size: 7,
    font: fontRegular,
    color: rgb(0.4, 0.45, 0.42),
  });

  // Foto 2: Sala de Velório VIP
  if (imgSala) {
    const xPos = 40 + colWidth + 15;
    page3.drawRectangle({
      x: xPos - 1,
      y: y - photoHeight - 1,
      width: colWidth + 2,
      height: photoHeight + 2,
      color: rgb(0.96, 0.98, 0.96),
      borderColor: rgb(0.80, 0.88, 0.82),
      borderWidth: 1,
    });
    page3.drawImage(imgSala, {
      x: xPos,
      y: y - photoHeight,
      width: colWidth,
      height: photoHeight,
    });
    // Legenda Sala
    page3.drawText('Salas de Velório & Repouso VIP 24h', {
      x: xPos + 5,
      y: y - photoHeight - 15,
      size: 8,
      font: fontBold,
      color: rgb(0.1, 0.3, 0.2),
    });
    page3.drawText('6 salas climatizadas com suíte privativa para o descanso familiar.', {
      x: xPos + 5,
      y: y - photoHeight - 25,
      size: 7,
      font: fontRegular,
      color: rgb(0.4, 0.45, 0.42),
    });
  }

  // =========================================================================
  // PÁGINA 4: COMO AGENDAR SUA VISITA GUIADA & DOCUMENTAÇÃO NECESSÁRIA
  // =========================================================================
  const page4 = doc.addPage([595.28, 841.89]);
  drawPageHeader(page4, 'Visita Guiada, Documentação & Atendimento Humanizado', 4);

  y = height - 75;

  page4.drawText('3. VISITA GUIADA, CONTRATAÇÃO & SUPORTE FAMILIAR', {
    x: 40,
    y: y,
    size: 13,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.18),
  });
  page4.drawText('Conheça o passo a passo simples e acolhedor para formalizar o plano de segurança da sua família.', {
    x: 40,
    y: y - 16,
    size: 9,
    font: fontOblique,
    color: rgb(0.35, 0.45, 0.4),
  });

  y -= 40;

  // Caixa: Passo a Passo da Visita
  page4.drawRectangle({
    x: 40,
    y: y - 120,
    width: width - 80,
    height: 120,
    color: rgb(0.97, 0.99, 0.97),
    borderColor: rgb(0.80, 0.88, 0.82),
    borderWidth: 1,
  });

  page4.drawText('PASSO A PASSO PARA CONHECER O PARQUE (VISITA GUIADA GRATUITA)', {
    x: 55,
    y: y - 22,
    size: 10.5,
    font: fontBold,
    color: rgb(0.08, 0.35, 0.22),
  });

  const stepLines = [
    '1. Agendamento com a Consultora Sofia: Basta informar a data e período de sua preferência (manhã ou tarde).',
    '2. Recepção Personalizada: Ao chegar ao parque na Serra da Cantareira, um consultor de acolhimento receberá',
    '   você e sua família com café, água fresca e total cordialidade em nossa sala de atendimento.',
    '3. Tour pelas Alamedas: Você fará um passeio tranquilo no carrinho elétrico pelas quadras e bosques nativos,',
    '   podendo escolher pessoalmente a localização exata, a vista das colinas e a quadra que mais lhe agradar.',
    '4. Simulação sem Compromisso: Nosso consultor apresentará as tabelas de parcelamento preventivo personalizadas',
    '   para o seu orçamento familiar, sem nenhuma pressão de fechamento no dia.',
  ];
  ty = y - 38;
  for (const l of stepLines) {
    page4.drawText(l, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.2, 0.25, 0.22) });
    ty -= 12.5;
  }

  y -= 135;

  // Caixa: Documentos Necessários & Facilidades
  page4.drawRectangle({
    x: 40,
    y: y - 105,
    width: width - 80,
    height: 105,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.85, 0.85, 0.88),
    borderWidth: 1,
  });

  page4.drawText('DOCUMENTOS NECESSÁRIOS PARA FORMALIZAÇÃO DO JAZIGO:', {
    x: 55,
    y: y - 22,
    size: 10.5,
    font: fontBold,
    color: rgb(0.12, 0.15, 0.14),
  });

  const docItems = [
    '• Documento de Identificação Oficial com Foto (RG ou CNH) do titular responsável.',
    '• Cadastro de Pessoa Física (CPF) regular perante a Receita Federal.',
    '• Comprovante de Residência Atualizado em nome do titular ou cônjuge (energia, água ou gás).',
    '• Certidão de Casamento ou União Estável (caso deseje incluir o cônjuge como cotitular).',
    '• Formas de Pagamento Aceitas: Boleto bancário parcelado, cartão de crédito e desconto especial no Pix.',
  ];
  ty = y - 38;
  for (const it of docItems) {
    page4.drawText(it, { x: 55, y: ty, size: 8.5, font: fontRegular, color: rgb(0.25, 0.3, 0.28) });
    ty -= 12.5;
  }

  y -= 125;

  // Caixa de Compromisso Humanizado & Contato
  page4.drawRectangle({
    x: 40,
    y: y - 120,
    width: width - 80,
    height: 120,
    color: rgb(0.08, 0.28, 0.18),
  });

  page4.drawText('NOSSO COMPROMISSO DE ACOLHIMENTO E DIGNIDADE', {
    x: 55,
    y: y - 25,
    size: 11,
    font: fontBold,
    color: rgb(0.82, 0.68, 0.25),
  });

  const compLines = [
    '"No Cemitério Parque da Cantareira, acreditamos que a memória de quem amamos merece ser celebrada',
    'em um ambiente de paz eterna, rodeado pela grandiosidade da natureza. Nosso propósito diário é',
    'proporcionar amparo afetuoso, respeito absoluto e segurança permanente para a sua família."',
  ];
  ty = y - 42;
  for (const cl of compLines) {
    page4.drawText(cl, { x: 55, y: ty, size: 8.5, font: fontOblique, color: rgb(0.9, 0.96, 0.92) });
    ty -= 12;
  }

  // Contato destacado no bloco verde
  page4.drawRectangle({
    x: 55,
    y: y - 110,
    width: width - 110,
    height: 32,
    color: rgb(0.05, 0.22, 0.14),
  });
  page4.drawText('Localizacao: Serra da Cantareira • Mairiporã - SP | Central 24h: (11) 4485-1122 | WhatsApp: (11) 97614-3323', {
    x: 65,
    y: y - 94,
    size: 8,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page4.drawText('Site Oficial: cemiteriocantareira.com.br • Agende sua visita com a consultora Sofia a qualquer momento.', {
    x: 65,
    y: y - 105,
    size: 7.5,
    font: fontRegular,
    color: rgb(0.8, 0.9, 0.85),
  });

  const pdfBytes = await doc.save();
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('[PDF Generator Cantareira] Dossiê oficial de 4 páginas com fotos gerado com sucesso em:', outputPath);
}

