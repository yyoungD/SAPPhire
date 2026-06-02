import { useEffect, useRef, useState } from 'react';
import { setTokens } from '../../api/apiClient.js';
import { roleHome } from '../../utils/authUtils.js';

export default function OAuthCallbackPage() {
  const handledRef = useRef(false);
  const [message, setMessage] = useState('소셜 로그인 처리 중입니다.');

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error) {
      setMessage('소셜 로그인에 실패했습니다. 다시 시도해 주세요.');
      return;
    }

    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const user = {
      id: Number(params.get('userId')),
      email: params.get('email'),
      name: params.get('name'),
      role: params.get('role'),
    };

    if (!accessToken || !refreshToken || !user.email || !user.role) {
      setMessage('소셜 로그인 응답을 확인할 수 없습니다.');
      return;
    }

    setTokens({ accessToken, refreshToken });
    localStorage.setItem('sapphire.user', JSON.stringify(user));
    window.location.replace(roleHome(user.role));
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
