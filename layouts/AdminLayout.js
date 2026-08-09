import AdminShell from '@/components/admin/AdminLayout';

export default function AdminLayout({ title, subtitle, backHref = '/admin', children, actions }) {
  return (
    <AdminShell title={title} subtitle={subtitle} backHref={backHref} actions={actions}>
      {children}
    </AdminShell>
  );
}
