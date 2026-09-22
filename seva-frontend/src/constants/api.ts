export const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== "") {
    const clean = process.env.NEXT_PUBLIC_API_URL.trim().replace(/\/$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  }

  // Browser fallback: dynamically use the current server host IP/domain with port 5000
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  // Server-side fallback
  const internal = process.env.INTERNAL_API_URL || process.env.API_URL;
  if (internal) return internal.replace(/\/$/, "");

  return "http://localhost:5000/api";
};

const API_URL = getApiUrl();

export default API_URL;