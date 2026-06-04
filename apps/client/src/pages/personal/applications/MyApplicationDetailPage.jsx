import { useEffect, useMemo, useState } from 'react';
import { applicationApi } from '../../../api/applicationApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function getApplicationIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

export default function MyApplicationDetailPage() {
  const applicationId = useMemo(() => getApplicationIdFromUrl(), []);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadApplication = async () => {
      if (!applicationId) {
        setError('지원 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        setApplication(await applicationApi.detail(applicationId));
      } catch (err) {
        setError(err.message || '지원 상세 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  return (
    <main className="member-page">
      <PersonalMemberHeader active="applications" />
      <section className="application-detail-shell">
        {loading && (
          <article className="detail-section">
            <p className="career-copy">지원 상세 정보를 불러오는 중입니다.</p>
          </article>
        )}

        {!loading && error && (
          <article className="detail-section">
            <h2>지원 정보를 찾을 수 없습니다</h2>
            <p>{error}</p>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.MY_APPLICATIONS)}>
              지원 내역으로 돌아가기
            </button>
          </article>
        )}

        {!loading && !error && application && (
          <div className="application-detail-layout">
            <section className="application-detail-main">
              <article className="apply-job-card">
                <div className="job-logo" aria-hidden="true">
                  SAP
                </div>
                <div>
                  <h1>{application.jobTitle}</h1>
                  <p>
                    {application.companyName} · {application.jobLocation || '-'}
                  </p>
                  <div className="tag-row">
                    <span>{application.employmentType}</span>
                    <span>{application.workType}</span>
                    <span>{application.statusLabel}</span>
                  </div>
                </div>
              </article>

              <article className="apply-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">APPLICATION</p>
                    <h2>제출한 지원서</h2>
                  </div>
                </div>
                <dl className="application-detail-dl">
                  <div>
                    <dt>이력서</dt>
                    <dd>{application.resumeTitle}</dd>
                  </div>
                  <div>
                    <dt>지원일</dt>
                    <dd>{application.appliedAt}</dd>
                  </div>
                  <div>
                    <dt>최근 변경</dt>
                    <dd>{application.updatedAt}</dd>
                  </div>
                </dl>
              </article>

              <article className="apply-section">
                <div className="apply-section-head">
                  <div>
                    <p className="eyebrow">COVER LETTER</p>
                    <h2>자기소개</h2>
                  </div>
                </div>
                <p className="application-cover-letter">{application.coverLetter || '제출한 자기소개가 없습니다.'}</p>
              </article>
            </section>

            <aside className="apply-submit-panel">
              <section>
                <h2>지원 상태</h2>
                <div className="apply-summary-score application-status-summary">
                  <span>현재 단계</span>
                  <strong>{application.statusLabel}</strong>
                </div>
              </section>
              <button type="button" className="secondary" onClick={() => navigate(ROUTES.MY_APPLICATIONS)}>
                지원 내역 보기
              </button>
              <button type="button" className="primary-action" onClick={() => navigate(`${ROUTES.JOB_DETAIL}?id=${application.jobPostId}`)}>
                공고 다시 보기
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
