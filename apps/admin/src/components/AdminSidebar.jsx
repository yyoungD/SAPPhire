import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  Users,
} from 'lucide-react';
import sapphireLogo from '../assets/sapphire_logo.png';

const navigationItems = [
  { label: '대시보드', icon: LayoutDashboard },
  { label: '회원관리', icon: Users, active: true },
  { label: '기업관리', icon: Building2 },
  { label: '공고관리', icon: BriefcaseBusiness },
  { label: '이력서관리', icon: FileText },
  { label: '신고관리', icon: ShieldAlert },
  { label: '통계관리', icon: BarChart3 },
];

export default function AdminSidebar({ user, onLogout }) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col bg-[#eff4ff] px-4 py-6 lg:flex">
        <div className="px-3 pb-9">
          <img className="h-auto w-[150px]" src={sapphireLogo} alt="SAPPhire" />
          <p className="mt-2 text-[11px] font-bold tracking-[0.16em] text-[#57657a]">
            RECRUITMENT ADMIN
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1" aria-label="관리자 메뉴">
          {navigationItems.map(({ label, icon: Icon, active }) => (
            <button
              key={label}
              type="button"
              className={`flex min-h-12 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${
                active
                  ? 'bg-[#dce9ff] text-[#003c90] shadow-[inset_-3px_0_0_#0f52ba]'
                  : 'text-[#57657a] hover:bg-white/70 hover:text-[#0b1c30]'
              }`}
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="rounded-md bg-[#dce9ff] p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#003c90] to-[#0f52ba] text-sm font-bold text-white">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#0b1c30]">
                {user?.name || 'Admin User'}
              </p>
              <p className="truncate text-[11px] text-[#57657a]">
                {user?.email || 'System Administrator'}
              </p>
            </div>
            <button
              type="button"
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-[#57657a] hover:bg-white/70 hover:text-[#003c90]"
              onClick={onLogout}
              title="로그아웃"
              aria-label="로그아웃"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <nav
        className="sticky top-0 z-30 flex gap-1 overflow-x-auto bg-[#eff4ff] px-3 py-2 lg:hidden"
        aria-label="모바일 관리자 메뉴"
      >
        {navigationItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-semibold ${
              active ? 'bg-[#dce9ff] text-[#003c90]' : 'text-[#57657a]'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
