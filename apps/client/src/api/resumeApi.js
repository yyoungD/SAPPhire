import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const resumeApi = {
  ...createResourceApi(API_PATHS.resumes),
  analyze: (id) => apiClient(`${API_PATHS.resumes}/${id}/analysis`, { method: 'POST' }),
  publicList: (params = {}) => apiClient(`${API_PATHS.resumes}/public${new URLSearchParams(params).toString() ? `?${new URLSearchParams(params)}` : ''}`),
  publicDetail: (id) => apiClient(`${API_PATHS.resumes}/public/${id}`),
};
