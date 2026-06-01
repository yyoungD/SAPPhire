import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const aiApi = createResourceApi(API_PATHS.ai);
