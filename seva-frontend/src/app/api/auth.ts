import axiosInstance from ".";
import { endpoint } from "./endpoints";

export const authAPI = {
  login: async (data: Record<string, unknown>) => {
    const response = await axiosInstance.post(endpoint.auth.login, data);
    return response.data;
  },
  logout: async () => {
    const response = await axiosInstance.post(endpoint.auth.logout);
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosInstance.get(endpoint.auth.profile);
    return response.data;
  },
  changePassword: async (data: Record<string, unknown>) => {
    const response = await axiosInstance.patch(endpoint.auth.changePassword, data);
    return response.data;
  },
  createUser: async (data: Record<string, unknown>) => {
    const response = await axiosInstance.post(endpoint.auth.createUser, data);
    return response.data;
  },
  getUsers: async () => {
    const response = await axiosInstance.get(endpoint.auth.getUsers);
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await axiosInstance.get(endpoint.auth.getUserById + id);
    return response.data;
  },
  updateUser: async (id: string, data: Record<string, unknown>) => {
    const response = await axiosInstance.patch(endpoint.auth.updateUser + id, data);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(endpoint.auth.deleteUser + id);
    return response.data;
  },
};