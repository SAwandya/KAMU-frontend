// services/apiClient.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from "expo-secure-store";


// Get API URL from environment variables or constants
const API_URL =
  Constants.expoConfig?.extra?.apiUrl || "http://192.168.241.187:80/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // You can add auth token here
    const token = await SecureStore.getItemAsync("token");
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
  (error: AxiosError) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe redirect to login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
