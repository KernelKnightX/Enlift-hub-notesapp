import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  collection, doc, getDoc, getDocs, onSnapshot, query, where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import SubjectNotesEditor from '@/components/notes/SubjectNotesEditor';
import ChapterViewer from '@/components/notes/ChapterViewer';
import { ArrowLeft, BookOpen, ChevronRight, FileText, Loader2 } from 'lucide-react';

const s = (v, f = '') => (typeof v === 'string' || typeof v === 'number' ? v : f);
const getTimestampMs = (value) => {
  if (!value) return 0;
  if (typeof value.toDate === 'function') return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  return 0;
};

export default function SubjectNotesPage() {
  const router = useRouter();
  const { subjectId } = router.query;
  const { user } = useAuth();

  const [subject, setSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [loading, setLoading] = useState(true);

  const [noteId, setNoteId] = useState(null);
  const [remoteContent, setRemoteContent] = useState('');
  const [noteLoaded, setNoteLoaded] = useState(false);

  const name = s(subject?.name, 'Study Notes');

  useEffect(() => {
    if (!subjectId) return;
    let cancelled = false;

    (async () => {
      try {
        const snap = await getDoc(doc(db, 'htmlNoteSubjects', String(subjectId)));
        if (!snap.exists()) {
          if (!cancelled) {
            setSubject({ id: subjectId, name: 'Study Notes' });
            setLoading(false);
          }
          return;
        }
        if (!cancelled) setSubject({ id: snap.id, ...snap.data() });

        const chaptersRef = collection(db, 'htmlChapters');
        let csnap;
        try {
          csnap = await getDocs(query(chaptersRef, where('subjectId', '==', String(subjectId))));
        } catch (err) {
          console.warn('[notes] chapter query failed, falling back:', err);
          csnap = await getDocs(chaptersRef);
        }

        const list = csnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((ch) => String(ch.subjectId ?? '') === String(subjectId))
          .sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));

        if (!cancelled) setChapters(list);
      } catch (error) {
        console.warn('[notes] load failed:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [subjectId]);

  useEffect(() => {
    if (!chapters.length) {
      setActiveChapter(null);
      return;
    }
    setActiveChapter((current) => {
      if (current && chapters.some((ch) => ch.id === current.id)) return current;
      return chapters[0];
    });
  }, [chapters]);

  useEffect(() => {
    if (!user || !subjectId) {
      setNoteLoaded(true);
      return;
    }

    setNoteLoaded(false);
    let unsub = () => {};
    try {
      const qref = query(
        collection(db, 'userNotes'),
        where('userId', '==', user.uid),
        where('subjectId', '==', String(subjectId)),
      );
      unsub = onSnapshot(
        qref,
        (snap) => {
          if (!snap.empty) {
            const d = snap.docs[0];
            setNoteId(d.id);
            setRemoteContent(d.data().content || '');
          } else {
            setNoteId(null);
            setRemoteContent('');
          }
          setNoteLoaded(true);
        },
        (error) => {
          console.warn('[notes] snapshot error:', error);
          setNoteLoaded(true);
        },
      );
    } catch (error) {
      console.warn('[notes] listener setup failed:', error);
      setNoteLoaded(true);
    }
    return () => unsub();
  }, [user, subjectId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <Loader2 className="animate-spin" size={26} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const activeTitle = s(activeChapter?.title, 'Untitled');

  return (
    <div className="notes-subject-page" data-testid="subject-notes">
      <header className="notes-subject-nav">
        <div className="notes-subject-nav__inner">
          <Link href="/student-desk/notes" className="notes-subject-nav__back" aria-label="Back to all subjects">
            <ArrowLeft size={16} strokeWidth={2} />
            <span className="notes-subject-nav__back-label">Study Notes</span>
          </Link>

          <div className="notes-subject-nav__center">
            <div className="notes-subject-nav__breadcrumb">
              <BookOpen size={13} strokeWidth={1.75} />
              <span>Study Notes</span>
              <ChevronRight size={12} strokeWidth={2} />
              <span className="notes-subject-nav__subject">{name}</span>
            </div>
          </div>

          {activeChapter && (
            <div className="notes-subject-nav__chapter" title={activeTitle}>
              {activeTitle}
            </div>
          )}
        </div>
      </header>

      <div className="notes-subject-workspace max-w-[1440px] mx-auto px-4 md:px-6 py-5 grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-2 order-2 lg:order-1">
          <div className="card notes-subject-chapters p-3">
            <div className="eyebrow mb-2 px-1">Chapters · {chapters.length}</div>
            {chapters.length === 0 && (
              <div className="p-3 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                Chapters for this subject will appear here soon.
              </div>
            )}
            <div className="flex flex-col gap-1">
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setActiveChapter(ch)}
                  className="text-left p-2.5 rounded-lg flex items-start gap-2"
                  data-testid={`note-${ch.id}`}
                  style={{
                    background: activeChapter?.id === ch.id ? 'var(--color-primary-tint)' : 'transparent',
                    border: `1px solid ${activeChapter?.id === ch.id ? 'rgba(79,70,229,0.25)' : 'transparent'}`,
                  }}
                >
                  <FileText
                    size={14}
                    strokeWidth={1.6}
                    style={{
                      color: activeChapter?.id === ch.id ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[12.5px] leading-tight clamp-2"
                      style={{
                        color: activeChapter?.id === ch.id ? 'var(--color-primary)' : 'var(--color-ink)',
                        fontWeight: activeChapter?.id === ch.id ? 600 : 500,
                      }}
                    >
                      {s(ch.title, 'Untitled')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-6 order-1 lg:order-2">
          <div className="card overflow-hidden p-0">
            {activeChapter ? (
              <ChapterViewer chapter={activeChapter} title={activeTitle} />
            ) : (
              <EmptyNotes />
            )}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 order-3">
          <SubjectNotesEditor
            className="notes-editor--tall"
            user={user}
            subjectId={String(subjectId)}
            subjectName={name}
            noteId={noteId}
            remoteContent={remoteContent}
            remoteLoaded={noteLoaded}
          />
        </section>
      </div>
    </div>
  );
}

function EmptyNotes() {
  return (
    <div className="notes-pdf-empty notes-pdf-empty--workspace">
      <FileText size={28} strokeWidth={1.5} />
      <p>Choose a chapter from the list to begin reading.</p>
    </div>
  );
}
