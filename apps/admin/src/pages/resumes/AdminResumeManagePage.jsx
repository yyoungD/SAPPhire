import { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  Download,
  FileText,
  Filter,
  Plus,
  Settings,
  SlidersHorizontal,
  TrendingUp,
  UserRoundCheck,
} from 'lucide-react';
import { adminResumeApi } from '../../api/adminResumeApi.js';
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

  return [row.title, row.applicantName, row.applicantEmail, row.status]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedKeyword));
}

function toTableRow(resume) {
  return {
    ...resume,
    name: resume.title,
    email: [resume.applicantName, resume.applicantEmail].filter(Boolean).join(' · '),
  };
}

export default function AdminResumeManagePage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    async function loadResumes() {
      setLoading(true);
      setError('');

      try {
        const data = await adminResumeApi.list();
        if (!ignore) setResumes(data || []);
      } catch (exception) {
        if (!ignore) setError(exception.message || '이력서 데이터를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadResumes();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const filteredResumes = useMemo(
    () => resumes.filter((resume) => includesKeyword(resume, keyword)),
    [resumes, keyword]
  );

  const pagedResumes = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredResumes.slice(startIndex, startIndex + PAGE_SIZE).map(toTableRow);
  }, [filteredResumes, page]);

  const summaryItems = useMemo(() => {
    const publicCount = resumes.filter((resume) => resume.status === 'PUBLIC').length;
    const companyOnlyCount = resumes.filter((resume) => resume.status === 'COMPANY_ONLY').length;
    const privateCount = resumes.filter((resume) => resume.status === 'PRIVATE').length;

    return [
      { label: '전체 이력서', value: resumes.length.toLocaleString(), note: 'DB 기준 이력서 수', icon: FileText, tone: 'blue' },
      { label: '공개 이력서', value: publicCount.toLocaleString(), note: '전체 공개 상태', icon: TrendingUp, tone: 'blue' },
      { label: '기업 공개', value: companyOnlyCount.toLocaleString(), note: '기업회원 조회 가능', icon: UserRoundCheck, tone: 'indigo' },
      { label: '비공개', value: privateCount.toLocaleString(), note: '개인 보관 상태', icon: Settings, tone: 'red' },
    ];
  }, [resumes]);

  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.08em] text-[#1d59c1]">
            RESUME OPERATIONS
          </p>
          <h1 className="mb-3 text-4xl leading-tight font-bold sm:text-[44px]">이력서관리</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-[#57657a]">
            SAPPhire에 등록된 모든 회원의 이력서를 실제 DB 데이터 기준으로 확인하고 관리합니다.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-gradient-to-br from-[#003c90] to-[#0f52ba] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(0,60,144,0.14)]"
        >
          <Plus size={17} />
          신규 이력서 추가
        </button>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="이력서 요약">
        {summaryItems.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="mb-5 flex flex-col gap-3 rounded-lg bg-white p-4 shadow-[0_12px_32px_rgba(11,28,48,0.04)] xl:flex-row xl:items-center">
        <SearchBar
          className="flex-1"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="이력서 제목 또는 회원명 검색"
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
        rows={pagedResumes}
        loading={loading}
        error={error}
        emptyMessage="표시할 이력서가 없습니다."
        nameLabel="이력서"
        emailLabel="회원"
        dateLabel="등록일"
      />
      <Pagination page={page} totalItems={filteredResumes.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
    </>
  );
}
