import {
  ChevronDown,
  Download,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  UserRoundCheck,
  Users,
} from 'lucide-react';

const summaryItems = [
  { label: '전체 회원', value: '12,450', note: '지난달 대비 12%', icon: Users, tone: 'blue' },
  { label: '오늘 신규 가입', value: '142', note: '어제 대비 5%', icon: TrendingUp, tone: 'blue' },
  { label: '승인 대기', value: '28', note: '확인이 필요합니다', icon: UserRoundCheck, tone: 'red' },
  { label: '활성 세션', value: '1,024', note: '현재 접속 중', icon: Settings, tone: 'indigo' },
];

const members = [
  {
    name: '김지수',
    email: 'jisoo.kim@example.com',
    type: '개인',
    joinedAt: '2026.05.28',
    status: '활성',
    initial: 'K',
  },
  {
    name: '이민호',
    email: 'minho.lee@sapphire.co.kr',
    type: '기업',
    joinedAt: '2026.05.26',
    status: '활성',
    initial: 'L',
  },
  {
    name: '박진우',
    email: 'jinwoo.park@example.com',
    type: '개인',
    joinedAt: '2026.05.24',
    status: '승인 대기',
    initial: 'P',
  },
  {
    name: '최영호',
    email: 'youngho.choi@example.com',
    type: '개인',
    joinedAt: '2026.05.20',
    status: '정지됨',
    initial: 'C',
  },
];

function StatusBadge({ status }) {
  const styles = {
    활성: 'bg-[#dce9ff] text-[#003c90]',
    '승인 대기': 'bg-[#fff3cd] text-[#745500]',
    정지됨: 'bg-[#ffe1df] text-[#b42318]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function AdminUserManagePage() {
  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.08em] text-[#1d59c1]">
            MEMBER OPERATIONS
          </p>
          <h1 className="mb-3 text-4xl leading-tight font-bold sm:text-[44px]">회원관리</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-[#57657a]">
            플랫폼에 등록된 개인 및 기업 회원 계정을 확인하고 관리합니다.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#003c90] to-[#0f52ba] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,60,144,0.14)]"
        >
          <Plus size={17} />
          신규 회원 추가
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="회원 요약">
        {summaryItems.map(({ label, value, note, icon: Icon, tone }) => (
          <article
            key={label}
            className="rounded-lg bg-white p-5 shadow-[0_12px_32px_rgba(11,28,48,0.05)]"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="m-0 text-sm font-semibold text-[#57657a]">{label}</p>
              <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#1d59c1]">
                <Icon size={17} />
              </span>
            </div>
            <strong className="block text-[34px] leading-none font-bold">{value}</strong>
            <p
              className={`mt-3 mb-0 text-xs font-semibold ${
                tone === 'red'
                  ? 'text-[#c91d24]'
                  : tone === 'indigo'
                    ? 'text-[#2724b8]'
                    : 'text-[#0f52ba]'
              }`}
            >
              {note}
            </p>
          </article>
        ))}
      </section>

      <section className="mb-5 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_12px_32px_rgba(11,28,48,0.04)] xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-[#738095]" size={17} />
          <input
            className="h-11 w-full rounded-md bg-[#eff4ff] pr-4 pl-10 text-sm outline-none placeholder:text-[#738095]"
            placeholder="이름 또는 이메일 검색"
            type="search"
          />
        </div>
        <button
          type="button"
          className="flex min-h-11 items-center justify-between gap-5 rounded-md bg-[#eff4ff] px-4 text-sm font-semibold text-[#33445a] xl:min-w-40"
        >
          모든 회원 유형
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          className="flex min-h-11 items-center justify-between gap-5 rounded-md bg-[#eff4ff] px-4 text-sm font-semibold text-[#33445a] xl:min-w-36"
        >
          상태 전체
          <ChevronDown size={16} />
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-md bg-[#eff4ff] text-[#57657a]"
            aria-label="필터"
          >
            <Filter size={17} />
          </button>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-md bg-[#eff4ff] text-[#57657a]"
            aria-label="필터 설정"
          >
            <SlidersHorizontal size={17} />
          </button>
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-md bg-[#eff4ff] text-[#57657a]"
            aria-label="다운로드"
          >
            <Download size={17} />
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg bg-white shadow-[0_12px_32px_rgba(11,28,48,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="bg-[#eff4ff] text-xs font-bold tracking-[0.04em] text-[#57657a]">
              <tr>
                <th className="w-14 px-5 py-4">
                  <input type="checkbox" aria-label="전체 선택" />
                </th>
                <th className="px-4 py-4">회원</th>
                <th className="px-4 py-4">이메일</th>
                <th className="px-4 py-4">유형</th>
                <th className="px-4 py-4">가입일</th>
                <th className="px-4 py-4">상태</th>
                <th className="w-16 px-4 py-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.email}
                  className="border-b border-[#eff4ff] text-sm last:border-0 hover:bg-[#f8f9ff]"
                >
                  <td className="px-5 py-4">
                    <input type="checkbox" aria-label={`${member.name} 선택`} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-md bg-[#dce9ff] text-xs font-bold text-[#003c90]">
                        {member.initial}
                      </span>
                      <span className="font-semibold">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#57657a]">{member.email}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[#eff4ff] px-2.5 py-1 text-xs font-semibold text-[#57657a]">
                      {member.type}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-[#57657a]">{member.joinedAt}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-md text-[#57657a] hover:bg-[#eff4ff]"
                      aria-label={`${member.name} 관리`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="flex flex-col gap-4 px-5 py-4 text-sm text-[#57657a] sm:flex-row sm:items-center sm:justify-between">
          <p className="m-0">전체 12,450명 중 1-4명 표시</p>
          <div className="flex items-center gap-1">
            {['이전', '1', '2', '3', '다음'].map((page) => (
              <button
                key={page}
                type="button"
                className={`min-h-9 min-w-9 rounded-md px-2 text-sm font-semibold ${
                  page === '1' ? 'bg-[#003c90] text-white' : 'bg-[#eff4ff] text-[#57657a]'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </footer>
      </section>
    </>
  );
}
