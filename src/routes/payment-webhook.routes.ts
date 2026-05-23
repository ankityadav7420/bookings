import express, { Router } from "express";
import { razorpayWebhook } from "../controllers/payment.controller";

const router = Router();

router.post("/", express.raw({ type: "application/json" }), razorpayWebhook);

export default router;
