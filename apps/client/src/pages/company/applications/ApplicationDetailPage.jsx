import { useEffect, useMemo, useState } from 'react';
import { applicationApi } from '../../../api/applicationApi.js';
import { fileApi } from '../../../api/fileApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const statusClassNames = {
  APPLIED: 'open',
  REVIEWING: 'review',
  INTERVIEW: 'interview',
  ACCEPTED: 'draft',
  REJECTED: 'hidden',
  CANCELED: 'closed',
};

const statusOptions = [
  { value: 'APPLIED', label: '지원 완료' },
  { value: 'REVIEWING', label: '서류전형' },
  { value: 'INTERVIEW', label: '면접' },
  { value: 'ACCEPTED', label: '합격' },
  { value: 'REJECTED', label: '불합격' },
  { value: 'CANCELED', label: '취소' },
];

function getApplicantInitial(name) {
  return (name || '지원자').trim().charAt(0);
}

function getApplicationIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

export default function ApplicationDetailPage() {
  const applicationId = useMemo(() => getApplicationIdFromUrl(), []);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadingPortfolio, setDownloadingPortfolio] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const loadApplication = async () => {
      if (!applicationId) {
        setError('지원자 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        setApplication(await applicationApi.detail(applicationId));
      } catch (err) {
        setError(err.message || '지원자 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  const downloadResume = async () => {
    if (!application?.resumeFileId) return;

    setDownloading(true);
    try {
      await fileApi.download(
        application.resumeFileId,
        application.resumeOriginalFileName || application.resumeTitle || 'resume'
      );
    } catch (err) {
      alert(err.message || '이력서 다운로드에 실패했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadPortfolio = async () => {
    const portfolio = application?.attachments?.[0];
    if (!portfolio?.id) return;

    setDownloadingPortfolio(true);
    try {
      await fileApi.download(portfolio.id, portfolio.originalName || 'portfolio');
    } catch (err) {
      alert(err.message || '포트폴리오 다운로드에 실패했습니다.');
    } finally {
      setDownloadingPortfolio(false);
    }
  };

  const updateApplicationStatus = async (nextStatus) => {
    if (!application || nextStatus === application.status) return;

    setSavingStatus(true);
    try {
      const updated = await applicationApi.updateStatus(application.id, nextStatus);
      setApplication(updated);
    } catch (err) {
      alert(err.message || '지원 상태 변경에 실패했습니다.');
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <main className="company-candidate-page">
      <CompanyMemberHeader active="applications" />
      <section className="company-candidate-shell compact">
        {loading && (
          <article className="detail-section">
            <p className="career-copy">지원자 상세 정보를 불러오는 중입니다.</p>
          </article>
        )}

        {!loading && error && (
          <article className="detail-section">
            <h2>지원자 정보를 찾을 수 없습니다.</h2>
            <p className="form-error">{error}</p>
            <button
              type="button"
              className="secondary"
              onClick={() => navigate(ROUTES.COMPANY_APPLICATIONS)}
            >
              목록으로 돌아가기
            </button>
          </article>
        )}

        {!loading && !error && application && (
          <div className="application-detail-layout">
            <section className="application-detail-main">
              <article className="detail-hero-card company-application-hero">
                <p className="eyebrow">CANDIDATE DETAIL</p>
                <div className="company-application-title-row">
                  <div className="company-application-profile">
                    <div className="company-application-avatar">
                      {application.applicantProfileImageUrl ? (
                        <img
                          src={application.applicantProfileImageUrl}
                          alt={`${application.applicantName || '지원자'} 프로필`}
                        />
                      ) : (
                        <span>{getApplicantInitial(application.applicantName)}</span>
                      )}
                    </div>
                    <div>
                      <h1>{application.applicantName || '지원자'}</h1>
                      <p>
                        {application.jobTitle || '-'} · {application.jobLocation || '-'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="detail-badges">
                  <span>지원일 {application.appliedAt || '-'}</span>
                  <span>최근 변경 {application.updatedAt || '-'}</span>
                  <span>{application.employmentType || '-'}</span>
                  <span>{application.workType || '-'}</span>
                </div>
              </article>

              <article className="detail-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">RESUME</p>
                    <h2>제출 이력서</h2>
                  </div>
                  <div className="application-download-actions">
                    {application.resumeFileId && (
                      <button
                        type="button"
                        className="section-edit-button"
                        onClick={downloadResume}
                        disabled={downloading}
                      >
                        {downloading ? '다운로드 중...' : '이력서 다운로드'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="section-edit-button portfolio-download-button"
                      onClick={downloadPortfolio}
                      disabled={!application.attachments?.length || downloadingPortfolio}
                    >
                      {downloadingPortfolio ? '다운로드 중...' : '포트폴리오 다운로드'}
                    </button>
                  </div>
                </div>
                <dl className="application-detail-dl">
                  <div>
                    <dt>지원 공고</dt>
                    <dd>{application.jobTitle || '-'}</dd>
                  </div>
                  <div>
                    <dt>이력서 제목</dt>
                    <dd>{application.resumeTitle || '-'}</dd>
                  </div>
                  <div>
                    <dt>포트폴리오</dt>
                    <dd>
                      {application.attachments?.length
                        ? application.attachments
                            .map((attachment) => attachment.originalName)
                            .join(', ')
                        : '등록된 포트폴리오가 없습니다.'}
                    </dd>
                  </div>
                  <div>
                    <dt>지원일</dt>
                    <dd>{application.appliedAt || '-'}</dd>
                  </div>
                </dl>
              </article>

              <article className="detail-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">COVER LETTER</p>
                    <h2>자기소개</h2>
                  </div>
                </div>
                <p className="application-cover-letter">
                  {application.coverLetter || '제출된 자기소개가 없습니다.'}
                </p>
              </article>
            </section>

            <aside className="apply-submit-panel">
              <section>
                <h2>지원 상태</h2>
                <div
                  className="apply-summary-score application-status-summary"
                >
                  <span>현재 단계</span>
                  <strong className={`company-job-status ${statusClassNames[application.status] || 'closed'}`}>
                    {application.statusLabel || '-'}
                  </strong>
                </div>
              </section>
              <label className="application-status-select">
                <span>상태 변경</span>
                <select
                  value={application.status || ''}
                  onChange={(event) => updateApplicationStatus(event.target.value)}
                  disabled={savingStatus}
                >
                  {statusOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="secondary"
                onClick={() => navigate(ROUTES.COMPANY_APPLICATIONS)}
              >
                지원자 목록
              </button>
              <button
                type="button"
                className="primary-action"
                onClick={() => navigate(`${ROUTES.COMPANY_JOB_DETAIL}?id=${application.jobPostId}`)}
              >
                공고 상세 보기
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
