import NotificationBell from '../common/NotificationBell.jsx';
import { ROUTES } from '../../constanjs/routes.js';
import { useAuth } from '../../hooks/useAuth.js';
import { navigate } from '../../utils/authUtils.js';

const logoUrl = new URL('../../assejs/images/ci-10.png', import.meta.url).href;

const navItems = [
  { key: 'ai', label: 'AI 추천', path: ROUTES.AI_EVALUATION },
  { key: 'jobs', label: '채용 공고', path: ROUTES.JOBS },
  { key: 'offers', label: '포지션 제안', path: ROUTES.RECEIVED_OFFERS },
  { key: 'applications', label: '지원 현황', path: ROUTES.MY_APPLICATIONS },
  { key: 'resume', label: '이력서', path: ROUTES.RESUMES },
];

export default function PersonalMemberHeader({ active = 'jobs' }) {
  const { user } = useAuth();
  const profileImageUrl = user?.profileImageUrl;

  return (
    <header className="member-header">
      <div className="member-brand">
        <button type="button" className="brand-button" onClick={() => navigate(ROUTES.USER_MY_PAGE)}>
          <img src={logoUrl} alt="SAPPhire" />
        </button>
        <nav aria-label="개인회원 메뉴">
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
      <div className="member-actions">
        <label className="member-search">
          <span>검색</span>
          <input placeholder="공고 이름, 회사 이름 검색..." />
        </label>
        <NotificationBell />
        <button
          type="button"
          className="avatar-button"
          onClick={() => navigate(ROUTES.USER_MY_PAGE)}
          aria-label="마이페이지"
        >
          {profileImageUrl ? (
            <img src={profileImageUrl} alt="" />
          ) : (
            <span>{(user?.name || 'U').slice(0, 1).toUpperCase()}</span>
          )}
        </button>
      </div>
    </header>
  );
}
