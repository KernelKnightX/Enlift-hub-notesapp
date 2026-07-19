import React from "react";
import Link from "next/link";

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
  { id: "high", label: "H", color: "#ef4444" },
  { id: "medium", label: "M", color: "#f59e0b" },
  { id: "low", label: "L", color: "#10b981" },
];

const TASK_TYPES = [
  { id: "study", label: "Study", bg: "#e0f2fe", text: "#0369a1" },
  { id: "answer", label: "Answer", bg: "#fef3c7", text: "#b45309" },
  { id: "revision", label: "Revise", bg: "#dcfce7", text: "#15803d" },
  { id: "mock", label: "Mock", bg: "#f3e8ff", text: "#7c3aed" },
  { id: "ca", label: "CA", bg: "#ffedd5", text: "#c2410c" },
];

function getTaskTypeStyle(taskTypeId) {
  const type = TASK_TYPES.find(t => t.id === taskTypeId) || TASK_TYPES[0];
  return type;
}

export default function TaskPill({ task, onEdit, onToggle }) {
  const sub = SUBJECTS.find(s => s.id === task.subject) || { label: task.subject, color: "#6b7280" };
  const pri = PRIORITY.find(p => p.id === task.priority) || { label: task.priority, color: "#6b7280" };
  const taskTypeStyle = getTaskTypeStyle(task.taskType);

  const getResourceLink = () => {
    if (!task.resourceLink) return null;
    switch(task.resourceType) {
      case 'note':
        return { href: `/student-desk/notes?id=${task.resourceLink}`, label: '📝 Note' };
      case 'pyq':
        return { href: `/student-desk/pyq?id=${task.resourceLink}`, label: '📄 PYQ' };
      default:
        return null;
    }
  };

  const resourceLink = getResourceLink();

  return (
    <div
      onClick={() => onEdit && onEdit(task)}
      style={{
        borderRadius: 8,
        padding: '7px 10px',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        background: sub.color + "14",
        borderLeft: `3px solid ${sub.color}`,
        opacity: task.done ? 0.55 : 1,
        position: 'relative',
        marginBottom: 6
      }}
    >
      <div style={{ paddingRight: 24 }}>
        <span style={{
          fontSize: '0.5rem',
          fontWeight: 700,
          padding: '1px 4px',
          borderRadius: 3,
          marginRight: 4,
          background: taskTypeStyle.bg,
          color: taskTypeStyle.text
        }}>
          {taskTypeStyle.label}
        </span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: task.done ? '#64748b' : '#0f1923',
          textDecoration: task.done ? 'line-through' : 'none'
        }}>
          {task.title}
        </span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.62rem', color: sub.color, fontWeight: 500 }}>{sub.label}</span>
        <span style={{ 
          fontSize: '0.6rem', fontWeight: 700, borderRadius: 3, padding: '1px 5px',
          background: pri.color + '20', color: pri.color 
        }}>{pri.label}</span>
        {task.duration > 0 && (
          <span style={{ fontSize: '0.62rem', color: '#64748b' }}>{task.duration}m</span>
        )}
      </div>

      {resourceLink && (
        <Link 
          href={resourceLink.href}
          onClick={(e) => e.stopPropagation()}
          style={{ marginTop: 4, display: 'block', fontSize: '0.6rem', color: '#1a3f6b', textDecoration: 'underline' }}
        >
          {resourceLink.label}
        </Link>
      )}

      {/* Checkbox */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (onToggle) onToggle(task);
        }}
        style={{
          position: 'absolute',
          right: 7,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 18,
          height: 18,
          borderRadius: '50%',
          border: '1.5px solid #e2ddd6',
          background: task.done ? '#1a6b4a' : 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.6rem',
          color: 'white'
        }}
      >
        {task.done ? "✓" : ""}
      </div>
    </div>
  );
}
