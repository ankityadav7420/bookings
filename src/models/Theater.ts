import { Schema, model, Types } from "mongoose";
import { SEAT_CATEGORIES, SeatCategory } from "../constants/enums";

export interface ISeat {
  row: string;
  number: number;
  type: SeatCategory;
  isActive: boolean;
}

export interface IScreen {
  name: string;
  seats: ISeat[];
}

export interface ITheater {
  name: string;
  city: string;
  address: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  facilities: string[];
  screens: IScreen[];
  isActive: boolean;
  createdBy?: Types.ObjectId;
}

const seatSchema = new Schema<ISeat>(
  {
    row: { type: String, required: true, trim: true, uppercase: true },
    number: { type: Number, required: true, min: 1 },
    type: { type: String, enum: SEAT_CATEGORIES, required: true },
    isActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const screenSchema = new Schema<IScreen>({
  name: { type: String, required: true, trim: true },
  seats: { type: [seatSchema], default: [] }
});

const theaterSchema = new Schema<ITheater>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    location: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 }
    },
    facilities: [{ type: String, trim: true }],
    screens: { type: [screenSchema], default: [] },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const Theater = model<ITheater>("Theater", theaterSchema);
