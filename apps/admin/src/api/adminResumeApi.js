import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient } from './apiClient.js';

export const adminResumeApi = {
  list: () => apiClient(API_PATHS.adminResumes),
};
