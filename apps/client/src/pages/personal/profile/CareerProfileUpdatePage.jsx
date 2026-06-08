import { useEffect, useMemo, useState } from 'react';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { personalProfileApi } from '../../../api/personalProfileApi.js';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const initialForm = {
  professionalTitle: '',
  desiredSalary: '',
  workType: '',
  location: '',
  careerYears: 0,
  sapSkills: '',
  coreCompetencies: '',
  summary: '',
  isPublic: true,
  isOfferAvailable: true,
};

const workTypes = [
  { value: '', label: '선택 안 함' },
  { value: 'ONSITE', label: '상주' },
  { value: 'REMOTE', label: '원격' },
  { value: 'HYBRID', label: '하이브리드' },
];

function normalizeProfile(profile = {}) {
  return {
    ...initialForm,
    ...profile,
    careerYears: profile.careerYears ?? 0,
    isPublic: profile.isPublic ?? true,
    isOfferAvailable: profile.isOfferAvailable ?? true,
  };
}

function scrollToHash() {
  const id = window.location.hash.replace('#', '');
  if (!id) return;
  window.requestAnimationFrame(() => {
    document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
}

export default function CareerProfileUpdatePage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const completion = useMemo(() => {
    const keys = ['professionalTitle', 'desiredSalary', 'workType', 'location', 'sapSkills', 'summary'];
    const filled = keys.filter((key) => String(form[key] ?? '').trim()).length;
    return Math.round((filled / keys.length) * 100);
  }, [form]);

  useEffect(() => {
    let ignore = false;
    personalProfileApi
      .me()
      .then((profile) => {
        if (!ignore) setForm(normalizeProfile(profile));
      })
      .catch((error) => {
        if (!ignore) setStatus({ type: 'error', message: error.message || '커리어 프로필을 불러오지 못했습니다.' });
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
          scrollToHash();
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'careerYears' ? Number(value) : value,
    }));
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: '', message: '' });
    try {
      await personalProfileApi.updateMe(form);
      navigate(ROUTES.USER_MY_PAGE);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || '커리어 프로필 저장에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="resume" />
      <div className="mypage-shell career-edit-shell">
        <section className="mypage-title profile-edit-title">
          <p className="eyebrow">CAREER PROFILE</p>
          <h1>커리어 프로필 수정</h1>
          <p>희망 조건, SAP 전문성, 경력 요약을 한 곳에서 관리합니다.</p>
        </section>

        <form className="career-edit-layout" onSubmit={handleSubmit}>
          <nav className="profile-card career-edit-nav" aria-label="커리어 프로필 섹션">
            <strong>{loading ? '불러오는 중' : `${completion}% 작성`}</strong>
            <button type="button" onClick={() => document.getElementById('work')?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>
              희망 근무 조건
            </button>
            <button type="button" onClick={() => document.getElementById('sap')?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>
              SAP 전문성
            </button>
            <button type="button" onClick={() => document.getElementById('summary')?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>
              경력 요약
            </button>
          </nav>

          <section className="career-edit-main">
            <article id="work" className="profile-card profile-edit-card career-edit-section">
              <div className="profile-edit-section-head">
                <div>
                  <p className="eyebrow">WORK PREFERENCE</p>
                  <h2>희망 근무 조건</h2>
                </div>
              </div>
              <div className="profile-edit-fields">
                <label>
                  <span>희망 직무</span>
                  <input name="professionalTitle" value={form.professionalTitle} onChange={updateField} placeholder="예: SAP FI 컨설턴트" />
                </label>
                <label>
                  <span>희망 연봉</span>
                  <input name="desiredSalary" value={form.desiredSalary} onChange={updateField} placeholder="예: 6,000만원 / 협의" />
                </label>
                <label>
                  <span>근무 형태</span>
                  <select name="workType" value={form.workType || ''} onChange={updateField}>
                    {workTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>희망 근무지</span>
                  <input name="location" value={form.location || ''} onChange={updateField} placeholder="예: 서울, 경기, 원격 가능" />
                </label>
                <label>
                  <span>총 경력</span>
                  <input name="careerYears" type="number" min="0" max="40" value={form.careerYears} onChange={updateField} />
                </label>
              </div>
            </article>

            <article id="sap" className="profile-card profile-edit-card career-edit-section">
              <div className="profile-edit-section-head">
                <div>
                  <p className="eyebrow">SAP EXPERTISE</p>
                  <h2>SAP 전문성</h2>
                </div>
              </div>
              <div className="profile-edit-fields">
                <label className="full">
                  <span>SAP 스킬</span>
                  <input name="sapSkills" value={form.sapSkills || ''} onChange={updateField} placeholder="예: FI, CO, MM, S/4HANA" />
                </label>
                <label className="full">
                  <span>핵심 역량</span>
                  <textarea name="coreCompetencies" value={form.coreCompetencies || ''} onChange={updateField} rows={5} placeholder="예: 결산 자동화, 전표 프로세스 개선, ABAP 협업" />
                </label>
              </div>
            </article>

            <article id="summary" className="profile-card profile-edit-card career-edit-section">
              <div className="profile-edit-section-head">
                <div>
                  <p className="eyebrow">SUMMARY</p>
                  <h2>경력 요약</h2>
                </div>
              </div>
              <div className="profile-edit-fields">
                <label className="full">
                  <span>경력 요약</span>
                  <textarea name="summary" value={form.summary || ''} onChange={updateField} rows={8} placeholder="주요 프로젝트, 담당 역할, 성과를 간단히 정리해 주세요." />
                </label>
              </div>
              <div className="privacy-option-list">
                <label className="profile-public-toggle">
                  <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={updateField} />
                  <span>
                    <strong>프로필 공개</strong>
                    <small>헤드헌터 및 채용 담당자에게 커리어 프로필을 공개합니다.</small>
                  </span>
                </label>
                <label className="profile-public-toggle">
                  <input type="checkbox" name="isOfferAvailable" checked={form.isOfferAvailable} onChange={updateField} />
                  <span>
                    <strong>포지션 제안 받기</strong>
                    <small>기업이 적합한 포지션을 제안할 수 있습니다.</small>
                  </span>
                </label>
              </div>
            </article>

            <section className="profile-card profile-save-card career-save-card">
              {status.message && <p className={status.type === 'success' ? 'form-success' : 'form-error'}>{status.message}</p>}
              <button type="submit" className="primary-action" disabled={saving || loading}>
                {saving ? '저장 중...' : '저장하기'}
              </button>
              <button type="button" className="secondary" onClick={() => navigate(ROUTES.USER_MY_PAGE)}>
                마이페이지로 돌아가기
              </button>
            </section>
          </section>
        </form>
      </div>
    </main>
  );
}
