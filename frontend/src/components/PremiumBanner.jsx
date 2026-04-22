import { useState } from "react";
import { paymentApi } from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./PremiumBanner.css";

export default function PremiumBanner() {
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");

  const handleUpgrade = async () => {
    setErr("");
    setLoading(true);
    try {
      const { order, keyId } = await paymentApi.createOrder();

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Todo SaaS",
        description: "Premium Subscription",
        order_id: order.id,
        handler: async () => {
          // After payment success, refresh user (webhook may have already updated premium)
          await new Promise((r) => setTimeout(r, 1500));
          await refresh();
        },
        prefill: {},
        theme: { color: "#7c6ef9" },
      };

      if (!window.Razorpay) {
        // Lazy-load Razorpay SDK
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      setErr(e.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-banner fade-up">
      <div className="premium-banner-content">
        <div className="premium-icon">⭐</div>
        <div>
          <h3>Upgrade to Premium</h3>
          <p>Unlock Redis full-text search, priority filters, due-date reminders, and more — just ₹99.</p>
        </div>
      </div>
      {err && <div className="alert alert-error" style={{ marginBottom: 0, marginTop: 12 }}>{err}</div>}
      <button id="upgrade-btn" className="btn btn-premium" onClick={handleUpgrade} disabled={loading}>
        {loading ? <><span className="spinner" /> Processing…</> : "Upgrade Now — ₹99"}
      </button>
    </div>
  );
}
