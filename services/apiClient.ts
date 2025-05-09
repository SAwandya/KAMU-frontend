// services/apiClient.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import apiConfig, { getApiDebugInfo } from "../config/api.config";

// For toast notifications
let showToastFunction:
  | ((
      message: string,
      type: "success" | "error" | "info" | "warning",
      duration?: number
    ) => void)
  | null = null;

// Function to set the toast function from outside
export const setToastFunction = (
  fn: (
    message: string,
    type: "success" | "error" | "info" | "warning",
    duration?: number
  ) => void
) => {
  showToastFunction = fn;
};

// Network Logging for Debugging
const enableNetworkLogging = true; // Set to false in production

// Get API URL from configuration, with platform-specific adjustments
const getApiUrl = () => {
  let url = apiConfig.baseUrl;

  // For mobile devices, localhost/127.0.0.1 refers to the device itself, not your dev machine
  if (__DEV__ && (Platform.OS === "ios" || Platform.OS === "android")) {
    // Replace localhost/127.0.0.1 with your computer's IP address on the local network
    // You can find this via ipconfig (Windows) or ifconfig (Mac/Linux)
    // Example: url = url.replace('localhost', '192.168.1.5');
    // Or using Expo's default dev server if available:
    if (Constants.expoConfig?.hostUri) {
      const hostIp = Constants.expoConfig.hostUri.split(":")[0];
      if (hostIp) {
        url = url.replace(/localhost|127\.0\.0\.1/, hostIp);
        console.log(
          `📱 Mobile device detected! Using IP: ${hostIp} instead of localhost`
        );
      }
    } else {
      // If you know your dev machine's IP address, uncomment and set it here:
      // url = url.replace(/localhost|127\.0\.0\.1/, '192.168.1.x');
      console.warn(
        "❗ Mobile device detected but no hostUri found. You may need to manually set your dev machine IP."
      );
    }
  }

  return url;
};

const API_URL = getApiUrl();

// Log API configuration on startup
if (__DEV__) {
  console.log("📡 API Configuration:", getApiDebugInfo());
  console.log("🔌 Active API URL:", API_URL);
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 3000, // Default timeout of 10 seconds
});

// Network Logger
if (enableNetworkLogging) {
  apiClient.interceptors.request.use((request) => {
    console.log("🚀 API Request:", {
      url: request.baseURL + request.url,
      method: request.method?.toUpperCase(),
      headers: request.headers,
      data: request.data,
      params: request.params,
    });
    return request;
  });

  apiClient.interceptors.response.use(
    (response) => {
      console.log("✅ API Response:", {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
      });
      return response;
    },
    (error) => {
      console.log("❌ API Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      });
      return Promise.reject(error);
    }
  );
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Get the access token from secure storage
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If error is 401 Unauthorized and it's not a retry attempt
    if (
      error.response?.status === 401 &&
      !originalRequest?.headers["X-Retry"]
    ) {
      // Try to refresh the token
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        if (refreshToken) {
          // Call auth service to get a new token using the refresh token
          const response = await axios.post(
            `${API_URL}${apiConfig.endpoints.auth}/refresh-token`,
            {
              refreshToken,
            }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Store new tokens
          await SecureStore.setItemAsync("accessToken", accessToken);
          if (newRefreshToken) {
            await SecureStore.setItemAsync("refreshToken", newRefreshToken);
          }

          // Retry original request with new token
          if (originalRequest) {
            originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
            originalRequest.headers["X-Retry"] = "true";
            return axios(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh token is invalid, show error toast
        if (showToastFunction) {
          showToastFunction("Session expired. Please log in again.", "error");
        }

        // Clear stored tokens
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
      }
    }

    // For all other errors, show toast message if function is available
    if (showToastFunction) {
      // Extract error message
      const errorMessage = getErrorMessage(error);
      showToastFunction(errorMessage, "error", 3000);
    }

    return Promise.reject(error);
  }
);

// Helper to extract meaningful error messages
const getErrorMessage = (error: AxiosError) => {
  if (error.response) {
    // If the server responded with a message
    const data = error.response.data as any;
    if (data.message) {
      return data.message;
    } else if (typeof data === "string") {
      return data;
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 400:
        return "Bad request. Please check your input.";
      case 401:
        return "Unauthorized. Please log in again.";
      case 403:
        return "Forbidden. You don't have permission to access this resource.";
      case 404:
        return "Resource not found.";
      case 422:
        return "Validation error. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      default:
        return `Error ${error.response.status}: Something went wrong.`;
    }
  }

  if (error.request) {
    if (error.message.includes("timeout")) {
      return `Connection timeout. Server at ${API_URL} might be down or unreachable.`;
    }
    return `Network error. Please check your connection or server availability.`;
  }

  // Something else happened while setting up the request
  return error.message || "An unexpected error occurred.";
};

export default apiClient;

// For testing connection during development
export const testApiConnection = async () => {
  try {
    console.log("Testing API connection to:", API_URL);

    // Try multiple endpoints to check if any of them are available
    const endpoints = [
      `${API_URL}${apiConfig.endpoints.auth}/health`,
      `${API_URL}/health-check`,
      `${API_URL}${apiConfig.endpoints.auth}`,
      `${API_URL}`,
      // Try without the /api path as well
      API_URL.replace("/api", ""),
    ];

    for (const url of endpoints) {
      try {
        console.log(`Attempting connection to: ${url}`);
        const response = await axios.get(url, { timeout: 3000 });
        console.log("API connection successful:", response.data);
        return { success: true, data: response.data, apiUrl: url };
      } catch (error) {
        console.log(`Failed to connect to ${url}:`, error.message);
        // Continue to the next endpoint
      }
    }

    // If we reach here, all connection attempts failed
    throw new Error("All connection attempts failed");
  } catch (error) {
    console.error("API connection failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      apiUrl: API_URL,
    };
  }
};
