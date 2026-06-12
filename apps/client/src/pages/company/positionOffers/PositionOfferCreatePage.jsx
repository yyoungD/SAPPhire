import { useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const params = new URLSearchParams(window.location.search);

export default function PositionOfferCreatePage() {
  const [form, setForm] = useState({
    receiverUserId: params.get('receiverUserId') || '',
    resumeId: params.get('resumeId') || '',
    title: '',
    message: '',
    expiresAt: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await positionOfferApi.create({
        receiverUserId: Number(form.receiverUserId),
        resumeId: form.resumeId ? Number(form.resumeId) : null,
        title: form.title,
        message: form.message,
        expiresAt: form.expiresAt ? `${form.expiresAt}:00` : null,
      });
      navigate(`${ROUTES.POSITION_OFFER_DETAIL}?id=${created.id}`);
    } catch (err) {
      setError(err.message || '포지션 제안을 보내지 못했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="company-position-page">
      <CompanyMemberHeader active="offers" />
      <section className="company-position-shell compact">
        <div className="job-create-hero">
          <p className="eyebrow">DIRECT OFFER</p>
          <h1 className="company-page-title">포지션 제안 작성</h1>
          <p>관심 인재에게 전달할 제안 내용과 응답 기한을 입력하세요.</p>
        </div>

        <form className="detail-section offer-create-form" onSubmit={submit}>
          <div className="apply-fields">
            <label>
              <span>수신 개인 회원 ID</span>
              <input value={form.receiverUserId} onChange={(event) => updateField('receiverUserId', event.target.value)} required inputMode="numeric" />
            </label>
            <label>
              <span>이력서 ID</span>
              <input value={form.resumeId} onChange={(event) => updateField('resumeId', event.target.value)} inputMode="numeric" />
            </label>
            <label className="full">
              <span>제안 제목</span>
              <input value={form.title} onChange={(event) => updateField('title', event.target.value)} required maxLength={150} placeholder="Senior SAP S/4HANA Finance Architect" />
            </label>
            <label className="full">
              <span>제안 메시지</span>
              <textarea
                value={form.message}
                onChange={(event) => updateField('message', event.target.value)}
                rows={9}
                placeholder="후보자의 어떤 경험을 보고 제안하는지, 담당 업무와 다음 절차를 구체적으로 작성하세요."
              />
            </label>
            <label>
              <span>응답 기한</span>
              <input type="datetime-local" value={form.expiresAt} onChange={(event) => updateField('expiresAt', event.target.value)} />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="offer-action-grid">
            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? '전송 중...' : '제안 보내기'}
            </button>
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.POSITION_OFFERS)}>
              취소
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
