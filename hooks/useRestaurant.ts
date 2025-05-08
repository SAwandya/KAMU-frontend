// hooks/useRestaurant.ts
import { useState, useCallback } from "react";
import restaurantService, {
  Restaurant,
  FoodItem,
  WorkDay,
  WorkHours,
  RestaurantSchedule,
} from "../services/restaurantService";

interface RestaurantState {
  restaurants: Restaurant[];
  restaurant: Restaurant | null;
  menuItems: FoodItem[];
  workDays: WorkDay[];
  workHours: WorkHours[];
  schedule: RestaurantSchedule[];
  loading: boolean;
  error: string | null;
}

export const useRestaurant = () => {
  const [state, setState] = useState<RestaurantState>({
    restaurants: [],
    restaurant: null,
    menuItems: [],
    workDays: [],
    workHours: [],
    schedule: [],
    loading: false,
    error: null,
  });

  // Get a restaurant by ID
  const getRestaurantById = useCallback(async (id: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const restaurant = await restaurantService.getMyRestaurant();
      setState((prev) => ({ ...prev, restaurant, loading: false }));
      return restaurant;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch restaurant";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Get menu items for a restaurant
  const getMenuItems = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const menuItems = await restaurantService.getFoodItems();
      setState((prev) => ({ ...prev, menuItems, loading: false }));
      return menuItems;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch menu items";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Add a new menu item
  const addMenuItem = useCallback(async (item: Omit<FoodItem, "id">) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const newItem = await restaurantService.addFoodItem(item);
      setState((prev) => ({
        ...prev,
        menuItems: [...prev.menuItems, newItem],
        loading: false,
      }));
      return newItem;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add menu item";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  // Update a menu item
  const updateMenuItem = useCallback(
    async (id: string | number, item: Partial<FoodItem>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedItem = await restaurantService.updateFoodItem(id, item);
        setState((prev) => ({
          ...prev,
          menuItems: prev.menuItems.map((menuItem) =>
            menuItem.id === id ? updatedItem : menuItem
          ),
          loading: false,
        }));
        return updatedItem;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update menu item";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Delete a menu item
  const deleteMenuItem = useCallback(async (id: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await restaurantService.deleteFoodItem(id);
      setState((prev) => ({
        ...prev,
        menuItems: prev.menuItems.filter((item) => item.id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete menu item";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  // Get work days
  const getWorkDays = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const workDays = await restaurantService.getWorkDays();
      setState((prev) => ({ ...prev, workDays, loading: false }));
      return workDays;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch work days";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Get work hours
  const getWorkHours = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const workHours = await restaurantService.getWorkHours();
      setState((prev) => ({ ...prev, workHours, loading: false }));
      return workHours;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch work hours";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Get restaurant schedule
  const getSchedule = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const schedule = await restaurantService.getMySchedule();
      setState((prev) => ({ ...prev, schedule, loading: false }));
      return schedule;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch schedule";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Add schedule entry
  const addScheduleEntry = useCallback(
    async (workDayId: number | string, workHoursId: number | string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newScheduleEntry = await restaurantService.addSchedule(
          workDayId,
          workHoursId
        );
        setState((prev) => ({
          ...prev,
          schedule: [...prev.schedule, newScheduleEntry],
          loading: false,
        }));
        return newScheduleEntry;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to add schedule entry";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Get restaurant orders
  const getRestaurantOrders = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const orders = await restaurantService.getRestaurantOrders();
      setState((prev) => ({ ...prev, loading: false }));
      return orders;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch restaurant orders";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    getRestaurantById,
    getMenuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getWorkDays,
    getWorkHours,
    getSchedule,
    addScheduleEntry,
    getRestaurantOrders,
    clearError,
  };
};

export default useRestaurant;
