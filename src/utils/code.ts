import crypto from "crypto";

export const generateBookingCode = (): string => {
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BMS${Date.now().toString(36).toUpperCase()}${suffix}`;
};

export const generateProviderOrderId = (): string => {
  return `order_${crypto.randomBytes(10).toString("hex")}`;
};

export const generateProviderPaymentId = (): string => {
  return `pay_${crypto.randomBytes(10).toString("hex")}`;
};

export const signDummyPayment = (orderId: string, paymentId: string, secret: string): string => {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
};
