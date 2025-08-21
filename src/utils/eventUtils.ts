import { isSameDay, parseISO, isBefore, isAfter } from 'date-fns';

export interface EventRegistrationStatus {
  isRegistered: boolean;
  hasAttended: boolean;
  canScanQR: boolean;
  canRegister: boolean;
  isEventPast: boolean;
}

/**
 * Check if current date matches the event date
 */
export const isEventToday = (eventDate: string): boolean => {
  try {
    return isSameDay(new Date(), parseISO(eventDate));
  } catch {
    return false;
  }
};

/**
 * Check if the event date is in the future
 */
export const isEventUpcoming = (eventDate: string): boolean => {
  try {
    return isAfter(parseISO(eventDate), new Date());
  } catch {
    return false;
  }
};

/**
 * Check if the event date is in the past
 */
export const isEventPast = (eventDate: string): boolean => {
  try {
    return isBefore(parseISO(eventDate), new Date());
  } catch {
    return false;
  }
};

/**
 * Get comprehensive registration status for an event
 */
export const getEventRegistrationStatus = (eventId: string, eventDate: string): EventRegistrationStatus => {
  const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
  const attendedEvents = JSON.parse(localStorage.getItem('attendedEvents') || '[]');
  
  const isRegistered = registeredEvents.includes(eventId);
  const hasAttended = attendedEvents.includes(eventId);
  const canScanQR = isEventToday(eventDate) && !hasAttended;
  const canRegister = isEventUpcoming(eventDate) && !isRegistered;
  const eventIsPast = isEventPast(eventDate) && !isEventToday(eventDate);

  return {
    isRegistered,
    hasAttended,
    canScanQR,
    canRegister,
    isEventPast: eventIsPast
  };
};

/**
 * Register for an event (advance registration for calendar reminder)
 */
export const registerForEvent = (eventId: string): void => {
  const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
  if (!registeredEvents.includes(eventId)) {
    registeredEvents.push(eventId);
    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
  }
};

/**
 * Mark attendance for an event (QR scan successful)
 */
export const markEventAttended = (eventId: string): void => {
  const attendedEvents = JSON.parse(localStorage.getItem('attendedEvents') || '[]');
  if (!attendedEvents.includes(eventId)) {
    attendedEvents.push(eventId);
    localStorage.setItem('attendedEvents', JSON.stringify(attendedEvents));
  }
};

/**
 * Generate calendar file content (.ics format)
 */
export const generateCalendarFile = (event: {
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  description: string;
}): string => {
  const startDate = parseISO(`${event.date}T${event.time}:00`);
  const endDate = event.endTime 
    ? parseISO(`${event.date}T${event.endTime}:00`)
    : new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours if no end time

  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Nueva Generacion//Event Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.title.replace(/\s+/g, '-').toLowerCase()}-${event.date}@nuevageneracion.org`,
    `DTSTART:${formatDateForICS(startDate)}`,
    `DTEND:${formatDateForICS(endDate)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'DESCRIPTION:Event reminder',
    'ACTION:DISPLAY',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  return icsContent;
};

/**
 * Download calendar file
 */
export const downloadCalendarFile = (event: {
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  description: string;
}): void => {
  const icsContent = generateCalendarFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};