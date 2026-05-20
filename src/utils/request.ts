import { Request } from "express";
import { ApiError } from "./ApiError";

export const getParam = (req: Request, key: string): string => {
  const value = req.params[key];
  if (!value || Array.isArray(value)) {
    throw new ApiError(400, `Invalid route parameter: ${key}`);
  }
  return value;
};
