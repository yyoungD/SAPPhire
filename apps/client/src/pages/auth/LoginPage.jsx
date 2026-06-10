import { useMemo, useState } from 'react';
import { authApi } from '../../api/authApi.js';
import { ROUTES } from '../../constanjs/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { navigate, roleHome } from '../../utils/authUtils.js';

const bgUrl = new URL('../../assejs/images/architectural-precision0.png', import.meta.url).href;
const logoUrl = new URL('../../assejs/images/ci-10.png', import.meta.url).href;
const mailIconUrl = new URL('../../assejs/images/container14.svg', import.meta.url).href;
const lockIconUrl = new URL('../../assejs/images/container18.svg', import.meta.url).href;
const eyeIconUrl = new URL('../../assejs/images/container19.svg', import.meta.url).href;

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState('PERSONAL');
  const [form, setForm] = useState({ email: '', password: '', keepSignedIn: false });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');

  const copy = useMemo(
    () => ({
      emailPlaceholder: role === 'COMPANY' ? 'company@sapphire.com' : 'example@sapphire.com',
      tabLabel: role === 'COMPANY' ? '기업회원' : '개인회원',
    }),
    [role],
  );

  const update = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await login({ email: form.email, password: form.password });
      navigate(roleHome(data.user?.role));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="login-page">
      <header className="signup-header">
        <img src={logoUrl} alt="SAPPhire" />
        <button type="button" onClick={() => navigate(ROUTES.HOME)}>
          SAPPhire 홈
        </button>
      </header>
      <div className="signup-layout">
        <section className="signup-brand" style={{ '--brand-bg': `url(${bgUrl})` }}>
          <div>
            <h1>SAPPhire</h1>
            <p>SAP 전문 인재와 기업을 연결하는 채용 플랫폼입니다.</p>
          </div>
          <aside>
            <strong>AI INSIGHT</strong>
            <p>SAP 역량과 채용 데이터를 바탕으로 더 정확한 매칭을 지원합니다.</p>
          </aside>
        </section>
        <section className="login-card">
          <h2>로그인</h2>
          <p>Sapphire SAP Recruitment Portal</p>
          <div className="role-tabs" role="tablist" aria-label="회원 유형">
            <button type="button" className={role === 'PERSONAL' ? 'active' : ''} onClick={() => setRole('PERSONAL')}>
              개인회원
            </button>
            <button type="button" className={role === 'COMPANY' ? 'active' : ''} onClick={() => setRole('COMPANY')}>
              기업회원
            </button>
          </div>
          <form onSubmit={onSubmit} className="form-stack login-form" aria-label={`${copy.tabLabel} 로그인`}>
            <label>
              아이디 / 이메일 주소
              <div className="icon-input">
                <img src={mailIconUrl} alt="" />
                <input name="email" type="email" value={form.email} onChange={update} placeholder={copy.emailPlaceholder} required />
              </div>
            </label>
            <label>
              비밀번호
              <div className="icon-input password-input">
                <img className="field-icon" src={lockIconUrl} alt="" />
                <input
                  name="password"
                  type={passwordVisible ? 'text' : 'password'}
                  value={form.password}
                  onChange={update}
                  placeholder="aa123456!"
                  required
                />
                <button type="button" onClick={() => setPasswordVisible((value) => !value)} aria-label={passwordVisible ? '비밀번호 숨기기' : '비밀번호 보기'}>
                  <img src={eyeIconUrl} alt="" />
                </button>
              </div>
            </label>
            <div className="login-options">
              <label className="checkbox-label">
                <input name="keepSignedIn" type="checkbox" checked={form.keepSignedIn} onChange={update} />
                <span>로그인 상태 유지</span>
              </label>
              <button type="button" className="text-link">
                정보 찾기
              </button>
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="primary-action">
              로그인
            </button>
          </form>
          <div className={`login-social-area ${role === 'PERSONAL' ? '' : 'is-hidden'}`} aria-hidden={role !== 'PERSONAL'}>
              <div className="divider">
                <span />또는<span />
              </div>
              <button type="button" className="social-button" onClick={authApi.startGoogleLogin} disabled={role !== 'PERSONAL'}>
                Google 계정으로 계속하기
              </button>
          </div>
          <button type="button" className="link-button" onClick={() => navigate(ROUTES.SIGNUP)}>
            계정이 없으신가요? 계정 만들기
          </button>
        </section>
      </div>
    </main>
  );
}
