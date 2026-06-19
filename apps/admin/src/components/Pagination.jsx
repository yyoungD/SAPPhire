import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalItems,
  pageSize = 10,
  onPageChange,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className={`relative px-5 py-4 text-sm text-[#57657a] ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md bg-white text-[#57657a] shadow-[0_8px_20px_rgba(11,28,48,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="이전 페이지"
        >
          <ChevronLeft size={17} />
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`inline-flex size-9 items-center justify-center rounded-md text-sm font-bold ${
              pageNumber === currentPage
                ? 'bg-[#003c90] text-white'
                : 'bg-white text-[#57657a] shadow-[0_8px_20px_rgba(11,28,48,0.05)] hover:bg-[#eff4ff] hover:text-[#003c90]'
            }`}
            onClick={() => onPageChange(pageNumber)}
            aria-label={`${pageNumber}페이지`}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md bg-white text-[#57657a] shadow-[0_8px_20px_rgba(11,28,48,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="다음 페이지"
        >
          <ChevronRight size={17} />
        </button>
      </div>
      <p className="absolute right-5 bottom-4 m-0 text-xs font-semibold text-[#738095]">
        전체 {totalItems.toLocaleString()}개 중 {start.toLocaleString()}-{end.toLocaleString()} 표시
      </p>
    </div>
  );
}
