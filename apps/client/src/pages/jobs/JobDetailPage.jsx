import { ROUTES } from '../../constanjs/routes.js';
import PersonalMemberHeader from '../../componenjs/layout/PersonalMemberHeader.jsx';
import { navigate } from '../../utils/authUtils.js';

const skillTags = ['JAVA', 'Spring', 'MyBatis', 'Python', 'AI'];

export default function JobDetailPage() {
  return (
    <main className="member-page">
      <PersonalMemberHeader active="jobs" />
      <div className="detail-layout">
        <section className="detail-main">
          <article className="detail-hero-card">
            <div className="detail-hero-top">
              <div>
                <div className="detail-badges">
                  <span>ID: 50715283</span>
                  <span>기업인증 완료</span>
                  <span>11년차 안정기업</span>
                </div>
                <h1>공공 정보자원관리원 자원통합 구축 SAP 인력 모집</h1>
                <button type="button" className="company-link">
                  SAPPhire Partner
                </button>
              </div>
              <div className="detail-stats">
                <strong>조회 1,204</strong>
                <span>스크랩 29</span>
              </div>
            </div>
            <dl className="job-facts">
              <div>
                <dt>경력</dt>
                <dd>신입 / 경력 1년 이상</dd>
              </div>
              <div>
                <dt>학력</dt>
                <dd>초대졸 이상</dd>
              </div>
              <div>
                <dt>근무형태</dt>
                <dd>계약직, 프리랜서</dd>
              </div>
              <div>
                <dt>마감일</dt>
                <dd className="danger">D-15</dd>
              </div>
            </dl>
          </article>

          <article className="detail-section">
            <h2>지원 자격 및 조건</h2>
            <div className="detail-block">
              <h3>요구 스킬 및 역량</h3>
              <div className="detail-row">
                <span>필수 스킬</span>
                <div className="tag-row">
                  {skillTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <div className="detail-row">
                <span>핵심 역량</span>
                <p>성실성, 책임감, 커뮤니케이션, 적응력, 협업 능력</p>
              </div>
              <div className="detail-row">
                <span>우대 사항</span>
                <p>정보처리기사, 정보보안기사, 공공기관 프로젝트 경험 보유자</p>
              </div>
            </div>
            <div className="detail-block">
              <h3>근무 환경</h3>
              <ul className="plain-list">
                <li>주 5일 근무, 09:00 ~ 18:00</li>
                <li>광주 서구 상무대로 43번길 34</li>
                <li>프로젝트 투입 전 온보딩 및 모듈 교육 제공</li>
              </ul>
            </div>
          </article>

          <article className="detail-section">
            <h2>주요 업무</h2>
            <p>
              공공 정보자원관리원의 시스템 통합 프로젝트에서 SAP 기반 프로세스 분석, 데이터 전환, 운영 안정화 업무를 담당합니다.
              FI/CO 또는 BASIS 경험이 있다면 빠르게 투입될 수 있으며, 프로젝트 문서화와 이해관계자 커뮤니케이션 역량을 중요하게 봅니다.
            </p>
          </article>
        </section>

        <aside className="apply-panel">
          <strong>내 이력서로 바로 지원</strong>
          <p>대표 이력서와 SAP 스킬 매칭 점수를 확인한 뒤 지원할 수 있습니다.</p>
          <div className="match-score">
            <span>AI 매칭</span>
            <strong>88%</strong>
          </div>
          <button type="button" className="primary-action" onClick={() => navigate(ROUTES.JOB_APPLY)}>
            지원하기
          </button>
          <button type="button" className="secondary" onClick={() => navigate(ROUTES.JOB_BOOKMARKS)}>
            스크랩하기
          </button>
        </aside>
      </div>
    </main>
  );
}
