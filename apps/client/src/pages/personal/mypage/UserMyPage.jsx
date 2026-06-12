import { useEffect, useState } from 'react';
import { ROUTES } from '../../../constanjs/routes.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { userApi } from '../../../api/userApi.js';
import { authApi } from '../../../api/authApi.js';
import { personalProfileApi } from '../../../api/personalProfileApi.js';
import { getAccessToken } from '../../../api/apiClient.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { navigate } from '../../../utils/authUtils.js';

const emptyText = '등록 전';
const workTypeLabels = {
  ONSITE: '상주',
  REMOTE: '원격',
  HYBRID: '하이브리드',
};

function firstLetter(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || 'U';
}

function splitSkills(skills = '') {
  return skills
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export default function UserMyPage() {
  const { user, clearSession } = useAuth();
  const [careerProfile, setCareerProfile] = useState(null);
  const displayName = user?.name || emptyText;
  const displayEmail = user?.email || emptyText;
  const displayPhone = user?.phone || emptyText;
  const displayRole = user?.role === 'PERSONAL' ? '개인회원' : user?.role || emptyText;
  const profileImageUrl = user?.profileImageUrl;
  const loginProvider = user?.oauthProvider ? `${user.oauthProvider} 로그인` : '이메일 로그인';

  useEffect(() => {
    let ignore = false;
    personalProfileApi
      .me()
      .then((profile) => {
        if (!ignore) setCareerProfile(profile);
      })
      .catch(() => {
        if (!ignore) setCareerProfile(null);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const navigateCareerEdit = (section) => {
    navigate(`${ROUTES.CAREER_PROFILE_UPDATE}#${section}`);
  };

  const handleResumePrint = () => {
    const previousTitle = document.title;
    document.title = `${displayName}-이력서`;
    window.print();
    window.setTimeout(() => {
      document.title = previousTitle;
    }, 1000);
  };

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.HOME);
  };

  const handleGoogleLink = async () => {
    if (!getAccessToken()) {
      clearSession();
      navigate(ROUTES.LOGIN);
      return;
    }
    try {
      await authApi.startGoogleLink();
    } catch (error) {
      window.alert(error.message || 'Google 계정 연결을 시작할 수 없습니다.');
    }
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
      <PersonalMemberHeader active="" />
      <div className="mypage-shell">
        <section className="mypage-title">
          <h1>내 프로필</h1>
          <p>SAP 전문가로서의 경력과 선호 정보를 관리하고 더 정확한 AI 추천을 받을 수 있습니다.</p>
        </section>

        <div className="mypage-grid">
          <section className="profile-column">
            <article className="profile-card profile-summary-card personal-profile-summary-card">
              <div className="profile-avatar">
                {profileImageUrl ? <img src={profileImageUrl} alt="" /> : firstLetter(displayName)}
              </div>
              <div>
                <h2>
                  {displayName} <span>({displayRole})</span>
                </h2>
                <div className="profile-info-grid">
                  <div>
                    <span>이메일</span>
                    <strong>{displayEmail}</strong>
                  </div>
                  <div>
                    <span>전화번호</span>
                    <strong>{displayPhone}</strong>
                  </div>
                  <div>
                    <span>로그인 방식</span>
                    <strong>{loginProvider}</strong>
                  </div>
                </div>
              </div>
              <div className="profile-summary-actions">
                <button type="button" className="secondary profile-edit" onClick={handleResumePrint}>
                  PDF 저장
                </button>
                <button type="button" className="secondary profile-edit" onClick={() => navigate(ROUTES.PROFILE_UPDATE)}>
                  프로필 수정
                </button>
                {!user?.oauthProvider && (
                  <button type="button" className="secondary profile-edit" onClick={handleGoogleLink}>
                    Google 계정 연결
                  </button>
                )}
              </div>
            </article>

            <article className="profile-card">
              <div className="section-heading editable-heading">
                <h2>희망 근무 조건</h2>
                <button type="button" className="section-edit-button" onClick={() => navigateCareerEdit('work')}>
                  수정
                </button>
              </div>
              <dl className="profile-dl">
                <div>
                  <dt>희망 직무</dt>
                  <dd>{careerProfile?.professionalTitle || emptyText}</dd>
                </div>
                <div>
                  <dt>희망 연봉</dt>
                  <dd>{careerProfile?.desiredSalary || emptyText}</dd>
                </div>
                <div>
                  <dt>근무 형태</dt>
                  <dd>{workTypeLabels[careerProfile?.workType] || emptyText}</dd>
                </div>
                <div>
                  <dt>희망 근무지</dt>
                  <dd>{careerProfile?.location || emptyText}</dd>
                </div>
              </dl>
              <div className="toggle-row">
                <div>
                  <strong>프로필 공개 설정</strong>
                  <span>헤드헌터 및 채용 담당자에게 프로필을 공개합니다.</span>
                </div>
                <button type="button" className={careerProfile?.isPublic === false ? 'toggle-off' : 'toggle-on'} aria-label="프로필 공개 설정" />
              </div>
            </article>

            <article className="profile-card">
              <div className="section-heading editable-heading">
                <h2>SAP 전문성</h2>
                <button type="button" className="section-edit-button" onClick={() => navigateCareerEdit('sap')}>
                  수정
                </button>
              </div>
              <div className="skill-cloud">
                {careerProfile?.sapSkills
                  ? splitSkills(careerProfile.sapSkills).map((skill) => <span key={skill}>{skill}</span>)
                  : <p className="empty-copy">등록된 SAP 스킬이 없습니다.</p>}
              </div>
              {careerProfile?.coreCompetencies && <p className="career-copy compact-copy">{careerProfile.coreCompetencies}</p>}
            </article>

            <article className="profile-card">
              <div className="section-heading editable-heading">
                <h2>경력 요약</h2>
                <button type="button" className="section-edit-button" onClick={() => navigateCareerEdit('summary')}>
                  수정
                </button>
              </div>
              <p className="career-copy">{careerProfile?.summary || '등록된 경력 요약이 없습니다. 커리어 프로필 수정에서 경력과 SAP 전문성을 입력해 주세요.'}</p>
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
      <section className="resume-print-sheet" aria-hidden="true">
        <header className="resume-print-header">
          <div>
            <p>SAP RESUME</p>
            <h1>{displayName}</h1>
            <strong>{careerProfile?.professionalTitle || 'SAP 전문가'}</strong>
          </div>
          <dl>
            <div>
              <dt>이메일</dt>
              <dd>{displayEmail}</dd>
            </div>
            <div>
              <dt>전화번호</dt>
              <dd>{displayPhone}</dd>
            </div>
            <div>
              <dt>희망 근무지</dt>
              <dd>{careerProfile?.location || emptyText}</dd>
            </div>
          </dl>
        </header>

        <section className="resume-print-section">
          <h2>희망 조건</h2>
          <dl>
            <div>
              <dt>희망 직무</dt>
              <dd>{careerProfile?.professionalTitle || emptyText}</dd>
            </div>
            <div>
              <dt>총 경력</dt>
              <dd>{careerProfile?.careerYears ? `${careerProfile.careerYears}년` : emptyText}</dd>
            </div>
            <div>
              <dt>근무 형태</dt>
              <dd>{workTypeLabels[careerProfile?.workType] || emptyText}</dd>
            </div>
            <div>
              <dt>희망 연봉</dt>
              <dd>{careerProfile?.desiredSalary || emptyText}</dd>
            </div>
          </dl>
        </section>

        <section className="resume-print-section">
          <h2>SAP 전문성</h2>
          <div className="resume-print-skills">
            {splitSkills(careerProfile?.sapSkills || '').length > 0
              ? splitSkills(careerProfile.sapSkills).map((skill) => <span key={skill}>{skill}</span>)
              : <span>{emptyText}</span>}
          </div>
          <p>{careerProfile?.coreCompetencies || '등록된 핵심 역량이 없습니다.'}</p>
        </section>

        <section className="resume-print-section">
          <h2>경력 요약</h2>
          <p>{careerProfile?.summary || '등록된 경력 요약이 없습니다.'}</p>
        </section>
      </section>
    </main>
  );
}
