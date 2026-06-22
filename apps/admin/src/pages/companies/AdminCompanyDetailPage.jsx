import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Ban,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  FileText,
  Globe,
  History,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquareText,
  Paperclip,
  Power,
  ShieldCheck,
} from 'lucide-react';
import { adminCompanyApi } from '../../api/adminCompanyApi.js';
import { ROUTES } from '../../constanjs/routes.js';

const statusLabels = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  BANNED: '정지',
  DELETED: '삭제',
};

const verificationLabels = {
  PENDING: '승인 대기',
  APPROVED: '승인',
  REJECTED: '반려',
};

function navigateTo(path) {
  window.history.pushState(null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function getCompanyIdFromUrl() {
  return new URLSearchParams(window.location.search).get('id');
}

function formatDate(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR').format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function SectionCard({ title, icon: Icon, children, className = '' }) {
  return (
    <section className={`rounded-lg bg-white p-5 shadow-[0_12px_32px_rgba(11,28,48,0.05)] ${className}`}>
      <div className="mb-5 flex items-center gap-2">
        {Icon && <Icon size={18} className="text-[#0f52ba]" />}
        <h2 className="m-0 text-lg font-bold text-[#0b1c30]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoGrid({ items }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-md bg-[#f8f9ff] p-4">
          <dt className="mb-1 text-xs font-bold text-[#57657a]">{item.label}</dt>
          <dd className="m-0 break-words text-sm font-semibold text-[#0b1c30]">{item.value || '-'}</dd>
        </div>
      ))}
    </dl>
  );
}

function MetricCard({ label, value, note, icon: Icon, tone = 'blue' }) {
  const toneClass = tone === 'red' ? 'text-[#c91d24]' : tone === 'green' ? 'text-[#087443]' : 'text-[#0f52ba]';

  return (
    <article className="rounded-lg bg-white p-5 shadow-[0_12px_32px_rgba(11,28,48,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <p className="m-0 text-sm font-semibold text-[#57657a]">{label}</p>
        <span className="flex size-9 items-center justify-center rounded-md bg-[#eff4ff] text-[#1d59c1]">
          <Icon size={17} />
        </span>
      </div>
      <strong className="block text-[32px] leading-none font-bold">{value}</strong>
      <p className={`mt-3 mb-0 text-xs font-semibold ${toneClass}`}>{note}</p>
    </article>
  );
}

function StatusBadge({ children, tone = 'blue' }) {
  const toneClass =
    tone === 'green'
      ? 'bg-[#e6f7ef] text-[#087443]'
      : tone === 'red'
        ? 'bg-[#ffe1df] text-[#b42318]'
        : 'bg-[#dce9ff] text-[#003c90]';

  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${toneClass}`}>{children}</span>;
}

function ActionButton({ icon: Icon, children, tone = 'default' }) {
  const toneClass =
    tone === 'danger'
      ? 'border-[#ffd2cf] text-[#b42318] hover:bg-[#fff3f2]'
      : 'border-[#d7e0ef] text-[#33445a] hover:bg-[#eff4ff] hover:text-[#003c90]';

  return (
    <button type="button" className={`flex min-h-11 items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-semibold transition ${toneClass}`}>
      <Icon size={16} />
      {children}
    </button>
  );
}

export default function AdminCompanyDetailPage() {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memo, setMemo] = useState('');
  const [memoSaving, setMemoSaving] = useState(false);
  const [memoError, setMemoError] = useState('');

  const companyId = getCompanyIdFromUrl();

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      if (!companyId) {
        setError('조회할 기업회원 ID가 없습니다.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const data = await adminCompanyApi.detail(companyId);
        if (!ignore) {
          setDetail(data);
          setMemo(data?.adminMemo || '');
        }
      } catch (exception) {
        if (!ignore) setError(exception.message || '기업회원 상세 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [companyId]);

  const recentActivities = useMemo(
    () => [
      { label: '로그인', value: detail?.recentLoginAt ? formatDateTime(detail.recentLoginAt) : '기록 없음' },
      { label: '공고 등록', value: detail?.latestJobCreatedAt ? formatDateTime(detail.latestJobCreatedAt) : '기록 없음' },
      { label: '지원자 접수', value: detail?.latestApplicationAt ? formatDateTime(detail.latestApplicationAt) : '기록 없음' },
      { label: '제안 발송', value: detail?.latestOfferCreatedAt ? formatDateTime(detail.latestOfferCreatedAt) : '기록 없음' },
      { label: '기업정보 수정', value: detail?.updatedAt ? formatDateTime(detail.updatedAt) : '기록 없음' },
    ],
    [detail]
  );

  async function handleSaveMemo() {
    if (!companyId || !memo.trim()) return;

    setMemoSaving(true);
    setMemoError('');

    try {
      const data = await adminCompanyApi.createMemo(companyId, memo.trim());
      setDetail(data);
      setMemo(data?.adminMemo || '');
    } catch (exception) {
      setMemoError(exception.message || '관리자 메모 저장에 실패했습니다.');
    } finally {
      setMemoSaving(false);
    }
  }

  if (loading) {
    return <p className="rounded-lg bg-white p-8 text-sm text-[#57657a]">기업회원 상세 정보를 불러오는 중입니다.</p>;
  }

  if (error) {
    return <p className="rounded-lg bg-white p-8 text-sm text-[#b42318]">{error}</p>;
  }

  return (
    <>
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-3 text-[11px] font-bold tracking-[0.08em] text-[#1d59c1]">COMPANY DETAIL</p>
          <h1 className="mb-3 text-4xl leading-tight font-bold sm:text-[44px]">기업회원 상세</h1>
          <p className="m-0 max-w-2xl text-sm leading-6 text-[#57657a]">
            기업회원의 기본 정보, 기업 프로필, 공고와 지원자 현황을 확인하고 계정 관리 작업을 수행합니다.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[#d7e0ef] bg-white px-4 text-sm font-bold text-[#33445a] transition hover:bg-[#eff4ff]"
          onClick={() => navigateTo(ROUTES.ADMIN_COMPANIES)}
        >
          <ArrowLeft size={17} />
          기업 목록
        </button>
      </section>

      <section className="mb-8 rounded-lg bg-white p-6 shadow-[0_12px_32px_rgba(11,28,48,0.05)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#dce9ff] text-2xl font-bold text-[#003c90]">
              {detail?.logoUrl ? (
                <img src={detail.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                detail?.companyName?.charAt(0) || <Building2 size={28} />
              )}
            </div>
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h2 className="m-0 text-2xl font-bold text-[#0b1c30]">{detail?.companyName || detail?.name || '-'}</h2>
                <StatusBadge>{statusLabels[detail?.status] || detail?.status || '-'}</StatusBadge>
                <StatusBadge tone={detail?.verificationStatus === 'APPROVED' ? 'green' : detail?.verificationStatus === 'REJECTED' ? 'red' : 'blue'}>
                  {verificationLabels[detail?.verificationStatus] || detail?.verificationStatus || '-'}
                </StatusBadge>
              </div>
              <p className="m-0 flex items-center gap-2 text-sm font-semibold text-[#57657a]">
                <Mail size={15} />
                {detail?.email || '-'}
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <ActionButton icon={ShieldCheck}>인증 승인/반려</ActionButton>
            <ActionButton icon={ShieldCheck}>상태 변경</ActionButton>
            <ActionButton icon={Power}>강제 로그아웃</ActionButton>
            <ActionButton icon={Ban} tone="danger">탈퇴 처리</ActionButton>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="등록 공고" value={detail?.jobCount || 0} note="전체 공고 수" icon={BriefcaseBusiness} />
        <MetricCard label="지원자" value={detail?.applicantCount || 0} note="전체 지원자 수" icon={ClipboardList} />
        <MetricCard label="포지션 제안" value={detail?.offerCount || 0} note="보낸 제안 수" icon={MessageSquareText} />
        <MetricCard label="첨부 파일" value={detail?.attachmentCount || 0} note="공고 첨부파일 수" icon={Paperclip} />
      </section>

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <SectionCard title="기본 정보" icon={Building2}>
            <InfoGrid
              items={[
                { label: '기업명', value: detail?.companyName || detail?.name },
                { label: '이메일', value: detail?.email },
                { label: '전화번호', value: detail?.phone },
                { label: '가입일', value: formatDate(detail?.createdAt) },
                { label: '최근 로그인일', value: formatDateTime(detail?.recentLoginAt) },
                { label: '상태', value: statusLabels[detail?.status] || detail?.status },
              ]}
            />
          </SectionCard>

          <SectionCard title="기업 프로필" icon={Globe}>
            <InfoGrid
              items={[
                { label: '사업자등록번호', value: detail?.businessNumber },
                { label: '인증 상태', value: verificationLabels[detail?.verificationStatus] || detail?.verificationStatus },
                { label: '웹사이트', value: detail?.websiteUrl },
                { label: '주소', value: detail?.address },
                { label: '업종', value: detail?.industry },
                { label: '기업 규모', value: detail?.companySize },
              ]}
            />
            <div className="mt-3 rounded-md bg-[#f8f9ff] p-4">
              <p className="mb-1 text-xs font-bold text-[#57657a]">기업 설명</p>
              <p className="m-0 whitespace-pre-wrap text-sm font-semibold leading-6 text-[#0b1c30]">{detail?.description || '-'}</p>
            </div>
          </SectionCard>

          <SectionCard title="공고 현황" icon={BriefcaseBusiness}>
            <InfoGrid
              items={[
                { label: '전체 공고 수', value: `${detail?.jobCount || 0}건` },
                { label: '모집중', value: `${detail?.openJobCount || 0}건` },
                { label: '마감', value: `${detail?.closedJobCount || 0}건` },
                { label: '숨김', value: `${detail?.hiddenJobCount || 0}건` },
                { label: '임시저장', value: `${detail?.draftJobCount || 0}건` },
              ]}
            />
          </SectionCard>

          <SectionCard title="지원자 현황" icon={ClipboardList}>
            <InfoGrid
              items={[
                { label: '전체 지원자 수', value: `${detail?.applicantCount || 0}명` },
                { label: '미열람 지원자 수', value: `${detail?.unreadApplicantCount || 0}명` },
                { label: '진행중 전형 수', value: `${detail?.progressingApplicationCount || 0}건` },
              ]}
            />
          </SectionCard>

          <SectionCard title="최근 활동 로그" icon={Activity}>
            <div className="divide-y divide-[#eff4ff]">
              {recentActivities.map((activity) => (
                <div key={activity.label} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-semibold text-[#0b1c30]">{activity.label}</span>
                  <span className="text-[#57657a]">{activity.value}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-5">
          <SectionCard title="포지션 제안" icon={MessageSquareText}>
            <InfoGrid
              items={[
                { label: '보낸 제안 수', value: `${detail?.offerCount || 0}건` },
                { label: '수락', value: `${detail?.acceptedOfferCount || 0}건` },
                { label: '거절', value: `${detail?.declinedOfferCount || 0}건` },
                { label: '대기', value: `${detail?.pendingOfferCount || 0}건` },
                { label: '취소', value: `${detail?.canceledOfferCount || 0}건` },
              ]}
            />
          </SectionCard>

          <SectionCard title="첨부/파일" icon={Paperclip}>
            <InfoGrid
              items={[
                { label: '기업 로고', value: detail?.logoUrl ? '등록됨' : '미등록' },
                { label: '공고 첨부파일 수', value: `${detail?.attachmentCount || 0}개` },
              ]}
            />
          </SectionCard>

          <SectionCard title="관리자 메모" icon={MessageSquareText}>
            <textarea
              className="min-h-32 w-full resize-y rounded-md border border-[#d7e0ef] bg-[#f8f9ff] p-3 text-sm font-semibold text-[#0b1c30] outline-none transition focus:border-[#0f52ba] focus:bg-white"
              value={memo}
              maxLength={2000}
              placeholder="관리자 내부 메모를 입력하세요."
              onChange={(event) => setMemo(event.target.value)}
            />
            {memoError && <p className="mt-2 mb-0 text-xs font-semibold text-[#b42318]">{memoError}</p>}
            <button
              type="button"
              className="mt-3 flex min-h-10 w-full items-center justify-center rounded-md bg-[#003c90] px-3 text-sm font-bold text-white transition hover:bg-[#002f72] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={memoSaving || !memo.trim()}
              onClick={async () => {
                if (!companyId || !memo.trim()) return;
                setMemoSaving(true);
                setMemoError('');
                try {
                  const data = await adminCompanyApi.createMemo(companyId, memo.trim());
                  setDetail(data);
                  setMemo(data?.adminMemo || '');
                } catch (exception) {
                  setMemoError(exception.message || '관리자 메모 저장에 실패했습니다.');
                } finally {
                  setMemoSaving(false);
                }
              }}
            >
              {memoSaving ? '저장 중...' : '메모 저장'}
            </button>
          </SectionCard>

          <SectionCard title="신고/제재 이력" icon={AlertTriangle}>
            <InfoGrid
              items={[
                { label: '신고 받은 횟수', value: `${detail?.reportCount || 0}건` },
                { label: '정지 이력', value: `${detail?.sanctionCount || 0}건` },
              ]}
            />
          </SectionCard>

          <SectionCard title="위험 신호" icon={AlertTriangle}>
            <div className="space-y-3 text-sm">
              <p className="m-0 rounded-md bg-[#f8f9ff] p-3 font-semibold text-[#57657a]">
                신고 누적, 비정상 활동, 인증 실패 반복 기능은 아직 준비 중입니다.
              </p>
              <p className="m-0 rounded-md bg-[#f8f9ff] p-3 font-semibold text-[#087443]">
                현재 표시 가능한 위험 신호는 없습니다.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="상태 변경 이력" icon={History}>
            <p className="m-0 rounded-md bg-[#f8f9ff] p-3 text-sm font-semibold text-[#57657a]">
              상태 변경 로그 테이블 추가 후 이 영역에 관리자 변경 이력을 표시합니다.
            </p>
          </SectionCard>

          <SectionCard title="관련 데이터 바로가기" icon={FileText}>
            <div className="grid gap-2">
              <button type="button" className="rounded-md bg-[#eff4ff] px-3 py-3 text-sm font-semibold text-[#003c90] transition hover:bg-[#dce9ff]">
                이 기업의 공고 보기
              </button>
              <button type="button" className="rounded-md bg-[#eff4ff] px-3 py-3 text-sm font-semibold text-[#003c90] transition hover:bg-[#dce9ff]">
                지원자 현황 보기
              </button>
              <button type="button" className="rounded-md bg-[#eff4ff] px-3 py-3 text-sm font-semibold text-[#003c90] transition hover:bg-[#dce9ff]">
                포지션 제안 보기
              </button>
            </div>
          </SectionCard>
        </aside>
      </div>
    </>
  );
}
