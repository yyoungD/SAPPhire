import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const jobApi = {
  ...createResourceApi(API_PATHS.jobs),
  myCompanyJobs: () => apiClient(`${API_PATHS.jobs}/me`),
  myCompanyJobSummary: () => apiClient(`${API_PATHS.jobs}/me/summary`),
  myCompanyJobDetail: (id) => apiClient(`${API_PATHS.jobs}/me/${id}`),
  updateMyCompanyJob: (id, body) => apiClient(`${API_PATHS.jobs}/me/${id}`, { method: 'PUT', body }),
  updateMyCompanyJobStatus: (id, status) => apiClient(`${API_PATHS.jobs}/me/${id}/status`, { method: 'PATCH', body: { status } }),
  deleteMyCompanyJob: (id) => apiClient(`${API_PATHS.jobs}/me/${id}`, { method: 'DELETE' }),
  bookmarks: () => apiClient(`${API_PATHS.jobs}/bookmarks`),
  isBookmarked: (id) => apiClient(`${API_PATHS.jobs}/bookmarks/${id}`),
  addBookmark: (id) => apiClient(`${API_PATHS.jobs}/${id}/bookmark`, { method: 'POST' }),
  removeBookmark: (id) => apiClient(`${API_PATHS.jobs}/${id}/bookmark`, { method: 'DELETE' }),
};
