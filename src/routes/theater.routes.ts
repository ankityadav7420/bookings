import { Router } from "express";
import { z } from "zod";
import { SEAT_CATEGORIES } from "../constants/enums";
import { createTheater, deleteTheater, getTheater, listTheaters, updateTheater } from "../controllers/theater.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const seatBody = z.object({
  row: z.string().min(1),
  number: z.number().int().positive(),
  type: z.enum(SEAT_CATEGORIES),
  isActive: z.boolean().default(true)
});

const theaterBody = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  location: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180)
    })
    .optional(),
  facilities: z.array(z.string()).default([]),
  screens: z.array(
    z.object({
      name: z.string().min(1),
      seats: z.array(seatBody).default([])
    })
  ),
  isActive: z.boolean().default(true)
});

router.get("/", listTheaters);
router.get("/:id", getTheater);
router.post("/", authenticate, authorize("admin"), validate(z.object({ body: theaterBody })), createTheater);
router.patch("/:id", authenticate, authorize("admin"), validate(z.object({ body: theaterBody.partial() })), updateTheater);
router.delete("/:id", authenticate, authorize("admin"), deleteTheater);

export default router;
