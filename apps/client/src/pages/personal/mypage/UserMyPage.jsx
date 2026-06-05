import { ROUTES } from '../../../constanjs/routes.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { userApi } from '../../../api/userApi.js';
import { authApi } from '../../../api/authApi.js';
import { getAccessToken } from '../../../api/apiClient.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { navigate } from '../../../utils/authUtils.js';

const emptyText = '등록 전';

function firstLetter(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || 'U';
}

export default function UserMyPage() {
  const { user, clearSession } = useAuth();
  const displayName = user?.name || emptyText;
  const displayEmail = user?.email || emptyText;
  const displayPhone = user?.phone || emptyText;
  const displayRole = user?.role === 'PERSONAL' ? '개인회원' : user?.role || emptyText;
  const profileImageUrl = user?.profileImageUrl;
  const loginProvider = user?.oauthProvider ? `${user.oauthProvider} 로그인` : '이메일 로그인';
  const language = user?.language || emptyText;

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.HOME);
  };

  const handleGoogleLink = () => {
    if (!getAccessToken()) {
      clearSession();
      navigate(ROUTES.LOGIN);
      return;
    }
    authApi.startGoogleLink();
  };

  const handleWithdraw = () => {
    const confirmed = window.confirm('회원 탈퇴 시 계정이 비활성화되고 다시 로그인할 수 없습니다. 탈퇴하시겠습니까?');
    if (!confirmed) return;

    if (!getAccessToken()) {
      clearSession();
      navigate(ROUTES.HOME);
      return;
    }

    userApi
      .withdrawMe()
      .then(() => {
        clearSession();
        navigate(ROUTES.HOME);
      })
      .catch((error) => {
        if (error.status === 401) {
          window.alert('로그인 정보가 만료되었습니다. 다시 로그인한 뒤 회원 탈퇴를 진행해 주세요.');
          clearSession();
          navigate(ROUTES.HOME);
          return;
        }
        window.alert(error.message || '회원 탈퇴에 실패했습니다.');
      });
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
              <div className="profile-avatar">
                {profileImageUrl ? <img src={profileImageUrl} alt="" /> : firstLetter(displayName)}
              </div>
              <div>
                <h2>
                  {displayName} <span>({displayRole})</span>
                </h2>
                <div className="profile-contact">
                  <span>{displayEmail}</span>
                  <span>{displayPhone}</span>
                  <span>사용자 ID: {user?.id ?? emptyText}</span>
                  <span>{loginProvider}</span>
                  <span>언어: {language}</span>
                </div>
              </div>
              <button type="button" className="secondary profile-edit" onClick={() => navigate(ROUTES.USER_UPDATE)}>
                프로필 수정
              </button>
              {!user?.oauthProvider && (
                <button type="button" className="secondary profile-edit" onClick={handleGoogleLink}>
                  Google 계정 연결
                </button>
              )}
            </article>

            <article className="profile-card">
              <div className="section-heading">
                <h2>희망 근무 조건</h2>
              </div>
              <dl className="profile-dl">
                <div>
                  <dt>희망 직무</dt>
                  <dd>{emptyText}</dd>
                </div>
                <div>
                  <dt>희망 연봉</dt>
                  <dd>{emptyText}</dd>
                </div>
                <div>
                  <dt>근무 형태</dt>
                  <dd>{emptyText}</dd>
                </div>
                <div>
                  <dt>희망 근무지</dt>
                  <dd>{emptyText}</dd>
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
                <p className="empty-copy">등록된 SAP 스킬이 없습니다.</p>
              </div>
            </article>

            <article className="profile-card">
              <div className="section-heading">
                <h2>경력 요약</h2>
              </div>
              <p className="career-copy">등록된 경력 요약이 없습니다. 프로필 수정에서 경력과 SAP 전문성을 입력해 주세요.</p>
            </article>
          </section>

          <aside className="profile-side">
            <section className="ai-card">
              <p className="eyebrow">AI PROFILE SCORE</p>
              <strong>-</strong>
              <span>AI 평가 전입니다.</span>
              <button type="button" className="primary-action" onClick={() => navigate(ROUTES.AI_EVALUATION)}>
                AI 평가 보기
              </button>
            </section>
            <section className="profile-card compact-card">
              <h2>이번 주 활동</h2>
              <dl className="stat-list">
                <div>
                  <dt>추천 공고</dt>
                  <dd>0</dd>
                </div>
                <div>
                  <dt>지원 완료</dt>
                  <dd>0</dd>
                </div>
                <div>
                  <dt>받은 제안</dt>
                  <dd>0</dd>
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
              <button type="button" className="withdraw-button" onClick={handleWithdraw}>
                회원 탈퇴
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
