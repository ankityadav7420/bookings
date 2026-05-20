import { Movie } from "../models/Movie";
import { Show } from "../models/Show";
import { Theater } from "../models/Theater";
import { ApiError } from "../utils/ApiError";

export const movieService = {
  async list(query: any) {
    const { city, status, q, language, genre } = query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (language) filter.language = language;
    if (genre) filter.genres = genre;
    if (q) filter.$text = { $search: String(q) };
    if (city) {
      const theaters = await Theater.find({ city: String(city), isActive: true }).select("_id");
      const shows = await Show.find({
        theater: { $in: theaters.map((theater) => theater._id) },
        startsAt: { $gte: new Date() },
        status: { $ne: "cancelled" }
      }).select("movie");
      filter._id = { $in: [...new Set(shows.map((show) => String(show.movie)))] };
    }

    return Movie.find(filter).sort({ releaseDate: -1 });
  },

  async getById(id: string) {
    const movie = await Movie.findById(id);
    if (!movie) throw new ApiError(404, "Movie not found");
    return movie;
  },

  async create(input: Record<string, unknown>, adminId: string) {
    return Movie.create({ ...input, createdBy: adminId });
  },

  async update(id: string, input: Record<string, unknown>) {
    const movie = await Movie.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!movie) throw new ApiError(404, "Movie not found");
    return movie;
  },

  async delete(id: string) {
    const movie = await Movie.findByIdAndDelete(id);
    if (!movie) throw new ApiError(404, "Movie not found");
  }
};
