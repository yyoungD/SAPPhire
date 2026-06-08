import { useEffect, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

export default function PositionOfferListPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOffers = async () => {
    setLoading(true);
    setError('');
    try {
      setPayload(await positionOfferApi.list());
    } catch (err) {
      setError(err.message || '보낸 포지션 제안을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const offers = payload?.offers || [];

  return (
    <main className="offer-shell company-offer-shell">
      <div className="offer-hero">
        <div>
          <p className="eyebrow">POSITION OFFER CRM</p>
          <h1>포지션 제안 관리</h1>
          <p>관심 인재에게 보낸 직접 제안의 응답 상태와 매칭 점수를 한곳에서 확인하세요.</p>
        </div>
        <button type="button" className="primary-action jobs-hero-action" onClick={() => navigate(ROUTES.POSITION_OFFER_CREATE)}>
          제안 작성
        </button>
      </div>

      <div className="offer-stats company-offer-stats">
        <article>
          <span>TOTAL SENT</span>
          <strong>{loading ? '-' : payload?.totalOffers || 0}</strong>
        </article>
        <article>
          <span>WAITING</span>
          <strong>{loading ? '-' : payload?.waitingOffers || 0}</strong>
        </article>
        <article className="featured">
          <span>ACCEPTED</span>
          <strong>{loading ? '-' : payload?.acceptedOffers || 0}</strong>
        </article>
      </div>

      <section className="offer-list-column" aria-label="보낸 포지션 제안 목록">
        {loading && <p className="career-copy">보낸 제안을 불러오는 중입니다.</p>}
        {!loading && error && (
          <article className="detail-section">
            <p>{error}</p>
            <button type="button" className="secondary" onClick={loadOffers}>
              다시 불러오기
            </button>
          </article>
        )}
        {!loading && !error && offers.length === 0 && <p className="career-copy">아직 보낸 포지션 제안이 없습니다.</p>}

        {!loading &&
          !error &&
          offers.map((offer) => (
            <article
              key={offer.id}
              className="offer-card"
              role="link"
              tabIndex={0}
              onClick={() => navigate(`${ROUTES.POSITION_OFFER_DETAIL}?id=${offer.id}`)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(`${ROUTES.POSITION_OFFER_DETAIL}?id=${offer.id}`);
                }
              }}
            >
              <div className="offer-company-mark">{(offer.receiverName || 'T').slice(0, 1)}</div>
              <div className="offer-card-main">
                <strong>{offer.receiverName}</strong>
                <h2>{offer.title}</h2>
                <p>{offer.resumeTitle || '지정 이력서 없음'}</p>
              </div>
              <div className="offer-card-side">
                <span>MATCH SCORE</span>
                <strong>{offer.matchScore}%</strong>
                <em>{offer.statusLabel}</em>
              </div>
            </article>
          ))}
      </section>
    </main>
  );
}
