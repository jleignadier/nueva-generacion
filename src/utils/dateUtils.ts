/**
 * Centralized date formatting utilities
 * Consistent dd/mm/yyyy format across the application
 */

export const formatDate = (dateString: string): string => {
  // Parse YYYY-MM-DD string directly to avoid timezone conversion
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const formatDateForDisplay = (dateString: string): string => {
  return formatDate(dateString);
};

export const formatEventTime = (startTime: string, endTime?: string): string => {
  const formatTimeString = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };
  
  if (!endTime) return formatTimeString(startTime);
  return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
};

export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Local timezone YYYY-MM-DD
};

export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const isTimeInRange = (currentTime: string, startTime: string, endTime?: string): boolean => {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(startTime);
  
  // If no end time, assume 3 hours duration
  const defaultEndMinutes = timeToMinutes(startTime) + (3 * 60);
  const end = endTime ? timeToMinutes(endTime) : defaultEndMinutes;
  
  return current >= start && current <= end;
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};