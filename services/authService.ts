// services/authService.ts
import apiClient from "./apiClient";
import * as SecureStore from "expo-secure-store";
import apiConfig from "../config/api.config";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}

export interface RegisterRiderCredentials extends RegisterCredentials {
  vehicleREG: string;
}

export interface User {
  id: number | string;
  fullName: string;
  email: string;
  role: string;
  vehicleREG?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// The auth endpoint path (from config)
const AUTH_PATH = apiConfig.endpoints.auth;

const authService = {
  login: async (credentials: LoginCredentials): Promise<User> => {
    const response = await apiClient.post<AuthResponse>(
      `${AUTH_PATH}/login`,
      credentials
    );
    const { user, accessToken, refreshToken } = response.data;

    // Save tokens securely
    await SecureStore.setItemAsync("accessToken", accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync("refreshToken", refreshToken);
    }

    return user;
  },

  registerCustomer: async (
    userData: RegisterCredentials
  ): Promise<{ user: User }> => {
    const response = await apiClient.post<{ user: User }>(
      `${AUTH_PATH}/register/customer`,
      {
        ...userData,
        role: "Customer",
      }
    );
    return response.data;
  },

  registerRider: async (
    userData: RegisterRiderCredentials
  ): Promise<{ user: User }> => {
    const response = await apiClient.post<{ user: User }>(
      `${AUTH_PATH}/register/rider`,
      {
        ...userData,
        role: "Rider",
      }
    );
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      // Call backend to invalidate the token
      await apiClient.post(`${AUTH_PATH}/logout`);
    } catch (error) {
      console.error("Error during logout:", error);
      // Continue with local logout even if the API call fails
    } finally {
      // Remove tokens from storage regardless of API response
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    }
  },

  logoutAllDevices: async (): Promise<void> => {
    try {
      await apiClient.post(`${AUTH_PATH}/logout-all`);
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
    } catch (error) {
      console.error("Error during logout from all devices:", error);
      throw error;
    }
  },

  validateToken: async (token: string): Promise<boolean> => {
    try {
      await apiClient.post(`${AUTH_PATH}/validate`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string }> => {
    const response = await apiClient.post<{
      accessToken: string;
      refreshToken?: string;
    }>(`${AUTH_PATH}/refresh-token`, { refreshToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(`${AUTH_PATH}/user`);
    return response.data;
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (!token) return false;

      return await authService.validateToken(token);
    } catch (error) {
      return false;
    }
  },
};

export default authService;
