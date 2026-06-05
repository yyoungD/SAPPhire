import { useState } from 'react';
import { adminAuthApi } from '../api/adminAuthApi.js';
import sapphireLogo from '../assets/ci-10.png';

export default function AdminLoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: 'admin@sapphire.local', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await adminAuthApi.login(form);
      onLogin(data.user);
    } catch (exception) {
      setError(exception.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <header className="login-brand">
        <img src={sapphireLogo} alt="SAPPhire" />
        <span>ADMIN CONSOLE</span>
      </header>

      <section className="login-panel" aria-labelledby="admin-login-title">
        <div className="login-heading">
          <p className="eyebrow">SECURE ADMIN ACCESS</p>
          <h1 id="admin-login-title">관리자 로그인</h1>
          <p className="login-description">SAPPhire 운영 계정으로 관리자 콘솔에 로그인하세요.</p>
        </div>

        <form className="login-form" onSubmit={submit}>
          <label>
            이메일
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              autoComplete="username"
              placeholder="admin@sapphire.local"
              required
            />
          </label>
          <label>
            비밀번호
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </section>

      <footer className="login-footer">SAPPhire Administration</footer>
    </main>
  );
}
