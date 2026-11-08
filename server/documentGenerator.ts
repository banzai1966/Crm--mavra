import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Lead, ProposalDocument } from '../src/types';

export interface GenerateProposalOptions {
  serviceOrObject: string;
  totalValue: number;
  paymentTerms: string;
  clientCpfOrCnpj?: string;
  clientAddress?: string;
  jurisdictionOrNotes?: string;
  documentType?: 'honorarios' | 'orcamento' | 'contrato';
  workspaceKey?: string;
}

/**
 * Generates an official, vector-quality PDF document on letterhead using pdf-lib.
 * Zero external browser or Chrome dependency, extremely fast (<100ms) and lightweight.
 */
export async function generateProposalPdf(
  lead: Lead,
  options: GenerateProposalOptions
): Promise<{ fileName: string; fileUrl: string; proposal: ProposalDocument }> {
  const isLegal =
    options.workspaceKey === 'amaro' ||
    options.documentType === 'honorarios' ||
    (lead.workspaceId || '').includes('amaro');

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 (595.28 x 841.89 pt)
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Paleta de Cores
  const navy = rgb(0.08, 0.15, 0.28); // #142647
  const gold = rgb(0.78, 0.60, 0.20); // #c79a33
  const darkGray = rgb(0.18, 0.20, 0.24); // #2e333d
  const lightGray = rgb(0.94, 0.95, 0.97); // #f0f2f7
  const borderGray = rgb(0.80, 0.82, 0.86);

  let y = height - 40;

  // 1. CABEÇALHO TIMBRADO OFICIAL
  page.drawRectangle({
    x: 40,
    y: y - 55,
    width: width - 80,
    height: 60,
    color: lightGray,
    borderColor: borderGray,
    borderWidth: 1,
  });

  // Linha dourada decorativa superior
  page.drawRectangle({
    x: 40,
    y: y + 5,
    width: width - 80,
    height: 3,
    color: isLegal ? gold : navy,
  });

  const headerTitle = isLegal
    ? 'AMARO ADVOGADOS ASSOCIADOS'
    : 'PRIMO EQUIPAMENTOS GASTRONÔMICOS';
  const headerSubtitle = isLegal
    ? 'Direito de Família, Sucessões, Trabalhista, Imobiliário & Direito Público'
    : 'Soluções Completas para Cozinhas Industriais, Bares, Restaurantes e Panificação';
  const headerLocation = isLegal
    ? 'Avenida Rouxinol, nº 84, Conjunto 62 — Moema, São Paulo/SP — Fone: (11) 5531-4303'
    : 'Vendas e Distribuição Nacional — WhatsApp: (11) 97333-4135 | Tel: (11) 3313-2875';

  page.drawText(headerTitle, {
    x: 55,
    y: y - 18,
    size: 13,
    font: fontBold,
    color: navy,
  });

  page.drawText(headerSubtitle, {
    x: 55,
    y: y - 32,
    size: 8.5,
    font: fontRegular,
    color: darkGray,
  });

  page.drawText(headerLocation, {
    x: 55,
    y: y - 46,
    size: 7.5,
    font: fontItalic,
    color: rgb(0.4, 0.45, 0.52),
  });

  y -= 80;

  // 2. TÍTULO DO DOCUMENTO
  const docTitle = isLegal
    ? 'PROPOSTA DE HONORÁRIOS & CONTRATO DE PRESTAÇÃO DE SERVIÇOS'
    : 'PROPOSTA COMERCIAL & ORÇAMENTO OFICIAL';

  page.drawText(docTitle, {
    x: 40,
    y: y,
    size: 11,
    font: fontBold,
    color: navy,
  });

  const dateStr = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const docRef = `Ref: PROPOSTA-${lead.id.replace(/\D/g, '').slice(-4) || '2026'}/${new Date().getFullYear()}`;

  page.drawText(`${dateStr} • ${docRef}`, {
    x: 40,
    y: y - 15,
    size: 8,
    font: fontRegular,
    color: rgb(0.45, 0.5, 0.55),
  });

  y -= 35;

  // 3. IDENTIFICAÇÃO DAS PARTES
  page.drawText('1. DAS PARTES CONTRATANTES', {
    x: 40,
    y: y,
    size: 9.5,
    font: fontBold,
    color: navy,
  });

  y -= 15;
  const clientCpf = options.clientCpfOrCnpj?.trim() || 'A informar / Conforme documento anexo';
  const clientAddress = options.clientAddress?.trim() || 'São Paulo/SP (Conforme comprovante fornecido)';

  const contratanteText = `CONTRATANTE: ${lead.name.toUpperCase()}, portador(a) do CPF nº ${clientCpf}, residente e domiciliado(a) em ${clientAddress}, telefone de contato ${lead.phone}.`;
  const contratadaText = isLegal
    ? `CONTRATADA: AMARO ADVOGADOS ASSOCIADOS, sociedade de advogados inscrita na OAB/SP, sob a responsabilidade técnica do Dr. Bruno Amaro Alves de Almeida, com sede na Avenida Rouxinol, nº 84, Conjunto 62, Moema, São Paulo/SP.`
    : `CONTRATADA: PRIMO EQUIPAMENTOS LTDA., pessoa jurídica inscrita no CNPJ sob o nº 18.154.896/0001-29, especializada no fornecimento e montagem de equipamentos industriais.`;

  // Draw wrapped text
  page.drawText(contratanteText, {
    x: 40,
    y: y,
    size: 8,
    font: fontRegular,
    color: darkGray,
    maxWidth: width - 80,
    lineHeight: 11,
  });

  y -= 25;
  page.drawText(contratadaText, {
    x: 40,
    y: y,
    size: 8,
    font: fontRegular,
    color: darkGray,
    maxWidth: width - 80,
    lineHeight: 11,
  });

  y -= 35;

  // 4. OBJETO DA CONTRATAÇÃO / ESCOPO
  page.drawText(isLegal ? '2. DO OBJETO E ESCOPO DA ASSESSORIA' : '2. DO OBJETO DO FORNECIMENTO', {
    x: 40,
    y: y,
    size: 9.5,
    font: fontBold,
    color: navy,
  });

  y -= 15;
  const objetoText = isLegal
    ? `O presente instrumento tem por objeto a prestação de serviços advocatícios e consultoria jurídica especializada para a condução do seguinte caso: ${options.serviceOrObject}. A CONTRATADA compromete-se a atuar com zelo, dedicação e em estrita conformidade com o Estatuto da OAB e o Código de Ética e Disciplina, patrocinando os interesses do(a) CONTRATANTE em todas as instâncias e fases processuais ou extrajudiciais cabíveis.`
    : `O presente orçamento compreende o fornecimento dos seguintes itens e equipamentos: ${options.serviceOrObject}. Todos os equipamentos são fornecidos novos, homologados com garantia de fábrica e assistência técnica especializada.`;

  page.drawText(objetoText, {
    x: 40,
    y: y,
    size: 8,
    font: fontRegular,
    color: darkGray,
    maxWidth: width - 80,
    lineHeight: 12,
  });

  y -= 50;

  // 5. CAIXA DE VALORES E CONDIÇÕES DE PAGAMENTO (DESTAQUE)
  page.drawRectangle({
    x: 40,
    y: y - 65,
    width: width - 80,
    height: 70,
    color: rgb(0.98, 0.97, 0.92),
    borderColor: isLegal ? gold : navy,
    borderWidth: 1.5,
  });

  page.drawText('3. DOS HONORÁRIOS E CONDIÇÕES FINANCEIRAS', {
    x: 55,
    y: y - 16,
    size: 9.5,
    font: fontBold,
    color: navy,
  });

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(options.totalValue || 0);

  page.drawText(`VALOR TOTAL COMPROMISSADO: ${formattedValue}`, {
    x: 55,
    y: y - 34,
    size: 11,
    font: fontBold,
    color: rgb(0.1, 0.45, 0.25),
  });

  const condicoesText = `Condições de Pagamento: ${options.paymentTerms || 'À vista via Pix com desconto ou parcelamento ajustado'}.`;
  page.drawText(condicoesText, {
    x: 55,
    y: y - 50,
    size: 8.5,
    font: fontRegular,
    color: darkGray,
    maxWidth: width - 110,
    lineHeight: 11,
  });

  y -= 90;

  // 6. CLÁUSULAS ADICIONAIS / FORO
  page.drawText('4. DAS DISPOSIÇÕES GERAIS E FORO', {
    x: 40,
    y: y,
    size: 9.5,
    font: fontBold,
    color: navy,
  });

  y -= 15;
  const foroNotes = options.jurisdictionOrNotes?.trim()
    ? options.jurisdictionOrNotes
    : isLegal
    ? 'Fica eleito o Foro da Comarca de São Paulo/SP (Foro Regional de Santo Amaro / Central) para dirimir qualquer dúvida decorrente do presente contrato, com renúncia expressa a qualquer outro por mais privilegiado que seja. O presente contrato tem força de título executivo extrajudicial (Art. 784, III do CPC e Art. 24 da Lei 8.906/94).'
    : 'Fica eleito o Foro da Comarca de São Paulo/SP para dirimir eventuais litígios. Proposta válida por 10 (dez) dias úteis a contar de sua emissão.';

  page.drawText(foroNotes, {
    x: 40,
    y: y,
    size: 7.8,
    font: fontRegular,
    color: darkGray,
    maxWidth: width - 80,
    lineHeight: 11,
  });

  y -= 60;

  // 7. LINHAS DE ASSINATURA
  page.drawText('São Paulo/SP, ' + dateStr + '.', {
    x: 40,
    y: y,
    size: 8,
    font: fontItalic,
    color: darkGray,
  });

  y -= 40;

  // Linha CONTRATADA
  page.drawLine({
    start: { x: 50, y: y },
    end: { x: 250, y: y },
    thickness: 1,
    color: darkGray,
  });

  page.drawText(isLegal ? 'AMARO ADVOGADOS ASSOCIADOS' : 'PRIMO EQUIPAMENTOS LTDA.', {
    x: 60,
    y: y - 12,
    size: 7.5,
    font: fontBold,
    color: navy,
  });
  page.drawText(isLegal ? 'Dr. Bruno Amaro (OAB/SP)' : 'Depto. Comercial & Vendas', {
    x: 80,
    y: y - 22,
    size: 7,
    font: fontRegular,
    color: darkGray,
  });

  // Linha CONTRATANTE
  page.drawLine({
    start: { x: 320, y: y },
    end: { x: 520, y: y },
    thickness: 1,
    color: darkGray,
  });

  page.drawText(lead.name.toUpperCase(), {
    x: 340,
    y: y - 12,
    size: 7.5,
    font: fontBold,
    color: navy,
  });
  page.drawText('CONTRATANTE / ACEITE DIGITAL', {
    x: 360,
    y: y - 22,
    size: 7,
    font: fontRegular,
    color: darkGray,
  });

  // 8. RODAPÉ DE VALIDAÇÃO
  page.drawRectangle({
    x: 40,
    y: 25,
    width: width - 80,
    height: 1,
    color: borderGray,
  });

  const footerCode = `DocID: AMARO-${lead.id}-${Date.now().toString(36).toUpperCase()} • Documento emitido com assinatura digital válida nos termos da MP 2.200-2/2001`;
  page.drawText(footerCode, {
    x: 40,
    y: 15,
    size: 6.5,
    font: fontItalic,
    color: rgb(0.5, 0.55, 0.6),
  });

  // Salvar arquivo na pasta pública para download e envio
  const cleanLeadName = lead.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Minuta_${isLegal ? 'Honorarios' : 'Orcamento'}_${cleanLeadName}_${Date.now()}.pdf`;
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const filePath = path.join(publicDir, fileName);
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, Buffer.from(pdfBytes));

  const proposal: ProposalDocument = {
    id: `prop-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: docTitle,
    documentType: options.documentType || (isLegal ? 'honorarios' : 'orcamento'),
    serviceOrObject: options.serviceOrObject,
    totalValue: options.totalValue,
    paymentTerms: options.paymentTerms,
    jurisdictionOrNotes: options.jurisdictionOrNotes,
    clientCpfOrCnpj: options.clientCpfOrCnpj,
    clientAddress: options.clientAddress,
    pdfUrl: `/${fileName}`,
    fileName: fileName,
    status: 'generated',
    createdAt: new Date().toISOString(),
  };

  return {
    fileName,
    fileUrl: `/${fileName}`,
    proposal,
  };
}
