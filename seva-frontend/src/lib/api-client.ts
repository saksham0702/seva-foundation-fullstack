import axios from "axios";

/**
 * Centralized Axios instance.
 * All API calls go through this — never call URLs directly in components.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    withCredentials: true,
  },
  timeout: 15000,
});



export default apiClient;
