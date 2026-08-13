import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

function toDate(value) {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
}

export function formatDate(value, pattern = 'MMM d, yyyy') {
  const d = toDate(value);
  return d ? format(d, pattern) : '';
}

export function formatDateTime(value) {
  const d = toDate(value);
  return d ? format(d, 'MMM d, yyyy · h:mm a') : '';
}

export function formatTimeRange(startTime, endTime) {
  if (!startTime) return '';
  return endTime ? `${startTime} – ${endTime}` : startTime;
}

export function timeAgo(value) {
  const d = toDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true }) : '';
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}
