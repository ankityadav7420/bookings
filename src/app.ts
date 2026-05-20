import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import { requestId } from "./middlewares/request-id.middleware";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";
import bookingRoutes from "./routes/booking.routes";
import homeRoutes from "./routes/home.routes";
import movieRoutes from "./routes/movie.routes";
import paymentRoutes from "./routes/payment.routes";
import showRoutes from "./routes/show.routes";
import theaterRoutes from "./routes/theater.routes";
import { sendSuccess } from "./utils/response";

export const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(requestId);
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => {
  sendSuccess(res, { status: "ok", service: "movie-ticket-booking-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theaters", theaterRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);
