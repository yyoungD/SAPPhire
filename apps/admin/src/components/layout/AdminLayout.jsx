import AdminHeader from './AdminHeader.jsx';
import AdminSidebar from './AdminSidebar.jsx';

export default function AdminLayout({ user, onLogout, currentPath, children }) {
  return (
    <div className="min-h-screen bg-[#f8f9ff] font-sans text-[#0b1c30]">
      <AdminSidebar user={user} onLogout={onLogout} currentPath={currentPath} />

      <div className="lg:pl-[260px]">
        <AdminHeader user={user} />

        <main className="mx-auto max-w-[1560px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
