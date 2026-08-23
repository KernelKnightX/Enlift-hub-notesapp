import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const SUBJECTS = [
  { id: "polity", label: "Polity", color: "#3b82f6" },
  { id: "economy", label: "Economy", color: "#10b981" },
  { id: "geography", label: "Geography", color: "#f59e0b" },
  { id: "history", label: "History", color: "#8b5cf6" },
  { id: "science", label: "Science & Tech", color: "#ef4444" },
  { id: "environment", label: "Environment", color: "#22c55e" },
  { id: "ethics", label: "Ethics", color: "#f97316" },
  { id: "essay", label: "Essay", color: "#0ea5e9" },
  { id: "revision", label: "Revision", color: "#c9a84c" },
  { id: "mock", label: "Mock Test", color: "#6b7280" },
  { id: "currentaff", label: "Current Affairs", color: "#dc2626" },
  { id: "answer", label: "Answer Writing", color: "#b45309" },
];

const PRIORITY = [
  { id: "high", label: "High", color: "#ef4444" },
  { id: "medium", label: "Medium", color: "#f59e0b" },
  { id: "low", label: "Low", color: "#10b981" },
];

const TASK_TYPES = [
  { id: "study", label: "Study", color: "#e0f2fe", text: "#0369a1" },
  { id: "answer", label: "Answer Writing", color: "#fef3c7", text: "#b45309" },
  { id: "revision", label: "Revision", color: "#dcfce7", text: "#15803d" },
  { id: "mock", label: "Mock Test", color: "#f3e8ff", text: "#7c3aed" },
  { id: "ca", label: "Current Affairs", color: "#ffedd5", text: "#c2410c" },
];

const EMPTY_FORM = { 
  title: "", subject: "polity", priority: "medium", 
  duration: "60", notes: "", dateKey: "", taskType: "study",
  resourceLink: "", resourceType: ""
};

export default function TaskModal({ 
  open, onClose, onSave, onDelete, editTask, defaultDateKey, 
  defaultTaskType = "study", userNotes = [], userPyqs = [] 
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showResourceModal, setShowResourceModal] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editTask
        ? { 
            title: editTask.title || "", 
            subject: editTask.subject || "polity", 
            priority: editTask.priority || "medium", 
            duration: String(editTask.duration || 60), 
            notes: editTask.notes || "", 
            dateKey: editTask.dateKey || "",
            taskType: editTask.taskType || "study",
            resourceLink: editTask.resourceLink || "",
            resourceType: editTask.resourceType || ""
          }
        : { ...EMPTY_FORM, dateKey: defaultDateKey, taskType: defaultTaskType }
      );
      setErrors({});
    }
  }, [open, editTask, defaultDateKey, defaultTaskType]);

  if (!open) return null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.title.trim()) {
      newErrors.title = "Task title is required";
    }
    
    if (!form.dateKey) {
      newErrors.dateKey = "Date is required";
    }
    
    if (!form.duration || form.duration < 15) {
      newErrors.duration = "Duration must be at least 15 minutes";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setSaving(true);
    try {
      await onSave({ 
        ...form, 
        duration: Number(form.duration) || 60,
        resourceLink: form.resourceLink || "",
        resourceType: form.resourceType || ""
      });
    } catch (e) {
      console.error("Save error:", e);
    }
    setSaving(false);
  };

  const getResourceLabel = () => {
    if (!form.resourceLink) return null;
    if (form.resourceType === 'note') {
      const note = userNotes.find((n) => n.id === form.resourceLink || n.subjectId === form.resourceLink);
      return note?.subjectName || note?.title || 'Study notes';
    }
    if (form.resourceType === 'pyq') {
      const pyq = userPyqs.find(p => p.id === form.resourceLink);
      return pyq?.title || 'PYQ';
    }
    return 'Resource';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.55)',
      backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', padding: 20
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'white', borderRadius: 16, width: '100%', maxWidth: 520,
        boxShadow: '0 12px 40px rgba(15,25,35,0.14)', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <div style={{
          padding: '20px 24px 16px', borderBottom: '1px solid #ede9e3',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', color: '#0f1923' }}>
            {editTask ? "Edit Task" : "Add Task"}
          </span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8, border: '1px solid #e2ddd6',
            background: 'transparent', cursor: 'pointer', fontSize: '1.1rem'
          }}>✕</button>
        </div>
        
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Task Type */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50', marginBottom: 5, textTransform: 'uppercase' }}>Task Type *</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TASK_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, taskType: type.id }))}
                  style={{
                    padding: '6px 12px', borderRadius: 6, border: form.taskType === type.id ? `2px solid ${type.text}` : '1px solid #e2ddd6',
                    background: form.taskType === type.id ? type.color : 'transparent',
                    color: form.taskType === type.id ? type.text : '#64748b',
                    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50', marginBottom: 5, textTransform: 'uppercase' }}>Task Title *</div>
            <input
              style={{ 
                width: '100%', padding: '10px 14px', border: errors.title ? '2px solid #ef4444' : '1px solid #e2ddd6', 
                borderRadius: 10, fontSize: '0.88rem', outline: 'none'
              }}
              placeholder={getPlaceholder(form.taskType)}
              value={form.title}
              onChange={(e) => {
                setForm(p => ({ ...p, title: e.target.value }));
                if (errors.title) setErrors(p => ({ ...p, title: null }));
              }}
            />
            {errors.title && <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>{errors.title}</div>}
          </div>

          {/* Subject & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50', marginBottom: 5, textTransform: 'uppercase' }}>Subject</div>
              <select
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2ddd6', borderRadius: 10, fontSize: '0.88rem', appearance: 'none', background: 'white' }}
                value={form.subject}
                onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
              >
                {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50', marginBottom: 5, textTransform: 'uppercase' }}>Priority</div>
              <select
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2ddd6', borderRadius: 10, fontSize: '0.88rem', appearance: 'none', background: 'white' }}
                value={form.priority}
                onChange={(e) => setForm(p => ({ ...p, priority: e.target.value }))}
              >
                {PRIORITY.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>

          {/* Duration & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50', marginBottom: 5, textTransform: 'uppercase' }}>Duration (min) *</div>
              <input
                type="number" min="15" max="480" step="15"
                style={{ 
                  width: '100%', padding: '10px 14px', border: errors.duration ? '2px solid #ef4444' : '1px solid #e2ddd6', 
                  borderRadius: 10, fontSize: '0.88rem', outline: 'none'
                }}
                value={form.duration}
                onChange={(e) => {
                  setForm(p => ({ ...p, duration: e.target.value }));
                  if (errors.duration) setErrors(p => ({ ...p, duration: null }));
                }}
              />
              {errors.duration && <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>{errors.duration}</div>}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50', marginBottom: 5, textTransform: 'uppercase' }}>Date *</div>
              <input
                type="date"
                style={{ 
                  width: '100%', padding: '10px 14px', border: errors.dateKey ? '2px solid #ef4444' : '1px solid #e2ddd6', 
                  borderRadius: 10, fontSize: '0.88rem', outline: 'none'
                }}
                value={form.dateKey}
                onChange={(e) => {
                  setForm(p => ({ ...p, dateKey: e.target.value }));
                  if (errors.dateKey) setErrors(p => ({ ...p, dateKey: null }));
                }}
              />
              {errors.dateKey && <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: 4 }}>{errors.dateKey}</div>}
            </div>
          </div>

          {/* Connect to Notes/PYQ */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50', marginBottom: 5, textTransform: 'uppercase' }}>
              Connect with Resources (Optional)
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #e2ddd6', borderRadius: 10, fontSize: '0.85rem', background: 'white' }}
                value={form.resourceType}
                onChange={(e) => setForm(p => ({ ...p, resourceType: e.target.value, resourceLink: "" }))}
              >
                <option value="">Select resource type...</option>
                <option value="note">My Notes</option>
                <option value="pyq">PYQ Paper</option>
              </select>
              {form.resourceType && (
                <button
                  type="button"
                  onClick={() => setShowResourceModal(true)}
                  style={{
                    padding: '10px 16px', borderRadius: 10, border: '1px solid #e2ddd6',
                    background: 'white', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b'
                  }}
                >
                  {form.resourceLink ? "Change" : "Select"}
                </button>
              )}
            </div>
            {form.resourceLink && (
              <div style={{ fontSize: '0.75rem', color: '#1a3f6b', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                📎 Connected to: <strong>{getResourceLabel()}</strong>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2c3e50', marginBottom: 5, textTransform: 'uppercase' }}>Notes</div>
            <textarea
              rows={2}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #e2ddd6', borderRadius: 10, fontSize: '0.88rem', resize: 'none' }}
              placeholder="Any additional notes…"
              value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ padding: '16px 24px 20px', borderTop: '1px solid #ede9e3', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          {editTask && (
            <button
              onClick={() => onDelete(editTask.id)}
              style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer', marginRight: 'auto' }}
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            style={{ padding: '9px 20px', borderRadius: 10, border: '1px solid #e2ddd6', background: 'transparent', color: '#64748b', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '9px 24px', borderRadius: 10, border: 'none', background: '#0f1923', color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : "Save Task"}
          </button>
        </div>
      </div>

      {/* Resource Selection Modal */}
      {showResourceModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15,25,35,0.7)', zIndex: 300,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setShowResourceModal(false)}>
          <div style={{
            background: 'white', borderRadius: 16, width: '100%', maxWidth: 400,
            maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column'
          }} onClick={e => e.stopPropagation()}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #ede9e3',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem' }}>
                Select {form.resourceType === 'note' ? 'Note' : 'PYQ'}
              </span>
              <button onClick={() => setShowResourceModal(false)} style={{
                width: 28, height: 28, borderRadius: 6, border: '1px solid #e2ddd6',
                background: 'transparent', cursor: 'pointer', fontSize: '1rem'
              }}>✕</button>
            </div>
            <div style={{ padding: 12, overflowY: 'auto', flex: 1 }}>
              {form.resourceType === 'note' && userNotes.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 20, fontSize: '0.85rem' }}>
                  No notes found. Create notes first!
                </div>
              )}
              {form.resourceType === 'note' && userNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    setForm((p) => ({ ...p, resourceLink: note.subjectId || note.id }));
                    setShowResourceModal(false);
                  }}
                  style={{
                    padding: '12px 14px', border: '1px solid #e2ddd6', borderRadius: 8, marginBottom: 8,
                    cursor: 'pointer', background: form.resourceLink === (note.subjectId || note.id) ? '#f0d98a' : 'white',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{note.subjectName || 'Study notes'}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Subject notes</div>
                </div>
              ))}
              
              {form.resourceType === 'pyq' && userPyqs.length === 0 && (
                <div style={{ textAlign: 'center', color: '#64748b', padding: 20, fontSize: '0.85rem' }}>
                  No PYQs available.
                </div>
              )}
              {form.resourceType === 'pyq' && userPyqs.map(pyq => (
                <div
                  key={pyq.id}
                  onClick={() => { setForm(p => ({ ...p, resourceLink: pyq.id })); setShowResourceModal(false); }}
                  style={{
                    padding: '12px 14px', border: '1px solid #e2ddd6', borderRadius: 8, marginBottom: 8,
                    cursor: 'pointer', background: form.resourceLink === pyq.id ? '#f0d98a' : 'white'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{pyq.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{pyq.year}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getPlaceholder(taskType) {
  switch(taskType) {
    case 'answer': return "e.g. Write 10 marks question on Federalism";
    case 'revision': return "e.g. Revise Laxmikant Ch. 4";
    case 'mock': return "e.g. Complete CSAT Paper II";
    case 'ca': return "e.g. Read today's PIB summary";
    default: return "e.g. Read Laxmikanth Ch. 4";
  }
}
