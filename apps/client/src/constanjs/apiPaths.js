export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_PATHS = {
  auth: {
    signup: '/api/v1/auth/signup',
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    reissue: '/api/v1/auth/reissue',
    googleOAuth: '/oauth2/authorization/google',
  },
  users: '/api/v1/users',
  consents: '/api/v1/consents',
  personalProfiles: '/api/v1/personal-profiles',
  companyProfiles: '/api/v1/company-profiles',
  sapSkills: '/api/v1/sap-skills',
  resumes: '/api/v1/resumes',
  jobs: '/api/v1/jobs',
  applications: '/api/v1/applications',
  positionOffers: '/api/v1/position-offers',
  files: '/api/v1/files',
  ai: '/api/v1/ai',
  admin: '/api/v1/admin',
};
