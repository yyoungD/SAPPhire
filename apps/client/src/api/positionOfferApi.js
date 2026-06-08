import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient } from './apiClient.js';

const basePath = API_PATHS.positionOffers;

export const positionOfferApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.scope) query.set('scope', params.scope);
    const text = query.toString();
    return apiClient(`${basePath}${text ? `?${text}` : ''}`);
  },
  detail: (id) => apiClient(`${basePath}/${id}`),
  create: (body) => apiClient(basePath, { method: 'POST', body }),
  updateStatus: (id, status) => apiClient(`${basePath}/${id}/status`, { method: 'PATCH', body: { status } }),
};
