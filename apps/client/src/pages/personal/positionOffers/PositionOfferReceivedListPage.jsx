import { useEffect, useMemo, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function statusClass(status) {
  if (status === 'ACCEPTED') return 'accepted';
  if (status === 'DECLINED' || status === 'CANCELED' || status === 'EXPIRED') return 'ended';
  return 'waiting';
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
      setError(err.message || '포지션 제안을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const offers = payload?.offers || [];
  const insight = payload?.insight || {};
  const topOffer = useMemo(() => offers.slice().sort((a, b) => b.matchScore - a.matchScore)[0], [offers]);

  return (
    <main className="member-page">
      <PersonalMemberHeader active="offers" />
      <section className="offer-shell">
        <div className="offer-hero">
          <div>
            <p className="eyebrow">DIRECT OFFERS</p>
            <h1>포지션 제안 현황</h1>
            <p>SAP 전문 역량을 높게 평가한 기업의 직접 제안을 확인하고, 커리어 방향에 맞는 기회를 빠르게 검토하세요.</p>
          </div>
          <div className="offer-stats">
            <article>
              <span>TOTAL OFFERS</span>
              <strong>{loading ? '-' : payload?.totalOffers || 0}</strong>
            </article>
            <article className="featured">
              <span>NEW PROPOSALS</span>
              <strong>{loading ? '-' : String(payload?.newProposals || 0).padStart(2, '0')}</strong>
            </article>
          </div>
        </div>

        <div className="offer-workspace">
          <section className="offer-list-column" aria-label="받은 포지션 제안 목록">
            <div className="offer-section-title">
              <span aria-hidden="true" />
              <strong>전체 제안 목록</strong>
            </div>

            {loading && <p className="career-copy">포지션 제안을 불러오는 중입니다.</p>}
            {!loading && error && (
              <article className="detail-section">
                <p>{error}</p>
                <button type="button" className="secondary" onClick={loadOffers}>
                  다시 불러오기
                </button>
              </article>
            )}
            {!loading && !error && offers.length === 0 && <p className="career-copy">아직 받은 포지션 제안이 없습니다.</p>}

            {!loading &&
              !error &&
              offers.map((offer) => (
                <article
                  key={offer.id}
                  className={`offer-card ${offer.status === 'DECLINED' || offer.status === 'EXPIRED' ? 'muted' : ''}`}
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
                  <div className="offer-company-mark">{(offer.companyName || 'S').slice(0, 1)}</div>
                  <div className="offer-card-main">
                    <strong>{offer.companyName}</strong>
                    <h2>{offer.title}</h2>
                    <div className="offer-tags">
                      {(offer.tags || []).slice(0, 3).map((tag) => (
                        <span key={`${offer.id}-${tag}`}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="offer-card-side">
                    <span>MATCH SCORE</span>
                    <strong>{offer.matchScore}%</strong>
                    <em className={statusClass(offer.status)}>{offer.statusLabel}</em>
                  </div>
                </article>
              ))}
          </section>

          <aside className="offer-ai-column" aria-label="AI 수락 확률 분석">
            <article className="offer-ai-card">
              <div className="offer-ai-head">
                <span aria-hidden="true" />
                <strong>AI 수락 확률 분석</strong>
              </div>
              <p>최근 제안과 이력서 스킬 데이터를 바탕으로 현재 제안의 응답 가능성을 요약했습니다.</p>
              <div className="offer-score-ring" style={{ '--score': `${insight.acceptanceRate || 0}%` }}>
                <strong>{insight.acceptanceRate || 0}%</strong>
                <span>VERY HIGH</span>
              </div>
              <div className="offer-insight-list">
                <div>
                  <span>역할 적합도</span>
                  <strong>{insight.growthFit || '-'}</strong>
                </div>
                <div>
                  <span>기술 스택 일치</span>
                  <strong>{insight.skillMatch || 0}%</strong>
                </div>
                <div>
                  <span>예상 통근 거리</span>
                  <strong>{insight.commuteTime || '-'}</strong>
                </div>
              </div>
              {topOffer && (
                <button type="button" className="primary-action" onClick={() => navigate(`${ROUTES.RECEIVED_OFFER_DETAIL}?id=${topOffer.id}`)}>
                  매칭 리포트 상세보기
                </button>
              )}
            </article>
            <article className="offer-tip-card">
              <strong>Expert Tip</strong>
              <p>{insight.tip || '프로필과 대표 이력서를 최신 상태로 유지하면 더 정교한 포지션 제안을 받을 수 있습니다.'}</p>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
