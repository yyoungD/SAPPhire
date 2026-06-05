import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, clearAdminSession, setAdminSession } from './apiClient.js';

export const adminAuthApi = {
  login: async ({ email, password }) => {
    const data = await apiClient(API_PATHS.adminAuth.login, {
      method: 'POST',
      body: { email, password },
    });
    setAdminSession(data);
    return data;
  },

  logout: async () => {
    try {
      await apiClient(API_PATHS.adminAuth.logout, {
        method: 'POST',
      });
    } finally {
      clearAdminSession();
    }
  },
};
