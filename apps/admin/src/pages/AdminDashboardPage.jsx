export default function AdminDashboardPage({ user, onLogout }) {
  return (
    <main className="admin-dashboard-page">
      <header className="admin-header">
        <div>
          <p className="eyebrow">SAPPhire Admin</p>
          <h1>관리자 대시보드</h1>
        </div>
        <button type="button" className="secondary-button" onClick={onLogout}>
          로그아웃
        </button>
      </header>
      <section className="dashboard-panel">
        <h2>{user?.name || '관리자'}</h2>
        <p>관리자 인증이 완료되었습니다.</p>
      </section>
    </main>
  );
}
