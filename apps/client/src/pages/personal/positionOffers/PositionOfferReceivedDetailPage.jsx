import { useEffect, useMemo, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import ConfirmModal from '../../../componenjs/common/ConfirmModal.jsx';
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

const statusConfirmCopy = {
  ACCEPTED: {
    title: '포지션 제안을 수락하시겠습니까?',
    message: '수락하면 기업회원에게 응답 상태가 전달됩니다.',
    confirmText: '수락하기',
    variant: 'primary',
  },
  DECLINED: {
    title: '포지션 제안을 거절하시겠습니까?',
    message: '거절하면 해당 제안을 다시 수락할 수 없습니다.',
    confirmText: '거절하기',
    variant: 'danger',
  },
};

function canRespondOffer(status) {
  return status === 'SENT';
}

export default function PositionOfferReceivedDetailPage() {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pendingStatus, setPendingStatus] = useState('');
  const id = new URLSearchParams(window.location.search).get('id');

  const confirmCopy = useMemo(() => statusConfirmCopy[pendingStatus] || statusConfirmCopy.ACCEPTED, [pendingStatus]);

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
    if (!canRespondOffer(offer?.status)) return false;

    setSaving(true);
    setError('');
    try {
      setOffer(await positionOfferApi.updateStatus(id, status));
      return true;
    } catch (err) {
      setError(err.message || '제안 상태를 변경하지 못했습니다.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const openStatusConfirm = (status) => {
    if (!canRespondOffer(offer?.status) || saving) return;
    setPendingStatus(status);
  };

  const closeStatusConfirm = () => {
    if (!saving) setPendingStatus('');
  };

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    const changed = await changeStatus(pendingStatus);
    if (changed) setPendingStatus('');
  };

  return (
    <main className="company-position-page">
      <PersonalMemberHeader active="offers" />
      <section className="company-position-shell compact">
        {loading && <p className="career-copy">제안 상세를 불러오는 중입니다.</p>}
        {!loading && error && <p className="form-error">{error}</p>}
        {!loading && offer && (
          <div className="offer-detail-layout company-offer-detail-layout">
            <section className="application-detail-main">
              <article className="detail-hero-card">
                <p className="eyebrow">POSITION OFFER</p>
                <h1>{offer.title}</h1>
              </article>

              <article className="detail-section">
                <h2>제안 정보</h2>
                <dl className="application-detail-dl">
                  <div>
                    <dt>기업명</dt>
                    <dd>{offer.companyName || '-'}</dd>
                  </div>
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
              </article>

              <article className="detail-section offer-message-card">
                <h2>제안 메시지</h2>
                <p className="application-cover-letter">{offer.message || '기업이 별도 메시지를 남기지 않았습니다.'}</p>
              </article>
            </section>

            <aside className="offer-detail-side">
              <article className="detail-section">
                <h2>제안 요약</h2>
                <dl className="application-detail-dl">
                  <div>
                    <dt>상태</dt>
                    <dd>
                      <span className={`company-job-status ${offerStatusClassNames[offer.status] || 'closed'}`}>
                        {offer.statusLabel || offer.status || '-'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt>AI 매칭률</dt>
                    <dd>{offer.matchScore || 0}%</dd>
                  </div>
                </dl>
                <div className="offer-tags">
                  {(offer.tags || []).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>

              <article className="detail-section offer-detail-action-card">
                <button
                  type="button"
                  className="primary-action"
                  disabled={!canRespondOffer(offer.status) || saving}
                  onClick={() => openStatusConfirm('ACCEPTED')}
                >
                  {saving ? '처리 중...' : '수락하기'}
                </button>
                <button
                  type="button"
                  className="secondary"
                  disabled={!canRespondOffer(offer.status) || saving}
                  onClick={() => openStatusConfirm('DECLINED')}
                >
                  거절하기
                </button>
                <button type="button" className="secondary offer-list-button" onClick={() => navigate(ROUTES.RECEIVED_OFFERS)}>
                  목록으로
                </button>
              </article>
            </aside>
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(pendingStatus)}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmText={confirmCopy.confirmText}
        cancelText="취소"
        variant={confirmCopy.variant}
        loading={saving}
        onCancel={closeStatusConfirm}
        onConfirm={confirmStatusChange}
      />
    </main>
  );
}
