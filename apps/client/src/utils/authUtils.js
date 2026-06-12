import { ROUTES } from '../constanjs/routes.js';

export function navigate(path) {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  if (!String(path).includes('#')) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
}

export function roleHome(role) {
  if (role === 'COMPANY') return ROUTES.COMPANY_MY_PAGE;
  if (role === 'PERSONAL') return ROUTES.JOBS;
  return ROUTES.LOGIN;
}
