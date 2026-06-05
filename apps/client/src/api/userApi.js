import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const userApi = {
  ...createResourceApi(API_PATHS.users),
  linkOAuthAccount: ({ provider, oauthId, email, profileImageUrl = '', language = '' }) =>
    apiClient(`${API_PATHS.users}/me/oauth-link`, {
      method: 'POST',
      body: { provider, oauthId, email, profileImageUrl, language },
    }),
  withdrawMe: () => apiClient(`${API_PATHS.users}/me`, { method: 'DELETE' }),
};
