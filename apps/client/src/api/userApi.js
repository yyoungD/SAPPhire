import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const userApi = {
  ...createResourceApi(API_PATHS.users),
  linkOAuthAccount: ({ provider, oauthId, email, profileImageUrl = '', language = '' }) =>
    apiClient(`${API_PATHS.users}/me/oauth-link`, {
      method: 'POST',
      body: { provider, oauthId, email, profileImageUrl, language },
    }),
  updateMe: ({ name, phone, language, profileImage, removeProfileImage = false }) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('language', language || '');
    formData.append('removeProfileImage', String(removeProfileImage));
    if (profileImage) formData.append('profileImage', profileImage);
    return apiClient(`${API_PATHS.users}/me`, { method: 'PUT', body: formData });
  },
  withdrawMe: () => apiClient(`${API_PATHS.users}/me`, { method: 'DELETE' }),
};
