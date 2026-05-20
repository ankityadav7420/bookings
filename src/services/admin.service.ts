import { Booking } from "../models/Booking";
import { Movie } from "../models/Movie";
import { Payment } from "../models/Payment";
import { User } from "../models/User";

export const adminService = {
  async dashboard() {
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

    return {
      totalBookings,
      revenue: revenueAgg[0]?.revenue ?? 0,
      runningMovies,
      activeUsers,
      recentBookings
    };
  },

  async listBookings(query: any) {
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    return Booking.find(filter)
      .populate("movie", "title")
      .populate("theater", "name city")
      .populate("user", "name email mobile")
      .sort({ createdAt: -1 });
  },

  async listUsers() {
    return User.find().select("-password").sort({ createdAt: -1 });
  }
};
