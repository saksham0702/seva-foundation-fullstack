import axiosInstance from "./index";
import { endpoint } from "./endpoints";

export const PERMISSION_OPTIONS = [
  { key: "campaigns", label: "Campaigns & Fundraising", description: "Create, edit, and publish campaigns" },
  { key: "donations", label: "Donations & Payments", description: "View transactions, donor receipts, and reports" },
  { key: "volunteers", label: "Volunteers Management", description: "Manage categories and review applications" },
  { key: "cms", label: "Content Management (CMS)", description: "Edit static website pages, banners, and layout" },
  { key: "certificates", label: "80G Certificates & Signatures", description: "Generate, verify, and manage certificates" },
  { key: "departments", label: "Departments Management", description: "Create departments and configure role permissions" },
  { key: "users", label: "User & Admin Management", description: "Create staff accounts and assign departments" },
  { key: "crm", label: "Donor CRM & Leads", description: "Follow up with unpaid and failed payment leads" },
  { key: "marketing", label: "Marketing & Media", description: "Blogs, stories, and press releases" },
  { key: "gallery", label: "Gallery Management", description: "Upload, manage, and toggle gallery images" },
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
