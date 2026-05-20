import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "user" | "admin";
        mongoId: Types.ObjectId;
      };
    }
  }
}
