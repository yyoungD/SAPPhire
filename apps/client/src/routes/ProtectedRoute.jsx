import { useAuth } from '../hooks/useAuth.js';
import ForbiddenPage from '../pages/errors/ForbiddenPage.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPage />;
  if (roles.length > 0 && !roles.includes(user?.role)) return <ForbiddenPage />;
  return children;
}
