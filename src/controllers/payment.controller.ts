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

export const failPayment = asyncHandler(async (req, res) => {
  const result = await paymentService.fail(req.user!.id, req.body.providerOrderId);
  sendSuccess(res, result, "Payment cancelled and seats released");
});

export const razorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body);
  const result = await paymentService.handleWebhook(rawBody, typeof signature === "string" ? signature : undefined);
  sendSuccess(res, result, "Webhook processed");
});
