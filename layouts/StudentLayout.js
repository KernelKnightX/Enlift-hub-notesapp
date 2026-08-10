import { useRouter } from 'next/router';
import StudentShell from '@/components/common/StudentLayout';

export default function StudentLayout({ children, title, subtitle }) {
  const router = useRouter();
  return <StudentShell title={title} subtitle={subtitle}>{children}</StudentShell>;
}
