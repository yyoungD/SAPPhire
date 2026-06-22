import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient } from './apiClient.js';

export const adminUserApi = {
  list: () => apiClient(API_PATHS.adminUsers),
  detail: (id) => apiClient(`${API_PATHS.adminUsers}/${id}`),
  createMemo: (id, content) =>
    apiClient(`${API_PATHS.adminUsers}/${id}/memos`, {
      method: 'POST',
      body: { content },
    }),
};
