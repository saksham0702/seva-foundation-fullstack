import express from "express";
import { CmsController } from "./cms.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

const guard = [authMiddleware, permissionMiddleware("cms")];

// Public read endpoints for website rendering
router.get("/pages", CmsController.getAllPages);
router.get("/pages/:slug", CmsController.getPageBySlug);

// Admin-guarded endpoints
router.post("/pages/:slug", ...guard, CmsController.savePage);
router.put("/pages/:slug", ...guard, CmsController.savePage);
router.delete("/pages/:slug", ...guard, CmsController.deletePage);

export const CmsRoutes = router;
