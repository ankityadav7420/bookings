import { Router } from "express";
import { z } from "zod";
import { createOrder, failPayment, verifyPayment } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

router.post(
  "/create-order",
  authenticate,
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
  authenticate,
  validate(
    z.object({
      body: z.object({
        providerOrderId: z.string().min(1),
        providerPaymentId: z.string().min(1),
        providerSignature: z.string().min(1)
      })
    })
  ),
  verifyPayment
);

router.post(
  "/fail",
  authenticate,
  validate(
    z.object({
      body: z.object({
        providerOrderId: z.string().min(1)
      })
    })
  ),
  failPayment
);

export default router;
