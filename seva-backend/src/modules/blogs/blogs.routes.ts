import express from "express";
import { BlogController } from "./blogs.controller";
import { uploadBlogImage } from "../../middlewares/upload";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("cms")];

// Public read endpoints for website & dashboard viewers
router.get("/", BlogController.getAllBlogs);
router.get("/options", BlogController.getBlogOptions);
router.get("/:id", BlogController.getBlogById);

// Protected management endpoints
router.post(
  "/",
  ...guard,
  uploadBlogImage.array("images", 5),
  BlogController.createBlog
);

router.patch(
  "/:id/status",
  ...guard,
  BlogController.toggleBlogStatus
);

router.patch(
  "/:id",
  ...guard,
  uploadBlogImage.array("images", 5),
  BlogController.updateBlog
);

router.delete("/:id", ...guard, BlogController.deleteBlog);

export const BlogRoutes = router;