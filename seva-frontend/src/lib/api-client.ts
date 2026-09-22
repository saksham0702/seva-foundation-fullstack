import axios from "axios";
import API_URL from "@/constants/api";

/**
 * Centralized Axios instance.
 * All API calls go through this — never call URLs directly in components.
 */
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export default apiClient;
