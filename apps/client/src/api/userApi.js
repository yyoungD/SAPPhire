import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const userApi = {
  ...createResourceApi(API_PATHS.users),
  withdrawMe: () => apiClient(`${API_PATHS.users}/me`, { method: 'DELETE' }),
};
