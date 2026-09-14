import React, { useState, useEffect } from 'react';
import {
  Database,
  Key,
  ShieldCheck,
  Copy,
  Check,
  Table,
  Terminal,
  ExternalLink,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SupabaseConfig } from '../types';

interface SupabaseSettingsProps {
  supabaseConfig: SupabaseConfig;
  onSaveConfig: (config: SupabaseConfig) => Promise<void>;
}

export const SupabaseSettings: React.FC<SupabaseSettingsProps> = ({
  supabaseConfig,
  onSaveConfig,
}) => {
  const [config, setConfig] = useState<SupabaseConfig>(supabaseConfig);
  const [sqlScript, setSqlScript] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/supabase/schema')
      .then((res) => res.text())
      .then((data) => setSqlScript(data))
      .catch((err) => console.error('Erro ao carregar schema:', err));
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
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

  const tables = [
    { name: 'leads', description: 'Oportunidades do CRM, dados de contato, estágio, valor e status da IA' },
    { name: 'etapas_kanban', description: 'Colunas do funil de vendas, cores hexadecimais e ordenação' },
    { name: 'mensagens_chat', description: 'Histórico de mensagens WhatsApp entre leads, IA e atendentes humanos' },
    { name: 'configuracoes_agente', description: 'Persona, provedor Multi-IA, catálogo e base de conhecimento' },
    { name: 'documentos_conhecimento', description: 'Documentos anexos de referência (PDF / TXT / DOCX) para contexto' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8" id="supabase-module">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-900 text-white shadow-2xs">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Integração Banco de Dados Supabase
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Estrutura relacional escalável para persistência duradoura de leads, mensagens e conhecimento.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  supabaseConfig.isConnected ? 'bg-emerald-600' : 'bg-amber-600'
                }`}
              ></span>
              {supabaseConfig.isConnected
                ? 'Supabase Conectado'
                : 'Modo Armazenamento Local Ativo'}
            </span>
          </div>
        </div>

        {/* 1. CREDENCIAIS DO SUPABASE */}
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Credenciais do Projeto Supabase
              </h3>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              id="btn-save-supabase-config"
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Salvando...' : 'Salvar e Conectar'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project URL (Supabase)
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Role Key (Backend)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={config.serviceKey}
                onChange={(e) => setConfig({ ...config, serviceKey: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Anon Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                value={config.anonKey}
                onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-slate-400"
              />
            </div>
          </div>

          {saveSuccess && (
            <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
              ✓ Configuração do Supabase salva com sucesso.
            </p>
          )}
        </form>

        {/* 2. TABELAS ESTRUTURADAS NO SUPABASE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Tabelas Estruturadas da Aplicação
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tables.map((t, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <Table className="w-3.5 h-3.5 text-slate-700" />
                  <span className="font-mono text-xs font-bold text-slate-900">{t.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SCRIPT SQL OFICIAL PARA O SUPABASE SQL EDITOR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Script SQL Oficial (Cole no Supabase SQL Editor)
              </h3>
            </div>

            <button
              onClick={handleCopySql}
              id="btn-copy-supabase-sql"
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-xs cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copiado!' : 'Copiar Script SQL'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] font-mono text-slate-800 overflow-x-auto max-h-72 leading-relaxed">
              {sqlScript || '-- Carregando script de migração SQL...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
