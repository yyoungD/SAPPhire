import { API_BASE_URL } from '../constanjs/apiPaths.js';

export function resolveMediaUrl(url = '') {
  const value = String(url || '').trim();
  if (!value) return '';
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  if (!value.startsWith('/')) return value;
  return `${API_BASE_URL}${value}`;
}
