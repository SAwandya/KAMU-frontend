// services/restaurantService.ts
import apiClient from "./apiClient";

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

// Restaurant API service
const restaurantService = {
  // Restaurant related endpoints
  registerRestaurant: async (
    restaurantData: Omit<Restaurant, "id" | "status" | "isAvailable">
  ): Promise<Restaurant> => {
    const response = await apiClient.post<{ restaurant: Restaurant }>(
      "/restaurant",
      restaurantData
    );
    return response.data.restaurant;
  },

  getMyRestaurant: async (): Promise<Restaurant> => {
    const response = await apiClient.get<{ restaurant: Restaurant }>(
      "/restaurant/me"
    );
    return response.data.restaurant;
  },

  updateRestaurant: async (
    id: string | number,
    data: Partial<Restaurant>
  ): Promise<Restaurant> => {
    const response = await apiClient.put<{ restaurant: Restaurant }>(
      `/restaurant/${id}`,
      data
    );
    return response.data.restaurant;
  },

  approveRestaurant: async (id: string | number): Promise<Restaurant> => {
    const response = await apiClient.put<{ restaurant: Restaurant }>(
      `/restaurant/${id}/approve`
    );
    return response.data.restaurant;
  },

  deleteRestaurant: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/restaurant/${id}`);
  },

  // Food item related endpoints
  addFoodItem: async (itemData: Omit<FoodItem, "id">): Promise<FoodItem> => {
    const response = await apiClient.post<{ foodItem: FoodItem }>(
      "/restaurant/menu",
      itemData
    );
    return response.data.foodItem;
  },

  getFoodItems: async (): Promise<FoodItem[]> => {
    const response = await apiClient.get<{ foodItems: FoodItem[] }>(
      "/restaurant/menu"
    );
    return response.data.foodItems;
  },

  updateFoodItem: async (
    id: string | number,
    data: Partial<FoodItem>
  ): Promise<FoodItem> => {
    const response = await apiClient.put<{ foodItem: FoodItem }>(
      `/restaurant/menu/${id}`,
      data
    );
    return response.data.foodItem;
  },

  deleteFoodItem: async (id: string | number): Promise<void> => {
    await apiClient.delete(`/restaurant/menu/${id}`);
  },

  // Schedule related endpoints
  getWorkDays: async (): Promise<WorkDay[]> => {
    const response = await apiClient.get<{ workDays: WorkDay[] }>(
      "/restaurant/work-days"
    );
    return response.data.workDays;
  },

  getWorkHours: async (): Promise<WorkHours[]> => {
    const response = await apiClient.get<{ workHours: WorkHours[] }>(
      "/restaurant/work-hours"
    );
    return response.data.workHours;
  },

  addSchedule: async (
    workDayId: number | string,
    workHoursId: number | string
  ): Promise<RestaurantSchedule> => {
    const response = await apiClient.post<{ schedule: RestaurantSchedule }>(
      "/restaurant/schedules",
      {
        workDayId,
        workHoursId,
      }
    );
    return response.data.schedule;
  },

  getMySchedule: async (): Promise<RestaurantSchedule[]> => {
    const response = await apiClient.get<{ schedule: RestaurantSchedule[] }>(
      "/restaurant/schedules"
    );
    return response.data.schedule;
  },

  // Restaurant orders endpoints
  getRestaurantOrders: async (): Promise<any[]> => {
    const response = await apiClient.get<{ orders: any[] }>(
      "/restaurant/orders"
    );
    return response.data.orders;
  },
};

export default restaurantService;
