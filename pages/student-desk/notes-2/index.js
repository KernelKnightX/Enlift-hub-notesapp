import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Legacy route — Study Notes now lives at /student-desk/notes */
export default function Notes2Redirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/student-desk/notes');
  }, [router]);
  return null;
}
