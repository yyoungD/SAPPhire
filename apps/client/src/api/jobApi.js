import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const jobApi = createResourceApi(API_PATHS.jobs);
