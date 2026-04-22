import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { todoApi } from "../api/api.js";
import Navbar from "../components/Navbar.jsx";
import TodoItem from "../components/TodoItem.jsx";
import PremiumBanner from "../components/PremiumBanner.jsx";
import SearchBar from "../components/SearchBar.jsx";
import "./AppPage.css";

const PRIORITIES = ["low", "medium", "high"];

export default function AppPage() {
  const { user, loading } = useAuth();
  const navigate           = useNavigate();

  const [todos, setTodos]         = useState([]);
  const [fetching, setFetching]   = useState(true);
  const [err, setErr]             = useState("");
  const [searchResults, setSearch] = useState(null); // null = not searching

  // New-todo form state
  const [title, setTitle]       = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate]   = useState("");
  const [creating, setCreating] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && user === false) navigate("/login");
  }, [user, loading, navigate]);

  const fetchTodos = useCallback(async () => {
    try {
      const { todos } = await todoApi.getAll();
      setTodos(todos);
    } catch (e) {
      setErr(e.message);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => { if (user) fetchTodos(); }, [user, fetchTodos]);

  const create = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const { todo } = await todoApi.create({ title, priority, dueDate: dueDate || undefined });
      setTodos((p) => [todo, ...p]);
      setTitle(""); setDueDate(""); setPriority("medium");
      setSearch(null);
    } catch (e) { setErr(e.message); }
    finally { setCreating(false); }
  };

  const update = async (id, patch) => {
    try {
      const { todo } = await todoApi.update(id, patch);
      setTodos((p) => p.map((t) => (t.id === id ? todo : t)));
    } catch (e) { setErr(e.message); }
  };

  const remove = async (id) => {
    try {
      await todoApi.remove(id);
      setTodos((p) => p.filter((t) => t.id !== id));
      if (searchResults) setSearch((r) => ({ ...r, items: r.items.filter((t) => t.id !== id) }));
    } catch (e) { setErr(e.message); }
  };

  const handleSearch = async (q) => {
    if (!q) { setSearch(null); return; }
    try {
      const result = await todoApi.search(q);
      setSearch(result);
    } catch (e) { setErr(e.message); }
  };

  const displayed = searchResults
    ? searchResults.items
    : todos;

  const done  = todos.filter((t) => t.done).length;
  const total = todos.length;

  if (loading || (fetching && user)) {
    return (
      <div className="app-loading">
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="app-main container fade-up">

        {/* Header stats */}
        <div className="app-header">
          <div>
            <h1 className="app-title">My Tasks</h1>
            <p className="app-subtitle">
              {total === 0 ? "No tasks yet — add one below!" : `${done} of ${total} completed`}
            </p>
          </div>
          {total > 0 && (
            <div className="progress-ring-wrapper" title={`${Math.round((done/total)*100)}% done`}>
              <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--clr-surface-2)" strokeWidth="5"/>
                <circle cx="28" cy="28" r="22" fill="none" stroke="var(--clr-primary)" strokeWidth="5"
                  strokeDasharray={`${2*Math.PI*22}`}
                  strokeDashoffset={`${2*Math.PI*22*(1-done/total)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 28 28)"
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
              <span className="progress-pct">{Math.round((done/total)*100)}%</span>
            </div>
          )}
        </div>

        {err && <div className="alert alert-error" onClick={() => setErr("")}>{err} ✕</div>}

        {/* Search */}
        <div className="app-section">
          <SearchBar onSearch={handleSearch} isPremium={!!user?.premium} />
          {searchResults && (
            <p className="search-info">
              {searchResults.total} result{searchResults.total !== 1 ? "s" : ""} for Redis FT.SEARCH
            </p>
          )}
        </div>

        {/* New todo form */}
        {!searchResults && (
          <form className="new-todo-form card" onSubmit={create}>
            <div className="new-todo-inputs">
              <input
                id="new-todo-input"
                className="input"
                type="text"
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <select
                id="new-todo-priority"
                className="input priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</option>)}
              </select>
              <input
                id="new-todo-due"
                className="input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <button id="add-todo-btn" type="submit" className="btn btn-primary" disabled={creating || !title.trim()}>
              {creating ? <span className="spinner" /> : "+ Add Task"}
            </button>
          </form>
        )}

        {/* Premium banner */}
        {!user?.premium && !searchResults && <PremiumBanner />}

        {/* Todo list */}
        <div className="todo-list">
          {displayed.length === 0 && !fetching && (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>{searchResults ? "No matching todos found." : "All clear! Add your first task above."}</p>
            </div>
          )}
          {displayed.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={update}
              onDelete={remove}
            />
          ))}
        </div>
      </main>
    </>
  );
}
