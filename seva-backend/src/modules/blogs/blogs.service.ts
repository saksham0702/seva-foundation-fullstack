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

const DEFAULT_BLOGS = [
  {
    name: "How Rural Bridge Schools are Transforming Lives in Uttarakhand",
    slug: "rural-bridge-schools-transforming-lives",
    type: "blog",
    category: "Education (Vidhya)",
    status: "published",
    description: "Discover how Seva Foundation is bridging the educational gap for over 10,000 children across remote Himalayan villages.",
    content: "Education is the cornerstone of progress. Through our Vidhya initiative, mobile learning vans and bridge schools are bringing hope and foundational literacy to underserved rural regions.",
    authorName: "Dr. Ananya Sharma",
    readTime: "4 min read",
    images: ["https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Mobile Medical Vans: Bringing Lifesaving Care to Mountain Hamlets",
    slug: "mobile-medical-vans-mountain-hamlets",
    type: "blog",
    category: "Healthcare (Arogya)",
    status: "published",
    description: "Our mobile healthcare teams travel through snow and terrain to provide primary diagnosis, medicines, and free surgeries.",
    content: "In remote mountain villages where hospitals are hours away, our Arogya health vans are life-savers, offering essential diagnostics and pediatric care.",
    authorName: "SEVA Medical Team",
    readTime: "3 min read",
    images: ["https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "Annual Health & Eye Care Camp Dehradun 2026",
    slug: "annual-health-eye-care-camp-2026",
    type: "event",
    category: "Healthcare (Arogya)",
    status: "published",
    description: "Join our comprehensive medical and eye care camp providing free consultations, spectacles, and medicine distribution.",
    content: "Organized by Seva India Foundation in collaboration with top ophthalmologists. Over 500 patients will receive free vision screenings and treatment.",
    eventDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    eventLocation: "Community Center, Sahastradhara Road, Dehradun",
    eventOrganizer: "Seva Foundation Arogya Wing",
    images: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"],
  },
  {
    name: "SEVA Foundation Receives National Excellence Award for Rural Outreach",
    slug: "national-excellence-award-rural-outreach",
    type: "news",
    category: "Press & Announcements",
    status: "published",
    description: "Seva India Foundation has been honored with the 2026 National Social Impact Award for pioneering bridge schooling and disaster response.",
    content: "The Ministry of Social Justice and Empowerment recognized Seva Foundation's tireless efforts in uplifting rural communities across Northern India.",
    newsSource: "Times of India & DD News",
    readTime: "2 min read",
    images: ["https://images.unsplash.com/photo-1531545514256-b1400bc00f31?w=800&auto=format&fit=crop&q=80"],
  },
];

const getAllBlogs = async (filter: { type?: string; status?: string; search?: string; limit?: number } = {}): Promise<IBlog[]> => {
  const count = await BlogModel.countDocuments({ isDeleted: false });
  if (count === 0) {
    await BlogModel.insertMany(DEFAULT_BLOGS);
  }

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
  let queryBuilder = BlogModel.find(query).sort({ createdAt: -1 });
  if (filter.limit && Number(filter.limit) > 0) {
    queryBuilder = queryBuilder.limit(Number(filter.limit));
  }
  const result = await queryBuilder;
  return result;
};

const getRecentBlogs = async (limit = 4): Promise<IBlog[]> => {
  const count = await BlogModel.countDocuments({ isDeleted: false });
  if (count === 0) {
    await BlogModel.insertMany(DEFAULT_BLOGS);
  }

  const result = await BlogModel.find({
    isDeleted: false,
    status: "published",
  })
    .sort({ createdAt: -1 })
    .limit(limit);
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
  getRecentBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  getBlogOptions,
};