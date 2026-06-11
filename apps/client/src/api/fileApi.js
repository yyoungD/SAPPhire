import { API_PATHS } from '../constanjs/apiPaths.js';
import { API_BASE_URL } from '../constanjs/apiPaths.js';
import { apiClient, createResourceApi, getAccessToken } from './apiClient.js';

function getFileNameFromDisposition(disposition) {
  const encodedMatch = disposition?.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) return decodeURIComponent(encodedMatch[1]);

  const match = disposition?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || '';
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName || 'download';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

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
  download: async (fileId, fileName = '') => {
    const headers = new Headers();
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(`${API_BASE_URL}${API_PATHS.files}/${fileId}/download`, { headers });
    if (!response.ok) {
      throw new Error('파일 다운로드에 실패했습니다.');
    }

    const blob = await response.blob();
    const resolvedFileName =
      getFileNameFromDisposition(response.headers.get('Content-Disposition')) || fileName;
    triggerDownload(blob, resolvedFileName);
  },
};
