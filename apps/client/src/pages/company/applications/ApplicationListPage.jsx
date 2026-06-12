import { useEffect, useMemo, useState } from 'react';
import { applicationApi } from '../../../api/applicationApi.js';
import { jobApi } from '../../../api/jobApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import SiteFooter from '../../../componenjs/layout/SiteFooter.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const statusClassNames = {
  SUBMITTED: 'new',
  REVIEWING: 'review',
  INTERVIEW: 'interview',
  OFFERED: 'offer',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function StatCard({ label, value, caption }) {
  return (
    <article className="candidate-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{caption}</p>
    </article>
  );
}

export default function ApplicationListPage() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadJobs() {
      try {
        const data = await jobApi.myCompanyJobs();
        if (!ignore) setJobs(Array.isArray(data) ? data : []);
      } catch {
        if (!ignore) setJobs([]);
      }
    }

    loadJobs();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadApplications() {
      setLoading(true);
      setError('');
      try {
        const data = await applicationApi.list(selectedJobId ? { jobPostId: selectedJobId } : {});
        if (!ignore) setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!ignore) setError(err.message || '지원자 목록을 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadApplications();
    return () => {
      ignore = true;
    };
  }, [selectedJobId]);

  const filteredApplications = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return applications;
    return applications.filter((application) =>
      [application.applicantName, application.jobTitle, application.jobPosition]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [applications, keyword]);

  const stats = useMemo(() => {
    const total = applications.length;
    const newCount = applications.filter((item) => item.status === 'SUBMITTED').length;
    const reviewingCount = applications.filter((item) => item.status === 'REVIEWING').length;
    const interviewCount = applications.filter((item) => item.status === 'INTERVIEW').length;
    return { total, newCount, reviewingCount, interviewCount };
  }, [applications]);

  return (
    <main className="company-candidate-page">
      <CompanyMemberHeader active="applications" />
      <section className="company-candidate-shell">
        <div className="company-candidate-hero">
          <div>
            <p className="eyebrow">CANDIDATE MANAGEMENT</p>
            <h1 className="company-page-title">지원자 현황</h1>
          </div>
          <button type="button" className="primary-action company-job-create-button" onClick={() => navigate(ROUTES.COMPANY_JOB_CREATE)}>
            공고 등록하기
          </button>
        </div>

        <div className="candidate-stat-grid">
          <StatCard label="전체 지원자 수" value={stats.total.toLocaleString()} caption="현재 선택 범위 기준" />
          <StatCard label="신규 지원" value={stats.newCount.toLocaleString()} caption="미열람 지원자" />
          <StatCard label="서류 전형 진행" value={stats.reviewingCount.toLocaleString()} caption="검토 중인 지원자" />
          <StatCard label="면접 전형 진행" value={stats.interviewCount.toLocaleString()} caption="면접 단계 지원자" />
        </div>

        <section className="candidate-filter-card" aria-label="지원자 필터">
          <select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)} aria-label="공고 선택">
            <option value="">전체 공고</option>
            {jobs.map((job) => (
              <option value={job.id} key={job.id}>
                {job.title}
              </option>
            ))}
          </select>
          <label>
            <span>검색</span>
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="지원자, 공고, 직무 검색..." />
          </label>
          <button type="button" aria-label="필터">
            ≡
          </button>
          <button type="button" aria-label="정렬">
            ⋯
          </button>
        </section>

        <section className="candidate-pipeline-card">
          <div className="candidate-pipeline-head">
            <h2>지원자 파이프라인</h2>
            <button type="button" aria-label="더보기">
              ...
            </button>
          </div>

          <div className="candidate-table">
            <div className="candidate-table-head">
              <span>지원자</span>
              <span>지원 직무</span>
              <span>경력 / 정보</span>
              <span>상태</span>
              <span>상세</span>
            </div>

            {loading && <p className="candidate-empty">지원자 목록을 불러오는 중입니다.</p>}
            {!loading && error && <p className="candidate-empty error">{error}</p>}
            {!loading && !error && filteredApplications.length === 0 && <p className="candidate-empty">표시할 지원자가 없습니다.</p>}

            {!loading &&
              !error &&
              filteredApplications.map((application) => (
                <button
                  type="button"
                  className="candidate-row"
                  key={application.id}
                  onClick={() => navigate(`${ROUTES.COMPANY_APPLICATION_DETAIL}?id=${application.id}`)}
                >
                  <span className="candidate-applicant">
                    <i>
                      <UserIcon />
                    </i>
                    <strong>
                      {application.applicantName || '-'}
                      <small>{application.appliedAt || '-'} 지원</small>
                    </strong>
                  </span>
                  <span>
                    <strong className="candidate-text-ellipsis">{application.jobPosition || '-'}</strong>
                  </span>
                  <span>{application.careerYears === null || application.careerYears === undefined ? '-' : `경력 ${application.careerYears}년`}</span>
                  <span>
                    <em className={`candidate-status ${statusClassNames[application.status] || ''}`}>{application.statusLabel || application.status || '-'}</em>
                  </span>
                  <span className="candidate-row-arrow">›</span>
                </button>
              ))}
          </div>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
