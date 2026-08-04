import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SyllabusRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/resources/syllabus');
  }, [router]);

  return null;
}
