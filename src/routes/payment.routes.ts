import { Router } from "express";
import { z } from "zod";
import { createOrder, verifyPayment } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/create-order",
  validate(
    z.object({
      body: z.object({
        bookingId: z.string().min(1)
      })
    })
  ),
  createOrder
);

router.post(
  "/verify",
  validate(
    z.object({
      body: z.object({
        providerOrderId: z.string().min(1),
        providerPaymentId: z.string().min(1),
        providerSignature: z.string().min(1),
        success: z.boolean().optional()
      })
    })
  ),
  verifyPayment
);

export default router;
