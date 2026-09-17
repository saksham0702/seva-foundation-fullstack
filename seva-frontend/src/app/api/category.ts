import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export interface Category {
  _id: string;
  name: string;
  slug?: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await axiosInstance.get(endpoint.categories.getAll);
  return response.data?.data || response.data || [];
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await axiosInstance.get(endpoint.categories.getById + id);
  return response.data?.data || response.data;
};

/**
 * Auto-generates slug from name if not provided.
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const createCategory = async (payload: { name: string; slug?: string }): Promise<Category> => {
  const body = {
    name: payload.name,
    slug: payload.slug || generateSlug(payload.name),
  };
  const response = await axiosInstance.post(endpoint.categories.create, body);
  return response.data?.data || response.data;
};

export const updateCategory = async (
  id: string,
  payload: { name: string; slug?: string }
): Promise<Category> => {
  const body = {
    name: payload.name,
    slug: payload.slug || generateSlug(payload.name),
  };
  const response = await axiosInstance.patch(endpoint.categories.update + id, body);
  return response.data?.data || response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.categories.delete + id);
};
