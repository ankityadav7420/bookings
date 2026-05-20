import { Schema, model, Types } from "mongoose";

export interface IMovie {
  title: string;
  description: string;
  durationMinutes: number;
  language: string;
  genres: string[];
  certificate: string;
  releaseDate: Date;
  posterUrl?: string;
  bannerUrl?: string;
  trailerUrl?: string;
  cast: string[];
  crew: Array<{ name: string; role: string }>;
  ratingAverage: number;
  ratingCount: number;
  isTrending: boolean;
  isRecommended: boolean;
  status: "upcoming" | "running" | "ended";
  createdBy?: Types.ObjectId;
}

const movieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    language: { type: String, required: true, trim: true },
    genres: [{ type: String, trim: true }],
    certificate: { type: String, required: true, trim: true },
    releaseDate: { type: Date, required: true },
    posterUrl: String,
    bannerUrl: String,
    trailerUrl: String,
    cast: [{ type: String, trim: true }],
    crew: [
      {
        name: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true }
      }
    ],
    ratingAverage: { type: Number, default: 0, min: 0, max: 10, index: true },
    ratingCount: { type: Number, default: 0, min: 0 },
    isTrending: { type: Boolean, default: false, index: true },
    isRecommended: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ["upcoming", "running", "ended"], default: "upcoming", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

movieSchema.index(
  { title: "text", description: "text", genres: "text", cast: "text", "crew.name": "text" },
  {
    default_language: "none",
    language_override: "textSearchLanguage"
  }
);

export const Movie = model<IMovie>("Movie", movieSchema);
