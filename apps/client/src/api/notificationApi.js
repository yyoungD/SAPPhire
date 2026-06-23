import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient } from './apiClient.js';

const basePath = API_PATHS.notifications;

export const notificationApi = {
  list: () => apiClient(basePath),
  unreadCount: () => apiClient(`${basePath}/unread-count`),
  markRead: (id) => apiClient(`${basePath}/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => apiClient(`${basePath}/read-all`, { method: 'PATCH' }),
};
