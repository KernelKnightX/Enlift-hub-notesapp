import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../../firebase/config";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function NotesEditor({ pdfId, pdfTitle, userId }) {
  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState("saved"); // saved | saving | unsaved
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  /* Load note from Firestore */
  useEffect(() => {
    if (!pdfId || !userId) return;
    setLoaded(false);
    const noteRef = doc(db, "users", userId, "pdfNotes", pdfId);
    getDoc(noteRef).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (editorRef.current) editorRef.current.innerHTML = data.content || "";
        setTags(data.tags || []);
        updateWordCount(data.content || "");
      } else {
        if (editorRef.current) editorRef.current.innerHTML = "";
        setTags([]);
        setWordCount(0);
      }
      setLoaded(true);
      setSaveStatus("saved");
    }).catch(console.error);
  }, [pdfId, userId]);

  const updateWordCount = (html) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    setWordCount(text ? text.split(" ").filter(Boolean).length : 0);
  };

  /* Auto-save */
  const scheduleSave = useCallback((html, currentTags) => {
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const noteRef = doc(db, "users", userId, "pdfNotes", pdfId);
        await setDoc(noteRef, {
          content: html,
          tags: currentTags,
          pdfId,
          pdfTitle,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setSaveStatus("saved");
      } catch (e) {
        console.error("Save error:", e);
        setSaveStatus("unsaved");
      }
    }, 1200);
  }, [pdfId, pdfTitle, userId]);

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || "";
    updateWordCount(html);
    scheduleSave(html, tags);
  };

  const handleTagAdd = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      const next = [...tags, t];
      setTags(next);
      scheduleSave(editorRef.current?.innerHTML || "", next);
    }
    setTagInput("");
    setShowTagInput(false);
  };

  const handleTagRemove = (t) => {
    const next = tags.filter(x => x !== t);
    setTags(next);
    scheduleSave(editorRef.current?.innerHTML || "", next);
  };

  const handleClear = () => {
    if (!window.confirm("Clear all notes for this PDF?")) return;
    if (editorRef.current) editorRef.current.innerHTML = "";
    setWordCount(0);
    scheduleSave("", tags);
  };

  const insertBlock = (tag) => {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, tag);
  };

  const saveStatusLabel = saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving…" : "Unsaved";

  // Modern execCommand alternative using Selection API
  const execCommand = (command, value = null) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    
    // Use modern Selection API instead of deprecated execCommand where possible
    const validCommands = ['bold', 'italic', 'underline', 'strikeThrough', 'removeFormat'];
    if (validCommands.includes(command)) {
      document.execCommand(command, false, value);
    } else if (command === 'formatBlock') {
      document.execCommand('formatBlock', false, value);
    } else if (command === 'hiliteColor') {
      document.execCommand('hiliteColor', false, value);
    }
  };

  if (!pdfId) return (
    <div className="ns-notes-empty">
      <div className="ns-notes-empty-icon">✎</div>
      <div className="ns-notes-empty-title">No PDF Selected</div>
      <div className="ns-notes-empty-sub">Select a PDF to start taking notes</div>
    </div>
  );

  return (
    <>
      {/* Head */}
      <div className="ns-notes-head">
        <div className="ns-notes-head-top">
          <span className="ns-notes-head-title">✎ Notes</span>
          <span className={`ns-save-status ${saveStatus}`}>
            <span className="ns-save-dot" />
            {saveStatusLabel}
          </span>
        </div>
        {/* Tags */}
        <div className="ns-tags-row">
          {tags.map(t => (
            <span key={t} className="ns-tag active">
              {t}
              <span className="ns-tag-remove" onClick={() => handleTagRemove(t)}>✕</span>
            </span>
          ))}
          {showTagInput ? (
            <input
              autoFocus
              className="ns-tag-input"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleTagAdd(); if (e.key === "Escape") { setShowTagInput(false); setTagInput(""); } }}
              onBlur={handleTagAdd}
              placeholder="tag name…"
            />
          ) : (
            <button className="ns-tag-add" onClick={() => setShowTagInput(true)}>+ tag</button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="ns-toolbar">
        <span className="ns-toolbar-label">Format</span>
        <button className="ns-toolbar-btn" title="Bold" onClick={() => execCommand('bold')}>
          <b>B</b>
        </button>
        <button className="ns-toolbar-btn" title="Italic" onClick={() => execCommand('italic')}>
          <i>I</i>
        </button>
        <button className="ns-toolbar-btn" title="Underline" onClick={() => execCommand('underline')}>
          <u>U</u>
        </button>
        <button className="ns-toolbar-btn" title="Highlight" onClick={() => execCommand('hiliteColor', '#fef08a')}>
          ▐
        </button>
        <div className="ns-toolbar-sep" />
        <span className="ns-toolbar-label">Block</span>
        <button className="ns-toolbar-btn" title="Heading 1" onClick={() => insertBlock("h1")}>
          H1
        </button>
        <button className="ns-toolbar-btn" title="Heading 2" onClick={() => insertBlock("h2")}>
          H2
        </button>
        <button className="ns-toolbar-btn" title="Heading 3" onClick={() => insertBlock("h3")}>
          H3
        </button>
        <div className="ns-toolbar-sep" />
        <button className="ns-toolbar-btn" title="Bullet List" onClick={() => execCommand('insertUnorderedList')}>
          •
        </button>
        <button className="ns-toolbar-btn" title="Numbered List" onClick={() => execCommand('insertOrderedList')}>
          1.
        </button>
        <button className="ns-toolbar-btn" title="Quote" onClick={() => insertBlock("blockquote")}>
          "
        </button>
        <button className="ns-toolbar-btn" title="Code" onClick={() => execCommand('formatBlock', 'pre')}>
          {'</>'}
        </button>
      </div>

      {/* Editor */}
      <div className="ns-editor-wrap">
        <div
          ref={editorRef}
          className="ns-editor"
          contentEditable
          onInput={handleInput}
          data-placeholder="Start typing your notes here..."
          suppressContentEditableWarning
        />
      </div>

      {/* Footer */}
      <div className="ns-notes-foot">
        <span className="ns-word-count">{wordCount} words</span>
        <button className="ns-clear-btn" onClick={handleClear}>
          Clear All
        </button>
      </div>
    </>
  );
}
