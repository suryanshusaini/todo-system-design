import { useState } from "react";
import "./SearchBar.css";

export default function SearchBar({ onSearch, isPremium }) {
  const [q, setQ]         = useState("");
  const [loading, setLoad] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoad(true);
    await onSearch(q.trim());
    setLoad(false);
  };

  if (!isPremium) {
    return (
      <div className="search-locked">
        <span>🔒</span>
        <span>Redis full-text search — <strong>Premium only</strong></span>
      </div>
    );
  }

  return (
    <form className="search-bar" onSubmit={submit}>
      <input
        id="search-input"
        className="input search-input"
        type="text"
        placeholder="Search todos with Redis FT.SEARCH…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button id="search-btn" type="submit" className="btn btn-primary btn-sm" disabled={loading || !q.trim()}>
        {loading ? <span className="spinner" /> : "Search"}
      </button>
      {q && (
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setQ(""); onSearch(""); }}>
          Clear
        </button>
      )}
    </form>
  );
}
