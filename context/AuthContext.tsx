// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

// Define the user type
type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "restaurant" | "driver";
};

// Define the context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem("user");
        if (userJson) {
          setUser(JSON.parse(userJson));
        }
      } catch (error) {
        console.error("Failed to load user from storage", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);

      // In a real app, you would make an API call to your backend
      // For now, we'll simulate a successful login
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email: email,
        role: "customer",
      };

      // Save user to storage
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);

      // Navigate to the main app
      router.replace("/(app)");
    } catch (error) {
      console.error("Sign in failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);

      // In a real app, you would make an API call to your backend
      // For now, we'll simulate a successful registration
      const mockUser: User = {
        id: "1",
        name: name,
        email: email,
        role: "customer",
      };

      // Save user to storage
      await AsyncStorage.setItem("user", JSON.stringify(mockUser));
      setUser(mockUser);

      // Navigate to the main app
      router.replace("/(app)");
    } catch (error) {
      console.error("Sign up failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);

      // Remove user from storage
      await AsyncStorage.removeItem("user");
      setUser(null);

      // Navigate to the auth flow
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
