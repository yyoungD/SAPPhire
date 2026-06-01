import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const companyProfileApi = createResourceApi(API_PATHS.companyProfiles);
