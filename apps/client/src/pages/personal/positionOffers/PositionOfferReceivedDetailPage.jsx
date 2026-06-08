import { useEffect, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

export default function PositionOfferReceivedDetailPage() {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const id = new URLSearchParams(window.location.search).get('id');

  const loadOffer = async () => {
    setLoading(true);
    setError('');
    try {
      setOffer(await positionOfferApi.detail(id));
    } catch (err) {
      setError(err.message || '제안 상세를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadOffer();
    else {
      setError('제안 ID가 없습니다.');
      setLoading(false);
    }
  }, [id]);

  const changeStatus = async (status) => {
    setSaving(true);
    setError('');
    try {
      setOffer(await positionOfferApi.updateStatus(id, status));
    } catch (err) {
      setError(err.message || '제안 상태를 변경하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="offers" />
      <section className="offer-detail-shell">
        {loading && <p className="career-copy">제안 상세를 불러오는 중입니다.</p>}
        {!loading && error && <p className="form-error">{error}</p>}
        {!loading && offer && (
          <div className="offer-detail-layout">
            <article className="detail-hero-card">
              <p className="eyebrow">POSITION OFFER</p>
              <h1>{offer.title}</h1>
              <div className="detail-badges">
                <span>{offer.companyName}</span>
                <span>{offer.statusLabel}</span>
                <span>{offer.matchScore}% match</span>
              </div>
            </article>
            <article className="detail-section">
              <h2>제안 메시지</h2>
              <p className="application-cover-letter">{offer.message || '기업이 별도 메시지를 남기지 않았습니다.'}</p>
            </article>
            <aside className="detail-section offer-detail-side">
              <h2>제안 정보</h2>
              <dl className="application-detail-dl">
                <div>
                  <dt>이력서</dt>
                  <dd>{offer.resumeTitle || '-'}</dd>
                </div>
                <div>
                  <dt>받은 날짜</dt>
                  <dd>{offer.createdAt || '-'}</dd>
                </div>
                <div>
                  <dt>응답 기한</dt>
                  <dd>{offer.expiresAt || '상시'}</dd>
                </div>
              </dl>
              <div className="offer-tags">
                {(offer.tags || []).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {offer.status === 'SENT' && (
                <div className="offer-action-grid">
                  <button type="button" className="primary-action" disabled={saving} onClick={() => changeStatus('ACCEPTED')}>
                    수락하기
                  </button>
                  <button type="button" className="secondary" disabled={saving} onClick={() => changeStatus('DECLINED')}>
                    거절하기
                  </button>
                </div>
              )}
              <button type="button" className="link-button" onClick={() => navigate(ROUTES.RECEIVED_OFFERS)}>
                목록으로
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
