import crypto from "crypto";

export const generateBookingCode = (): string => {
  const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `BMS${Date.now().toString(36).toUpperCase()}${suffix}`;
};

