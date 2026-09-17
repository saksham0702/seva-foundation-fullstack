import API_URL from "@/constants/api";

/**
 * Base URL for static assets / uploads.
 * Derived by stripping `/api` from API_URL, or falling back to environment variables.
 */
export const IMAGE_BASE_URL: string = (() => {
  if (process.env.NEXT_PUBLIC_IMAGE_URL) {
    return process.env.NEXT_PUBLIC_IMAGE_URL.replace(/\/$/, "");
  }
  if (API_URL) {
    return API_URL.replace(/\/api\/?$/, "");
  }
  return "http://localhost:5000";
})();

const DEFAULT_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f1f5f9'%3E%3Crect width='400' height='300' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2394a3b8'%3ENo Image Available%3C/text%3E%3C/svg%3E";

/**
 * Resolves any image path or URL into a fully-qualified image URL.
 *
 * Handles:
 * - null / undefined / empty string -> fallback
 * - Full URLs (http://, https://, data:, blob:) -> returned untouched
 * - Relative paths (/uploads/..., uploads/...) -> prepended with IMAGE_BASE_URL
 */
export function getImageUrl(
  path?: string | null,
  fallback = DEFAULT_FALLBACK_IMAGE
): string {
  if (!path || typeof path !== "string" || !path.trim()) {
    return fallback;
  }

  const cleanPath = path.trim();

  if (
    cleanPath.startsWith("http://") ||
    cleanPath.startsWith("https://") ||
    cleanPath.startsWith("data:") ||
    cleanPath.startsWith("blob:")
  ) {
    return cleanPath;
  }

  // Ensure clean single slash between base URL and path
  const normalizedPath = cleanPath.startsWith("/")
    ? cleanPath
    : `/${cleanPath}`;

  return `${IMAGE_BASE_URL}${normalizedPath}`;
}

/**
 * Transforms any relative `<img src="/uploads/..." />` inside rich text HTML
 * so that all images point to the correct backend host.
 */
export function resolveRichTextHtml(html?: string | null): string {
  if (!html || typeof html !== "string") return "";

  // Replace src="/uploads/..." or src="uploads/..."
  return html.replace(
    /src=(["'])(\/??uploads\/[^"']+)\1/gi,
    (_match, quote, srcPath) => {
      const resolved = getImageUrl(srcPath);
      return `src=${quote}${resolved}${quote}`;
    }
  );
}
