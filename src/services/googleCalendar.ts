import { BlockedPeriod } from '../types/crm';

interface GoogleCalendarEvent {
    id: string;
    summary: string;
    start: {
        dateTime?: string;
        date?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
    };
    status: string;
}

export const googleCalendarService = {
    async listEvents(accessToken: string, timeMin: string, timeMax: string): Promise<BlockedPeriod[]> {
        try {
            console.log('📡 Calling Google Calendar API:', `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}`);

            const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('📡 API Response Status:', response.status);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('❌ Google API Error Body:', errorBody);
                throw new Error(`Failed to fetch Google Calendar events: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const events: GoogleCalendarEvent[] = data.items || [];

            // Map Google Events to BlockedPeriod format for display
            return events
                .filter(event => event.status !== 'cancelled')
                .map(event => {
                    const isAllDay = !!event.start.date;
                    const startDate = event.start.dateTime || event.start.date || '';
                    const endDate = event.end.dateTime || event.end.date || '';

                    return {
                        id: `google-${event.id}`,
                        startDate: startDate.split('T')[0],
                        endDate: endDate.split('T')[0],
                        reason: `📅 ${event.summary || 'Evento de Google'}`,
                        type: isAllDay ? 'full_day' : 'time_range',
                        startTime: isAllDay ? undefined : startDate.split('T')[1]?.substring(0, 5),
                        endTime: isAllDay ? undefined : endDate.split('T')[1]?.substring(0, 5),
                        createdBy: 'google-calendar',
                        createdAt: new Date().toISOString(),
                    } as BlockedPeriod;
                });
        } catch (error) {
            console.error('Error fetching Google Calendar events:', error);
            return [];
        }
    }
};
