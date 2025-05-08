// config/api.config.ts

/**
 * API Configuration for different environments
 *
 * This allows for easy switching between different API endpoints
 * based on the current development environment and device type.
 */

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    auth: string;
    restaurants: string;
    users: string;
    orders: string;
    delivery: string;
    payment: string;
    promotion: string;
  };
}

// Available environments
interface Environments {
  development: ApiConfig;
  staging: ApiConfig;
  production: ApiConfig;
  local: ApiConfig;
}

// Define all environment configurations
const environments: Environments = {
  development: {
    baseUrl: "http://localhost:80/api",
    endpoints: {
      auth: "/auth",
      restaurants: "/restaurants",
      users: "/users",
      orders: "/orders",
      delivery: "/delivery",
      payment: "/payment",
      promotion: "/promotion",
    },
  },
  staging: {
    baseUrl: "https://staging-api.kamuapp.com/api",
    endpoints: {
      auth: "/auth",
      restaurants: "/restaurants",
      users: "/users",
      orders: "/orders",
      delivery: "/delivery",
      payment: "/payment",
      promotion: "/promotion",
    },
  },
  production: {
    baseUrl: "https://api.kamuapp.com/api",
    endpoints: {
      auth: "/auth",
      restaurants: "/restaurants",
      users: "/users",
      orders: "/orders",
      delivery: "/delivery",
      payment: "/payment",
      promotion: "/promotion",
    },
  },
  local: {
    // Fixed IP address that matches your computer's WiFi IP
    baseUrl: "http://192.168.8.160:80/api",
    endpoints: {
      auth: "/auth",
      restaurants: "/restaurants",
      users: "/users",
      orders: "/orders",
      delivery: "/delivery",
      payment: "/payment",
      promotion: "/promotion",
    },
  },
};

// Set the active environment
const activeEnvironment = "local";

// Export the active configuration
const apiConfig: ApiConfig =
  environments[activeEnvironment as keyof Environments];

// Helper function to expose debugging information
export const getApiDebugInfo = () => {
  return {
    activeEnvironment,
    baseUrl: apiConfig.baseUrl,
    fullUrl: {
      auth: `${apiConfig.baseUrl}${apiConfig.endpoints.auth}`,
      restaurants: `${apiConfig.baseUrl}${apiConfig.endpoints.restaurants}`,
      users: `${apiConfig.baseUrl}${apiConfig.endpoints.users}`,
      orders: `${apiConfig.baseUrl}${apiConfig.endpoints.orders}`,
      delivery: `${apiConfig.baseUrl}${apiConfig.endpoints.delivery}`,
      payment: `${apiConfig.baseUrl}${apiConfig.endpoints.payment}`,
      promotion: `${apiConfig.baseUrl}${apiConfig.endpoints.promotion}`,
    },
  };
};

export default apiConfig;
