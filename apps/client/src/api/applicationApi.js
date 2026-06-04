import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const applicationApi = {
  ...createResourceApi(API_PATHS.applications),
  apply: (body) => apiClient(API_PATHS.applications, { method: 'POST', body }),
};
