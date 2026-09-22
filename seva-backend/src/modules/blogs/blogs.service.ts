import { IBlog, BlogModel } from "./blogs.model";

const createBlog = async (payload: Partial<IBlog>): Promise<IBlog> => {
  if (payload.slug) {
    // Release any old deleted blogs holding this slug
    await BlogModel.updateMany(
      { slug: payload.slug, isDeleted: true },
      { $set: { slug: `${payload.slug}-deleted-${Date.now()}` } }
    );
    const existing = await BlogModel.findOne({
      slug: payload.slug,
      isDeleted: false,
    });
    if (existing) {
      const error: any = new Error(
        `A blog with the slug "${payload.slug}" already exists. Please choose a different title or slug.`
      );
      error.statusCode = 409;
      throw error;
    }
  }
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
  if (payload.slug) {
    // Release any old deleted blogs holding this slug
    await BlogModel.updateMany(
      { slug: payload.slug, isDeleted: true, _id: { $ne: id } },
      { $set: { slug: `${payload.slug}-deleted-${Date.now()}` } }
    );
    const existing = await BlogModel.findOne({
      slug: payload.slug,
      isDeleted: false,
      _id: { $ne: id },
    });
    if (existing) {
      const error: any = new Error(
        `A blog with the slug "${payload.slug}" already exists. Please choose a different title or slug.`
      );
      error.statusCode = 409;
      throw error;
    }
  }
  const result = await BlogModel.findByIdAndUpdate(id, payload, { new: true });
  return result;
};

const deleteBlog = async (id: string): Promise<IBlog | null> => {
  const blog = await BlogModel.findById(id);
  if (!blog) return null;
  blog.isDeleted = true;
  blog.slug = `${blog.slug}-deleted-${Date.now()}`;
  await blog.save();
  return blog;
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