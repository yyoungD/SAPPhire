import { useMemo, useState } from 'react';
import { authApi } from '../api/authApi.js';
import { clearTokens, getAccessToken, getRefreshToken } from '../api/apiClient.js';
import { AuthContext } from './authContextCore.js';

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('sapphire.user'));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const value = useMemo(
    () => ({
      user,
      bootstrapped: true,
      isAuthenticated: Boolean(getAccessToken() && user),
      login: async (credentials) => {
        const data = await authApi.login(credentials);
        setUser(data.user);
        localStorage.setItem('sapphire.user', JSON.stringify(data.user));
        return data;
      },
      completeOAuthLogin: (data) => {
        authApi.completeOAuthLogin(data);
        setUser(data.user);
        localStorage.setItem('sapphire.user', JSON.stringify(data.user));
        return data;
      },
      updateUser: (nextUser) => {
        setUser(nextUser);
        localStorage.setItem('sapphire.user', JSON.stringify(nextUser));
        return nextUser;
      },
      signup: authApi.signup,
      logout: async () => {
        await authApi.logout();
        localStorage.removeItem('sapphire.user');
        setUser(null);
      },
      refresh: () => authApi.reissue(getRefreshToken()),
      clearSession: () => {
        clearTokens();
        localStorage.removeItem('sapphire.user');
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
