import express from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { roleMiddleware } from "../../middlewares/auth/role.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/login", AuthController.login);

// ── Authenticated routes ──────────────────────────────────────────────────────
router.post("/logout", authMiddleware, AuthController.logout);

router.get("/profile", authMiddleware, AuthController.getProfile);

router.patch("/change-password", authMiddleware, AuthController.changePassword);

// ── Admin-only: User management ───────────────────────────────────────────────
router.post(
  "/create-user",
  authMiddleware,
  roleMiddleware("admin"),
  AuthController.createUser
);

router.get(
  "/users",
  authMiddleware,
  permissionMiddleware("users"),
  AuthController.getUsers
);

router.get(
  "/user/:id",
  authMiddleware,
  permissionMiddleware("users"),
  AuthController.getUserById
);

router.patch(
  "/update-user/:id",
  authMiddleware,
  permissionMiddleware("users"),
  AuthController.updateUser
);

router.delete(
  "/delete-user/:id",
  authMiddleware,
  roleMiddleware("admin"),
  AuthController.deleteUser
);

export const AuthRoutes = router;