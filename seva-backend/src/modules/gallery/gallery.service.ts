import { GalleryModel, IGallery } from "./gallery.model";
import { Types } from "mongoose";

export interface CreateGalleryItemInput {
  imageUrl: string;
  title?: string;
  caption?: string;
  category?: string;
  createdBy?: string;
}

export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
  category?: string;
  search?: string;
  status?: string;
}

const createGalleryImages = async (
  items: CreateGalleryItemInput[]
): Promise<any[]> => {
  const documents = items.map((item) => ({
    imageUrl: item.imageUrl,
    title: item.title || "",
    caption: item.caption || "",
    category: item.category || "general",
    isActive: true,
    isDeleted: false,
    createdBy: item.createdBy ? new Types.ObjectId(item.createdBy) : undefined,
  }));

  const result = await GalleryModel.insertMany(documents);
  return result;
};

const getPublicGallery = async (query: PaginationParams) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
  const skip = (page - 1) * limit;

  const filter: any = {
    isDeleted: false,
    isActive: true,
  };

  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  const [images, total] = await Promise.all([
    GalleryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    GalleryModel.countDocuments(filter),
  ]);

  const totalPage = Math.ceil(total / limit) || 1;

  return {
    images,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

const getAllGalleryAdmin = async (query: PaginationParams) => {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(query.limit) || 50));
  const skip = (page - 1) * limit;

  const filter: any = {
    isDeleted: false,
  };

  if (query.status === "active") {
    filter.isActive = true;
  } else if (query.status === "inactive") {
    filter.isActive = false;
  }

  if (query.category && query.category !== "all") {
    filter.category = query.category;
  }

  if (query.search && query.search.trim()) {
    filter.$or = [
      { title: { $regex: query.search.trim(), $options: "i" } },
      { caption: { $regex: query.search.trim(), $options: "i" } },
      { category: { $regex: query.search.trim(), $options: "i" } },
    ];
  }

  const [images, total] = await Promise.all([
    GalleryModel.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    GalleryModel.countDocuments(filter),
  ]);

  const totalPage = Math.ceil(total / limit) || 1;

  return {
    images,
    meta: {
      page,
      limit,
      total,
      totalPage,
    },
  };
};

const getGalleryById = async (id: string) => {
  return await GalleryModel.findOne({
    _id: id,
    isDeleted: false,
  }).populate("createdBy", "name email");
};

const toggleGalleryStatus = async (
  id: string,
  isActive?: boolean,
  updatedBy?: string
) => {
  const galleryItem = await GalleryModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!galleryItem) {
    return null;
  }

  const nextStatus = typeof isActive === "boolean" ? isActive : !galleryItem.isActive;
  galleryItem.isActive = nextStatus;
  if (updatedBy) {
    galleryItem.updatedBy = updatedBy as any;
  }

  await galleryItem.save();
  return galleryItem;
};

const deleteGalleryImage = async (id: string, updatedBy?: string) => {
  const galleryItem = await GalleryModel.findOne({
    _id: id,
    isDeleted: false,
  });

  if (!galleryItem) {
    return null;
  }

  galleryItem.isDeleted = true;
  if (updatedBy) {
    galleryItem.updatedBy = updatedBy as any;
  }

  await galleryItem.save();
  return galleryItem;
};

export const GalleryService = {
  createGalleryImages,
  getPublicGallery,
  getAllGalleryAdmin,
  getGalleryById,
  toggleGalleryStatus,
  deleteGalleryImage,
};
