import { Bell, Menu, Settings } from 'lucide-react';

export default function AdminHeader({ user }) {
  return (
    <header className="flex min-h-16 items-center justify-between gap-3 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:justify-end lg:px-8">
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-md text-[#57657a] lg:hidden"
        aria-label="메뉴"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="hidden size-10 items-center justify-center rounded-md text-[#57657a] hover:bg-[#eff4ff] sm:flex"
          aria-label="알림"
        >
          <Bell size={19} />
        </button>

        <button
          type="button"
          className="hidden size-10 items-center justify-center rounded-md text-[#57657a] hover:bg-[#eff4ff] sm:flex"
          aria-label="설정"
        >
          <Settings size={19} />
        </button>

        <div className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-[#003c90] to-[#0f52ba] text-sm font-bold text-white">
          {user?.name?.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  );
}
