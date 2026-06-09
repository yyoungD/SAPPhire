import { useEffect, useMemo, useState } from 'react';
import { jobApi } from '../../../api/jobApi.js';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function getJobIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function Fact({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || '-'}</dd>
    </div>
  );
}

function TextValue({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || '-'}</dd>
    </div>
  );
}

export default function CompanyJobDetailPage() {
  const jobId = useMemo(() => getJobIdFromUrl(), []);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        setError('공고 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const data = await jobApi.myCompanyJobDetail(jobId);
        setJob(data);
      } catch (err) {
        setError(err.message || '공고 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId]);

  const attachments = job?.attachments || [];

  return (
    <main className="company-job-detail-page">
      <section className="company-job-detail-shell">
        {loading && (
          <article className="detail-section">
            <p className="career-copy">공고 상세 정보를 불러오는 중입니다.</p>
          </article>
        )}

        {!loading && error && (
          <article className="detail-section">
            <h2>공고를 찾을 수 없습니다.</h2>
            <p className="form-error">{error}</p>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.COMPANY_JOBS)}>
              목록으로 돌아가기
            </button>
          </article>
        )}

        {!loading && !error && job && (
          <>
            <article className="company-job-detail-hero">
              <div className="company-job-detail-topline" />
              <div className="company-job-detail-title-row">
                <div>
                  <div className="detail-badges">
                    <span>ID: {job.id}</span>
                    <span>기업인증 완료</span>
                    <span>{job.statusLabel || job.status || '-'}</span>
                  </div>
                  <h1>{job.title}</h1>
                  <button type="button" className="company-link">
                    {job.company}
                  </button>
                </div>
                <div className="company-job-detail-stats">
                  <span>조회 {Number(job.viewCount || 0).toLocaleString()}</span>
                  <span>스크랩 0</span>
                </div>
              </div>
              <dl className="company-job-detail-facts">
                <Fact label="경력" value={job.career} />
                <Fact label="고용 형태" value={job.employmentType} />
                <Fact label="근무 형태" value={job.workType} />
                <Fact label="공고 상태" value={job.statusLabel || job.status} />
              </dl>
            </article>

            <article className="company-job-detail-card">
              <h2>지원자격 및 조건</h2>
              <div className="company-job-condition-grid">
                <section>
                  <h3>요구 스킬 및 역량</h3>
                  <dl>
                    <TextValue label="모집 포지션" value={job.position} />
                    <TextValue label="프로젝트 유형" value={job.projectType} />
                    <div>
                      <dt>필수 스킬</dt>
                      <dd className="company-job-detail-tags">
                        {(job.skills || []).length > 0 ? job.skills.map((skill) => <span key={skill}>{skill}</span>) : '-'}
                      </dd>
                    </div>
                    <TextValue label="핵심 역량" value={job.qualifications} />
                    <TextValue label="우대 사항" value={job.preferredQualifications} />
                  </dl>
                </section>
                <section>
                  <h3>근무 환경</h3>
                  <ul>
                    <li>근무지: {job.location || '-'}</li>
                    <li>급여: {job.salary || '-'}</li>
                    <li>마감일: {job.deadline || '-'}</li>
                  </ul>
                </section>
              </div>
            </article>

            <article className="company-job-detail-card company-job-body-card">
              <div className="company-job-attachment-row">
                <strong>첨부파일</strong>
                {attachments.length > 0 ? (
                  <div className="company-job-attachment-list">
                    {attachments.map((file) => (
                      <span key={file.id}>{file.originalName || file.name}</span>
                    ))}
                  </div>
                ) : (
                  <span>등록된 첨부파일이 없습니다.</span>
                )}
              </div>
              <div className="company-job-body-content" dangerouslySetInnerHTML={{ __html: job.description || '<p>등록된 공고 본문이 없습니다.</p>' }} />
            </article>

            <article className="company-job-detail-card">
              <div className="company-job-stat-heading">
                <h2>지원자 통계</h2>
                <span>현재 총 28명 지원</span>
              </div>
              <div className="company-job-stat-grid">
                <section>
                  <h3>성별 분포</h3>
                  <strong>89% / 11%</strong>
                </section>
                <section>
                  <h3>나이대 Top 3</h3>
                  <p>26-30세 35%</p>
                  <p>46세 이상 35%</p>
                  <p>31-35세 18%</p>
                </section>
                <section>
                  <h3>학력 분포</h3>
                  <p>대졸 78%</p>
                  <p>초대졸 14%</p>
                  <p>석박사 7%</p>
                </section>
              </div>
            </article>

            <article className="company-job-ai-insight">
              <h2>AI 매칭 인사이트</h2>
              <p>인프라 구축 및 보안 경험을 기반으로 상위 지원자군을 추출합니다.</p>
              <div>
                <span>Skill Match</span>
                <strong>High (85%)</strong>
              </div>
              <div>
                <span>Experience Level</span>
                <strong>Perfect Fit</strong>
              </div>
              <button type="button">매칭 리포트 상세보기</button>
            </article>
          </>
        )}
      </section>
    </main>
  );
}
