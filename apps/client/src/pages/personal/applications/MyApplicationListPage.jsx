import { useEffect, useState } from 'react';
import { applicationApi } from '../../../api/applicationApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

export default function MyApplicationListPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await applicationApi.list();
      setApplications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || '지원 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  return (
    <main className="member-page">
      <PersonalMemberHeader active="applications" />
      <section className="application-list-shell">
        <header className="resume-hero">
          <p className="eyebrow">APPLICATIONS</p>
          <h1>지원 현황</h1>
          <p>제출한 SAP 채용 지원서를 한 곳에서 확인하고 진행 상태를 추적하세요.</p>
        </header>

        {loading && (
          <article className="detail-section">
            <p className="career-copy">지원 내역을 불러오는 중입니다.</p>
          </article>
        )}

        {!loading && error && (
          <article className="detail-section">
            <p>{error}</p>
            <button type="button" className="secondary" onClick={loadApplications}>
              다시 불러오기
            </button>
          </article>
        )}

        {!loading && !error && applications.length === 0 && (
          <article className="apply-empty">
            <strong>아직 지원한 공고가 없습니다</strong>
            <p>관심 있는 SAP 공고를 찾아 지원을 시작해 보세요.</p>
            <button type="button" className="primary-action" onClick={() => navigate(ROUTES.JOBS)}>
              공고 보러가기
            </button>
          </article>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="application-list">
            {applications.map((application) => (
              <article
                className="application-card"
                key={application.id}
                role="link"
                tabIndex={0}
                onClick={() => navigate(`${ROUTES.MY_APPLICATION_DETAIL}?id=${application.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`${ROUTES.MY_APPLICATION_DETAIL}?id=${application.id}`);
                  }
                }}
              >
                <div>
                  <p>{application.companyName}</p>
                  <h2>{application.jobTitle}</h2>
                  <span>{application.resumeTitle}</span>
                </div>
                <div>
                  <strong>{application.statusLabel}</strong>
                  <small>{application.appliedAt}</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
