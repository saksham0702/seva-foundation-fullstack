import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional(),
    createdBy: z.string().min(1, "createdBy is required (User ID)"),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    description: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const CategoryValidation = {
  createCategorySchema,
  updateCategorySchema,
};
