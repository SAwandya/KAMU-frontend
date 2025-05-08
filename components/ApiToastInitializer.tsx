// components/ApiToastInitializer.tsx
import React from "react";
import useApiToast from "../hooks/useApiToast";

/**
 * Component that initializes the toast notification system
 * for API requests at the app level
 */
export default function ApiToastInitializer() {
  // Initialize the toast system for API requests
  useApiToast();

  // This component doesn't render anything
  return null;
}
