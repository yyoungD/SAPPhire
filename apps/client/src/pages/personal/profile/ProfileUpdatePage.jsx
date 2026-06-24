import { useMemo, useRef, useState } from 'react';
import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';
import { userApi } from '../../../api/userApi.js';
import { ROUTES } from '../../../constanjs/routes.js';
import { useAuth } from '../../../hooks/useAuth.js';
import { navigate } from '../../../utils/authUtils.js';
import { resolveMediaUrl } from '../../../utils/mediaUrl.js';

const languages = [
  { value: 'KO', label: '한국어' },
  { value: 'EN', label: 'English' },
  { value: 'JA', label: '日本語' },
  { value: 'ZH', label: '中文' },
];

function firstLetter(name = '') {
  return name.trim().slice(0, 1).toUpperCase() || 'U';
}

function normalizeLanguage(language = '') {
  return String(language || 'KO').toUpperCase().replace('-', '_').slice(0, 2);
}

function createInitialForm(user) {
  return {
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    language: normalizeLanguage(user?.language),
    profileImageUrl: user?.profileImageUrl || '',
    profileImagePreviewUrl: resolveMediaUrl(user?.profileImageUrl),
    profileImageFile: null,
    removeProfileImage: false,
    marketingConsent: false,
    profileVisible: true,
  };
}

function formatPhone(value) {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}

export default function ProfileUpdatePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(() => createInitialForm(user));
  const [status, setStatus] = useState({ type: '', message: '' });
  const [saving, setSaving] = useState(false);

  const completion = useMemo(() => {
    const requiredFields = ['name', 'phone', 'email'];
    const filled = requiredFields.filter((key) => String(form[key]).trim()).length;
    return Math.round((filled / requiredFields.length) * 100);
  }, [form]);

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : name === 'phone' ? formatPhone(value) : value,
    }));
    setStatus({ type: '', message: '' });
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus({ type: 'error', message: '프로필 사진은 이미지 파일만 등록할 수 있습니다.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        profileImagePreviewUrl: reader.result,
        profileImageFile: file,
        removeProfileImage: false,
      }));
      setStatus({ type: '', message: '' });
    };
    reader.readAsDataURL(file);
  };

  const removeProfileImage = () => {
    setForm((current) => ({
      ...current,
      profileImagePreviewUrl: '',
      profileImageFile: null,
      removeProfileImage: true,
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      setStatus({ type: 'error', message: '이름과 전화번호를 입력해 주세요.' });
      return;
    }

    setSaving(true);
    setStatus({ type: '', message: '' });

    try {
      const updatedUser = await userApi.updateMe({
        name: form.name.trim(),
        phone: form.phone.trim(),
        language: form.language,
        profileImage: form.profileImageFile,
        removeProfileImage: form.removeProfileImage,
      });
      updateUser(updatedUser);
      setForm((current) => ({
        ...current,
        profileImageUrl: updatedUser.profileImageUrl || '',
        profileImagePreviewUrl: resolveMediaUrl(updatedUser.profileImageUrl),
        profileImageFile: null,
        removeProfileImage: false,
      }));
      localStorage.setItem(
        `sapphire.privacySettings.${user?.id || 'me'}`,
        JSON.stringify({
          marketingConsent: form.marketingConsent,
          profileVisible: form.profileVisible,
        }),
      );
      navigate(ROUTES.USER_MY_PAGE);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || '개인정보 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="member-page">
      <PersonalMemberHeader active="" />
      <div className="mypage-shell profile-edit-shell">
        <section className="mypage-title profile-edit-title">
          <p className="eyebrow">ACCOUNT PROFILE</p>
          <h1>프로필 수정</h1>
          <p>프로필 사진과 연락처처럼 마이페이지에서 바로 확인되는 개인정보를 관리합니다.</p>
        </section>

        <form className="profile-edit-layout" onSubmit={handleSubmit}>
          <section className="profile-edit-main">
            <article className="profile-card profile-edit-card">
              <div className="profile-edit-section-head">
                <div>
                  <p className="eyebrow">PHOTO</p>
                  <h2>프로필 사진</h2>
                </div>
                <span>{completion}% 작성</span>
              </div>

              <div className="profile-photo-editor">
                <div className="profile-avatar profile-photo-preview">
                  {form.profileImagePreviewUrl ? <img src={form.profileImagePreviewUrl} alt="" /> : firstLetter(form.name)}
                </div>
                <div className="profile-photo-actions">
                  <strong>{form.profileImagePreviewUrl ? '프로필 사진 미리보기' : '프로필 사진 없음'}</strong>
                  <p>사진을 선택하면 미리보기만 바뀌고, 저장하기를 눌러야 마이페이지와 헤더에 반영됩니다.</p>
                  <div>
                    <button type="button" className="secondary" onClick={() => fileInputRef.current?.click()}>
                      사진 선택
                    </button>
                    <button type="button" className="secondary" onClick={removeProfileImage}>
                      삭제
                    </button>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} />
                </div>
              </div>
            </article>

            <article className="profile-card profile-edit-card">
              <div className="profile-edit-section-head">
                <div>
                  <p className="eyebrow">PRIVATE INFO</p>
                  <h2>개인정보</h2>
                </div>
              </div>

              <div className="profile-edit-fields">
                <label>
                  <span>이름</span>
                  <input name="name" value={form.name} onChange={updateField} placeholder="이름을 입력하세요" />
                </label>
                <label>
                  <span>전화번호</span>
                  <input name="phone" value={form.phone} onChange={updateField} inputMode="tel" placeholder="010-0000-0000" />
                </label>
                <label>
                  <span>이메일</span>
                  <input name="email" value={form.email} disabled />
                </label>
                <label>
                  <span>사용 언어</span>
                  <select name="language" value={form.language} onChange={updateField}>
                    {languages.map((language) => (
                      <option key={language.value} value={language.value}>
                        {language.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>

            <article className="profile-card profile-edit-card">
              <div className="profile-edit-section-head">
                <div>
                  <p className="eyebrow">PRIVACY</p>
                  <h2>개인정보 설정</h2>
                </div>
              </div>

              <div className="privacy-option-list">
                <label className="profile-public-toggle">
                  <input type="checkbox" name="profileVisible" checked={form.profileVisible} onChange={updateField} />
                  <span>
                    <strong>마이페이지 프로필 공개</strong>
                    <small>기본 프로필 정보를 채용 서비스 화면에 표시합니다.</small>
                  </span>
                </label>
                <label className="profile-public-toggle">
                  <input type="checkbox" name="marketingConsent" checked={form.marketingConsent} onChange={updateField} />
                  <span>
                    <strong>채용 소식 수신</strong>
                    <small>추천 공고, 제안, 서비스 안내를 등록된 연락처로 받을 수 있습니다.</small>
                  </span>
                </label>
              </div>
            </article>
          </section>

          <aside className="profile-edit-side">
            <section className="profile-card profile-preview-card">
              <div className="profile-preview-user">
                <div className="profile-avatar">
                  {form.profileImagePreviewUrl ? <img src={form.profileImagePreviewUrl} alt="" /> : firstLetter(form.name)}
                </div>
                <div>
                  <h2>{form.name || '사용자'}</h2>
                  <p>{form.email || '이메일 정보 없음'}</p>
                </div>
              </div>

              <dl className="profile-dl">
                <div>
                  <dt>전화번호</dt>
                  <dd>{form.phone || '미입력'}</dd>
                </div>
                <div>
                  <dt>사용 언어</dt>
                  <dd>{languages.find((language) => language.value === form.language)?.label || '한국어'}</dd>
                </div>
                <div>
                  <dt>프로필 공개</dt>
                  <dd>{form.profileVisible ? '공개' : '비공개'}</dd>
                </div>
              </dl>
            </section>

            <section className="profile-card profile-save-card">
              {status.message && <p className={status.type === 'success' ? 'form-success' : 'form-error'}>{status.message}</p>}
              <button type="submit" className="primary-action" disabled={saving}>
                {saving ? '저장 중...' : '저장하기'}
              </button>
              <button type="button" className="secondary" onClick={() => navigate(ROUTES.USER_MY_PAGE)}>
                마이페이지로 돌아가기
              </button>
            </section>
          </aside>
        </form>
      </div>
    </main>
  );
}
