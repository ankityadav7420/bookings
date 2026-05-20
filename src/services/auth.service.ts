import crypto from "crypto";
import { TokenBlacklist } from "../models/TokenBlacklist";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { signToken } from "../utils/jwt";
import { notificationService } from "./notification.service";

const toAuthResponse = (user: any) => ({
  token: signToken({ id: String(user._id), role: user.role }),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    role: user.role
  }
});

export const authService = {
  async register(input: { name: string; email: string; mobile: string; password: string }) {
    const existing = await User.findOne({ $or: [{ email: input.email }, { mobile: input.mobile }] });
    if (existing) throw new ApiError(409, "Email or mobile already exists");

    const user = await User.create({ ...input, role: "user" });
    return toAuthResponse(user);
  },

  async login(input: { emailOrMobile: string; password: string }) {
    const user = await User.findOne({
      $or: [{ email: input.emailOrMobile.toLowerCase() }, { mobile: input.emailOrMobile }]
    }).select("+password");

    if (!user || !(await (user as any).comparePassword(input.password))) {
      throw new ApiError(401, "Invalid credentials");
    }
    if (!user.isActive) throw new ApiError(403, "User account is inactive");

    return toAuthResponse(user);
  },

  async getProfile(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new ApiError(404, "User not found");
    return user;
  },

  async logout(token: string) {
    await TokenBlacklist.updateOne(
      { token },
      { token, expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000) },
      { upsert: true }
    );
  },

  async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).select(
      "+passwordResetTokenHash +passwordResetExpiresAt"
    );

    if (!user) return;

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await notificationService.sendEmail({
      email: user.email,
      subject: "Password reset request",
      message: `Use this password reset token within 15 minutes: ${resetToken}`
    });
  },

  async resetPassword(input: { token: string; password: string }) {
    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
      isActive: true
    }).select("+password +passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) throw new ApiError(400, "Invalid or expired reset token");

    user.password = input.password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
  }
};
