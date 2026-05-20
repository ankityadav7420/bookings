import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { bookingService } from "../services/booking.service";
import { paymentService } from "../services/payment.service";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const createOrder = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.body.bookingId, user: req.user!.id });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status !== "pending_payment") throw new ApiError(400, "Booking is not pending payment");

  const existing = await Payment.findOne({ booking: booking._id, status: "created" });
  if (existing) {
    res.json({
      success: true,
      data: {
        payment: existing,
        checkout: {
          amount: existing.amount,
          currency: "INR",
          orderId: existing.providerOrderId,
          name: "Movie Ticket Booking",
          description: "Dummy Razorpay order"
        },
        dummySuccessPayload: paymentService.generateSuccessPayload(existing.providerOrderId)
      }
    });
    return;
  }

  const result = await paymentService.createDummyRazorpayOrder(String(booking._id), req.user!.id, booking.totalAmount);
  res.status(201).json({
    success: true,
    data: {
      ...result,
      dummySuccessPayload: paymentService.generateSuccessPayload(result.payment.providerOrderId)
    }
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { providerOrderId, providerPaymentId, providerSignature, success } = req.body;
  const payment = await Payment.findOne({ providerOrderId });
  if (!payment) throw new ApiError(404, "Payment order not found");

  if (success === false) {
    payment.status = "failed";
    await payment.save();
    await bookingService.failBooking(String(payment.booking));
    throw new ApiError(402, "Dummy payment failed");
  }

  if (!paymentService.isValidSignature(providerOrderId, providerPaymentId, providerSignature)) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const booking = await bookingService.confirmBooking(req.user!.id, providerOrderId, providerPaymentId, providerSignature);
  res.json({ success: true, data: booking });
});
