import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { signToken } from "../utils/jwt";

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

export const register = asyncHandler(async (req, res) => {
  const { name, email, mobile, password } = req.body;
  const existing = await User.findOne({ $or: [{ email }, { mobile }] });
  if (existing) throw new ApiError(409, "Email or mobile already exists");

  const user = await User.create({ name, email, mobile, password, role: "user" });
  res.status(201).json({ success: true, data: toAuthResponse(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { emailOrMobile, password } = req.body;
  const user = await User.findOne({
    $or: [{ email: emailOrMobile.toLowerCase() }, { mobile: emailOrMobile }]
  }).select("+password");

  if (!user || !(await (user as any).comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }
  if (!user.isActive) throw new ApiError(403, "User account is inactive");

  res.json({ success: true, data: toAuthResponse(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.id).select("-password");
  res.json({ success: true, data: user });
});
