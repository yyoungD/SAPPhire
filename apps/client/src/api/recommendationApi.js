import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, toQuery } from './apiClient.js';

export const recommendationApi = {
  jobs: ({ resumeId, limit = 20 } = {}) => apiClient(`${API_PATHS.recommendations}/jobs${toQuery({ resumeId, limit })}`),
  candidates: ({ jobPostId, limit = 20 } = {}) =>
    apiClient(`${API_PATHS.recommendations}/candidates${toQuery({ jobPostId, limit })}`),
};
