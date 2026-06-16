import { useEffect, useState } from 'react';
import { jobApi } from '../../api/jobApi.js';
import { ROUTES } from '../../constanjs/routes.js';
import PersonalMemberHeader from '../../componenjs/layout/PersonalMemberHeader.jsx';
import { navigate } from '../../utils/authUtils.js';

export default function JobBookmarkPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await jobApi.bookmarks();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || '북마크한 공고를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const removeBookmark = async (jobId) => {
    setRemovingId(jobId);
    try {
      await jobApi.removeBookmark(jobId);
      setJobs((current) => current.filter((job) => job.id !== jobId));
    } catch (err) {
      window.alert(err.message || '북마크를 해제하지 못했습니다.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="jobs" />
      <div className="member-placeholder-shell job-bookmark-shell">
        <section className="page-panel job-bookmark-panel">
          <p className="eyebrow">SAVED JOBS</p>
          <h1>북마크한 채용 공고</h1>
          <p>관심 있는 SAP 채용 공고를 저장해두고 지원 전에 다시 확인할 수 있습니다.</p>

          {loading && <p className="career-copy">북마크한 공고를 불러오는 중입니다.</p>}

          {!loading && error && (
            <div className="bookmark-empty-state">
              <p>{error}</p>
              <button type="button" className="secondary" onClick={loadBookmarks}>
                다시 불러오기
              </button>
            </div>
          )}

          {!loading && !error && jobs.length === 0 && (
            <div className="bookmark-empty-state">
              <strong>저장한 공고가 없습니다.</strong>
              <p>채용 공고 목록에서 관심 있는 공고를 북마크해보세요.</p>
              <button type="button" className="primary-action" onClick={() => navigate(ROUTES.JOBS)}>
                공고 보러가기
              </button>
            </div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="bookmark-job-list">
              {jobs.map((job) => (
                <article className="bookmark-job-card" key={job.id}>
                  <div>
                    <span>{job.company}</span>
                    <h2>{job.title}</h2>
                    <p>{job.location || 'Location TBD'} · {job.salary || 'Salary TBD'} · {job.badge || 'Open'}</p>
                    <div className="tag-row">
                      {(job.tags || []).slice(0, 5).map((tag) => (
                        <span key={`${job.id}-${tag}`}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bookmark-job-actions">
                    <button type="button" className="primary-action" onClick={() => navigate(`${ROUTES.JOB_DETAIL}?id=${job.id}`)}>
                      상세 보기
                    </button>
                    <button
                      type="button"
                      className="secondary"
                      disabled={removingId === job.id}
                      onClick={() => removeBookmark(job.id)}
                    >
                      해제
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
