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

const getAllVolunteerCategories = async (): Promise<IVolunteerCategory[]> => {
  const result = await VolunteerCategoryModel.find({ isDeleted: false }).sort({
    createdAt: -1,
  });
  return result;
};

/**
 * Public listing — only active, non-deleted categories.
 * This is what the "Get Involved" page's role grid should call.
 */
const getPublicVolunteerCategories = async (): Promise<IVolunteerCategory[]> => {
  const result = await VolunteerCategoryModel.find({
    isDeleted: false,
    isActive: true,
  }).sort({ createdAt: 1 });
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

const getVolunteerCategoryOptions = async () => {
  const result = await VolunteerCategoryModel.find(
    { isDeleted: false },
    { title: 1, _id: 1 }
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