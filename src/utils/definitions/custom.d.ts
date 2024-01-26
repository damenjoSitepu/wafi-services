import { user } from "@/resources/user/user.type";

declare global {
  namespace Express {
    export interface Request {
      user: user.Data;
    }
  }
}