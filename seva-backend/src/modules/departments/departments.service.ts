import { DepartmentModel, IDepartment } from "./departments.model";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const createDepartment = async (payload: Partial<IDepartment>) => {
  if (!payload.name) {
    throw new Error("Department name is required");
  }

  const slug = payload.slug || slugify(payload.name);
  const existing = await DepartmentModel.findOne({ slug, isDeleted: false });
  if (existing) {
    throw new Error(`Department with slug "${slug}" already exists`);
  }

  return DepartmentModel.create({
    ...payload,
    slug,
  });
};

const getAllDepartments = async () => {
  return DepartmentModel.find({ isDeleted: false })
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email")
    .sort({ createdAt: -1 });
};

const getDepartmentById = async (id: string) => {
  return DepartmentModel.findOne({ _id: id, isDeleted: false });
};

const updateDepartment = async (id: string, payload: Partial<IDepartment>) => {
  if (payload.name && !payload.slug) {
    payload.slug = slugify(payload.name);
  }

  return DepartmentModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );
};

const deleteDepartment = async (id: string) => {
  return DepartmentModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
};

export const DepartmentService = {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
