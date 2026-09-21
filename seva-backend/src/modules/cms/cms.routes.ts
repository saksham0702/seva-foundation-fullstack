import express from "express";
import { CmsController } from "./cms.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";
import { uploadCmsImage } from "../../middlewares/upload";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("cms")];

// Public read endpoints for website rendering
router.get("/pages", CmsController.getAllPages);
router.get("/pages/:slug", CmsController.getPageBySlug);

// Admin-guarded endpoints
router.post("/upload-image", ...guard, uploadCmsImage.single("image"), CmsController.uploadImage);
router.post("/pages/:slug", ...guard, CmsController.savePage);
router.put("/pages/:slug", ...guard, CmsController.savePage);
router.delete("/pages/:slug/sections/:sectionKey", ...guard, CmsController.deleteSection);
router.delete("/pages/:slug", ...guard, CmsController.deletePage);

export const CmsRoutes = router;

