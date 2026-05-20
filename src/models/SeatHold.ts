import { Schema, model, Types } from "mongoose";

export interface ISeatHold {
  user: Types.ObjectId;
  show: Types.ObjectId;
  seats: string[];
  status: "held" | "booked" | "expired" | "released";
  expiresAt: Date;
  booking?: Types.ObjectId;
}

const seatHoldSchema = new Schema<ISeatHold>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    show: { type: Schema.Types.ObjectId, ref: "Show", required: true, index: true },
    seats: [{ type: String, required: true, trim: true, uppercase: true }],
    status: { type: String, enum: ["held", "booked", "expired", "released"], default: "held", index: true },
    expiresAt: { type: Date, required: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" }
  },
  { timestamps: true }
);

seatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SeatHold = model<ISeatHold>("SeatHold", seatHoldSchema);
