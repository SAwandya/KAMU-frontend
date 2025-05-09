// hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import authService, { User } from "../services/authService";
import { router } from "expo-router";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have an access token
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
          return;
        }

        // Validate token and get user data
        const isValid = await authService.validateToken(token);
        if (isValid) {
          const userData = await authService.getCurrentUser();
          setState({
            user: userData,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } else {
          // Token is invalid, try refresh
          try {
            const refreshToken = await SecureStore.getItemAsync("refreshToken");
            if (refreshToken) {
              const tokens = await authService.refreshToken(refreshToken);
              if (tokens.accessToken) {
                await SecureStore.setItemAsync(
                  "accessToken",
                  tokens.accessToken
                );
                if (tokens.refreshToken) {
                  await SecureStore.setItemAsync(
                    "refreshToken",
                    tokens.refreshToken
                  );
                }
                // After refreshing token, get user data
                const userData = await authService.getCurrentUser();
                setState({
                  user: userData,
                  isLoading: false,
                  isAuthenticated: true,
                  error: null,
                });
              }
            } else {
              setState({
                user: null,
                isLoading: false,
                isAuthenticated: false,
                error: null,
              });
            }
          } catch (error) {
            // If refresh fails, clear tokens
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("refreshToken");
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
              error: null,
            });
          }
        }
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error:
            error instanceof Error
              ? error.message
              : "Authentication check failed",
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        const user = await authService.login({ email, password });

        // Verify token was properly saved
        const token = await SecureStore.getItemAsync("accessToken");
        if (!token) {
          console.error("Failed to save access token after login");
          throw new Error("Authentication failed - token not saved");
        } else {
          console.log("✅ Token successfully saved after login");
        }

        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        return true;
      } catch (error) {
        // Toast notification will be handled by the apiClient interceptor
        console.error("Login error:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Login failed",
        }));
        return false;
      }
    },
    []
  );

  const register = useCallback(
    async (userData: any): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));
        await authService.registerCustomer({
          fullName: userData.fullName || userData.name,
          email: userData.email,
          password: userData.password,
        });

        // Auto login after successful registration
        return await login(userData.email, userData.password);
      } catch (error) {
        // Toast notification will be handled by the apiClient interceptor
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Registration failed",
        }));
        return false;
      }
    },
    [login]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      await authService.logout();

      // Clear stored tokens
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");

      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });

      router.replace("/(auth)/login");
    } catch (error) {
      // Toast notification will be handled by the apiClient interceptor
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Logout failed",
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    clearError,
  };
};

export default useAuth;
