import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { BlogService } from "./blogs.service";
import { sendResponse } from "../../utils/apiResponse";
import { filePathToUrl } from "../../middlewares/upload";

const createBlog = asyncHandler(async (req: Request, res: Response) => {
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const files = req.files as Express.Multer.File[];
    req.body.images = files.map((file) => filePathToUrl(file.path));
  } else if (req.body.images) {
    if (typeof req.body.images === "string") {
      req.body.images = [req.body.images];
    }
  }

  // Parse FAQs if sent as JSON string in FormData
  if (typeof req.body.faqs === "string") {
    try {
      req.body.faqs = JSON.parse(req.body.faqs);
    } catch {
      req.body.faqs = [];
    }
  }

  // Support title/name and metaDescription/description interoperability
  if (!req.body.name && req.body.title) {
    req.body.name = req.body.title;
  }
  if (!req.body.description && (req.body.metaDescription || req.body.excerpt)) {
    req.body.description = req.body.metaDescription || req.body.excerpt;
  }

  // Generate slug if missing
  if (!req.body.slug && req.body.name) {
    req.body.slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const result = await BlogService.createBlog(req.body);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: `${req.body.type || "Content"} created successfully`,
    data: result,
  });
});

const getAllBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { type, status, search } = req.query as {
    type?: string;
    status?: string;
    search?: string;
  };
  const result = await BlogService.getAllBlogs({ type, status, search });
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Content fetched successfully",
    data: result,
  });
});

const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const result = await BlogService.getBlogById(id);
  if (!result) {
    return sendResponse(res, {
      statusCode: 404,
      success: false,
      message: "Content not found",
    });
  }
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Content fetched successfully",
    data: result,
  });
});

const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const files = req.files as Express.Multer.File[];
    req.body.images = files.map((file) => filePathToUrl(file.path));
  } else if (req.body.images) {
    if (typeof req.body.images === "string") {
      req.body.images = [req.body.images];
    }
  } else {
    // Untouched image: do not overwrite existing images
    delete req.body.images;
  }

  // Parse FAQs if sent as JSON string in FormData
  if (typeof req.body.faqs === "string") {
    try {
      req.body.faqs = JSON.parse(req.body.faqs);
    } catch {
      req.body.faqs = [];
    }
  }

  // Support title/name and metaDescription/description interoperability
  if (!req.body.name && req.body.title) {
    req.body.name = req.body.title;
  }
  if (!req.body.description && (req.body.metaDescription || req.body.excerpt)) {
    req.body.description = req.body.metaDescription || req.body.excerpt;
  }

  const result = await BlogService.updateBlog(id, req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Content updated successfully",
    data: result,
  });
});

const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await BlogService.deleteBlog(id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Content deleted successfully",
    data: null,
  });
});

const toggleBlogStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { status } = req.body as { status: "draft" | "published" };
  const result = await BlogService.toggleBlogStatus(id, status);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: `Status updated to ${status}`,
    data: result,
  });
});

const getBlogOptions = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query as { type?: string };
  const result = await BlogService.getBlogOptions(type);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Content options fetched successfully",
    data: result,
  });
});

export const BlogController = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
  getBlogOptions,
};