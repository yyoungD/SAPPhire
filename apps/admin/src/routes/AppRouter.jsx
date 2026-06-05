import { useEffect, useMemo, useState } from 'react';
import { adminAuthApi } from '../api/adminAuthApi.js';
import { readAdminUser } from '../api/apiClient.js';
import { ROUTES } from '../constanjs/routes.js';
import AdminDashboardPage from '../pages/AdminDashboardPage.jsx';
import AdminLoginPage from '../pages/AdminLoginPage.jsx';

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
      [ROUTES.ADMIN_LOGIN]: <AdminLoginPage onLogin={login} />,
      [ROUTES.ADMIN_DASHBOARD]: <AdminDashboardPage user={user} onLogout={logout} />,
    }),
    [user],
  );

  return routes[path] || routes[ROUTES.ADMIN_DASHBOARD];
}
