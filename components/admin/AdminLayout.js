import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { Home, LogOut, Shield } from 'lucide-react';

export default function AdminLayout({ title, subtitle, backHref = '/admin', children, actions }) {
  const router = useRouter();
  const { logout } = useAuth();
  const isAdminRoot = router.pathname === '/admin';

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f7' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)', color: '#f8fafc', padding: '3rem 0 1.75rem' }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-100 ring-1 ring-white/10 backdrop-blur">
                <Shield size={14} /> ADMIN CONTROL
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                  {subtitle}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {!isAdminRoot && (
                <Link href={backHref} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
                  <Home size={14} /> Back to admin
                </Link>
              )}
              <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </div>

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {children}
      </main>
    </div>
  );
}
