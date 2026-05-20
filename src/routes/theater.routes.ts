import { Router } from "express";
import { z } from "zod";
import { createTheater, deleteTheater, getTheater, listTheaters, updateTheater } from "../controllers/theater.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const seatBody = z.object({
  row: z.string().min(1),
  number: z.number().int().positive(),
  type: z.enum(["regular", "premium", "recliner"]).default("regular"),
  isActive: z.boolean().default(true)
});

const theaterBody = z.object({
  name: z.string().min(1),
  city: z.string().min(1),
  address: z.string().min(1),
  amenities: z.array(z.string()).default([]),
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
