import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bold,
  BookOpen,
  Clock3,
  Heading,
  Highlighter,
  Italic,
  List,
  ListOrdered,
  RotateCcw,
  Sparkles,
  Underline,
} from 'lucide-react';
import { listNoteVersions, saveSubjectNote } from '@/lib/studentNotes';

const AUTOSAVE_MS = 1400;

function defaultNoteTemplate(subject) {
  return `<h2 style="font-family:var(--font-sans);font-weight:700;letter-spacing:-0.02em;font-size:22px;margin:0 0 8px 0;">Notes · ${subject}</h2>
<p style="color:var(--color-ink-muted);margin:0 0 20px 0;font-size:13px;">Start typing — your notes save automatically.</p>
<ul>
  <li>Key point 1</li>
  <li>Key point 2</li>
</ul>`;
}

function formatVersionTime(value) {
  if (!value) return 'Earlier';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function countWords(html) {
  const text = String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').filter(Boolean).length : 0;
}

export default function SubjectNotesEditor({
  user,
  subjectId,
  subjectName,
  noteId: initialNoteId,
  remoteContent,
  remoteLoaded,
  className = '',
}) {
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const lastSavedHtmlRef = useRef('');
  const isDirtyRef = useRef(false);
  const isFocusedRef = useRef(false);

  const [noteId, setNoteId] = useState(initialNoteId);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved | saving | unsaved | error
  const [wordCount, setWordCount] = useState(0);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    setNoteId(initialNoteId);
  }, [initialNoteId]);

  // Hydrate editor from Firestore only when idle (prevents cursor jumps).
  useEffect(() => {
    if (!editorRef.current || !remoteLoaded) return;
    if (isDirtyRef.current || isFocusedRef.current) return;

    const html = remoteContent || defaultNoteTemplate(subjectName);
    if (editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
    lastSavedHtmlRef.current = html;
    setWordCount(countWords(html));
    setEditorReady(true);
    setSaveStatus('saved');
  }, [remoteContent, remoteLoaded, subjectName]);

  const persist = useCallback(async () => {
    if (!user || !editorRef.current) return;

    const html = editorRef.current.innerHTML;
    const previous = lastSavedHtmlRef.current;
    if (html === previous) {
      isDirtyRef.current = false;
      setSaveStatus('saved');
      return;
    }

    setSaveStatus('saving');
    try {
      const isNew = !noteId;
      const result = await saveSubjectNote({
        userId: user.uid,
        subjectId,
        subjectName,
        noteId,
        content: html,
        previousContent: previous,
        isNewNote: isNew,
      });
      if (result.noteId) setNoteId(result.noteId);
      lastSavedHtmlRef.current = html;
      isDirtyRef.current = false;
      setSaveStatus('saved');
      if (result.noteId) {
        const list = await listNoteVersions(result.noteId);
        setVersions(list);
      }
    } catch (error) {
      console.warn('[notes] autosave failed:', error);
      setSaveStatus('error');
    }
  }, [user, subjectId, subjectName, noteId]);

  const scheduleSave = useCallback(() => {
    if (!user) return;
    isDirtyRef.current = true;
    setSaveStatus('unsaved');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persist();
    }, AUTOSAVE_MS);
  }, [user, persist]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!noteId) return;
    listNoteVersions(noteId).then(setVersions).catch(() => {});
  }, [noteId]);

  useEffect(() => {
    const onBeforeUnload = (e) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    setWordCount(countWords(html));
    scheduleSave();
  };

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const restoreVersion = (content) => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = content;
    setWordCount(countWords(content));
    setShowVersions(false);
    scheduleSave();
  };

  const statusLabel =
    saveStatus === 'saving'
      ? 'Saving…'
      : saveStatus === 'unsaved'
        ? 'Unsaved'
        : saveStatus === 'error'
          ? 'Not saved yet'
          : 'Saved';

  return (
    <div className={`notes-editor card overflow-hidden ${className}`.trim()} data-testid="notes-editor-panel">
      <div className="notes-editor__head">
        <div className="notes-editor__head-left">
          <BookOpen size={14} />
          <span>Your notes</span>
          <span className={`notes-editor__status notes-editor__status--${saveStatus}`}>
            <span className="notes-editor__status-dot" />
            {statusLabel}
          </span>
        </div>
        <div className="notes-editor__tools">
          <ToolbarBtn title="Heading" onClick={() => exec('formatBlock', 'h2')}><Heading size={14} /></ToolbarBtn>
          <ToolbarBtn title="Bold" onClick={() => exec('bold')}><Bold size={14} /></ToolbarBtn>
          <ToolbarBtn title="Italic" onClick={() => exec('italic')}><Italic size={14} /></ToolbarBtn>
          <ToolbarBtn title="Underline" onClick={() => exec('underline')}><Underline size={14} /></ToolbarBtn>
          <ToolbarBtn title="Bullet list" onClick={() => exec('insertUnorderedList')}><List size={14} /></ToolbarBtn>
          <ToolbarBtn title="Numbered list" onClick={() => exec('insertOrderedList')}><ListOrdered size={14} /></ToolbarBtn>
          <ToolbarBtn title="Highlight" onClick={() => exec('hiliteColor', '#FEF3C7')}><Highlighter size={14} /></ToolbarBtn>
          {versions.length > 0 && (
            <ToolbarBtn title="Version history" onClick={() => setShowVersions((v) => !v)}>
              <Clock3 size={14} />
            </ToolbarBtn>
          )}
        </div>
      </div>

      {showVersions && versions.length > 0 && (
        <div className="notes-editor__versions">
          <div className="notes-editor__versions-title">Restore a previous version</div>
          <ul>
            {versions.map((v) => (
              <li key={v.id}>
                <button type="button" onClick={() => restoreVersion(v.content)}>
                  <RotateCcw size={12} />
                  {formatVersionTime(v.createdAt)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        ref={editorRef}
        className="notes-editor__body"
        contentEditable={!!user}
        suppressContentEditableWarning
        data-testid="note-editor"
        data-placeholder="Start typing your notes…"
        onInput={handleInput}
        onFocus={() => { isFocusedRef.current = true; }}
        onBlur={() => {
          isFocusedRef.current = false;
          if (isDirtyRef.current) persist();
        }}
      />

      <div className="notes-editor__foot">
        <span>{wordCount} words</span>
        {!user && (
          <span className="notes-editor__signin">
            <Sparkles size={12} />
            Sign in to save your notes
          </span>
        )}
      </div>

      {!editorReady && remoteLoaded && (
        <div className="notes-editor__loading">One moment…</div>
      )}
    </div>
  );
}

function ToolbarBtn({ children, onClick, title }) {
  return (
    <button type="button" className="notes-editor__tool" onClick={onClick} title={title}>
      {children}
    </button>
  );
}
