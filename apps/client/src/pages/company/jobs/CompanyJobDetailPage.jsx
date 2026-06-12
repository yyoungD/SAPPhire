import { useEffect, useMemo, useState } from 'react';
import { fileApi } from '../../../api/fileApi.js';
import { jobApi } from '../../../api/jobApi.js';
import ActionMenu from '../../../componenjs/common/ActionMenu.jsx';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const statusClassNames = {
  OPEN: 'open',
  DRAFT: 'draft',
  CLOSED: 'closed',
  DELETED: 'hidden',
};

const statusMenuOptions = [
  { value: 'OPEN', label: '모집중' },
  { value: 'CLOSED', label: '마감' },
  { value: 'DELETED', label: '숨김' },
];

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

function StatusFact({ status, label }) {
  return (
    <div>
      <dt>공고 상태</dt>
      <dd>
        <span className={`company-job-status ${statusClassNames[status] || ''}`}>{label || status || '-'}</span>
      </dd>
    </div>
  );
}

export default function CompanyJobDetailPage() {
  const jobId = useMemo(() => getJobIdFromUrl(), []);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionOpen, setActionOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const downloadAttachment = async (file) => {
    try {
      await fileApi.download(file.id, file.originalName || file.name);
    } catch (err) {
      alert(err.message || '파일 다운로드에 실패했습니다.');
    }
  };

  const updateJob = () => {
    navigate(`${ROUTES.COMPANY_JOB_UPDATE}?id=${job.id}`);
  };

  const deleteJob = async () => {
    if (!window.confirm('공고를 삭제하시겠습니까?')) return;

    setDeleting(true);
    try {
      await jobApi.deleteMyCompanyJob(job.id);
      navigate(ROUTES.COMPANY_JOBS);
    } catch (err) {
      alert(err.message || '공고 삭제에 실패했습니다.');
    } finally {
      setDeleting(false);
      setActionOpen(false);
    }
  };

  const changeJobStatus = async (nextStatus) => {
    try {
      await jobApi.updateMyCompanyJobStatus(job.id, nextStatus);
      setJob((current) => ({
        ...current,
        status: nextStatus,
        statusLabel: statusMenuOptions.find((item) => item.value === nextStatus)?.label || nextStatus,
      }));
    } catch (err) {
      alert(err.message || '공고 상태 변경에 실패했습니다.');
    }
  };

  return (
    <main className="company-job-detail-page">
      <CompanyMemberHeader active="jobs" />
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
                  <ActionMenu
                    className="company-job-detail-action-menu"
                    label="공고 관리 메뉴"
                    open={actionOpen}
                    onOpenChange={setActionOpen}
                    items={[
                      { label: '수정', onClick: updateJob },
                      { label: deleting ? '삭제 중' : '삭제', onClick: deleteJob, disabled: deleting },
                      {
                        key: 'status',
                        label: '상태 변경',
                        children: statusMenuOptions.map((option) => ({
                          key: option.value,
                          label: option.label,
                          disabled: job.status === option.value,
                          onClick: () => changeJobStatus(option.value),
                        })),
                      },
                    ]}
                  />
                </div>
              </div>
              <dl className="company-job-detail-facts">
                <Fact label="경력" value={job.career} />
                <Fact label="고용 형태" value={job.employmentType} />
                <Fact label="근무 형태" value={job.workType} />
                <StatusFact status={job.status} label={job.statusLabel} />
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
                        {(job.skills || []).length > 0
                          ? job.skills.map((skill) => <span key={skill}>{skill}</span>)
                          : '-'}
                      </dd>
                    </div>
                    <TextValue label="핵심 역량" value={job.qualifications} />
                    <TextValue label="우대 사항" value={job.preferredQualifications} />
                  </dl>
                </section>
                <section>
                  <h3>근무 환경</h3>
                  <dl>
                    <TextValue label="근무지" value={job.location} />
                    <TextValue label="급여" value={job.salary} />
                    <TextValue label="마감일" value={job.deadline} />
                  </dl>
                </section>
              </div>
            </article>

            <article className="company-job-detail-card company-job-body-card">
              <div className="company-job-attachment-row">
                <strong>첨부파일</strong>
                {attachments.length > 0 ? (
                  <div className="company-job-attachment-list">
                    {attachments.map((file) => (
                      <button type="button" key={file.id} onClick={() => downloadAttachment(file)}>
                        {file.originalName || file.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span>등록된 첨부파일이 없습니다.</span>
                )}
              </div>
              <div
                className="company-job-body-content"
                dangerouslySetInnerHTML={{ __html: job.description || '<p>등록된 공고 본문이 없습니다.</p>' }}
              />
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
