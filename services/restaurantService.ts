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

  // Food item related endpoints
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
