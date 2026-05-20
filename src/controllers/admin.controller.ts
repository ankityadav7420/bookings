import { Booking } from "../models/Booking";
import { Movie } from "../models/Movie";
import { Payment } from "../models/Payment";
import { User } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";

export const dashboard = asyncHandler(async (_req, res) => {
  const [totalBookings, revenueAgg, runningMovies, activeUsers, recentBookings] = await Promise.all([
    Booking.countDocuments({ status: "confirmed" }),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, revenue: { $sum: "$amount" } } }
    ]),
    Movie.countDocuments({ status: "running" }),
    User.countDocuments({ isActive: true }),
    Booking.find()
      .populate("movie", "title")
      .populate("user", "name email mobile")
      .sort({ createdAt: -1 })
      .limit(10)
  ]);

  res.json({
    success: true,
    data: {
      totalBookings,
      revenue: revenueAgg[0]?.revenue ?? 0,
      runningMovies,
      activeUsers,
      recentBookings
    }
  });
});

export const listAllBookings = asyncHandler(async (req, res) => {
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  const bookings = await Booking.find(filter)
    .populate("movie", "title")
    .populate("theater", "name city")
    .populate("user", "name email mobile")
    .sort({ createdAt: -1 });
  res.json({ success: true, data: bookings });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});
