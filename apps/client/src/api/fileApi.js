import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const fileApi = createResourceApi(API_PATHS.files);
