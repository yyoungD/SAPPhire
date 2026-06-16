import { useEffect, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function canCancelOffer(status) {
  return status === 'SENT' || status === 'EXPIRED';
}

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
    if (!canCancelOffer(offer?.status)) return;

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

  const openResume = () => {
    if (!offer?.resumeId) return;
    navigate(`${ROUTES.COMPANY_RESUME_DETAIL}?id=${offer.resumeId}`);
  };

  return (
    <main className="company-position-page">
      <CompanyMemberHeader active="offers" />
      <section className="company-position-shell compact">
        {loading && <p className="career-copy">제안 상세를 불러오는 중입니다.</p>}
        {!loading && error && <p className="form-error">{error}</p>}
        {!loading && offer && (
          <div className="offer-detail-layout company-offer-detail-layout">
            <section className="application-detail-main">
              <article className="detail-hero-card">
                <p className="eyebrow">SENT POSITION OFFER</p>
                <h1>{offer.title}</h1>
              </article>

              <article className="detail-section">
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
              </article>

              <article className="detail-section offer-message-card">
                <h2>전송 메시지</h2>
                <p className="application-cover-letter">{offer.message || '전송된 메시지가 없습니다.'}</p>
              </article>
            </section>

            <aside className="offer-detail-side">
              <article className="detail-section">
                <h2>수신자 정보</h2>
                <dl className="application-detail-dl">
                  <div>
                    <dt>이름</dt>
                    <dd>{offer.receiverName || '-'}</dd>
                  </div>
                  <div>
                    <dt>상태</dt>
                    <dd>{offer.statusLabel || offer.status || '-'}</dd>
                  </div>
                  <div>
                    <dt>AI 매칭률</dt>
                    <dd>{offer.matchScore || 0}%</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  className="primary-action offer-resume-link-button"
                  onClick={openResume}
                  disabled={!offer.resumeId}
                >
                  이력서로 이동
                </button>
              </article>

              <article className="detail-section offer-detail-action-card">
                <button
                  type="button"
                  className="secondary offer-cancel-button"
                  disabled={!canCancelOffer(offer.status) || saving}
                  onClick={cancelOffer}
                >
                  {saving ? '취소 중...' : '제안 취소하기'}
                </button>
                <button type="button" className="secondary offer-list-button" onClick={() => navigate(ROUTES.POSITION_OFFERS)}>
                  목록으로
                </button>
              </article>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
