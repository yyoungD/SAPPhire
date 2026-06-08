import { MoreHorizontal, User } from 'lucide-react';

const statusLabels = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  BANNED: '정지',
  DELETED: '탈퇴',
};

const statusStyles = {
  ACTIVE: 'bg-[#dce9ff] text-[#003c90]',
  INACTIVE: 'bg-[#eff4ff] text-[#57657a]',
  BANNED: 'bg-[#ffe1df] text-[#b42318]',
  DELETED: 'bg-[#ffe1df] text-[#b42318]',
};

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR').format(new Date(value));
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        statusStyles[status] || 'bg-[#eff4ff] text-[#57657a]'
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {statusLabels[status] || status || '-'}
    </span>
  );
}

export default function ListTable({ rows = [], loading = false, error = '', emptyMessage = '표시할 데이터가 없습니다.' }) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-[0_12px_32px_rgba(11,28,48,0.05)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-[#eff4ff] text-xs font-bold tracking-[0.04em] text-[#57657a]">
            <tr>
              <th className="w-14 px-5 py-4">
                <input type="checkbox" aria-label="전체 선택" />
              </th>
              <th className="px-4 py-4">이름</th>
              <th className="px-4 py-4">이메일</th>
              <th className="px-4 py-4">가입일</th>
              <th className="px-4 py-4">상태</th>
              <th className="w-16 px-4 py-4 text-center">관리</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-[#57657a]" colSpan={6}>
                  데이터를 불러오는 중입니다.
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-[#b42318]" colSpan={6}>
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && rows.length === 0 && (
              <tr>
                <td className="px-5 py-10 text-center text-sm text-[#57657a]" colSpan={6}>
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              rows.map((row) => (
                <tr
                  key={row.id || row.email}
                  className="border-b border-[#eff4ff] text-sm last:border-0 hover:bg-[#f8f9ff]"
                >
                  <td className="px-5 py-4">
                    <input type="checkbox" aria-label={`${row.name} 선택`} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-md bg-[#dce9ff] text-[#003c90]">
                        <User size={17} />
                      </span>
                      <span className="font-semibold">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-[#57657a]">{row.email}</td>
                  <td className="px-4 py-4 text-[#57657a]">{formatDate(row.createdAt)}</td>
                  <td className="px-4 py-4">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button
                      type="button"
                      className="inline-flex size-9 items-center justify-center rounded-md text-[#57657a] hover:bg-[#eff4ff]"
                      aria-label={`${row.name} 관리`}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
