import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export type FormType = "volunteer" | "corporate" | "career" | "support";

export type Availability =
  | "weekends"
  | "weekdays"
  | "both"
  | "flexible"
  | "fulltime"
  | "parttime";

export type ApplicationStatus =
  | "pending"
  | "contacted"
  | "approved"
  | "rejected";

export interface VolunteerCategory {
  _id: string;
  formType: FormType;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  badge?: string;
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VolunteerCategoryOption {
  _id: string;
  title: string;
  formType?: FormType;
  badge?: string;
}

export interface VolunteerApplication {
  _id: string;
  formType: FormType;
  name: string;
  email: string;
  phone: string;
  city?: string;
  category?: string | VolunteerCategory;
  selectedAreaTitle?: string;

  // Volunteer specific
  availability?: Availability;
  skills?: string;
  previousExperience?: string;
  reason?: string;

  // Corporate specific
  companyName?: string;
  contactPerson?: string;
  industry?: string;
  partnershipType?: string;
  csrFocusAreas?: string;
  partnershipGoals?: string;

  // Career specific
  positionAppliedFor?: string;
  currentLocation?: string;
  resumeUrl?: string;
  coverLetter?: string;

  // Support specific
  supportType?: string;
  address?: string;

  message?: string;
  status: ApplicationStatus;
  reviewedBy?: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

/* ─────────────────────────────────────────────────────────────
   VOLUNTEER CATEGORIES API
───────────────────────────────────────────────────────────── */

export const getVolunteerCategories = async (
  formType?: FormType
): Promise<VolunteerCategory[]> => {
  const response = await axiosInstance.get(endpoint.volunteerCategories.getAll, {
    params: formType ? { formType } : {},
  });
  return response.data?.data || response.data || [];
};

export const getPublicVolunteerCategories = async (
  formType: FormType = "volunteer"
): Promise<VolunteerCategory[]> => {
  const response = await axiosInstance.get(endpoint.volunteerCategories.getPublic, {
    params: { formType },
  });
  return response.data?.data || response.data || [];
};

export const getVolunteerCategoryOptions = async (
  formType?: FormType
): Promise<VolunteerCategoryOption[]> => {
  const response = await axiosInstance.get(endpoint.volunteerCategories.getOptions, {
    params: formType ? { formType } : {},
  });
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

export const getVolunteerApplications = async (
  filters?:
    | {
        status?: string;
        category?: string;
        formType?: FormType;
      }
    | FormType
): Promise<VolunteerApplication[]> => {
  let params: Record<string, any> = {};
  if (typeof filters === "string") {
    params = { formType: filters };
  } else if (filters) {
    params = filters;
  }

  const response = await axiosInstance.get(endpoint.volunteerApplications.getAll, {
    params,
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
