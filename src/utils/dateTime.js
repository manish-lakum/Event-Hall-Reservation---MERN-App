/**
 * Centralized Date & Time Formatting Utilities for IST (Asia/Kolkata, UTC+05:30)
 */

const dateTimeISTFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

const dateISTFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const timeISTFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true
});

/**
 * Formats a UTC timestamp string or Date object into human-readable IST Date & Time.
 * Example: '2026-08-30T07:02:00.000Z' -> '30/08/2026, 12:32 PM'
 */
export const formatDateTimeIST = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '-';
    return dateTimeISTFormatter.format(d);
  } catch {
    return '-';
  }
};

/**
 * Formats a UTC timestamp into IST Date string (DD/MM/YYYY).
 */
export const formatDateIST = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '-';
    return dateISTFormatter.format(d);
  } catch {
    return '-';
  }
};

/**
 * Formats a UTC timestamp into IST Time string (HH:MM AM/PM).
 */
export const formatTimeIST = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return '-';
    return timeISTFormatter.format(d);
  } catch {
    return '-';
  }
};

/**
 * Formats 24-hr local time string (e.g. "14:00") into 12-hr format ("02:00 PM")
 * WITHOUT timezone shift, preserving local event schedule times.
 */
export const format12HourTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return timeStr || '-';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};
