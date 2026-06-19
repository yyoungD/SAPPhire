import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  ChevronDown,
  Download,
  Filter,
  Plus,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  UserRoundCheck,
} from 'lucide-react';
import { adminJobApi } from '../../api/adminJobApi.js';
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

  return [row.title, row.companyName, row.companyEmail, row.location, row.status]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
}

function toTableRow(job) {
  return {
    ...job,
    name: job.title,
    email: [job.companyName, job.companyEmail].filter(Boolean).join(' · '),
    logoUrl: job.logoUrl,
  };
}

export default function AdminJobManagePage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    async function loadJobs() {
      setLoading(true);
      setError('');

      try {
        const data = await adminJobApi.list();
        if (!ignore) setJobs(data || []);
      } catch (exception) {
        if (!ignore) setError(exception.message || '공고 데이터를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadJobs();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const filteredJobs = useMemo(
    () => jobs.filter((job) => includesKeyword(job, keyword)),
    [jobs, keyword]
  );

  const pagedJobs = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredJobs.slice(startIndex, startIndex + PAGE_SIZE).map(toTableRow);
  }, [filteredJobs, page]);

  const summaryItems = useMemo(() => {
    const openCount = jobs.filter((job) => job.status === 'OPEN').length;
    const draftCount = jobs.filter((job) => job.status === 'DRAFT').length;
    const closedCount = jobs.filter((job) => job.status === 'CLOSED' || job.status === 'HIDDEN').length;

    return [
      { label: '전체 공고', value: jobs.length.toLocaleString(), note: 'DB 기준 공고 수', icon: BriefcaseBusiness, tone: 'blue' },
      { label: '모집중', value: openCount.toLocaleString(), note: '현재 공개 모집', icon: TrendingUp, tone: 'blue' },
      { label: '검토 필요', value: draftCount.toLocaleString(), note: '임시저장 공고', icon: UserRoundCheck, tone: 'red' },
      { label: '마감/숨김', value: closedCount.toLocaleString(), note: '비공개 또는 종료', icon: Settings, tone: 'indigo' },
    ];
  }, [jobs]);

  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.08em] text-[#1d59c1]">
            JOB OPERATIONS
          </p>
          <h1 className="mb-3 text-4xl leading-tight font-bold sm:text-[44px]">공고관리</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-[#57657a]">
            SAPPhire에 등록된 모든 회원의 채용 공고를 실제 DB 데이터 기준으로 확인하고 관리합니다.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#003c90] to-[#0f52ba] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,60,144,0.14)]"
        >
          <Plus size={17} />
          신규 공고 추가
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="공고 요약">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mb-5 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_12px_32px_rgba(11,28,48,0.04)] xl:flex-row xl:items-center">
        <SearchBar
          className="flex-1"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="공고 제목 또는 기업명 검색"
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
        rows={pagedJobs}
        loading={loading}
        error={error}
        emptyMessage="표시할 공고가 없습니다."
        avatarType="company"
        nameLabel="공고명"
        emailLabel="기업"
        dateLabel="등록일"
      />
      <Pagination page={page} totalItems={filteredJobs.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>
  );
}
