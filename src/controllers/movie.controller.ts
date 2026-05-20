import { movieService } from "../services/movie.service";
import { asyncHandler } from "../utils/asyncHandler";
import { getParam } from "../utils/request";
import { sendCreated, sendSuccess } from "../utils/response";

export const listMovies = asyncHandler(async (req, res) => {
  const movies = await movieService.list(req.query);
  sendSuccess(res, movies);
});

export const getMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.getById(getParam(req, "id"));
  sendSuccess(res, movie);
});

export const createMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.create(req.body, req.user!.id);
  sendCreated(res, movie, "Movie created successfully");
});

export const updateMovie = asyncHandler(async (req, res) => {
  const movie = await movieService.update(getParam(req, "id"), req.body);
  sendSuccess(res, movie, "Movie updated successfully");
});

export const deleteMovie = asyncHandler(async (req, res) => {
  await movieService.delete(getParam(req, "id"));
  sendSuccess(res, null, "Movie deleted");
});
