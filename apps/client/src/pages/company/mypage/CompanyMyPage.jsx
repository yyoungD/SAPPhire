import { useEffect, useState } from 'react';
import { companyProfileApi } from '../../../api/companyProfileApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { navigate } from '../../../utils/authUtils.js';

const emptyText = '-';

function websiteHref(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default function CompanyMyPage() {
  const { clearSession } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        const data = await companyProfileApi.detail('me');
        if (!ignore) {
          setProfile(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || '기업 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const websiteUrl = profile?.websiteUrl;

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.HOME);
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="company" />
      <div className="mypage-shell">
        <section className="mypage-title">
          <h2>내 프로필</h2>
          <p>기업 정보를 관리하고 SAP 채용 공고와 지원자 현황을 확인하세요.</p>
        </section>

        <div className="mypage-grid">
          <section className="profile-column">
            <article className="profile-card profile-summary-card">
              <div className="profile-avatar"></div>
              <div>
                <h2>{loading ? '불러오는 중' : profile?.companyName || '기업명 미등록'}</h2>
                {error && <p className="form-error">{error}</p>}
                <div className="profile-info-grid">
                  <div>
                    <span>이메일</span>
                    <strong>{profile?.email || emptyText}</strong>
                  </div>
                  <div>
                    <span>전화번호</span>
                    <strong>{profile?.phone || emptyText}</strong>
                  </div>
                  <div>
                    <span>기업 웹사이트</span>
                    {websiteUrl ? (
                      <a href={websiteHref(websiteUrl)} target="_blank" rel="noreferrer">
                        {websiteUrl}
                      </a>
                    ) : (
                      <strong>{emptyText}</strong>
                    )}
                  </div>
                </div>
                <div>
                  <p className="career-copy">
                    {profile?.description || '등록된 기업 설명이 없습니다.'}
                  </p>
                </div>
              </div>
              <div className="profile-summary-actions">
                <button
                  type="button"
                  className="secondary profile-edit"
                  onClick={() => navigate(ROUTES.COMPANY_PROFILE_UPDATE)}
                >
                  프로필 수정
                </button>
              </div>
            </article>

            <article className="profile-card">
              <div className="section-heading editable-heading">
                <h2>공고 리스트</h2>
                <button
                  type="button"
                  className="section-edit-button"
                  onClick={() => navigate(ROUTES.COMPANY_JOBS)}
                >
                  더보기
                </button>
              </div>
            </article>

            <article className="profile-card">
              <div className="section-heading editable-heading">
                <h2>포지션 제안 목록</h2>
                <button
                  type="button"
                  className="section-edit-button"
                  onClick={() => navigate(ROUTES.POSITION_OFFERS)}
                >
                  더보기
                </button>
              </div>
              <div className="skill-cloud"></div>
            </article>
          </section>

          <aside className="profile-side">
            <section className="profile-card compact-card">
              <h2>이번 주 활동</h2>
              <dl className="stat-list">
                <div>
                  <dt>진행 중인 공고</dt>
                  <dd>0</dd>
                </div>
                <div>
                  <dt>마감된 공고</dt>
                  <dd>0</dd>
                </div>
                <div>
                  <dt>보낸 제안</dt>
                  <dd>0</dd>
                </div>
              </dl>
            </section>
            <section className="profile-card compact-card">
              <h2>빠른 이동</h2>
              <button type="button" onClick={() => navigate(ROUTES.COMPANY_JOBS)}>
                공고 관리
              </button>
              <button type="button" onClick={() => navigate(ROUTES.COMPANY_APPLICATIONS)}>
                지원자 현황
              </button>
              <button type="button" onClick={() => navigate(ROUTES.POSITION_OFFERS)}>
                포지션 제안
              </button>
            </section>
            <section className="profile-card compact-card logout-card">
              <button type="button" className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
              <button type="button" className="withdraw-button">
                회원 탈퇴
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
