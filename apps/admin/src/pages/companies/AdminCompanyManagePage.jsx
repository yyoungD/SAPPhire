import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  UserRoundCheck,
} from 'lucide-react';
import { adminCompanyApi } from '../../api/adminCompanyApi.js';
import ListTable from '../../components/ListTable.jsx';
import Pagination from '../../components/Pagination.jsx';
import SearchBar from '../../components/SearchBar.jsx';

const PAGE_SIZE = 10;

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

function includesKeyword(row, keyword) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;

  return [
    row.name,
    row.email,
    row.phone,
    row.companyName,
    row.businessNumber,
    row.industry,
    row.verificationStatus,
    row.status,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
}

function navigateToCompanyDetail(companyId) {
  window.history.pushState(null, '', `/admin/companies/detail?id=${companyId}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export default function AdminCompanyManagePage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    async function loadCompanies() {
      setLoading(true);
      setError('');

      try {
        const data = await adminCompanyApi.list();
        if (!ignore) setCompanies(data || []);
      } catch (exception) {
        if (!ignore) setError(exception.message || '기업회원 데이터를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCompanies();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const filteredCompanies = useMemo(
    () => companies.filter((company) => includesKeyword(company, keyword)),
    [companies, keyword]
  );

  const pagedCompanies = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredCompanies.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCompanies, page]);

  const summaryItems = useMemo(() => {
    const activeCount = companies.filter((company) => company.status === 'ACTIVE').length;
    const pendingCount = companies.filter(
      (company) => company.verificationStatus === 'PENDING' || company.status === 'INACTIVE' || company.status === 'BANNED'
    ).length;

    return [
      { label: '전체 기업', value: companies.length.toLocaleString(), note: 'DB 기준 기업회원 수', icon: Building2, tone: 'blue' },
      { label: '활성 기업', value: activeCount.toLocaleString(), note: '현재 이용 가능', icon: TrendingUp, tone: 'blue' },
      { label: '검토 필요', value: pendingCount.toLocaleString(), note: '승인 대기 또는 정지', icon: UserRoundCheck, tone: 'red' },
      { label: '목록 표시', value: filteredCompanies.length.toLocaleString(), note: '검색 결과', icon: Settings, tone: 'indigo' },
    ];
  }, [companies, filteredCompanies.length]);

  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.08em] text-[#1d59c1]">
            COMPANY OPERATIONS
          </p>
          <h1 className="mb-3 text-4xl leading-tight font-bold sm:text-[44px]">기업관리</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-[#57657a]">
            SAPPhire에 등록된 기업회원 계정을 실제 DB 데이터 기준으로 확인하고 관리합니다.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#003c90] to-[#0f52ba] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,60,144,0.14)]"
        >
          <Plus size={17} />
          신규 기업 추가
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="기업회원 요약">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mb-5 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_12px_32px_rgba(11,28,48,0.04)] xl:flex-row xl:items-center">
        <SearchBar
          className="flex-1"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="기업명 또는 이메일 검색"
        />
        <button
          type="button"
          className="flex min-h-11 items-center justify-between gap-5 rounded-md bg-[#eff4ff] px-4 text-sm font-semibold text-[#33445a] xl:min-w-36"
        >
          상태 전체
          <ChevronDown size={16} />
        </button>
        <div className="flex gap-2">
          <button type="button" className="flex size-11 items-center justify-center rounded-md bg-[#eff4ff] text-[#57657a]" aria-label="필터">
            <Filter size={17} />
          </button>
          <button type="button" className="flex size-11 items-center justify-center rounded-md bg-[#eff4ff] text-[#57657a]" aria-label="필터 설정">
            <SlidersHorizontal size={17} />
          </button>
          <button type="button" className="flex size-11 items-center justify-center rounded-md bg-[#eff4ff] text-[#57657a]" aria-label="다운로드">
            <Download size={17} />
          </button>
        </div>
      </section>

      <ListTable
        rows={pagedCompanies}
        loading={loading}
        error={error}
        emptyMessage="표시할 기업회원이 없습니다."
        avatarType="company"
        onRowClick={(company) => navigateToCompanyDetail(company.id)}
      />
      <Pagination page={page} totalItems={filteredCompanies.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>
  );
}
