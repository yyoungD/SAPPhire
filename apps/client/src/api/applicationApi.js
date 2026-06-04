import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const applicationApi = createResourceApi(API_PATHS.applications);
