import { Booking } from "../models/Booking";
import { bookingService } from "../services/booking.service";
import { asyncHandler } from "../utils/asyncHandler";

export const holdSeats = asyncHandler(async (req, res) => {
  const result = await bookingService.holdSeats(req.user!.id, req.body.showId, req.body.seats);
  res.status(201).json({ success: true, data: result });
});

export const myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user!.id })
    .populate("movie", "title posterUrl language")
    .populate("theater", "name city")
    .populate("show", "startsAt screenName")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
});

export const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    ...(req.user!.role === "admin" ? {} : { user: req.user!.id })
  })
    .populate("movie", "title posterUrl language durationMinutes")
    .populate("theater", "name city address")
    .populate("show", "startsAt screenName")
    .populate("payment");
  res.json({ success: true, data: booking });
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.user!.id, String(req.params.id), req.user!.role === "admin");
  res.json({ success: true, data: booking });
});
