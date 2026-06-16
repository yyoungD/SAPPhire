import { useEffect, useMemo, useState } from 'react';
import { fileApi } from '../../../api/fileApi.js';
import { resumeApi } from '../../../api/resumeApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function getResumeIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function getApplicantInitial(name) {
  return (name || '지원자').trim().charAt(0);
}

function formatCareerYears(value) {
  const years = Number(value || 0);
  return years > 0 ? `경력 ${years}년` : '경력 미입력';
}

function formatPhoneNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value || '-';
}

export default function CompanyResumeDetailPage() {
  const resumeId = useMemo(() => getResumeIdFromUrl(), []);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingResume, setDownloadingResume] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      if (!resumeId) {
        setError('이력서 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        setResume(await resumeApi.publicDetail(resumeId));
      } catch (err) {
        setError(err.message || '공개 이력서 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [resumeId]);

  const downloadResume = async () => {
    if (!resume?.resumeFileId) return;

    setDownloadingResume(true);
    try {
      await fileApi.download(
        resume.resumeFileId,
        resume.originalFileName || resume.title || 'resume'
      );
    } catch (err) {
      alert(err.message || '이력서 다운로드에 실패했습니다.');
    } finally {
      setDownloadingResume(false);
    }
  };

  const downloadPortfolio = () => {
    if (!resume?.portfolioUrl) return;
    window.open(resume.portfolioUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="company-candidate-page">
      <CompanyMemberHeader active="resumes" />
      <section className="company-candidate-shell compact">
        {loading && (
          <article className="detail-section">
            <p className="career-copy">공개 이력서 상세 정보를 불러오는 중입니다.</p>
          </article>
        )}

        {!loading && error && (
          <article className="detail-section">
            <h2>공개 이력서를 찾을 수 없습니다.</h2>
            <p className="form-error">{error}</p>
            <button
              type="button"
              className="secondary"
              onClick={() => navigate(ROUTES.COMPANY_RESUMES)}
            >
              목록으로 돌아가기
            </button>
          </article>
        )}

        {!loading && !error && resume && (
          <div className="application-detail-layout">
            <section className="application-detail-main">
              <article className="detail-hero-card company-application-hero">
                <p className="eyebrow">PROFILE DETAIL</p>
                <div className="company-application-title-row">
                  <div className="company-application-profile">
                    <div className="company-application-avatar">
                      {resume.applicantProfileImageUrl ? (
                        <img
                          src={resume.applicantProfileImageUrl}
                          alt={`${resume.applicantName || '지원자'} 프로필`}
                        />
                      ) : (
                        <span>{getApplicantInitial(resume.applicantName)}</span>
                      )}
                    </div>
                    <div>
                      <h1>{resume.applicantName || '지원자'}</h1>
                      <p>
                        {resume.professionalTitle || resume.title || '-'} · {resume.location || '-'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="detail-badges">
                  <span>{formatCareerYears(resume.careerYears)}</span>
                  <span>{resume.workType || '근무형태 미입력'}</span>
                  <span>{resume.visibilityLabel || '-'}</span>
                  <span>수정일 {resume.updatedDate || '-'}</span>
                </div>
              </article>

              <article className="detail-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">PROFILE</p>
                    <h2>프로필 정보</h2>
                  </div>
                </div>
                <dl className="application-detail-dl">
                  <div>
                    <dt>이름</dt>
                    <dd>{resume.applicantName || '-'}</dd>
                  </div>
                  <div>
                    <dt>이메일</dt>
                    <dd>{resume.applicantEmail || '-'}</dd>
                  </div>
                  <div>
                    <dt>전화번호</dt>
                    <dd>{formatPhoneNumber(resume.applicantPhone)}</dd>
                  </div>
                  <div>
                    <dt>희망 연봉</dt>
                    <dd>{resume.desiredSalary || '-'}</dd>
                  </div>
                </dl>
              </article>

              <article className="detail-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">RESUME</p>
                    <h2>공개 이력서</h2>
                  </div>
                  <button
                    type="button"
                    className="section-edit-button"
                    onClick={downloadResume}
                    disabled={!resume.resumeFileId || downloadingResume}
                  >
                    {downloadingResume ? '다운로드 중...' : '이력서 다운로드'}
                  </button>
                </div>
                <dl className="application-detail-dl">
                  <div>
                    <dt>이력서 제목</dt>
                    <dd>{resume.title || '-'}</dd>
                  </div>
                  <div>
                    <dt>원본 파일</dt>
                    <dd>{resume.originalFileName || '등록된 파일 정보가 없습니다.'}</dd>
                  </div>
                  <div>
                    <dt>포트폴리오</dt>
                    <dd>{resume.portfolioUrl || '등록된 포트폴리오가 없습니다.'}</dd>
                  </div>
                  <div>
                    <dt>수정일</dt>
                    <dd>{resume.updatedDate || '-'}</dd>
                  </div>
                </dl>
              </article>

              <article className="detail-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">SAP SKILLS</p>
                    <h2>SAP 역량</h2>
                  </div>
                </div>
                <div className="company-job-tags company-resume-detail-tags">
                  {(resume.tags || []).length > 0 ? (
                    resume.tags.map((tag) => <span key={tag}>#{tag}</span>)
                  ) : (
                    <p className="career-copy">등록된 SAP 스킬이 없습니다.</p>
                  )}
                </div>
                <dl className="application-detail-dl resume-skill-detail-list">
                  {(resume.skills || []).map((skill) => (
                    <div key={skill.id}>
                      <dt>{skill.name}</dt>
                      <dd>
                        {skill.proficiencyLabel || skill.proficiencyLevel || '-'} ·{' '}
                        {skill.yearsOfExperience || 0}년
                      </dd>
                    </div>
                  ))}
                </dl>
              </article>

              <article className="detail-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">INTRODUCTION</p>
                    <h2>자기소개 및 핵심 역량</h2>
                  </div>
                </div>
                <p className="application-cover-letter">
                  {resume.profileSummary ||
                    resume.summary ||
                    resume.coreCompetencies ||
                    '등록된 소개 정보가 없습니다.'}
                </p>
              </article>

              <article className="detail-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">EXPERIENCE</p>
                    <h2>경력 및 프로젝트</h2>
                  </div>
                </div>
                {(resume.experiences || []).length === 0 && (
                  <p className="career-copy">등록된 경력 정보가 없습니다.</p>
                )}
                {(resume.experiences || []).map((experience) => (
                  <div className="company-resume-experience" key={experience.id}>
                    <strong>
                      {experience.projectName || experience.companyName || '프로젝트'}
                    </strong>
                    <span>{experience.period || '-'}</span>
                    <p>
                      {[experience.companyName, experience.position, experience.role]
                        .filter(Boolean)
                        .join(' · ') || '-'}
                    </p>
                    {(experience.descriptions || []).map((description) => (
                      <small key={description}>{description}</small>
                    ))}
                  </div>
                ))}
              </article>
            </section>

            <aside className="company-resume-side-panel">
              <section className="company-resume-side-card">
                <h2>AI 매칭률</h2>
                <div className="apply-summary-score">
                  <span>예정 기능</span>
                  <strong>{resume.aiScore || 0}%</strong>
                </div>
              </section>

              <section className="company-resume-side-card company-resume-side-section">
                <button type="button" className="primary-action company-resume-offer-button">
                  제안서 보내기
                </button>
                <button
                  type="button"
                  className="secondary company-resume-list-button"
                  onClick={() => navigate(ROUTES.COMPANY_RESUMES)}
                >
                  이력서 목록
                </button>
              </section>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
