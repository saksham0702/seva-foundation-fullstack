import bcrypt from "bcrypt";
import { Response } from "express";
import { UserModel } from "./auth.model";
import { generateToken } from "./auth.utils";
import { DepartmentModel } from "../departments/departments.model";

// ── Cookie config ─────────────────────────────────────────────────────────────
const COOKIE_NAME = "access_token";
const COOKIE_OPTIONS = {
  httpOnly: true,            // not accessible via document.cookie
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "lax" as const, // change to "none" if frontend & backend on different domains in prod
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: "/",
};

// ── Login ─────────────────────────────────────────────────────────────────────
const login = async (email: string, password: string, res: Response) => {
  const user = await UserModel.findOne({
    email: email.toLowerCase().trim(),
    isDeleted: false,
  }).populate("department");

  if (!user) throw new Error("User not found");

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) throw new Error("Invalid credentials");

  // Inherit permissions from assigned department
  const deptPermissions = ((user.department as any)?.permissions || []) as string[];
  const userDirectPermissions = (user.permissions || []) as string[];
  const effectivePermissions = Array.from(
    new Set([...userDirectPermissions, ...deptPermissions])
  ) as any[];

  const token = generateToken({
    userId: user._id,
    role: user.role,
    permissions: effectivePermissions,
  });

  // Set HTTP-only cookie
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      permissions: effectivePermissions,
    },
  };
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = (res: Response) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
};

// ── Create user ───────────────────────────────────────────────────────────────
const createUser = async (payload: any, adminId?: string) => {
  const email = payload.email?.toLowerCase().trim();
  const existingUser = await UserModel.findOne({ email });

  let permissions = payload.permissions || [];

  // Inherit permissions if department is provided
  if (payload.department) {
    const dept = await DepartmentModel.findById(payload.department);
    if (dept && dept.permissions?.length > 0) {
      permissions = Array.from(new Set([...permissions, ...dept.permissions]));
    }
  }

  if (existingUser) {
    if (!existingUser.isDeleted) {
      throw new Error("User with this email already exists");
    }

    // If user was soft-deleted, revive and update their account
    existingUser.name = payload.name;
    existingUser.password = payload.password;
    existingUser.role = payload.role;
    existingUser.department = payload.department;
    existingUser.permissions = permissions;
    existingUser.isDeleted = false;
    if (adminId) existingUser.createdBy = adminId as any;

    await existingUser.save();
    return UserModel.findById(existingUser._id)
      .populate("department", "name slug permissions")
      .select("-password");
  }

  const created = await UserModel.create({
    ...payload,
    email,
    permissions,
    ...(adminId ? { createdBy: adminId } : {}),
  });

  return UserModel.findById(created._id)
    .populate("department", "name slug permissions")
    .select("-password");
};

// ── Get profile ───────────────────────────────────────────────────────────────
const getProfile = async (userId: string) => {
  return UserModel.findById(userId)
    .populate("department", "name slug permissions")
    .select("-password");
};

// ── Get all users ─────────────────────────────────────────────────────────────
const getUsers = async () => {
  return UserModel.find({ isDeleted: false })
    .populate("department", "name slug permissions")
    .select("-password")
    .sort({ createdAt: -1 });
};

// ── Get single user ───────────────────────────────────────────────────────────
const getUserById = async (id: string) => {
  return UserModel.findById(id)
    .populate("department", "name slug permissions")
    .select("-password");
};

// ── Update user ───────────────────────────────────────────────────────────────
const updateUser = async (id: string, payload: any, updatedBy: string) => {
  if (payload.password) {
    payload.password = await bcrypt.hash(
      payload.password,
      Number(process.env.BCRYPT_SALT_ROUNDS) || 10
    );
  }

  // If department changed or provided, inherit permissions
  if (payload.department) {
    const dept = await DepartmentModel.findById(payload.department);
    if (dept && dept.permissions?.length > 0) {
      const existingPermissions = payload.permissions || [];
      payload.permissions = Array.from(new Set([...existingPermissions, ...dept.permissions]));
    }
  }

  return UserModel.findByIdAndUpdate(
    id,
    { ...payload, updatedBy },
    { new: true }
  )
    .populate("department", "name slug permissions")
    .select("-password");
};

// ── Change password ───────────────────────────────────────────────────────────
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new Error("User not found");

  const matched = await bcrypt.compare(oldPassword, user.password);
  if (!matched) throw new Error("Old password is incorrect");

  user.password = newPassword;
  await user.save();

  return null;
};

// ── Soft-delete user ──────────────────────────────────────────────────────────
const deleteUser = async (id: string) => {
  return UserModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

export const AuthService = {
  login,
  logout,
  createUser,
  getProfile,
  getUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
};
