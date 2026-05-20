import { ErrorRequestHandler, RequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = error instanceof ApiError ? error.statusCode : 500;
  let message = error.message || "Internal server error";
  let details = error instanceof ApiError ? error.details : undefined;

  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid resource id";
  }

  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    details = Object.values(error.errors).map((item) => item.message);
  }

  if (error?.code === 11000) {
    statusCode = 409;
    message = "Duplicate value already exists";
    details = error.keyValue;
  }

  if (error instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Authentication token expired";
  }

  if (error instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  const payload = {
    success: false,
    message,
    data: null,
    details,
    requestId: res.getHeader("x-request-id")
  };

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    ...payload,
    stack: env.nodeEnv === "production" ? undefined : error.stack
  });
};
