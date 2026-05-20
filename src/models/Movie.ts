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
  trailerUrl?: string;
  cast: string[];
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
    trailerUrl: String,
    cast: [{ type: String, trim: true }],
    status: { type: String, enum: ["upcoming", "running", "ended"], default: "upcoming", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

movieSchema.index({ title: "text", description: "text", genres: "text", cast: "text" });

export const Movie = model<IMovie>("Movie", movieSchema);
