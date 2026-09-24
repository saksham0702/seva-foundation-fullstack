import express from "express";
import { CmsController } from "./cms.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";
import { uploadCmsImage, uploadCmsMedia } from "../../middlewares/upload";

import { BlogController } from "../blogs/blogs.controller";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("cms")];

// Type-based items for Blogs / News / Events
router.get("/recent", BlogController.getRecentBlogs);
router.get("/type/:type", (req, res, next) => {
  req.query.type = req.params.type;
  BlogController.getAllBlogs(req, res, next);
});
router.get("/type/:type/:id", BlogController.getBlogById);

// Public read endpoints for website rendering
router.get("/pages", CmsController.getAllPages);
router.get("/pages/:slug", CmsController.getPageBySlug);

// Admin-guarded endpoints
router.post("/upload-image", ...guard, uploadCmsImage.single("image"), CmsController.uploadImage);
router.post("/upload-media", ...guard, uploadCmsMedia.single("file"), CmsController.uploadMedia);
router.post("/pages/:slug", ...guard, CmsController.savePage);
router.put("/pages/:slug", ...guard, CmsController.savePage);
router.delete("/pages/:slug/sections/:sectionKey", ...guard, CmsController.deleteSection);
router.delete("/pages/:slug", ...guard, CmsController.deletePage);

export const CmsRoutes = router;

