import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const jobApi = {
  ...createResourceApi(API_PATHS.jobs),
  myCompanyJobs: () => apiClient(`${API_PATHS.jobs}/me`),
  myCompanyJobDetail: (id) => apiClient(`${API_PATHS.jobs}/me/${id}`),
  updateMyCompanyJob: (id, body) => apiClient(`${API_PATHS.jobs}/me/${id}`, { method: 'PUT', body }),
  updateMyCompanyJobStatus: (id, status) => apiClient(`${API_PATHS.jobs}/me/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteMyCompanyJob: (id) => apiClient(`${API_PATHS.jobs}/me/${id}`, { method: 'DELETE' }),
};
