import type { UserTokenPayload } from "../modules/auth/utils/token.js";

declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}

export {};
