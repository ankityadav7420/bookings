import { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T | null;
  meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(
  res: Response,
  data: T | null = null,
  message = "Success",
  statusCode = 200,
  meta?: Record<string, unknown>
) => {
  const payload: SuccessResponse<T> = {
    success: true,
    message,
    data
  };

  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendCreated = <T>(res: Response, data: T, message = "Created") => {
  return sendSuccess(res, data, message, 201);
};
