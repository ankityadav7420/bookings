import { Schema, model } from "mongoose";

export interface ITokenBlacklist {
  token: string;
  expiresAt: Date;
}

const tokenBlacklistSchema = new Schema<ITokenBlacklist>(
  {
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TokenBlacklist = model<ITokenBlacklist>("TokenBlacklist", tokenBlacklistSchema);
