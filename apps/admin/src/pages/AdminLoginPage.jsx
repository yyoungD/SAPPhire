import { useState } from 'react';
import { adminAuthApi } from '../api/adminAuthApi.js';
import sapphireLogo from '../assets/sapphire_logo.png';

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-[linear-gradient(135deg,rgba(0,60,144,0.06),rgba(15,82,186,0)_48%),#f8f9ff] px-4 py-6 font-sans text-[#0b1c30] sm:px-6 sm:pt-10 sm:pb-7">
      <header className="flex w-full max-w-[720px] items-center justify-between px-1">
        <img className="block h-auto w-[132px] sm:w-[152px]" src={sapphireLogo} alt="SAPPhire" />
        <span className="hidden text-[11px] font-bold tracking-[0.05em] text-[#57657a] sm:block">
          ADMIN CONSOLE
        </span>
      </header>

      <section
        className="w-full max-w-[720px] rounded-lg border border-[rgba(195,198,213,0.15)] bg-white px-6 pt-8 pb-9 shadow-[0_12px_32px_rgba(11,28,48,0.06)] sm:px-14 sm:pt-12 sm:pb-[52px]"
        aria-labelledby="admin-login-title"
      >
        <div className="mb-7 sm:mb-9">
          <p className="mb-3 text-[11px] font-bold tracking-[0.05em] text-[#1d59c1]">
            SECURE ADMIN ACCESS
          </p>
          <h1
            className="mb-3 text-[28px] leading-tight font-bold tracking-normal sm:text-[32px]"
            id="admin-login-title"
          >
            관리자 로그인
          </h1>
          <p className="m-0 text-sm leading-6 text-[#57657a]">
            SAPPhire 운영 계정으로 관리자 콘솔에 로그인하세요.
          </p>
        </div>

        <form className="grid gap-5" onSubmit={submit}>
          <label className="grid gap-2.5 text-xs font-bold tracking-[0.05em] text-[#33445a]">
            이메일
            <input
              className="h-[52px] w-full rounded-md border border-transparent bg-[#eff4ff] px-4 text-[#0b1c30] outline-none transition duration-150 placeholder:text-[#8794a8] focus:border-[rgba(29,89,193,0.28)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(29,89,193,0.08)]"
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              autoComplete="username"
              placeholder="admin@sapphire.local"
              required
            />
          </label>
          <label className="grid gap-2.5 text-xs font-bold tracking-[0.05em] text-[#33445a]">
            비밀번호
            <input
              className="h-[52px] w-full rounded-md border border-transparent bg-[#eff4ff] px-4 text-[#0b1c30] outline-none transition duration-150 placeholder:text-[#8794a8] focus:border-[rgba(29,89,193,0.28)] focus:bg-white focus:shadow-[0_0_0_4px_rgba(29,89,193,0.08)]"
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </label>
          {error && <p className="-mt-1 m-0 text-[13px] leading-5 text-[#b91c1c]">{error}</p>}
          <button
            className="mt-2 inline-flex min-h-[52px] cursor-pointer items-center justify-center rounded-md border-0 bg-gradient-to-br from-[#003c90] to-[#0f52ba] font-bold text-white shadow-[0_12px_24px_rgba(0,60,144,0.14)] transition duration-150 hover:-translate-y-px hover:shadow-[0_14px_28px_rgba(0,60,144,0.2)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            type="submit"
            disabled={submitting}
          >
            {submitting ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </section>

      <footer className="mt-5 text-center text-[11px] font-bold tracking-[0.05em] text-[#57657a]">
        SAPPhire Administration
      </footer>
    </main>
  );
}
