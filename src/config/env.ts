import dotenv from "dotenv";

dotenv.config();

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const optionalEnv = (key: string, fallback: string): string => process.env[key] || fallback;

const numberEnv = (key: string, fallback: number): number => {
  const raw = process.env[key];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid numeric env var: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: optionalEnv("NODE_ENV", "development"),
  port: numberEnv("PORT", 5000),
  mongoUri: requireEnv("MONGO_URI"),
  jwtSecret: requireEnv("JWT_SECRET"),
  jwtExpiresIn: optionalEnv("JWT_EXPIRES_IN", "7d"),
  clientUrl: optionalEnv("CLIENT_URL", "http://localhost:3000"),
  razorpayKeyId: requireEnv("RAZORPAY_KEY_ID"),
  razorpayKeySecret: requireEnv("RAZORPAY_KEY_SECRET"),
  smtp: {
    host: process.env.SMTP_HOST,
    port: numberEnv("SMTP_PORT", 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: optionalEnv("SMTP_FROM", "no-reply@bookings.local")
  },
  smsProvider: optionalEnv("SMS_PROVIDER", "dummy")
};
