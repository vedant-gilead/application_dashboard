/**
 * Format on-hand inventory date strings for table display.
 * Source values look like "2021-04-26 08:59:50.000" or "--".
 */

const isPlaceholder = (value) =>
  value == null || String(value).trim() === '' || String(value).trim() === '--';

export function formatCreationDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (isPlaceholder(value)) return '—';
  const s = String(value).trim();
  const isoLike = s.includes('T') ? s : s.replace(' ', 'T');
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatLotExpirationDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (isPlaceholder(value)) return '—';
  const s = String(value).trim();
  const hasExplicitTime = /[ T]\d{1,2}:\d{2}/.test(s);
  const isoLike = s.includes('T') ? s : s.replace(' ', 'T');
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return s;
  if (!hasExplicitTime) {
    d.setHours(0, 0, 0, 0);
  }
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
