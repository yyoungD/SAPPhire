import { useEffect, useMemo, useState } from 'react';
import { resumeApi } from '../../../api/resumeApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function getResumeIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function clampScore(score) {
  return Math.max(0, Math.min(100, Number(score || 0)));
}

export default function ResumeDetailPage() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const resumeId = useMemo(() => getResumeIdFromUrl(), []);

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
        const data = await resumeApi.detail(resumeId);
        setResume(data);
      } catch (err) {
        setError(err.message || '이력서 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadResume();
  }, [resumeId]);

  const score = clampScore(resume?.aiScore);
  const scoreStyle = { '--score': `${score * 3.6}deg` };
  const suggestions = resume?.analysis?.suggestions || [];
  const coreStrengths = (resume?.tags || []).slice(0, 3);

  return (
    <main className="member-page">
      <PersonalMemberHeader active="resume" />

      <section className="resume-detail-shell">
        <header className="resume-detail-hero">
          <p className="eyebrow">SAP RESUME DETAIL</p>
          <h1>이력서 상세</h1>
          <p>등록한 이력서 정보를 확인하고 관리하세요.</p>
        </header>

        {loading && (
          <article className="detail-section">
            <p className="career-copy">이력서 상세 정보를 불러오는 중입니다.</p>
          </article>
        )}

        {!loading && error && (
          <article className="detail-section">
            <h2>이력서를 찾을 수 없습니다</h2>
            <p>{error}</p>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.RESUMES)}>
              목록으로 돌아가기
            </button>
          </article>
        )}

        {!loading && !error && resume && (
          <div className="resume-detail-layout">
            <section className="resume-detail-main">
              <article className="resume-detail-card resume-detail-title-card">
                <div>
                  <div className="resume-detail-title-row">
                    <h2>{resume.title}</h2>
                    {resume.isPrimary && <span>PRIMARY</span>}
                  </div>
                  <p>
                    작성일 {resume.createdDate || '-'} <b>|</b> 최근 수정일 {resume.updatedDate || '-'}
                  </p>
                  {resume.originalFileName && <small>원본 파일: {resume.originalFileName}</small>}
                </div>
                <div className="resume-detail-actions">
                  <button type="button" className="secondary" onClick={() => navigate(`${ROUTES.RESUME_UPDATE}?id=${resume.id}`)}>
                    수정
                  </button>
                </div>
              </article>

              <article className="resume-detail-card">
                <h2>경력 요약</h2>
                <p className="resume-detail-summary">{resume.summary || '등록된 경력 요약이 없습니다. 수정 페이지에서 요약을 추가해 보세요.'}</p>
              </article>

              <article className="resume-detail-card">
                <h2>SAP 역량 매트릭스</h2>
                <div className="resume-skill-matrix">
                  {(resume.skills || []).length === 0 && <p className="empty-copy">등록된 SAP 역량이 없습니다.</p>}
                  {(resume.skills || []).map((skill) => (
                    <div className="resume-skill-meter" key={skill.id || skill.name}>
                      <div>
                        <strong>{skill.name}</strong>
                        <span>{skill.yearsOfExperience ? `${skill.yearsOfExperience}년` : '경력 미입력'}</span>
                      </div>
                      <progress value={skill.score || 0} max="100" />
                      <small>{skill.proficiencyLabel}</small>
                    </div>
                  ))}
                </div>
              </article>

              <article className="resume-detail-card">
                <h2>기술 스택 및 보유 기술</h2>
                <div className="resume-detail-tags">
                  {(resume.tags || []).length === 0 && <p className="empty-copy">등록된 기술 태그가 없습니다.</p>}
                  {(resume.tags || []).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              </article>

              <article className="resume-detail-card">
                <h2>경력 사항</h2>
                <div className="resume-experience-timeline">
                  {(resume.experiences || []).length === 0 && <p className="empty-copy">등록된 경력 사항이 없습니다.</p>}
                  {(resume.experiences || []).map((experience) => (
                    <section className="resume-experience-item" key={experience.id}>
                      <div>
                        <strong>{experience.position || experience.projectName || '프로젝트'}</strong>
                        <span>{experience.companyName}</span>
                      </div>
                      <em>{experience.period}</em>
                      <ul>
                        {(experience.descriptions || []).map((description) => (
                          <li key={description}>{description}</li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              </article>
            </section>

            <aside className="resume-detail-side">
              <section className="resume-score-panel">
                <div className="resume-ai-head">
                  <span>AI AGENT</span>
                  <strong>이력서 역량 진단</strong>
                </div>
                <div className="resume-score-ring" style={scoreStyle}>
                  <div>
                    <strong>{Math.round(score)}</strong>
                    <span>/ 100</span>
                  </div>
                </div>
                <div className="resume-side-block">
                  <h3>CORE STRENGTHS</h3>
                  {(coreStrengths.length ? coreStrengths : ['분석 대기']).map((strength) => (
                    <p key={strength}>{strength}</p>
                  ))}
                </div>
                <div className="resume-side-block">
                  <h3>RECOMMENDED MATCHES</h3>
                  <div className="resume-match-tags">
                    <span>SAP FI Consultant</span>
                    <span>SAP ERP Architect</span>
                    <span>SAP PMO Lead</span>
                  </div>
                </div>
                <button type="button" className="resume-analyze-button" onClick={() => navigate(ROUTES.AI_EVALUATION)}>
                  AI 리포트 보기
                </button>
              </section>

              <section className="resume-suggestion-card">
                <h3>IMPROVEMENT SUGGESTIONS</h3>
                <div>
                  {(suggestions.length ? suggestions : ['AI 진단을 실행하면 개선 제안이 표시됩니다.']).map((suggestion) => (
                    <p key={suggestion}>{suggestion}</p>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
