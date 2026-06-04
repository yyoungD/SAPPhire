import { useEffect, useMemo, useState } from 'react';
import { jobApi } from '../../api/jobApi.js';
import { ROUTES } from '../../constanjs/routes.js';
import PersonalMemberHeader from '../../componenjs/layout/PersonalMemberHeader.jsx';
import { navigate } from '../../utils/authUtils.js';

const MARKET = {
  DOMESTIC: 'domestic',
  OVERSEAS: 'overseas',
};

function isDomesticJob(job) {
  return (job.location || '').toUpperCase().includes('KR');
}

function isUrgentJob(job) {
  const match = /^D-(\d+)$/.exec(job.badge || '');
  return match ? Number(match[1]) <= 14 : false;
}

function includesText(value, keyword) {
  return (value || '').toLowerCase().includes(keyword);
}

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [market, setMarket] = useState(MARKET.DOMESTIC);
  const [locationFilter, setLocationFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [fixedSalaryOnly, setFixedSalaryOnly] = useState(false);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await jobApi.list({ limit: 200 });
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || '채용 공고를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const marketJobs = useMemo(
    () => jobs.filter((job) => (market === MARKET.DOMESTIC ? isDomesticJob(job) : !isDomesticJob(job))),
    [jobs, market],
  );

  const locations = useMemo(
    () => Array.from(new Set(marketJobs.map((job) => job.location).filter(Boolean))).sort(),
    [marketJobs],
  );

  const roles = useMemo(() => {
    const values = marketJobs.flatMap((job) => job.tags || []).filter((tag) => !['AI Recommended', 'Verified Company', 'Urgent'].includes(tag));
    return Array.from(new Set(values)).sort();
  }, [marketJobs]);

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return marketJobs.filter((job) => {
      const tagText = (job.tags || []).join(' ');
      const matchesLocation = !locationFilter || job.location === locationFilter;
      const matchesRole = !roleFilter || (job.tags || []).includes(roleFilter) || includesText(job.title, roleFilter.toLowerCase());
      const matchesKeyword =
        !normalizedKeyword ||
        includesText(job.title, normalizedKeyword) ||
        includesText(job.company, normalizedKeyword) ||
        includesText(job.location, normalizedKeyword) ||
        includesText(tagText, normalizedKeyword);
      const matchesUrgent = !urgentOnly || isUrgentJob(job);
      const matchesSalary = !fixedSalaryOnly || job.salary !== '협의 후 결정';

      return matchesLocation && matchesRole && matchesKeyword && matchesUrgent && matchesSalary;
    });
  }, [marketJobs, locationFilter, roleFilter, keyword, urgentOnly, fixedSalaryOnly]);

  const resetFilters = () => {
    setLocationFilter('');
    setRoleFilter('');
    setKeyword('');
    setUrgentOnly(false);
    setFixedSalaryOnly(false);
  };

  const changeMarket = (nextMarket) => {
    setMarket(nextMarket);
    setLocationFilter('');
    setRoleFilter('');
  };

  const openDetail = (jobId) => {
    navigate(`${ROUTES.JOB_DETAIL}?id=${jobId}`);
  };

  const handleCardKeyDown = (event, jobId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail(jobId);
    }
  };

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
          <button type="button" className={market === MARKET.DOMESTIC ? 'active' : ''} onClick={() => changeMarket(MARKET.DOMESTIC)}>
            국내
          </button>
          <button type="button" className={market === MARKET.OVERSEAS ? 'active' : ''} onClick={() => changeMarket(MARKET.OVERSEAS)}>
            해외
          </button>
        </div>

        <div className="filter-row">
          <select aria-label="지역" value={locationFilter} onChange={(event) => setLocationFilter(event.target.value)}>
            <option value="">지역 전체</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select aria-label="직무" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">직무 선택</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>

          <input aria-label="검색어" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="검색어 입력" />

          <button type="button" className="filter-submit" onClick={() => setShowAdvanced((current) => !current)}>
            상세조건
          </button>
        </div>

        {showAdvanced && (
          <div className="advanced-filter-panel">
            <label>
              <input type="checkbox" checked={urgentOnly} onChange={(event) => setUrgentOnly(event.target.checked)} />
              <span>마감 임박</span>
            </label>
            <label>
              <input type="checkbox" checked={fixedSalaryOnly} onChange={(event) => setFixedSalaryOnly(event.target.checked)} />
              <span>급여 공개</span>
            </label>
            <button type="button" onClick={resetFilters}>
              초기화
            </button>
          </div>
        )}

        <div className="filter-summary">
          <span>공고 전체</span>
          <strong>{loading ? '-' : filteredJobs.length.toLocaleString()}건</strong>
        </div>
      </section>

      <section className="job-list" aria-label="채용 공고 목록">
        {loading && <p className="career-copy">채용 공고를 불러오는 중입니다.</p>}

        {!loading && error && (
          <article className="detail-section">
            <p>{error}</p>
            <button type="button" className="secondary" onClick={loadJobs}>
              다시 불러오기
            </button>
          </article>
        )}

        {!loading && !error && filteredJobs.length === 0 && <p className="career-copy">조건에 맞는 채용 공고가 없습니다.</p>}

        {!loading &&
          !error &&
          filteredJobs.map((job) => (
            <article
              className="job-card"
              key={job.id}
              role="link"
              tabIndex={0}
              aria-label={`${job.title} 상세 페이지로 이동`}
              onClick={() => openDetail(job.id)}
              onKeyDown={(event) => handleCardKeyDown(event, job.id)}
            >
              <div className="job-logo">{(job.company || 'S').slice(0, 1)}</div>
              <div className="job-card-body">
                <div className="job-meta">
                  <strong>{job.company}</strong>
                  <span>{job.location}</span>
                </div>
                <h2>{job.title}</h2>
                <div className="tag-row">
                  {(job.tags || []).map((tag) => (
                    <span key={`${job.id}-${tag}`}>#{tag}</span>
                  ))}
                </div>
                <div className="job-card-footer">
                  <span>{job.posted}</span>
                  <span>{job.salary}</span>
                </div>
              </div>
              <span className="job-badge">{job.badge}</span>
            </article>
          ))}
      </section>
    </main>
  );
}
