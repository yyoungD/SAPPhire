import { useEffect, useMemo, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const offerStatusClassNames = {
  ACCEPTED: 'open',
  CANCELED: 'hidden',
  DECLINED: 'hidden',
  REJECTED: 'hidden',
  SENT: 'closed',
  EXPIRED: 'closed',
};

function DocumentIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h6" />
    </svg>
  );
}

export default function PositionOfferReceivedListPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOffers = async () => {
    setLoading(true);
    setError('');
    try {
      setPayload(await positionOfferApi.list());
    } catch (err) {
      setError(err.message || '받은 포지션 제안을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const offers = payload?.offers || [];
  const acceptedOffers = offers.filter((offer) => offer.status === 'ACCEPTED').length;
  const closedOffers = offers.filter((offer) => ['DECLINED', 'CANCELED', 'EXPIRED'].includes(offer.status)).length;
  const topOffer = useMemo(() => offers.slice().sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))[0], [offers]);

  return (
    <main className="company-position-page">
      <PersonalMemberHeader active="offers" />
      <section className="company-position-shell">
        <div className="company-position-hero">
          <div>
            <p className="eyebrow">DIRECT OFFERS</p>
            <h1 className="company-page-title">포지션 제안 현황</h1>
            <p>기업이 보낸 포지션 제안과 응답 상태를 확인하세요.</p>
          </div>
          {topOffer && (
            <button
              type="button"
              className="primary-action company-job-create-button"
              onClick={() => navigate(`${ROUTES.RECEIVED_OFFER_DETAIL}?id=${topOffer.id}`)}
            >
              추천 제안 보기
            </button>
          )}
        </div>

        <div className="company-position-stats">
          <article>
            <span>전체 제안</span>
            <strong>{loading ? '-' : payload?.totalOffers || 0}</strong>
          </article>
          <article>
            <span>응답 대기</span>
            <strong>{loading ? '-' : payload?.waitingOffers || 0}</strong>
          </article>
          <article>
            <span>수락 완료</span>
            <strong>{loading ? '-' : acceptedOffers}</strong>
          </article>
          <article>
            <span>종료된 제안</span>
            <strong>{loading ? '-' : closedOffers}</strong>
          </article>
        </div>

        <section className="company-position-list" aria-label="받은 포지션 제안 목록">
          {loading && <p className="career-copy">포지션 제안 목록을 불러오는 중입니다.</p>}
          {!loading && error && (
            <article className="detail-section">
              <p className="form-error">{error}</p>
              <button type="button" className="secondary" onClick={loadOffers}>
                다시 불러오기
              </button>
            </article>
          )}
          {!loading && !error && offers.length === 0 && (
            <p className="career-copy">아직 받은 포지션 제안이 없습니다.</p>
          )}

          {!loading &&
            !error &&
            offers.map((offer) => (
              <article
                key={offer.id}
                className="offer-card"
                role="link"
                tabIndex={0}
                onClick={() => navigate(`${ROUTES.RECEIVED_OFFER_DETAIL}?id=${offer.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`${ROUTES.RECEIVED_OFFER_DETAIL}?id=${offer.id}`);
                  }
                }}
              >
                <div className="offer-company-mark">
                  <DocumentIcon />
                </div>
                <div className="offer-card-main">
                  <strong>{offer.companyName || '기업명 미확인'}</strong>
                  <h2>{offer.title}</h2>
                  <p>{offer.resumeTitle || '연결된 이력서가 없습니다.'}</p>
                </div>
                <div className="offer-card-side">
                  <span>MATCH SCORE</span>
                  <strong>{offer.matchScore || 0}%</strong>
                  <span className={`company-job-status ${offerStatusClassNames[offer.status] || 'closed'}`}>
                    {offer.statusLabel || offer.status}
                  </span>
                </div>
              </article>
            ))}
        </section>
      </section>
    </main>
  );
}
