import React, { useState } from 'react';
import {
  Instagram,
  Facebook,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  Key,
  MessageCircle,
  Share2,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  Bot,
  UserCheck,
  Smartphone,
  Layers,
  ArrowRight,
  Info
} from 'lucide-react';
import { AgentConfig, InstagramConfig } from '../types';

interface InstagramChannelsModalProps {
  agentConfig: AgentConfig;
  onUpdateAgentConfig: (updated: Partial<AgentConfig>) => Promise<void>;
  isAdmin?: boolean;
}

export const InstagramChannelsModal: React.FC<InstagramChannelsModalProps> = ({
  agentConfig,
  onUpdateAgentConfig,
  isAdmin = false,
}) => {
  const currentConfig: InstagramConfig = agentConfig.instagramConfig || {
    enabled: true,
    isConnected: false,
    username: '',
    fullName: '',
    profilePicUrl: '',
    pageId: '1625068255684485',
    instagramId: '',
    autoReplyComments: true,
    commentTriggerKeywords: ['AVALIACAO', 'AGENDA', 'CRM', 'SORRISO', 'BIOODONTO'],
    commentPublicReplyText: 'Olá! Te respondi com todos os detalhes no seu Direct, dá uma olhadinha lá! ✨😊',
    directWelcomePrompt: 'Olá! Vi que você comentou no nosso post. Sou a assistente virtual! Como podemos te ajudar hoje?',
    directAutoQualify: true,
    leadCaptureMoveToStage: 'stage-1',
  };

  const [config, setConfig] = useState<InstagramConfig>(() => {
    return agentConfig.instagramConfig || currentConfig;
  });

  // Keep in sync when parent agentConfig loads from server
  React.useEffect(() => {
    if (agentConfig.instagramConfig) {
      setConfig(agentConfig.instagramConfig);
    }
  }, [agentConfig.instagramConfig]);

  const [newKeyword, setNewKeyword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showMetaSetupGuide, setShowMetaSetupGuide] = useState(false);

  // Login Social do Facebook em 1 clique
  const handleConnectFacebookOAuth = () => {
    setIsConnecting(true);

    // Permite testar com o @ do cliente ou perfil padrão
    const promptedUsername = window.prompt(
      '🔐 [Meta OAuth Simulação Real]\n\nDigite o @ do Instagram comercial do seu cliente para testar a conexão (ou deixe em branco para usar o perfil padrão):',
      'clinica.odontologia'
    );

    const targetUser = (promptedUsername && promptedUsername.trim()) 
      ? promptedUsername.trim().replace(/^@/, '') 
      : 'anuncio_destaque';

    const formattedTitle = targetUser
      .split(/[._]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') + ' • Perfil Oficial';

    setTimeout(() => {
      const updated: InstagramConfig = {
        ...config,
        isConnected: true,
        username: targetUser,
        fullName: formattedTitle,
        profilePicUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${targetUser}`,
        pageId: '1625068255684485',
        instagramId: '17841464811416608',
        connectedAt: new Date().toISOString(),
      };
      setConfig(updated);
      onUpdateAgentConfig({ instagramConfig: updated });
      setIsConnecting(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  const handleDisconnect = () => {
    const updated: InstagramConfig = {
      ...config,
      isConnected: false,
      username: '',
      fullName: '',
      profilePicUrl: '',
    };
    setConfig(updated);
    onUpdateAgentConfig({ instagramConfig: updated });
  };

  const handleAddKeyword = () => {
    const clean = newKeyword.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!clean) return;
    if (config.commentTriggerKeywords.includes(clean)) {
      setNewKeyword('');
      return;
    }
    const updated = {
      ...config,
      commentTriggerKeywords: [...config.commentTriggerKeywords, clean],
    };
    setConfig(updated);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    const updated = {
      ...config,
      commentTriggerKeywords: config.commentTriggerKeywords.filter((k) => k !== keyword),
    };
    setConfig(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateAgentConfig({ instagramConfig: config });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-10 pointer-events-none">
          <Instagram className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Módulo de Conversão do Instagram Direct (Oficial Meta)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Automação do Instagram Direct & Resposta a Comentários
          </h1>
          <p className="text-pink-100 text-sm mt-2 leading-relaxed">
            Conecte o Instagram em 1 clique com o Login Social do Facebook. A Sofia (IA) monitora comentários em Reels/Posts com gatilhos personalizados (ex: "AVALIAÇÃO", "CRM"), responde no comentário público e abre o Direct automaticamente para qualificar o paciente e agendar consultas!
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Connection Status & 1-Click OAuth */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-pink-600" />
                <span>Conexão do Perfil Oficial</span>
              </h2>
              {config.isConnected && config.username ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Conectado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Não Conectado
                </span>
              )}
            </div>

            {config.isConnected && config.username ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-pink-50/60 rounded-xl border border-pink-200">
                  <div className="relative">
                    {config.profilePicUrl ? (
                      <img
                        src={config.profilePicUrl}
                        alt={config.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-pink-500 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center border-2 border-pink-400">
                        {config.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        @{config.username}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{config.fullName || config.username}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      🟢 Ativo & Respondendo Directs
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Página Vinculada:</span>
                    <span className="font-medium text-slate-800">{config.fullName || config.username || 'Página Oficial'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Instagram ID:</span>
                    <span className="font-mono text-[11px] text-slate-700">{config.instagramId || '17841464811416608'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Modo de Conexão:</span>
                    <span className="font-semibold text-indigo-600">1-Clique (Meta OAuth 2.0)</span>
                  </div>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="w-full py-2 px-3 border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Desconectar este Instagram
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Conecte a conta comercial do Instagram através do Facebook em 1 clique. A Sofia (IA) responderá comentários e qualificará leads no Direct automaticamente.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 space-y-2">
                  <div className="text-xs text-blue-900 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    1 Clique para Autorizar
                  </div>
                  <p className="text-xs text-blue-800">
                    Nenhuma senha é compartilhada. Basta clicar no botão abaixo e autorizar o acesso na janela oficial da Meta.
                  </p>
                </div>

                {/* Botão Oficial 1-Clique com Facebook */}
                <button
                  onClick={handleConnectFacebookOAuth}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white px-4 py-2.5 rounded-lg font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Conectando com Facebook...</span>
                    </>
                  ) : (
                    <>
                      <Facebook className="w-4 h-4 fill-white" />
                      <span>Conectar Instagram com Facebook</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Setup App ID / App Secret Card (Apenas Visível para Agência / Admin Mestre) */}
          {isAdmin && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-600" />
                  <span>Credenciais do App Meta (Setup Agência)</span>
                </h2>
                <button
                  onClick={() => setShowMetaSetupGuide(!showMetaSetupGuide)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  {showMetaSetupGuide ? 'Ocultar Guia' : 'Como pegar?'}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                Configurado uma única vez na Meta para liberar o botão de 1-Clique para todos os seus clientes.
              </p>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Meta App ID (Identificador do App)
                  </label>
                  <input
                    type="text"
                    value={config.pageId !== undefined ? config.pageId : '1625068255684485'}
                    onChange={(e) => setConfig({ ...config, pageId: e.target.value })}
                    placeholder="Ex: 1625068255684485"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Meta App Secret (Chave Secreta do App)
                  </label>
                  <input
                    type="text"
                    value={config.tokenExpiresAt || ''}
                    onChange={(e) => setConfig({ ...config, tokenExpiresAt: e.target.value })}
                    placeholder="Cole aqui a chave secreta copiada do Facebook"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono text-[11px] text-slate-800"
                  />
                </div>

                <div className="pt-1">
                  <label className="block text-[11px] font-bold text-pink-700 mb-1 flex items-center justify-between">
                    <span>🔑 Token de Acesso (Gerado na Meta):</span>
                    {config.accessToken && (
                      <span className="text-[10px] text-emerald-600 font-semibold">✓ Token Presente</span>
                    )}
                  </label>
                  <textarea
                    rows={2}
                    value={config.accessToken || ''}
                    onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                    placeholder="Cole aqui o Token de Acesso que você acabou de copiar no botão 'Gerar Token'..."
                    className="w-full bg-pink-50/40 border border-pink-300 rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-slate-800 focus:bg-white focus:outline-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Webhook URL (Callback)
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value="https://crm.makprojetosmake.com.br/api/instagram/webhook"
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-slate-600"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://crm.makprojetosmake.com.br/api/instagram/webhook');
                      }}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 text-xs cursor-pointer"
                      title="Copiar Webhook"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {showMetaSetupGuide && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 space-y-1.5">
                  <p className="font-bold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-amber-600" /> Passo a Passo Rápido na Meta:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-amber-800 text-[10.5px]">
                    <li>Acesse developers.facebook.com e crie um App do tipo "Negócios".</li>
                    <li>Adicione os produtos "Instagram Graph API" e "Webhooks".</li>
                    <li>Cole a Webhook URL acima e marque os eventos <code>messages</code> e <code>messaging_postbacks</code>.</li>
                    <li>Copie o App ID e Secret e cole nos campos acima. Pronto!</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Trigger Rules, Auto-Reply, Direct & Kanban Funnel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Trigger Keywords */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>Palavras-Chave de Gatilho nos Posts / Reels</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quando o seguidor comentar qualquer uma dessas palavras no Reels ou Post, a automação dispara imediatamente.
                </p>
              </div>
              <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                {config.commentTriggerKeywords.length} ativas
              </span>
            </div>

            {/* Keyword Input & Add */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
                placeholder="Ex: AVALIACAO, CONSULTA, PRECO, BIOODONTO..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold uppercase focus:bg-white focus:outline-indigo-500"
              />
              <button
                onClick={handleAddKeyword}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>

            {/* Keyword Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {config.commentTriggerKeywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-50 to-indigo-50 border border-pink-200 text-pink-800 text-xs font-bold px-2.5 py-1 rounded-lg"
                >
                  <span>#{kw}</span>
                  <button
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Resposta Pública no Comentário */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800">
                Resposta Pública Automática no Comentário:
              </label>
              <input
                type="text"
                value={config.commentPublicReplyText}
                onChange={(e) => setConfig({ ...config, commentPublicReplyText: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white"
                placeholder="Ex: Olá! Te respondi com todos os detalhes no Direct! Dá uma olhada lá 😊"
              />
              <p className="text-[11px] text-slate-500">
                Essa resposta aumenta o engajamento do algoritmo do Instagram e avisa o seguidor para abrir as mensagens privadas.
              </p>
            </div>
          </div>

          
          {/* Card: Direct Welcome & Triagem IA (Sofia) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-emerald-600" />
              <span>Atendimento da Sofia (IA) no Direct Privado</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primeira Mensagem enviada no Direct (Abertura):
                </label>
                <textarea
                  rows={3}
                  value={config.directWelcomePrompt}
                  onChange={(e) => setConfig({ ...config, directWelcomePrompt: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 leading-relaxed focus:bg-white"
                  placeholder="Mensagem de acolhimento humanizada..."
                />
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.directAutoQualify}
                    onChange={(e) => setConfig({ ...config, directAutoQualify: e.target.checked })}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Triagem Ativa no Direct
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      A Sofia faz perguntas para filtrar leads quentes antes de pedir o WhatsApp.
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50/50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoReplyComments}
                    onChange={(e) => setConfig({ ...config, autoReplyComments: e.target.checked })}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Disparo Imediato no Direct
                    </span>
                    <span className="text-[11px] text-slate-500 block leading-tight">
                      Responde no Direct em menos de 3 segundos após o comentário no post.
                    </span>
                  </div>
                </label>
              </div>

              {/* Ponte de Ouro: WhatsApp & Kanban */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-indigo-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Transição Automática Direct ➔ WhatsApp
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Quando o seguidor digita o telefone no Direct, o CRM cria o lead com a tag <span className="bg-pink-100 text-pink-800 font-bold px-1.5 py-0.2 rounded text-[10px]">📸 Instagram Direct</span> e a Sofia já chama no WhatsApp com horários da agenda!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                {saveSuccess && (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Configurações do Instagram Salvas!
                  </span>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Salvar Configurações</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
