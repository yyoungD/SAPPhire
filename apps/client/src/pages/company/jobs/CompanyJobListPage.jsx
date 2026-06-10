import { useEffect, useMemo, useState } from 'react';
import { jobApi } from '../../../api/jobApi.js';
import { sapSkillApi } from '../../../api/sapSkillApi.js';
import SearchBar from '../../../componenjs/common/SearchBar.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const statusOptions = [
  { value: '', label: '공고 상태' },
  { value: 'OPEN', label: '모집 중' },
  { value: 'DRAFT', label: '임시저장' },
  { value: 'CLOSED', label: '마감' },
  { value: 'DELETED', label: '숨김' },
];

const statusClassNames = {
  OPEN: 'open',
  DRAFT: 'draft',
  CLOSED: 'closed',
  DELETED: 'hidden',
};

const skillTypeLabels = {
  MODULE: '모듈 (Modules)',
  SOLUTION: '솔루션 (Solutions)',
  TECHNICAL: '테크닉 (Techniques)',
};

const skillTypeOrder = ['MODULE', 'SOLUTION', 'TECHNICAL'];

function BriefcaseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 6V5a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1" />
      <path d="M4 8h16v11H4z" />
      <path d="M8 13v3M12 11v5M16 14v2" />
    </svg>
  );
}

function MoreHorizontalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function normalizeSkillName(value = '') {
  return value.replace(/^SAP\s+/i, '').replace(/\s+/g, '').toUpperCase();
}

function groupSkills(skills = []) {
  return skillTypeOrder.map((type) => ({
    type,
    label: skillTypeLabels[type],
    skills: skills.filter((skill) => skill.skillType === type),
  }));
}

export default function CompanyJobListPage() {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSkillType, setActiveSkillType] = useState('MODULE');
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skillKeyword, setSkillKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const [jobData, skillData] = await Promise.all([jobApi.myCompanyJobs(), sapSkillApi.list()]);
      setJobs(Array.isArray(jobData) ? jobData : []);
      setSkills(Array.isArray(skillData) ? skillData : []);
    } catch (err) {
      setError(err.message || '공고 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const skillGroups = useMemo(() => groupSkills(skills), [skills]);
  const activeGroup = useMemo(() => skillGroups.find((group) => group.type === activeSkillType) || skillGroups[0], [activeSkillType, skillGroups]);
  const selectedSkills = useMemo(() => skills.filter((skill) => selectedSkillIds.includes(skill.id)), [selectedSkillIds, skills]);

  const visibleSkills = useMemo(() => {
    const normalizedKeyword = skillKeyword.trim().toLowerCase();
    return (activeGroup?.skills || []).filter((skill) => {
      if (!normalizedKeyword) return true;
      return `${skill.name} ${skill.code}`.toLowerCase().includes(normalizedKeyword);
    });
  }, [activeGroup, skillKeyword]);

  const filteredJobs = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const selectedNames = selectedSkills.map((skill) => normalizeSkillName(skill.name));
    return jobs.filter((job) => {
      const jobSkillNames = (job.tags || []).map((tag) => normalizeSkillName(tag));
      const matchesSkills = selectedNames.length === 0 || selectedNames.every((skillName) => jobSkillNames.includes(skillName));
      const matchesStatus = !status || job.status === status;
      const matchesKeyword = !normalizedKeyword || String(job.title || '').toLowerCase().includes(normalizedKeyword);
      return matchesSkills && matchesStatus && matchesKeyword;
    });
  }, [jobs, keyword, selectedSkills, status]);

  const totalViews = useMemo(() => jobs.reduce((sum, job) => sum + (job.viewCount || 0), 0), [jobs]);

  const toggleSkill = (skillId) => {
    setSelectedSkillIds((current) => (current.includes(skillId) ? current.filter((id) => id !== skillId) : [...current, skillId]));
  };

  const clearSkills = () => {
    setSelectedSkillIds([]);
    setSkillKeyword('');
  };

  const openUpdatePage = (jobId) => {
    setOpenMenuId(null);
    navigate(`${ROUTES.COMPANY_JOB_UPDATE}?id=${jobId}`);
  };

  const openDetailPage = (jobId) => {
    navigate(`${ROUTES.COMPANY_JOB_DETAIL}?id=${jobId}`);
  };

  const openDetailPageWithKeyboard = (event, jobId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetailPage(jobId);
    }
  };

  return (
    <main className="company-job-list-page">
      <section className="company-job-list-shell">
        <div className="company-job-list-hero">
          <div>
            <p className="eyebrow">JOB POSTING MANAGEMENT</p>
            <h1>채용 공고 목록</h1>
          </div>
          <button type="button" className="primary-action company-job-create-button" onClick={() => navigate(ROUTES.COMPANY_JOB_CREATE)}>
            공고 등록하기
          </button>
        </div>

        <div className="company-job-list-layout">
          <section className="company-job-main-column">
            <section className={`company-job-filter-panel ${filterOpen ? 'expanded' : ''}`} aria-label="공고 필터">
              <button type="button" className="company-job-filter-trigger" onClick={() => setFilterOpen((current) => !current)}>
                직군
                {selectedSkills.length > 0 && <strong>{selectedSkills.length}</strong>}
              </button>
              <select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="공고 상태">
                {statusOptions.map((item) => (
                  <option value={item.value} key={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
              <SearchBar value={keyword} onChange={setKeyword} placeholder="제목으로 검색" label="공고 제목 검색" />

              {filterOpen && (
                <div className="company-job-mega-filter">
                  <nav aria-label="SAP 스킬 유형">
                    {skillGroups.map((group) => (
                      <button type="button" key={group.type} className={activeSkillType === group.type ? 'active' : ''} onClick={() => setActiveSkillType(group.type)}>
                        {group.label}
                      </button>
                    ))}
                  </nav>
                  <section className="company-job-skill-picker">
                    <div className="company-job-skill-toolbar">
                      <SearchBar value={skillKeyword} onChange={setSkillKeyword} placeholder="기술명 검색" label="SAP 스킬 검색" />
                      <button type="button" onClick={clearSkills}>
                        선택초기화
                      </button>
                    </div>
                    <div className="company-job-skill-grid">
                      {visibleSkills.map((skill) => (
                        <label key={skill.id}>
                          <input type="checkbox" checked={selectedSkillIds.includes(skill.id)} onChange={() => toggleSkill(skill.id)} />
                          <span>{skill.name}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                  <footer>
                    <span>선택됨:</span>
                    {selectedSkills.length === 0 && <em>없음</em>}
                    {selectedSkills.map((skill) => (
                      <button type="button" key={skill.id} onClick={() => toggleSkill(skill.id)}>
                        {skill.name} ×
                      </button>
                    ))}
                    <strong>{filteredJobs.length}건 검색완료</strong>
                  </footer>
                </div>
              )}
            </section>

            {loading && <p className="career-copy">공고 목록을 불러오는 중입니다.</p>}
            {!loading && error && (
              <article className="detail-section">
                <p className="form-error">{error}</p>
                <button type="button" className="secondary" onClick={loadJobs}>
                  다시 불러오기
                </button>
              </article>
            )}
            {!loading && !error && filteredJobs.length === 0 && <p className="career-copy">조건에 맞는 공고가 없습니다.</p>}

            {!loading &&
              !error &&
              filteredJobs.map((job) => (
                <article
                  className="company-job-card"
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetailPage(job.id)}
                  onKeyDown={(event) => openDetailPageWithKeyboard(event, job.id)}
                >
                  <div className="company-job-icon">
                    <BriefcaseIcon />
                  </div>
                  <div className="company-job-card-main">
                    <p>
                      <strong>{job.company}</strong>
                      <span className="company-job-card-menu">
                        <button
                          type="button"
                          className="company-job-card-menu-trigger"
                          aria-label="공고 관리 메뉴"
                          aria-expanded={openMenuId === job.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuId((current) => (current === job.id ? null : job.id));
                          }}
                        >
                          <MoreHorizontalIcon />
                        </button>
                        {openMenuId === job.id && (
                          <span className="company-job-card-menu-list">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                openUpdatePage(job.id);
                              }}
                            >
                              수정
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenMenuId(null);
                              }}
                            >
                              삭제
                            </button>
                          </span>
                        )}
                      </span>
                      {job.location && <span> · {job.location}</span>}
                    </p>
                    <h2>{job.title}</h2>
                    <div className="company-job-tags">
                      {(job.tags || []).slice(0, 4).map((tag) => (
                        <span key={tag}>#{tag.replace(/^SAP\s+/i, 'SAP_').replace(/\s+/g, '_').toUpperCase()}</span>
                      ))}
                    </div>
                    <div className="company-job-meta">
                      <span>{job.createdAt}</span>
                      <span>조회 {job.viewCount || 0}회</span>
                    </div>
                  </div>
                  <div className="company-job-card-side">
                    <span className={`company-job-status ${statusClassNames[job.status] || ''}`}>{job.statusLabel || job.status}</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDetailPage(job.id);
                      }}
                    >
                      상세 보기 →
                    </button>
                  </div>
                </article>
              ))}
          </section>

          <aside className="company-job-side-column">
            <section className="company-job-todo-card">
              <h2>To-Do / 알림</h2>
              <p>현재 미열람 지원자가 <strong>12명</strong> 있습니다.</p>
              <p>내일 마감되는 공고가 <strong>1건</strong> 있습니다.</p>
            </section>

            <section className="company-job-summary-card">
              <h2>채용 퍼널 요약</h2>
              <dl>
                <div>
                  <dt>전체 진행 중인 공고의 누적 조회수</dt>
                  <dd>{totalViews}회</dd>
                </div>
                <div>
                  <dt>누적 지원자 수</dt>
                  <dd>123명</dd>
                </div>
                <div>
                  <dt>지원자 평균 AI 매칭률</dt>
                  <dd>88%</dd>
                </div>
              </dl>
            </section>

            <section className="company-job-guide-card">
              <strong>효과적인 SAP 인재 채용 가이드</strong>
              <p>AI 매칭률을 높이는 공고 작성 가이드</p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
