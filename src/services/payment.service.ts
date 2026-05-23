import crypto from "crypto";
import { env } from "../config/env";
import { razorpay } from "../config/razorpay";
import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { ApiError } from "../utils/ApiError";
import { bookingService } from "./booking.service";

const toPaise = (amountInRupees: number): number => Math.round(amountInRupees * 100);

export const paymentService = {
  async createOrder(userId: string, bookingId: string) {
    const booking = await Booking.findOne({ _id: bookingId, user: userId });
    if (!booking) throw new ApiError(404, "Booking not found");
    if (booking.status !== "pending_payment") throw new ApiError(400, "Booking is not pending payment");

    const existing = await Payment.findOne({ booking: booking._id });
    if (existing?.status === "created") {
      return this.buildCheckoutResponse(existing);
    }
    if (existing?.status === "paid") throw new ApiError(409, "Booking is already paid");
    if (existing) throw new ApiError(400, "Payment can no longer be created for this booking");

    const amountPaise = toPaise(booking.totalAmount);
    const razorpayOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: String(booking._id),
      notes: {
        bookingId: String(booking._id),
        userId
      }
    });

    try {
      const payment = await Payment.create({
        booking: booking._id,
        user: userId,
        amount: booking.totalAmount,
        amountPaise,
        provider: "razorpay",
        providerOrderId: razorpayOrder.id,
        status: "created"
      });

      return this.buildCheckoutResponse(payment);
    } catch (error: any) {
      if (error?.code !== 11000) throw error;
      const payment = await Payment.findOne({ booking: booking._id, status: "created" });
      if (!payment) throw new ApiError(409, "Payment order already exists");
      return this.buildCheckoutResponse(payment);
    }
  },

  buildCheckoutResponse(payment: InstanceType<typeof Payment>) {
    return {
      payment,
      checkout: {
        key: env.razorpayKeyId,
        amount: payment.amountPaise,
        currency: "INR",
        orderId: payment.providerOrderId,
        name: "Movie Ticket Booking",
        description: "Movie tickets"
      }
    };
  },

  verifyPaymentSignature(providerOrderId: string, providerPaymentId: string, providerSignature: string): boolean {
    const body = `${providerOrderId}|${providerPaymentId}`;
    const expected = crypto.createHmac("sha256", env.razorpayKeySecret).update(body).digest("hex");
    return expected === providerSignature;
  },

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!env.razorpayWebhookSecret) return false;
    const expected = crypto.createHmac("sha256", env.razorpayWebhookSecret).update(rawBody).digest("hex");
    return expected === signature;
  },

  async verify(userId: string, input: { providerOrderId: string; providerPaymentId: string; providerSignature: string }) {
    const payment = await Payment.findOne({ providerOrderId: input.providerOrderId });
    if (!payment) throw new ApiError(404, "Payment order not found");
    if (String(payment.user) !== userId) throw new ApiError(403, "Payment does not belong to this user");

    if (!this.verifyPaymentSignature(input.providerOrderId, input.providerPaymentId, input.providerSignature)) {
      throw new ApiError(400, "Invalid payment signature");
    }

    return bookingService.confirmBooking(userId, input.providerOrderId, input.providerPaymentId, input.providerSignature);
  },

  async fail(userId: string, providerOrderId: string) {
    const payment = await Payment.findOne({ providerOrderId });
    if (!payment) throw new ApiError(404, "Payment order not found");
    if (String(payment.user) !== userId) throw new ApiError(403, "Payment does not belong to this user");
    if (payment.status === "paid") throw new ApiError(409, "Payment is already completed");

    if (payment.status === "created") {
      await Payment.updateOne({ _id: payment._id, status: "created" }, { status: "failed" });
      await bookingService.failBooking(String(payment.booking));
    }

    return { released: true };
  },

  async handleWebhook(rawBody: string, signature: string | undefined) {
    if (!env.razorpayWebhookSecret) {
      throw new ApiError(503, "Webhook secret is not configured");
    }
    if (!signature || !this.verifyWebhookSignature(rawBody, signature)) {
      throw new ApiError(400, "Invalid webhook signature");
    }

    const event = JSON.parse(rawBody) as {
      event: string;
      payload: {
        payment?: { entity: { id: string; order_id: string; status: string } };
      };
    };

    const paymentEntity = event.payload.payment?.entity;
    if (!paymentEntity) return { handled: false };

    const providerOrderId = paymentEntity.order_id;
    const providerPaymentId = paymentEntity.id;
    const payment = await Payment.findOne({ providerOrderId });
    if (!payment) return { handled: false };

    if (event.event === "payment.captured" && paymentEntity.status === "captured") {
      if (payment.status === "paid") return { handled: true, duplicate: true };

      const providerSignature = crypto
        .createHmac("sha256", env.razorpayKeySecret)
        .update(`${providerOrderId}|${providerPaymentId}`)
        .digest("hex");

      await bookingService.confirmBooking(String(payment.user), providerOrderId, providerPaymentId, providerSignature);
      return { handled: true, status: "confirmed" };
    }

    if (event.event === "payment.failed") {
      if (payment.status === "created") {
        await Payment.updateOne({ _id: payment._id, status: "created" }, { status: "failed" });
        await bookingService.failBooking(String(payment.booking));
      }
      return { handled: true, status: "failed" };
    }

    return { handled: false };
  }
};
