import { useEffect, useRef, useState } from 'react';
import { companyProfileApi } from '../../../api/companyProfileApi.js';
import CompanyMemberHeader from '../../../componenjs/layout/CompanyMemberHeader.jsx';
import { ROUTES } from '../../../constanjs/routes.js';
import { navigate } from '../../../utils/authUtils.js';

const initialForm = {
  companyName: '',
  businessNumber: '',
  industry: '',
  companySize: '',
  websiteUrl: '',
  logoUrl: '',
  logoPreviewUrl: '',
  logoImage: null,
  removeLogo: false,
  description: '',
  address: '',
};

function firstFilled(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '') || '';
}

function normalizeProfile(profile = {}) {
  return {
    companyName: firstFilled(profile.companyName, profile.company_name),
    businessNumber: firstFilled(profile.businessNumber, profile.business_number),
    industry: firstFilled(profile.industry),
    companySize: firstFilled(profile.companySize, profile.company_size),
    websiteUrl: firstFilled(profile.websiteUrl, profile.website_url),
    logoUrl: firstFilled(profile.logoUrl, profile.logo_url),
    logoPreviewUrl: firstFilled(profile.logoUrl, profile.logo_url),
    logoImage: null,
    removeLogo: false,
    description: firstFilled(profile.description),
    address: firstFilled(profile.address),
  };
}

export default function CompanyProfileUpdatePage() {
  const logoInputRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setLoading(true);
      setMessage({ type: '', text: '' });

      try {
        const profile = await companyProfileApi.me();
        if (!ignore) setForm(normalizeProfile(profile));
      } catch (error) {
        if (!ignore) {
          setMessage({ type: 'error', text: error.message || '기업 정보를 불러오지 못했습니다.' });
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      ignore = true;
    };
  }, []);

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '로고는 이미지 파일만 등록할 수 있습니다.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        logoPreviewUrl: reader.result,
        logoImage: file,
        removeLogo: false,
      }));
      setMessage({ type: '', text: '' });
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setForm((current) => ({
      ...current,
      logoUrl: '',
      logoPreviewUrl: '',
      logoImage: null,
      removeLogo: true,
    }));
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!form.companyName.trim()) {
      setMessage({ type: 'error', text: '기업명을 입력해 주세요.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const updated = await companyProfileApi.updateMe(form);
      setForm(normalizeProfile(updated));
      navigate(ROUTES.COMPANY_MY_PAGE);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '기업 프로필 수정에 실패했습니다.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="member-page">
      <CompanyMemberHeader active="" />
      <div className="mypage-shell profile-edit-shell">
        <section className="mypage-title profile-edit-title">
          <p className="eyebrow">COMPANY PROFILE</p>
          <h2>기업 프로필 수정</h2>
          <p>기업 정보와 채용 담당자에게 보여질 기본 프로필을 수정합니다.</p>
        </section>

        <form className="profile-edit-layout" onSubmit={submit}>
          <section className="profile-edit-main">
            <article className="profile-card profile-edit-card">
              <div className="profile-edit-section-head">
                <div>
                  <span>기본 정보</span>
                  <h3>기업 식별 정보</h3>
                </div>
              </div>

              {loading && <p className="career-copy">기업 정보를 불러오는 중입니다.</p>}

              <div className="profile-edit-fields">
                <label>
                  <span>기업명</span>
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={updateField}
                    placeholder="기업명을 입력해 주세요"
                    disabled={loading}
                    required
                  />
                </label>
                <label>
                  <span>사업자등록번호</span>
                  <input
                    name="businessNumber"
                    value={form.businessNumber}
                    onChange={updateField}
                    placeholder="000-00-00000"
                    disabled={loading}
                  />
                </label>
                <label>
                  <span>산업군</span>
                  <input
                    name="industry"
                    value={form.industry}
                    onChange={updateField}
                    placeholder="IT 서비스"
                    disabled={loading}
                  />
                </label>
                <label>
                  <span>기업 규모</span>
                  <input
                    name="companySize"
                    value={form.companySize}
                    onChange={updateField}
                    placeholder="50-100명"
                    disabled={loading}
                  />
                </label>
                <label>
                  <span>웹사이트</span>
                  <input
                    name="websiteUrl"
                    value={form.websiteUrl}
                    onChange={updateField}
                    placeholder="https://example.com"
                    disabled={loading}
                  />
                </label>
                <label>
                  <span>주소</span>
                  <input
                    name="address"
                    value={form.address}
                    onChange={updateField}
                    placeholder="기업 주소"
                    disabled={loading}
                  />
                </label>
              </div>
            </article>

            <article className="profile-card profile-edit-card">
              <div className="profile-edit-section-head">
                <div>
                  <span>로고</span>
                  <h3>기업 로고</h3>
                </div>
              </div>

              <div className="profile-photo-editor">
                <div className="profile-avatar profile-photo-preview">
                  {form.logoPreviewUrl ? <img src={form.logoPreviewUrl} alt="" /> : (form.companyName || 'C').slice(0, 1)}
                </div>
                <div className="profile-photo-actions">
                  <strong>{form.logoPreviewUrl ? '기업 로고 미리보기' : '등록된 로고 없음'}</strong>
                  <p>JPG, PNG, GIF, WEBP 이미지를 등록할 수 있습니다. 저장 후 기업 프로필에 표시됩니다.</p>
                  <div>
                    <button type="button" className="secondary" onClick={() => logoInputRef.current?.click()} disabled={loading}>
                      로고 선택
                    </button>
                    <button type="button" className="secondary" onClick={removeLogo} disabled={loading}>
                      삭제
                    </button>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} hidden />
                </div>
              </div>
            </article>

            <article className="profile-card profile-edit-card">
              <div className="profile-edit-section-head">
                <div>
                  <span>소개</span>
                  <h3>기업 설명</h3>
                </div>
              </div>
              <div className="profile-edit-fields">
                <label className="full">
                  <span>기업 소개</span>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={updateField}
                    rows={6}
                    placeholder="기업의 주요 사업, SAP 채용 분야, 조직 문화를 입력해 주세요."
                    disabled={loading}
                  />
                </label>
              </div>
            </article>
          </section>

          <aside className="profile-edit-side">
            <section className="profile-card profile-save-card">
              <h2>저장</h2>
              {message.text && (
                <p className={message.type === 'error' ? 'form-error' : 'form-success'}>{message.text}</p>
              )}
              <button type="submit" className="primary-action" disabled={loading || saving}>
                {saving ? '저장 중...' : '수정 완료'}
              </button>
              <button type="button" className="secondary" onClick={() => navigate(ROUTES.COMPANY_MY_PAGE)}>
                취소
              </button>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}
