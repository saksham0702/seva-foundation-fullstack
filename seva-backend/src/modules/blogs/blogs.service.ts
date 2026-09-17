import { IBlog, BlogModel } from "./blogs.model";

const createBlog = async (payload: Partial<IBlog>): Promise<IBlog> => {
  const result = await BlogModel.create(payload);
  return result;
};

const getAllBlogs = async (filter: { type?: string; status?: string; search?: string } = {}): Promise<IBlog[]> => {
  const query: Record<string, unknown> = { isDeleted: false };
  if (filter.type) {
    query.type = filter.type;
  }
  if (filter.status && filter.status !== "all") {
    query.status = filter.status;
  }
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: "i" } },
      { description: { $regex: filter.search, $options: "i" } },
      { category: { $regex: filter.search, $options: "i" } },
    ];
  }
  const result = await BlogModel.find(query).sort({ createdAt: -1 });
  return result;
};

const getBlogById = async (idOrSlug: string): Promise<IBlog | null> => {
  let result = null;
  if (/^[0-9a-fA-F]{24}$/.test(idOrSlug)) {
    result = await BlogModel.findOne({ _id: idOrSlug, isDeleted: false });
  }
  if (!result) {
    result = await BlogModel.findOne({ slug: idOrSlug, isDeleted: false });
  }
  return result;
};

const updateBlog = async (
  id: string,
  payload: Partial<IBlog>
): Promise<IBlog | null> => {
  const result = await BlogModel.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteBlog = async (id: string): Promise<IBlog | null> => {
  const result = await BlogModel.findByIdAndUpdate(
    id,
    { isDeleted: true },
    { new: true }
  );
  return result;
};

const toggleBlogStatus = async (id: string, newStatus: "draft" | "published"): Promise<IBlog | null> => {
  const result = await BlogModel.findByIdAndUpdate(
    id,
    { status: newStatus },
    { new: true }
  );
  return result;
};

const getBlogOptions = async (type?: string) => {
  const query: Record<string, unknown> = { isDeleted: false };
  if (type) query.type = type;
  const result = await BlogModel.find(
    query,
    { name: 1, _id: 1, slug: 1, type: 1 }
  );
  return result;
};

export const BlogService = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  getBlogOptions,
};