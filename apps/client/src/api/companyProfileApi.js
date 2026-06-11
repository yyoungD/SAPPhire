import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const companyProfileApi = {
  ...createResourceApi(API_PATHS.companyProfiles),
  me: () => apiClient(`${API_PATHS.companyProfiles}/me`),
  updateMe: ({ logoImage, removeLogo = false, logoUrl, logoPreviewUrl, ...body }) => {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });
    formData.append('removeLogo', String(removeLogo));
    if (logoImage) formData.append('logoImage', logoImage);
    return apiClient(`${API_PATHS.companyProfiles}/me`, { method: 'PUT', body: formData });
  },
};
