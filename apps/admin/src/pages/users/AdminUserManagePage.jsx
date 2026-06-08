import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Download,
  Filter,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  UserRoundCheck,
  Users,
} from 'lucide-react';
import { adminUserApi } from '../../api/adminUserApi.js';
import ListTable from '../../components/ListTable.jsx';

function SummaryCard({ label, value, note, icon: Icon, tone }) {
  return (
    <article className="rounded-lg bg-white p-5 shadow-[0_12px_32px_rgba(11,28,48,0.05)]">
      <div className="mb-5 flex items-center justify-between">
        <p className="m-0 text-sm font-semibold text-[#57657a]">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#1d59c1]">
          <Icon size={17} />
        </span>
      </div>
      <strong className="block text-[34px] leading-none font-bold">{value}</strong>
      <p
        className={`mt-3 mb-0 text-xs font-semibold ${
          tone === 'red' ? 'text-[#c91d24]' : tone === 'indigo' ? 'text-[#2724b8]' : 'text-[#0f52ba]'
        }`}
      >
        {note}
      </p>
    </article>
  );
}

export default function AdminUserManagePage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      setLoading(true);
      setError('');

      try {
        const data = await adminUserApi.list();
        if (!ignore) {
          setUsers(data || []);
        }
      } catch (exception) {
        if (!ignore) {
          setError(exception.message || '회원 데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      ignore = true;
    };
  }, []);

  const summaryItems = useMemo(() => {
    const activeCount = users.filter((user) => user.status === 'ACTIVE').length;
    const pendingCount = users.filter((user) => user.status === 'INACTIVE' || user.status === 'BANNED').length;

    return [
      { label: '전체 회원', value: users.length.toLocaleString(), note: 'DB 기준 회원 수', icon: Users, tone: 'blue' },
      { label: '활성 회원', value: activeCount.toLocaleString(), note: '현재 이용 가능', icon: TrendingUp, tone: 'blue' },
      { label: '검토 필요', value: pendingCount.toLocaleString(), note: '비활성 또는 정지', icon: UserRoundCheck, tone: 'red' },
      { label: '목록 표시', value: users.length.toLocaleString(), note: '현재 테이블', icon: Settings, tone: 'indigo' },
    ];
  }, [users]);

  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.08em] text-[#1d59c1]">
            MEMBER OPERATIONS
          </p>
          <h1 className="mb-3 text-4xl leading-tight font-bold sm:text-[44px]">회원관리</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-[#57657a]">
            SAPPhire에 등록된 회원 계정을 실제 DB 데이터 기준으로 확인하고 관리합니다.
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
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} />
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

      <ListTable rows={users} loading={loading} error={error} emptyMessage="표시할 회원이 없습니다." />

      <footer className="flex flex-col gap-4 px-5 py-4 text-sm text-[#57657a] sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0">전체 {users.length.toLocaleString()}명 표시</p>
      </footer>
    </>
  );
}
