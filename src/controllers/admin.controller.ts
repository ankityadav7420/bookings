import { adminService } from "../services/admin.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";

export const dashboard = asyncHandler(async (_req, res) => {
  const data = await adminService.dashboard();
  sendSuccess(res, data);
});

export const listAllBookings = asyncHandler(async (req, res) => {
  const bookings = await adminService.listBookings(req.query);
  sendSuccess(res, bookings);
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await adminService.listUsers();
  sendSuccess(res, users);
});
