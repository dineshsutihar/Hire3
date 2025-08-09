import type { UserJWTPayload } from "../utils/jwt";
import type { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: UserJWTPayload;
      file?: Express.Multer.File;
    }
  }
}

export {};
