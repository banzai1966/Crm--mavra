import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  MapPin,
  CalendarCheck,
  CalendarRange,
  Settings,
  Sparkles,
} from 'lucide-react';
import { AppointmentSlot, Lead, AgentConfig } from '../types';
import {
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  initAuth,
} from '../lib/googleAuth';
import {
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent,
} from '../lib/googleCalendar';

interface CalendarIntegrationProps {
  agentConfig: AgentConfig;
  leads: Lead[];
  onUpdateAgentConfig: (updated: Partial<AgentConfig>) => void;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  agentConfig,
  leads,
  onUpdateAgentConfig,
}) => {
  // Google Auth state
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(
    agentConfig.calendarConnectedEmail || null
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Appointments state
  const [appointments, setAppointments] = useState<AppointmentSlot[]>([]);
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // New Appointment Modal Form State
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [formSummary, setFormSummary] = useState(agentConfig.calendarDefaultTitle || 'Consulta de Avaliação Integrativa');
  const [formDate, setFormDate] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [formTime, setFormTime] = useState<string>('14:00');
  const [formDuration, setFormDuration] = useState<number>(agentConfig.calendarDefaultDurationMinutes || 45);
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState(agentConfig.calendarDefaultLocation || '');
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);

  // Destructive Delete Confirmation Modal
  const [eventToDelete, setEventToDelete] = useState<{
    id: string;
    summary: string;
    googleEventId?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Settings state
  const [calendarEnabled, setCalendarEnabled] = useState(agentConfig.calendarEnabled ?? true);
  const [allowAiBooking, setAllowAiBooking] = useState(agentConfig.calendarAllowAiBooking ?? true);
  const [defaultDuration, setDefaultDuration] = useState(agentConfig.calendarDefaultDurationMinutes || 45);
  const [defaultTitle, setDefaultTitle] = useState(agentConfig.calendarDefaultTitle || 'Consulta de Avaliação Integrativa');
  const [defaultLocation, setDefaultLocation] = useState(agentConfig.calendarDefaultLocation || '');
  const [showInMenu, setShowInMenu] = useState(agentConfig.showCalendarModuleInMenu ?? true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Load appointments from backend
  const loadAppointments = async () => {
    try {
      const res = await fetch('/api/appointments');
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    }
  };

  // Load Google Calendar events when token is ready
  const loadGoogleCalendarEvents = async () => {
    const token = await getAccessToken();
    if (!token) return;

    setIsLoadingEvents(true);
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const events = await listCalendarEvents(token, 'primary', startOfDay.toISOString());
      setGoogleEvents(events);
    } catch (err: any) {
      console.error('Falha ao listar eventos do Google Calendar:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadAppointments();
    initAuth(
      (user) => {
        if (user.email) {
          setGoogleUserEmail(user.email);
          loadGoogleCalendarEvents();
        }
      },
      () => {
        // Not authenticated
      }
    );
  }, []);

  // Handle Google Sign In
  const handleConnectGoogle = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res && res.user.email) {
        setGoogleUserEmail(res.user.email);
        onUpdateAgentConfig({
          calendarConnectedEmail: res.user.email,
          calendarEnabled: true,
        });
        await loadGoogleCalendarEvents();
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Falha ao autorizar Google Calendar. Verifique o pop-up.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await logoutGoogle();
    setGoogleUserEmail(null);
    setGoogleEvents([]);
    onUpdateAgentConfig({
      calendarConnectedEmail: '',
    });
  };

  // Create Appointment (Local CRM + Google Calendar if connected)
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAppointment(true);
    try {
      const startDateTime = new Date(`${formDate}T${formTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + formDuration * 60 * 1000);

      const lead = leads.find((l) => l.id === selectedLeadId);

      let googleEventId: string | undefined = undefined;
      let htmlLink: string | undefined = undefined;

      // Se o Google estiver conectado com token, sincronizar direto na nuvem
      const token = await getAccessToken();
      if (token && googleUserEmail) {
        try {
          const gEvent = await createCalendarEvent(token, 'primary', {
            summary: formSummary,
            description: `${formDescription}\n\nLead CRM: ${lead ? lead.name + ' (' + lead.phone + ')' : 'Cliente Direto'}\nAgendado via NEXA CRM Conversacional.`,
            startIso: startDateTime.toISOString(),
            endIso: endDateTime.toISOString(),
            attendeeEmail: lead?.email,
            location: formLocation,
          });
          googleEventId = gEvent.id;
          htmlLink = gEvent.htmlLink;
        } catch (gErr) {
          console.warn('Falha ao enviar para Google Calendar, salvando no CRM:', gErr);
        }
      }

      // Salvar no backend do CRM
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead?.id,
          leadName: lead?.name,
          leadPhone: lead?.phone,
          summary: formSummary,
          description: formDescription,
          startIso: startDateTime.toISOString(),
          endIso: endDateTime.toISOString(),
          googleEventId,
          htmlLink,
        }),
      });

      if (res.ok) {
        setShowNewModal(false);
        setFormDescription('');
        await loadAppointments();
        if (token) await loadGoogleCalendarEvents();
      }
    } catch (err: any) {
      alert('Erro ao salvar agendamento: ' + err.message);
    } finally {
      setIsSavingAppointment(false);
    }
  };

  // Confirm and Execute Destructive Event Deletion
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      // 1. Se tiver googleEventId e token, excluir no Google Calendar
      const token = await getAccessToken();
      if (token && eventToDelete.googleEventId) {
        try {
          await deleteCalendarEvent(token, 'primary', eventToDelete.googleEventId);
        } catch (err) {
          console.warn('Aviso ao excluir evento no Google:', err);
        }
      }

      // 2. Excluir no backend do CRM
      await fetch(`/api/appointments/${eventToDelete.id}`, { method: 'DELETE' });

      // Atualizar listas locais
      setAppointments((prev) => prev.filter((a) => a.id !== eventToDelete.id));
      if (token) await loadGoogleCalendarEvents();

      setEventToDelete(null);
    } catch (err: any) {
      alert('Erro ao excluir agendamento: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Save Settings
  const handleSaveSettings = () => {
    onUpdateAgentConfig({
      calendarEnabled,
      calendarAllowAiBooking: allowAiBooking,
      calendarDefaultDurationMinutes: defaultDuration,
      calendarDefaultTitle: defaultTitle,
      calendarDefaultLocation: defaultLocation,
      showCalendarModuleInMenu: showInMenu,
    });
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Agendamentos & Google Calendar</h1>
            <p className="text-sm text-slate-600 mt-1">
              Conecte a conta Google do seu cliente ou colega para permitir que a Inteligência Artificial agende consultas e reuniões diretamente na agenda oficial.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Google Auth Status Card & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Google Connection Card */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarRange className="w-4 h-4 text-blue-600" />
                <span>Conexão Google Agenda</span>
              </h2>
              {googleUserEmail ? (
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

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">
              O profissional ou cliente só precisa fazer login uma única vez. A IA respeita os horários ocupados e grava os compromissos com link de notificação.
            </p>

            {googleUserEmail ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 mb-4">
                <div className="text-xs text-slate-500 font-medium">Conta Google Ativa:</div>
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                  <span className="truncate">{googleUserEmail}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 flex items-center justify-between">
                  <span>Sincronização em tempo real:</span>
                  <span className="text-emerald-700 font-semibold">Ativa</span>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 space-y-2 mb-4">
                <div className="text-xs text-blue-900 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  1 Clique para Autorizar
                </div>
                <p className="text-xs text-blue-800">
                  Nenhuma configuração técnica de API é necessária. O cliente clica no botão abaixo e autoriza a agenda pessoal ou corporativa.
                </p>
              </div>
            )}

            {authError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            {googleUserEmail ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={loadGoogleCalendarEvents}
                  disabled={isLoadingEvents}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                  <span>Atualizar Eventos</span>
                </button>
                <button
                  onClick={handleDisconnectGoogle}
                  className="flex items-center justify-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                  title="Desconectar conta Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-sm rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Conectando ao Google...' : 'Conectar Google Agenda'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Module Preferences & AI Rules */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-600" />
              <span>Regras de Agendamento da Sofia (IA)</span>
            </h2>
            {saveSuccessMsg && (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                Configurações salvas!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título Padrão do Compromisso
              </label>
              <input
                type="text"
                value={defaultTitle}
                onChange={(e) => setDefaultTitle(e.target.value)}
                placeholder="Ex: Consulta de Avaliação Integrativa"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duração Padrão (Minutos)
              </label>
              <select
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                <option value={15}>15 minutos</option>
                <option value={30}>30 minutos</option>
                <option value={45}>45 minutos (Padrão)</option>
                <option value={60}>60 minutos (1 hora)</option>
                <option value={90}>90 minutos (1h 30m)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Local / Endereço Padrão (Ou link do Google Meet)
              </label>
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                placeholder="Ex: Euroville Mall - Sala 103 ou Reunião Google Meet"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              💡 A IA consulta os horários livres e reserva o intervalo exato na agenda do profissional.
            </p>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-xs transition-all cursor-pointer shrink-0"
            >
              Salvar Regras de Agendamento
            </button>
          </div>
        </div>
      </div>

      {/* Appointments List Section */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              <span>Próximos Compromissos Agendados</span>
              <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-mono">
                {appointments.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultas e reuniões vinculadas aos leads do CRM e sincronizadas com o Google Calendar.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAppointments}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Recarregar</span>
            </button>
          </div>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Nenhum compromisso marcado no momento</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Assim que a Sofia (IA) agendar com um lead no WhatsApp ou você clicar em "Novo Agendamento", as consultas aparecerão organizadas aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {appointments.map((apt) => {
              const startDate = new Date(apt.startIso);
              const formattedDate = startDate.toLocaleDateString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });
              const formattedTime = startDate.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={apt.id}
                  className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-700 shrink-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {startDate.toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black leading-none">{startDate.getDate()}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{apt.summary}</h4>
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Confirmado
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-medium text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {formattedDate} às {formattedTime}
                        </span>

                        {apt.leadName && (
                          <span className="flex items-center gap-1 text-slate-700">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            {apt.leadName}
                          </span>
                        )}

                        {apt.leadPhone && (
                          <span className="flex items-center gap-1 font-mono text-slate-600">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            {apt.leadPhone}
                          </span>
                        )}
                      </div>

                      {apt.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-1">{apt.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    {apt.htmlLink && (
                      <a
                        href={apt.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-all"
                        title="Abrir no Google Calendar"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Ver no Google</span>
                      </a>
                    )}

                    <button
                      onClick={() =>
                        setEventToDelete({
                          id: apt.id,
                          summary: apt.summary,
                          googleEventId: apt.googleEventId,
                        })
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Excluir agendamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Novo Agendamento */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span>Marcar Novo Agendamento</span>
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vincular ao Lead do CRM (Opcional)
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => {
                    setSelectedLeadId(e.target.value);
                    const lead = leads.find((l) => l.id === e.target.value);
                    if (lead) {
                      setFormSummary(`${defaultTitle} - ${lead.name}`);
                    }
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Selecionar Lead --</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título do Agendamento *
                </label>
                <input
                  type="text"
                  required
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duração (Minutos)
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={5}
                    value={formDuration}
                    onChange={(e) => setFormDuration(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Local / Sala
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Euroville Mall ou Online"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações & Anotações Clínicas / Comerciais
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Queixa principal, procedimentos de interesse ou particularidades..."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {googleUserEmail && (
                <div className="text-[11px] text-blue-700 bg-blue-50 p-2.5 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Será sincronizado diretamente no Google Agenda de: {googleUserEmail}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingAppointment}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
                >
                  {isSavingAppointment ? 'Agendando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Confirmação Explícita de Exclusão (MANDATÓRIO PARA DESTRUTIVOS) */}
      {eventToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 border-2 border-rose-100">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Confirmar Exclusão de Agendamento?
              </h3>
              <p className="text-xs text-slate-600">
                Você tem certeza que deseja cancelar e excluir o compromisso:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 mt-2">
                "{eventToDelete.summary}"
              </div>
              {eventToDelete.googleEventId && (
                <p className="text-[11px] text-rose-600 font-medium pt-1">
                  ⚠️ Esta ação também removerá o evento do Google Calendar da conta conectada.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setEventToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar (Manter)
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                {isDeleting ? 'Excluindo...' : 'Sim, Excluir Compromisso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
