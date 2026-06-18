import { useEffect, useState } from 'react';
import { companyProfileApi } from '../../api/companyProfileApi.js';
import { ROUTES } from '../../constanjs/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { navigate } from '../../utils/authUtils.js';

const logoUrl = new URL('../../assejs/images/ci-10.png', import.meta.url).href;

const navItems = [
  { key: 'create', label: '공고 등록', path: ROUTES.COMPANY_JOB_CREATE },
  { key: 'jobs', label: '공고 관리', path: ROUTES.COMPANY_JOBS },
  { key: 'offers', label: '포지션 제안', path: ROUTES.POSITION_OFFERS },
  { key: 'applications', label: '지원 현황', path: ROUTES.COMPANY_APPLICATIONS },
  { key: 'resumes', label: '인재풀', path: ROUTES.COMPANY_RESUMES },
];

export default function CompanyMemberHeader({ active = 'jobs' }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const logoImageUrl = profile?.logoUrl;
  const profileLabel = profile?.companyName || user?.name || user?.email || '기업';

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      try {
        const data = await companyProfileApi.me();
        if (!ignore) setProfile(data);
      } catch {
        if (!ignore) setProfile(null);
      }
    }

    loadProfile();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <header className="member-header">
      <div className="member-brand">
        <button
          type="button"
          className="brand-button"
          onClick={() => navigate(ROUTES.COMPANY_MY_PAGE)}
        >
          <img src={logoUrl} alt="SAPPhire" />
        </button>
        <nav aria-label="기업회원 메뉴">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.key}
              className={active === item.key ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="member-actions company-member-actions">
        <button
          type="button"
          className="member-icon-button company-notification-button"
          aria-label="알림"
        >
          <span />
        </button>
        <button
          type="button"
          className="member-profile-button"
          onClick={() => navigate(ROUTES.COMPANY_MY_PAGE)}
          aria-label="My page"
        >
          <span className="avatar-button company-logo-avatar" aria-hidden="true">
            {logoImageUrl ? (
              <img src={logoImageUrl} alt="" />
            ) : (
              <span>{profileLabel.slice(0, 1).toUpperCase()}</span>
            )}
          </span>
          <strong>My page</strong>
        </button>
      </div>
    </header>
  );
}
