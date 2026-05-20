import { Router } from "express";
import { dashboard, listAllBookings, listUsers } from "../controllers/admin.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/dashboard", dashboard);
router.get("/bookings", listAllBookings);
router.get("/users", listUsers);

export default router;
