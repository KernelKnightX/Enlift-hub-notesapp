import Head from 'next/head';
import { useRouter } from 'next/router';
import PublicNavbar from '@/components/public/layout/PublicNavbar';

export default function PublicLayout({ children, title, description }) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{title || 'Notes Cafe'}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Head>
      {router.pathname !== '/' ? <PublicNavbar /> : <PublicNavbar showOnLanding />}
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>{children}</div>
    </>
  );
}
