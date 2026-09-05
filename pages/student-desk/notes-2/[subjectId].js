import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Legacy route — redirects to main Study Notes subject page */
export default function Notes2SubjectRedirect() {
  const router = useRouter();
  const { subjectId } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    if (subjectId) {
      router.replace(`/student-desk/notes/${encodeURIComponent(String(subjectId))}`);
    } else {
      router.replace('/student-desk/notes');
    }
  }, [router, router.isReady, subjectId]);

  return null;
}
