import { Document, Types, Schema, model } from "mongoose";
import bcrypt from "bcrypt";

// ── All module permission keys ────────────────────────────────────────────────
export const ALL_PERMISSIONS = [
  "campaigns",
  "donations",
  "marketing",
  "cms",
  "users",
  "certificates",
  "departments",
  "crm",
  "signatures",
  "volunteers",
  "volunteer-applications",
  "volunteer-categories",
  "gallery",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
  department?: Types.ObjectId;
  permissions: Permission[];
  isDeleted: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },

    permissions: {
      type: [String],
      enum: ALL_PERMISSIONS,
      default: [],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(
    this.password,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10
  );
});

export const UserModel = model<IUser>("User", UserSchema);