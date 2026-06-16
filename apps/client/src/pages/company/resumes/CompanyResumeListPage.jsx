import { useEffect, useMemo, useState } from 'react';
import { resumeApi } from '../../../api/resumeApi.js';
import { sapSkillApi } from '../../../api/sapSkillApi.js';
import SapSkillFilter from '../../../componenjs/common/SapSkillFilter.jsx';
import SearchBar from '../../../componenjs/common/SearchBar.jsx';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const careerFilterOptions = [
  { value: '', label: '경력 필터' },
];

function getInitial(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || '?';
}

function formatCareerYears(value) {
  const years = Number(value || 0);
  return years > 0 ? `경력 ${years}년` : '경력 미입력';
}

function normalizeSkillName(value = '') {
  return value.replace(/^SAP\s+/i, '').replace(/\s+/g, '').toUpperCase();
}

function scoreTone(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  return 'quiet';
}

export default function CompanyResumeListPage() {
  const [resumes, setResumes] = useState([]);
  const [skills, setSkills] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [careerFilter, setCareerFilter] = useState('');
  const [activeSkillType, setActiveSkillType] = useState('MODULE');
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [skillKeyword, setSkillKeyword] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const [resumeData, skillData] = await Promise.all([resumeApi.publicList(), sapSkillApi.list()]);
      setResumes(Array.isArray(resumeData) ? resumeData : []);
      setSkills(Array.isArray(skillData) ? skillData : []);
    } catch (err) {
      setError(err.message || '공개 이력서 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const selectedSkills = useMemo(() => skills.filter((skill) => selectedSkillIds.includes(skill.id)), [selectedSkillIds, skills]);

  const filteredResumes = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    const selectedNames = selectedSkills.map((skill) => normalizeSkillName(skill.name));

    return resumes.filter((resume) => {
      const resumeSkillNames = (resume.tags || []).map((tag) => normalizeSkillName(tag));
      const searchableText = [
        resume.title,
        resume.summary,
        resume.applicantName,
        resume.location,
        resume.visibilityLabel,
        ...(resume.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesKeyword = !normalizedKeyword || searchableText.includes(normalizedKeyword);
      const matchesSkills = selectedNames.length === 0 || selectedNames.every((skillName) => resumeSkillNames.includes(skillName));

      return matchesKeyword && matchesSkills;
    });
  }, [keyword, resumes, selectedSkills]);

  const toggleSkill = (skillId) => {
    setSelectedSkillIds((current) => (current.includes(skillId) ? current.filter((id) => id !== skillId) : [...current, skillId]));
  };

  const clearSkills = () => {
    setSelectedSkillIds([]);
    setSkillKeyword('');
  };

  const openDetail = (resumeId) => {
    navigate(`${ROUTES.COMPANY_RESUME_DETAIL}?id=${resumeId}`);
  };

  const handleCardKeyDown = (event, resumeId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail(resumeId);
    }
  };

  return (
    <main className="company-job-list-page company-resume-list-page">
      <CompanyMemberHeader active="resumes" />

      <section className="company-job-list-shell">
        <div className="company-job-list-hero">
          <div>
            <p className="eyebrow">TALENT POOL</p>
            <h1 className="company-page-title">공개 이력서 목록</h1>
          </div>
        </div>

        <section className={`company-job-filter-panel ${filterOpen ? 'expanded' : ''}`} aria-label="이력서 필터">
          <button type="button" className="company-job-filter-trigger" onClick={() => setFilterOpen((current) => !current)}>
            직군
            {selectedSkills.length > 0 && <strong>{selectedSkills.length}</strong>}
          </button>
          <select value={careerFilter} onChange={(event) => setCareerFilter(event.target.value)} aria-label="경력 필터">
            {careerFilterOptions.map((item) => (
              <option value={item.value} key={item.label}>
                {item.label}
              </option>
            ))}
          </select>
          <SearchBar value={keyword} onChange={setKeyword} placeholder="이름, 이력서 제목, SAP 스킬 검색" label="공개 이력서 검색" />

          {filterOpen && (
            <SapSkillFilter
              skills={skills}
              selectedSkillIds={selectedSkillIds}
              activeSkillType={activeSkillType}
              skillKeyword={skillKeyword}
              resultCount={filteredResumes.length}
              onActiveSkillTypeChange={setActiveSkillType}
              onSkillKeywordChange={setSkillKeyword}
              onToggleSkill={toggleSkill}
              onClear={clearSkills}
            />
          )}
        </section>

        <section className="company-resume-list-head">
          <strong>{loading ? '-' : filteredResumes.length.toLocaleString()}건</strong>
          <span>공개 또는 기업공개 상태의 이력서만 표시됩니다.</span>
        </section>

        {loading && <p className="career-copy">공개 이력서 목록을 불러오는 중입니다.</p>}

        {!loading && error && (
          <article className="detail-section">
            <p className="form-error">{error}</p>
            <button type="button" className="secondary" onClick={loadResumes}>
              다시 불러오기
            </button>
          </article>
        )}

        {!loading && !error && filteredResumes.length === 0 && (
          <article className="detail-section company-resume-empty">
            <strong>표시할 공개 이력서가 없습니다.</strong>
            <p>개인회원이 이력서를 공개 또는 기업공개 상태로 등록하면 이 목록에 표시됩니다.</p>
          </article>
        )}

        {!loading && !error && filteredResumes.length > 0 && (
          <section className="company-resume-grid">
            {filteredResumes.map((resume) => {
              const score = Number(resume.aiScore || 0);
              return (
                <article
                  className="company-resume-card"
                  key={resume.id}
                  role="link"
                  tabIndex={0}
                  onClick={() => openDetail(resume.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, resume.id)}
                >
                  <div className="company-resume-avatar" aria-hidden="true">
                    {resume.applicantProfileImageUrl ? (
                      <img src={resume.applicantProfileImageUrl} alt="" />
                    ) : (
                      <span>{getInitial(resume.applicantName)}</span>
                    )}
                  </div>

                  <div className="company-resume-card-main">
                    <div className="company-resume-card-top">
                      <div>
                        <p>
                          <strong>{resume.applicantName || '이름 미입력'}</strong>
                          {resume.location && <span> · {resume.location}</span>}
                        </p>
                        <h2>{resume.title || '제목 없는 이력서'}</h2>
                      </div>
                      <div className={`resume-score ${scoreTone(score)}`}>
                        <strong>{Math.round(score)}</strong>
                        <span>/100</span>
                        <small>AI SCORE</small>
                      </div>
                    </div>

                    {resume.summary && <p className="company-resume-summary">{resume.summary}</p>}

                    <div className="company-job-tags">
                      {(resume.tags || []).slice(0, 5).map((tag) => (
                        <span key={`${resume.id}-${tag}`}>#{tag}</span>
                      ))}
                    </div>

                    <div className="company-resume-meta">
                      <span>{resume.visibilityLabel}</span>
                      <span>{formatCareerYears(resume.careerYears)}</span>
                      <span>수정일 {resume.updatedDate || '-'}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </section>
    </main>
  );
}
