import { Schema, model, Types } from "mongoose";

export interface IBooking {
  bookingCode: string;
  user: Types.ObjectId;
  show: Types.ObjectId;
  movie: Types.ObjectId;
  theater: Types.ObjectId;
  seats: string[];
  amount: number;
  convenienceFee: number;
  totalAmount: number;
  status: "pending_payment" | "confirmed" | "cancelled" | "failed";
  payment?: Types.ObjectId;
  confirmedAt?: Date;
  cancelledAt?: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    show: { type: Schema.Types.ObjectId, ref: "Show", required: true, index: true },
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    theater: { type: Schema.Types.ObjectId, ref: "Theater", required: true },
    seats: [{ type: String, required: true, trim: true, uppercase: true }],
    amount: { type: Number, required: true, min: 0 },
    convenienceFee: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending_payment", "confirmed", "cancelled", "failed"],
      default: "pending_payment",
      index: true
    },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    confirmedAt: Date,
    cancelledAt: Date
  },
  { timestamps: true }
);

export const Booking = model<IBooking>("Booking", bookingSchema);
