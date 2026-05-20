import { bookingService } from "../services/booking.service";
import { showService } from "../services/show.service";
import { asyncHandler } from "../utils/asyncHandler";
import { getParam } from "../utils/request";
import { sendCreated, sendSuccess } from "../utils/response";

export const listShows = asyncHandler(async (req, res) => {
  const shows = await showService.list(req.query);
  sendSuccess(res, shows);
});

export const getShow = asyncHandler(async (req, res) => {
  const show = await showService.getById(getParam(req, "id"));
  sendSuccess(res, show);
});

export const getShowSeats = asyncHandler(async (req, res) => {
  const seats = await bookingService.getSeatMap(getParam(req, "id"));
  sendSuccess(res, seats);
});

export const createShow = asyncHandler(async (req, res) => {
  const show = await showService.create(req.body, req.user!.id);
  sendCreated(res, show, "Show created successfully");
});

export const updateShow = asyncHandler(async (req, res) => {
  const show = await showService.update(getParam(req, "id"), req.body);
  sendSuccess(res, show, "Show updated successfully");
});

export const cancelShow = asyncHandler(async (req, res) => {
  const show = await showService.cancel(getParam(req, "id"));
  sendSuccess(res, show, "Show cancelled successfully");
});
