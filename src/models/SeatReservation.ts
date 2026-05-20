import { Schema, model, Types } from "mongoose";

export interface ISeatReservation {
  show: Types.ObjectId;
  seat: string;
  user: Types.ObjectId;
  hold?: Types.ObjectId;
  booking?: Types.ObjectId;
  status: "held" | "booked";
  expiresAt?: Date;
}

const seatReservationSchema = new Schema<ISeatReservation>(
  {
    show: { type: Schema.Types.ObjectId, ref: "Show", required: true, index: true },
    seat: { type: String, required: true, trim: true, uppercase: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hold: { type: Schema.Types.ObjectId, ref: "SeatHold" },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    status: { type: String, enum: ["held", "booked"], required: true, index: true },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

seatReservationSchema.index({ show: 1, seat: 1 }, { unique: true });
seatReservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, partialFilterExpression: { status: "held" } });

export const SeatReservation = model<ISeatReservation>("SeatReservation", seatReservationSchema);
