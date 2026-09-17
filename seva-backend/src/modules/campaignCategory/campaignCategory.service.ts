import { ICategory, CategoryModel } from "./campaignCategory.model";

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const createCategory = async (payload: Partial<ICategory>): Promise<ICategory> => {
  if (!payload.name) {
    const error: any = new Error("Category name is required.");
    error.statusCode = 400;
    throw error;
  }

  const slug = payload.slug ? toSlug(payload.slug) : toSlug(payload.name);
  payload.slug = slug;

  // Release any old deleted category holding this slug or name
  await CategoryModel.updateMany(
    {
      $or: [{ slug }, { name: { $regex: `^${payload.name.trim()}$`, $options: "i" } }],
      isDeleted: true,
    },
    { $set: { slug: `${slug}-deleted-${Date.now()}` } }
  );

  // Check if an active category has this name or slug
  const existing = await CategoryModel.findOne({
    $or: [{ slug }, { name: { $regex: `^${payload.name.trim()}$`, $options: "i" } }],
    isDeleted: false,
  });

  if (existing) {
    const error: any = new Error(
      `A category with the name "${payload.name}" already exists. Please choose a different name.`
    );
    error.statusCode = 409;
    throw error;
  }

  const result = await CategoryModel.create(payload);
  return result;
};

const getAllCategories = async () => {
  const result = await CategoryModel.find({ isDeleted: false }).sort({ createdAt: -1 });
  return result;
};

const getCategoryById = async (id: string) => {
  const result = await CategoryModel.findById(id);
  if (!result || result.isDeleted) return null;
  return result;
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
  if (payload.name) {
    const slug = payload.slug ? toSlug(payload.slug) : toSlug(payload.name);
    payload.slug = slug;

    // Release any old deleted category
    await CategoryModel.updateMany(
      {
        $or: [{ slug }, { name: { $regex: `^${payload.name.trim()}$`, $options: "i" } }],
        isDeleted: true,
        _id: { $ne: id },
      },
      { $set: { slug: `${slug}-deleted-${Date.now()}` } }
    );

    // Check if another active category has this name or slug
    const existing = await CategoryModel.findOne({
      $or: [{ slug }, { name: { $regex: `^${payload.name.trim()}$`, $options: "i" } }],
      isDeleted: false,
      _id: { $ne: id },
    });

    if (existing) {
      const error: any = new Error(
        `A category with the name "${payload.name}" already exists. Please choose a different name.`
      );
      error.statusCode = 409;
      throw error;
    }
  }

  const result = await CategoryModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  );
  return result;
};

const deleteCategory = async (id: string) => {
  const category = await CategoryModel.findById(id);
  if (!category) return null;

  category.isDeleted = true;
  if (category.slug) {
    category.slug = `${category.slug}-deleted-${Date.now()}`;
  }
  await category.save();
  return category;
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
