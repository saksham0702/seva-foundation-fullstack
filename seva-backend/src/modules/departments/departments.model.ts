import { Document, Schema, model, Types } from "mongoose";
import { ALL_PERMISSIONS, Permission } from "../auth/auth.model";

export interface IDepartment extends Document {
  name: string;
  slug: string;
  description?: string;
  permissions: Permission[];
  isDeleted: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
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

export const DepartmentModel = model<IDepartment>("Department", DepartmentSchema);
