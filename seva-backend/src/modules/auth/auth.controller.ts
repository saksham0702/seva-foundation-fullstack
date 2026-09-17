import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendResponse } from "../../utils/apiResponse";
import { AuthService } from "./auth.service";
import { AuthRequest } from "../../middlewares/auth/auth.middleware";

// ── Login ─────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password, res); // res passed to set cookie

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: result,
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = asyncHandler(async (_req: Request, res: Response) => {
  AuthService.logout(res);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

// ── Get profile (me) ──────────────────────────────────────────────────────────
const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await AuthService.getProfile(req.user!.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile fetched successfully",
    data: result,
  });
});

// ── Create user ───────────────────────────────────────────────────────────────
const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role, permissions } = req.body;
  const result = await AuthService.createUser(
    { name, email, password, role, permissions },
    req.user?.userId
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User created successfully",
    data: result,
  });
});

// ── Get all users ─────────────────────────────────────────────────────────────
const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const result = await AuthService.getUsers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

// ── Get single user ───────────────────────────────────────────────────────────
const getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const result = await AuthService.getUserById(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

// ── Update user ───────────────────────────────────────────────────────────────
const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const result = await AuthService.updateUser(
    id,
    req.body,
    req.user!.userId
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User updated successfully",
    data: result,
  });
});

// ── Change password ───────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  await AuthService.changePassword(req.user!.userId, oldPassword, newPassword);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully",
    data: null,
  });
});

// ── Delete user ───────────────────────────────────────────────────────────────
const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const result = await AuthService.deleteUser(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted successfully",
    data: result,
  });
});

export const AuthController = {
  login,
  logout,
  getProfile,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
};