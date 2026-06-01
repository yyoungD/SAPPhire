import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, clearTokens, getRefreshToken, setTokens } from './apiClient.js';

export const authApi = {
  signup: ({ email, password, name, phone = '', role, consents = [] }) =>
    apiClient(API_PATHS.auth.signup, {
      method: 'POST',
      body: { email, password, name, phone, role, consents },
    }),

  login: async ({ email, password }) => {
    const data = await apiClient(API_PATHS.auth.login, {
      method: 'POST',
      body: { email, password },
    });
    setTokens(data);
    return data;
  },

  logout: async () => {
    try {
      await apiClient(API_PATHS.auth.logout, { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  reissue: async (refreshToken = getRefreshToken()) => {
    const data = await apiClient(API_PATHS.auth.reissue, {
      method: 'POST',
      body: { refreshToken },
    });
    setTokens(data);
    return data;
  },
};
