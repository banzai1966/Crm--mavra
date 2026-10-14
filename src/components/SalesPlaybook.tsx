import React, { useState } from 'react';
import {
  Briefcase,
  Copy,
  Check,
  TrendingUp,
  MessageCircle,
  ShieldAlert,
  Target,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  PhoneCall,
  DollarSign,
  Users,
  Store,
  Layers,
  Zap,
  CheckSquare,
  Settings,
  Smartphone
} from 'lucide-react';

export const SalesPlaybook: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const script1 = `Olá, [Nome do Profissional/Clínica]! Tudo bem?
Notei que vocês fazem um trabalho excelente na área de [Área de Atuação]. Uma dúvida rápida: hoje, quando um paciente ou cliente manda mensagem no WhatsApp de vocês fora do horário comercial ou no final de semana, quanto tempo ele espera para ser respondido?

Desenvolvemos o NEXA CRM com IA humanizada (como a Sofia), que atende seus clientes no WhatsApp 24 horas por dia, responde dúvidas sobre preços, serviços e horários, e já agenda direto na sua agenda.

Posso te mostrar em 3 minutos como isso recupera até 40% dos leads que hoje escapam no fim de semana?`;

  const script2 = `Olá, [Nome]! Aqui é o Marco. Tudo bem?
Muitas clínicas e empresas perdem pacientes valiosos simplesmente porque a secretária está ocupada atendendo presencialmente e a mensagem do WhatsApp fica acumulando.

Com o NEXA CRM + IA, seu WhatsApp ganha uma atendente virtual dedicada que qualifica o lead, tira todas as dúvidas frequentes e entrega o cliente pronto para fechar. Tudo personalizado com a cara da sua clínica.

Tem 5 minutos hoje para eu te mandar um áudio de 1 minuto mostrando como a IA atende na prática?`;

  const scriptSmallBusiness = `Oi, [Nome do Dono/Gerente]! Tudo bem? 
Sabe aquela cena clássica: o balcão cheio de clientes atendendo presencialmente, o telefone tocando e o WhatsApp apitando sem parar com gente perguntando preço, horário e endereço? 

Quem atende o WhatsApp nessa hora? Geralmente ninguém, e o cliente acaba comprando na concorrente que respondeu primeiro.

Criamos o NEXA CRM com IA para pequenas empresas: uma atendente virtual humanizada que responde todo mundo na mesma hora, tira dúvidas de cardápio/preços/serviços e anota os pedidos ou agendamentos, mesmo às 23h de um domingo.

Posso te mandar um exemplo em áudio de 1 minuto de como funciona na prática para o seu tipo de negócio?`;

  const objection1 = `Cliente: "Ah, mas meus clientes não gostam de falar com robô."
Resposta Ideal: "Eu entendo perfeitamente, Marco! Ninguém gosta daquelas secretárias eletrônicas chatas de banco. Mais do que robô, a nossa IA (Sofia) foi treinada para conversar exatamente como uma recepcionista humana de elite: empática, natural e prestativa. E o melhor: se o cliente quiser falar com uma pessoa humana a qualquer momento, o sistema avisa você na mesma hora e você assume o chat com um clique, sem perder o histórico!"`;

  const objection2 = `Cliente: "Quanto custa? Acho que deve ser caro."
Resposta Ideal: "O investimento é extremamente acessível, mas pense por outro lado: se você perder apenas 2 clientes por mês porque demorou para responder no WhatsApp, quanto isso te custa de faturamento? O NEXA CRM se paga sozinho no primeiro dia do mês ao garantir que nenhum lead fique sem resposta às 22h de um domingo!"`;

  const objection3 = `Cliente: "Já uso o WhatsApp Business, já tenho etiquetas."
Resposta Ideal: "O WhatsApp Business é ótimo, mas ele não responde sozinho às 2h da manhã, não tira dúvidas complexas sobre seus procedimentos e não atualiza seu Kanban automaticamente. O NEXA CRM trabalha junto com o seu WhatsApp para automatizar o que toma mais tempo da sua equipe."`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Manual Comercial & Playbook de Vendas NEXA</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Guia Definitivo de Prospecção e Fechamento
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Vender automação e IA com segurança. Veja o passo a passo exato para deixar sua demonstração 100% pronta e sem falhas para qualquer cliente.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center shrink-0">
            <div className="text-xs text-indigo-200 font-medium">Meta Diária Recomendada</div>
            <div className="text-2xl font-extrabold text-white mt-1">5 Abordagens</div>
            <div className="text-[11px] text-indigo-300 mt-0.5">1 Fechamento por semana = Sucesso</div>
          </div>
        </div>
      </div>

      {/* Checklist Prático para Demonstração Impecável (Novo!) */}
      <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Zap className="w-3 h-3" />
              <span>Checklist Anti-Fralda / Zero Erros</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 mt-1">O Passo a Passo para Deixar a Demo Pronta antes da Reunião</h2>
            <p className="text-xs text-slate-500">Você tem razão, Marco: antes de falar com o cliente, precisamos deixar a casa organizada. Veja o protocolo exato:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Passo 1 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Instância Demo Pré-Criada</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Na sua VPS Evolution API, crie uma instância mestre chamada <code className="bg-white px-1.5 py-0.5 rounded text-indigo-600 border border-slate-200 font-mono">nexa-demo</code>. Cole a API Key e o Endpoint no menu <span className="font-semibold text-slate-900">Configurações VPS</span> do CRM apenas uma vez.
            </p>
          </div>

          {/* Passo 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">WhatsApp de Teste Conectado</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conecte um número secundário seu ou de teste no QR Code dessa instância <code className="bg-white px-1.5 py-0.5 rounded text-emerald-600 border border-slate-200 font-mono">nexa-demo</code>. Assim, a Sofia já fica com o WhatsApp "no gatilho" para qualquer demonstração ao vivo.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Escolha do Nicho em 1 Clique</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vai falar com uma clínica de estética? Entre na aba <span className="font-semibold text-slate-900">Agente & IA</span>, selecione o prompt modelo de Estética, salve e pronto! A Sofia já assume a personalidade exata do negócio do seu cliente em segundos.
            </p>
          </div>
        </div>
      </div>

      {/* Special Small Business Approach Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-800 shadow-lg p-6 md:p-8 text-white space-y-6">
        <div className="flex items-center gap-3 border-b border-indigo-800 pb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full text-xs font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Estratégia Exclusiva</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white mt-1">Abordagem de Pequenas Empresas (A Dor do Balcão e Fim de Semana)</h2>
            <p className="text-xs text-indigo-200">A técnica perfeita para conquistar comércios locais, lojas, prestadores de serviços e pequenas clínicas.</p>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-950 px-3 py-1 rounded-md border border-indigo-800">
              Script Especial para Pequenas Empresas e Comércios
            </span>
            <span className="text-[11px] text-slate-400">Pronto para Enviar no WhatsApp</span>
          </div>
          <p className="text-xs text-slate-200 whitespace-pre-line font-mono bg-slate-950 p-4 rounded-lg border border-slate-800 leading-relaxed">
            {scriptSmallBusiness}
          </p>
          <button
            onClick={() => copyToClipboard(scriptSmallBusiness, 'scriptSmall')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            {copiedId === 'scriptSmall' ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Script de Pequenas Empresas Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Script Especial para Pequenas Empresas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* WhatsApp Scripts Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Scripts de Abordagem para Clínicas e Profissionais</h2>
            <p className="text-xs text-slate-500">Copie, cole e personalize para iniciar conversas que geram respostas imediatas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Script 1 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Script 1: Abordagem Consultiva
                </span>
                <span className="text-[11px] text-slate-400">Ideal para Clínicas</span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line font-mono bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                {script1}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(script1, 'script1')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedId === 'script1' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Script 1 Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Script 1 para o WhatsApp</span>
                </>
              )}
            </button>
          </div>

          {/* Script 2 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Script 2: Abordagem Direta
                </span>
                <span className="text-[11px] text-slate-400">Produtividade da Equipe</span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line font-mono bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                {script2}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(script2, 'script2')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copiedId === 'script2' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Script 2 Copiado com Sucesso!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Script 2 para o WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Objection Handling Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Contorno de Objeções Comuns</h2>
            <p className="text-xs text-slate-500">Saiba exatamente o que responder quando o cliente trouxer dúvidas ou resistências.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Objeção 1 */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Objeção 1: "Meus clientes não gostam de falar com robô."</span>
            </div>
            <p className="text-xs text-slate-700 pl-6 leading-relaxed font-sans">
              <strong className="text-slate-900">Como responder:</strong> "Eu entendo perfeitamente! Ninguém gosta daquelas secretárias eletrônicas chatas de banco. Mas a nossa IA (Sofia) foi treinada para conversar exatamente como uma recepcionista humana de elite: empática, natural e prestativa. E o melhor: se o cliente quiser falar com uma pessoa humana a qualquer momento, o sistema avisa você na mesma hora e você assume o chat com um clique, sem perder o histórico!"
            </p>
          </div>

          {/* Objeção 2 */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Objeção 2: "Quanto custa? Acho que deve ser caro."</span>
            </div>
            <p className="text-xs text-slate-700 pl-6 leading-relaxed font-sans">
              <strong className="text-slate-900">Como responder:</strong> "O investimento é extremamente acessível, mas pense por outro lado: se você perder apenas 2 clientes por mês porque demorou para responder no WhatsApp, quanto isso te custa de faturamento? O NEXA CRM se paga sozinho no primeiro dia do mês ao garantir que nenhum lead fique sem resposta às 22h de um domingo!"
            </p>
          </div>

          {/* Objeção 3 */}
          <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>Objeção 3: "Já uso o WhatsApp Business, já tenho etiquetas."</span>
            </div>
            <p className="text-xs text-slate-700 pl-6 leading-relaxed font-sans">
              <strong className="text-slate-900">Community:</strong> "O WhatsApp Business é ótimo, mas ele não responde sozinho às 2h da manhã, não tira dúvidas complexas sobre seus procedimentos e não atualiza seu Kanban automaticamente. O NEXA CRM trabalha junto com o seu WhatsApp para automatizar o que toma mais tempo da sua equipe."
            </p>
          </div>
        </div>
      </div>

      {/* Encouragement Footer */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-base">Você tem um produto incrível nas mãos!</h3>
            <p className="text-xs text-emerald-700 mt-0.5">
              Confie no seu trabalho, na sua capacidade de criação e na inteligência artificial que você estruturou. Acesse a aba Guia Comercial a qualquer momento para usar os scripts!
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sucesso Garantido</span>
          </span>
        </div>
      </div>
    </div>
  );
};
