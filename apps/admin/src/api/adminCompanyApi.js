import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient } from './apiClient.js';

export const adminCompanyApi = {
  list: () => apiClient(API_PATHS.adminCompanies),
  detail: (id) => apiClient(`${API_PATHS.adminCompanies}/${id}`),
  createMemo: (id, content) =>
    apiClient(`${API_PATHS.adminCompanies}/${id}/memos`, {
      method: 'POST',
      body: { content },
    }),
};
