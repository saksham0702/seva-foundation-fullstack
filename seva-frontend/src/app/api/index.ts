import API_URL from "@/constants/api";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true, // ← sends HTTP-only cookies automatically on every request
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      localStorage.removeItem("access_token");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;