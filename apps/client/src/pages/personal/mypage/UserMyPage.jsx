import { ROUTES } from '../../../constanjs/routes.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { navigate } from '../../../utils/authUtils.js';

const skills = [
  ['SAP FI', 'Expert'],
  ['SAP CO', 'Expert'],
  ['S/4HANA', 'Intermediate'],
  ['SAP MM', 'Intermediate'],
  ['ABAP', 'Beginner'],
];

export default function UserMyPage() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="resume" />
      <div className="mypage-shell">
        <section className="mypage-title">
          <h1>내 프로필</h1>
          <p>SAP 전문가로서의 경력과 선호 정보를 관리하고 더 정확한 AI 추천을 받을 수 있습니다.</p>
        </section>

        <div className="mypage-grid">
          <section className="profile-column">
            <article className="profile-card profile-summary-card">
              <div className="profile-avatar">김</div>
              <div>
                <h2>김사파 <span>(Kim Sapa)</span></h2>
                <div className="profile-contact">
                  <span>sapa.kim@example.com</span>
                  <span>010-1234-5678</span>
                  <span>서울 강남구</span>
                </div>
              </div>
              <button type="button" className="secondary profile-edit" onClick={() => navigate(ROUTES.USER_UPDATE)}>
                프로필 수정
              </button>
            </article>

            <article className="profile-card">
              <div className="section-heading">
                <h2>희망 근무 조건</h2>
              </div>
              <dl className="profile-dl">
                <div>
                  <dt>희망 직무</dt>
                  <dd>SAP FICO Consultant</dd>
                </div>
                <div>
                  <dt>희망 연봉</dt>
                  <dd>협의 후 결정 (현재: 8,000만원)</dd>
                </div>
                <div>
                  <dt>근무 형태</dt>
                  <dd>정규직, 계약직, 프리랜서</dd>
                </div>
                <div>
                  <dt>희망 근무지</dt>
                  <dd>서울, 경기, 원격 가능</dd>
                </div>
              </dl>
              <div className="toggle-row">
                <div>
                  <strong>프로필 공개 설정</strong>
                  <span>헤드헌터 및 채용 담당자에게 프로필을 공개합니다.</span>
                </div>
                <button type="button" className="toggle-on" aria-label="프로필 공개 설정 켜짐" />
              </div>
            </article>

            <article className="profile-card">
              <div className="section-heading">
                <h2>SAP 전문성</h2>
              </div>
              <div className="skill-cloud">
                {skills.map(([name, level]) => (
                  <span key={name}>
                    {name}
                    <strong>{level}</strong>
                  </span>
                ))}
              </div>
            </article>

            <article className="profile-card">
              <div className="section-heading">
                <h2>경력 요약</h2>
              </div>
              <p className="career-copy">
                8년차 SAP FICO 컨설턴트로 제조 및 리테일 산업의 S/4HANA 구축과 고도화 프로젝트를 수행했습니다. 재무회계와
                관리회계 모듈 이해도가 높고, 글로벌 Roll-out 프로젝트 경험을 바탕으로 현업과 개발 조직 사이의 커뮤니케이션에
                강점이 있습니다.
              </p>
            </article>
          </section>

          <aside className="profile-side">
            <section className="ai-card">
              <p className="eyebrow">AI PROFILE SCORE</p>
              <strong>92</strong>
              <span>상위 8% SAP FICO 인재</span>
              <button type="button" className="primary-action" onClick={() => navigate(ROUTES.AI_EVALUATION)}>
                AI 평가 보기
              </button>
            </section>
            <section className="profile-card compact-card">
              <h2>이번 주 활동</h2>
              <dl className="stat-list">
                <div>
                  <dt>추천 공고</dt>
                  <dd>12</dd>
                </div>
                <div>
                  <dt>지원 완료</dt>
                  <dd>3</dd>
                </div>
                <div>
                  <dt>받은 제안</dt>
                  <dd>2</dd>
                </div>
              </dl>
            </section>
            <section className="profile-card compact-card">
              <h2>빠른 이동</h2>
              <button type="button" onClick={() => navigate(ROUTES.RESUMES)}>
                이력서 관리
              </button>
              <button type="button" onClick={() => navigate(ROUTES.MY_APPLICATIONS)}>
                지원 현황
              </button>
              <button type="button" onClick={() => navigate(ROUTES.RECEIVED_OFFERS)}>
                포지션 제안
              </button>
            </section>
            <section className="profile-card compact-card logout-card">
              <button type="button" className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
