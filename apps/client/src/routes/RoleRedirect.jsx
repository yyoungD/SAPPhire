import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { navigate, roleHome } from '../utils/authUtils.js';

export default function RoleRedirect() {
  const { user } = useAuth();

  useEffect(() => {
    navigate(roleHome(user?.role));
  }, [user]);

  return null;
}
