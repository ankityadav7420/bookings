import { Router } from "express";
import { z } from "zod";
import { createMovie, deleteMovie, getMovie, listMovies, updateMovie } from "../controllers/movie.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";

const router = Router();

const movieBody = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  language: z.string().min(1),
  genres: z.array(z.string()).default([]),
  certificate: z.string().min(1),
  releaseDate: z.coerce.date(),
  posterUrl: z.string().url().optional(),
  bannerUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  cast: z.array(z.string()).default([]),
  crew: z.array(z.object({ name: z.string().min(1), role: z.string().min(1) })).default([]),
  ratingAverage: z.number().min(0).max(10).default(0),
  ratingCount: z.number().int().min(0).default(0),
  isTrending: z.boolean().default(false),
  isRecommended: z.boolean().default(false),
  status: z.enum(["upcoming", "running", "ended"]).default("upcoming")
});

router.get("/", listMovies);
router.get("/:id", getMovie);
router.post("/", authenticate, authorize("admin"), validate(z.object({ body: movieBody })), createMovie);
router.patch("/", authenticate, authorize("admin"), (_req, res) => res.status(405).json({ success: false, message: "Use PATCH /api/movies/:id" }));
router.patch("/:id", authenticate, authorize("admin"), validate(z.object({ body: movieBody.partial() })), updateMovie);
router.delete("/:id", authenticate, authorize("admin"), deleteMovie);

export default router;
