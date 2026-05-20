import { Schema, model, Types } from "mongoose";

export interface IPayment {
  booking: Types.ObjectId;
  user: Types.ObjectId;
  amount: number;
  provider: "dummy_razorpay";
  providerOrderId: string;
  providerPaymentId?: string;
  providerSignature?: string;
  status: "created" | "paid" | "failed" | "refunded";
  notes?: Record<string, string>;
  paidAt?: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    provider: { type: String, enum: ["dummy_razorpay"], default: "dummy_razorpay" },
    providerOrderId: { type: String, required: true, unique: true, index: true },
    providerPaymentId: String,
    providerSignature: String,
    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created", index: true },
    notes: { type: Map, of: String },
    paidAt: Date
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", paymentSchema);
