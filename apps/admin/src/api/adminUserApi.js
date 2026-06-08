import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient } from './apiClient.js';

export const adminUserApi = {
  list: () => apiClient(API_PATHS.adminUsers),
};
