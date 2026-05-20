import { Movie } from "../models/Movie";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listMovies = asyncHandler(async (req, res) => {
  const { city: _city, status, q, language, genre } = req.query;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (language) filter.language = language;
  if (genre) filter.genres = genre;
  if (q) filter.$text = { $search: String(q) };

  const movies = await Movie.find(filter).sort({ releaseDate: -1 });
  res.json({ success: true, data: movies });
});

export const getMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) throw new ApiError(404, "Movie not found");
  res.json({ success: true, data: movie });
});

export const createMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.create({ ...req.body, createdBy: req.user?.id });
  res.status(201).json({ success: true, data: movie });
});

export const updateMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!movie) throw new ApiError(404, "Movie not found");
  res.json({ success: true, data: movie });
});

export const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) throw new ApiError(404, "Movie not found");
  res.json({ success: true, message: "Movie deleted" });
});
