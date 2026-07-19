import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" data-scroll-behavior="smooth">
      <Head>
        {/* Primary Meta Tags */}
        <meta name="title" content="NotesCafe - Free UPSC Notes, Mock Tests & Current Affairs" />
        <meta name="description" content="Access free UPSC study materials including notes, current affairs, mock tests, PYQs, and more. Smart preparation for IAS, IPS, IRS exams." />
        <meta name="keywords" content="UPSC notes, UPSC preparation, free UPSC materials, current affairs, mock tests, PYQs, IAS preparation, IPS, IRS, IFS" />
        <meta name="author" content="NotesCafe" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="English" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://notescafe.in/" />
        <meta property="og:title" content="NotesCafe - Free UPSC Notes, Mock Tests & Current Affairs" />
        <meta property="og:description" content="Access free UPSC study materials including notes, current affairs, mock tests, PYQs, and more." />
        <meta property="og:image" content="https://notescafe.in/enlift-hub-logo.jpeg" />
        <meta property="og:site_name" content="NotesCafe" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://notescafe.in/" />
        <meta property="twitter:title" content="NotesCafe - Free UPSC Notes, Mock Tests & Current Affairs" />
        <meta property="twitter:description" content="Access free UPSC study materials including notes, current affairs, mock tests, PYQs, and more." />
        <meta property="twitter:image" content="https://notescafe.in/enlift-hub-logo.jpeg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/enlift-hub-logo.jpeg" />

        {/* Theme Color */}
        <meta name="theme-color" content="#0f172a" />

        {/* Canonical URL */}
        <link rel="canonical" href="https://notescafe.in/" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
