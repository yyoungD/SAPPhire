import { useEffect, useMemo, useState } from 'react';
import { getAccessToken } from '../../api/apiClient.js';
import { jobApi } from '../../api/jobApi.js';
import { ROUTES } from '../../constanjs/routes.js';
import PersonalMemberHeader from '../../componenjs/layout/PersonalMemberHeader.jsx';
import { navigate } from '../../utils/authUtils.js';

const gsItmLogoUrl = new URL('../../assejs/images/company-logos/gs-itm.svg', import.meta.url).href;
const ktDsLogoUrl = new URL('../../assejs/images/company-logos/kt-ds.svg', import.meta.url).href;
const shinsegaeIncLogoUrl = new URL('../../assejs/images/company-logos/shinsegae-inc.jpg', import.meta.url).href;
const lgCnsLogoUrl = new URL('../../assejs/images/company-logos/lg-cns.png', import.meta.url).href;
const poscoDxLogoUrl = new URL('../../assejs/images/company-logos/posco-dx.png', import.meta.url).href;
const hanwhaSystemsLogoUrl = new URL('../../assejs/images/company-logos/hanwha-systems.svg', import.meta.url).href;

const MARKET = {
  DOMESTIC: 'domestic',
  OVERSEAS: 'overseas',
};

const domesticLocationKeywords = [
  'KR',
  'KOREA',
  'SEOUL',
  'BUSAN',
  'DAEGU',
  'INCHEON',
  'GWANGJU',
  'DAEJEON',
  'ULSAN',
  'SEJONG',
  'GYEONGGI',
  'KOREA',
];

const ignoredRoleTags = ['AI Recommended', 'Verified Company', 'Urgent'];

function isDomesticJob(job) {
  const location = (job.location || '').toUpperCase();
  return domesticLocationKeywords.some((keyword) => location.includes(keyword));
}

function isUrgentJob(job) {
  const match = /^D-(\d+)$/.exec(job.badge || '');
  return match ? Number(match[1]) <= 14 : false;
}

function includesText(value, keyword) {
  return (value || '').toLowerCase().includes(keyword);
}

function formatLocationFilterLabel(location) {
  return String(location || '')
    .replace(/\s*,\s*(KR|KOREA)\s*$/i, '')
    .trim();
}

function formatCount(value) {
  return Number(value || 0).toLocaleString();
}

function getInitial(company) {
  return (company || 'S').trim().slice(0, 1).toUpperCase();
}

function getBundledCompanyLogoUrl(company) {
  const normalizedCompany = String(company || '').toUpperCase();
  if (normalizedCompany.includes('LG CNS')) return lgCnsLogoUrl;
  if (normalizedCompany.includes('POSCO') || normalizedCompany.includes('포스코')) return poscoDxLogoUrl;
  if (normalizedCompany.includes('HANWHA') || normalizedCompany.includes('한화')) return hanwhaSystemsLogoUrl;
  if (normalizedCompany.includes('GS ITM')) return gsItmLogoUrl;
  if (normalizedCompany.includes('KT DS')) return ktDsLogoUrl;
  if (normalizedCompany.includes('SHINSEGAE') || normalizedCompany.includes('신세계')) return shinsegaeIncLogoUrl;
  return '';
}

function isKpmgCompany(company) {
  return String(company || '').toUpperCase().includes('KPMG');
}

function getCompanyLogoUrls(job) {
  const bundledLogo = getBundledCompanyLogoUrl(job.company);
  const uploadedLogo = job.logoUrl || job.companyLogoUrl || job.logoImageUrl;

  return [bundledLogo, uploadedLogo].filter(Boolean);
}

function CompanyLogo({ job }) {
  const useKpmgLogo = isKpmgCompany(job.company);
  const logoUrls = useMemo(() => getCompanyLogoUrls(job), [job]);
  const [logoIndex, setLogoIndex] = useState(0);
  const logoUrl = logoUrls[logoIndex] || '';
  const hasBundledLogo = Boolean(getBundledCompanyLogoUrl(job.company));

  useEffect(() => {
    setLogoIndex(0);
  }, [job.id, job.logoUrl, job.companyLogoUrl, job.logoImageUrl]);

  if (useKpmgLogo) {
    return (
      <div className="job-logo kpmg-logo" aria-hidden="true">
        <span>KPMG</span>
      </div>
    );
  }

  return (
    <div
      className={`job-logo ${logoUrl ? 'has-image' : ''} ${hasBundledLogo ? 'bundled-image' : ''} ${
        logoIndex >= 3 ? 'favicon-image' : ''
      }`}
      aria-hidden="true"
    >
      {logoUrl && (
        <img
          src={logoUrl}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setLogoIndex((current) => current + 1)}
        />
      )}
      <span>{getInitial(job.company)}</span>
    </div>
  );
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
  const [bookmarkIds, setBookmarkIds] = useState(() => new Set());
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [bookmarkingId, setBookmarkingId] = useState(null);

  const isSignedIn = Boolean(getAccessToken());

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

  useEffect(() => {
    if (!isSignedIn) return;

    let ignore = false;
    jobApi
      .bookmarks()
      .then((items) => {
        if (!ignore) {
          const nextJobs = Array.isArray(items) ? items : [];
          setBookmarkedJobs(nextJobs);
          setBookmarkIds(new Set(nextJobs.map((job) => job.id)));
        }
      })
      .catch(() => {
        if (!ignore) {
          setBookmarkedJobs([]);
          setBookmarkIds(new Set());
        }
      });

    return () => {
      ignore = true;
    };
  }, [isSignedIn]);

  const marketJobs = useMemo(
    () => jobs.filter((job) => (market === MARKET.DOMESTIC ? isDomesticJob(job) : !isDomesticJob(job))),
    [jobs, market]
  );

  const locations = useMemo(() => {
    const values = marketJobs.map((job) => formatLocationFilterLabel(job.location)).filter(Boolean);
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
  }, [marketJobs]);

  const roles = useMemo(() => {
    const values = marketJobs
      .flatMap((job) => job.tags || [])
      .filter((tag) => !ignoredRoleTags.includes(tag));
    return Array.from(new Set(values)).sort();
  }, [marketJobs]);

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return marketJobs.filter((job) => {
      const tagText = (job.tags || []).join(' ');
      const matchesLocation = !locationFilter || formatLocationFilterLabel(job.location) === locationFilter;
      const matchesRole =
        !roleFilter || (job.tags || []).includes(roleFilter) || includesText(job.title, roleFilter.toLowerCase());
      const matchesKeyword =
        !normalizedKeyword ||
        includesText(job.title, normalizedKeyword) ||
        includesText(job.company, normalizedKeyword) ||
        includesText(job.location, normalizedKeyword) ||
        includesText(tagText, normalizedKeyword);
      const matchesUrgent = !urgentOnly || isUrgentJob(job);
      const matchesSalary = !fixedSalaryOnly || job.salary !== 'Negotiable';

      return matchesLocation && matchesRole && matchesKeyword && matchesUrgent && matchesSalary;
    });
  }, [marketJobs, locationFilter, roleFilter, keyword, urgentOnly, fixedSalaryOnly]);

  const urgentCount = useMemo(() => marketJobs.filter(isUrgentJob).length, [marketJobs]);
  const fixedSalaryCount = useMemo(
    () => marketJobs.filter((job) => job.salary && job.salary !== 'Negotiable').length,
    [marketJobs]
  );
  const recentBookmarkedJobs = useMemo(() => bookmarkedJobs.slice(0, 3), [bookmarkedJobs]);

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

  const toggleBookmark = async (event, job) => {
    event.stopPropagation();
    if (!isSignedIn) {
      navigate(ROUTES.LOGIN);
      return;
    }

    const jobId = job.id;
    const wasBookmarked = bookmarkIds.has(jobId);
    setBookmarkingId(jobId);
    setBookmarkIds((current) => {
      const next = new Set(current);
      if (wasBookmarked) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
    setBookmarkedJobs((current) => {
      if (wasBookmarked) return current.filter((item) => item.id !== jobId);
      return [job, ...current.filter((item) => item.id !== jobId)];
    });

    try {
      if (wasBookmarked) await jobApi.removeBookmark(jobId);
      else await jobApi.addBookmark(jobId);
    } catch (err) {
      setBookmarkIds((current) => {
        const next = new Set(current);
        if (wasBookmarked) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
      setBookmarkedJobs((current) => {
        if (wasBookmarked) return [job, ...current.filter((item) => item.id !== jobId)];
        return current.filter((item) => item.id !== jobId);
      });
      window.alert(err.message || '북마크를 변경하지 못했습니다.');
    } finally {
      setBookmarkingId(null);
    }
  };

  return (
    <main className="member-page jobs-page">
      <PersonalMemberHeader active="jobs" />

      <section className="jobs-shell">
        <header className="jobs-hero">
          <div>
            <p className="eyebrow">SAP RECRUITMENT FEED</p>
            <h1>채용 공고</h1>
            <p>SAP 전문가를 위한 최신 프로젝트와 채용 기회를 한눈에 탐색하세요. 지역, 직무, 급여 조건까지 빠르게 좁혀볼 수 있습니다.</p>
          </div>
        </header>

        <section className="jobs-summary" aria-label="채용 공고 요약">
          <article>
            <span>현재 시장</span>
            <strong>{market === MARKET.DOMESTIC ? '국내 공고' : '해외 공고'}</strong>
            <small>{formatCount(marketJobs.length)}개 포지션을 탐색 중</small>
          </article>
          <article>
            <span>검색 결과</span>
            <strong>{loading ? '-' : `${formatCount(filteredJobs.length)}건`}</strong>
            <small>선택한 필터를 반영한 공고</small>
          </article>
          <article>
            <span>마감 임박</span>
            <strong>{formatCount(urgentCount)}건</strong>
            <small>D-14 이내 공고 기준</small>
          </article>
          <article>
            <span>급여 공개</span>
            <strong>{formatCount(fixedSalaryCount)}건</strong>
            <small>협의 외 급여 조건 표시</small>
          </article>
        </section>

        <section className="job-filter-panel" aria-label="채용 공고 필터">
          <div className="filter-tabs" role="tablist" aria-label="채용 시장 선택">
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

            <input
              aria-label="검색어"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="회사, 직무, SAP 모듈 검색"
            />

            <button type="button" className="filter-submit" onClick={() => setShowAdvanced((current) => !current)}>
              상세조건
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-filter-panel">
              <label>
                <input type="checkbox" checked={urgentOnly} onChange={(event) => setUrgentOnly(event.target.checked)} />
                <span>마감 임박만 보기</span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={fixedSalaryOnly}
                  onChange={(event) => setFixedSalaryOnly(event.target.checked)}
                />
                <span>급여 공개 공고</span>
              </label>
              <button type="button" onClick={resetFilters}>
                초기화
              </button>
            </div>
          )}
        </section>

        <div className="jobs-content-layout">
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
              filteredJobs.map((job, index) => (
                <article
                  className="job-card"
                  key={job.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`${job.title} 상세 페이지로 이동`}
                  onClick={() => openDetail(job.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, job.id)}
                >
                  <CompanyLogo job={job} />

                  <div className="job-card-body">
                    <div className="job-meta">
                      <strong>{job.company}</strong>
                      <span>{job.location || '지역 협의'}</span>
                    </div>

                    <div className="job-card-title-row">
                      <h2>{job.title}</h2>
                      <span>{job.badge || `#${index + 1}`}</span>
                    </div>

                    <div className="tag-row">
                      {(job.tags || []).slice(0, 6).map((tag) => (
                        <span key={`${job.id}-${tag}`}>#{tag}</span>
                      ))}
                    </div>

                    <div className="job-card-footer">
                      <span>{job.posted || '등록일 확인 중'}</span>
                      <span>{job.salary || '급여 협의'}</span>
                    </div>
                  </div>

                  <div className="job-card-side">
                    <strong>{isUrgentJob(job) ? '마감 임박' : '채용중'}</strong>
                    <span>{job.employmentType || job.workType || '상세 보기'}</span>
                    <button
                      type="button"
                      className={`job-bookmark-button ${bookmarkIds.has(job.id) ? 'active' : ''}`}
                      aria-label={bookmarkIds.has(job.id) ? 'Remove bookmark' : 'Add bookmark'}
                      aria-pressed={bookmarkIds.has(job.id)}
                      disabled={bookmarkingId === job.id}
                      onClick={(event) => toggleBookmark(event, job)}
                    >
                      {bookmarkIds.has(job.id) ? '저장됨' : '저장'}
                    </button>
                  </div>
                </article>
              ))}
          </section>

          <aside className="jobs-bookmark-sidebar" aria-label="관심 공고">
            <header>
              <div>
                <span>SAVED JOBS</span>
                <strong>관심공고</strong>
              </div>
              <button type="button" onClick={() => navigate(ROUTES.JOB_BOOKMARKS)}>
                더보기
              </button>
            </header>

            {!isSignedIn && <p className="jobs-bookmark-empty">로그인하면 관심공고를 저장하고 여기에서 바로 확인할 수 있습니다.</p>}

            {isSignedIn && recentBookmarkedJobs.length === 0 && <p className="jobs-bookmark-empty">아직 저장한 공고가 없습니다.</p>}

            {isSignedIn && recentBookmarkedJobs.length > 0 && (
              <div className="jobs-bookmark-list">
                {recentBookmarkedJobs.map((job) => (
                  <button
                    type="button"
                    className="jobs-bookmark-item"
                    key={job.id}
                    onClick={() => navigate(`${ROUTES.JOB_DETAIL}?id=${job.id}`)}
                  >
                    <span>{job.company}</span>
                    <strong>{job.title}</strong>
                    <small>{job.badge || job.posted || 'Open'}</small>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </section>
    </main>
  );
}
