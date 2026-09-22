const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // Browser fallback: dynamically use the current host IP/domain with port 5000
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  // Server-side default
  return "http://localhost:5000/api";
};

const API_URL = getApiUrl();

export default API_URL;