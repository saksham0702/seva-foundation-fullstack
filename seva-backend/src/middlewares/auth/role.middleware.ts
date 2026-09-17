import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

/**
 * roleMiddleware
 *
 * Usage: roleMiddleware("admin")
 *        roleMiddleware("admin", "manager")  ← user must have ONE of these roles
 */
export const roleMiddleware =
  (...allowedRoles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden — required role: ${allowedRoles.join(" or ")}`,
      });
      return;
    }

    next();
  };