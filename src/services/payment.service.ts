import { env } from "../config/env";
import { Payment } from "../models/Payment";
import { generateProviderOrderId, generateProviderPaymentId, signDummyPayment } from "../utils/code";

export const paymentService = {
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
  }
};
