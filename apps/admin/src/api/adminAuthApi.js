import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, clearAdminSession, setAdminSession } from './apiClient.js';

export const adminAuthApi = {
  login: async ({ loginId, password }) => {
    const data = await apiClient(API_PATHS.adminAuth.login, {
      method: 'POST',
      body: { loginId, password },
    });
    setAdminSession(data);
    return data;
  },

  logout: () => {
    clearAdminSession();
  },
};
