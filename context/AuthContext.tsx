// context/AuthContext.tsx
import React, { createContext, ReactNode, useContext } from "react";
import useAuthHook, { AuthState } from "../hooks/useAuth";
import { User } from "../services/authService";

interface AuthContextProps extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (userData: any) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { login, register, logout, ...rest } = useAuthHook();

  // Map the hook methods to our context methods
  const auth: AuthContextProps = {
    ...rest,
    signIn: login,
    signUp: register,
    signOut: logout,
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Primary context hook - this is what components should use
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

// Keep useAuthContext as an alias for useAuth for compatibility
export const useAuthContext = useAuth;
