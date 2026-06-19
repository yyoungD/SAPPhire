import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient } from './apiClient.js';

export const adminJobApi = {
  list: () => apiClient(API_PATHS.adminJobs),
};
