import { parseISO } from 'date-fns';
import { getTodayString, getCurrentTime, isTimeInRange } from './dateUtils';

export interface EventRegistrationStatus {
  isRegistered: boolean;
  hasAttended: boolean;
  canScanQR: boolean;
  canRegister: boolean;
  isEventPast: boolean;
}

/**
 * Date-based event status functions (using string comparison)
 */
export const getEventStatus = (eventDate: string): 'upcoming' | 'today' | 'completed' => {
  const today = getTodayString(); // Get YYYY-MM-DD format
  
  if (eventDate === today) {
    return 'today';
  } else if (eventDate > today) {
    return 'upcoming';
  } else {
    return 'completed';
  }
};

export const isEventCompleted = (eventDate: string): boolean => {
  return getEventStatus(eventDate) === 'completed';
};

export const isEventUpcomingOrToday = (eventDate: string): boolean => {
  const status = getEventStatus(eventDate);
  return status === 'upcoming' || status === 'today';
};

/**
 * Check if current date matches the event date (using string comparison)
 */
export const isEventToday = (eventDate: string): boolean => {
  try {
    return eventDate === getTodayString();
  } catch {
    return false;
  }
};

/**
 * Check if the event date is in the future (using string comparison)
 */
export const isEventUpcoming = (eventDate: string): boolean => {
  try {
    return eventDate > getTodayString();
  } catch {
    return false;
  }
};

/**
 * Check if the event date is in the past (using string comparison)
 * Events are considered past only after the day has ended (not during the same day)
 */
export const isEventPast = (eventDate: string): boolean => {
  try {
    return eventDate < getTodayString(); // Only past if before today (not including today)
  } catch {
    return false;
  }
};

/**
 * Check if QR scanning is available based on current time and event time
 */
export const canScanQRAtCurrentTime = (
  eventId: string, 
  eventDate: string, 
  eventStartTime: string, 
  eventEndTime?: string
): boolean => {
  const attendedEvents = JSON.parse(localStorage.getItem('attendedEvents') || '[]');
  const hasAttended = attendedEvents.includes(eventId);
  
  // Must be today and user hasn't attended yet
  if (!isEventToday(eventDate) || hasAttended) {
    return false;
  }
  
  const currentTime = getCurrentTime();
  return isTimeInRange(currentTime, eventStartTime, eventEndTime);
};

/**
 * Get comprehensive registration status for an event
 */
export const getEventRegistrationStatus = (
  eventId: string, 
  eventDate: string, 
  eventStartTime?: string, 
  eventEndTime?: string
): EventRegistrationStatus => {
  const registeredEvents = JSON.parse(localStorage.getItem('registeredEvents') || '[]');
  const attendedEvents = JSON.parse(localStorage.getItem('attendedEvents') || '[]');
  
  const isRegistered = registeredEvents.includes(eventId);
  const hasAttended = attendedEvents.includes(eventId);
  const canScanQR = eventStartTime ? canScanQRAtCurrentTime(eventId, eventDate, eventStartTime, eventEndTime) : false;
  const canRegister = isEventUpcomingOrToday(eventDate) && !isRegistered;
  const eventIsPast = isEventPast(eventDate);

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