import { useEffect, useMemo, useState } from 'react';
import { personalProfileApi } from '../../../api/personalProfileApi.js';
import { recommendationApi } from '../../../api/recommendationApi.js';
import { resumeApi } from '../../../api/resumeApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function firstFilled(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') || '-';
}

function scoreTone(score) {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  return 'quiet';
}

function normalizeResumeId(resumes, selectedResumeId) {
  if (selectedResumeId) return selectedResumeId;
  return resumes.find((resume) => resume.isPrimary)?.id || resumes[0]?.id || '';
}

export default function AiEvaluationPage() {
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedResume = useMemo(
    () => resumes.find((resume) => String(resume.id) === String(selectedResumeId)),
    [resumes, selectedResumeId],
  );

  const loadRecommendations = async (resumeId) => {
    if (!resumeId) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await recommendationApi.jobs({ resumeId, limit: 30 });
      setRecommendations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || '추천 공고를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadBaseData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileData, resumeData] = await Promise.all([personalProfileApi.me(), resumeApi.list()]);
      const nextResumes = Array.isArray(resumeData) ? resumeData : [];
      const nextResumeId = normalizeResumeId(nextResumes, selectedResumeId);

      setProfile(profileData || null);
      setResumes(nextResumes);
      setSelectedResumeId(nextResumeId);

      if (nextResumeId) {
        const data = await recommendationApi.jobs({ resumeId: nextResumeId, limit: 30 });
        setRecommendations(Array.isArray(data) ? data : []);
      } else {
        setRecommendations([]);
      }
    } catch (err) {
      setError(err.message || '추천 공고를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBaseData();
  }, []);

  const changeResume = (event) => {
    const nextResumeId = event.target.value;
    setSelectedResumeId(nextResumeId);
    loadRecommendations(nextResumeId);
  };

  const openDetail = (jobId) => {
    navigate(`${ROUTES.JOB_DETAIL}?id=${jobId}`);
  };

  const openApply = (event, jobId) => {
    event.stopPropagation();
    navigate(`${ROUTES.JOB_APPLY}?id=${jobId}`);
  };

  const handleCardKeyDown = (event, jobId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openDetail(jobId);
    }
  };

  const topScore = recommendations[0]?.score || 0;
  const matchedSkillCount = new Set(recommendations.flatMap((job) => job.matchedSkills || [])).size;

  return (
    <main className="member-page">
      <PersonalMemberHeader active="ai" />

      <section className="ai-recommend-shell">
        <header className="ai-recommend-hero">
          <div>
            <p className="eyebrow">AI JOB MATCHING</p>
            <h1>AI 추천 공고</h1>
            <p>내 프로필과 선택한 이력서의 SAP 역량, 경력, 지역 정보를 기준으로 매칭 점수가 높은 공고부터 정렬했습니다.</p>
          </div>
          <button type="button" className="primary-action" onClick={() => navigate(ROUTES.CAREER_PROFILE_UPDATE)}>
            프로필 보강
          </button>
        </header>

        <section className="ai-recommend-summary" aria-label="추천 기준 요약">
          <article>
            <span>추천 기준 이력서</span>
            <strong>{selectedResume?.title || '이력서 없음'}</strong>
            <small>{selectedResume?.visibilityLabel || '이력서를 등록하면 추천이 시작됩니다.'}</small>
          </article>
          <article>
            <span>커리어 프로필</span>
            <strong>{firstFilled(profile?.professionalTitle, 'SAP 전문가')}</strong>
            <small>
              {firstFilled(profile?.careerYears, 0)}년 · {firstFilled(profile?.location, '지역 미입력')}
            </small>
          </article>
          <article>
            <span>최고 매칭률</span>
            <strong>{loading ? '-' : `${Math.round(topScore)}%`}</strong>
            <small>{matchedSkillCount}개 SAP 역량이 추천 결과와 연결됨</small>
          </article>
        </section>

        <section className="ai-recommend-toolbar" aria-label="추천 조건">
          <label>
            <span>이력서 선택</span>
            <select value={selectedResumeId} onChange={changeResume} disabled={resumes.length === 0}>
              {resumes.length === 0 && <option value="">등록된 이력서 없음</option>}
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.isPrimary ? '[대표] ' : ''}
                  {resume.title}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="secondary" onClick={() => loadRecommendations(selectedResumeId)} disabled={!selectedResumeId || loading}>
            다시 계산
          </button>
          <button type="button" className="secondary" onClick={() => navigate(ROUTES.RESUME_CREATE)}>
            이력서 추가
          </button>
        </section>

        <section className="ai-recommend-layout">
          <div className="ai-recommend-list" aria-label="AI 추천 공고 목록">
            {loading && <p className="career-copy">내 이력서와 프로필을 기준으로 추천 공고를 계산하는 중입니다.</p>}

            {!loading && error && (
              <article className="detail-section">
                <p>{error}</p>
                <button type="button" className="secondary" onClick={loadBaseData}>
                  다시 불러오기
                </button>
              </article>
            )}

            {!loading && !error && resumes.length === 0 && (
              <article className="ai-recommend-empty">
                <strong>추천에 사용할 이력서가 없습니다.</strong>
                <p>이력서를 등록하면 SAP 스킬과 커리어 프로필을 함께 반영해 공고를 추천합니다.</p>
                <button type="button" className="primary-action" onClick={() => navigate(ROUTES.RESUME_CREATE)}>
                  이력서 등록
                </button>
              </article>
            )}

            {!loading && !error && resumes.length > 0 && recommendations.length === 0 && (
              <article className="ai-recommend-empty">
                <strong>아직 매칭된 공고가 없습니다.</strong>
                <p>SAP 스킬, 경력, 지역 정보를 더 자세히 입력하면 추천 정확도가 올라갑니다.</p>
                <button type="button" className="primary-action" onClick={() => navigate(ROUTES.CAREER_PROFILE_UPDATE)}>
                  커리어 프로필 수정
                </button>
              </article>
            )}

            {!loading &&
              !error &&
              recommendations.map((job, index) => (
                <article
                  className="ai-recommend-card"
                  key={job.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`${job.title} 상세 페이지로 이동`}
                  onClick={() => openDetail(job.id)}
                  onKeyDown={(event) => handleCardKeyDown(event, job.id)}
                >
                  <div className={`ai-match-score ${scoreTone(Number(job.score || 0))}`}>
                    <strong>{Math.round(Number(job.score || 0))}</strong>
                    <span>%</span>
                    <small>#{index + 1}</small>
                  </div>

                  <div className="ai-recommend-card-main">
                    <div className="job-meta">
                      <strong>{job.company}</strong>
                      <span>{job.location || '지역 협의'}</span>
                    </div>
                    <h2>{job.title}</h2>
                    <p>{job.reason}</p>
                    <div className="tag-row">
                      {(job.matchedSkills || []).map((skill) => (
                        <span key={`${job.id}-skill-${skill}`}>{skill}</span>
                      ))}
                      {(job.tags || []).slice(0, 4).map((tag) => (
                        <span key={`${job.id}-tag-${tag}`}>#{tag}</span>
                      ))}
                    </div>
                    <div className="job-card-footer">
                      <span>{job.salary}</span>
                      <span>{job.badge}</span>
                    </div>
                  </div>

                  <button type="button" className="primary-action ai-apply-button" onClick={(event) => openApply(event, job.id)}>
                    지원하기
                  </button>
                </article>
              ))}
          </div>

          <aside className="ai-recommend-side">
            <section className="profile-card">
              <h2>매칭 기준</h2>
              <dl className="profile-dl">
                <div>
                  <dt>SAP 스킬</dt>
                  <dd>{selectedResume?.tags?.join(', ') || profile?.sapSkills || '-'}</dd>
                </div>
                <div>
                  <dt>경력</dt>
                  <dd>{firstFilled(profile?.careerYears, 0)}년</dd>
                </div>
                <div>
                  <dt>희망 지역</dt>
                  <dd>{firstFilled(profile?.location, '미입력')}</dd>
                </div>
              </dl>
            </section>

            <section className="profile-card">
              <h2>추천 정확도 높이기</h2>
              <ul className="ai-tip-list">
                <li>대표 이력서에 주요 SAP 모듈을 등록하세요.</li>
                <li>커리어 프로필의 경력 연차와 희망 지역을 최신으로 유지하세요.</li>
                <li>프로젝트 요약을 구체적으로 적을수록 매칭 설명이 선명해집니다.</li>
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
