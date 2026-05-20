import { Theater } from "../models/Theater";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const listTheaters = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = { isActive: true };
  if (req.query.city) filter.city = req.query.city;
  const theaters = await Theater.find(filter).sort({ city: 1, name: 1 });
  res.json({ success: true, data: theaters });
});

export const getTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.findById(req.params.id);
  if (!theater) throw new ApiError(404, "Theater not found");
  res.json({ success: true, data: theater });
});

export const createTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.create({ ...req.body, createdBy: req.user?.id });
  res.status(201).json({ success: true, data: theater });
});

export const updateTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!theater) throw new ApiError(404, "Theater not found");
  res.json({ success: true, data: theater });
});

export const deleteTheater = asyncHandler(async (req, res) => {
  const theater = await Theater.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!theater) throw new ApiError(404, "Theater not found");
  res.json({ success: true, message: "Theater deactivated" });
});
