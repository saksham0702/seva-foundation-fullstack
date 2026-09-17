import express from "express";
import { PageController } from "./pages.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

// All admin page routes require authentication + cms permission
const guard = [authMiddleware, permissionMiddleware("cms")];

// PUBLIC — your website calls this directly to render a page, no login needed
router.get("/public/:slug", PageController.getPageBySlug);

// Admin
router.get("/", ...guard, PageController.getAllPages);
router.get("/options", ...guard, PageController.getPageOptions);
router.get("/:id", ...guard, PageController.getPageById);

router.post("/", ...guard, PageController.createPage);

router.patch("/:id", ...guard, PageController.updatePageMeta);
router.patch("/:id/sections", ...guard, PageController.updateSections);
router.patch("/:id/publish", ...guard, PageController.togglePublish);

router.delete("/:id", ...guard, PageController.deletePage);

export const PageRoutes = router;