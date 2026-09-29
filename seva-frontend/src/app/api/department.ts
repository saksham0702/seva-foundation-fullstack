import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export const PERMISSION_OPTIONS = [
  { key: "campaigns", label: "Campaigns & Fundraising", description: "Create, edit, and publish campaigns" },
  { key: "donations", label: "Donations & Payments", description: "View transactions, donor receipts, and reports" },
  { key: "volunteers", label: "Volunteers Overview", description: "Manage volunteer roster and activities" },
  { key: "volunteer-applications", label: "Volunteer Applications", description: "Review and process incoming volunteer signups" },
  { key: "volunteer-categories", label: "Volunteer Categories", description: "Manage volunteer roles, badges & skills" },
  { key: "certificates", label: "Certificates & 80G", description: "Generate, verify, and manage certificates" },
  { key: "signatures", label: "Digital Signatures", description: "Manage authorized digital signatures and organization seal" },
  { key: "cms", label: "Content Management (CMS)", description: "Edit dynamic pages, sections, and blogs" },
  { key: "gallery", label: "Media Gallery", description: "Upload, organize, and toggle gallery images" },
  { key: "marketing", label: "Marketing & Campaigns", description: "Email & WhatsApp marketing tools and logs" },
  { key: "crm", label: "Donor CRM & Leads", description: "Follow up with unpaid and failed payment leads" },
  { key: "users", label: "User Management", description: "Create staff accounts and assign permissions" },
  { key: "departments", label: "Departments Management", description: "Create departments and configure role permissions" },
] as const;

export interface Department {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isDeleted: boolean;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const getDepartments = async (): Promise<Department[]> => {
  const response = await axiosInstance.get(endpoint.departments.getAll);
  return response.data?.data || response.data || [];
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  const response = await axiosInstance.get(endpoint.departments.getById + id);
  return response.data?.data || response.data;
};

export const createDepartment = async (payload: {
  name: string;
  description?: string;
  permissions: string[];
}): Promise<Department> => {
  const response = await axiosInstance.post(endpoint.departments.create, payload);
  return response.data?.data || response.data;
};

export const updateDepartment = async (
  id: string,
  payload: Partial<Department>
): Promise<Department> => {
  const response = await axiosInstance.patch(
    endpoint.departments.update + id,
    payload
  );
  return response.data?.data || response.data;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await axiosInstance.delete(endpoint.departments.delete + id);
};
