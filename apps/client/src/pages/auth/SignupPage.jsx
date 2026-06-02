import { useMemo, useState } from 'react';
import { authApi } from '../../api/authApi.js';
import { ROUTES } from '../../constanjs/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { navigate } from '../../utils/authUtils.js';

const bgUrl = new URL('../../assejs/images/architectural-precision0.png', import.meta.url).href;
const logoUrl = new URL('../../assejs/images/ci-10.png', import.meta.url).href;
const visibilityUrl = new URL('../../assejs/images/visibility0.svg', import.meta.url).href;
const visibilityOffUrl = new URL('../../assejs/images/visibility-off0.svg', import.meta.url).href;

const initialForm = {
  companyName: '',
  businessNumber: '',
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
};

export default function SignupPage() {
  const { signup } = useAuth();
  const [role, setRole] = useState('PERSONAL');
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    passwordConfirm: false,
  });
  const isCompany = role === 'COMPANY';

  const pageCopy = useMemo(
    () =>
      isCompany
        ? {
            title: '기업 계정 생성',
            description: '채용을 시작하기 위해 기업 정보와 담당자 정보를 입력해 주세요.',
            emailLabel: '비즈니스 이메일',
            nameLabel: '담당자 이름',
            namePlaceholder: '홍길동',
          }
        : {
            title: '계정 생성',
            description: 'SAPPhire 서비스를 시작하기 위해 기본 정보를 입력해 주세요.',
            emailLabel: '이메일',
            nameLabel: '이름',
            namePlaceholder: '홍길동',
          },
    [isCompany],
  );

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const changeRole = (nextRole) => {
    setRole(nextRole);
    setError('');
  };

  const togglePassword = (field) => {
    setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (isCompany && (!form.companyName.trim() || !form.businessNumber.trim())) {
      setError('회사명과 사업자 번호를 입력해 주세요.');
      return;
    }

    try {
      await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        role,
        consents: [{ termId: 1, agreed: true }],
      });
      navigate(ROUTES.LOGIN);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="signup-page">
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
        <section className="signup-card">
          <h2>{pageCopy.title}</h2>
          <p>{pageCopy.description}</p>
          <div className="role-tabs" role="tablist" aria-label="회원 유형">
            <button type="button" className={role === 'PERSONAL' ? 'active' : ''} onClick={() => changeRole('PERSONAL')}>
              개인 회원
            </button>
            <button type="button" className={role === 'COMPANY' ? 'active' : ''} onClick={() => changeRole('COMPANY')}>
              기업 회원
            </button>
          </div>
          <form className="form-stack" onSubmit={onSubmit}>
            {isCompany && (
              <>
                <label>
                  회사명
                  <input name="companyName" value={form.companyName} onChange={update} placeholder="SAP Korea" required />
                </label>
                <label>
                  사업자 번호
                  <div className="inline-input">
                    <input name="businessNumber" value={form.businessNumber} onChange={update} placeholder="1234567890" inputMode="numeric" required />
                    <button type="button">인증하기</button>
                  </div>
                </label>
              </>
            )}
            <label>
              {pageCopy.nameLabel}
              <input name="name" value={form.name} onChange={update} placeholder={pageCopy.namePlaceholder} required />
            </label>
            <label>
              {pageCopy.emailLabel}
              <input name="email" type="email" value={form.email} onChange={update} placeholder="name@company.com" required />
            </label>
            {!isCompany && (
              <label>
                전화번호
                <input name="phone" value={form.phone} onChange={update} placeholder="010-0000-0000" />
              </label>
            )}
            <label>
              비밀번호
              <div className="password-input">
                <input
                  name="password"
                  type={visiblePasswords.password ? 'text' : 'password'}
                  value={form.password}
                  onChange={update}
                  placeholder="8자 이상"
                  minLength="8"
                  required
                />
                <button type="button" onClick={() => togglePassword('password')} aria-label={visiblePasswords.password ? '비밀번호 숨기기' : '비밀번호 보기'}>
                  <img src={visiblePasswords.password ? visibilityUrl : visibilityOffUrl} alt="" />
                </button>
              </div>
            </label>
            <label>
              비밀번호 확인
              <div className="password-input">
                <input
                  name="passwordConfirm"
                  type={visiblePasswords.passwordConfirm ? 'text' : 'password'}
                  value={form.passwordConfirm}
                  onChange={update}
                  placeholder="비밀번호 재입력"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePassword('passwordConfirm')}
                  aria-label={visiblePasswords.passwordConfirm ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'}
                >
                  <img src={visiblePasswords.passwordConfirm ? visibilityUrl : visibilityOffUrl} alt="" />
                </button>
              </div>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="primary-action">
              시작하기
            </button>
          </form>
          <div className="divider">
            <span />또는<span />
          </div>
          <button type="button" className="social-button" onClick={authApi.startGoogleLogin}>
            Google 계정으로 회원가입
          </button>
          <button type="button" className="link-button" onClick={() => navigate(ROUTES.LOGIN)}>
            이미 계정이 있으신가요? 로그인
          </button>
        </section>
      </div>
    </main>
  );
}
