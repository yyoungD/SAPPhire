import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const resumeApi = createResourceApi(API_PATHS.resumes);
