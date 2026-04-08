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
    return value.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  if (isPlaceholder(value)) return '—';
  const s = String(value).trim();
  const datePart = s.split(/[ T]/)[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) {
    const d = new Date(s.replace(' ', 'T'));
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(day)) return s;
  const d = new Date(y, m - 1, day);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}