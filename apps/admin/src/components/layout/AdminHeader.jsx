import { Bell, Menu, Search, Settings } from 'lucide-react';

export default function AdminHeader({ user }) {
  return (
    <header className="flex min-h-16 items-center gap-3 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <button
        type="button"
        className="flex size-10 items-center justify-center rounded-md text-[#57657a] lg:hidden"
        aria-label="메뉴"
      >
        <Menu size={20} />
      </button>

      <div className="relative max-w-[720px] flex-1">
        <Search className="absolute top-1/2 left-4 -translate-y-1/2 text-[#738095]" size={18} />
        <input
          className="h-11 w-full rounded-md bg-[#eff4ff] pr-4 pl-11 text-sm outline-none placeholder:text-[#738095] focus:bg-white focus:shadow-[0_0_0_4px_rgba(29,89,193,0.08)]"
          placeholder="SAPPhire 관리자 메뉴 검색"
          type="search"
        />
      </div>

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
    </header>
  );
}
