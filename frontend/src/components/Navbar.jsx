import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✦</span>
          <span>Todo<strong>SaaS</strong></span>
        </Link>

        <div className="navbar-actions">
          {user ? (
            <>
              <div className="user-pill">
                <span className="user-avatar">{(user.name || user.username || "U")[0].toUpperCase()}</span>
                <span className="user-name">{user.name || user.username}</span>
                {user.premium && <span className="badge badge-premium">⭐ Pro</span>}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
