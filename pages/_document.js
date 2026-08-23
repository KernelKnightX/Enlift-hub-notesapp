import { Html, Head, Main, NextScript } from 'next/document';
import { SITE_NAME } from '@/lib/seo';

export default function Document() {
  return (
    <Html lang="en-IN" data-scroll-behavior="smooth">
      <Head>
        <meta charSet="utf-8" />
        <meta name="author" content={SITE_NAME} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/enlift-hub-logo.jpeg" />
        <meta name="theme-color" content="#FDFCF7" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
