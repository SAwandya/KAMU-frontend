// services/restaurantService.ts
import apiClient from "./apiClient";
import apiConfig from "../config/api.config";

export interface Restaurant {
  id: string | number;
  ownerId?: string | number;
  name: string;
  address: string;
  images: string | string[];
  isAvailable: boolean;
  status: string;
}

export interface FoodItem {
  id: string | number;
  restaurantId: string | number;
  name: string;
  description: string;
  price: number;
  prepareTime: number;
  isPromotion: boolean;
  image?: string;
}

export interface WorkDay {
  id: number | string;
  day: string;
}

export interface WorkHours {
  id: number | string;
  startTime: string;
  endTime: string;
}

export interface RestaurantSchedule {
  id: number | string;
  restaurantId: number | string;
  workDayId: number | string;
  workHoursId: number | string;
  workDay?: WorkDay;
  workHours?: WorkHours;
}

// The restaurant endpoint path (from config)
const RESTAURANT_PATH = apiConfig.endpoints.restaurants;

// Restaurant API service
const restaurantService = {
  // Restaurant related endpoints
  registerRestaurant: async (
    restaurantData: Omit<Restaurant, "id" | "status" | "isAvailable">
  ): Promise<Restaurant> => {
    try {
      const response = await apiClient.post<{ restaurant: Restaurant }>(
        RESTAURANT_PATH,
        restaurantData
      );
      return response.data.restaurant;
    } catch (error) {
      console.error("Error registering restaurant:", error);
      throw new Error("Failed to register restaurant");
    }
  },

  getMyRestaurant: async (): Promise<Restaurant> => {
    try {
      const response = await apiClient.get<{ restaurant: Restaurant }>(
        `${RESTAURANT_PATH}/me`
      );
      return response.data.restaurant;
    } catch (error) {
      console.error("Error fetching my restaurant:", error);
      throw new Error("Failed to fetch restaurant details");
    }
  },

  getRestaurantById: async (id: string | number): Promise<Restaurant> => {
    try {
      const response = await apiClient.get<{ restaurant: Restaurant }>(
        `${RESTAURANT_PATH}/${id}`
      );
      return response.data.restaurant;
    } catch (error) {
      console.error(`Error fetching restaurant with ID ${id}:`, error);
      throw new Error("Failed to fetch restaurant details");
    }
  },

  updateRestaurant: async (
    id: string | number,
    data: Partial<Restaurant>
  ): Promise<Restaurant> => {
    try {
      const response = await apiClient.put<{ restaurant: Restaurant }>(
        `${RESTAURANT_PATH}/${id}`,
        data
      );
      return response.data.restaurant;
    } catch (error) {
      console.error(`Error updating restaurant with ID ${id}:`, error);
      throw new Error("Failed to update restaurant");
    }
  },

  approveRestaurant: async (id: string | number): Promise<Restaurant> => {
    try {
      const response = await apiClient.put<{ restaurant: Restaurant }>(
        `${RESTAURANT_PATH}/${id}/approve`
      );
      return response.data.restaurant;
    } catch (error) {
      console.error(`Error approving restaurant with ID ${id}:`, error);
      throw new Error("Failed to approve restaurant");
    }
  },

  deleteRestaurant: async (id: string | number): Promise<void> => {
    try {
      await apiClient.delete(`${RESTAURANT_PATH}/${id}`);
    } catch (error) {
      console.error(`Error deleting restaurant with ID ${id}:`, error);
      throw new Error("Failed to delete restaurant");
    }
  },

  // Enhanced food item related endpoints
  addFoodItem: async (itemData: Omit<FoodItem, "id">): Promise<FoodItem> => {
    try {
      const response = await apiClient.post<{ foodItem: FoodItem }>(
        `${RESTAURANT_PATH}/menu`,
        itemData
      );
      return response.data.foodItem;
    } catch (error) {
      console.error("Error adding food item:", error);
      throw new Error("Failed to add menu item");
    }
  },

  getFoodItems: async (): Promise<FoodItem[]> => {
    try {
      const response = await apiClient.get<{ foodItems: FoodItem[] }>(
        `${RESTAURANT_PATH}/menu`
      );
      return response.data.foodItems;
    } catch (error) {
      console.error("Error fetching food items:", error);
      throw new Error("Failed to fetch menu items");
    }
  },

  updateFoodItem: async (
    id: string | number,
    data: Partial<FoodItem>
  ): Promise<FoodItem> => {
    try {
      const response = await apiClient.put<{ foodItem: FoodItem }>(
        `${RESTAURANT_PATH}/menu/${id}`,
        data
      );
      return response.data.foodItem;
    } catch (error) {
      console.error(`Error updating food item with ID ${id}:`, error);
      throw new Error("Failed to update menu item");
    }
  },

  deleteFoodItem: async (id: string | number): Promise<void> => {
    try {
      await apiClient.delete(`${RESTAURANT_PATH}/menu/${id}`);
    } catch (error) {
      console.error(`Error deleting food item with ID ${id}:`, error);
      throw new Error("Failed to delete menu item");
    }
  },

  // Enhanced method to get food items by restaurant ID with better error handling and retries
  getFoodItemsByRestaurantId: async (
    restaurantId: string | number,
    retryCount = 2
  ): Promise<FoodItem[]> => {
    try {
      console.log(`Fetching menu items for restaurant ${restaurantId}...`);

      // Define the endpoint
      const endpoint = `${RESTAURANT_PATH}/menu/restaurant/${restaurantId}`;
      console.log(`Menu API endpoint: ${endpoint}`);

      // Make the request
      const response = await apiClient.get<{ foodItems: FoodItem[] }>(endpoint);

      if (!response.data) {
        console.warn(`Empty response data for restaurant ${restaurantId} menu`);
        return [];
      }

      // Check the actual response format
      if (response.data.foodItems) {
        console.log(
          `Successfully loaded ${response.data.foodItems.length} menu items`
        );
        return response.data.foodItems;
      } else if (Array.isArray(response.data)) {
        console.log(
          `Successfully loaded ${response.data.length} menu items (array format)`
        );
        return response.data;
      } else {
        console.warn(
          `Unexpected response format for restaurant menu:`,
          response.data
        );
        return [];
      }
    } catch (error: any) {
      console.error(
        `Error fetching food items for restaurant ${restaurantId}:`,
        error
      );

      // Implement retry logic for network failures
      if (retryCount > 0) {
        console.log(`Retrying menu fetch (${retryCount} attempts left)...`);
        // Wait 1 second before retry
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return restaurantService.getFoodItemsByRestaurantId(
          restaurantId,
          retryCount - 1
        );
      }

      // If there are no more retries, check if we need to handle specific error codes
      if (error.response) {
        if (error.response.status === 404) {
          console.log("Menu not found for this restaurant");
          return [];
        }

        if (error.response.status === 401) {
          throw new Error("Authentication required to view this menu");
        }
      }

      // For network errors or unknown errors, return empty array to avoid crashing
      return [];
    }
  },

  // Schedule related endpoints
  getWorkDays: async (): Promise<WorkDay[]> => {
    try {
      const response = await apiClient.get<{ workDays: WorkDay[] }>(
        `${RESTAURANT_PATH}/work-days`
      );
      return response.data.workDays;
    } catch (error) {
      console.error("Error fetching work days:", error);
      throw new Error("Failed to fetch work days");
    }
  },

  getWorkHours: async (): Promise<WorkHours[]> => {
    try {
      const response = await apiClient.get<{ workHours: WorkHours[] }>(
        `${RESTAURANT_PATH}/work-hours`
      );
      return response.data.workHours;
    } catch (error) {
      console.error("Error fetching work hours:", error);
      throw new Error("Failed to fetch work hours");
    }
  },

  addSchedule: async (
    workDayId: number | string,
    workHoursId: number | string
  ): Promise<RestaurantSchedule> => {
    try {
      const response = await apiClient.post<{ schedule: RestaurantSchedule }>(
        `${RESTAURANT_PATH}/schedules`,
        {
          workDayId,
          workHoursId,
        }
      );
      return response.data.schedule;
    } catch (error) {
      console.error("Error adding schedule entry:", error);
      throw new Error("Failed to add schedule entry");
    }
  },

  getMySchedule: async (): Promise<RestaurantSchedule[]> => {
    try {
      const response = await apiClient.get<{ schedule: RestaurantSchedule[] }>(
        `${RESTAURANT_PATH}/schedules`
      );
      return response.data.schedule;
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw new Error("Failed to fetch schedule");
    }
  },

  // Restaurant orders endpoints
  getRestaurantOrders: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get<{ orders: any[] }>(
        `${RESTAURANT_PATH}/orders`
      );
      return response.data.orders;
    } catch (error) {
      console.error("Error fetching restaurant orders:", error);
      throw new Error("Failed to fetch restaurant orders");
    }
  },
};

export default restaurantService;
