import { RequestHandler } from "express";
import { Types } from "mongoose";
import { TokenBlacklist } from "../models/TokenBlacklist";
import { UserRole } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { verifyToken } from "../utils/jwt";

export const authenticate: RequestHandler = (req, _res, next) => {
  void (async () => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

    if (!token) {
      throw new ApiError(401, "Authentication token is required");
    }

    const blacklisted = await TokenBlacklist.exists({ token });
    if (blacklisted) {
      throw new ApiError(401, "Token has been logged out");
    }

    const payload = verifyToken(token);
    req.authToken = token;
    req.user = {
      id: payload.id,
      role: payload.role,
      mongoId: new Types.ObjectId(payload.id)
    };
    next();
  })().catch(next);
};

export const authorize =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
  };
