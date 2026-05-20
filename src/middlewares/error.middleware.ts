import { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500;
  const payload = {
    success: false,
    message: error.message || "Internal server error",
    details: error instanceof ApiError ? error.details : undefined
  };

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json(payload);
};
