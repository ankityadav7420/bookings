import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      authToken?: string;
      user?: {
        id: string;
        role: "user" | "admin";
        mongoId: Types.ObjectId;
      };
    }
  }
}
