import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import "./Landing.css";

const FEATURES = [
  { icon: "🔐", title: "JWT + Google OAuth", desc: "Secure login with JSON Web Tokens and one-click Google sign-in." },
  { icon: "🗄️", title: "MongoDB Storage", desc: "All todos persisted with indices for lightning-fast per-user queries." },
  { icon: "⚡", title: "Redis Caching", desc: "RediSearch full-text index over your todos — instant sub-millisecond search." },
  { icon: "💳", title: "Razorpay Payments", desc: "Upgrade to Premium with a secure test payment for ₹99." },
  { icon: "🐳", title: "Docker + K8s", desc: "Fully containerised, deployed on separate Kubernetes pods." },
  { icon: "🔍", title: "Full-text Search", desc: "Premium FT.SEARCH powered by Redis Stack for blazing-fast results." },
];

const PLANS = [
  { name: "Free", price: "₹0", features: ["Unlimited todos", "Priority labels", "Due dates", "JWT / Google login"], cta: "Get Started Free", to: "/register", premium: false },
  { name: "Premium", price: "₹99", sub: "one-time", features: ["Everything in Free", "Redis FT.SEARCH", "Advanced filters", "Priority support"], cta: "Upgrade Now", to: "/app", premium: true },
];

export default function Landing() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="hero container fade-up">
          <div className="hero-badge">🚀 Production-grade SaaS · K8s · Redis · Razorpay</div>
          <h1 className="hero-title">
            The <span className="gradient-text">smartest</span> way<br />to manage your tasks
          </h1>
          <p className="hero-sub">
            A full-stack MERN Todo SaaS with JWT auth, Google OAuth, Redis-powered search,
            and Razorpay premium — deployed on Kubernetes.
          </p>
          <div className="hero-cta">
            <Link to="/register" id="hero-cta-register" className="btn btn-primary">Get started free →</Link>
            <Link to="/login" id="hero-cta-login" className="btn btn-secondary">Sign in</Link>
          </div>
        </section>

        {/* Features */}
        <section className="features-section container">
          <h2 className="section-title">Everything you need, nothing you don't</h2>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card card fade-up">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="pricing-section container">
          <h2 className="section-title">Simple pricing</h2>
          <div className="pricing-grid">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`pricing-card card ${plan.premium ? "pricing-card-premium" : ""}`}>
                {plan.premium && <div className="pricing-popular">Most Popular</div>}
                <div className="pricing-name">{plan.name}</div>
                <div className="pricing-price">
                  {plan.price}
                  {plan.sub && <span className="pricing-sub"> / {plan.sub}</span>}
                </div>
                <ul className="pricing-features">
                  {plan.features.map((f) => <li key={f}><span>✓</span> {f}</li>)}
                </ul>
                <Link
                  to={plan.to}
                  id={`plan-cta-${plan.name.toLowerCase()}`}
                  className={`btn ${plan.premium ? "btn-premium" : "btn-secondary"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Todo SaaS · Built with MERN + Redis + K8s</p>
      </footer>
    </>
  );
}
