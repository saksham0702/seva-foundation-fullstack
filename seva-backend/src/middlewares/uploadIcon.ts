import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

/**
 * Storage location for volunteer category icons.
 * Kept separate from campaign image uploads (uploadCampaignImage) since
 * these are strictly SVGs, not raster images.
 */
const ICON_UPLOAD_DIR = path.join(process.cwd(), "uploads", "volunteer-icons");

if (!fs.existsSync(ICON_UPLOAD_DIR)) {
  fs.mkdirSync(ICON_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ICON_UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    // force .svg regardless of original name to avoid double extensions / spoofing
    cb(null, `icon-${uniqueSuffix}.svg`);
  },
});

/**
 * Validates the file is actually an SVG:
 * - mimetype must be image/svg+xml
 * - extension must be .svg
 * (Multer only inspects headers at this point; if you need to guard against
 * malicious script content inside the SVG, sanitize on read/serve too —
 * see sanitizeSvgContent below.)
 */
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const isSvgMime = file.mimetype === "image/svg+xml";
  const isSvgExt = path.extname(file.originalname).toLowerCase() === ".svg";

  if (!isSvgMime || !isSvgExt) {
    return cb(new Error("Only .svg icon files are allowed"));
  }
  cb(null, true);
};

export const uploadVolunteerIcon = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024, // 200KB is plenty for an icon SVG
  },
});

/**
 * Converts a saved icon's disk path to a public URL, same convention as
 * filePathToUrl in middlewares/upload.ts. Reuse that one instead if your
 * upload.ts already exports a generic version — this is here in case
 * icons are served from a distinct static path.
 */
export const iconFilePathToUrl = (filePath: string): string => {
  const relative = filePath.split("uploads")[1].replace(/\\/g, "/");
  return `/uploads${relative}`;
};

/**
 * Optional but recommended: basic sanitization of SVG content to strip
 * <script> tags and on*= event handler attributes before it's ever served
 * to a browser, since SVG can carry executable script.
 * Call this right after multer saves the file, before responding.
 */
export const sanitizeSvgFile = (filePath: string): void => {
  let content = fs.readFileSync(filePath, "utf-8");
  content = content
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/on\w+='[^']*'/gi, "");
  fs.writeFileSync(filePath, content, "utf-8");
};