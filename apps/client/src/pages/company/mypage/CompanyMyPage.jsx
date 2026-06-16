import { useEffect, useState } from 'react';
import { companyProfileApi } from '../../../api/companyProfileApi.js';
import { jobApi } from '../../../api/jobApi.js';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { navigate } from '../../../utils/authUtils.js';

const emptyText = '-';

function websiteHref(url) {
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

function countJobsByStatus(jobs, status) {
  return jobs.filter((job) => job.status === status).length;
}

export default function CompanyMyPage() {
  const { clearSession } = useAuth();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [offersSummary, setOffersSummary] = useState({ totalOffers: 0 });
  const [offersLoading, setOffersLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobsError, setJobsError] = useState('');
  const [offersError, setOffersError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setLoading(true);
      setError('');

      try {
        const data = await companyProfileApi.detail('me');
        if (!ignore) setProfile(data);
      } catch (err) {
        if (!ignore) setError(err.message || '기업 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadJobs() {
      setJobsLoading(true);
      setJobsError('');

      try {
        const data = await jobApi.myCompanyJobs();
        if (!ignore) setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) setJobsError(err.message || '공고 목록을 불러오지 못했습니다.');
      } finally {
        if (!ignore) setJobsLoading(false);
      }
    }

    loadJobs();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadOffers() {
      setOffersLoading(true);
      setOffersError('');

      try {
        const data = await positionOfferApi.list();
        if (!ignore) setOffersSummary(data || { totalOffers: 0 });
      } catch (err) {
        if (!ignore) setOffersError(err.message || '보낸 제안 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setOffersLoading(false);
      }
    }

    loadOffers();

    return () => {
      ignore = true;
    };
  }, []);

  const websiteUrl = profile?.websiteUrl;
  const openJobCount = countJobsByStatus(jobs, 'OPEN');
  const closedJobCount = countJobsByStatus(jobs, 'CLOSED');
  const sentOfferCount = offersSummary?.totalOffers ?? offersSummary?.offers?.length ?? 0;

  const handleLogout = () => {
    clearSession();
    navigate(ROUTES.HOME);
  };

  const openJobsByStatus = (status) => {
    navigate(`${ROUTES.COMPANY_JOBS}?status=${status}`);
  };

  const openJobsByStatusWithKeyboard = (event, status) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openJobsByStatus(status);
    }
  };

  return (
    <main className="member-page">
      <CompanyMemberHeader active="jobs" />
      <div className="mypage-shell">
        <section className="mypage-title">
          <h2>기업 프로필</h2>
          <p>기업 정보를 관리하고 SAP 채용 공고와 지원자 현황을 확인하세요.</p>
        </section>

        <div className="mypage-grid">
          <section className="profile-column">
            <article className="profile-card profile-summary-card">
              <div className="profile-avatar">
                {profile?.logoUrl ? (
                  <img src={profile.logoUrl} alt="" />
                ) : (
                  (profile?.companyName || 'C').slice(0, 1)
                )}
              </div>
              <div className="profile-summary-main">
                <div className="profile-summary-head">
                  <h2>{loading ? '불러오는 중' : profile?.companyName || '기업명 미등록'}</h2>
                  <button
                    type="button"
                    className="secondary profile-edit"
                    onClick={() => navigate(ROUTES.COMPANY_PROFILE_UPDATE)}
                  >
                    프로필 수정
                  </button>
                </div>
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
                <p className="career-copy">
                  {profile?.description || '등록된 기업 설명이 없습니다.'}
                </p>
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
              <div className="mypage-job-list" aria-label="기업 공고 목록">
                {jobsLoading && <p className="career-copy">공고 목록을 불러오는 중입니다.</p>}
                {!jobsLoading && jobsError && <p className="form-error">{jobsError}</p>}
                {!jobsLoading && !jobsError && jobs.length === 0 && (
                  <p className="career-copy">등록된 공고가 없습니다.</p>
                )}
                {!jobsLoading &&
                  !jobsError &&
                  jobs.map((job) => (
                    <button
                      type="button"
                      className="mypage-job-item"
                      key={job.id}
                      onClick={() => navigate(`${ROUTES.COMPANY_JOB_DETAIL}?id=${job.id}`)}
                    >
                      <strong>{job.title || '-'}</strong>
                      <span>{job.position || job.experienceLevel || '-'}</span>
                      <time>{job.createdAt || '-'}</time>
                    </button>
                  ))}
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
              <div className="skill-cloud" />
            </article>
          </section>

          <aside className="profile-side">
            <section className="profile-card compact-card">
              <h2>채용 현황</h2>
              {(jobsError || offersError) && (
                <p className="form-error">{jobsError || offersError}</p>
              )}
              <dl className="stat-list">
                <div
                  className="stat-list-row is-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => openJobsByStatus('OPEN')}
                  onKeyDown={(event) => openJobsByStatusWithKeyboard(event, 'OPEN')}
                >
                  <dt>진행중인 공고</dt>
                  <dd>{jobsLoading ? '-' : openJobCount}</dd>
                </div>
                <div
                  className="stat-list-row is-clickable"
                  role="button"
                  tabIndex={0}
                  onClick={() => openJobsByStatus('CLOSED')}
                  onKeyDown={(event) => openJobsByStatusWithKeyboard(event, 'CLOSED')}
                >
                  <dt>마감된 공고</dt>
                  <dd>{jobsLoading ? '-' : closedJobCount}</dd>
                </div>
                <div>
                  <dt>보낸 제안</dt>
                  <dd>{offersLoading ? '-' : sentOfferCount}</dd>
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
