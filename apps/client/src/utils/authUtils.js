import { ROUTES } from '../constanjs/routes.js';

export function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function roleHome(role) {
  if (role === 'ADMIN') return ROUTES.ADMIN_DASHBOARD;
  if (role === 'COMPANY') return ROUTES.COMPANY_MY_PAGE;
  return ROUTES.USER_MY_PAGE;
}
