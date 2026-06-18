import { API_PATHS } from '../constanjs/apiPaths.js';
import { apiClient, clearTokens, getRefreshToken, setTokens } from './apiClient.js';

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080';

const ROLE_LOGIN_MESSAGES = {
  PERSONAL: '개인회원 계정으로 로그인해 주세요.',
  COMPANY: '기업회원 계정으로 로그인해 주세요.',
};

export const authApi = {
  signup: ({
    email,
    password,
    name,
    phone = '',
    role,
    companyName = '',
    businessNumber = '',
    businessNumberVerified = false,
    consents = [],
  }) =>
    apiClient(API_PATHS.auth.signup, {
      method: 'POST',
      body: {
        email,
        password,
        name,
        phone,
        role,
        companyName,
        businessNumber,
        businessNumberVerified,
        consents,
      },
    }),

  login: async ({ email, password, expectedRole }) => {
    const data = await apiClient(API_PATHS.auth.login, {
      method: 'POST',
      body: { email, password },
    });
    const userRole = data.user?.role || data.role;
    if (expectedRole && userRole !== expectedRole) {
      throw new Error(ROLE_LOGIN_MESSAGES[expectedRole] || '선택한 회원 유형과 계정 유형이 일치하지 않습니다.');
    }
    setTokens(data);
    return data;
  },

  oauthSignup: async ({ provider, oauthId, email, name, profileImageUrl = '', language = '' }) => {
    const data = await apiClient(API_PATHS.auth.oauthSignup, {
      method: 'POST',
      body: { provider, oauthId, email, name, profileImageUrl, language },
    });
    setTokens(data);
    return data;
  },

  startGoogleLogin: () => {
    sessionStorage.removeItem('sapphire.oauthLinkIntent');
    sessionStorage.removeItem('sapphire.oauthSignupContext');
    window.location.href = `${AUTH_BASE_URL}${API_PATHS.auth.googleOAuth}`;
  },

  startGoogleLink: async () => {
    sessionStorage.setItem('sapphire.oauthLinkIntent', 'true');
    const data = await apiClient(`${API_PATHS.users}/me/oauth-link/prepare`, { method: 'POST' });
    window.location.href = `${AUTH_BASE_URL}${data.authorizationUrl || API_PATHS.auth.googleOAuth}`;
  },

  completeOAuthLogin: (data) => {
    setTokens(data);
    return data;
  },

  logout: async () => {
    try {
      await apiClient(API_PATHS.auth.logout, { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  reissue: async (refreshToken = getRefreshToken()) => {
    const data = await apiClient(API_PATHS.auth.reissue, {
      method: 'POST',
      body: { refreshToken },
    });
    setTokens(data);
    return data;
  },
};
