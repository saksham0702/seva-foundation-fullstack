import {
  IVolunteerCategory,
  VolunteerCategoryModel,
} from "./volunteercategories.model";

const createVolunteerCategory = async (
  payload: Partial<IVolunteerCategory>
): Promise<IVolunteerCategory> => {
  const result = await VolunteerCategoryModel.create(payload);
  return result;
};

const getAllVolunteerCategories = async (
  formType?: string
): Promise<IVolunteerCategory[]> => {
  const filter: Record<string, any> = { isDeleted: false };
  if (formType) filter.formType = formType;
  const result = await VolunteerCategoryModel.find(filter).sort({
    createdAt: -1,
  });
  return result;
};

/**
 * Public listing — only active, non-deleted categories.
 * Filterable by formType (volunteer | corporate | career).
 */
const getPublicVolunteerCategories = async (
  formType?: string
): Promise<IVolunteerCategory[]> => {
  const filter: Record<string, any> = {
    isDeleted: false,
    isActive: true,
  };
  if (formType) filter.formType = formType;
  const result = await VolunteerCategoryModel.find(filter).sort({ createdAt: 1 });
  return result;
};

const getVolunteerCategoryById = async (
  id: string
): Promise<IVolunteerCategory | null> => {
  const result = await VolunteerCategoryModel.findOne({
    _id: id,
    isDeleted: false,
  });
  return result;
};

const updateVolunteerCategory = async (
  id: string,
  payload: Partial<IVolunteerCategory>
): Promise<IVolunteerCategory | null> => {
  const result = await VolunteerCategoryModel.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return result;
};

const deleteVolunteerCategory = async (
  id: string
): Promise<IVolunteerCategory | null> => {
  const result = await VolunteerCategoryModel.findByIdAndUpdate(
    id,
    { isDeleted: true, isActive: false },
    { new: true }
  );
  return result;
};

const getVolunteerCategoryOptions = async (formType?: string) => {
  const filter: Record<string, any> = { isDeleted: false };
  if (formType) filter.formType = formType;
  const result = await VolunteerCategoryModel.find(
    filter,
    { title: 1, _id: 1, formType: 1 }
  );
  return result;
};

export const VolunteerCategoryService = {
  createVolunteerCategory,
  getAllVolunteerCategories,
  getPublicVolunteerCategories,
  getVolunteerCategoryById,
  updateVolunteerCategory,
  deleteVolunteerCategory,
  getVolunteerCategoryOptions,
};