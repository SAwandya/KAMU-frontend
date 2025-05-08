// hooks/useApiToast.ts
import { useEffect } from "react";
import { useToast } from "../context/ToastContext";
import { setToastFunction } from "../services/apiClient";

/**
 * Hook to initialize toast notifications for API requests
 * This hook connects our toast system with the API client
 */
export const useApiToast = () => {
  const { showToast } = useToast();

  useEffect(() => {
    // Set the toast function in the API client
    setToastFunction(showToast);

    // No cleanup needed since the toast function is global
  }, [showToast]);
};

export default useApiToast;
