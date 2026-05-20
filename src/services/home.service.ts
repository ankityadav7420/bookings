import { Movie } from "../models/Movie";
import { Theater } from "../models/Theater";

export const homeService = {
  async getHome(query: any) {
    const city = query.city ? String(query.city) : undefined;
    const search = query.q ? String(query.q) : undefined;
    const movieSearchFilter = search ? { $text: { $search: search } } : {};
    const cityTheaters = city ? await Theater.find({ city, isActive: true }).select("_id") : [];
    const theaterIds = cityTheaters.map((theater) => theater._id);

    const [trendingMovies, upcomingMovies, recommendedMovies, cities] = await Promise.all([
      Movie.find({ status: "running", isTrending: true, ...movieSearchFilter }).sort({ ratingAverage: -1 }).limit(12),
      Movie.find({ status: "upcoming", ...movieSearchFilter }).sort({ releaseDate: 1 }).limit(12),
      Movie.find({ status: "running", isRecommended: true, ...movieSearchFilter }).sort({ ratingAverage: -1 }).limit(12),
      Theater.distinct("city", { isActive: true })
    ]);

    return {
      selectedCity: city,
      cities,
      cityTheaterIds: theaterIds,
      trendingMovies,
      upcomingMovies,
      recommendedMovies
    };
  }
};
