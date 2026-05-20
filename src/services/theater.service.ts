import { Theater } from "../models/Theater";
import { ApiError } from "../utils/ApiError";

export const theaterService = {
  async list(query: any) {
    const filter: Record<string, unknown> = { isActive: true };
    if (query.city) filter.city = query.city;
    return Theater.find(filter).sort({ city: 1, name: 1 });
  },

  async getById(id: string) {
    const theater = await Theater.findById(id);
    if (!theater) throw new ApiError(404, "Theater not found");
    return theater;
  },

  async create(input: Record<string, unknown>, adminId: string) {
    return Theater.create({ ...input, createdBy: adminId });
  },

  async update(id: string, input: Record<string, unknown>) {
    const theater = await Theater.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!theater) throw new ApiError(404, "Theater not found");
    return theater;
  },

  async deactivate(id: string) {
    const theater = await Theater.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!theater) throw new ApiError(404, "Theater not found");
    return theater;
  }
};
