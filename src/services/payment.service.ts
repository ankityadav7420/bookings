import { env } from "../config/env";
import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { ApiError } from "../utils/ApiError";
import { generateProviderOrderId, generateProviderPaymentId, signDummyPayment } from "../utils/code";
import { bookingService } from "./booking.service";

export const paymentService = {
  async createOrder(userId: string, bookingId: string) {
    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) throw new ApiError(404, "Booking not found");
    if (booking.status !== "pending_payment") throw new ApiError(400, "Booking is not pending payment");

    const existing = await Payment.findOne({ booking: booking._id, status: "created" });
    if (existing) {
      return {
        payment: existing,
        checkout: {
          amount: existing.amount,
          currency: "INR",
          orderId: existing.providerOrderId,
          name: "Movie Ticket Booking",
          description: "Dummy Razorpay order"
        },
        dummySuccessPayload: this.generateSuccessPayload(existing.providerOrderId)
      };
    }

    const result = await this.createDummyRazorpayOrder(String(booking._id), userId, booking.totalAmount);
    return {
      ...result,
      dummySuccessPayload: this.generateSuccessPayload(result.payment.providerOrderId)
    };
  },

  async createDummyRazorpayOrder(bookingId: string, userId: string, amount: number) {
    const providerOrderId = generateProviderOrderId();
    const payment = await Payment.create({
      booking: bookingId,
      user: userId,
      amount,
      provider: "dummy_razorpay",
      providerOrderId,
      status: "created",
      notes: {
        checkout: "Use /api/payments/verify with success=true to simulate successful Razorpay payment."
      }
    });

    return {
      payment,
      checkout: {
        key: env.razorpayKeyId,
        amount,
        currency: "INR",
        orderId: providerOrderId,
        name: "Movie Ticket Booking",
        description: "Dummy Razorpay order"
      }
    };
  },

  generateSuccessPayload(providerOrderId: string) {
    const providerPaymentId = generateProviderPaymentId();
    const signature = signDummyPayment(providerOrderId, providerPaymentId, env.razorpayKeySecret);
    return { providerOrderId, providerPaymentId, providerSignature: signature };
  },

  isValidSignature(providerOrderId: string, providerPaymentId: string, providerSignature: string): boolean {
    const expected = signDummyPayment(providerOrderId, providerPaymentId, env.razorpayKeySecret);
    return expected === providerSignature;
  },

  async verify(userId: string, input: { providerOrderId: string; providerPaymentId: string; providerSignature: string; success?: boolean }) {
    const payment = await Payment.findOne({ providerOrderId: input.providerOrderId });
    if (!payment) throw new ApiError(404, "Payment order not found");

    if (input.success === false) {
      payment.status = "failed";
      await payment.save();
      await bookingService.failBooking(String(payment.booking));
      throw new ApiError(402, "Dummy payment failed");
    }

    if (!this.isValidSignature(input.providerOrderId, input.providerPaymentId, input.providerSignature)) {
      throw new ApiError(400, "Invalid payment signature");
    }

    return bookingService.confirmBooking(userId, input.providerOrderId, input.providerPaymentId, input.providerSignature);
  }
};
