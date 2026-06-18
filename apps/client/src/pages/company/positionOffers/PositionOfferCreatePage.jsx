import { useMemo, useState } from 'react';
import { positionOfferApi } from '../../../api/positionOfferApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

function getInitialForm() {
  const params = new URLSearchParams(window.location.search);

  return {
    receiverUserId: params.get('receiverUserId') || '',
    receiverEmail: params.get('receiverEmail') || '',
    resumeId: params.get('resumeId') || '',
    title: '',
    message: '',
    expiresAt: '',
  };
}

export default function PositionOfferCreatePage() {
  const initialForm = useMemo(() => getInitialForm(), []);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    if (!form.receiverUserId) {
      setError('수신 개인회원 정보가 없습니다. 이력서 상세에서 다시 제안서를 작성해 주세요.');
      setSaving(false);
      return;
    }

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
    <main className="company-job-create-page">
      <CompanyMemberHeader active="offers" />
      <section className="job-create-shell">
        <div className="job-create-hero">
          <p className="eyebrow">DIRECT OFFER</p>
          <h1 className="company-page-title">포지션 제안 작성</h1>
          <p>관심 인재에게 전달할 제안 내용과 응답 기한을 입력해 주세요.</p>
        </div>

        <form className="job-create-card offer-create-form" onSubmit={submit}>
          <label className="job-create-field full">
            <span>수신 개인회원</span>
            <input
              value={form.receiverEmail || form.receiverUserId || ''}
              readOnly
              required
              placeholder="이력서 상세에서 선택한 회원 이메일"
            />
          </label>

          <label className="job-create-field full">
            <span>제안 제목</span>
            <input
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              required
              maxLength={150}
              placeholder="Senior SAP S/4HANA Finance Architect"
            />
          </label>

          <label className="job-create-field full">
            <span>제안 메시지</span>
            <textarea
              value={form.message}
              onChange={(event) => updateField('message', event.target.value)}
              rows={9}
              placeholder="후보자의 어떤 경험을 보고 제안하는지, 해당 업무와 다음 절차를 구체적으로 작성해 주세요."
            />
          </label>

          <label className="job-create-field full">
            <span>응답 기한</span>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={(event) => updateField('expiresAt', event.target.value)}
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="job-create-actions">
            <button type="button" className="secondary" onClick={() => navigate(ROUTES.POSITION_OFFERS)}>
              취소
            </button>
            <button type="submit" className="primary-action" disabled={saving}>
              {saving ? '전송 중...' : '제안 보내기'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
