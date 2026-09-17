import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export interface GalleryItem {
  _id: string;
  imageUrl: string;
  title?: string;
  caption?: string;
  category?: string;
  isActive: boolean;
  order: number;
  isDeleted: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GalleryMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface GalleryResponse {
  data: GalleryItem[];
  meta: GalleryMeta;
  message?: string;
}

export interface GalleryQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  status?: "all" | "active" | "inactive";
  search?: string;
}

export const getPublicGallery = async (
  params?: GalleryQueryParams
): Promise<GalleryResponse> => {
  const response = await axiosInstance.get(endpoint.gallery.getPublic, {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 50,
      category: params?.category,
    },
  });

  return {
    data: response.data?.data || [],
    meta: response.data?.meta || {
      page: 1,
      limit: 50,
      total: response.data?.data?.length || 0,
      totalPage: 1,
    },
    message: response.data?.message,
  };
};

export const getAdminGallery = async (
  params?: GalleryQueryParams
): Promise<GalleryResponse> => {
  const response = await axiosInstance.get(endpoint.gallery.getAdmin, {
    params: {
      page: params?.page || 1,
      limit: params?.limit || 50,
      status: params?.status === "all" ? undefined : params?.status,
      search: params?.search,
      category: params?.category,
    },
  });

  return {
    data: response.data?.data || [],
    meta: response.data?.meta || {
      page: 1,
      limit: 50,
      total: response.data?.data?.length || 0,
      totalPage: 1,
    },
    message: response.data?.message,
  };
};

export const uploadGalleryImages = async (
  formData: FormData
): Promise<GalleryItem[]> => {
  const response = await axiosInstance.post(endpoint.gallery.upload, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data?.data || [];
};

export const toggleGalleryStatus = async (
  id: string,
  isActive?: boolean
): Promise<GalleryItem> => {
  const response = await axiosInstance.patch(
    endpoint.gallery.toggleStatus(id),
    { isActive }
  );
  return response.data?.data || response.data;
};

export const deleteGalleryImage = async (id: string): Promise<boolean> => {
  await axiosInstance.delete(endpoint.gallery.delete(id));
  return true;
};
