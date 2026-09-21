import express from "express";
import { GalleryController } from "./gallery.controller";
import { uploadGalleryImage } from "../../middlewares/upload";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import { permissionMiddleware } from "../../middlewares/auth/permission.middleware";

const router = express.Router();

// Gallery permission guard for admin actions
const guard = [authMiddleware, permissionMiddleware("gallery")];

// ── Public routes ──
// Public website view with pagination and category filter
router.get("/", GalleryController.getPublicGallery);
router.get("/item/:id", GalleryController.getGalleryById);

// ── Admin routes ──
router.get("/admin", ...guard, GalleryController.getAllGalleryAdmin);

router.post(
  "/",
  ...guard,
  uploadGalleryImage.array("images", 60),
  GalleryController.uploadGalleryImages
);

router.patch(
  "/:id/status",
  ...guard,
  GalleryController.toggleGalleryStatus
);

router.put(
  "/:id",
  ...guard,
  GalleryController.updateGalleryItem
);

router.patch(
  "/:id",
  ...guard,
  GalleryController.updateGalleryItem
);

router.delete(
  "/:id",
  ...guard,
  GalleryController.deleteGalleryImage
);

export const GalleryRoutes = router;
