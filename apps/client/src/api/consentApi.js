import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const consentApi = createResourceApi(API_PATHS.consents);
