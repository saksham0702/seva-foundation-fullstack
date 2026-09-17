import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    permissions: string[];
  };
}

/**
 * authMiddleware
 *
 * Reads the JWT from:
 *  1. HTTP-only cookie  `access_token`  (primary — browser clients)
 *  2. Authorization header `Bearer <token>`  (fallback — Postman / mobile)
 *
 * Populates `req.user` with { userId, role, permissions[] }.
 */
export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1. Cookie-first
    let token: string | undefined = (req as any).cookies?.access_token;

    // 2. Bearer fallback
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized — no token provided",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET as string
    ) as AuthRequest["user"];

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Unauthorized — invalid or expired token",
    });
  }
};