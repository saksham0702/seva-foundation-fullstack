import express from "express";
import { uploadEditorImage, uploadProductImage } from "../../middlewares/upload";
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

export const UploadRoutes = router;