import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Save,
  Cpu,
  Key,
  FileText,
  Upload,
  Trash2,
  Play,
  Check,
  ShieldCheck,
  HelpCircle,
  ShoppingBag,
  CreditCard,
  FileCheck,
  AlertCircle,
  Power,
  Filter,
  ShieldAlert,
  Phone,
  Mic,
  Volume2,
  VolumeX,
  Loader2,
  ExternalLink,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Wand2,
  Building2,
  Stethoscope,
  Scale,
  Sun,
  Car,
  HeartHandshake,
  CheckCircle2,
  X,
  Layers,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { AgentConfig, KnowledgeDocument, AIProvider } from '../types';

export interface AgentPreset {
  id: string;
  name: string;
  category: string;
  tag: string;
  description: string;
  personaName: string;
  role: string;
  toneOfVoice: string;
  salesGoal: string;
  followUpNiche?: string;
  followUpCustomMessage?: string;
  knowledgeFaq?: string;
  knowledgeCatalog?: string;
  knowledgePricing?: string;
  knowledgeRules?: string;
}

export const AGENT_PRESETS: AgentPreset[] = [
  {
    id: 'dental_integrative',
    name: 'Odontologia Integrativa & Biológica (Dra. Lucy Murata)',
    category: 'Saúde & Bio-Odontologia',
    tag: 'Odontologia Integrativa',
    description: 'Especializado em Odontologia Biológica, Implantes Cerâmicos de Zircônia (Metal-Free), Remoção Segura de Amálgama (Protocolo SMART/IAOMT) e Reabilitação Oral Sistêmica.',
    personaName: 'Sofia',
    role: 'Coordenadora de Atendimento e Triagem Integrativa da Clínica Dra. Lucy Murata',
    toneOfVoice: 'Altamente refinado, acolhedor, empático, científico, sereno e focado na saúde sistêmica e integrativa',
    salesGoal: 'Compreender a necessidade ou queixa biofuncional do paciente, acolher com autoridade e agendar a Consulta de Avaliação Integrativa com a recepção.',
    followUpNiche: 'dental',
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se você conseguiu verificar o melhor dia para a sua consulta de avaliação com a Dra. Lucy Murata. Nossa equipe tem horários exclusivos esta semana no consultório do Euroville Mall! 🌿✨',
    knowledgeFaq: `PERGUNTAS FREQUENTES (ODONTOLOGIA INTEGRATIVA & BIOLÓGICA - DRA. LUCY MURATA):

P: O que é a Odontologia Integrativa e Biológica?
R: É a prática odontológica que enxerga o ser humano de forma holística e sistêmica. Compreendemos que cada dente, tecido e material utilizado na cavidade bucal interage diretamente com os órgãos, meridianos, imunidade e saúde celular do organismo como um todo.

P: Vocês informam valores ou orçamentos por WhatsApp?
R: Não passamos orçamentos sem consulta prévia. Na odontologia biológica de alta performance e conforme as normas éticas do CFO, cada organismo é biologicamente único. A Dra. Lucy Murata realiza uma Consulta de Avaliação Integrativa completa (com análise clínica, histórico de saúde e tecnologia de escaneamento 3D) para estruturar um plano de tratamento preciso, personalizado e biocompatível para o seu caso.

P: O que é a Remoção Segura de Amálgama (Protocolo SMART)?
R: O amálgama contém mercúrio, um metal pesado tóxico que libera vapores contínuos. A Dra. Lucy Murata é membro da IAOMT (International Academy of Oral Medicine and Toxicology - EUA) e segue rigorosamente o protocolo internacional SMART: isolamento absoluto, aspiração de alta potência com filtros específicos, paramentação de proteção e suplementação/desintoxicação biológica para garantir que nem o paciente nem a equipe inalem vapores de mercúrio durante o procedimento.

P: Como funcionam os Implantes de Zircônia (Metal-Free)?
R: São implantes cerâmicos totalmente livres de metais, biocompatíveis e com coloração branca natural semelhante à raiz do dente. Não geram correntes galvânicas, reduzem drasticamente o risco de inflamações peri-implantares e preservam a harmonia bioenergética do corpo.

P: Onde fica localizado o consultório da Dra. Lucy Murata?
R: O consultório está situado em Bragança Paulista/SP, no Euroville Mall (Torre II - Praça Maastricht, 200 - Sala 103, Jardim São José), em um ambiente tranquilo, seguro e de fácil acesso com estacionamento.

P: A clínica atende convênios?
R: Nossos atendimentos são exclusivamente particulares, garantindo tempo dedicado, materiais biológicos de padrão internacional e atendimento sem pressa. Fornecemos nota fiscal e relatórios detalhados caso o paciente deseje solicitar reembolso junto ao seu plano de saúde.`,
    knowledgeCatalog: `TRATAMENTOS & ESPECIALIDADES - DRA. LUCY MURATA:

1. Bio-Odontologia & Desintoxicação:
- Remoção Segura de Restaurações de Amálgama (Protocolo SMART - IAOMT EUA).
- Substituição por resinas biocompatíveis de última geração e cerâmicas puras (livres de bisfenol A e metais pesados).
- Terapia Neural, Biorressonância e Práticas Integrativas aplicadas à odontologia.

2. Implantodontia Cerâmica (Metal-Free):
- Implantes Dentários de Zircônia (Cerâmica pura de alto desempenho, biocompatibilidade total e integração tecidual superior).
- Reabilitação Oral Funcional e Biológica para restauração da mastigação e equilíbrio neuromuscular.

3. Tecnologia & Diagnóstico Digital:
- Escaneamento Intraoral 3D de alta precisão (conforto máximo sem moldagens com massinha).
- Planejamento estético e funcional com previsibilidade biomimética.

4. Prótese & Estética Biomimética:
- Coroas, facetas e lentes de contato em cerâmica pura que mimetizam perfeitamente o esmalte dental natural.
- Preservação máxima da estrutura biológica do dente.`,
    knowledgePricing: `POLÍTICA DE ATENDIMENTO & INVESTIMENTO:

- Princípio de Transparência & Ética: Não praticamos valores tabelados por mensagem. O investimento definitivo depende da avaliação clínica individualizada realizada pela Dra. Lucy Murata.
- Consulta de Avaliação Integrativa: Compreende anamnese detalhada do histórico de saúde sistêmica do paciente, exame clínico minucioso da saúde bucal e análise com tecnologias digitais para traçar o mapa bio-odontológico.
- Condições de Pagamento: A clínica oferece opções flexíveis para viabilizar o plano de tratamento completo (parcelamento no cartão de crédito ou condições diferenciadas à vista via PIX). A secretária detalha todas as opções confortavelmente após o plano apresentado pela doutora.`,
    knowledgeRules: `DIRETRIZES FUNDAMENTAIS DE ATENDIMENTO (DRA. LUCY MURATA):

1. NUNCA dê orçamentos ou valores pelo WhatsApp. Explique que na odontologia integrativa cada ser humano tem particularidades biológicas únicas e que a conduta ética e segura começa na Consulta de Avaliação Integrativa.
2. Posicionamento de Autoridade & Acolhimento: A Dra. Lucy Murata é Mestre em Bioodontologia e membro da conceituada IAOMT dos EUA. Transmita essa excelência técnica com palavras gentis, seguras e acolhedoras.
3. Roteiro de Triagem:
   - Passo 1: Ouça e compreenda a queixa ou objetivo do paciente (ex: quer trocar restaurações escuras com segurança? precisa de implantes sem metal? busca alívio de queixas funcionais?).
   - Passo 2: Valide a preocupação do paciente com empatia e explique resumidamente a abordagem biológica.
   - Passo 3: Pergunte se o paciente prefere atendimento pela manhã ou tarde e quais dias da semana são mais convenientes.
   - Passo 4: Transfira com cordialidade para a recepção/secretária da clínica confirmar o melhor horário na agenda no Euroville Mall.
4. Jamais cite nomes de tecnologias internas (Evolution API, Gemini, robô, IA). A Sofia é a assistente e coordenadora humana e atenciosa do consultório da Dra. Lucy Murata.`
  },
  {
    id: 'dental_general',
    name: 'Clínica Odontológica & Estética Geral',
    category: 'Saúde & Odontologia',
    tag: 'Odontologia Geral',
    description: 'Ideal para dentistas convencionais e clínicas gerais. Focado em captação ética para implantes, alinhadores transparentes, clareamento, próteses e avaliação presencial.',
    personaName: 'Sofia',
    role: 'Coordenadora de Atendimento Odontológico',
    toneOfVoice: 'Acolhedor, empático, seguro, ético e profissional',
    salesGoal: 'Fazer a triagem da queixa principal, tirar dúvidas gerais sem passar preços fixos e agendar a avaliação presencial com a equipe.',
    followUpNiche: 'dental',
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se você conseguiu verificar o melhor dia para a sua avaliação odontológica. Temos alguns horários disponíveis para esta semana com nossos especialistas! 🦷✨',
    knowledgeFaq: `PERGUNTAS FREQUENTES (CLÍNICA ODONTOLÓGICA GERAL):

P: Como funciona a avaliação inicial?
R: Na primeira consulta, o dentista realiza um exame clínico detalhado, avalia a saúde bucal completa, escuta suas queixas e elabora um plano de tratamento personalizado para você.

P: O valor do procedimento pode ser informado pelo WhatsApp?
R: De acordo com o Conselho Federal de Odontologia (CFO) e para sua total segurança, o orçamento exato só pode ser fechado após a avaliação presencial, pois cada anatomia e condição bucal exige um planejamento específico.

P: Quais são as formas de pagamento?
R: Facilitamos o pagamento em até 12x ou 24x no cartão de crédito, e oferecemos condições especiais para pagamentos à vista via PIX.

P: Vocês atendem convênios?
R: Atendemos na modalidade particular com valores acessíveis e planos de parcelamento facilitados. Fornecemos recibos e laudos completos caso você queira solicitar reembolso junto ao seu convênio.`,
    knowledgeCatalog: `TRATAMENTOS & PROCEDIMENTOS DISPONÍVEIS:
1. Ortodontia & Alinhadores Invisíveis:
- Aparelhos transparentes removíveis e modernos.
- Aparelhos estéticos de safira e porcelana.

2. Implantes Dentários & Próteses:
- Reposição de dentes perdidos com conforto e fixação segura.
- Próteses fixas sobre implantes e reabilitação oral.

3. Estética do Sorriso:
- Clareamento dental a laser e moldeiras caseiras supervisionadas.
- Facetas e lentes de contato em resina e porcelana.

4. Clínica Geral & Prevenção:
- Limpeza preventiva (profilaxia) e remoção de tártaro.
- Tratamento de canal (Endodontia) mecanizado sem dor e restaurações estéticas.`,
    knowledgePricing: `POLÍTICA DE INVESTIMENTO & FORMAS DE PAGAMENTO:
- Não informamos preços tabelados fechados sem exame presencial.
- Condições de Pagamento: Parcelamento em até 12x no cartão de crédito ou condições especiais à vista via PIX. A recepção apresenta todas as facilidades após a consulta inicial.`,
    knowledgeRules: `DIRETRIZES FUNDAMENTAIS:
1. Jamais faça diagnósticos ou prometa resultados sem o paciente passar pela cadeira do dentista.
2. Em casos de dor aguda, trauma ou dente quebrado, priorize como urgência para encaixe rápido no mesmo dia.
3. Colete: queixa principal do paciente, melhor período (manhã/tarde) e encaminhe para a confirmação de horário com a secretária.`
  },
  {
    id: 'medical',
    name: 'Clínica Médica & Consultórios',
    category: 'Saúde & Medicina',
    tag: 'Medicina',
    description: 'Ideal para clínicas médicas multiespecialidades, consultórios e telemedicina. Focado em acolhimento, triagem de sintomas sem diagnóstico precipitado e agendamento com a recepção.',
    personaName: 'Helena',
    role: 'Coordenadora de Atendimento e Triagem da Clínica Médica',
    toneOfVoice: 'Empático, acolhedor, sereno, pontual e altamente profissional',
    salesGoal: 'Colher queixa principal, especialidade desejada, preferência de dia/turno e encaminhar o paciente para a confirmação de horário na recepção.',
    followUpNiche: 'dental',
    followUpCustomMessage: 'Olá! Tudo bem? Passando para saber se você conseguiu verificar o melhor dia para a sua consulta médica. Temos alguns horários disponíveis para esta semana com nossos especialistas! 🩺🏥',
    knowledgeFaq: `PERGUNTAS FREQUENTES (CLÍNICA MÉDICA):
P: Como funciona o agendamento de consultas?
R: Você nos informa a especialidade médica desejada, o período de sua preferência (manhã ou tarde) e se o atendimento será particular ou convênio. Nossa recepção verifica a agenda em tempo real e reserva o melhor horário para você.

P: A clínica atende convênios ou apenas particular?
R: Atendemos tanto na modalidade particular (com valores acessíveis e parcelamento) quanto pelos principais convênios médicos (Unimed, Bradesco Saúde, Amil, SulAmérica e outros). Emitimos também recibo e nota fiscal para reembolso.

P: Vocês realizam exames no mesmo local?
R: Sim! Contamos com exames laboratoriais de sangue, ultrassonografia, eletrocardiograma e raio-X integrados, para que você possa realizar sua consulta e exames com total comodidade no mesmo dia.

P: A clínica faz telemedicina (consulta online)?
R: Sim, oferecemos consultas presenciais e também atendimento por telemedicina com emissão de receitas médicas digitais, atestados e pedidos de exames com certificação digital válida em todo o Brasil.`,
    knowledgeCatalog: `ESPECIALIDADES & SERVIÇOS MÉDICOS:
1. Especialidades Médicas:
- Clínica Médica Geral e Check-up Preventivo da Saúde.
- Cardiologia com Eletrocardiograma e Risco Cirúrgico.
- Dermatologia Clínica, Estética e Tratamento de Pele.
- Ginecologia, Obstetrícia e Saúde da Mulher.
- Ortopedia, Traumatologia e Tratamento de Dores Articulares.
- Pediatria e Acompanhamento do Desenvolvimento Infantil.

2. Exames Complementares:
- Check-up Laboratorial Completo (Hemograma, Glicemia, Colesterol, etc.).
- Ultrassonografia Geral e Doppler Vascular.
- Eletrocardiograma (ECG) com laudo rápido.`,
    knowledgePricing: `VALORES DE CONSULTAS & FORMAS DE PAGAMENTO:
- Consulta Médica com Clínico Geral: R$ 180,00 (com direito a retorno em até 15 dias).
- Consultas com Especialistas (Cardio, Derma, Ortopedia): a partir de R$ 250,00.
- Check-up Laboratorial Básico: a partir de R$ 140,00.

Formas de Pagamento:
- Cartão de débito e crédito (em até 6x sem juros).
- Pagamento à vista via PIX com 5% de desconto.
- Faturamento direto para convênios credenciados.`,
    knowledgeRules: `DIRETRIZES FUNDAMENTAIS DE ATENDIMENTO MÉDICO:
1. NUNCA faça diagnósticos, não afirme que o paciente tem uma doença nem prescreva remédios ou dosagens pelo WhatsApp. Esclareça com ética que o diagnóstico correto exige a avaliação presencial ou teleconsulta com o médico.
2. Identificação de Urgências: Se o paciente relatar dor intensa no peito, falta de ar grave, perda de consciência ou sangramento intenso, oriente imediatamente a procurar um Pronto-Socorro / UPA de emergência ou ligar para o SAMU (192).
3. Seja sempre acolhedor, empático e transmita calma e segurança para quem está preocupado com a saúde.
4. Para agendamento, pergunte com clareza: a especialidade desejada, preferência de turno (manhã/tarde) e se prefere particular ou convênio.`
  },
  {
    id: 'real_estate',
    name: 'Imobiliária & Corretores',
    category: 'Imóveis & Construção',
    tag: 'Imobiliária',
    description: 'Qualificação de compradores e investidores com agendamento de visitas presenciais.',
    personaName: 'Ricardo',
    role: 'Consultor Imobiliário Sênior',
    toneOfVoice: 'Sofisticado, prestativo, pontual e consultivo',
    salesGoal: 'Identificar tipo de imóvel, faixa de orçamento, localização desejada e agendar visita presencial.',
    followUpNiche: 'real_estate',
    followUpCustomMessage: 'Olá! Tudo bem? Selecionei 3 opções de imóveis que combinam exatamente com o perfil que conversamos. Podemos agendar uma rápida visita esta semana? 🏡🔑',
    knowledgeFaq: `PERGUNTAS FREQUENTES (IMOBILIÁRIA):
P: Como funciona o agendamento de visitas?
R: Agendamos conforme sua disponibilidade, inclusive aos finais de semana. Nosso corretor especialista acompanha você durante toda a visita para tirar dúvidas.

P: Aceitam financiamento bancário?
R: Sim, trabalhamos com todos os bancos (Caixa, Itaú, Bradesco, Santander) e fazemos a simulação gratuita da sua carta de crédito.`,
    knowledgeCatalog: `PORTFÓLIO DE IMÓVEIS:
- Apartamentos na planta e prontos para morar (2 a 4 quartos).
- Casas em condomínio fechado de alto padrão.
- Salas comerciais e galpões para investimento.`,
    knowledgePricing: `FAIXAS DE VALORES E CONDIÇÕES:
- Apartamentos compactos: a partir de R$ 280.000,00.
- Imóveis de médio e alto padrão: de R$ 600.000,00 a R$ 3.500.000,00.
- Entrada facilitada e parcelamento direto com a construtora durante a obra.`,
    knowledgeRules: `DIRETRIZES:
1. Sempre descubra se o interesse é para moradia ou investimento.
2. Descubra a região de preferência e a faixa de valor antes de enviar links de imóveis.
3. O objetivo final é o agendamento da visita presencial.`
  },
  {
    id: 'aesthetic',
    name: 'Clínica de Estética & Harmonização',
    category: 'Beleza & Bem-Estar',
    tag: 'Estética',
    description: 'Captação para Botox, preenchimento labial, bioestimuladores, drenagem e tratamentos corporais.',
    personaName: 'Camila',
    role: 'Consultora de Estética e Bem-Estar',
    toneOfVoice: 'Elegante, acolhedora, incentivadora e atenciosa',
    salesGoal: 'Entender a insatisfação ou objetivo estético da cliente e agendar uma consulta de avaliação personalizada.',
    followUpNiche: 'aesthetic',
    followUpCustomMessage: 'Olá, querida! Tudo bem? Passando para lembrar que estamos com poucas vagas para avaliação estética essa semana. Vamos realçar ainda mais a sua beleza? ✨💖',
    knowledgeFaq: `PERGUNTAS FREQUENTES (ESTÉTICA):
P: O procedimento dói?
R: Todos os procedimentos injetáveis são realizados com anestésico tópico potente ou injetável para garantir o máximo conforto e praticamente zero dor.

P: Quanto tempo duram os resultados do Botox?
R: Em média de 4 a 6 meses, dependendo do metabolismo de cada organismo.`,
    knowledgeCatalog: `TRATAMENTOS DISPONÍVEIS:
- Toxina Botulínica (Botox facial completo e preventivo).
- Preenchimento Labial com ácido hialurônico de alta pureza.
- Bioestimuladores de Colágeno (Radiesse e Sculptra).
- Limpeza de pele profunda com extração por sucção e hidratação.`,
    knowledgePricing: `VALORES MÉDIOS:
- Botox Facial Completo: a partir de R$ 890,00.
- Preenchimento Labial (1ml): a partir de R$ 980,00.
- Parcelamento em até 10x sem juros no cartão.`,
    knowledgeRules: `DIRETRIZES:
1. Trate as clientes pelo nome com carinho e discrição.
2. Esclareça que cada rosto é único e a quantidade de produto é definida na consulta presencial.
3. Foque sempre na valorização da autoestima natural da cliente.`
  },
  {
    id: 'law_firm',
    name: 'Escritório de Advocacia & Jurídico',
    category: 'Serviços Jurídicos',
    tag: 'Advocacia',
    description: 'Triagem qualificada para direito trabalhista, previdenciário (INSS), família e do consumidor.',
    personaName: 'Dra. Beatriz',
    role: 'Consultora Jurídica de Triagem',
    toneOfVoice: 'Formal, segura, ética, transparente e empática',
    salesGoal: 'Entender o caso jurídico, colher detalhes preliminares e agendar reunião com o advogado especialista.',
    followUpNiche: 'law_firm',
    followUpCustomMessage: 'Olá! Tudo bem? Gostaria de saber se você conseguiu reunir os documentos que conversamos para que nossos advogados possam analisar o seu caso com prioridade. ⚖️📄',
    knowledgeFaq: `PERGUNTAS FREQUENTES (JURÍDICO):
P: Como funciona a consulta com o advogado?
R: Realizamos uma reunião inicial presencial ou por chamada de vídeo para entender detalhadamente seu caso e indicar as melhores estratégias jurídicas.

P: Preciso pagar algo para iniciar o processo?
R: Em muitas ações (como causas trabalhistas e previdenciárias), trabalhamos no modelo de êxito, onde os honorários são pagos apenas no final se a causa for ganha.`,
    knowledgeCatalog: `ÁREAS DE ATUAÇÃO:
- Direito Trabalhista: rescisões, horas extras, desvio de função, assédio.
- Direito Previdenciário: aposentadorias, auxílio-doença, BPC/LOAS.
- Direito do Consumidor e Bancário: fraudes, juros abusivos, negativações indevidas.`,
    knowledgePricing: `HONORÁRIOS:
- Consulta inicial de triagem orientativa: gratuita ou valor abatido dos honorários.
- Contratos com cláusula de êxito conforme tabela da OAB.`,
    knowledgeRules: `DIRETRIZES ÉTICAS:
1. Respeite com rigor o código de ética da OAB: nunca garanta vitória ou valores exatos de causa.
2. Mantenha total sigilo das informações relatadas pelo cliente.
3. Encaminhe o caso prontamente para o advogado responsável após coletar os fatos básicos.`
  },
  {
    id: 'solar_energy',
    name: 'Energia Solar Fotovoltaica',
    category: 'Engenharia & Sustentabilidade',
    tag: 'Energia Solar',
    description: 'Captação de residências e empresas para redução de até 95% na conta de luz.',
    personaName: 'Lucas',
    role: 'Especialista em Eficiência Energética',
    toneOfVoice: 'Técnico, dinâmico, convincente e didático',
    salesGoal: 'Solicitar a foto da conta de luz para elaboração de estudo de viabilidade gratuito.',
    followUpNiche: 'solar_energy',
    followUpCustomMessage: 'Olá! Tudo bem? Já finalizei o cálculo de quanto você pode economizar por ano com energia solar na sua residência. Posso te enviar a proposta agora? ☀️⚡',
    knowledgeFaq: `PERGUNTAS FREQUENTES:
P: Quanto vou economizar na conta de luz?
R: A redução média é de até 90% a 95% do valor atual da sua conta de energia.

P: O que preciso para receber um orçamento?
R: Apenas uma foto nítida da frente e do verso da sua conta de luz mais recente para calcularmos seu consumo em kWh.`,
    knowledgeCatalog: `SOLUÇÕES SOLARES:
- Sistemas residenciais On-Grid homologados na concessionária.
- Usinas solares comerciais e industriais.
- Financiamento solar em até 84x onde a parcela fica menor que a economia mensal da conta.`,
    knowledgePricing: `INVESTIMENTO:
- Projetos residenciais a partir de R$ 11.900,00 ou parcelas de R$ 240,00/mês.
- Retorno do investimento (payback) médio de 3 a 4 anos.`,
    knowledgeRules: `DIRETRIZES:
1. Foque na troca: o cliente troca o dinheiro pago à concessionária pela parcela do próprio gerador solar.
2. Peça sempre a foto da conta de luz para fazer o cálculo correto.`
  },
  {
    id: 'auto_vehicles',
    name: 'Concessionária & Venda de Veículos',
    category: 'Automotivo',
    tag: 'Veículos',
    description: 'Venda de carros novos e seminovos com avaliação de troca e simulação de financiamento.',
    personaName: 'Eduardo',
    role: 'Consultor de Vendas de Veículos',
    toneOfVoice: 'Entusiasmado, ágil, negociador e prestativo',
    salesGoal: 'Descobrir preferência de modelo, se tem carro na troca, simular financiamento e marcar test-drive na loja.',
    followUpNiche: 'auto_vehicles',
    followUpCustomMessage: 'Fala, amigo! Tudo bem? Aquele veículo que você curtiu ainda está disponível no pátio e tive autorização do gerente para cobrir a oferta na sua troca! Vamos dar uma volta nele hoje? 🚗💨',
    knowledgeFaq: `PERGUNTAS FREQUENTES:
P: Aceitam meu carro usado na troca?
R: Sim! Fazemos a melhor avaliação do mercado com base na tabela FIPE e você pode usar seu usado como entrada do financiamento.

P: Consigo financiar sem entrada?
R: Temos parcerias com os principais bancos (Santander, BV, Itaú, PAN) que oferecem aprovação de crédito com ou sem entrada, dependendo do seu score.`,
    knowledgeCatalog: `ESTOQUE DISPONÍVEL:
- Hatches compactos econômicos para o dia a dia e trabalho.
- SUVs familiares com garantia de fábrica e revisados com laudo cautelar 100% aprovado.
- Sedans executivos e picapes 4x4.`,
    knowledgePricing: `CONDIÇÕES:
- Veículos de R$ 35.000,00 a R$ 250.000,00.
- Financiamentos em 24x, 36x, 48x ou 60x.`,
    knowledgeRules: `DIRETRIZES:
1. Pergunte sempre se o cliente tem carro na troca e se pretende pagar à vista ou financiado.
2. O foco principal é trazer o cliente até a loja para realizar o test-drive.`
  },
  {
    id: 'saas_tech',
    name: 'SaaS, Software & Tecnologia B2B',
    category: 'Tecnologia & B2B',
    tag: 'Software',
    description: 'Qualificação de leads B2B para demonstração de plataformas e softwares em nuvem.',
    personaName: 'Gabriel',
    role: 'Especialista em Soluções Tecnológicas',
    toneOfVoice: 'Inovador, estratégico, focado em métricas e ROI',
    salesGoal: 'Mapear os gargalos operacionais da empresa e agendar demonstração de 15 minutos com os sócios.',
    followUpNiche: 'saas_tech',
    followUpCustomMessage: 'Olá! Tudo bem? Preparei uma apresentação rápida mostrando como outras empresas do seu mesmo segmento reduziram custos em até 40% com nossa ferramenta. Tem 15 minutos amanhã para vermos juntos na tela? 💻📊',
    knowledgeFaq: `PERGUNTAS FREQUENTES:
P: O sistema precisa de instalação?
R: Não! Nosso software é 100% em nuvem (SaaS), você acessa de qualquer navegador ou celular sem precisar instalar nada na sua máquina.

P: Vocês oferecem treinamento e suporte?
R: Sim, disponibilizamos onboarding guiado para toda a sua equipe e suporte via WhatsApp e videoconferência.`,
    knowledgeCatalog: `MÓDULOS DA PLATAFORMA:
- Automação de processos e atendimento multicanal com IA.
- Dashboards gerenciais em tempo real com relatórios executivos.
- Integrações nativas via Webhook e API REST.`,
    knowledgePricing: `PLANOS MENSAIS E ANUAIS:
- Plano Starter: R$ 197,00/mês.
- Plano Pro: R$ 497,00/mês.
- Plano Enterprise: sob consulta personalizada.`,
    knowledgeRules: `DIRETRIZES:
1. Foque na dor do cliente: economia de tempo, redução de erros humanos e aumento de receita.
2. Não fique despejando jargões técnicos difíceis: mostre o benefício prático no dia a dia do negócio.`
  }
];

interface AgentBuilderProps {
  agentConfig: AgentConfig;
  documents: KnowledgeDocument[];
  onSaveConfig: (updated: AgentConfig) => Promise<void>;
  onUploadDocument: (doc: { name: string; type: 'pdf' | 'txt' | 'docx'; contentText: string; size: number }) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
}

export const AgentBuilder: React.FC<AgentBuilderProps> = ({
  agentConfig,
  documents,
  onSaveConfig,
  onUploadDocument,
  onDeleteDocument,
}) => {
  const [config, setConfig] = useState<AgentConfig>(agentConfig);
  const [activeKnowledgeTab, setActiveKnowledgeTab] = useState<'faq' | 'catalog' | 'pricing' | 'rules'>('faq');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Preset state
  const [selectedPresetModal, setSelectedPresetModal] = useState<AgentPreset | null>(null);
  const [presetSuccessToast, setPresetSuccessToast] = useState<string | null>(null);
  const [presetCategoryFilter, setPresetCategoryFilter] = useState<string>('all');

  const handleApplyPreset = (preset: AgentPreset) => {
    setConfig((prev) => ({
      ...prev,
      personaName: preset.personaName,
      role: preset.role,
      toneOfVoice: preset.toneOfVoice,
      salesGoal: preset.salesGoal,
      followUpNiche: preset.followUpNiche,
      followUpCustomMessage: preset.followUpCustomMessage,
      knowledgeFaq: preset.knowledgeFaq,
      knowledgeCatalog: preset.knowledgeCatalog,
      knowledgePricing: preset.knowledgePricing,
      knowledgeRules: preset.knowledgeRules,
    }));
    setSelectedPresetModal(null);
    setPresetSuccessToast(`✨ Preset "${preset.name}" aplicado! Revise os campos e clique em "Salvar Alterações" no topo para gravar no servidor.`);
    setTimeout(() => setPresetSuccessToast(null), 8000);
  };

  // Synchronize internal state whenever agentConfig updates from backend
  React.useEffect(() => {
    setConfig(agentConfig);
  }, [agentConfig]);

  // Helper to instantly persist critical toggle switches (Global AI & Test Mode)
  const handleQuickToggle = async (updatedFields: Partial<AgentConfig>) => {
    const updated = { ...config, ...updatedFields };
    setConfig(updated);
    try {
      await onSaveConfig(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Falha ao salvar toggle:', err);
    }
  };

  // Playground state
  const [testPrompt, setTestPrompt] = useState('Quanto custa o plano Starter e como funciona o WhatsApp?');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Voice synthesis playground state
  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const [voiceTestError, setVoiceTestError] = useState<string | null>(null);
  const [voiceTestSuccess, setVoiceTestSuccess] = useState<string | null>(null);

  // File upload state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Gemini key live test state
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleTestKey = async () => {
    if (!config.geminiApiKey?.trim()) {
      setKeyTestResult({ success: false, error: 'Por favor, cole sua chave de API do Gemini antes de testar.' });
      return;
    }
    setIsTestingKey(true);
    setKeyTestResult(null);
    try {
      const res = await fetch('/api/agent-config/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: config.geminiApiKey.trim() }),
      });
      const data = await res.json();
      setKeyTestResult(data);
    } catch (err: any) {
      setKeyTestResult({ success: false, error: err.message || 'Erro ao comunicar com o servidor' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestAI = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch('/api/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: testPrompt.trim() }),
      });
      const data = await res.json();
      setTestResponse(data);
    } catch (err: any) {
      setTestResponse({ error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestVoice = async (customText?: string) => {
    setIsTestingVoice(true);
    setVoiceTestError(null);
    setVoiceTestSuccess(null);
    try {
      const textToSynthesize = customText || 'Olá! Aqui é a Sofia da MAVRA. Seja muito bem-vindo! Como posso ajudar a impulsionar as suas vendas e o seu atendimento hoje?';
      const keyToSend = config.voiceEngine === 'elevenlabs' 
        ? config.elevenLabsApiKey 
        : (config.googleTtsApiKey || config.geminiApiKey);
      const res = await fetch('/api/test-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSynthesize,
          apiKey: keyToSend,
          voiceName: config.voiceVoiceName || 'pt-BR-FranciscaNeural',
          engine: config.voiceEngine || 'native_sofia',
        }),
      });
      const data = await res.json();
      if (res.ok && data.audioBase64) {
        const engineLabel = data.engineUsed === 'native_sofia' ? 'Motor Neural Sofia (Voz Humana)' : data.engineUsed === 'elevenlabs' ? 'ElevenLabs' : 'Google Cloud TTS';
        if (data.notice) {
          setVoiceTestSuccess(`${data.notice} Tocando áudio agora no navegador!`);
        } else {
          setVoiceTestSuccess(`Áudio gerado com sucesso via ${engineLabel}! Tocando agora no navegador...`);
        }
        const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
        audio.play().catch((playErr) => {
          console.warn('Auto-play bloqueado pelo navegador:', playErr);
        });
      } else {
        setVoiceTestError(data.error || 'Falha ao sintetizar áudio.');
      }
    } catch (err: any) {
      setVoiceTestError('Erro de conexão ao testar áudio: ' + err.message);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      setIsUploading(true);
      try {
        await onUploadDocument({
          name: file.name,
          type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
          contentText: content,
          size: file.size,
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8" id="agent-builder-module">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-900 text-white shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Construtor de Agente & Base de Conhecimento
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure em 15 minutos a Persona, os Motores Multi-IA (Gemini, OpenAI, Claude), regras de negócio e limites anti-alucinação.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                Salvo com sucesso!
              </span>
            )}
            <button
              id="btn-save-agent-config"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </div>

        {/* Banner de Preset Aplicado com Sucesso */}
        {presetSuccessToast && (
          <div className="bg-indigo-50 border-2 border-indigo-300 text-indigo-900 px-4 py-3 rounded-xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <SparklesIcon className="w-5 h-5 text-indigo-600 shrink-0" />
              <span className="text-xs font-semibold">{presetSuccessToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setPresetSuccessToast(null)}
              className="text-indigo-500 hover:text-indigo-800 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* CONTROLE MASTER: MODO TESTE (ESTILO N8N) & CHAVE GERAL DA IA */}
        <div className="bg-white border-2 border-amber-300/80 rounded-2xl p-6 shadow-sm space-y-5 bg-gradient-to-br from-amber-50/40 via-white to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Proteção de WhatsApp Pessoal & Modo de Teste
                  <span className="text-[10px] bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded border border-amber-300">
                    Estilo n8n Test Step
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Protege seus contatos pessoais (família, amigos, grupos). A IA só responderá números autorizados ou quando você ligar.
                </p>
              </div>
            </div>

            {/* Master Switch: IA Global Ativa / Inativa */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-700">IA no WhatsApp:</span>
              <button
                type="button"
                id="toggle-global-ai"
                onClick={() => handleQuickToggle({ isGlobalAiActive: config.isGlobalAiActive !== false ? false : true })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  config.isGlobalAiActive !== false
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-rose-600 text-white shadow-xs'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{config.isGlobalAiActive !== false ? 'LIGADA (Ativa)' : 'DESLIGADA (Muda)'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opção Modo de Teste Restrito */}
            <div className={`p-4 rounded-xl border transition-all ${
              config.testModeEnabled
                ? 'bg-amber-50/60 border-amber-300 shadow-2xs'
                : 'bg-slate-50/80 border-slate-200'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-slate-900">
                    Modo Teste: Whitelist de Números
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="checkbox-test-mode"
                    checked={config.testModeEnabled || false}
                    onChange={(e) => handleQuickToggle({ testModeEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                Quando ativado, a IA <b>ignora 100% silenciosamente</b> mensagens de amigos, família ou desconhecidos. Somente os números cadastrados abaixo receberão respostas da Sofia!
              </p>

              {config.testModeEnabled && (
                <div className="mt-3 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-600" />
                    Número(s) Autorizados para Teste (com DDD):
                  </label>
                  <input
                    type="text"
                    id="input-test-whitelist"
                    value={config.testNumberWhitelist || ''}
                    onChange={(e) => setConfig({ ...config, testNumberWhitelist: e.target.value })}
                    onBlur={() => handleQuickToggle({ testNumberWhitelist: config.testNumberWhitelist })}
                    placeholder="Ex: 5511987654321, 5511999998888"
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-amber-500 shadow-2xs"
                  />
                  <p className="text-[10px] text-amber-800">
                    Coloque aqui o número do celular de teste (ex: o da sua esposa Tania). Se você receber mensagem de qualquer outro número, a IA não fará nada.
                  </p>
                </div>
              )}
            </div>

            {/* Explicação e status atual */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  Status de Proteção Atual:
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.isGlobalAiActive !== false ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="text-slate-600">Motor WhatsApp:</span>
                    <span className="font-semibold text-slate-900">{config.isGlobalAiActive !== false ? 'Disponível' : 'Desativado (Silêncio Total)'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.testModeEnabled ? 'bg-amber-500' : 'bg-blue-500'}`}></span>
                    <span className="text-slate-600">Filtro de Audiência:</span>
                    <span className="font-semibold text-slate-900">
                      {config.testModeEnabled ? 'Restrito aos números de teste' : 'Aberto a todos os contatos'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 italic">
                Dica: Lembre-se de clicar em "Salvar Alterações" no topo após alterar o modo.
              </p>
            </div>
          </div>
        </div>

        {/* 1. SELETOR MULTI-PROVEDOR DE IA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              1. Motor de Inteligência Artificial (LLM Agnostic)
            </h3>
          </div>

          {/* Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Google Gemini */}
            <div
              onClick={() =>
                setConfig({
                  ...config,
                  activeProvider: 'gemini',
                  activeModel: 'gemini-3.8-flash',
                })
              }
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                config.activeProvider === 'gemini'
                  ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-900" />
                  Google Gemini
                </span>
                {config.activeProvider === 'gemini' && (
                  <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Modelos Flash 100% econômicos, ultra-rápidos e com custo quase zero no WhatsApp.
              </p>
              <select
                value={config.activeProvider === 'gemini' ? config.activeModel : 'gemini-3.8-flash'}
                onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
                disabled={config.activeProvider !== 'gemini'}
                className="w-full bg-white border border-slate-200 rounded text-xs text-slate-800 px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Recomendado - Mais rápido e barato)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Ultra econômico / Super leve)</option>
                <option value="gemini-flash-latest">Gemini Flash Latest</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>

            {/* OpenAI */}
            <div
              onClick={() =>
                setConfig({
                  ...config,
                  activeProvider: 'openai',
                  activeModel: 'gpt-4o',
                })
              }
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                config.activeProvider === 'openai'
                  ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                  OpenAI
                </span>
                {config.activeProvider === 'openai' && (
                  <span className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Modelos de linguagem GPT-4o e GPT-4o-mini com alta precisão conversacional.
              </p>
              <select
                value={config.activeProvider === 'openai' ? config.activeModel : 'gpt-4o'}
                onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
                disabled={config.activeProvider !== 'openai'}
                className="w-full bg-white border border-slate-200 rounded text-xs text-slate-800 px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="gpt-4o">GPT-4o (Completo)</option>
                <option value="gpt-4o-mini">GPT-4o-mini (Econômico)</option>
              </select>
            </div>

            {/* Anthropic Claude */}
            <div
              onClick={() =>
                setConfig({
                  ...config,
                  activeProvider: 'anthropic',
                  activeModel: 'claude-3-5-sonnet',
                })
              }
              className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                config.activeProvider === 'anthropic'
                  ? 'bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-amber-700" />
                  Anthropic
                </span>
                {config.activeProvider === 'anthropic' && (
                  <span className="bg-amber-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Ativo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                Claude 3.5 Sonnet com excelência em nuance de tom e redação comercial.
              </p>
              <select
                value={config.activeProvider === 'anthropic' ? config.activeModel : 'claude-3-5-sonnet'}
                onChange={(e) => setConfig({ ...config, activeModel: e.target.value })}
                disabled={config.activeProvider !== 'anthropic'}
                className="w-full bg-white border border-slate-200 rounded text-xs text-slate-800 px-2.5 py-1.5 focus:outline-hidden"
              >
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>
          </div>

          {/* API Keys Configuration Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-slate-700" />
              Chaves de API dos Provedores (Armazenadas de forma segura no backend)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] text-slate-700 font-semibold">
                    Google Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5"
                  >
                    Obter chave gratuita <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder="AIzaSy... (Cole sua nova chave aqui)"
                    value={config.geminiApiKey || ''}
                    onChange={(e) => {
                      setConfig({ ...config, geminiApiKey: e.target.value.trim() });
                      setKeyTestResult(null);
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGeminiKey(!showGeminiKey)}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showGeminiKey ? 'Ocultar chave' : 'Mostrar chave'}
                  >
                    {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleTestKey}
                    disabled={isTestingKey || !config.geminiApiKey}
                    className="text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    {isTestingKey ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Validando no Google...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        <span>Testar Conexão da Chave</span>
                      </>
                    )}
                  </button>
                </div>
                {keyTestResult && (
                  <div
                    className={`text-[10px] p-2 rounded-lg border ${
                      keyTestResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {keyTestResult.success ? (
                      <div className="flex items-center gap-1.5 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{keyTestResult.message || 'Chave do Gemini 100% válida e funcionando!'}</span>
                      </div>
                    ) : (
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <b className="font-semibold block">Erro na Chave:</b>
                          <span>{keyTestResult.error}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">
                  Google Cloud TTS API Key (Voz Oficial)
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy... (Chave com TTS ativo)"
                  value={config.googleTtsApiKey || ''}
                  onChange={(e) => setConfig({ ...config, googleTtsApiKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  placeholder="sk-proj-..."
                  value={config.openaiApiKey || ''}
                  onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1 font-medium">
                  ElevenLabs API Key
                </label>
                <input
                  type="password"
                  placeholder="xi-api-key..."
                  value={config.elevenLabsApiKey || ''}
                  onChange={(e) => setConfig({ ...config, elevenLabsApiKey: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BIBLIOTECA DE PRESETS DE NICHO EM 1 CLIQUE */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 border-2 border-indigo-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Biblioteca de Nichos Comerciais (Presets em 1 Clique)
                    </h3>
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                      {AGENT_PRESETS.length} Segmentos Prontos
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Mude o nicho do agente instantaneamente: preenche Persona, Catálogo de Serviços, FAQ, Preços, Regras e Follow-up com dados reais de mercado.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 self-start md:self-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Chaves de API & Áudio 500 chars 100% blindados</span>
            </div>
          </div>

          {/* Cards dos Nichos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {AGENT_PRESETS.map((preset) => {
              const isDental = preset.id === 'dental';
              const isMedical = preset.id === 'medical';
              const isRealEstate = preset.id === 'real_estate';
              const isAesthetic = preset.id === 'aesthetic';
              const isLaw = preset.id === 'law_firm';
              const isSolar = preset.id === 'solar_energy';
              const isAuto = preset.id === 'auto_dealer';
              const isSaaS = preset.id === 'nexa_crm';

              return (
                <div
                  key={preset.id}
                  className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 hover:shadow-xs transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {preset.category || 'Nicho'}
                      </span>
                      <div className="p-1.5 rounded-lg bg-slate-50 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {isDental && <Stethoscope className="w-4 h-4" />}
                        {isMedical && <HeartHandshake className="w-4 h-4" />}
                        {isRealEstate && <Building2 className="w-4 h-4" />}
                        {isAesthetic && <SparklesIcon className="w-4 h-4" />}
                        {isLaw && <Scale className="w-4 h-4" />}
                        {isSolar && <Sun className="w-4 h-4" />}
                        {isAuto && <Car className="w-4 h-4" />}
                        {isSaaS && <Bot className="w-4 h-4" />}
                        {!isDental && !isMedical && !isRealEstate && !isAesthetic && !isLaw && !isSolar && !isAuto && !isSaaS && (
                          <SparklesIcon className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-950 transition-colors">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-700">Atendente: {preset.personaName || 'Sofia'}</span>
                      <span className="truncate max-w-[130px]">{preset.toneOfVoice ? preset.toneOfVoice.split(',')[0] : ''}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedPresetModal(preset)}
                    className="mt-3.5 w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Carregar este Nicho</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. PERSONA DO AGENTE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              2. Persona & Comportamento do Agente Comercial
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Agente
              </label>
              <input
                type="text"
                value={config.personaName}
                onChange={(e) => setConfig({ ...config, personaName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Papel / Cargo
              </label>
              <input
                type="text"
                value={config.role}
                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tom de Voz
              </label>
              <input
                type="text"
                value={config.toneOfVoice}
                onChange={(e) => setConfig({ ...config, toneOfVoice: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Objetivo Comercial Primordial
              </label>
              <input
                type="text"
                value={config.salesGoal}
                onChange={(e) => setConfig({ ...config, salesGoal: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          {/* Behavioral checkboxes */}
          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.strictKnowledgeOnly}
                onChange={(e) => setConfig({ ...config, strictKnowledgeOnly: e.target.checked })}
                className="rounded bg-white border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-emerald-800">
                Regra Anti-Alucinação Ativa (a IA só responde baseada no conhecimento cadastrado)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoTriggerCRMStages}
                onChange={(e) => setConfig({ ...config, autoTriggerCRMStages: e.target.checked })}
                className="rounded bg-white border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-slate-800">
                Gatilhos Automáticos do CRM (mover estágios e salvar dados do lead via Function Calling)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoTranscribeAudio !== false}
                onChange={(e) => setConfig({ ...config, autoTranscribeAudio: e.target.checked })}
                className="rounded bg-white border-slate-300 text-slate-900 focus:ring-0 cursor-pointer"
              />
              <span className="font-semibold text-sky-800">
                Ouvir Áudios do WhatsApp (Transcrição instantânea com Gemini e resposta automática em texto)
              </span>
            </label>
          </div>

          {/* Envio Automático de Apresentação / Catálogo em PDF */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-slate-50/60 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Envio Automático de Apresentação Oficial em PDF
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                Disparo via WhatsApp
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Quando o cliente pedir apresentação, proposta, catálogo ou tabela no WhatsApp, a Sofia responde amigavelmente e anexa o arquivo PDF automaticamente para ele baixar.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Link Público do PDF (URL direta do documento)
                </label>
                <input
                  type="url"
                  value={config.catalogPdfUrl || ''}
                  onChange={(e) => setConfig({ ...config, catalogPdfUrl: e.target.value })}
                  placeholder="https://sua-empresa.com/apresentacao.pdf"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nome do Arquivo PDF Exibido no WhatsApp
                </label>
                <input
                  type="text"
                  value={config.catalogPdfName || ''}
                  onChange={(e) => setConfig({ ...config, catalogPdfName: e.target.value })}
                  placeholder="Ex: Apresentacao_Institucional_MAVRA.pdf"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Respostas de Voz Nativas (Google Cloud Text-to-Speech / WhatsApp PTT) */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-violet-50/50 p-5 rounded-xl space-y-4 border border-violet-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-violet-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Respostas de Áudio da Sofia (Google Cloud Text-to-Speech & WhatsApp PTT)
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-voice-response"
                  checked={config.voiceResponseEnabled !== false}
                  onChange={(e) => handleQuickToggle({ voiceResponseEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Com o <b>Google Cloud Text-to-Speech (Vozes Neural2 & Journey)</b>, a Sofia gera áudios em português brasileiro com entonação humana, natural e fluida em menos de 800ms, enviando diretamente no WhatsApp do lead como nota de voz original (PTT com ondas sonoras).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Modo de Resposta */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Comportamento da Sofia
                </label>
                <select
                  value={config.voiceResponseMode || 'smart_discernment'}
                  onChange={(e) => setConfig({ ...config, voiceResponseMode: e.target.value as any })}
                  className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-violet-400 font-medium"
                >
                  <option value="smart_discernment">🧠 Discernimento Inteligente (Áudio com Áudio / Texto com Texto)</option>
                  <option value="always_audio">🎙️ Sempre Responder em Áudio (100% dos contatos)</option>
                  <option value="only_text">💬 Apenas Texto Rápido (Desativa áudio)</option>
                </select>
              </div>

              {/* Motor de Voz */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Motor de Síntese de Voz
                </label>
                <select
                  value={config.voiceEngine || 'native_sofia'}
                  onChange={(e) => {
                    const engine = e.target.value as any;
                    const defaultVoice = engine === 'elevenlabs' ? '21m00Tcm4TlvDq8ikWAM' : engine === 'google_cloud_tts' ? 'pt-BR-Neural2-C' : 'pt-BR-FranciscaNeural';
                    setConfig({ ...config, voiceEngine: engine, voiceVoiceName: defaultVoice });
                  }}
                  className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-violet-400 font-medium"
                >
                  <option value="native_sofia">⚡ Motor Neural Sofia (Recomendado - 100% Humano, Grátis & Sem Chaves)</option>
                  <option value="elevenlabs">💎 ElevenLabs (Vozes Ultra-Humanas / Clonadas do Ela)</option>
                  <option value="google_cloud_tts">🌐 Google Cloud TTS (Neural2 / Journey - Requer GCP)</option>
                </select>
              </div>

              {/* Tom / Perfil de Voz */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Perfil de Voz Nativa (pt-BR)
                </label>
                <select
                  value={config.voiceVoiceName || 'pt-BR-FranciscaNeural'}
                  onChange={(e) => setConfig({ ...config, voiceVoiceName: e.target.value })}
                  className="w-full bg-white border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-violet-400 font-medium"
                >
                  {config.voiceEngine === 'elevenlabs' ? (
                    <>
                      <option value="21m00Tcm4TlvDq8ikWAM">Rachel (ElevenLabs - Feminina Calma & Confiante)</option>
                      <option value="EXAVITQu4vr4xnSDxMaL">Bella (ElevenLabs - Feminina Jovem & Expressiva)</option>
                      <option value="AZnzlk1XvdvUeBnXmlld">Domi (ElevenLabs - Feminina Comercial & Firme)</option>
                      <option value="pNInz6obpgDQGcFmaJgB">Adam (ElevenLabs - Masculina Profunda & Profissional)</option>
                      <option value="ErXwobaYiN019PkySvjV">Antoni (ElevenLabs - Masculina Acolhedora)</option>
                    </>
                  ) : config.voiceEngine === 'google_cloud_tts' ? (
                    <>
                      <option value="pt-BR-Neural2-C">Sofia Comercial (pt-BR-Neural2-C)</option>
                      <option value="pt-BR-Neural2-A">Sofia Acolhedora (pt-BR-Neural2-A)</option>
                      <option value="pt-BR-Journey-F">Sofia Podcast (pt-BR-Journey-F)</option>
                    </>
                  ) : (
                    <>
                      <option value="pt-BR-FranciscaNeural">Sofia Neural Humana (pt-BR - Mais Realista, Fluida & Empática)</option>
                      <option value="pt-BR-ThalitaNeural">Sofia Jovem & Comercial (pt-BR - Dinâmica e Descontraída)</option>
                      <option value="pt-BR-BrendaNeural">Sofia Acolhedora (pt-BR - Suave, Calma e Educada)</option>
                      <option value="pt-BR-AntonioNeural">Executivo Comercial (pt-BR - Masculina Firme & Confiante)</option>
                      <option value="pt-BR-NicolauNeural">Diretor Comercial (pt-BR - Masculina Grave & Segura)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Painel do Motor de Voz e Teste ao Vivo */}
            <div className="bg-white/90 border border-violet-200/80 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-violet-700" />
                    {config.voiceEngine === 'native_sofia'
                      ? 'Motor Neural Sofia (Voz Humana com Respiração Natural)'
                      : config.voiceEngine === 'elevenlabs'
                      ? 'Motor ElevenLabs (Voz Clonada & Hiper-Realista)'
                      : 'Google Cloud Text-to-Speech'}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {config.voiceEngine === 'native_sofia'
                      ? 'Voz neural de última geração com prosódia humana real, pausas naturais e sem sotaque robótico dos anos 90! 100% pronta e gratuita.'
                      : config.voiceEngine === 'elevenlabs'
                      ? 'Insira abaixo sua chave xi-api-key da ElevenLabs para usar a mesma voz ultra-humana do seu outro aplicativo.'
                      : 'Insira suas credenciais abaixo ou use o teste direto.'}
                  </p>
                </div>

                {/* Botão de Teste de Voz ao Vivo */}
                <button
                  type="button"
                  id="btn-test-voice"
                  onClick={() => handleTestVoice()}
                  disabled={isTestingVoice}
                  className="flex items-center justify-center gap-2 bg-violet-700 hover:bg-violet-800 disabled:bg-violet-400 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-all shadow-xs cursor-pointer shrink-0"
                >
                  {isTestingVoice ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sintetizando...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>🎧 Testar e Ouvir Voz Agora</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informação sobre chaves Google AI Studio vs Google Cloud */}
              {config.voiceEngine === 'google_cloud_tts' && (
                <div className="pt-2 border-t border-violet-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-violet-700" />
                      Chave de API do Google Cloud (Text-to-Speech)
                    </label>
                    {config.geminiApiKey && !config.googleTtsApiKey && (
                      <button
                        type="button"
                        onClick={() => setConfig({ ...config, googleTtsApiKey: config.geminiApiKey })}
                        className="text-[10px] text-violet-700 hover:text-violet-900 font-semibold underline cursor-pointer"
                      >
                        Copiar chave usada no Gemini
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    id="input-google-tts-key"
                    placeholder="Cole aqui sua API Key do Google Cloud"
                    value={config.googleTtsApiKey || ''}
                    onChange={(e) => setConfig({ ...config, googleTtsApiKey: e.target.value })}
                    className="w-full bg-slate-50 border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-violet-500 focus:bg-white"
                  />
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-800">
                    💡 <b>Nota do Google:</b> Chaves geradas no <i>Google AI Studio</i> são destinadas ao <b>Gemini</b> (para o cérebro/inteligência). O Google Cloud Text-to-Speech v1 exige OAuth2/Service Account. Caso o Google Cloud bloqueie a chave, o sistema automaticamente usa o <b>Motor Nativo Sofia</b> para que seu cliente nunca fique sem áudio!
                  </div>
                </div>
              )}

              {config.voiceEngine === 'elevenlabs' && (
                <div className="pt-2 border-t border-violet-100 space-y-2">
                  <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-violet-700" />
                    ElevenLabs API Key
                  </label>
                  <input
                    type="password"
                    placeholder="xi-api-key..."
                    value={config.elevenLabsApiKey || ''}
                    onChange={(e) => setConfig({ ...config, elevenLabsApiKey: e.target.value })}
                    className="w-full bg-slate-50 border border-violet-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-violet-500 focus:bg-white"
                  />
                </div>
              )}

              {/* Status e Feedback do Teste de Voz */}
              {voiceTestSuccess && (
                <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{voiceTestSuccess}</span>
                </div>
              )}

              {voiceTestError && (
                <div className="text-[11px] text-rose-800 bg-rose-50 border border-rose-200 rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Não foi possível sintetizar a voz com essa chave:</span>
                  </div>
                  <p className="font-mono text-[10px] pl-6">{voiceTestError}</p>
                  <p className="text-[10px] text-rose-700 pl-6">
                    💡 Dica: Certifique-se de que a API <b>Cloud Text-to-Speech API</b> está ativada no seu Google Cloud Console na mesma conta da sua chave.
                  </p>
                </div>
              )}

              <p className="text-[10px] text-slate-500 leading-normal">
                🔒 A chave é armazenada de forma segura no servidor. Com o Motor Neural Sofia nativo, nenhum custo ou chave externa é necessária.
              </p>
            </div>

            {/* Travas Inteligentes e Economia de Áudio */}
            <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-700" />
                  <h5 className="text-xs font-bold text-slate-900">
                    Travas de Áudio & Economia Inteligente (Anti-Spam de Voz)
                  </h5>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800">
                  Proteção Ativa
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                Configure os limites de áudio para manter a conversa ágil, sem cansar o cliente e economizando processamento.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Máximo de Áudios Seguidos
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={config.maxConsecutiveAudios ?? 2}
                      onChange={(e) => setConfig({ ...config, maxConsecutiveAudios: Math.max(1, parseInt(e.target.value) || 1) })}
                      className="w-24 bg-white border border-violet-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-violet-500"
                    />
                    <span className="text-[11px] text-slate-500">áudios consecutivos</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Após essa quantidade, a Sofia passa a responder em texto para não sobrecarregar o cliente.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tamanho Máximo para Áudio
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={80}
                      max={1200}
                      step={50}
                      value={config.maxAudioChars && config.maxAudioChars > 220 ? config.maxAudioChars : 500}
                      onChange={(e) => setConfig({ ...config, maxAudioChars: Math.max(80, parseInt(e.target.value) || 500) })}
                      className="w-24 bg-white border border-violet-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-violet-500"
                    />
                    <span className="text-[11px] text-slate-500">caracteres (~30 a 50s)</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Respostas longas, explicações detalhadas ou especificações são priorizadas em <b>TEXTO</b> automaticamente.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 border border-violet-100 rounded-lg p-2.5 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-violet-900">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  <span>Prioridades de Discernimento Ativas:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[10.5px] text-slate-600 pl-1">
                  <li><b>Cliente enviou Texto ➡️ Sempre responde em Texto:</b> Se a pessoa digitou, ela quer ler rápido e em silêncio. Sofia NUNCA manda áudio para mensagem de texto (a não ser que a pessoa peça expressamente "manda um áudio").</li>
                  <li><b>Cliente enviou Áudio ➡️ Responde em Áudio:</b> Mantém o tom acolhedor e a conversa humanizada.</li>
                  <li><b>PIX, Links, Contas e E-mails:</b> Sempre enviados em texto para permitir cópia imediata com 1 toque.</li>
                  <li><b>Respostas Longas (&gt; limite de caracteres):</b> Convertidas automaticamente em texto para não gerar áudios cansativos.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Envio de Chave PIX e Fechamento Comercial */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-emerald-50/50 p-4 rounded-xl space-y-3 border border-emerald-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Dados de Pagamento & Chave PIX Oficial
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-full">
                Conversão Direta
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Quando o lead demonstrar intenção de pagamento ou pedir chave PIX, a Sofia envia automaticamente a chave formatada pronta para cópia rápida no WhatsApp e orienta o envio do comprovante.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Chave PIX Oficial da Empresa
                </label>
                <input
                  type="text"
                  value={config.pixKey || ''}
                  onChange={(e) => setConfig({ ...config, pixKey: e.target.value })}
                  placeholder="Ex: seu-email@empresa.com ou CNPJ"
                  className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tipo da Chave
                </label>
                <select
                  value={config.pixKeyType || 'email'}
                  onChange={(e) => setConfig({ ...config, pixKeyType: e.target.value as any })}
                  className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-emerald-400"
                >
                  <option value="email">E-mail</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="cpf">CPF</option>
                  <option value="telefone">Telefone (com DDD)</option>
                  <option value="aleatoria">Chave Aleatória (EVP)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Follow-up Automático para Leads Dormentes */}
          <div className="mt-4 pt-4 border-t border-slate-200/80 bg-sky-50/50 p-5 rounded-xl space-y-4 border border-sky-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-700" />
                <h4 className="text-xs font-bold text-slate-900">
                  Motor de Follow-up Automático de Recuperação de Leads
                </h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="toggle-followup"
                  checked={config.autoFollowUpEnabled !== false}
                  onChange={(e) => handleQuickToggle({ autoFollowUpEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>
            
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Reative contatos que pararam de responder! Se um paciente ou cliente parar de responder após tirar dúvidas, receber valores ou passar por triagem, o motor em segundo plano envia uma mensagem humanizada, carinhosa e natural no WhatsApp.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Nicho do Follow-up */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nicho / Contexto do Follow-up
                </label>
                <select
                  value={config.followUpNiche || 'dental'}
                  onChange={(e) => setConfig({ ...config, followUpNiche: e.target.value as any })}
                  className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-400 font-medium"
                >
                  <option value="dental">🦷 Odontologia (Consultas, Procedimentos & Dor)</option>
                  <option value="medical">🩺 Clínica Médica / Saúde (Avaliações & Exames)</option>
                  <option value="sales">🚀 Vendas B2B / Corporativo (Propostas & Fechamento)</option>
                  <option value="custom">✏️ Mensagem Personalizada (Template Manual)</option>
                </select>
              </div>

              {/* Intervalo de Inatividade */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tempo de Inatividade para Disparo
                </label>
                <select
                  value={config.followUpDelayHours || 4}
                  onChange={(e) => setConfig({ ...config, followUpDelayHours: Number(e.target.value) })}
                  className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-400 font-medium"
                >
                  <option value={2}>2 horas sem resposta (Ágil)</option>
                  <option value={4}>4 horas sem resposta (Recomendado)</option>
                  <option value={8}>8 horas sem resposta</option>
                  <option value={12}>12 horas sem resposta</option>
                  <option value={24}>24 horas (Dia seguinte)</option>
                  <option value={48}>48 horas (2 dias)</option>
                </select>
              </div>

              {/* Máximo de Tentativas */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Máximo de Follow-ups por Lead
                </label>
                <select
                  value={config.maxFollowUpsPerLead || 2}
                  onChange={(e) => setConfig({ ...config, maxFollowUpsPerLead: Number(e.target.value) })}
                  className="w-full bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-sky-400 font-medium"
                >
                  <option value={1}>1 follow-up (Apenas 1 tentativa)</option>
                  <option value={2}>2 follow-ups (Recomendado)</option>
                  <option value={3}>3 follow-ups (Máximo)</option>
                </select>
              </div>
            </div>

            {/* Custom Template Field if selected */}
            {config.followUpNiche === 'custom' && (
              <div className="bg-white border border-sky-200 rounded-lg p-3 space-y-2">
                <label className="block text-[11px] font-bold text-slate-800">
                  Modelo de Mensagem Personalizada
                </label>
                <textarea
                  rows={2}
                  value={config.followUpCustomMessage || ''}
                  onChange={(e) => setConfig({ ...config, followUpCustomMessage: e.target.value })}
                  placeholder="Ex: Olá, {nome}! Tudo bem? Passando para ver se você conseguiu avaliar nosso orçamento de {procedimento}?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-sky-400 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Variáveis suportadas: <code className="bg-slate-100 px-1 rounded font-bold">{"{nome}"}</code>, <code className="bg-slate-100 px-1 rounded font-bold">{"{procedimento}"}</code>, <code className="bg-slate-100 px-1 rounded font-bold">{"{interesse}"}</code>
                </p>
              </div>
            )}

            {/* Preview Box & Run Now Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-sky-100">
              <div className="text-[11px] text-sky-900 bg-white/80 p-2 rounded-lg border border-sky-200 flex-1">
                <span className="font-bold block text-[10px] text-sky-700">Exemplo de Mensagem Gerada ({config.followUpNiche || 'dental'}):</span>
                <span className="italic text-slate-700">
                  {config.followUpNiche === 'dental'
                    ? '"Olá, Roberto! Tudo bem por aí? Passando rapidinho para saber se você conseguiu ver os horários para a sua avaliação ou se prefere que a gente veja outro período para você! 😊"'
                    : config.followUpNiche === 'medical'
                    ? '"Olá, Roberto! Como você está? Gostaria de confirmar se podemos reservar o seu horário na clínica ou se prefere uma outra data!"'
                    : config.followUpNiche === 'sales'
                    ? '"Olá, Roberto! Tudo bem? Passando para saber se conseguiu dar uma olhada na nossa apresentação ou se ficou alguma dúvida que eu possa esclarecer para avançarmos! 🚀"'
                    : (config.followUpCustomMessage || 'Mensagem personalizada...')}
                </span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/followup/run-now', { method: 'POST' });
                    const d = await res.json();
                    alert(d.message || 'Ciclo de follow-up concluído com sucesso!');
                  } catch (e: any) {
                    alert('Erro ao executar follow-up: ' + e.message);
                  }
                }}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Executar Follow-up Agora</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. BASE DE CONHECIMENTO DINÂMICA (Abas Estruturadas) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                3. Base de Conhecimento Estruturada & Regras de Negócio
              </h3>
            </div>
          </div>

          {/* Knowledge tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveKnowledgeTab('faq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeKnowledgeTab === 'faq'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>FAQ / Dúvidas Frequentes</span>
            </button>

            <button
              onClick={() => setActiveKnowledgeTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeKnowledgeTab === 'catalog'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Catálogo de Produtos</span>
            </button>

            <button
              onClick={() => setActiveKnowledgeTab('pricing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeKnowledgeTab === 'pricing'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tabela de Preços</span>
            </button>

            <button
              onClick={() => setActiveKnowledgeTab('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                activeKnowledgeTab === 'rules'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Regras de Negócio</span>
            </button>
          </div>

          {/* Active Tab Textarea */}
          <div>
            {activeKnowledgeTab === 'faq' && (
              <textarea
                rows={8}
                value={config.knowledgeFaq}
                onChange={(e) => setConfig({ ...config, knowledgeFaq: e.target.value })}
                placeholder="Insira as perguntas e respostas mais comuns..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
              />
            )}

            {activeKnowledgeTab === 'catalog' && (
              <textarea
                rows={8}
                value={config.knowledgeCatalog}
                onChange={(e) => setConfig({ ...config, knowledgeCatalog: e.target.value })}
                placeholder="Descreva detalhadamente seus produtos, planos ou serviços..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
              />
            )}

            {activeKnowledgeTab === 'pricing' && (
              <textarea
                rows={8}
                value={config.knowledgePricing}
                onChange={(e) => setConfig({ ...config, knowledgePricing: e.target.value })}
                placeholder="Valores, condições de parcelamento, descontos e taxas..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
              />
            )}

            {activeKnowledgeTab === 'rules' && (
              <textarea
                rows={8}
                value={config.knowledgeRules}
                onChange={(e) => setConfig({ ...config, knowledgeRules: e.target.value })}
                placeholder="Limites da IA, diretrizes de encaminhamento e regras anti-alucinação..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-slate-400 resize-none leading-relaxed"
              />
            )}
          </div>
        </div>

        {/* 4. DOCUMENTOS DE REFERÊNCIA (PDF / TXT / DOCX) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                4. Documentos de Referência Complementares
              </h3>
            </div>

            <label className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-slate-200 transition-colors">
              <Upload className="w-3.5 h-3.5 text-slate-700" />
              <span>{isUploading ? 'Processando...' : 'Carregar Documento (.txt, .pdf)'}</span>
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {documents.length === 0 ? (
              <div className="col-span-2 p-6 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 bg-slate-50/50">
                Nenhum documento carregado ainda. Faça upload de manuais ou tabelas para enriquecer a base.
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{doc.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                        {doc.contentText}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Excluir documento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5. PLAYGROUND / TESTADOR INSTANTÂNEO DO AGENTE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900">
              5. Simulador Instantâneo do Agente (Teste ao Vivo)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Digite qualquer pergunta como se fosse um cliente no WhatsApp para ver a resposta exata da IA e se ela identifica movimentação de etapa.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Digite uma mensagem de teste..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-slate-400"
            />
            <button
              onClick={handleTestAI}
              disabled={isTesting || !testPrompt.trim()}
              className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTesting ? 'Processando...' : 'Testar Resposta'}</span>
            </button>
          </div>

          {testResponse && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 mt-3">
              {testResponse.error ? (
                <div className="text-xs text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Erro no teste: {testResponse.error}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200 pb-2">
                    <span>Motor utilizado: <b className="text-slate-900">{testResponse.providerUsed} ({testResponse.modelUsed})</b></span>
                    <div className="flex items-center gap-2">
                      {testResponse.sendCatalogPdf && (
                        <span className="text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          PDF de Apresentação Solicitado
                        </span>
                      )}
                      {testResponse.stageTriggered && (
                        <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Funil Atualizado para: {testResponse.stageTriggered}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                      Resposta Gerada para o WhatsApp:
                    </span>
                    <p className="text-xs text-slate-900 whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      {testResponse.replyText}
                    </p>
                  </div>

                  {testResponse.extractedInfo && (
                    <div className="text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-800">Dados do Lead Identificados:</span>{' '}
                      {JSON.stringify(testResponse.extractedInfo)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* BARRA DE AÇÃO INFERIOR - SALVAR CONFIGURAÇÕES */}
        <div className="bg-white border-2 border-slate-900/10 rounded-2xl p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky bottom-4 z-20 backdrop-blur-md bg-white/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 text-white shadow-xs">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Salvar Todas as Configurações do Agente</h4>
              <p className="text-xs text-slate-500">
                Aplica imediatamente a nova chave de API, catálogo, regras comerciais e configurações de voz.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
                <Check className="w-4 h-4 text-emerald-600" />
                Configurações salvas com sucesso!
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Salvando...' : 'Salvar Alterações do Agente'}</span>
            </button>
          </div>
        </div>

        {/* MODAL DE CONFIRMAÇÃO & PREVIEW DO PRESET */}
        {selectedPresetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Wand2 className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Carregar Nicho: {selectedPresetModal.name}
                    </h3>
                    <p className="text-[11px] text-indigo-200">
                      Revise o que será aplicado antes de confirmar
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPresetModal(null)}
                  className="p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                  <span className="font-bold text-indigo-950 block">O que será atualizado no formulário:</span>
                  <ul className="space-y-1 text-[11px] text-indigo-900 list-disc list-inside">
                    <li><b>Nome do Agente:</b> {selectedPresetModal.personaName || 'Sofia'} ({selectedPresetModal.role || 'Atendente'})</li>
                    <li><b>Tom de Voz:</b> {selectedPresetModal.toneOfVoice || 'Profissional e acolhedor'}</li>
                    <li><b>Objetivo Comercial:</b> {selectedPresetModal.salesGoal || 'Qualificar e agendar'}</li>
                    <li><b>Base de Conhecimento:</b> Perguntas Frequentes (FAQ), Catálogo Completo, Tabela de Preços e Regras de Atendimento profissionalmente formatadas para este segmento.</li>
                    <li><b>Follow-up Automático:</b> Mensagem personalizada para resgate de leads.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>O que permanece 100% BLINDADO e protegido:</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-emerald-800 list-disc list-inside">
                    <li>Suas Chaves de API (Gemini, OpenAI, etc.) continuam salvas.</li>
                    <li>O limite de áudio de 500 caracteres e a voz Sofia permanecem ativos.</li>
                    <li>A conexão com a Evolution API e o WhatsApp permanece intacta.</li>
                  </ul>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  * Ao clicar em "Confirmar e Aplicar", os campos do formulário serão preenchidos. Depois, basta clicar em <b>"Salvar Alterações"</b> no topo ou rodapé da tela para persistir.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPresetModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(selectedPresetModal)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar e Aplicar no Formulário</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
