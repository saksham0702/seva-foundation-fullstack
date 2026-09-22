import API_URL from "@/constants/api";

/**
 * Dynamically resolves the base URL for static assets / uploads.
 * In browser: uses window.location.hostname with port 5000 so it automatically
 * points to the server IP in production without any hardcoding.
 */
export function getImageBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_IMAGE_URL && process.env.NEXT_PUBLIC_IMAGE_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_IMAGE_URL.replace(/\/$/, "");
  }
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
  }
  if (API_URL && API_URL.trim() !== "" && !API_URL.includes("localhost:5000")) {
    return API_URL.replace(/\/api\/?$/, "");
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
}

export const IMAGE_BASE_URL: string = getImageBaseUrl();
export const API_BASE: string = IMAGE_BASE_URL;

const DEFAULT_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f1f5f9'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'%3ENo Image Available%3C/text%3E%3C/svg%3E";

/**
 * Resolves any image or asset path/URL into a fully-qualified URL pointing to the server IP.
 *
 * Strips hardcoded localhost:5000 or 127.0.0.1:5000 from database records,
 * and attaches the current host's IP/domain on port 5000.
 */
export function getImageUrl(
  path?: string | null,
  fallback = ""
): string {
  if (!path || typeof path !== "string" || !path.trim()) {
    return fallback;
  }

  let cleanPath = path.trim();

  // Filter out dummy Unsplash images per production requirements
  if (cleanPath.includes("images.unsplash.com")) {
    return fallback;
  }

  // Strip hardcoded localhost:5000 or 127.0.0.1:5000
  cleanPath = cleanPath.replace(/^https?:\/\/(localhost|127\.0\.0\.1):5000/i, "");

  // If cleanPath contains /uploads/, normalize to /uploads/...
  if (cleanPath.includes("/uploads/")) {
    cleanPath = cleanPath.substring(cleanPath.indexOf("/uploads/"));
  }

  // Preserve valid external full URLs (that aren't localhost) and data/blob URIs
  if (
    cleanPath.startsWith("data:") ||
    cleanPath.startsWith("blob:") ||
    (/^https?:\/\//i.test(cleanPath) && !cleanPath.includes("/uploads/"))
  ) {
    return cleanPath;
  }

  const baseUrl = getImageBaseUrl();
  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  return `${baseUrl}${normalizedPath}`;
}

/**
 * Transforms any `<img src="..." />` inside rich text HTML
 * so that all images point to the correct backend host IP.
 */
export function resolveRichTextHtml(html?: string | null): string {
  if (!html || typeof html !== "string") return "";

  // Replace src="/uploads/..." or src="http://localhost:5000/uploads/..."
  return html.replace(
    /src=(["'])(?:https?:\/\/[^\/]+)?(\/??uploads\/[^"']+)\1/gi,
    (_match, quote, srcPath) => {
      const resolved = getImageUrl(srcPath);
      return `src=${quote}${resolved}${quote}`;
    }
  );
}
