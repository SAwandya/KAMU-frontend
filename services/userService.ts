// services/userService.ts
import apiClient from "./apiClient";
import { User } from "./authService";

const userService = {
  getUsers: async (page = 1, limit = 10) => {
    const response = await apiClient.get<{ users: User[]; total: number }>(
      "/users",
      {
        params: { page, limit },
      }
    );
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await apiClient.put<User>(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    return await apiClient.delete(`/users/${id}`);
  },
};

export default userService;
