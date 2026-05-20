import { Router } from "express";
import { z } from "zod";
import { cancelShow, createShow, getShow, getShowSeats, listShows, updateShow } from "../controllers/show.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const showBody = z.object({
  movie: z.string().min(1),
  theater: z.string().min(1),
  screenName: z.string().min(1),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  prices: z.array(
    z.object({
      seatType: z.enum(["regular", "premium", "recliner"]),
      price: z.number().min(0)
    })
  ),
  status: z.enum(["scheduled", "running", "completed", "cancelled"]).default("scheduled")
});

router.get("/", listShows);
router.get("/:id", getShow);
router.get("/:id/seats", getShowSeats);
router.post("/", authenticate, authorize("admin"), validate(z.object({ body: showBody })), createShow);
router.patch("/:id", authenticate, authorize("admin"), validate(z.object({ body: showBody.partial() })), updateShow);
router.patch("/:id/cancel", authenticate, authorize("admin"), cancelShow);

export default router;
