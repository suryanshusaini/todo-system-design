import { useState } from "react";
import "./TodoItem.css";

const PRIORITY_LABELS = { low: "Low", medium: "Med", high: "High" };

export default function TodoItem({ todo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle]     = useState(todo.title);
  const [busy, setBusy]       = useState(false);

  const toggle = async () => {
    setBusy(true);
    await onUpdate(todo.id, { done: !todo.done });
    setBusy(false);
  };

  const save = async () => {
    if (!title.trim() || title.trim() === todo.title) { setEditing(false); return; }
    setBusy(true);
    await onUpdate(todo.id, { title: title.trim() });
    setBusy(false);
    setEditing(false);
  };

  const del = async () => {
    setBusy(true);
    await onDelete(todo.id);
  };

  return (
    <div className={`todo-item fade-up ${todo.done ? "todo-done" : ""} priority-${todo.priority}`}>
      <button
        id={`todo-check-${todo.id}`}
        className={`todo-check ${todo.done ? "checked" : ""}`}
        onClick={toggle}
        disabled={busy}
        aria-label="Toggle done"
      >
        {todo.done && <span>✓</span>}
      </button>

      <div className="todo-content">
        {editing ? (
          <input
            className="input todo-edit-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
            autoFocus
          />
        ) : (
          <span className="todo-title" onDoubleClick={() => setEditing(true)} title="Double-click to edit">
            {todo.title}
          </span>
        )}

        <div className="todo-meta">
          <span className={`badge badge-${todo.priority}`}>{PRIORITY_LABELS[todo.priority]}</span>
          {todo.dueDate && (
            <span className="todo-due">📅 {new Date(todo.dueDate).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      <div className="todo-actions">
        {!editing && (
          <button id={`todo-edit-${todo.id}`} className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} title="Edit">✏️</button>
        )}
        <button id={`todo-del-${todo.id}`} className="btn btn-danger btn-sm" onClick={del} disabled={busy} title="Delete">🗑</button>
      </div>
    </div>
  );
}
