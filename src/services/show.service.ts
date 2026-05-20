import { Show } from "../models/Show";
import { Theater } from "../models/Theater";
import { ApiError } from "../utils/ApiError";

export const showService = {
  async list(query: any) {
    const filter: Record<string, unknown> = {};
    if (query.movie) filter.movie = query.movie;
    if (query.theater) filter.theater = query.theater;
    if (query.status) filter.status = query.status;
    if (query.city && !query.theater) {
      const theaters = await Theater.find({ city: String(query.city), isActive: true }).select("_id");
      filter.theater = { $in: theaters.map((theater) => theater._id) };
    }
    if (query.date) {
      const start = new Date(String(query.date));
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.startsAt = { $gte: start, $lt: end };
    } else {
      filter.startsAt = { $gte: new Date() };
    }

    return Show.find(filter)
      .populate("movie", "title posterUrl language durationMinutes certificate")
      .populate("theater", "name city address")
      .sort({ startsAt: 1 });
  },

  async getById(id: string) {
    const show = await Show.findById(id)
      .populate("movie", "title posterUrl language durationMinutes certificate")
      .populate("theater", "name city address screens");
    if (!show) throw new ApiError(404, "Show not found");
    return show;
  },

  async create(input: Record<string, unknown>, adminId: string) {
    return Show.create({ ...input, createdBy: adminId });
  },

  async update(id: string, input: Record<string, unknown>) {
    const show = await Show.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!show) throw new ApiError(404, "Show not found");
    return show;
  },

  async cancel(id: string) {
    const show = await Show.findByIdAndUpdate(id, { status: "cancelled" }, { new: true });
    if (!show) throw new ApiError(404, "Show not found");
    return show;
  }
};
