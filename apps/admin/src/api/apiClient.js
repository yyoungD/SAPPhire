import { API_BASE_URL } from '../constanjs/apiPaths.js';

const ACCESS_TOKEN_KEY = 'sapphire.admin.accessToken';
const REFRESH_TOKEN_KEY = 'sapphire.admin.refreshToken';
const USER_KEY = 'sapphire.admin.user';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAdminSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function readAdminUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiClient(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const body = isFormData || typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });
  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error?.message || response.statusText || 'API 요청에 실패했습니다.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload?.data ?? payload;
}
