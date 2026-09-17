import { z } from "zod";

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    image: z.string().min(1, "Image URL is required"),
    price: z.number().min(0, "Price is required"),
    unit: z.number().min(1, "Unit is required"),
    unitType: z.string().min(1, "Unit Type is required"),
    createdBy: z.string().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    price: z.number().optional(),
    unit: z.number().optional(),
    unitType: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const ProductValidation = {
  createProductSchema,
  updateProductSchema,
};
