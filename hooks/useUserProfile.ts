// hooks/useUserProfile.ts
import { useState, useCallback } from "react";
import userService, { UserProfile, UserAddress } from "../services/userService";
import { useAuthContext } from "../context/AuthContext";

interface UserProfileState {
  profile: UserProfile | null;
  addresses: UserAddress[];
  loading: boolean;
  error: string | null;
}

export const useUserProfile = () => {
  const { user } = useAuthContext();
  const [state, setState] = useState<UserProfileState>({
    profile: null,
    addresses: [],
    loading: false,
    error: null,
  });

  // Load user profile
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return null;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const profile = await userService.getUserProfile(user.id);
      setState((prev) => ({
        ...prev,
        profile,
        addresses: profile.addresses || [],
        loading: false,
      }));
      return profile;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load user profile";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, [user?.id]);

  // Update user profile
  const updateProfile = useCallback(
    async (profileData: Partial<UserProfile>) => {
      if (!user?.id) {
        setState((prev) => ({ ...prev, error: "User not authenticated" }));
        return null;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedProfile = await userService.updateUserProfile(
          user.id,
          profileData
        );
        setState((prev) => ({
          ...prev,
          profile: updatedProfile,
          addresses: updatedProfile.addresses || prev.addresses,
          loading: false,
        }));
        return updatedProfile;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update user profile";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    [user?.id]
  );

  // Load user addresses
  const loadAddresses = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const addresses = await userService.getUserAddresses();
      setState((prev) => ({
        ...prev,
        addresses,
        loading: false,
      }));
      return addresses;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load addresses";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Add address
  const addAddress = useCallback(
    async (
      address: Omit<UserAddress, "id" | "userId" | "createdAt" | "updatedAt">
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newAddress = await userService.addUserAddress(address);
        setState((prev) => ({
          ...prev,
          addresses: [...prev.addresses, newAddress],
          loading: false,
        }));
        return newAddress;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to add address";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Update address
  const updateAddress = useCallback(
    async (addressId: string | number, addressData: Partial<UserAddress>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedAddress = await userService.updateUserAddress(
          addressId,
          addressData
        );
        setState((prev) => ({
          ...prev,
          addresses: prev.addresses.map((addr) =>
            addr.id === addressId ? updatedAddress : addr
          ),
          loading: false,
        }));
        return updatedAddress;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update address";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Delete address
  const deleteAddress = useCallback(async (addressId: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await userService.deleteUserAddress(addressId);
      setState((prev) => ({
        ...prev,
        addresses: prev.addresses.filter((addr) => addr.id !== addressId),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete address";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  // Set default address
  const setDefaultAddress = useCallback(async (addressId: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedAddress = await userService.setDefaultAddress(addressId);
      setState((prev) => ({
        ...prev,
        addresses: prev.addresses.map((addr) => ({
          ...addr,
          isDefault: addr.id === addressId,
        })),
        loading: false,
      }));
      return updatedAddress;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to set default address";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  // Update user avatar
  const updateAvatar = useCallback(
    async (avatarFile: FormData) => {
      if (!user?.id) {
        setState((prev) => ({ ...prev, error: "User not authenticated" }));
        return null;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { avatarUrl } = await userService.updateUserAvatar(
          user.id,
          avatarFile
        );

        setState((prev) => ({
          ...prev,
          profile: prev.profile ? { ...prev.profile, avatarUrl } : null,
          loading: false,
        }));

        return avatarUrl;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update avatar";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    [user?.id]
  );

  // Change password
  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await userService.changePassword(
          oldPassword,
          newPassword
        );
        setState((prev) => ({ ...prev, loading: false }));
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to change password";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Update user preferences
  const updatePreferences = useCallback(
    async (preferences: Record<string, any>) => {
      if (!user?.id) {
        setState((prev) => ({ ...prev, error: "User not authenticated" }));
        return null;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedProfile = await userService.updateUserPreferences(
          user.id,
          preferences
        );

        setState((prev) => ({
          ...prev,
          profile: updatedProfile,
          loading: false,
        }));

        return updatedProfile;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update preferences";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    [user?.id]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadUserProfile,
    updateProfile,
    loadAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    updateAvatar,
    changePassword,
    updatePreferences,
    clearError,
  };
};

export default useUserProfile;
