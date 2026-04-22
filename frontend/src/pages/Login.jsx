import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { authApi } from "../api/api.js";

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr]   = useState("");
  const [busy, setBusy] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login(form);
      navigate("/app");
    } catch (e) {
      setErr(e.message || "Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card fade-up">
        <div className="auth-brand">✦ TodoSaaS</div>
        <h1>Welcome back</h1>
        <p>Sign in to your account to continue</p>

        {err && <div className="alert alert-error">{err}</div>}

        <form className="auth-form" onSubmit={submit}>
          <div className="input-group">
            <label htmlFor="login-username">Username</label>
            <input id="login-username" name="username" className="input" type="text"
              placeholder="your_username" value={form.username} onChange={handle} required />
          </div>
          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <input id="login-password" name="password" className="input" type="password"
              placeholder="••••••••" value={form.password} onChange={handle} required />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary" style={{ marginTop: 4 }} disabled={busy}>
            {busy ? <><span className="spinner" /> Signing in…</> : "Sign in"}
          </button>
        </form>

        <div className="divider">or</div>

        <a id="google-login-btn" href={authApi.googleUrl()} className="btn btn-google" style={{ justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.185l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </a>

        <p className="auth-link">Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
}
