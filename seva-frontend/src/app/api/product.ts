import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  unit: number;
  unitType: string;
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await axiosInstance.get(endpoint.products.getAll);
  return response.data?.data || response.data || [];
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await axiosInstance.get(endpoint.products.getById + id);
  return response.data?.data || response.data;
};

export const createProduct = async (
  payload: Omit<Product, "_id" | "image">,
  imageFile?: File
): Promise<Product> => {
  const formData = new FormData();

  if (imageFile) {
    formData.append("image", imageFile);
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await axiosInstance.post(endpoint.products.create, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data?.data || response.data;
};

export const updateProduct = async (
  id: string,
  payload: Partial<Omit<Product, "_id" | "image">>,
  imageFile?: File
): Promise<Product> => {
  const formData = new FormData();

  if (imageFile) {
    formData.append("image", imageFile);
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await axiosInstance.patch(endpoint.products.update + id, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data?.data || response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.products.delete + id);
};
