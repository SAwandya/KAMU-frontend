// services/authService.ts
import apiClient from "./apiClient";
import * as SecureStore from "expo-secure-store";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  // other user properties
}

export interface AuthResponse {
  user: User;
    accessToken: string;
    refreshToken: string;
}


const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post< AuthResponse >(
      "/auth/login",
      credentials
    );
    const { user, accessToken , refreshToken } = response.data;

    // Save tokens securely
    await SecureStore.setItemAsync("accessToken", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);

    return user; // return user object if you want
  },

  register: async (
    userData: {
      username: string;
      email: string;
      password: string;
    } & LoginCredentials
  ) => {
    const response = await apiClient.post<{ user: User; token: string }>(
      "/auth/register",
      userData
    );
    return response.data;
  },

  logout: async () => {
    return await apiClient.post("/auth/logout");
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<User>("/auth/me");
    return response.data;
  },
};

export default authService;
