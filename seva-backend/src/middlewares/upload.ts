import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const ALLOWED_IMAGE_EXT = /jpeg|jpg|png|gif|webp|svg/;
const ALLOWED_IMAGE_MIME = /jpeg|jpg|png|gif|webp|svg/;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * timestamp-random.ext instead of just timestamp.ext.
 * Only affects NEW uploads — existing files on disk (and their URLs
 * already saved in Mongo) are untouched, since we never rename or
 * move files that are already there.
 */
function safeFilename(originalname: string): string {
  const ext = path.extname(originalname).toLowerCase();
  const random = crypto.randomBytes(6).toString("hex");
  return `${Date.now()}-${random}${ext}`;
}

/**
 * Creates a multer upload instance for a given module name.
 * Files are stored in: uploads/{moduleName}/YYYY/MM/DD/images/
 *
 * This is the same factory your project already uses for campaign,
 * product, and signature uploads. New modules (editor, blog, cms, ...)
 * just call this again with a new moduleName — no duplicated logic.
 */
export function createFileUploader(
  moduleName: string,
  maxFiles = 10,
  maxFileSize = MAX_IMAGE_SIZE
) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        moduleName,
        String(year),
        month,
        day,
        "images"
      );

      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
      cb(null, safeFilename(file.originalname));
    },
  });

  const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const extOk = ALLOWED_IMAGE_EXT.test(
      path.extname(file.originalname).toLowerCase().replace(".", "")
    );
    const mimeOk = ALLOWED_IMAGE_MIME.test(file.mimetype);

    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files (jpeg, jpg, png, gif, webp, svg) are allowed"
        )
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
  });
}

/** Converts an absolute multer file path into a public /uploads/... URL. */
export function filePathToUrl(filePath: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const idx = normalized.indexOf("/uploads/");
  if (idx !== -1) {
    return normalized.slice(idx);
  }
  const parts = normalized.split("uploads/");
  const rel = parts.length > 1 ? parts.slice(1).join("uploads/") : normalized;
  return `/uploads/${rel.replace(/^\//, "")}`;
}

// ── Existing uploaders — unchanged behavior, same folders, same URLs ──
export const uploadCampaignImage = createFileUploader("campaign");
export const uploadProductImage = createFileUploader("product");
export const uploadSignatureImage = createFileUploader("signatures");
export const uploadBlogImage = createFileUploader("blog");

// ── New: shared uploader for all rich-text editor images ──
// Lands in uploads/editor/YYYY/MM/DD/images/ — its own folder, so it
// never collides with campaign/product/signature uploads.
export const uploadEditorImage = createFileUploader("editor");

// ── Gallery uploader ──
// Files stored in uploads/gallery/YYYY/MM/DD/images/ (bulk up to 60 images, max 3MB each)
export const uploadGalleryImage = createFileUploader("gallery", 60, 3 * 1024 * 1024);

// ── CMS uploader ──
// Files stored in uploads/cms/YYYY/MM/DD/images/ (max 5MB)
export const uploadCmsImage = createFileUploader("cms", 10, 5 * 1024 * 1024);

// ── Mail branding / logo uploader ──
// Files stored in uploads/mail/YYYY/MM/DD/images/ (max 5MB)
export const uploadMailBrandingImage = createFileUploader("mail", 5, 5 * 1024 * 1024);

const ALLOWED_MEDIA_EXT = /jpeg|jpg|png|gif|webp|svg|mp4|webm|mov|ogg|m4v/;
export function createMediaUploader(
  moduleName: string,
  maxFiles = 5,
  maxFileSize = 50 * 1024 * 1024
) {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");

      const uploadDir = path.join(
        process.cwd(),
        "uploads",
        moduleName,
        String(year),
        month,
        day,
        "media"
      );

      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },

    filename: (_req, file, cb) => {
      cb(null, safeFilename(file.originalname));
    },
  });

  const fileFilter = (
    _req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const extOk = ALLOWED_MEDIA_EXT.test(ext);
    const mimeOk =
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/") ||
      file.mimetype === "application/octet-stream";

    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Only image files (jpeg, jpg, png, webp, svg) and video files (mp4, webm, mov) are allowed"
        )
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
  });
}

export const uploadCmsMedia = createMediaUploader("cms", 5, 50 * 1024 * 1024);

// ── Mail Template image uploader ──
export const uploadMailTemplateImage = createFileUploader("mail-templates", 10, 2 * 1024 * 1024);