import { API_PATHS } from '../constanjs/apiPaths.js';
import { createResourceApi } from './apiClient.js';

export const positionOfferApi = createResourceApi(API_PATHS.positionOffers);
