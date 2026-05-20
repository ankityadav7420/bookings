import { Schema, model, Types } from "mongoose";
import { SEAT_CATEGORIES, SeatCategory } from "../constants/enums";

export interface IPriceTier {
  seatType: SeatCategory;
  price: number;
}

export interface IShow {
  movie: Types.ObjectId;
  theater: Types.ObjectId;
  screenName: string;
  startsAt: Date;
  endsAt: Date;
  prices: IPriceTier[];
  status: "scheduled" | "running" | "completed" | "cancelled";
  createdBy?: Types.ObjectId;
}

const priceTierSchema = new Schema<IPriceTier>(
  {
    seatType: { type: String, enum: SEAT_CATEGORIES, required: true },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const showSchema = new Schema<IShow>(
  {
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
    theater: { type: Schema.Types.ObjectId, ref: "Theater", required: true, index: true },
    screenName: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true, index: true },
    endsAt: { type: Date, required: true },
    prices: { type: [priceTierSchema], required: true },
    status: { type: String, enum: ["scheduled", "running", "completed", "cancelled"], default: "scheduled", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

showSchema.index({ movie: 1, theater: 1, startsAt: 1 });

export const Show = model<IShow>("Show", showSchema);
