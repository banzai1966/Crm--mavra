import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Smartphone,
  FileSpreadsheet,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  FileText,
  ArrowRight,
  Layers,
  Database,
  Check,
} from 'lucide-react';
import { KanbanStage, Lead, EvolutionConfig } from '../types';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages: KanbanStage[];
  evolutionConfig: EvolutionConfig;
  onImportSuccess: (importedCount: number) => void;
}

interface ParsedContact {
  name: string;
  phone: string;
  email?: string;
  value?: number;
  notes?: string;
  interest?: string;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({
  isOpen,
  onClose,
  stages,
  evolutionConfig,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'file' | 'paste'>('whatsapp');
  
  // Preferred default stage: Base Antiga / Reativação
  const defaultStageId =
    stages.find(
      (s) =>
        s.id === 'stage-base' ||
        s.name.toLowerCase().includes('reativação') ||
        s.name.toLowerCase().includes('base antiga')
    )?.id || stages[0]?.id || 'stage-1';

  const [selectedStageId, setSelectedStageId] = useState<string>(defaultStageId);
  const [customTag, setCustomTag] = useState<string>('Base Antiga');
  
  // WhatsApp Sync State
  const [isSyncingWhatsapp, setIsSyncingWhatsapp] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    count?: number;
  } | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedContacts, setParsedContacts] = useState<ParsedContact[]>([]);
  const [isImportingFile, setIsImportingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Paste Text State
  const [pastedText, setPastedText] = useState<string>('');

  if (!isOpen) return null;

  // Handle WhatsApp Contacts Sync via Evolution API
  const handleSyncWhatsapp = async () => {
    setIsSyncingWhatsapp(true);
    setSyncFeedback({
      type: 'info',
      message: 'Consultando agenda e histórico de conversas no WhatsApp conectado...',
    });

    try {
      const res = await fetch('/api/evolution/sync-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStageId: selectedStageId,
          tag: customTag || 'Base Antiga',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSyncFeedback({
          type: 'success',
          message: `✅ Sucesso! ${data.importedCount} novos contatos foram importados para o CRM${
            data.alreadyExistingCount > 0
              ? ` (${data.alreadyExistingCount} já estavam cadastrados).`
              : '.'
          }`,
          count: data.importedCount,
        });
        onImportSuccess(data.importedCount);
      } else {
        setSyncFeedback({
          type: 'error',
          message: data.error || 'Não foi possível consultar os contatos do WhatsApp. Verifique se o aparelho está conectado.',
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: 'Erro de conexão: ' + err.message,
      });
    } finally {
      setIsSyncingWhatsapp(false);
    }
  };

  // Parse CSV / TXT File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        parseAndSetContacts(text);
      } catch (err: any) {
        setFileError('Falha ao processar arquivo: ' + err.message);
      }
    };

    reader.readAsText(file);
  };

  // Helper to parse CSV or Tab/Comma/Semicolon separated text
  const parseAndSetContacts = (rawText: string) => {
    const lines = rawText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setFileError('O arquivo está vazio.');
      setParsedContacts([]);
      return;
    }

    const contacts: ParsedContact[] = [];

    // Check if first row is header
    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.includes('nome') ||
      firstLine.includes('name') ||
      firstLine.includes('telefone') ||
      firstLine.includes('phone') ||
      firstLine.includes('celular') ||
      firstLine.includes('contato');

    const startIndex = hasHeader ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Determine delimiter (comma, semicolon, tab, pipe)
      let parts: string[] = [];
      if (line.includes(';')) parts = line.split(';');
      else if (line.includes('\t')) parts = line.split('\t');
      else if (line.includes('|')) parts = line.split('|');
      else parts = line.split(',');

      const cleanParts = parts.map((p) => p.trim().replace(/^["']|["']$/g, ''));
      
      let name = '';
      let phone = '';
      let email = '';
      let notes = '';

      if (cleanParts.length >= 2) {
        name = cleanParts[0];
        phone = cleanParts[1].replace(/\D/g, '');
        if (cleanParts[2] && cleanParts[2].includes('@')) {
          email = cleanParts[2];
        } else if (cleanParts[2]) {
          notes = cleanParts[2];
        }
        if (cleanParts[3] && !notes) {
          notes = cleanParts[3];
        }
      } else if (cleanParts.length === 1) {
        // Single column could be phone or name
        const digits = cleanParts[0].replace(/\D/g, '');
        if (digits.length >= 8) {
          phone = digits;
          name = `Contato ${digits.slice(-4)}`;
        }
      }

      if (phone.length >= 8) {
        // Standardize Brazilian numbers
        if (!phone.startsWith('55') && (phone.length === 10 || phone.length === 11)) {
          phone = '55' + phone;
        }

        contacts.push({
          name: name || `Paciente ${phone.slice(-4)}`,
          phone,
          email: email || undefined,
          notes: notes || undefined,
          interest: 'Importado para Reativação',
        });
      }
    }

    if (contacts.length === 0) {
      setFileError('Nenhum telefone válido encontrado. Certifique-se de que a planilha contenha colunas com Nome e Telefone.');
    } else {
      setFileError(null);
    }

    setParsedContacts(contacts);
  };

  // Handle Manual Text Parse
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    parseAndSetContacts(pastedText);
  };

  // Submit Parsed Contacts to Server
  const handleSubmitContacts = async () => {
    if (parsedContacts.length === 0) return;

    setIsImportingFile(true);
    setSyncFeedback({
      type: 'info',
      message: `Enviando ${parsedContacts.length} contatos para o CRM...`,
    });

    try {
      const res = await fetch('/api/leads/import-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: parsedContacts,
          targetStageId: selectedStageId,
          addTag: customTag || 'Base Antiga',
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSyncFeedback({
          type: 'success',
          message: `🎉 Perfeito! ${data.importedCount} pacientes foram importados com sucesso para a coluna "${
            stages.find((s) => s.id === selectedStageId)?.name || 'Base Antiga'
          }"!`,
          count: data.importedCount,
        });
        setParsedContacts([]);
        setFileName(null);
        setPastedText('');
        onImportSuccess(data.importedCount);
      } else {
        setSyncFeedback({
          type: 'error',
          message: data.error || 'Falha ao importar contatos no servidor.',
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        type: 'error',
        message: 'Erro de conexão: ' + err.message,
      });
    } finally {
      setIsImportingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Importar & Sincronizar Base de Pacientes
              </h3>
              <p className="text-xs text-slate-500">
                Puxe contatos do WhatsApp ou carregue planilhas para reativação imediata.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Destination Stage & Tag selector */}
        <div className="px-6 py-3 bg-slate-100/60 border-b border-slate-200 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <Layers className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-700 shrink-0">Coluna de Destino:</span>
            <select
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-hidden focus:border-indigo-500 w-full"
            >
              {stages.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} {st.id === 'stage-base' ? '⭐ (Recomendado)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 shrink-0">Etiqueta (Tag):</span>
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              placeholder="ex: Base Antiga"
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 font-medium w-28 focus:outline-hidden focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              setActiveTab('whatsapp');
              setSyncFeedback(null);
            }}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'whatsapp'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Puxar do WhatsApp Conectado</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
              1 Clique
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('file');
              setSyncFeedback(null);
            }}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>2. Subir Planilha (CSV / Excel)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('paste');
              setSyncFeedback(null);
            }}
            className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Colar Lista Manual</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Feedback Banner */}
          {syncFeedback && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-150 ${
                syncFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : syncFeedback.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900'
              }`}
            >
              {syncFeedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {syncFeedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {syncFeedback.type === 'info' && <RefreshCw className="w-4 h-4 text-indigo-600 animate-spin shrink-0 mt-0.5" />}
              <div className="flex-1 font-medium">{syncFeedback.message}</div>
            </div>
          )}

          {/* TAB 1: WhatsApp Direct Sync */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-50/60 via-slate-50 to-emerald-50/40 border border-indigo-100 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Sincronização Automática com o WhatsApp
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      O sistema consultará a instância <strong>{evolutionConfig.instanceName || 'dra-lucy-murata'}</strong> conectada na Evolution API e importará automaticamente todos os contatos que já conversaram com a clínica, criando os cartões na coluna selecionada.
                    </p>
                  </div>
                </div>

                <div className="bg-white/90 border border-slate-200 rounded-lg p-3 text-xs space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Proteções de Inteligência:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-600">
                    <li>Filtra e ignora grupos e mensagens de status/notificação.</li>
                    <li>Não duplica pacientes que já estão cadastrados no CRM.</li>
                    <li>Organiza nomes formatados e números com DDD.</li>
                  </ul>
                </div>

                <button
                  onClick={handleSyncWhatsapp}
                  disabled={isSyncingWhatsapp}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSyncingWhatsapp ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sincronizando contatos com o WhatsApp...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Puxar Contatos do WhatsApp Agora</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: File Upload (CSV / Excel) */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20 rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {fileName ? fileName : 'Clique para selecionar a planilha (CSV ou TXT)'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Formatos aceitos: CSV exportado de sistemas de clínica, Doctoralia, Simples Dental ou Excel
                  </p>
                </div>
              </div>

              {fileError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {/* Preview of Parsed Contacts */}
              {parsedContacts.length > 0 && (
                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>{parsedContacts.length} contatos identificados na planilha</span>
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
                    {parsedContacts.slice(0, 5).map((c, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800">{c.name}</span>
                        <span className="text-slate-500 font-mono">{c.phone}</span>
                      </div>
                    ))}
                    {parsedContacts.length > 5 && (
                      <div className="py-1 text-[11px] text-slate-400 italic text-center">
                        ... e mais {parsedContacts.length - 5} contatos prontos para importar
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSubmitContacts}
                    disabled={isImportingFile}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isImportingFile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Importando {parsedContacts.length} pacientes...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Confirmar Importação de {parsedContacts.length} Pacientes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Paste Text */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Cole uma lista com <strong>Nome</strong> e <strong>Telefone</strong> (um contato por linha, separados por vírgula ou traço):
              </p>
              <textarea
                rows={5}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Exemplo:\nMaria Santos, 11988887777\nJoão Pereira, 11977776666\nCarla Oliveira, 5511966665555`}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all cursor-pointer"
                >
                  Processar Lista
                </button>
              </div>

              {parsedContacts.length > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                  <span className="font-semibold">
                    {parsedContacts.length} contatos prontos para importar!
                  </span>
                  <button
                    onClick={handleSubmitContacts}
                    disabled={isImportingFile}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer shadow-2xs"
                  >
                    Salvar no CRM
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Todos os contatos recebem a tag #{customTag || 'BaseAntiga'} automaticamente.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg font-semibold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
