import { bookingService } from "../services/booking.service";
import { asyncHandler } from "../utils/asyncHandler";
import { getParam } from "../utils/request";
import { sendCreated, sendSuccess } from "../utils/response";

export const holdSeats = asyncHandler(async (req, res) => {
  const result = await bookingService.holdSeats(req.user!.id, req.body.showId, req.body.seats);
  sendCreated(res, result, "Seats held successfully");
});

export const myBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user!.id);
  sendSuccess(res, bookings);
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingForUser(req.user!.id, req.user!.role, getParam(req, "id"));
  sendSuccess(res, booking);
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.user!.id, String(req.params.id), req.user!.role === "admin");
  sendSuccess(res, booking, "Booking cancelled successfully");
});
