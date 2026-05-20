import { paymentService } from "../services/payment.service";
import { asyncHandler } from "../utils/asyncHandler";
import { sendCreated, sendSuccess } from "../utils/response";

export const createOrder = asyncHandler(async (req, res) => {
  const result = await paymentService.createOrder(req.user!.id, req.body.bookingId);
  sendCreated(res, result, "Payment order created");
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const booking = await paymentService.verify(req.user!.id, req.body);
  sendSuccess(res, booking, "Payment verified and booking confirmed");
});
