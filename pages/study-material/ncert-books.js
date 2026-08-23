import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import BookPreviewModal from "@/components/notes/BookPreviewModal";
import { db } from "@/firebase/config";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import ResourceHero from "@/components/public/ResourceHero";

/* ================================================================
   BOOK CARD
   ================================================================ */

function BookCard({ book, cls }) {
  const [open, setOpen] = useState(false);
  const hasPdf = Boolean(book.pdfUrl);

  const handleOpen = () => {
    if (hasPdf) setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <>
      <article className="ncert-book-card">
        <div className="ncert-book-cover">
          <img src={book.img} alt={`${book.title} cover`} loading="lazy" />
        </div>

        <div className="ncert-book-content">
          <span className="ncert-book-subject">{book.subject}</span>
          <h3 className="ncert-book-title">{book.title}</h3>
          <p className="ncert-book-description">{book.desc}</p>

          <div className="ncert-book-meta">
            <span className="ncert-book-class">Class {cls}</span>
            <span className="ncert-book-meta-sep">·</span>
            <span className="ncert-book-source">Source: NCERT</span>
          </div>

          <button
            type="button"
            className={`ncert-download-button ${hasPdf ? "" : "disabled"}`}
            onClick={handleOpen}
            disabled={!hasPdf}
            aria-disabled={!hasPdf}
            title={hasPdf ? "Open PDF preview" : "Preview not available"}
          >
            {hasPdf ? "Download" : "Unavailable"}
          </button>
        </div>
      </article>

      {hasPdf && (
        <BookPreviewModal
          isOpen={open}
          onClose={handleClose}
          pdfUrl={book.pdfUrl}
          title={book.title}
        />
      )}
    </>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function NcertUpscPage() {
  const [classGroups, setClassGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "ncertBooks"), orderBy("class"), orderBy("order"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const books = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        const map = new Map();
        for (const book of books) {
          if (!map.has(book.class)) map.set(book.class, []);
          map.get(book.class).push(book);
        }

        const groups = Array.from(map.entries())
          .sort(([a], [b]) => a - b)
          .map(([cls, classBooks]) => ({
            cls,
            highPriority: classBooks.some((b) => b.priority === "Essential"),
            books: classBooks.sort((a, b) => (a.order || 0) - (b.order || 0)),
          }));

        setClassGroups(groups);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Couldn't load the book library.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return (
    <>
      <Head>
        <title>NCERT Books for UPSC | Notes Cafe</title>
        <meta
          name="description"
          content="Explore NCERT books recommended for UPSC preparation, with class-wise and subject-wise resources for building a strong foundation."
        />
        <meta
          name="keywords"
          content="NCERT books for UPSC, UPSC NCERT books, NCERT books PDF for UPSC, NCERT class 6 to 12 UPSC"
        />
      </Head>

      <div className="ncert-page">
        <ResourceHero
          title="NCERT Books for UPSC"
          description="Know what to read. Know what to skip. Build your UPSC foundation with the right NCERT books."
          eyebrow="Study Material · Foundation"
          withSeo={false}
        />

        <main className="ncert-container ncert-main">
          <section className="ncert-content-section">
            <div className="ncert-content-heading">
              <span className="ncert-section-label">NCERT FOR UPSC</span>
              <h2>Why are NCERT books important for UPSC?</h2>
            </div>
            <p>
              NCERT books help build the basic concepts required for
              subjects such as History, Geography, Polity, Economy and
              Science. They are especially useful for aspirants who are
              starting UPSC preparation or want to strengthen their
              fundamentals.
            </p>
            <p>
              You do not need to read every NCERT book from Class 6 to 12
              with the same level of detail. A better approach is to select
              books according to the UPSC syllabus and your preparation
              stage.
            </p>
          </section>

          <section className="ncert-quick-guide">
            <div>
              <span className="ncert-section-label">QUICK GUIDE</span>
              <h2>Which NCERT books should a UPSC aspirant read?</h2>
            </div>

            <div className="ncert-quick-grid">
              <div><strong>History</strong><span>Build chronology and historical context.</span></div>
              <div><strong>Geography</strong><span>Understand physical and Indian geography.</span></div>
              <div><strong>Polity</strong><span>Learn democracy, institutions and political concepts.</span></div>
              <div><strong>Economy</strong><span>Build basic economic understanding.</span></div>
              <div><strong>Science</strong><span>Strengthen school-level science fundamentals.</span></div>
              <div><strong>Society & Culture</strong><span>Support basic understanding of Indian society and culture.</span></div>
            </div>
          </section>

          <section className="ncert-library-section">
            <div className="ncert-content-heading">
              <span className="ncert-section-label">CLASS-WISE LIBRARY</span>
              <h2>NCERT Books for UPSC by Class</h2>
              <p>
                Browse the available NCERT books class by class and use
                the PDF preview where a source is available.
              </p>
            </div>
          </section>

          {loading && (
            <div className="ncert-loading-state">Loading the book library…</div>
          )}

          {error && (
            <div className="ncert-error-state">{error}</div>
          )}

          {!loading && !error && classGroups.length === 0 && (
            <div className="ncert-empty-state">
              No books have been added yet. Check back soon.
            </div>
          )}

          {classGroups.map((group) => (
            <section className="ncert-class-section" key={group.cls}>
              <div className="ncert-class-header">
                <div className="ncert-class-title-wrap">
                  <h2>Class {group.cls}</h2>
                  {group.highPriority && (
                    <span className="ncert-priority-badge">
                      <span className="ncert-priority-dot" />
                      High Priority
                    </span>
                  )}
                </div>
              </div>

              <div className="ncert-book-grid">
                {group.books.map((book) => (
                  <BookCard key={book.id} book={book} cls={group.cls} />
                ))}
              </div>
            </section>
          ))}

          <section className="ncert-guide">
            <div className="ncert-guide-main">
              <span className="ncert-guide-eyebrow">NOT SURE WHERE TO START?</span>
              <h2>Build your NCERT foundation strategically.</h2>
              <p>
                NCERT preparation is not about reading every page blindly.
                Start with the subjects that strengthen your UPSC
                fundamentals and connect them with the syllabus and
                previous year questions.
              </p>
              <Link href="/study-material/upsc-syllabus" className="ncert-guide-link">
                Check the UPSC syllabus <span aria-hidden="true">→</span>
              </Link>
            </div>

            <div className="ncert-guide-links">
              <Link href="/study-material/upsc-syllabus">
                <span>
                  <strong>Why NCERT for UPSC?</strong>
                  <small>Understand how foundation books support UPSC preparation.</small>
                </span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link href="/study-material/standard-books">
                <span>
                  <strong>NCERT to standard books</strong>
                  <small>Know when to move beyond foundational textbooks.</small>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>

          <section className="ncert-note-section">
            <span className="ncert-section-label">IMPORTANT</span>
            <h2>NCERT books are a foundation, not the complete UPSC syllabus.</h2>
            <p>
              Use NCERTs to understand concepts first. Your complete UPSC
              preparation should also include the official syllabus,
              previous year questions, standard reference books,
              current affairs, revision and answer practice.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}