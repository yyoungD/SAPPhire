import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const personalProfileApi = createResourceApi(API_PATHS.personalProfiles);
