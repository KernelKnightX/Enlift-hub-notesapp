import AdminShell from '@/components/admin/AdminLayout';

export default function AdminLayout({ title, subtitle, backHref, children, actions, ...rest }) {
  const homeHref = backHref || rest.backHref || '/admin';
  return (
    <AdminShell title={title} subtitle={subtitle} backHref={homeHref} actions={actions}>
      {children}
    </AdminShell>
  );
}
