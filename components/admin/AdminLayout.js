import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { ExternalLink, Home, LogOut, Shield } from 'lucide-react';
import { adminNavigation, adminNavigationGroups } from '@/config/adminNavigation';

function isActivePath(href, currentPath) {
  if (href === '/admin') return currentPath === '/admin' || currentPath === '/admin/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default function AdminLayout({
  title,
  subtitle,
  backHref,
  children,
  actions,
  ...rest
}) {
  const router = useRouter();
  const { logout } = useAuth();
  const isAdminRoot = router.pathname === '/admin';
  const currentPath = router.asPath.split('?')[0];
  const homeHref = backHref || rest.backHref || '/admin';

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const navItems = adminNavigation.map((item) => ({
    ...item,
    Icon: item.icon,
    active: isActivePath(item.href, currentPath),
  }));

  return (
    <div className="min-h-screen bg-[#eef2f7] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden lg:flex sticky top-0 h-screen flex-col overflow-y-auto" style={{ background: '#0f172a', color: '#e2e8f0', padding: '1.25rem 0.85rem' }}>
        <div className="px-3 pb-5">
          <div className="text-[11px] font-semibold tracking-[0.22em] text-slate-400">NOTES CAFE</div>
          <div className="mt-1 text-sm font-semibold text-white">Admin office</div>
        </div>
        <nav className="flex flex-1 flex-col gap-4">
          {adminNavigationGroups.map((group) => (
            <div key={group.heading}>
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.heading}</div>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(item.href, currentPath);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                      style={{
                        background: active ? 'rgba(37,99,235,0.35)' : 'transparent',
                        color: active ? '#fff' : '#cbd5e1',
                      }}
                    >
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-6 space-y-1 border-t border-white/10 pt-4">
          <Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white">
            <ExternalLink size={15} /> Public site
          </Link>
          <Link href="/student-desk/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white">
            <ExternalLink size={15} /> Student desk
          </Link>
        </div>
      </aside>
      <div>
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)', color: '#f8fafc', padding: '2.5rem 0 1.5rem' }}>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-100 ring-1 ring-white/10 backdrop-blur">
                <Shield size={14} /> CEO CONTROL ROOM
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
                <Link href={homeHref} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15">
                  <Home size={14} /> Back to office
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

      <nav className="lg:hidden overflow-x-auto bg-[#0f172a] px-3 py-2">
        <div className="flex min-w-max gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium"
              style={{
                background: item.active ? 'rgba(37,99,235,0.45)' : 'transparent',
                color: item.active ? '#fff' : '#94a3b8',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {children}
      </main>
      </div>
    </div>
  );
}
