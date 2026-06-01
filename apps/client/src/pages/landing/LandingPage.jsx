import { ROUTES } from '../../constanjs/routes.js';
import { navigate } from '../../utils/authUtils.js';

const logoUrl = new URL('../../assejs/images/ci-10.png', import.meta.url).href;

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-header-brand">
            <img src={logoUrl} alt="SAPPhire" />
          </div>
          <nav className="landing-header-actions" aria-label="계정 메뉴">
            <button type="button" onClick={() => navigate(ROUTES.LOGIN)}>
              로그인
            </button>
            <button type="button" onClick={() => navigate(ROUTES.SIGNUP)}>
              가입하기
            </button>
          </nav>
        </div>
      </header>
      <section className="landing-hero">
        <div>
          <p className="eyebrow">SAP Recruiting Platform</p>
          <h1>SAP 전문가와 기업을 정교하게 연결합니다.</h1>
          <p>SAP 기술 프로필, 이력서, 채용공고, 포지션 제안을 하나의 흐름에서 관리하는 SAPPhire 클라이언트입니다.</p>
          <div className="hero-actions">
            <button type="button" onClick={() => navigate(ROUTES.SIGNUP)}>
              시작하기
            </button>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.LOGIN)}>
              계정 로그인
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
