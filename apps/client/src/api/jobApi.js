import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const jobApi = {
  ...createResourceApi(API_PATHS.jobs),
  myCompanyJobs: () => apiClient(`${API_PATHS.jobs}/me`),
  myCompanyJobDetail: (id) => apiClient(`${API_PATHS.jobs}/me/${id}`),
};
