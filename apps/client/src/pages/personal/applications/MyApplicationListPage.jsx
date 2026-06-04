import PersonalMemberHeader from '../../../componenjs/layout/PersonalMemberHeader.jsx';

export default function MyApplicationListPage() {
  return (
    <main className="member-page">
      <PersonalMemberHeader active="applications" />
      <div className="member-placeholder-shell">
        <section className="page-panel">
          <p className="eyebrow">SAPPhire</p>
          <h1>지원 내역</h1>
          <p>백엔드 엔드포인트가 추가되면 이 화면에서 해당 API 모듈을 연결하면 됩니다.</p>
        </section>
      </div>
    </main>
  );
}
