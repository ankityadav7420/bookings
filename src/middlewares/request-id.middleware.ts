import crypto from "crypto";
import { RequestHandler } from "express";

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.headers["x-request-id"];
  const id = Array.isArray(incoming) ? incoming[0] : incoming;
  const value = id || crypto.randomUUID();
  res.setHeader("x-request-id", value);
  req.headers["x-request-id"] = value;
  next();
};
