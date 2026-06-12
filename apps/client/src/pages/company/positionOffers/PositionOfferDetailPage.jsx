import { useEffect, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

export default function PositionOfferDetailPage() {
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

  const cancelOffer = async () => {
    setSaving(true);
    setError('');
    try {
      setOffer(await positionOfferApi.updateStatus(id, 'CANCELED'));
    } catch (err) {
      setError(err.message || '제안을 취소하지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="company-position-page">
      <CompanyMemberHeader active="offers" />
      <section className="company-position-shell compact">
        {loading && <p className="career-copy">제안 상세를 불러오는 중입니다.</p>}
        {!loading && error && <p className="form-error">{error}</p>}
        {!loading && offer && (
          <div className="offer-detail-layout">
            <article className="detail-hero-card">
              <p className="eyebrow">SENT POSITION OFFER</p>
              <h1>{offer.title}</h1>
              <div className="detail-badges">
                <span>{offer.receiverName}</span>
                <span>{offer.statusLabel}</span>
                <span>{offer.matchScore}% match</span>
              </div>
            </article>
            <article className="detail-section">
              <h2>전송 메시지</h2>
              <p className="application-cover-letter">{offer.message || '전송된 메시지가 없습니다.'}</p>
            </article>
            <aside className="detail-section offer-detail-side">
              <h2>관리 정보</h2>
              <dl className="application-detail-dl">
                <div>
                  <dt>이력서</dt>
                  <dd>{offer.resumeTitle || '-'}</dd>
                </div>
                <div>
                  <dt>전송일</dt>
                  <dd>{offer.createdAt || '-'}</dd>
                </div>
                <div>
                  <dt>응답 기한</dt>
                  <dd>{offer.expiresAt || '상시'}</dd>
                </div>
              </dl>
              {offer.status === 'SENT' && (
                <button type="button" className="secondary" disabled={saving} onClick={cancelOffer}>
                  {saving ? '취소 중...' : '제안 취소'}
                </button>
              )}
              <button type="button" className="link-button" onClick={() => navigate(ROUTES.POSITION_OFFERS)}>
                목록으로
              </button>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
