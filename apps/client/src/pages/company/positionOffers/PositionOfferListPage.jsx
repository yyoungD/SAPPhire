import { useEffect, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function statusClassName(status) {
  if (status === 'ACCEPTED') return 'accepted';
  if (status === 'CANCELED' || status === 'EXPIRED' || status === 'REJECTED') return 'ended';
  return 'waiting';
}

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
    <main className="company-position-page">
      <CompanyMemberHeader active="offers" />
      <section className="company-position-shell">
        <div className="company-position-hero">
          <div>
            <p className="eyebrow">POSITION OFFER CRM</p>
            <h1 className="company-page-title">포지션 제안 관리</h1>
            <p>관심 인재에게 보낸 직접 제안과 응답 상태를 확인하세요.</p>
          </div>
          <button type="button" className="primary-action company-job-create-button" onClick={() => navigate(ROUTES.POSITION_OFFER_CREATE)}>
            제안 작성
          </button>
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
            <strong>{loading ? '-' : payload?.acceptedOffers || 0}</strong>
          </article>
        </div>

        <section className="company-position-list" aria-label="보낸 포지션 제안 목록">
          {loading && <p className="career-copy">포지션 제안 목록을 불러오는 중입니다.</p>}
          {!loading && error && (
            <article className="detail-section">
              <p className="form-error">{error}</p>
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
                  <strong>{offer.receiverName || '수신자 미확인'}</strong>
                  <h2>{offer.title}</h2>
                  <p>{offer.resumeTitle || '연결된 이력서가 없습니다.'}</p>
                </div>
                <div className="offer-card-side">
                  <span>MATCH SCORE</span>
                  <strong>{offer.matchScore || 0}%</strong>
                  <em className={statusClassName(offer.status)}>{offer.statusLabel || offer.status}</em>
                </div>
              </article>
            ))}
        </section>
      </section>
    </main>
  );
}
