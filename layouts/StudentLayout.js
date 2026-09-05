import StudentShell from '@/components/common/StudentLayout';

export default function StudentLayout({ children, title, hideTopbar, plainHeader }) {
  return (
    <StudentShell title={title} hideTopbar={hideTopbar} plainHeader={plainHeader}>
      {children}
    </StudentShell>
  );
}
