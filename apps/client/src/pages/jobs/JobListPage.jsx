import { ROUTES } from '../../constanjs/routes.js';
import PersonalMemberHeader from '../../componenjs/layout/PersonalMemberHeader.jsx';
import { navigate } from '../../utils/authUtils.js';

const jobs = [
  {
    id: 50715283,
    company: 'Deloitte Korea',
    location: 'Seoul, KR',
    title: 'Senior SAP FICO Consultant',
    tags: ['SAP FI', 'SAP CO', 'S/4HANA', 'Expert'],
    posted: '2시간 전',
    salary: '협의 후 결정',
    badge: 'AI 추천 94%',
  },
  {
    id: 50715284,
    company: 'SAP Korea Partner',
    location: 'Gwangju, KR',
    title: 'SAP BASIS 운영 컨설턴트',
    tags: ['BASIS', 'Migration', 'Cloud', 'Intermediate'],
    posted: '오늘',
    salary: '6,000만~8,000만원',
    badge: 'D-15',
  },
  {
    id: 50715285,
    company: 'LG CNS',
    location: 'Pangyo, KR',
    title: 'S/4HANA 전환 프로젝트 PM',
    tags: ['S/4HANA', 'PM', 'Roll-out', 'Advanced'],
    posted: '1일 전',
    salary: '협의 후 결정',
    badge: '인증 기업',
  },
];

export default function JobListPage() {
  return (
    <main className="member-page">
      <PersonalMemberHeader active="jobs" />
      <section className="jobs-hero">
        <div>
          <p className="eyebrow">SAP RECRUITMENT FEED</p>
          <h1>채용 공고</h1>
          <p>SAP 전문가를 위한 최신 프로젝트와 채용 기회를 모았습니다. 선호 모듈과 경력에 맞는 포지션을 빠르게 탐색해보세요.</p>
        </div>
        <button type="button" className="primary-action jobs-hero-action">
          공고 등록하기
        </button>
      </section>

      <section className="job-filter-panel" aria-label="채용 공고 필터">
        <div className="filter-tabs">
          <button type="button" className="active">
            국내
          </button>
          <button type="button">해외</button>
        </div>
        <div className="filter-row">
          <button type="button">지역 전체</button>
          <button type="button">직무 선택</button>
          <input aria-label="검색어" placeholder="검색어 입력" />
          <button type="button" className="filter-submit">
            상세조건
          </button>
        </div>
        <div className="filter-summary">
          <span>광주 전체</span>
          <strong>{jobs.length.toLocaleString()}건</strong>
        </div>
      </section>

      <section className="job-list" aria-label="채용 공고 목록">
        {jobs.map((job) => (
          <article className="job-card" key={job.id}>
            <div className="job-logo">{job.company.slice(0, 1)}</div>
            <div className="job-card-body">
              <div className="job-meta">
                <strong>{job.company}</strong>
                <span>{job.location}</span>
              </div>
              <h2>{job.title}</h2>
              <div className="tag-row">
                {job.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
              <div className="job-card-footer">
                <span>{job.posted}</span>
                <span>{job.salary}</span>
                <button type="button" onClick={() => navigate(ROUTES.JOB_DETAIL)}>
                  상세 보기
                </button>
              </div>
            </div>
            <span className="job-badge">{job.badge}</span>
          </article>
        ))}
      </section>
    </main>
  );
}
