// services/userService.ts
import apiClient from "./apiClient";
import { User } from "./authService";

export interface UserAddress {
  id: string | number;
  userId: string | number;
  title: string;
  address: string;
  city: string;
  zipCode: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  phoneNumber?: string;
  avatarUrl?: string;
  addresses?: UserAddress[];
  preferences?: Record<string, any>;
}

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

  // Get user profile with extended information
  getUserProfile: async (userId: string | number): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/users/${userId}`);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (
    userId: string | number,
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>(
      `/users/${userId}`,
      profileData
    );
    return response.data;
  },

  // Add a new address
  addUserAddress: async (
    address: Omit<UserAddress, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<UserAddress> => {
    const response = await apiClient.post<UserAddress>(
      "/users/addresses",
      address
    );
    return response.data;
  },

  // Update an address
  updateUserAddress: async (
    addressId: string | number,
    addressData: Partial<UserAddress>
  ): Promise<UserAddress> => {
    const response = await apiClient.put<UserAddress>(
      `/users/addresses/${addressId}`,
      addressData
    );
    return response.data;
  },

  // Delete an address
  deleteUserAddress: async (addressId: string | number): Promise<void> => {
    await apiClient.delete(`/users/addresses/${addressId}`);
  },

  // Get user addresses
  getUserAddresses: async (): Promise<UserAddress[]> => {
    const response = await apiClient.get<UserAddress[]>("/users/addresses");
    return response.data;
  },

  // Set default address
  setDefaultAddress: async (
    addressId: string | number
  ): Promise<UserAddress> => {
    const response = await apiClient.put<UserAddress>(
      `/users/addresses/${addressId}/default`
    );
    return response.data;
  },

  // Update user avatar
  updateUserAvatar: async (
    userId: string | number,
    avatarFile: FormData
  ): Promise<{ avatarUrl: string }> => {
    const response = await apiClient.post<{ avatarUrl: string }>(
      `/users/${userId}/avatar`,
      avatarFile,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Update user preferences
  updateUserPreferences: async (
    userId: string | number,
    preferences: Record<string, any>
  ): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>(
      `/users/${userId}/preferences`,
      { preferences }
    );
    return response.data;
  },

  // Change user password
  changePassword: async (
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.put<{ success: boolean; message: string }>(
      "/users/password",
      {
        oldPassword,
        newPassword,
      }
    );
    return response.data;
  },
};

export default userService;
