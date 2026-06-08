import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const personalProfileApi = {
  ...createResourceApi(API_PATHS.personalProfiles),
  me: () => apiClient(`${API_PATHS.personalProfiles}/me`),
  updateMe: (body) => apiClient(`${API_PATHS.personalProfiles}/me`, { method: 'PUT', body }),
};
