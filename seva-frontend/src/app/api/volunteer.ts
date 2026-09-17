import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export type Availability =
  | "weekends"
  | "weekdays"
  | "both"
  | "flexible"
  | "fulltime";

export type ApplicationStatus =
  | "pending"
  | "contacted"
  | "approved"
  | "rejected";

export interface VolunteerCategory {
  _id: string;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VolunteerCategoryOption {
  _id: string;
  title: string;
}

export interface VolunteerApplication {
  _id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  category: string | VolunteerCategory;
  availability: Availability;
  message?: string;
  status: ApplicationStatus;
  reviewedBy?: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

/* ─────────────────────────────────────────────────────────────
   VOLUNTEER CATEGORIES API
───────────────────────────────────────────────────────────── */

export const getVolunteerCategories = async (): Promise<VolunteerCategory[]> => {
  const response = await axiosInstance.get(endpoint.volunteerCategories.getAll);
  return response.data?.data || response.data || [];
};

export const getPublicVolunteerCategories = async (): Promise<VolunteerCategory[]> => {
  const response = await axiosInstance.get(endpoint.volunteerCategories.getPublic);
  return response.data?.data || response.data || [];
};

export const getVolunteerCategoryOptions = async (): Promise<VolunteerCategoryOption[]> => {
  const response = await axiosInstance.get(endpoint.volunteerCategories.getOptions);
  return response.data?.data || response.data || [];
};

export const getVolunteerCategoryById = async (id: string): Promise<VolunteerCategory> => {
  const response = await axiosInstance.get(endpoint.volunteerCategories.getById + id);
  return response.data?.data || response.data;
};

export const createVolunteerCategory = async (
  payload: FormData | Partial<VolunteerCategory>
): Promise<VolunteerCategory> => {
  const headers =
    payload instanceof FormData
      ? { "Content-Type": "multipart/form-data" }
      : undefined;

  const response = await axiosInstance.post(
    endpoint.volunteerCategories.create,
    payload,
    { headers }
  );
  return response.data?.data || response.data;
};

export const updateVolunteerCategory = async (
  id: string,
  payload: FormData | Partial<VolunteerCategory>
): Promise<VolunteerCategory> => {
  const headers =
    payload instanceof FormData
      ? { "Content-Type": "multipart/form-data" }
      : undefined;

  const response = await axiosInstance.patch(
    endpoint.volunteerCategories.update + id,
    payload,
    { headers }
  );
  return response.data?.data || response.data;
};

export const deleteVolunteerCategory = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.volunteerCategories.delete + id);
};

/* ─────────────────────────────────────────────────────────────
   VOLUNTEER APPLICATIONS API
───────────────────────────────────────────────────────────── */

export const getVolunteerApplications = async (filters?: {
  status?: string;
  category?: string;
}): Promise<VolunteerApplication[]> => {
  const response = await axiosInstance.get(endpoint.volunteerApplications.getAll, {
    params: filters,
  });
  return response.data?.data || response.data || [];
};

export const getVolunteerApplicationById = async (
  id: string
): Promise<VolunteerApplication> => {
  const response = await axiosInstance.get(
    endpoint.volunteerApplications.getById + id
  );
  return response.data?.data || response.data;
};

export const createVolunteerApplication = async (
  payload: Partial<VolunteerApplication>
): Promise<VolunteerApplication> => {
  const response = await axiosInstance.post(
    endpoint.volunteerApplications.create,
    payload
  );
  return response.data?.data || response.data;
};

export const updateVolunteerApplicationStatus = async (
  id: string,
  status: ApplicationStatus
): Promise<VolunteerApplication> => {
  const response = await axiosInstance.patch(
    endpoint.volunteerApplications.updateStatus(id),
    { status }
  );
  return response.data?.data || response.data;
};

export const deleteVolunteerApplication = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.volunteerApplications.delete + id);
};
