import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const userApi = createResourceApi(API_PATHS.users);
