import { useEffect, useMemo, useState } from 'react';
import { resumeApi } from '../../../api/resumeApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const fallbackAnalysis = {
  moduleProficiency: 0,
  integrationKnowledge: 0,
  projectSpecificity: 'AI 진단 데이터가 아직 없습니다. 이력서를 업로드하면 SAP 프로젝트 경험과 기술 스택을 기반으로 분석 결과가 표시됩니다.',
  suggestions: ['이력서 업로드 후 AI 진단을 실행해 보세요.'],
};

function isEmptyListServerError(err) {
  return err?.status === 500;
}

function scoreTone(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  return 'quiet';
}

export default function ResumeListPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await resumeApi.list();
      setResumes(Array.isArray(data) ? data : []);
    } catch (err) {
      if (isEmptyListServerError(err)) {
        setResumes([]);
        setError('');
        return;
      }
      setError(err.message || '이력서 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const primaryResume = useMemo(() => resumes.find((resume) => resume.isPrimary) || resumes[0], [resumes]);
  const analysis = primaryResume?.analysis || fallbackAnalysis;

  const openDetail = (id) => navigate(`${ROUTES.RESUME_DETAIL}?id=${id}`);

  const handleCardKeyDown = (event, id) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail(id);
    }
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="resume" />

      <section className="resume-shell">
        <header className="resume-hero">
          <p className="eyebrow">SAP RESUME STUDIO</p>
          <h1>이력서 관리</h1>
          <p>
            SAP 전문가로서의 가치를 증명하세요. AI 기반 진단과 최적화 제안을 통해 프로젝트와 모듈 역량이 잘 드러나는
            이력서를 관리할 수 있습니다.
          </p>
        </header>

        <section className="resume-workspace">
          <div className="resume-list-column">
            <div className="resume-list-head">
              <div>
                <strong>나의 이력서</strong>
                <span>{loading ? '-' : `${resumes.length.toLocaleString()}건`}</span>
              </div>
              <button type="button" className="primary-action resume-upload-button" onClick={() => navigate(ROUTES.RESUME_CREATE)}>
                이력서 업로드
              </button>
            </div>

            {loading && <p className="career-copy">이력서 목록을 불러오는 중입니다.</p>}

            {!loading && error && (
              <article className="detail-section">
                <p>{error}</p>
                <button type="button" className="secondary" onClick={loadResumes}>
                  다시 불러오기
                </button>
              </article>
            )}

            {!loading && !error && resumes.length === 0 && (
              <article className="resume-empty-card">
                <div aria-hidden="true">+</div>
                <strong>아직 등록된 이력서가 없습니다</strong>
                <p>모듈별, 경력별 이력서를 업로드하고 AI 최적화 제안을 받아보세요.</p>
              </article>
            )}

            {!loading &&
              !error &&
              resumes.map((resume) => (
                <article
                  className={`resume-card resume-card-clickable ${resume.isPrimary ? 'is-primary' : ''}`}
                  key={resume.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`${resume.title} 이력서 열기`}
                  onClick={() => openDetail(resume.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, resume.id)}
                >
                  <div className="resume-card-top">
                    <div>
                      <div className="resume-title-row">
                        <h2>{resume.title}</h2>
                        {resume.isPrimary && <span>DEFAULT</span>}
                      </div>
                      <p>최종 수정일 {resume.updatedDate || '-'}</p>
                    </div>
                    <div className={`resume-score ${scoreTone(Number(resume.aiScore || 0))}`}>
                      <strong>{Math.round(Number(resume.aiScore || 0))}</strong>
                      <span>/100</span>
                      <small>AI SCORE</small>
                    </div>
                  </div>

                  <div className="resume-tags">
                    {(resume.tags || []).map((tag) => (
                      <span key={`${resume.id}-${tag}`}>#{tag}</span>
                    ))}
                  </div>

                  <div className="resume-card-meta">
                    <span>{resume.visibilityLabel}</span>
                  </div>
                </article>
              ))}
          </div>

          <aside className="resume-ai-panel">
            <div className="resume-ai-head">
              <span>AI AGENT</span>
              <strong>전문가 역량 진단</strong>
            </div>

            <div className="resume-ai-section">
              <h2>TECH STACK ANALYSIS</h2>
              <div className="resume-progress-row">
                <span>S/4HANA Module Proficiency</span>
                <strong>{analysis.moduleProficiency || 0}%</strong>
              </div>
              <progress value={analysis.moduleProficiency || 0} max="100" />
              <div className="resume-progress-row">
                <span>FICO Integration Knowledge</span>
                <strong>{analysis.integrationKnowledge || 0}%</strong>
              </div>
              <progress value={analysis.integrationKnowledge || 0} max="100" />
            </div>

            <div className="resume-insight-box">
              <h2>PROJECT SPECIFICITY</h2>
              <p>{analysis.projectSpecificity}</p>
            </div>

            <div className="resume-ai-section">
              <h2>IMPROVEMENT SUGGESTIONS</h2>
              <ul>
                {(analysis.suggestions || fallbackAnalysis.suggestions).map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            </div>

          </aside>
        </section>
      </section>
    </main>
  );
}
