import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, serverTimestamp, where
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ArrowLeft, FileText, Plus, Save, Trash2, Download, ExternalLink, Loader2,
  Bold, Italic, List, Heading, Highlighter, ChevronRight, BookOpen, Sparkles
} from 'lucide-react';

const s = (v, f = '') => (typeof v === 'string' || typeof v === 'number' ? v : f);

export default function SubjectNotesPage() {
  const router = useRouter();
  const { subjectId } = router.query;
  const { user } = useAuth();

  const [subject, setSubject] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [activePdf, setActivePdf] = useState(null);
  const [loading, setLoading] = useState(true);

  // Personal note tied to user + subject
  const [note, setNote] = useState('');
  const [noteId, setNoteId] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  // Load subject + PDFs
  useEffect(() => {
    if (!subjectId) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'pdfSubjects', String(subjectId)));
        if (!snap.exists()) { if (!cancelled) { setSubject({ id: subjectId, name: 'Study Notes' }); setLoading(false); } return; }
        if (!cancelled) setSubject({ id: snap.id, ...snap.data() });

        // PDFs may live in a subcollection or nested field
        try {
          const pq = query(collection(db, 'pdfSubjects', String(subjectId), 'notes'), orderBy('createdAt', 'desc'));
          const psnap = await getDocs(pq);
          const list = psnap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (!cancelled) setPdfs(list);
        } catch {
          // fallback: field
          const data = snap.data();
          if (Array.isArray(data.pdfs)) setPdfs(data.pdfs.map((p, i) => ({ id: 'p' + i, ...p })));
        }
      } catch {
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [subjectId]);

  useEffect(() => { if (pdfs.length && !activePdf) setActivePdf(pdfs[0]); }, [pdfs, activePdf]);

  // Load personal note for this subject
  useEffect(() => {
    if (!user || !subjectId) return;
    let unsub = () => {};
    try {
      const qref = query(
        collection(db, 'userNotes'),
        where('userId', '==', user.uid),
        where('subjectId', '==', String(subjectId))
      );
      unsub = onSnapshot(qref, (snap) => {
        if (!snap.empty) {
          const d = snap.docs[0];
          setNoteId(d.id);
          setNote(d.data().content || '');
        }
      }, () => {});
    } catch {}
    return () => unsub();
  }, [user, subjectId]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const html = editorRef.current ? editorRef.current.innerHTML : note;
      if (noteId) {
        await updateDoc(doc(db, 'userNotes', noteId), { content: html, updatedAt: serverTimestamp() });
      } else {
        const ref = await addDoc(collection(db, 'userNotes'), {
          userId: user.uid, subjectId: String(subjectId),
          subjectName: s(subject?.name, 'Subject'),
          content: html, createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        });
        setNoteId(ref.id);
      }
      setSavedAt(new Date());
    } catch (e) {
      if (typeof console !== 'undefined') console.warn('[notes] save failed:', e.message);
    } finally {
      setSaving(false);
    }
  };

  const fmt = (cmd) => {
    if (typeof document !== 'undefined') document.execCommand(cmd, false);
    editorRef.current?.focus();
  };
  const wrap = (tag) => {
    if (typeof document !== 'undefined') document.execCommand('formatBlock', false, tag);
    editorRef.current?.focus();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
        <Loader2 className="animate-spin" size={26} style={{ color: 'var(--color-primary)' }} />
      </div>
    );
  }

  const name = s(subject?.name, 'Study Notes');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }} data-testid="subject-notes">
      {/* Header */}
      <div className="hairline-b sticky top-0 z-30" style={{ background: 'rgba(250,250,247,0.9)', backdropFilter: 'blur(14px)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3.5 flex items-center gap-3">
          <Link href="/student-desk/notes" className="flex items-center gap-1.5 text-[13px]" style={{ color: 'var(--color-ink-muted)' }}>
            <ArrowLeft size={14} /> All subjects
          </Link>
          <div className="ml-2">
            <div className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>SUBJECT</div>
            <div className="font-sans text-[16px]" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{name}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {savedAt && <span className="text-[11.5px] font-mono" style={{ color: 'var(--color-ink-faint)' }}>Saved · {savedAt.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}</span>}
            <button onClick={save} disabled={saving || !user}
                    className="btn btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: 13 }}
                    data-testid="save-note">
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : <><Save size={13} /> Save note</>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-6 grid grid-cols-12 gap-4">
        {/* Left: PDF list */}
        <aside className="col-span-12 lg:col-span-2 order-2 lg:order-1">
          <div className="card p-3 h-full">
            <div className="eyebrow mb-2 px-1">PDFs · {pdfs.length}</div>
            {pdfs.length === 0 && (
              <div className="p-3 text-[12.5px]" style={{ color: 'var(--color-ink-muted)' }}>
                No PDFs yet for this subject. <br /><br />
                Add PDFs from Admin → Notes → {name}.
              </div>
            )}
            <div className="flex flex-col gap-1">
              {pdfs.map((p) => (
                <button key={p.id} onClick={() => setActivePdf(p)}
                        className="text-left p-2.5 rounded-lg flex items-start gap-2"
                        data-testid={`pdf-${p.id}`}
                        style={{
                          background: activePdf?.id === p.id ? 'var(--color-primary-tint)' : 'transparent',
                          border: '1px solid ' + (activePdf?.id === p.id ? 'rgba(79,70,229,0.25)' : 'transparent'),
                        }}>
                  <FileText size={14} strokeWidth={1.6} style={{ color: activePdf?.id === p.id ? 'var(--color-primary)' : 'var(--color-ink-muted)', marginTop: 1, flexShrink: 0 }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] leading-tight clamp-2" style={{
                      color: activePdf?.id === p.id ? 'var(--color-primary)' : 'var(--color-ink)',
                      fontWeight: activePdf?.id === p.id ? 600 : 500
                    }}>{s(p.title, s(p.name, 'Untitled PDF'))}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Middle: PDF Viewer */}
        <section className="col-span-12 lg:col-span-6 order-1 lg:order-2">
          <div className="card overflow-hidden" style={{ minHeight: '78vh' }}>
            {activePdf?.url || activePdf?.pdfUrl ? (
              <div style={{ height: '78vh', display: 'flex', flexDirection: 'column' }}>
                <div className="px-5 py-3 hairline-b flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10.5px] font-mono" style={{ color: 'var(--color-ink-faint)', letterSpacing: '0.14em' }}>NOW READING</div>
                    <div className="font-sans text-[14px] truncate" style={{ fontWeight: 700 }}>{s(activePdf.title, s(activePdf.name, 'Untitled PDF'))}</div>
                  </div>
                  <a href={activePdf.url || activePdf.pdfUrl} target="_blank" rel="noreferrer"
                     className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem', fontSize: 12 }}
                     data-testid="pdf-open-external">
                    <ExternalLink size={12} /> Open
                  </a>
                </div>
                <iframe
                  key={activePdf.id}
                  src={activePdf.url || activePdf.pdfUrl}
                  data-testid="pdf-frame"
                  style={{ flex: 1, width: '100%', border: 'none', background: 'var(--color-surface-alt)' }}
                  title={s(activePdf.title, 'PDF')}
                />
              </div>
            ) : (
              <EmptyPdf name={name} />
            )}
          </div>
        </section>

        {/* Right: Editor */}
        <section className="col-span-12 lg:col-span-4 order-3">
          <div className="card p-0 overflow-hidden" style={{ minHeight: '78vh', display: 'flex', flexDirection: 'column' }}>
            <div className="px-5 py-3 hairline-b flex items-center gap-2">
              <BookOpen size={13} style={{ color: 'var(--color-primary)' }} />
              <span className="eyebrow">Your notes</span>
              <div className="ml-auto flex items-center gap-1">
                <IconBtn onClick={() => wrap('h2')} title="Heading"><Heading size={14} /></IconBtn>
                <IconBtn onClick={() => fmt('bold')} title="Bold"><Bold size={14} /></IconBtn>
                <IconBtn onClick={() => fmt('italic')} title="Italic"><Italic size={14} /></IconBtn>
                <IconBtn onClick={() => fmt('insertUnorderedList')} title="List"><List size={14} /></IconBtn>
                <IconBtn onClick={() => { if (typeof document !== 'undefined') document.execCommand('hiliteColor', false, '#FEF3C7'); }} title="Highlight"><Highlighter size={14} /></IconBtn>
              </div>
            </div>
            <div
              ref={editorRef}
              contentEditable={!!user}
              suppressContentEditableWarning
              onInput={(e) => setNote(e.currentTarget.innerHTML)}
              dangerouslySetInnerHTML={{ __html: note || defaultNoteTemplate(name) }}
              data-testid="note-editor"
              style={{
                flex: 1, padding: 20, outline: 'none',
                fontSize: 14.5, lineHeight: 1.7,
                color: 'var(--color-ink)',
                background: 'var(--color-surface)',
                overflowY: 'auto',
                minHeight: 300,
              }}
            />
            {!user && (
              <div className="px-5 py-3 hairline-t text-[12px]" style={{ color: 'var(--color-ink-muted)' }}>
                <Sparkles size={12} style={{ display:'inline', marginRight:6, color:'var(--color-primary)' }} />
                Sign in to save your notes to the cloud.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title} type="button"
            style={{
              width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--color-ink-muted)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-alt)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      {children}
    </button>
  );
}

function EmptyPdf({ name }) {
  return (
    <div style={{ height: '78vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="text-center max-w-[320px] px-6">
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--color-primary-tint)', color: 'var(--color-primary)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        }}>
          <FileText size={24} strokeWidth={1.5} />
        </div>
        <div className="font-sans text-[19px]" style={{ fontWeight: 700, letterSpacing: '-0.01em' }}>No PDF selected yet</div>
        <p className="mt-2 text-[13.5px]" style={{ color: 'var(--color-ink-muted)' }}>
          Pick a PDF from the left panel, or upload PDFs to <b>{name}</b> from your Admin dashboard → Notes.
        </p>
      </div>
    </div>
  );
}

function defaultNoteTemplate(subject) {
  return `<h2 style="font-family:var(--font-sans);font-weight:700;letter-spacing:-0.02em;font-size:22px;margin:0 0 8px 0;">Notes · ${subject}</h2>
<p style="color:var(--color-ink-muted);margin:0 0 20px 0;font-size:13px;">Start typing to take notes while you read. Autosaved when you click Save.</p>
<ul>
  <li>Key point 1</li>
  <li>Key point 2</li>
</ul>`;
}
