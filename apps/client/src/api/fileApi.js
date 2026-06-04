import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi } from './apiClient.js';

export const fileApi = {
  ...createResourceApi(API_PATHS.files),
  uploadResume: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'RESUME');
    return apiClient(API_PATHS.files, { method: 'POST', body: formData });
  },
  uploadAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'ATTACHMENT');
    return apiClient(API_PATHS.files, { method: 'POST', body: formData });
  },
};
