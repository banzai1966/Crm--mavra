export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{ email: string; displayName?: string }>;
  htmlLink?: string;
  location?: string;
}

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  primary?: boolean;
  timeZone?: string;
}

/**
 * Lista os calendários disponíveis na conta Google do usuário
 */
export async function listUserCalendars(accessToken: string): Promise<GoogleCalendarItem[]> {
  const res = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Falha ao listar agendas: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return (data.items || []).map((cal: any) => ({
    id: cal.id,
    summary: cal.summary,
    primary: cal.primary || false,
    timeZone: cal.timeZone,
  }));
}

/**
 * Lista eventos de um calendário em um intervalo de datas
 */
export async function listCalendarEvents(
  accessToken: string,
  calendarId: string = 'primary',
  timeMin?: string,
  timeMax?: string
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  if (timeMin) params.set('timeMin', timeMin);
  if (timeMax) params.set('timeMax', timeMax);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao buscar eventos: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  return (data.items || []).map((item: any) => ({
    id: item.id,
    summary: item.summary || '(Sem título)',
    description: item.description,
    start: item.start,
    end: item.end,
    attendees: item.attendees,
    htmlLink: item.htmlLink,
    location: item.location,
  }));
}

/**
 * Cria um novo evento/agendamento no Google Calendar com confirmação do usuário
 */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string = 'primary',
  event: {
    summary: string;
    description?: string;
    startIso: string;
    endIso: string;
    attendeeEmail?: string;
    location?: string;
    timeZone?: string;
  }
): Promise<CalendarEvent> {
  const userTimeZone =
    event.timeZone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone ||
    'America/Sao_Paulo';

  const payload = {
    summary: event.summary,
    description: event.description,
    start: {
      dateTime: event.startIso,
      timeZone: userTimeZone,
    },
    end: {
      dateTime: event.endIso,
      timeZone: userTimeZone,
    },
    location: event.location,
    attendees: event.attendeeEmail ? [{ email: event.attendeeEmail }] : undefined,
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao agendar no Google Calendar: ${res.status} ${errorText}`);
  }

  return await res.json();
}

/**
 * Deleta um evento do calendário (Destrutivo: Exige confirmação prévia no UI)
 */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string = 'primary',
  eventId: string
): Promise<void> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok && res.status !== 204) {
    const errorText = await res.text();
    throw new Error(`Erro ao excluir agendamento: ${res.status} ${errorText}`);
  }
}
