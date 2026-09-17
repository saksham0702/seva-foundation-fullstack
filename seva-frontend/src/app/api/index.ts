import API_URL from "@/constants/api";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true, // ← sends HTTP-only cookies automatically on every request
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosInstance;