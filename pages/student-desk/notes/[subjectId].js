import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  collection, doc, getDoc, getDocs, onSnapshot, query, where,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/AuthContext';
import { trackPdfOpen } from '@/lib/officeAnalytics';
import SecurePdfViewer from '@/components/notes/SecurePdfViewer';
import SubjectNotesEditor from '@/components/notes/SubjectNotesEditor';
import {
  ArrowLeft, FileText, Loader2,
} from 'lucide-react';

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
  const [pdfs, setPdfs] = useState([]);
  const [activePdf, setActivePdf] = useState(null);
  const [loading, setLoading] = useState(true);

  const [noteId, setNoteId] = useState(null);
  const [remoteContent, setRemoteContent] = useState('');
  const [noteLoaded, setNoteLoaded] = useState(false);

  const trackedOpens = useRef(new Set());

  const name = s(subject?.name, 'Study Notes');

  useEffect(() => {
    if (!subjectId) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'pdfSubjects', String(subjectId)));
        if (!snap.exists()) {
          if (!cancelled) {
            setSubject({ id: subjectId, name: 'Study Notes' });
            setLoading(false);
          }
          return;
        }
        if (!cancelled) setSubject({ id: snap.id, ...snap.data() });

        const pdfsRef = collection(db, 'pdfs');
        let psnap;
        try {
          psnap = await getDocs(query(pdfsRef, where('subjectId', '==', String(subjectId))));
        } catch (err) {
          console.warn('[notes] subject pdf query failed, falling back to client filter:', err);
          psnap = await getDocs(pdfsRef);
        }

        const list = psnap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((pdf) => String(pdf.subjectId ?? pdf.subject_id ?? '') === String(subjectId))
          .sort((a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt));

        if (!cancelled) setPdfs(list);
      } catch (error) {
        console.warn('[notes] load failed:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [subjectId]);

  useEffect(() => {
    if (pdfs.length && !activePdf) setActivePdf(pdfs[0]);
  }, [pdfs, activePdf]);

  useEffect(() => {
    if (!user || !activePdf?.id) return;
    if (trackedOpens.current.has(activePdf.id)) return;
    trackedOpens.current.add(activePdf.id);
    trackPdfOpen(activePdf, { userName: user.fullName || user.name });
  }, [user, activePdf]);

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
        where('subjectId', '==', String(subjectId))
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
        }
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

  const activeTitle = s(activePdf?.title, s(activePdf?.name, 'Untitled PDF'));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }} data-testid="subject-notes">
      <div className="hairline-b sticky top-0 z-30" style={{ background: 'rgba(250,250,247,0.9)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3.5 flex items-center gap-3">
          <Link href="/student-desk/notes" className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
            <ArrowLeft size={14} /> All subjects
          </Link>
          <div className="ml-2">
            <div className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>SUBJECT</div>
            <div className="font-sans text-[16px]" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{name}</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-4">
        <aside className="col-span-12 lg:col-span-2 order-2 lg:order-1">
          <div className="card p-3 h-full">
            <div className="eyebrow mb-2 px-1">PDFs · {pdfs.length}</div>
            {pdfs.length === 0 && (
              <div className="p-3 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                No PDFs yet for this subject.
                <br /><br />
                Add PDFs from Admin → Notes → {name}.
              </div>
            )}
            <div className="flex flex-col gap-1">
              {pdfs.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePdf(p)}
                  className="text-left p-2.5 rounded-lg flex items-start gap-2"
                  data-testid={`pdf-${p.id}`}
                  style={{
                    background: activePdf?.id === p.id ? 'var(--color-primary-tint)' : 'transparent',
                    border: '1px solid ' + (activePdf?.id === p.id ? 'rgba(79,70,229,0.25)' : 'transparent'),
                  }}
                >
                  <FileText
                    size={14}
                    strokeWidth={1.6}
                    style={{
                      color: activePdf?.id === p.id ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className="text-[12.5px] leading-tight clamp-2"
                      style={{
                        color: activePdf?.id === p.id ? 'var(--color-primary)' : 'var(--color-ink)',
                        fontWeight: activePdf?.id === p.id ? 600 : 500,
                      }}
                    >
                      {s(p.title, s(p.name, 'Untitled PDF'))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="col-span-12 lg:col-span-6 order-1 lg:order-2">
          <div className="card overflow-hidden p-0">
            {activePdf ? (
              <SecurePdfViewer pdf={activePdf} title={activeTitle} />
            ) : (
              <EmptyPdf name={name} />
            )}
          </div>
        </section>

        <section className="col-span-12 lg:col-span-4 order-3">
          <SubjectNotesEditor
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

function EmptyPdf({ name }) {
  return (
    <div className="notes-pdf-empty" style={{ minHeight: '52vh' }}>
      <FileText size={28} strokeWidth={1.5} />
      <p><strong>No PDF selected</strong></p>
      <p>Pick a PDF from the left panel, or upload to <b>{name}</b> in Admin → Notes.</p>
    </div>
  );
}
