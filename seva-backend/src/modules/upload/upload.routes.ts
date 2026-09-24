import express from "express";
import {
  uploadEditorImage,
  uploadProductImage,
  uploadMailBrandingImage,
} from "../../middlewares/upload";
import { uploadEditorImageHandler } from "./upload.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";

const router = express.Router();

// POST /api/upload/editor
router.post(
  "/editor",
  authMiddleware,
  uploadEditorImage.single("image"),
  uploadEditorImageHandler
);

// POST /api/upload/product
router.post(
  "/product",
  authMiddleware,
  uploadProductImage.single("image"),
  uploadEditorImageHandler
);

// POST /api/upload/mail-logo
router.post(
  "/mail-logo",
  authMiddleware,
  uploadMailBrandingImage.single("image"),
  uploadEditorImageHandler
);

export const UploadRoutes = router;