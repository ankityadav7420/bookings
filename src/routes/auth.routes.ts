import { Router } from "express";
import { z } from "zod";
import { login, me, register } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

router.post(
  "/register",
  validate(
    z.object({
      body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        mobile: z.string().min(10).max(15),
        password: z.string().min(6)
      })
    })
  ),
  register
);

router.post(
  "/login",
  validate(
    z.object({
      body: z.object({
        emailOrMobile: z.string().min(3),
        password: z.string().min(6)
      })
    })
  ),
  login
);

router.get("/me", authenticate, me);

export default router;
