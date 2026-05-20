import { Router } from "express";
import { z } from "zod";
import { cancelBooking, getBooking, holdSeats, myBookings } from "../controllers/booking.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/hold",
  validate(
    z.object({
      body: z.object({
        showId: z.string().min(1),
        seats: z.array(z.string().min(2)).min(1)
      })
    })
  ),
  holdSeats
);
router.get("/my", myBookings);
router.get("/:id", getBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
