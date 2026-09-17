import express from "express";
import { uploadEditorImage } from "../../middlewares/upload";
import { uploadEditorImageHandler } from "./upload.controller";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";

const router = express.Router();

// POST /api/upload/editor
// Uses the shared uploadEditorImage you already created in upload.ts
router.post(
  "/editor",
  authMiddleware,
  uploadEditorImage.single("image"),
  uploadEditorImageHandler
);

export const UploadRoutes = router;