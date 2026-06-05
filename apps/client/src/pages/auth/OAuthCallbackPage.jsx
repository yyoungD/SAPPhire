import { useEffect, useRef, useState } from 'react';
import { authApi } from '../../api/authApi.js';
import { userApi } from '../../api/userApi.js';
import { getAccessToken, setTokens } from '../../api/apiClient.js';
import { ROUTES } from '../../constanjs/routes.js';
import { navigate, roleHome } from '../../utils/authUtils.js';

const OAUTH_LINK_INTENT_KEY = 'sapphire.oauthLinkIntent';

export default function OAuthCallbackPage() {
  const handledRef = useRef(false);
  const [message, setMessage] = useState('소셜 로그인 처리 중입니다.');

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      sessionStorage.removeItem(OAUTH_LINK_INTENT_KEY);
      setMessage('소셜 로그인에 실패했습니다. 다시 시도해 주세요.');
      return;
    }

    const oauthProfile = {
      provider: params.get('provider'),
      oauthId: params.get('oauthId'),
      email: params.get('email'),
      name: params.get('name'),
      profileImageUrl: params.get('profileImageUrl') || '',
      language: params.get('language') || '',
    };

    const completeLogin = (data) => {
      setTokens(data);
      localStorage.setItem('sapphire.user', JSON.stringify(data.user));
      window.location.replace(roleHome(data.user.role));
    };

    const linkRequired = params.get('linkRequired') === 'true';
    if (linkRequired) {
      const linkIntent = sessionStorage.getItem(OAUTH_LINK_INTENT_KEY) === 'true';
      sessionStorage.removeItem(OAUTH_LINK_INTENT_KEY);

      if (!linkIntent) {
        setMessage('이미 가입된 이메일입니다. 기존 계정으로 로그인한 뒤 마이페이지에서 소셜 계정을 연결해 주세요.');
        return;
      }

      if (!getAccessToken()) {
        setMessage('로그인 정보가 만료되었습니다. 다시 로그인한 뒤 마이페이지에서 소셜 계정을 연결해 주세요.');
        navigate(ROUTES.LOGIN);
        return;
      }

      if (!oauthProfile.provider || !oauthProfile.oauthId || !oauthProfile.email) {
        setMessage('소셜 로그인 응답을 확인할 수 없습니다.');
        return;
      }

      setMessage('Google 계정을 연결하는 중입니다.');
      userApi
        .linkOAuthAccount(oauthProfile)
        .then((user) => {
          localStorage.setItem('sapphire.user', JSON.stringify(user));
          setMessage('Google 계정 연결이 완료되었습니다.');
          window.location.replace(ROUTES.USER_MY_PAGE);
        })
        .catch((err) => {
          setMessage(err.message || 'Google 계정 연결에 실패했습니다.');
        });
      return;
    }

    const signupRequired = params.get('signupRequired') === 'true';
    if (signupRequired) {
      const linkIntent = sessionStorage.getItem(OAUTH_LINK_INTENT_KEY) === 'true';
      sessionStorage.removeItem(OAUTH_LINK_INTENT_KEY);

      if (linkIntent) {
        setMessage('현재 계정과 같은 이메일의 Google 계정만 연결할 수 있습니다.');
        return;
      }

      if (!oauthProfile.provider || !oauthProfile.oauthId || !oauthProfile.email || !oauthProfile.name) {
        setMessage('소셜 로그인 응답을 확인할 수 없습니다.');
        return;
      }

      const confirmed = window.confirm('가입되지 않은 Google 계정입니다. 회원가입을 진행하시겠습니까?');
      if (!confirmed) {
        setMessage('회원가입이 취소되었습니다.');
        navigate(ROUTES.LOGIN);
        return;
      }

      setMessage('Google 계정으로 회원가입 중입니다.');
      authApi
        .oauthSignup(oauthProfile)
        .then(completeLogin)
        .catch((err) => {
          setMessage(err.message || 'Google 회원가입에 실패했습니다.');
        });
      return;
    }

    sessionStorage.removeItem(OAUTH_LINK_INTENT_KEY);

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const user = {
      id: Number(params.get('userId')),
      email: params.get('email'),
      name: params.get('name'),
      phone: params.get('phone') || '',
      role: params.get('role'),
      profileImageUrl: params.get('profileImageUrl') || '',
      language: params.get('language') || '',
      oauthProvider: params.get('oauthProvider') || '',
    };

    if (!accessToken || !refreshToken || !user.email || !user.role) {
      setMessage('소셜 로그인 응답을 확인할 수 없습니다.');
      return;
    }

    completeLogin({ accessToken, refreshToken, user });
  }, []);

  return (
    <main className="page-shell">
      <section className="page-panel">
        <p className="eyebrow">SAPPhire</p>
        <h1>OAuth 처리</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
