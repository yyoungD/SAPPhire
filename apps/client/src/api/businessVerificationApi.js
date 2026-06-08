import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient } from './apiClient.js';

export const businessVerificationApi = {
  verifyStatus: (businessNumber) =>
    apiClient(`${API_PATHS.businessVerifications}/status`, {
      method: 'POST',
      body: { businessNumber },
    }),
};
