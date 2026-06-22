export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_PATHS = {
  adminAuth: {
    login: '/api/v1/admin/auth/login',
    logout: '/api/v1/auth/logout',
  },
  adminUsers: '/api/v1/admin/users',
  adminCompanies: '/api/v1/admin/companies',
  adminJobs: '/api/v1/admin/jobs',
  adminResumes: '/api/v1/admin/resumes',
};
