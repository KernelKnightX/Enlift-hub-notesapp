import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="not-found-page">
      <div className="not-found-page__inner">
        <p className="not-found-page__code">404</p>
        <h1 className="not-found-page__title">Page not found</h1>
        <p className="not-found-page__text">
          This page does not exist or has been moved. Continue with your UPSC prep from the public library.
        </p>
        <div className="not-found-page__actions">
          <Link href="/" className="btn btn-primary">
            Go home
          </Link>
          <Link href="/study-material" className="btn btn-ghost">
            Study material
          </Link>
        </div>
      </div>
    </div>
  );
}
