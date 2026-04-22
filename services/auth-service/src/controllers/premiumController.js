import crypto from "crypto";
import Razorpay from "razorpay";
import User from "../models/User.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /premium/order
export async function createOrder(req, res) {
  const payload = req.userPayload;
  try {
    // Receipt must be ≤ 40 chars: "prem_" (5) + 16-char userId slice + "_" + 10-char ts = 32
    const shortId = String(payload.sub).slice(-16);
    const shortTs = String(Date.now()).slice(-10);
    const receipt = `prem_${shortId}_${shortTs}`;

    const order = await razorpay.orders.create({
      amount: 9900, // ₹99 in paise
      currency: "INR",
      receipt,
      notes: { userId: String(payload.sub) }
    });

    res.json({ order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    const rzErr = e?.error || e?.response?.data?.error;
    const msg = rzErr?.description || rzErr?.message || e?.message || "razorpay_error";
    const status = (e?.statusCode >= 400 && e?.statusCode < 600) ? e.statusCode : 502;
    console.error("Razorpay createOrder failed:", msg);
    res.status(status).json({ error: "razorpay_error", message: msg });
  }
}

// POST /premium/webhook  (raw body — handled upstream)
export async function webhook(req, res) {
  const signature = req.headers["x-razorpay-signature"];
  const body = req.body instanceof Buffer ? req.body.toString("utf8") : "";

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

  if (!signature || signature !== expected) {
    return res.status(400).send("invalid signature");
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return res.status(400).send("invalid json");
  }

  const notes =
    event?.payload?.payment?.entity?.notes ||
    event?.payload?.order?.entity?.notes ||
    event?.payload?.payment_link?.entity?.notes;

  const userId = notes?.userId;
  if (userId) {
    await User.updateOne({ _id: userId }, { $set: { premium: true } });
    console.log(`User ${userId} upgraded to premium via webhook`);
  }

  res.json({ ok: true });
}
