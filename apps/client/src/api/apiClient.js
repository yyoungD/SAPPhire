import { API_BASE_URL } from '../constanjs/apiPaths.js';

const ACCESS_TOKEN_KEY = 'sapphire.accessToken';
const REFRESH_TOKEN_KEY = 'sapphire.refreshToken';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function reissueTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const response = await fetch(`${API_BASE_URL}/api/v1/auth/reissue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) return null;

  const data = payload?.data ?? payload;
  setTokens(data);
  return data?.accessToken;
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
  let response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });

  if (response.status === 401 && path !== '/api/v1/auth/reissue') {
    const newAccessToken = await reissueTokens();
    if (newAccessToken) {
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers, body });
    }
  }

  const payload = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error?.message || response.statusText || 'API 요청에 실패했습니다.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload?.data ?? payload;
}

export function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export function createResourceApi(basePath) {
  return {
    list: (params = {}) => apiClient(`${basePath}${toQuery(params)}`),
    detail: (id) => apiClient(`${basePath}/${id}`),
    create: (body) => apiClient(basePath, { method: 'POST', body }),
    update: (id, body) => apiClient(`${basePath}/${id}`, { method: 'PUT', body }),
    remove: (id) => apiClient(`${basePath}/${id}`, { method: 'DELETE' }),
  };
}
