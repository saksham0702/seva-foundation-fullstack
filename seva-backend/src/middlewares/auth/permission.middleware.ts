import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

/**
 * permissionMiddleware
 *
 * Usage: permissionMiddleware("campaigns")
 *        permissionMiddleware("campaigns", "donations")  ← user must have ALL listed
 *
 * Admin role bypasses all permission checks automatically.
 */
export const permissionMiddleware =
  (...requiredPermissions: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Admins have access to everything
    if (user.role === "admin") {
      next();
      return;
    }

    const userPermissions = user.permissions || [];
    const hasPermission = (reqPerm: string) => {
      if (userPermissions.includes(reqPerm)) return true;
      if (
        (reqPerm === "volunteer-applications" || reqPerm === "volunteer-categories") &&
        userPermissions.includes("volunteers")
      ) {
        return true;
      }
      return false;
    };
    const hasAll = requiredPermissions.every(hasPermission);

    if (!hasAll) {
      res.status(403).json({
        success: false,
        message: `Forbidden — you don't have access to: ${requiredPermissions.join(", ")}`,
      });
      return;
    }

    next();
  };