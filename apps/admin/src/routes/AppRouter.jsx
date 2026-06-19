import { useEffect, useMemo, useState } from 'react';
import { adminAuthApi } from '../api/adminAuthApi.js';
import { readAdminUser } from '../api/apiClient.js';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import { ROUTES } from '../constanjs/routes.js';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';
import AdminCompanyDetailPage from '../pages/companies/AdminCompanyDetailPage.jsx';
import AdminCompanyManagePage from '../pages/companies/AdminCompanyManagePage.jsx';
import AdminJobManagePage from '../pages/jobs/AdminJobManagePage.jsx';
import AdminResumeManagePage from '../pages/resumes/AdminResumeManagePage.jsx';
import AdminUserDetailPage from '../pages/users/AdminUserDetailPage.jsx';
import AdminUserEditPage from '../pages/users/AdminUserEditPage.jsx';
import AdminUserManagePage from '../pages/users/AdminUserManagePage.jsx';

function replaceRoute(path) {
  window.history.replaceState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function AppRouter() {
  const [path, setPath] = useState(window.location.pathname);
  const [user, setUser] = useState(readAdminUser);

  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);

  useEffect(() => {
    if (!user && path !== ROUTES.ADMIN_LOGIN) {
      replaceRoute(ROUTES.ADMIN_LOGIN);
    }
  }, [path, user]);

  const login = (nextUser) => {
    setUser(nextUser);
    replaceRoute(ROUTES.ADMIN_DASHBOARD);
  };

  const logout = async () => {
    try {
      await adminAuthApi.logout();
    } catch (error) {
      console.error('Admin logout API request failed.', error);
    } finally {
      setUser(null);
      replaceRoute(ROUTES.ADMIN_LOGIN);
    }
  };

  const routes = useMemo(
    () => ({
      [ROUTES.ADMIN_DASHBOARD]: <AdminDashboardPage />,
      [ROUTES.ADMIN_USERS]: <AdminUserManagePage />,
      [ROUTES.ADMIN_USER_DETAIL]: <AdminUserDetailPage />,
      [ROUTES.ADMIN_USER_EDIT]: <AdminUserEditPage />,
      [ROUTES.ADMIN_COMPANIES]: <AdminCompanyManagePage />,
      [ROUTES.ADMIN_COMPANY_DETAIL]: <AdminCompanyDetailPage />,
      [ROUTES.ADMIN_JOBS]: <AdminJobManagePage />,
      [ROUTES.ADMIN_APPLICATIONS]: <AdminResumeManagePage />,
    }),
    []
  );

  if (path === ROUTES.ADMIN_LOGIN) {
    return <AdminLoginPage onLogin={login} />;
  }

  return (
    <AdminLayout user={user} onLogout={logout} currentPath={path}>
      {routes[path] || routes[ROUTES.ADMIN_DASHBOARD]}
    </AdminLayout>
  );
}
