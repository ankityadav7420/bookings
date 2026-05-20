import { theaterService } from "../services/theater.service";
import { asyncHandler } from "../utils/asyncHandler";
import { getParam } from "../utils/request";
import { sendCreated, sendSuccess } from "../utils/response";

export const listTheaters = asyncHandler(async (req, res) => {
  const theaters = await theaterService.list(req.query);
  sendSuccess(res, theaters);
});

export const getTheater = asyncHandler(async (req, res) => {
  const theater = await theaterService.getById(getParam(req, "id"));
  sendSuccess(res, theater);
});

export const createTheater = asyncHandler(async (req, res) => {
  const theater = await theaterService.create(req.body, req.user!.id);
  sendCreated(res, theater, "Theater created successfully");
});

export const updateTheater = asyncHandler(async (req, res) => {
  const theater = await theaterService.update(getParam(req, "id"), req.body);
  sendSuccess(res, theater, "Theater updated successfully");
});

export const deleteTheater = asyncHandler(async (req, res) => {
  const theater = await theaterService.deactivate(getParam(req, "id"));
  sendSuccess(res, theater, "Theater deactivated");
});
