import {Document , Types , Schema , model} from "mongoose";


export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: Types.ObjectId;
}

const Category = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      // required: true,
      // unique: true,
      lowercase: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
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

export const CategoryModel = model<ICategory>(
  "Category",
  Category
);