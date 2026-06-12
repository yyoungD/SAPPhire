import { useEffect, useMemo, useState } from 'react';
import { jobApi } from '../../api/jobApi.js';
import { ROUTES } from '../../constanjs/routes.js';
import PersonalMemberHeader from '../../componenjs/layout/PersonalMemberHeader.jsx';
import { navigate } from '../../utils/authUtils.js';

function getJobIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function sanitizeJobHtml(value = '') {
  const template = document.createElement('template');
  template.innerHTML = value;

  const allowedTags = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'H2', 'H3', 'HR']);
  template.content.querySelectorAll('*').forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }

    [...node.attributes].forEach((attribute) => node.removeAttribute(attribute.name));
  });

  return template.innerHTML;
}

export default function JobDetailPage() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const jobId = useMemo(() => getJobIdFromUrl(), []);

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        setError('채용 공고 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await jobApi.detail(jobId);
        setJob(data);
      } catch (err) {
        setError(err.message || '채용 공고 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  return (
    <main className="member-page">
      <PersonalMemberHeader active="jobs" />

      {loading && (
        <section className="detail-layout">
          <article className="detail-section">
            <p className="career-copy">채용 공고 상세 정보를 불러오는 중입니다.</p>
          </article>
        </section>
      )}

      {!loading && error && (
        <section className="detail-layout">
          <article className="detail-section">
            <h2>공고를 찾을 수 없습니다</h2>
            <p>{error}</p>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.JOBS)}>
              목록으로 돌아가기
            </button>
          </article>
        </section>
      )}

      {!loading && !error && job && (
        <div className="detail-layout">
          <section className="detail-main">
            <article className="detail-hero-card">
              <div className="detail-hero-top">
                <div>
                  <div className="detail-badges">
                    <span>ID: {job.id}</span>
                    <span>기업인증 완료</span>
                    <span>{job.badge}</span>
                  </div>
                  <h1>{job.title}</h1>
                  <button type="button" className="company-link">
                    {job.company}
                  </button>
                </div>
                <div className="detail-stats">
                  <strong>조회 {Number(job.viewCount || 0).toLocaleString()}</strong>
                  <span>{job.location}</span>
                </div>
              </div>
              <dl className="job-facts">
                <div>
                  <dt>경력</dt>
                  <dd>{job.career}</dd>
                </div>
                <div>
                  <dt>고용형태</dt>
                  <dd>{job.employmentType}</dd>
                </div>
                <div>
                  <dt>근무형태</dt>
                  <dd>{job.workType}</dd>
                </div>
                <div>
                  <dt>마감일</dt>
                  <dd className="danger">{job.deadline}</dd>
                </div>
              </dl>
            </article>

            <article className="detail-section">
              <h2>지원 자격 및 조건</h2>
              <div className="detail-block">
                <h3>필수 SAP 역량</h3>
                <div className="detail-row">
                  <span>스킬</span>
                  <div className="tag-row">
                    {(job.skills || []).map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="detail-row">
                  <span>자격요건</span>
                  <p>{job.qualifications}</p>
                </div>
                <div className="detail-row">
                  <span>우대사항</span>
                  <p>{job.preferredQualifications}</p>
                </div>
              </div>

              <div className="detail-block">
                <h3>근무 조건</h3>
                <ul className="plain-list">
                  <li>근무지: {job.location}</li>
                  <li>급여: {job.salary}</li>
                  <li>경력: {job.career}</li>
                </ul>
              </div>
            </article>

            <article className="detail-section">
              <h2>주요 업무</h2>
              <p>{job.responsibilities}</p>
            </article>

            <article className="detail-section">
              <h2>공고 소개</h2>
              <div className="job-description-content" dangerouslySetInnerHTML={{ __html: sanitizeJobHtml(job.description || '<p>등록된 공고 소개가 없습니다.</p>') }} />
              <div className="tag-row">
                {(job.tags || []).map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            </article>
          </section>

          <aside className="apply-panel">
            <strong>내 이력서로 바로 지원</strong>
            <p>등록한 이력서와 SAP 스킬 정보를 바탕으로 지원을 진행할 수 있습니다.</p>
            <div className="match-score">
              <span>마감</span>
              <strong>{job.badge}</strong>
            </div>
            <button type="button" className="primary-action" onClick={() => navigate(`${ROUTES.JOB_APPLY}?id=${job.id}`)}>
              지원하기
            </button>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.JOB_BOOKMARKS)}>
              관심공고 보기
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
