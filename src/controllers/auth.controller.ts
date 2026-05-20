import { authService } from "../services/auth.service";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { sendCreated, sendSuccess } from "../utils/response";

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  sendCreated(res, data, "User registered successfully");
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  sendSuccess(res, data, "Logged in successfully");
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user!.id);
  sendSuccess(res, user);
});

export const logout = asyncHandler(async (req, res) => {
  if (!req.authToken) throw new ApiError(401, "Authentication token is required");
  await authService.logout(req.authToken);
  sendSuccess(res, null, "Logged out successfully");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendSuccess(res, null, "If that email exists, a reset token has been sent");
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, null, "Password reset successfully");
});
