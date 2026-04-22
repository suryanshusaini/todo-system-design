import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createOrder, webhook } from "../controllers/premiumController.js";

const router = express.Router();

// Create a Razorpay order — user must be logged in
router.post("/premium/order", verifyToken, createOrder);

// Razorpay webhook — needs raw body (applied at app level for this path)
router.post("/premium/webhook", webhook);

export default router;
