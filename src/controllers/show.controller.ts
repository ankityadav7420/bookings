import { Show } from "../models/Show";
import { bookingService } from "../services/booking.service";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listShows = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.movie) filter.movie = req.query.movie;
  if (req.query.theater) filter.theater = req.query.theater;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) {
    const start = new Date(String(req.query.date));
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.startsAt = { $gte: start, $lt: end };
  } else {
    filter.startsAt = { $gte: new Date() };
  }

  const shows = await Show.find(filter)
    .populate("movie", "title posterUrl language durationMinutes certificate")
    .populate("theater", "name city address")
    .sort({ startsAt: 1 });
  res.json({ success: true, data: shows });
});

export const getShow = asyncHandler(async (req, res) => {
  const show = await Show.findById(req.params.id)
    .populate("movie", "title posterUrl language durationMinutes certificate")
    .populate("theater", "name city address screens");
  if (!show) throw new ApiError(404, "Show not found");
  res.json({ success: true, data: show });
});

export const getShowSeats = asyncHandler(async (req, res) => {
  const seats = await bookingService.getSeatMap(String(req.params.id));
  res.json({ success: true, data: seats });
});

export const createShow = asyncHandler(async (req, res) => {
  const show = await Show.create({ ...req.body, createdBy: req.user?.id });
  res.status(201).json({ success: true, data: show });
});

export const updateShow = asyncHandler(async (req, res) => {
  const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!show) throw new ApiError(404, "Show not found");
  res.json({ success: true, data: show });
});

export const cancelShow = asyncHandler(async (req, res) => {
  const show = await Show.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
  if (!show) throw new ApiError(404, "Show not found");
  res.json({ success: true, data: show });
});
