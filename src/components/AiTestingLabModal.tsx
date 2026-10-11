import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Wand2,
  Bot,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  Flame,
  HelpCircle,
  DollarSign,
  UserCheck,
  Building2,
  Calendar,
  AlertOctagon,
  Copy,
  Check,
  Loader2,
  Zap
} from 'lucide-react';
import { AgentConfig, AiTestScenario, AiTestResultItem, AiLabAuditReport } from '../types';

interface AiTestingLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentConfig: AgentConfig;
  onSaveRules: (updatedRules: string) => Promise<void>;
}

export const AiTestingLabModal: React.FC<AiTestingLabModalProps> = ({
  isOpen,
  onClose,
  agentConfig,
  onSaveRules,
}) => {
  const [scenarios, setScenarios] = useState<AiTestScenario[]>([]);
  const [isLoadingScenarios, setIsLoadingScenarios] = useState(false);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditProgress, setAuditProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [report, setReport] = useState<AiLabAuditReport | null>(null);
  const [selectedResult, setSelectedResult] = useState<AiTestResultItem | null>(null);
  
  // Custom scenario creation state
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customExpected, setCustomExpected] = useState('');

  // AI auto-fix state
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [autoFixResult, setAutoFixResult] = useState<{ success: boolean; optimizedRules: string; explanation: string } | null>(null);
  const [appliedSuccessToast, setAppliedSuccessToast] = useState<string | null>(null);
  const [copiedRule, setCopiedRule] = useState(false);
  const [isApplyingRules, setIsApplyingRules] = useState(false);
  const [appliedSuccessfully, setAppliedSuccessfully] = useState(false);

  // Load scenarios on open
  useEffect(() => {
    if (isOpen) {
      loadScenarios();
    }
  }, [isOpen]);

  const loadScenarios = async () => {
    setIsLoadingScenarios(true);
    try {
      const res = await fetch('/api/ai-lab/scenarios');
      if (res.ok) {
        const data = await res.json();
        setScenarios(data);
      }
    } catch (e) {
      console.error('Falha ao carregar cenários:', e);
    } finally {
      setIsLoadingScenarios(false);
    }
  };

  const handleRunFullAudit = async () => {
    setIsRunningAudit(true);
    setReport(null);
    setAutoFixResult(null);
    setSelectedResult(null);

    try {
      const res = await fetch('/api/ai-lab/run-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customScenarios: scenarios }),
      });
      if (res.ok) {
        const reportData: AiLabAuditReport = await res.json();
        setReport(reportData);
        if (reportData.results && reportData.results.length > 0) {
          // Select first warning or failed if available, else first passed
          const firstProblem = reportData.results.find((r) => r.status === 'failed' || r.status === 'warning') || reportData.results[0];
          setSelectedResult(firstProblem);
        }
      }
    } catch (err: any) {
      console.error('Erro ao executar auditoria:', err);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const handleAddCustomScenario = () => {
    if (!customMsg.trim() || !customTitle.trim()) return;
    const newSc: AiTestScenario = {
      id: 'custom-' + Date.now(),
      title: customTitle.trim(),
      category: 'objecao',
      description: 'Cenário personalizado cadastrado pelo desenvolvedor/administrador.',
      incomingMessage: customMsg.trim(),
      expectedBehavior: customExpected.trim() || 'Responder com empatia e manter alinhamento com as regras.',
    };
    setScenarios([...scenarios, newSc]);
    setCustomMsg('');
    setCustomTitle('');
    setCustomExpected('');
    setShowAddCustom(false);
  };

  const handleAutoCorrectWithAi = async () => {
    if (!report) return;
    const itemsNeedingFix = report.results.filter((r) => r.status === 'failed' || r.status === 'warning' || r.suggestedRuleFix);
    if (itemsNeedingFix.length === 0) return;

    setIsAutoFixing(true);
    setAutoFixResult(null);

    try {
      const res = await fetch('/api/ai-lab/auto-optimize-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failedItems: itemsNeedingFix,
          currentRules: agentConfig.knowledgeRules,
          autoApply: false,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAutoFixResult(data);
      }
    } catch (e: any) {
      console.error('Erro na auto-correção:', e);
    } finally {
      setIsAutoFixing(false);
    }
  };

  const handleApplyOptimizedRulesNow = async () => {
    if (!autoFixResult?.optimizedRules) return;
    setIsApplyingRules(true);
    try {
      await onSaveRules(autoFixResult.optimizedRules);
      setAppliedSuccessfully(true);
      setAppliedSuccessToast('🎉 Regras salvas e aplicadas com sucesso no Construtor de Agente!');
      setTimeout(() => {
        setAppliedSuccessfully(false);
      }, 4000);
      setTimeout(() => setAppliedSuccessToast(null), 6000);
    } catch (e: any) {
      console.error('Falha ao aplicar regras:', e);
    } finally {
      setIsApplyingRules(false);
    }
  };

  const copyRuleToClipboard = () => {
    if (autoFixResult?.optimizedRules) {
      navigator.clipboard.writeText(autoFixResult.optimizedRules);
      setCopiedRule(true);
      setTimeout(() => setCopiedRule(false), 2500);
    }
  };

  if (!isOpen) return null;

  const failedItems = report?.results.filter((r) => r.status === 'failed') || [];
  const warningItems = report?.results.filter((r) => r.status === 'warning') || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 md:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-6xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-bold text-white tracking-tight">
                  Laboratório de Testes Automatizados & Auto-Correção com IA
                </h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-mono font-bold px-2 py-0.5 rounded border border-indigo-400/30">
                  Modo Admin / Dev
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Simula clientes difíceis no WhatsApp, audita os comportamentos da Sofia e reescreve suas diretrizes em 1 clique.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            <button
              onClick={handleRunFullAudit}
              disabled={isRunningAudit}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isRunningAudit ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Auditoria em Andamento...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Rodar Bateria de Testes ({scenarios.length})</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* TOAST DE SUCESSO AO APLICAR */}
        {appliedSuccessToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-6 py-3 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{appliedSuccessToast}</span>
            </div>
            <button onClick={() => setAppliedSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">

          {/* PAINEL DE RESULTADOS & SCORECARD (SE HOUVER RELATÓRIO) */}
          {report ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Score Geral */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Nota de Prontidão
                    </span>
                    <span className={`text-2xl font-black ${
                      report.score >= 90 ? 'text-emerald-600' : report.score >= 70 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {report.score}/100
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {report.score >= 90 ? 'Excelente (Blindado)' : report.score >= 70 ? 'Bom (Ajustes recomendados)' : 'Atenção (Requer correção)'}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl ${
                    report.score >= 90 ? 'bg-emerald-50 text-emerald-600' : report.score >= 70 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                </div>

                {/* Aprovados */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Testes Aprovados
                    </span>
                    <span className="text-2xl font-black text-emerald-600">
                      {report.passedCount}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      de {report.totalTests} cenários testados
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                </div>

                {/* Avisos */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Avisos de Atenção
                    </span>
                    <span className="text-2xl font-black text-amber-600">
                      {report.warningCount}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Respostas que podem melhorar
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                </div>

                {/* Falhas Críticas */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Falhas Críticas
                    </span>
                    <span className="text-2xl font-black text-rose-600">
                      {report.failedCount}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Regras violadas no teste
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
                    <XCircle className="w-7 h-7" />
                  </div>
                </div>
              </div>

              {/* BANNER DE AUTO-CORREÇÃO COM IA */}
              {(report.failedCount > 0 || report.warningCount > 0) && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-700/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/30 text-indigo-300 shrink-0">
                      <Wand2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        A IA detectou {report.failedCount + report.warningCount} pontos de vulnerabilidade nas respostas!
                      </h4>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        Deseja que a própria IA reescreva suas diretrizes em <code>knowledgeRules</code> para blindar o atendimento contra essas situações?
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleAutoCorrectWithAi}
                    disabled={isAutoFixing}
                    className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isAutoFixing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>A IA está reescrevendo as regras...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>✨ Auto-Corrigir Regras com IA Agora</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* RESULTADO DA AUTO-CORREÇÃO COM IA (PREVIEW & BOTÃO APLICAR) */}
              {autoFixResult && (
                <div className="bg-white border-2 border-indigo-300 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Proposta de Blindagem de Regras Gerada pela IA</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyRuleToClipboard}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer font-medium"
                      >
                        {copiedRule ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRule ? 'Copiado!' : 'Copiar Texto'}</span>
                      </button>

                      <button
                        onClick={handleApplyOptimizedRulesNow}
                        disabled={isApplyingRules || appliedSuccessfully}
                        className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm disabled:opacity-90 ${
                          appliedSuccessfully
                            ? 'bg-emerald-700 text-white ring-2 ring-emerald-400 scale-105'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {isApplyingRules ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Aplicando...</span>
                          </>
                        ) : appliedSuccessfully ? (
                          <>
                            <Check className="w-4 h-4 text-white animate-bounce" />
                            <span>✨ Salvo & Aplicado com Sucesso!</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Salvar & Aplicar no Agente Agora</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    💡 <b>Diagnóstico da IA:</b> {autoFixResult.explanation}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      Novo conteúdo sugerido para as Diretrizes de Atendimento (knowledgeRules):
                    </span>
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-60 leading-relaxed whitespace-pre-wrap">
                      {autoFixResult.optimizedRules}
                    </pre>
                  </div>
                </div>
              )}

              {/* LISTA DE CENÁRIOS & DETALHES LADO A LADO */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Coluna da Esquerda: Lista de Resultados */}
                <div className="lg:col-span-5 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    Cenários Testados ({report.results.length})
                  </span>
                  {report.results.map((item) => {
                    const isSelected = selectedResult?.scenarioId === item.scenarioId;
                    return (
                      <div
                        key={item.scenarioId}
                        onClick={() => setSelectedResult(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            {item.status === 'passed' && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            )}
                            {item.status === 'warning' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            )}
                            {item.status === 'failed' && (
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            )}
                            <h5 className="text-xs font-bold text-slate-900 truncate">
                              {item.scenarioTitle}
                            </h5>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-1">
                            "{item.incomingMessage}"
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              item.status === 'passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.status === 'passed' ? 'Aprovado' : item.status === 'warning' ? 'Atenção' : 'Falha'}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {item.latencyMs}ms
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Coluna da Direita: Raio-X do Cenário Selecionado */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                  {selectedResult ? (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            {selectedResult.scenarioTitle}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                selectedResult.status === 'passed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : selectedResult.status === 'warning'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {selectedResult.status === 'passed' ? 'Aprovado com Louvor' : selectedResult.status === 'warning' ? 'Requer Ajuste' : 'Falha Crítica'}
                            </span>
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            Categoria: {selectedResult.category.toUpperCase()} • Tempo de Resposta: {selectedResult.latencyMs}ms
                          </span>
                        </div>
                      </div>

                      {/* Mensagem enviada pelo lead simulado */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 block">
                          📲 O que o Cliente mandou no WhatsApp:
                        </span>
                        <div className="bg-slate-100 border border-slate-200 p-3 rounded-xl text-xs text-slate-900 font-medium leading-relaxed">
                          "{selectedResult.incomingMessage}"
                        </div>
                      </div>

                      {/* Resposta gerada pela Sofia */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Como a Sofia respondeu:</span>
                        </span>
                        <div className="bg-indigo-50/50 border border-indigo-200 p-3 rounded-xl text-xs text-indigo-950 font-medium leading-relaxed">
                          {selectedResult.agentReply}
                        </div>
                      </div>

                      {/* Feedback do Auditor de IA */}
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <span className="text-[11px] font-bold text-slate-800 block flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                          <span>Análise do Auditor Chefe de IA:</span>
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {selectedResult.feedback}
                        </p>

                        {selectedResult.suggestedRuleFix && (
                          <div className="mt-2 pt-2 border-t border-slate-200 text-xs">
                            <span className="font-bold text-indigo-900 block mb-0.5">
                              Regra de Blindagem Sugerida:
                            </span>
                            <code className="text-[11px] text-indigo-800 bg-indigo-100/60 p-2 rounded block">
                              {selectedResult.suggestedRuleFix}
                            </code>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-full flex items-center justify-center p-8 text-center text-xs text-slate-400">
                      Selecione um cenário na coluna ao lado para ver a auditoria detalhada.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* TELA INICIAL QUANDO AINDA NÃO RODOU AUDITORIA */
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  <Bot className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Pronto para testar o Agente em Condições Extremas?
                </h3>
                <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
                  O Laboratório executa uma bateria com <b>{scenarios.length} situações do mundo real</b> (pressão por preço, falsas emergências, pedidos de atendimento humano, comparações com concorrentes e tentativas de descobrir tecnologia). A IA avalia cada resposta e já sugere a correção automática das diretrizes comerciais!
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleRunFullAudit}
                    disabled={isRunningAudit}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isRunningAudit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Executando Auditoria...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Iniciar Auditoria de Qualidade Agora</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* LISTAGEM DOS CENÁRIOS PRÉ-CONFIGURADOS */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Cenários Pré-Configurados no Laboratório ({scenarios.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Clique em "Adicionar Cenário" para criar testes específicos para o segmento do seu cliente.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {showAddCustom ? 'Cancelar' : '+ Adicionar Cenário Personalizado'}
                  </button>
                </div>

                {/* FORMULÁRIO PARA NOVO CENÁRIO */}
                {showAddCustom && (
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3 animate-in fade-in">
                    <span className="text-xs font-bold text-indigo-950 block">Criar Novo Teste de Simulação:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Título do Cenário</label>
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="Ex: Cliente quer desconto para 3 pessoas"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Comportamento Esperado</label>
                        <input
                          type="text"
                          value={customExpected}
                          onChange={(e) => setCustomExpected(e.target.value)}
                          placeholder="Ex: Não dar desconto fechado, propor avaliação conjunta."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">Mensagem que o Cliente vai mandar no WhatsApp</label>
                      <input
                        type="text"
                        value={customMsg}
                        onChange={(e) => setCustomMsg(e.target.value)}
                        placeholder="Ex: Se eu for com minha esposa e filho, você faz pacote com 40% de desconto?"
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowAddCustom(false)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleAddCustomScenario}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-lg text-xs cursor-pointer"
                      >
                        Salvar Cenário no Laboratório
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {scenarios.map((sc, index) => (
                    <div key={sc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                            {index + 1}
                          </span>
                          {sc.title}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                          {sc.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        "{sc.incomingMessage}"
                      </p>
                      <p className="text-[10px] text-slate-400">
                        <b>Critério:</b> {sc.expectedBehavior}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            🔒 <b>Ambiente Seguro de Homologação:</b> Nenhuma mensagem é enviada para contatos reais de clientes.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Fechar Laboratório
          </button>
        </div>
      </div>
    </div>
  );
};
