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
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  const primoDir = path.join(process.cwd(), 'public', 'assets', 'primo');

  const imgRefrigPath = path.join(primoDir, 'refrigeracao_comercial.jpg');
  const imgCoccaoPath = path.join(primoDir, 'coccao_industrial.jpg');
  const imgPreparoPath = path.join(primoDir, 'preparo_processamento.jpg');
  const imgLiquidificadorPath = path.join(primoDir, 'liquidificador_baixa.jpg');
  const imgBalancaPath = path.join(primoDir, 'balanca_prix3.jpg');
  const imgGeloparPath = path.join(primoDir, 'refrigerador_gelopar.jpg');
  const imgVulcanPath = path.join(primoDir, 'fritador_vulcan.jpg');
  const imgFatiadorPath = path.join(primoDir, 'fatiador_gural.jpg');
  const imgPanelaPath = path.join(primoDir, 'panela_tramontina.jpg');

  let imgRefrig: any = null;
  let imgCoccao: any = null;
  let imgPreparo: any = null;
  let imgLiquidificador: any = null;
  let imgBalanca: any = null;
  let imgGelopar: any = null;
  let imgVulcan: any = null;
  let imgFatiador: any = null;
  let imgPanela: any = null;

  try {
    if (fs.existsSync(imgRefrigPath)) imgRefrig = await doc.embedJpg(fs.readFileSync(imgRefrigPath));
    if (fs.existsSync(imgCoccaoPath)) imgCoccao = await doc.embedJpg(fs.readFileSync(imgCoccaoPath));
    if (fs.existsSync(imgPreparoPath)) imgPreparo = await doc.embedJpg(fs.readFileSync(imgPreparoPath));
    if (fs.existsSync(imgLiquidificadorPath)) imgLiquidificador = await doc.embedJpg(fs.readFileSync(imgLiquidificadorPath));
    if (fs.existsSync(imgBalancaPath)) imgBalanca = await doc.embedJpg(fs.readFileSync(imgBalancaPath));
    if (fs.existsSync(imgGeloparPath)) imgGelopar = await doc.embedJpg(fs.readFileSync(imgGeloparPath));
    if (fs.existsSync(imgVulcanPath)) imgVulcan = await doc.embedJpg(fs.readFileSync(imgVulcanPath));
    if (fs.existsSync(imgFatiadorPath)) imgFatiador = await doc.embedJpg(fs.readFileSync(imgFatiadorPath));
    if (fs.existsSync(imgPanelaPath)) imgPanela = await doc.embedJpg(fs.readFileSync(imgPanelaPath));
  } catch (err) {
    console.warn('[PDF Generator Primo] Aviso ao carregar imagens da Primo Equipamentos:', err);
  }

  const TOTAL_PAGES = 6;

  // Header padrão para páginas 2 a 6
  const drawPageHeader = (page: any, sectionTitle: string, pageNum: number) => {
    const { width, height } = page.getSize();
    page.drawRectangle({
      x: 0,
      y: height - 50,
      width: width,
      height: 50,
      color: rgb(0.12, 0.16, 0.22),
    });
    page.drawRectangle({
      x: 0,
      y: height - 53,
      width: width,
      height: 3,
      color: rgb(0.88, 0.45, 0.08),
    });
    page.drawText('PRIMO EQUIPAMENTOS - GASTRONOMIA PROFISSIONAL & FOOD SERVICE', {
      x: 35,
      y: height - 28,
      size: 9,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText(sectionTitle, {
      x: 35,
      y: height - 42,
      size: 8,
      font: fontRegular,
      color: rgb(0.9, 0.92, 0.95),
    });
    page.drawText(`Pagina ${pageNum} de ${TOTAL_PAGES}`, {
      x: width - 100,
      y: height - 35,
      size: 8.5,
      font: fontBold,
      color: rgb(0.88, 0.45, 0.08),
    });
  };

  // Footer padrão
  const drawPageFooter = (page: any) => {
    const { width } = page.getSize();
    page.drawLine({
      start: { x: 35, y: 35 },
      end: { x: width - 35, y: 35 },
      thickness: 0.8,
      color: rgb(0.85, 0.88, 0.92),
    });
    page.drawText('Primo Equipamentos Ltda - CNPJ 18.154.896/0001-29 - Loja: primo-equipamentos.lojaintegrada.com.br', {
      x: 35,
      y: 22,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.45, 0.5, 0.55),
    });
    page.drawText('Televendas: (11) 3313-2875 - WhatsApp: (11) 97333-4135', {
      x: width - 255,
      y: 22,
      size: 7.5,
      font: fontBold,
      color: rgb(0.15, 0.2, 0.25),
    });
  };

  // ==========================================
  // PAGINA 1: CAPA & APRESENTACAO INSTITUCIONAL
  // ==========================================
  const page1 = doc.addPage([595.28, 841.89]);
  const { width: p1W, height: p1H } = page1.getSize();

  // Topo Master
  page1.drawRectangle({
    x: 0,
    y: p1H - 120,
    width: p1W,
    height: 120,
    color: rgb(0.12, 0.16, 0.22),
  });
  page1.drawRectangle({
    x: 0,
    y: p1H - 125,
    width: p1W,
    height: 5,
    color: rgb(0.88, 0.45, 0.08),
  });

  page1.drawText('PRIMO EQUIPAMENTOS GASTRONOMICOS', {
    x: 35,
    y: p1H - 45,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page1.drawText('CATALOGO TECNICO & TABELA DE PRECOS OFICIAL - 2026', {
    x: 35,
    y: p1H - 68,
    size: 10,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });
  page1.drawText('Solucoes B2B Completas: Balancas, Panificacao, Refrigeracao, Coccao Pesada, Frios e Utensilios', {
    x: 35,
    y: p1H - 88,
    size: 8.5,
    font: fontRegular,
    color: rgb(0.9, 0.92, 0.96),
  });
  page1.drawText('CNPJ: 18.154.896/0001-29 - Atendendo Restaurantes, Bares, Lanchonetes, Padarias e Cozinhas Industriais', {
    x: 35,
    y: p1H - 106,
    size: 8,
    font: fontOblique,
    color: rgb(0.75, 0.8, 0.88),
  });

  let y = p1H - 145;

  // Banner Foto 1
  if (imgRefrig) {
    const imgH = 160;
    page1.drawImage(imgRefrig, {
      x: 35,
      y: y - imgH,
      width: p1W - 70,
      height: imgH,
    });
    page1.drawRectangle({
      x: 35,
      y: y - imgH,
      width: p1W - 70,
      height: 22,
      color: rgb(0.08, 0.1, 0.14),
    });
    page1.drawText('Linha Completa de Maquinarios Industriais com Garantia Nacional de Fabrica e Suporte Tecnico', {
      x: 45,
      y: y - imgH + 7,
      size: 7.5,
      font: fontRegular,
      color: rgb(0.9, 0.93, 0.98),
    });
    y -= (imgH + 18);
  }

  // Box 1: Sobre a Primo Equipamentos
  page1.drawRectangle({
    x: 35,
    y: y - 110,
    width: p1W - 70,
    height: 110,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.85, 0.92),
    borderWidth: 1,
  });
  page1.drawText('1. ESTRUTURA COMERCIAL & PARCERIAS COM AS MAIORES FABRICAS', {
    x: 48,
    y: y - 20,
    size: 11,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });

  const sobreText = [
    '- Distribuidor autorizado das maiores marcas do Brasil: Metalfrio, Gelopar, Skymsen, Toledo, Croydon, G.Paniz, Tramontina, Ramuza e Marchesoni.',
    '- Equipamentos novos com garantia oficial de fabrica, nota fiscal eletronica e ampla rede de assistencia tecnica autorizada.',
    '- Consultoria tecnica especializada para dimensionamento de cozinhas, calculo de carga termica e especificacao eletrica correta (110V vs 220V).',
    '- Condicoes comerciais diferenciadas para abertura de novas cozinhas ou renovacao de parque fabril gastronomico.',
    '- Condicoes de pagamento: Desconto especial no PIX a vista e parcelamento facilitado no cartao de credito.',
  ];
  let ty = y - 36;
  for (const line of sobreText) {
    page1.drawText(line, { x: 48, y: ty, size: 7.8, font: fontRegular, color: rgb(0.2, 0.25, 0.3) });
    ty -= 13;
  }
  y -= 125;

  // Box 2: Segmentos Atendidos
  page1.drawRectangle({
    x: 35,
    y: y - 100,
    width: p1W - 70,
    height: 100,
    color: rgb(0.99, 0.97, 0.95),
    borderColor: rgb(0.9, 0.82, 0.75),
    borderWidth: 1,
  });
  page1.drawText('2. SEGMENTOS & NEGOCIOS ATENDIDOS PELA PRIMO EQUIPAMENTOS', {
    x: 48,
    y: y - 20,
    size: 11,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });

  const segText = [
    '- ACOUGUES & CASAS DE CARNES: Balcoes expositores refrigerados com deposito (Gelopar GATS-200), fatiadores e serras fita.',
    '- PADARIAS, CONFEITARIAS & PIZZARIAS: Amassadeiras semi rapidas 25kg (G.Paniz AM25), batedeiras industriais e balancas de bancada.',
    '- HAMBURGUERIAS & FAST FOOD: Fritadores pesados a gas Vulcan LG 300, fritadeiras Croydon e chapas bifeteiras de alto rendimento.',
    '- SUPERMERCADOS, MERCEARIAS & CHECK-OUT: Balancas computadoras Toledo Prix 3 Plus, Ramuza Wi-Fi e balancas embutidas 8217.',
    '- RESTAURANTES, BUFFETS & COZINHAS INDUSTRIAIS: Fogoes por inducao Tramontina 3500W, cubas GN, extratores e frigideiras inox.',
  ];
  ty = y - 36;
  for (const s of segText) {
    page1.drawText(s, { x: 48, y: ty, size: 7.8, font: fontRegular, color: rgb(0.25, 0.22, 0.2) });
    ty -= 15;
  }

  drawPageFooter(page1);

  // ==========================================
  // PAGINA 2: REFRIGERACAO COMERCIAL & ACOUGUES (COM FOTO REAL GELOPAR)
  // ==========================================
  const page2 = doc.addPage([595.28, 841.89]);
  const { width: p2W, height: p2H } = page2.getSize();
  drawPageHeader(page2, 'Secao I: Linha de Refrigeracao Comercial, Freezers & Balcoes de Acougue', 2);

  y = p2H - 72;

  page2.drawText('3. REFRIGERACAO INDUSTRIAL & CONGELADOS (GELOPAR & METALFRIO)', {
    x: 35,
    y: y,
    size: 11.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  y -= 14;

  // Produto 1: GATS-200 Balcão Açougue
  page2.drawRectangle({
    x: 35,
    y: y - 68,
    width: p2W - 70,
    height: 68,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.75, 0.85, 0.95),
    borderWidth: 1,
  });
  page2.drawText('GATS-200 PR BALCAO DE ACOUGUE COM DEPOSITO GELOPAR', {
    x: 45,
    y: y - 18,
    size: 9.5,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.55),
  });
  page2.drawRectangle({
    x: p2W - 165,
    y: y - 20,
    width: 120,
    height: 15,
    color: rgb(0.88, 0.45, 0.08),
  });
  page2.drawText('DESTAQUE ACOUGUE', {
    x: p2W - 155,
    y: y - 16,
    size: 7,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page2.drawText('Valor Comercial: R$ 17.869,00', {
    x: 45,
    y: y - 32,
    size: 9,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page2.drawText('Exposicao de carnes frescas e frios. Gancheira superior dupla, deposito refrigerado inferior de estoque, vidro reto temperado, serpentina em cobre, iluminacao LED especial para valorizar o produto.', {
    x: 45,
    y: y - 48,
    size: 7.2,
    font: fontRegular,
    color: rgb(0.25, 0.3, 0.35),
    maxWidth: p2W - 95,
    lineHeight: 10,
  });
  y -= 76;

  // Seção com FOTO REAL GELOPAR + 2 Produtos Lado a Lado
  const photoW = 210;
  const photoH = 155;
  const photoX = 35;
  const photoY = y - photoH;

  if (imgGelopar) {
    page2.drawImage(imgGelopar, {
      x: photoX,
      y: photoY,
      width: photoW,
      height: photoH,
    });
    // Borda elegante
    page2.drawRectangle({
      x: photoX,
      y: photoY,
      width: photoW,
      height: photoH,
      borderColor: rgb(0.88, 0.45, 0.08),
      borderWidth: 1.5,
    });
    // Tarja de legenda
    page2.drawRectangle({
      x: photoX,
      y: photoY,
      width: photoW,
      height: 20,
      color: rgb(0.08, 0.12, 0.18),
    });
    page2.drawText('Expositor Vertical Gelopar Inox 2 Portas', {
      x: photoX + 10,
      y: photoY + 6,
      size: 7.2,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  // Lado direito da foto: Produtos 2 e 3
  const sideX = photoX + photoW + 12;
  const sideW = p2W - 35 - sideX;

  // Produto 2: Ilha Standard GESV
  page2.drawRectangle({
    x: sideX,
    y: y - 72,
    width: sideW,
    height: 72,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.75, 0.85, 0.95),
    borderWidth: 1,
  });
  page2.drawText('Expositor Ilha Standard GESV Gelopar', {
    x: sideX + 8,
    y: y - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.55),
  });
  page2.drawText('A partir de R$ 9.109,00', {
    x: sideX + 8,
    y: y - 30,
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page2.drawText('Ilha para congelados e embalados. Tampas de vidro curvo temperado Low-E, termometro digital e alta eficiencia energetica.', {
    x: sideX + 8,
    y: y - 44,
    size: 6.8,
    font: fontRegular,
    color: rgb(0.25, 0.3, 0.35),
    maxWidth: sideW - 16,
    lineHeight: 9.5,
  });

  // Produto 3: Freezer Metalfrio 531L
  page2.drawRectangle({
    x: sideX,
    y: y - 155,
    width: sideW,
    height: 78,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.75, 0.85, 0.95),
    borderWidth: 1,
  });
  page2.drawText('Freezer Metalfrio 531L VF55FT', {
    x: sideX + 8,
    y: y - 99,
    size: 8.5,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.55),
  });
  page2.drawText('R$ 5.920,00 (28% OFF)', {
    x: sideX + 8,
    y: y - 113,
    size: 8.5,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });
  page2.drawText('Funcao tripla: Refrigerador, Conservador ou Congelador (-18C a -22C). Porta com aquecimento antiembacante e gas ecologico R290.', {
    x: sideX + 8,
    y: y - 127,
    size: 6.8,
    font: fontRegular,
    color: rgb(0.25, 0.3, 0.35),
    maxWidth: sideW - 16,
    lineHeight: 9.5,
  });

  y -= (photoH + 10);

  // Produto 4: Freezer Vertical Gpc 57 Gelopar
  page2.drawRectangle({
    x: 35,
    y: y - 62,
    width: p2W - 70,
    height: 62,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.75, 0.85, 0.95),
    borderWidth: 1,
  });
  page2.drawText('Freezer Vertical Gpc 57 Gelopar - 2 Anos de Garantia Oficial de Fabrica', {
    x: 45,
    y: y - 16,
    size: 9.5,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.55),
  });
  page2.drawText('Valor Comercial: R$ 6.306,00', {
    x: 45,
    y: y - 30,
    size: 9,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page2.drawText('Conservacao Frost Free para congelados ou resfriados com display digital externo e baixissimo consumo de energia.', {
    x: 45,
    y: y - 44,
    size: 7.2,
    font: fontRegular,
    color: rgb(0.25, 0.3, 0.35),
    maxWidth: p2W - 95,
  });
  y -= 70;

  // Mini Banner Técnico Refrigeração
  page2.drawRectangle({
    x: 35,
    y: y - 88,
    width: p2W - 70,
    height: 88,
    color: rgb(0.95, 0.97, 0.99),
    borderColor: rgb(0.85, 0.88, 0.92),
    borderWidth: 1,
  });
  page2.drawText('DIRETRIZES DE REFRIGERACAO COMERCIAL PRIMO EQUIPAMENTOS:', {
    x: 45,
    y: y - 18,
    size: 9,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  const refrigTips = [
    '- TEMPERATURA SUBZERO (-6C a +2C): Ideal para cervejeiras com garrafas sem risco de congelamento.',
    '- CARNES FRESCAS (+1C a +7C): Balcao GATS-200 mantem carnes vermelhas e aves com cor natural e frescor.',
    '- CONGELADOS (-18C a -22C): Freezers Metalfrio e Gelopar com sistema ecologico R290 de baixissimo consumo.',
    '- VOLTAGEM OBRIGATORIA: Todos os refrigeradores disponiveis em 110V ou 220V sob confirmacao no pedido.',
  ];
  let rty = y - 32;
  for (const t of refrigTips) {
    page2.drawText(t, { x: 45, y: rty, size: 7.3, font: fontRegular, color: rgb(0.25, 0.28, 0.32) });
    rty -= 12;
  }

  drawPageFooter(page2);

  // ==========================================
  // PAGINA 3: COCÇÃO PESADA & FRITADEIRAS (COM FOTO REAL VULCAN)
  // ==========================================
  const page3 = doc.addPage([595.28, 841.89]);
  const { width: p3W, height: p3H } = page3.getSize();
  drawPageHeader(page3, 'Secao II: Equipamentos de Coccao Pesada, Fritadeiras & Inducao', 3);

  y = p3H - 72;

  page3.drawText('4. LINHA QUENTE PROFISSIONAL: FRITADORES, FOGOES E INDUCAO', {
    x: 35,
    y: y,
    size: 11.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  y -= 14;

  // Produto 1: Fritador Vulcan LG 300
  page3.drawRectangle({
    x: 35,
    y: y - 68,
    width: p3W - 70,
    height: 68,
    color: rgb(0.99, 0.98, 0.96),
    borderColor: rgb(0.92, 0.85, 0.75),
    borderWidth: 1,
  });
  page3.drawText('Fritador Vulcan LG 300 a Gas GLP (Lider Mundial Food Service)', {
    x: 45,
    y: y - 18,
    size: 9.5,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });
  page3.drawRectangle({
    x: p3W - 175,
    y: y - 20,
    width: 130,
    height: 15,
    color: rgb(0.12, 0.16, 0.22),
  });
  page3.drawText('TOP MUNDIAL FAST FOOD', {
    x: p3W - 165,
    y: y - 16,
    size: 7,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page3.drawText('Valor Comercial: R$ 13.960,00', {
    x: 45,
    y: y - 32,
    size: 9,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page3.drawText('Tanque de alta capacidade (18 a 21L), 3 queimadores pesados com 90.000 BTU/h, sistema de zona fria que prolonga a vida util do oleo e recuperacao termica instantanea para batatas e empanados crocantes.', {
    x: 45,
    y: y - 48,
    size: 7.2,
    font: fontRegular,
    color: rgb(0.25, 0.2, 0.15),
    maxWidth: p3W - 95,
    lineHeight: 10,
  });
  y -= 76;

  // Seção com FOTO REAL VULCAN + 2 Produtos Lado a Lado
  const vulcanPhotoW = 210;
  const vulcanPhotoH = 155;
  const vulcanPhotoX = 35;
  const vulcanPhotoY = y - vulcanPhotoH;

  if (imgVulcan) {
    page3.drawImage(imgVulcan, {
      x: vulcanPhotoX,
      y: vulcanPhotoY,
      width: vulcanPhotoW,
      height: vulcanPhotoH,
    });
    page3.drawRectangle({
      x: vulcanPhotoX,
      y: vulcanPhotoY,
      width: vulcanPhotoW,
      height: vulcanPhotoH,
      borderColor: rgb(0.88, 0.45, 0.08),
      borderWidth: 1.5,
    });
    page3.drawRectangle({
      x: vulcanPhotoX,
      y: vulcanPhotoY,
      width: vulcanPhotoW,
      height: 20,
      color: rgb(0.08, 0.12, 0.18),
    });
    page3.drawText('Fritador Vulcan LG 300 Inox em Operacao', {
      x: vulcanPhotoX + 10,
      y: vulcanPhotoY + 6,
      size: 7.2,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  const vSideX = vulcanPhotoX + vulcanPhotoW + 12;
  const vSideW = p3W - 35 - vSideX;

  // Produto 2: Fogão Indução Tramontina
  page3.drawRectangle({
    x: vSideX,
    y: y - 72,
    width: vSideW,
    height: 72,
    color: rgb(0.99, 0.98, 0.96),
    borderColor: rgb(0.92, 0.85, 0.75),
    borderWidth: 1,
  });
  page3.drawText('Fogao 1 Boca Inducao Tramontina 3500W', {
    x: vSideX + 8,
    y: y - 16,
    size: 8,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });
  page3.drawText('R$ 3.599,90', {
    x: vSideX + 8,
    y: y - 30,
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page3.drawText('Potencia profissional de 3,5 kW em 220V. Mesa vitroceramica, painel touch com 10 niveis precisos e sem irradiar calor no ambiente.', {
    x: vSideX + 8,
    y: y - 44,
    size: 6.8,
    font: fontRegular,
    color: rgb(0.25, 0.2, 0.15),
    maxWidth: vSideW - 16,
    lineHeight: 9.5,
  });

  // Produto 3: FC-N Fritadeira Skymsen
  page3.drawRectangle({
    x: vSideX,
    y: y - 155,
    width: vSideW,
    height: 78,
    color: rgb(0.99, 0.98, 0.96),
    borderColor: rgb(0.92, 0.85, 0.75),
    borderWidth: 1,
  });
  page3.drawText('FC-N Fritadeira Eletrica Skymsen', {
    x: vSideX + 8,
    y: y - 99,
    size: 8.5,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });
  page3.drawText('R$ 3.099,00', {
    x: vSideX + 8,
    y: y - 113,
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page3.drawText('Gabinete e tacho em aco inox escovado. Termostato de seguranca, cesta niquelada reforcada e rapida retomada termica.', {
    x: vSideX + 8,
    y: y - 127,
    size: 6.8,
    font: fontRegular,
    color: rgb(0.25, 0.2, 0.15),
    maxWidth: vSideW - 16,
    lineHeight: 9.5,
  });

  y -= (vulcanPhotoH + 10);

  // Produto 4: Croydon 15L
  page3.drawRectangle({
    x: 35,
    y: y - 62,
    width: p3W - 70,
    height: 62,
    color: rgb(0.99, 0.98, 0.96),
    borderColor: rgb(0.92, 0.85, 0.75),
    borderWidth: 1,
  });
  page3.drawText('Fritadeira Zona Fria 15 Litros De Mesa Fzm8 Croydon 220V', {
    x: 45,
    y: y - 16,
    size: 9.5,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });
  page3.drawText('Valor Comercial: R$ 2.406,00', {
    x: 45,
    y: y - 30,
    size: 9,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page3.drawText('Capacidade de 15L de oleo. Sistema de decantacao no fundo para evitar queima precoce da gordura. Potencia de 5.000W em 220V.', {
    x: 45,
    y: y - 44,
    size: 7.2,
    font: fontRegular,
    color: rgb(0.25, 0.2, 0.15),
    maxWidth: p3W - 95,
  });
  y -= 70;

  // Box Comparativo
  page3.drawRectangle({
    x: 35,
    y: y - 88,
    width: p3W - 70,
    height: 88,
    color: rgb(0.98, 0.97, 1),
    borderColor: rgb(0.85, 0.85, 0.95),
    borderWidth: 1,
  });
  page3.drawText('VANTAGENS DAS FRITADEIRAS DE ZONA FRIA & AGUA E OLEO:', {
    x: 45,
    y: y - 18,
    size: 9,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  const coccaoTips = [
    '- ECONOMIA DE OLEO EM ATE 60%: Os residuos de farinha e empanados caem na area fria do fundo sem queimar.',
    '- ALIMENTOS MAIS SECOS E CROCANTES: Potencia termica calculada para nao descer a temperatura ao mergulhar os cestos.',
    '- FOGAO DE INDUCAO TRAMONTINA: Ideal para preparos a vista do cliente, buffets executivos e cozinhas gourmet.',
    '- EXIGENCIA ELETRICA: Fritadeiras eletricas exigem disjuntores adequados e tomadas 20A exclusivas sem adaptadores.',
  ];
  let cty = y - 32;
  for (const t of coccaoTips) {
    page3.drawText(t, { x: 45, y: cty, size: 7.3, font: fontRegular, color: rgb(0.2, 0.25, 0.3) });
    cty -= 12;
  }

  drawPageFooter(page3);

  // ==========================================
  // PAGINA 4: PANIFICACAO, MASSAS & LIQUIDIFICADORES (COM FOTO REAL SKYMSEN)
  // ==========================================
  const page4 = doc.addPage([595.28, 841.89]);
  const { width: p4W, height: p4H } = page4.getSize();
  drawPageHeader(page4, 'Secao III: Panificacao, Confeitaria, Massas & Liquidificadores Industriais', 4);

  y = p4H - 72;

  page4.drawText('5. EQUIPAMENTOS DE PREPARO DE MASSAS & PROCESSAMENTO (G.PANIZ, MARCHESONI & SKYMSEN)', {
    x: 35,
    y: y,
    size: 11,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  y -= 14;

  // Produto 1: Amassadeira AM25
  page4.drawRectangle({
    x: 35,
    y: y - 68,
    width: p4W - 70,
    height: 68,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1,
  });
  page4.drawText('Amassadeira Semi Rapida AM25 G.Paniz (25 Kg de Massa Pronta)', {
    x: 45,
    y: y - 18,
    size: 9.5,
    font: fontBold,
    color: rgb(0.12, 0.25, 0.55),
  });
  page4.drawRectangle({
    x: p4W - 185,
    y: y - 20,
    width: 140,
    height: 15,
    color: rgb(0.88, 0.45, 0.08),
  });
  page4.drawText('PRODUCAO PESADA 25KG', {
    x: p4W - 175,
    y: y - 16,
    size: 7,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page4.drawText('Valor Comercial: R$ 7.199,00', {
    x: 45,
    y: y - 32,
    size: 9,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page4.drawText('Espiral em ferro fundido nodular estanhado, tacho basculante em aco inox 304, corpo em chapa de aco carbono reforcada e motor de alto torque para massas pesadas de paes e pizzas.', {
    x: 45,
    y: y - 48,
    size: 7.2,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.3),
    maxWidth: p4W - 95,
  });
  y -= 76;

  // Seção com FOTO REAL LIQUIDIFICADOR SKYMSEN + Produtos 2 e 3
  const liqPhotoW = 200;
  const liqPhotoH = 155;
  const liqPhotoX = 35;
  const liqPhotoY = y - liqPhotoH;

  if (imgLiquidificador) {
    page4.drawImage(imgLiquidificador, {
      x: liqPhotoX,
      y: liqPhotoY,
      width: liqPhotoW,
      height: liqPhotoH,
    });
    page4.drawRectangle({
      x: liqPhotoX,
      y: liqPhotoY,
      width: liqPhotoW,
      height: liqPhotoH,
      borderColor: rgb(0.88, 0.45, 0.08),
      borderWidth: 1.5,
    });
    page4.drawRectangle({
      x: liqPhotoX,
      y: liqPhotoY,
      width: liqPhotoW,
      height: 20,
      color: rgb(0.08, 0.12, 0.18),
    });
    page4.drawText('Liquidificador Skymsen Inox Baixa Rotacao', {
      x: liqPhotoX + 8,
      y: liqPhotoY + 6,
      size: 7.2,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  const liqSideX = liqPhotoX + liqPhotoW + 12;
  const liqSideW = p4W - 35 - liqSideX;

  // Produto 2: Batedeira Bambina
  page4.drawRectangle({
    x: liqSideX,
    y: y - 72,
    width: liqSideW,
    height: 72,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1,
  });
  page4.drawText('Batedeira G.Paniz Bambina BP-05B', {
    x: liqSideX + 8,
    y: y - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.25, 0.55),
  });
  page4.drawText('R$ 2.923,00 (Bivolt)', {
    x: liqSideX + 8,
    y: y - 30,
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page4.drawText('5 Litros de capacidade. Acompanha 3 batedores (globo, raquete e gancho) para chantilly, cremes e massas leves.', {
    x: liqSideX + 8,
    y: y - 44,
    size: 6.8,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.3),
    maxWidth: liqSideW - 16,
    lineHeight: 9.5,
  });

  // Produto 3: Chocolateira Marchesoni
  page4.drawRectangle({
    x: liqSideX,
    y: y - 155,
    width: liqSideW,
    height: 78,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.85, 0.95),
    borderWidth: 1,
  });
  page4.drawText('Chocolateira Marchesoni 3L', {
    x: liqSideX + 8,
    y: y - 99,
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.25, 0.55),
  });
  page4.drawText('R$ 2.699,00', {
    x: liqSideX + 8,
    y: y - 113,
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page4.drawText('Pa giratoria continua anti-queima no fundo. Termostato ajustavel ate 90C, torneira de alto fluxo e cuba transparente atrativa.', {
    x: liqSideX + 8,
    y: y - 127,
    size: 6.8,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.3),
    maxWidth: liqSideW - 16,
    lineHeight: 9.5,
  });

  y -= (liqPhotoH + 12);

  // Tabela Comparativa de Liquidificadores
  page4.drawRectangle({
    x: 35,
    y: y - 155,
    width: p4W - 70,
    height: 155,
    color: rgb(0.99, 0.97, 0.94),
    borderColor: rgb(0.92, 0.8, 0.65),
    borderWidth: 1,
  });
  page4.drawText('TABELA DE DECISAO CRITICA: ALTA ROTACAO VS BAIXA ROTACAO (SKYMSEN)', {
    x: 45,
    y: y - 20,
    size: 10,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });

  const liquidText = [
    '• ALTA ROTACAO (18.000 a 22.000 RPM - Modelos LAR / LI): Exclusivo para sucos de frutas, vitaminas, shakes e liquidos leves. Copo em inox ou policarbonato de 1,5L a 4L. NUNCA utilize para massas pesadas ou acai concentrado.',
    '• BAIXA ROTACAO (3.500 RPM COM ALTO TORQUE - Modelos LDB / Basculantes LB): Indispensavel para polpas congeladas, acai puro concentrado, cremes, maionese artesanal, molhos de tomate e pastas. Copos em inox 304 de 4L, 6L, 8L, 10L, 15L e 25L basculante.',
    '• MODELOS E PRECOS SKYMSEN DISPONIVEIS:',
    '  - Basculante LB 25L: R$ 2.959,00  |  Basculante LB 15L: R$ 2.879,00  |  Comercial LS 10L: R$ 1.950,00',
    '  - Comercial LS 8L: R$ 1.850,00  |  Comercial LS 6L: R$ 1.720,00  |  Comercial LS 4L: R$ 1.650,00',
    '  - Monobloco TA 4L: R$ 1.654,00  |  Inox Alta LI 1.5L: R$ 822,00  |  Copo Policarbonato LT 1.5L: R$ 749,00',
  ];
  let lty = y - 36;
  for (const lt of liquidText) {
    page4.drawText(lt, {
      x: 45,
      y: lty,
      size: 7.2,
      font: lt.includes('MODELOS') ? fontBold : fontRegular,
      color: lt.includes('MODELOS') ? rgb(0.12, 0.16, 0.22) : rgb(0.25, 0.22, 0.2),
      maxWidth: p4W - 95,
      lineHeight: 10.5,
    });
    lty -= (lt.includes('•') ? 19 : 13);
  }

  drawPageFooter(page4);

  // ==========================================
  // PAGINA 5: PESAGEM COMERCIAL & BALANCAS (COM FOTO REAL TOLEDO PRIX 3)
  // ==========================================
  const page5 = doc.addPage([595.28, 841.89]);
  const { width: p5W, height: p5H } = page5.getSize();
  drawPageHeader(page5, 'Secao IV: Balancas Digitais, Automacao Comercial & Check-out', 5);

  y = p5H - 72;

  page5.drawText('6. LINHA COMPLETA DE PESAGEM (TOLEDO, RAMUZA, TRIUNFO & UPX)', {
    x: 35,
    y: y,
    size: 11.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  y -= 14;

  // Seção com FOTO REAL BALANCA TOLEDO PRIX 3 + Balança Ramuza e Toledo 8217
  const balPhotoW = 210;
  const balPhotoH = 155;
  const balPhotoX = 35;
  const balPhotoY = y - balPhotoH;

  if (imgBalanca) {
    page5.drawImage(imgBalanca, {
      x: balPhotoX,
      y: balPhotoY,
      width: balPhotoW,
      height: balPhotoH,
    });
    page5.drawRectangle({
      x: balPhotoX,
      y: balPhotoY,
      width: balPhotoW,
      height: balPhotoH,
      borderColor: rgb(0.88, 0.45, 0.08),
      borderWidth: 1.5,
    });
    page5.drawRectangle({
      x: balPhotoX,
      y: balPhotoY,
      width: balPhotoW,
      height: 20,
      color: rgb(0.08, 0.12, 0.18),
    });
    page5.drawText('Balanca Toledo Prix 3 Plus com Display Duplo', {
      x: balPhotoX + 8,
      y: balPhotoY + 6,
      size: 7.2,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  const bSideX = balPhotoX + balPhotoW + 12;
  const bSideW = p5W - 35 - bSideX;

  // Produto 1: Ramuza Atena II
  page5.drawRectangle({
    x: bSideX,
    y: y - 72,
    width: bSideW,
    height: 72,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.86, 0.94),
    borderWidth: 1,
  });
  page5.drawText('Ramuza Atena II 35Kg Wi-Fi', {
    x: bSideX + 8,
    y: y - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.55),
  });
  page5.drawText('R$ 4.160,00', {
    x: bSideX + 8,
    y: y - 30,
    size: 8.5,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });
  page5.drawText('Impressor termico acoplado para codigo de barras e tabela nutricional, comunicacao Wi-Fi e Ethernet homologada INMETRO.', {
    x: bSideX + 8,
    y: y - 44,
    size: 6.8,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.3),
    maxWidth: bSideW - 16,
    lineHeight: 9.5,
  });

  // Produto 2: Toledo 8217 Check-out
  page5.drawRectangle({
    x: bSideX,
    y: y - 155,
    width: bSideW,
    height: 78,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.8, 0.86, 0.94),
    borderWidth: 1,
  });
  page5.drawText('Toledo 8217 Check-out 32Kg', {
    x: bSideX + 8,
    y: y - 99,
    size: 8.5,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.55),
  });
  page5.drawText('R$ 2.899,00', {
    x: bSideX + 8,
    y: y - 113,
    size: 8.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  page5.drawText('Projetada para embutir em balcoes de caixa. Prato em inox, comunicacao RS-232 e USB com PDV.', {
    x: bSideX + 8,
    y: y - 127,
    size: 6.8,
    font: fontRegular,
    color: rgb(0.2, 0.25, 0.3),
    maxWidth: bSideW - 16,
    lineHeight: 9.5,
  });

  y -= (balPhotoH + 10);

  // Lista de Balanças restantes
  const restBalancas = [
    {
      name: 'Balanca Digital Toledo Prix 3 Plus 30Kg c/ Bateria',
      price: 'R$ 1.100,00',
      specs: 'A mais vendida do Brasil. Display duplo backlight azul, bateria 200h autonomia e saida serial.',
      badge: 'LIDER DE VENDAS',
    },
    {
      name: 'Balanca Digital Toledo Prix 3 Fit 15Kg c/ Bateria',
      price: 'R$ 889,00',
      specs: 'Compacta e rapida. Bateria interna recarregavel, ideal para buffets por quilo, hortifrutis e rotisserias.',
      badge: 'PRIX 3 FIT',
    },
    {
      name: 'Balanca Eletronica Plataforma Triunfo 300Kg Inox 40x60',
      price: 'R$ 1.787,00',
      specs: 'Plataforma reforcada em inox, coluna com display articulado, ideal para recebimento de mercadorias.',
      badge: 'PLATAFORMA 300KG',
    },
    {
      name: 'Balanca Display Remoto Blue One Upx SolutiBon',
      price: 'R$ 1.662,00',
      specs: 'Indicador remoto conectado por cabo flexivel, prato em inox sanitario e facil visualizacao no balcao.',
      badge: 'DISPLAY REMOTO',
    },
  ];

  for (const item of restBalancas) {
    page5.drawRectangle({
      x: 35,
      y: y - 48,
      width: p5W - 70,
      height: 48,
      color: rgb(0.97, 0.98, 1),
      borderColor: rgb(0.8, 0.86, 0.94),
      borderWidth: 1,
    });

    page5.drawText(item.name, {
      x: 45,
      y: y - 16,
      size: 9,
      font: fontBold,
      color: rgb(0.08, 0.28, 0.55),
    });

    page5.drawRectangle({
      x: p5W - 150,
      y: y - 18,
      width: 105,
      height: 14,
      color: rgb(0.88, 0.45, 0.08),
    });
    page5.drawText(item.badge, {
      x: p5W - 142,
      y: y - 14,
      size: 6.8,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    page5.drawText(`Preco: ${item.price}  -  ${item.specs}`, {
      x: 45,
      y: y - 32,
      size: 7.2,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.3),
      maxWidth: p5W - 95,
    });

    y -= 54;
  }

  y -= 4;

  // Box Homologação INMETRO
  page5.drawRectangle({
    x: 35,
    y: y - 50,
    width: p5W - 70,
    height: 50,
    color: rgb(0.95, 0.98, 0.95),
    borderColor: rgb(0.7, 0.85, 0.7),
    borderWidth: 1,
  });
  page5.drawText('SELO MANDATORIO DO INMETRO & REGULARIDADE FISCAL:', {
    x: 45,
    y: y - 16,
    size: 8.5,
    font: fontBold,
    color: rgb(0.1, 0.45, 0.2),
  });
  page5.drawText('Todas as balancas fornecidas pela Primo Equipamentos possuem lacre inviolavel e selo de conformidade metrologica do INMETRO, aptas para fiscalizacao do IPEM e integracao com sistemas fiscais SAT/NFC-e.', {
    x: 45,
    y: y - 30,
    size: 7.2,
    font: fontRegular,
    color: rgb(0.15, 0.35, 0.2),
    maxWidth: p5W - 95,
  });

  drawPageFooter(page5);

  // ==========================================
  // PAGINA 6: PROCESSAMENTO, UTENSILIOS & CONDICOES FINAIS (COM FOTOS REAIS GURAL E TRAMONTINA)
  // ==========================================
  const page6 = doc.addPage([595.28, 841.89]);
  const { width: p6W, height: p6H } = page6.getSize();
  drawPageHeader(page6, 'Secao V: Processamento de Frios, Utensilios Inox & Condicoes Finais', 6);

  y = p6H - 72;

  page6.drawText('7. CORTADORES DE FRIOS, EXTRATORES & UTENSILIOS DE INOX', {
    x: 35,
    y: y,
    size: 11.5,
    font: fontBold,
    color: rgb(0.12, 0.16, 0.22),
  });
  y -= 14;

  // Duas Fotos Reais Lado a Lado (Gural e Tramontina)
  const duoW = 255;
  const duoH = 135;

  if (imgFatiador) {
    page6.drawImage(imgFatiador, {
      x: 35,
      y: y - duoH,
      width: duoW,
      height: duoH,
    });
    page6.drawRectangle({
      x: 35,
      y: y - duoH,
      width: duoW,
      height: duoH,
      borderColor: rgb(0.88, 0.45, 0.08),
      borderWidth: 1.5,
    });
    page6.drawRectangle({
      x: 35,
      y: y - duoH,
      width: duoW,
      height: 20,
      color: rgb(0.08, 0.12, 0.18),
    });
    page6.drawText('Cortador de Frios Profissional Gural GLP-300', {
      x: 42,
      y: y - duoH + 6,
      size: 7.2,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  if (imgPanela) {
    const pX = 35 + duoW + 15;
    page6.drawImage(imgPanela, {
      x: pX,
      y: y - duoH,
      width: duoW,
      height: duoH,
    });
    page6.drawRectangle({
      x: pX,
      y: y - duoH,
      width: duoW,
      height: duoH,
      borderColor: rgb(0.88, 0.45, 0.08),
      borderWidth: 1.5,
    });
    page6.drawRectangle({
      x: pX,
      y: y - duoH,
      width: duoW,
      height: 20,
      color: rgb(0.08, 0.12, 0.18),
    });
    page6.drawText('Panela Pressao 35L Fulgor & Caldeirao Inox', {
      x: pX + 8,
      y: y - duoH + 6,
      size: 7.2,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  y -= (duoH + 12);

  const friosProducts = [
    {
      name: 'Cortador de Frios GLP-300 Semiautomatico Lamina 25cm Gural',
      price: 'A partir de R$ 6.467,00',
      specs: 'Linha nobre profissional Gural. Lamina alema de alta dureza, rolamentos blindados e estrutura em aluminio anodizado.',
    },
    {
      name: 'Fatiador De Frios Cortador 202mm BM06 Inox Bivolt Bermar',
      price: 'R$ 2.270,00',
      specs: 'Gabinete compacto com acabamento em inox e motor bivolt chaveado para padarias, pizzarias e hamburguerias.',
    },
    {
      name: 'ESB Super-N Skymsen Extrator de Suco Inox',
      price: 'R$ 1.719,00',
      specs: 'Motor comercial de 0,5 CV para operacao pesada. Corpo em inox escovado e castanhas resistentes.',
    },
    {
      name: 'Panela de Pressao Industrial 35 Litros Fulgor',
      price: 'R$ 1.698,00',
      specs: 'Capacidade de 35L para cozinhas de escolas, hospitais e buffets. Valvula de peso pesada e fecho hermetico reforcado.',
    },
    {
      name: 'Frigideira Tramontina Fundo Triplo Inox & Kit Pergaminho 20cm',
      price: 'A partir de R$ 499,00',
      specs: 'Frigideiras profissionais fundo triplo inox Tramontina e kits pergaminho 10 pecas para servir porcoes a mesa.',
    },
  ];

  for (const item of friosProducts) {
    page6.drawRectangle({
      x: 35,
      y: y - 48,
      width: p6W - 70,
      height: 48,
      color: rgb(0.99, 0.98, 0.96),
      borderColor: rgb(0.9, 0.85, 0.78),
      borderWidth: 1,
    });

    page6.drawText(`${item.name} - ${item.price}`, {
      x: 45,
      y: y - 16,
      size: 8.5,
      font: fontBold,
      color: rgb(0.12, 0.16, 0.22),
    });

    page6.drawText(item.specs, {
      x: 45,
      y: y - 30,
      size: 7.2,
      font: fontRegular,
      color: rgb(0.3, 0.28, 0.25),
      maxWidth: p6W - 95,
    });

    y -= 54;
  }

  y -= 4;

  // Box Voltagem & Central de Vendas Oficial
  page6.drawRectangle({
    x: 35,
    y: y - 128,
    width: p6W - 70,
    height: 128,
    color: rgb(0.12, 0.16, 0.22),
    borderColor: rgb(0.88, 0.45, 0.08),
    borderWidth: 2,
  });

  page6.drawText('ATENDIMENTO COMERCIAL & CONDICOES DE FECHAMENTO', {
    x: 48,
    y: y - 20,
    size: 10.5,
    font: fontBold,
    color: rgb(0.88, 0.45, 0.08),
  });

  const finalBullets = [
    '• VOLTAGEM MANDATORIA: Informe 110V ou 220V no momento do fechamento para expedicao correta do motor.',
    '• DESCONTO EXCLUSIVO NO PIX: Condicao especial com aprovacao imediata para pedidos a vista.',
    '• PARCELAMENTO NO CARTAO: Em ambiente seguro Pagali / Loja Integrada em ate 12x.',
    '• FRETE SEGURO BRASIL: Envio rodoviario paletizado com seguro total de carga para todos os estados do pais.',
    '• CENTRAL DE TELEVENDAS: (11) 3313-2875  •  WHATSAPP COMERCIAL: (11) 97333-4135',
    '• LOJA VIRTUAL OFICIAL: https://primo-equipamentos.lojaintegrada.com.br/',
    '• E-MAIL OFICIAL: primoequipamentos@hotmail.com  •  SAO PAULO / SP  •  CNPJ: 18.154.896/0001-29',
  ];

  let fty = y - 35;
  for (const fb of finalBullets) {
    page6.drawText(fb, {
      x: 48,
      y: fty,
      size: 7.5,
      font: fb.includes('CENTRAL') || fb.includes('LOJA') ? fontBold : fontRegular,
      color: fb.includes('CENTRAL') ? rgb(0.95, 0.95, 1) : rgb(0.88, 0.9, 0.94),
    });
    fty -= 12.5;
  }

  drawPageFooter(page6);

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
  const imgCorteStandardPath = path.join(cantareiraDir, 'corte_3d_standard_4modulos.jpg');
  const imgCorteNobrePath = path.join(cantareiraDir, 'corte_3d_nobre_8modulos.jpg');

  let imgParque: any = null;
  let imgCapela: any = null;
  let imgSala: any = null;
  let imgCorteStandard: any = null;
  let imgCorteNobre: any = null;

  try {
    if (fs.existsSync(imgParquePath)) imgParque = await doc.embedJpg(fs.readFileSync(imgParquePath));
    if (fs.existsSync(imgCapelaPath)) imgCapela = await doc.embedJpg(fs.readFileSync(imgCapelaPath));
    if (fs.existsSync(imgSalaPath)) imgSala = await doc.embedJpg(fs.readFileSync(imgSalaPath));
    if (fs.existsSync(imgCorteStandardPath)) imgCorteStandard = await doc.embedJpg(fs.readFileSync(imgCorteStandardPath));
    if (fs.existsSync(imgCorteNobrePath)) imgCorteNobre = await doc.embedJpg(fs.readFileSync(imgCorteNobrePath));
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
  // PÁGINA 3: MODALIDADES DE JAZIGOS (STANDARD, ESPECIAL, NOBRE) & CORTE 3D
  // =========================================================================
  const page3 = doc.addPage([595.28, 841.89]);
  drawPageHeader(page3, 'Modalidades de Jazigos (Standard, Especial, Nobre) & Infraestrutura', 3);

  y = height - 75;

  page3.drawText('2. MODALIDADES OFICIAIS DE JAZIGOS PERPÉTUOS', {
    x: 40,
    y: y,
    size: 13,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.18),
  });
  page3.drawText('Projetados em concreto impermeabilizado com alta tecnologia construtiva e paisagismo integrado.', {
    x: 40,
    y: y - 16,
    size: 9,
    font: fontOblique,
    color: rgb(0.35, 0.45, 0.4),
  });

  y -= 38;

  // 3 Boxes comparativos horizontais para Standard, Especial e Nobre
  const tierWidth = (width - 90) / 3;
  const tierHeight = 158;

  // Box 1: STANDARD (4 Módulos)
  page3.drawRectangle({
    x: 40,
    y: y - tierHeight,
    width: tierWidth,
    height: tierHeight,
    color: rgb(0.97, 0.99, 0.97),
    borderColor: rgb(0.75, 0.85, 0.78),
    borderWidth: 1,
  });
  page3.drawRectangle({
    x: 40,
    y: y - 24,
    width: tierWidth,
    height: 24,
    color: rgb(0.08, 0.28, 0.18),
  });
  page3.drawText('STANDARD', { x: 50, y: y - 16, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page3.drawText('4 Módulos Subterrâneos', { x: tierWidth - 15, y: y - 16, size: 7.5, font: fontRegular, color: rgb(0.85, 0.95, 0.9) });

  const stdItems = [
    '• Único da categoria com 4 módulos.',
    '• Concreto impermeabilizado.',
    '• Módulo ossário para até 10 urnas.',
    '• Atendimento humanizado 24h.',
    '• Paisagismo personalizado.',
    '• Parcelamento em até 18X SEM JUROS.',
    '• Cessão vitalícia e hereditária.',
  ];
  ty = y - 40;
  for (const it of stdItems) {
    page3.drawText(it, { x: 48, y: ty, size: 7.5, font: fontRegular, color: rgb(0.2, 0.25, 0.22) });
    ty -= 14;
  }

  // Box 2: ESPECIAL (4 Módulos + Área de Serviço)
  const espX = 40 + tierWidth + 5;
  page3.drawRectangle({
    x: espX,
    y: y - tierHeight,
    width: tierWidth,
    height: tierHeight,
    color: rgb(0.96, 0.98, 1),
    borderColor: rgb(0.70, 0.80, 0.92),
    borderWidth: 1,
  });
  page3.drawRectangle({
    x: espX,
    y: y - 24,
    width: tierWidth,
    height: 24,
    color: rgb(0.12, 0.28, 0.50),
  });
  page3.drawText('ESPECIAL', { x: espX + 10, y: y - 16, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page3.drawText('4 Módulos + Serviço', { x: espX + tierWidth - 65, y: y - 16, size: 7.5, font: fontRegular, color: rgb(0.85, 0.92, 1) });

  const espItems = [
    '• 4 módulos subterrâneos.',
    '• Área de serviço privativa.',
    '• Concreto impermeabilizado.',
    '• Módulo ossário para até 10 urnas.',
    '• Atendimento humanizado 24h.',
    '• Paisagismo personalizado.',
    '• Parcelamento em até 18X SEM JUROS.',
  ];
  ty = y - 40;
  for (const it of espItems) {
    page3.drawText(it, { x: espX + 8, y: ty, size: 7.5, font: fontRegular, color: rgb(0.15, 0.22, 0.3) });
    ty -= 14;
  }

  // Box 3: NOBRE (8 Módulos + Área de Serviço)
  const nobX = espX + tierWidth + 5;
  page3.drawRectangle({
    x: nobX,
    y: y - tierHeight,
    width: tierWidth,
    height: tierHeight,
    color: rgb(1, 0.98, 0.94),
    borderColor: rgb(0.90, 0.78, 0.55),
    borderWidth: 1,
  });
  page3.drawRectangle({
    x: nobX,
    y: y - 24,
    width: tierWidth,
    height: 24,
    color: rgb(0.75, 0.50, 0.12),
  });
  page3.drawText('NOBRE', { x: nobX + 10, y: y - 16, size: 10, font: fontBold, color: rgb(1, 1, 1) });
  page3.drawText('8 Módulos + Serviço', { x: nobX + tierWidth - 65, y: y - 16, size: 7.5, font: fontRegular, color: rgb(1, 0.95, 0.85) });

  const nobItems = [
    '• 8 gavetas subterrâneas amplas.',
    '• Área de serviço privativa.',
    '• Concreto impermeabilizado.',
    '• Ossário ampliado: até 20 urnas.',
    '• Atendimento humanizado 24h.',
    '• Paisagismo personalizado.',
    '• Parcelamento em até 18X SEM JUROS.',
  ];
  ty = y - 40;
  for (const it of nobItems) {
    page3.drawText(it, { x: nobX + 8, y: ty, size: 7.5, font: fontRegular, color: rgb(0.3, 0.22, 0.15) });
    ty -= 14;
  }

  y -= (tierHeight + 18);

  // Seção Ilustrada com o Corte Tridimensional (3D) dos Módulos Subterrâneos
  page3.drawText('REPRESENTAÇÃO ARQUITETÔNICA TRIDIMENSIONAL (CORTE 3D DAS GAVETAS):', {
    x: 40,
    y: y,
    size: 10.5,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.18),
  });

  y -= 14;

  const cutImgWidth = 270;
  const cutImgHeight = 160;

  // Imagem 3D do Jazigo
  if (imgCorteStandard || imgCorteNobre) {
    const activeImg = imgCorteStandard || imgCorteNobre;
    page3.drawRectangle({
      x: 39,
      y: y - cutImgHeight - 1,
      width: cutImgWidth + 2,
      height: cutImgHeight + 2,
      color: rgb(0.96, 0.98, 0.96),
      borderColor: rgb(0.75, 0.85, 0.78),
      borderWidth: 1,
    });
    page3.drawImage(activeImg, {
      x: 40,
      y: y - cutImgHeight,
      width: cutImgWidth,
      height: cutImgHeight,
    });

    // Tarja de legenda sobre a foto 3D
    page3.drawRectangle({
      x: 40,
      y: y - cutImgHeight,
      width: cutImgWidth,
      height: 20,
      color: rgb(0.08, 0.2, 0.14),
    });
    page3.drawText('Corte 3D: Módulos impermeabilizados e ossário sob o gramado.', {
      x: 46,
      y: y - cutImgHeight + 6,
      size: 7,
      font: fontRegular,
      color: rgb(0.9, 0.95, 0.92),
    });
  }

  // Bloco explicativo ao lado da foto 3D (width - 40 - cutImgWidth - 15)
  const sideBoxX = 40 + cutImgWidth + 12;
  const sideBoxW = width - sideBoxX - 40;
  page3.drawRectangle({
    x: sideBoxX,
    y: y - cutImgHeight,
    width: sideBoxW,
    height: cutImgHeight,
    color: rgb(0.98, 0.99, 0.98),
    borderColor: rgb(0.85, 0.88, 0.85),
    borderWidth: 1,
  });

  page3.drawText('TECNOLOGIA CONSTRUTIVA & BIO-PROTEÇÃO', {
    x: sideBoxX + 10,
    y: y - 18,
    size: 8.5,
    font: fontBold,
    color: rgb(0.08, 0.35, 0.22),
  });

  const sidePoints = [
    '• Engenharia Subterrânea: Módulos pré-moldados',
    '  em concreto armado com impermeabilização total,',
    '  garantindo 100% de vedação e respeito sanitário.',
    '• Módulo Ossário Integrado: Compartimento superior',
    '  dedicado a acondicionar com carinho as urnas',
    '  de despojos (10 a 20 urnas), liberando as gavetas.',
    '• Gramado Nivelado: Após a conclusão, a tampa é',
    '  recoberta pelo manto verde contínuo com placa',
    '  em bronze, preservando a harmonia do parque.',
    '• Opção de Locação Emergencial (4 Anos): Para',
    '  famílias em necessidade imediata sem plano.',
  ];
  let sty = y - 34;
  for (const p of sidePoints) {
    page3.drawText(p, { x: sideBoxX + 10, y: sty, size: 7, font: fontRegular, color: rgb(0.2, 0.25, 0.22) });
    sty -= 11.5;
  }

  y -= (cutImgHeight + 20);

  // 2 Fotos da Infraestrutura (Capela e Velório VIP)
  page3.drawText('INFRAESTRUTURA DE APOIO & ACOLHIMENTO 24 HORAS:', {
    x: 40,
    y: y,
    size: 10,
    font: fontBold,
    color: rgb(0.08, 0.28, 0.18),
  });

  y -= 14;
  const colWidth = (width - 95) / 2;
  const photoHeight = 90;

  if (imgCapela) {
    page3.drawImage(imgCapela, {
      x: 40,
      y: y - photoHeight,
      width: colWidth,
      height: photoHeight,
    });
    page3.drawText('Capela Ecumênica do Bosque Nativo (Todas as fés)', {
      x: 45,
      y: y - photoHeight - 12,
      size: 7,
      font: fontBold,
      color: rgb(0.1, 0.3, 0.2),
    });
  }

  if (imgSala) {
    const xPos = 40 + colWidth + 15;
    page3.drawImage(imgSala, {
      x: xPos,
      y: y - photoHeight,
      width: colWidth,
      height: photoHeight,
    });
    page3.drawText('6 Salas de Velório Climatizadas 24h com Suítes VIP', {
      x: xPos + 5,
      y: y - photoHeight - 12,
      size: 7,
      font: fontBold,
      color: rgb(0.1, 0.3, 0.2),
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

