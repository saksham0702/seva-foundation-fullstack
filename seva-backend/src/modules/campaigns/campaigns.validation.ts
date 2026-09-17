import { z } from "zod";

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    images: z.array(z.string()).min(1, "At least one image is required"),
    description: z.string().min(1, "Description is required"),
    content: z.string().min(1, "Content is required"),
    location: z.string().min(1, "Location is required"),
    category: z.string().min(1, "Category is required"),
    createdBy: z.string().min(1, "createdBy is required"),
    updatedBy: z.string().min(1, "updatedBy is required"),
  }),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    content: z.string().optional(),
    location: z.string().optional(),
    category: z.string().optional(),
    updatedBy: z.string().optional(),
  }),
});

export const CampaignValidation = {
  createCampaignSchema,
  updateCampaignSchema,
};
