// services/orderService.ts
import apiClient from "./apiClient";
import * as SecureStore from "expo-secure-store";
import apiConfig from "../config/api.config";

// The order endpoint path (from config)
const ORDERS_PATH = apiConfig.endpoints.orders;

// Order status constants
export enum ORDER_STATUS {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export interface OrderItem {
  id?: number | string;
  orderId?: number | string;
  foodItemId: number | string;
  quantity: number;
  price: number;
  name?: string; // For display purposes
}

export interface Order {
  id?: number | string;
  customerId: number | string;
  restaurantId: number | string;
  totalBill: number;
  deliveryFee?: number;
  status: ORDER_STATUS | string;
  orderPrepareTime?: string | null;
  riderId?: number | string | null;
  paymentId?: number | string | null;
  deliveryId?: number | string | null;
  createdAt?: string;
  updatedAt?: string;
  items: OrderItem[];
}

// Order API service
const orderService = {
  // Create a new order
  createOrder: async (
    orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "status">
  ): Promise<Order> => {
    try {
      // The apiClient interceptor will automatically add the auth token
      console.log("Creating order...");

      const response = await apiClient.post<{ message: string; order: Order }>(
        `${ORDERS_PATH}`,
        orderData
      );

      console.log("Order created successfully:", response.data.order.id);
      return response.data.order;
    } catch (error) {
      console.error("Order placement failed:", error);
      throw error;
    }
  },

  // Get an order by ID
  getOrderById: async (orderId: number | string): Promise<Order> => {
    try {
      const response = await apiClient.get<Order>(`${ORDERS_PATH}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get order ${orderId}:`, error);
      throw error;
    }
  },

  // Get the customer's latest order
  getLatestOrder: async (): Promise<Order> => {
    try {
      const response = await apiClient.get<Order>(`${ORDERS_PATH}/latest`);
      return response.data;
    } catch (error) {
      console.error("Failed to get latest order:", error);
      throw error;
    }
  },

  // Update an order (customer)
  updateOrder: async (
    orderId: number | string,
    updateData: Partial<Order>
  ): Promise<{ message: string; order: Order }> => {
    try {
      const response = await apiClient.put<{ message: string; order: Order }>(
        `${ORDERS_PATH}/${orderId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update order ${orderId}:`, error);
      throw error;
    }
  },

  // Update an order from a microservice (internal)
  updateOrderFromService: async (
    orderId: number | string,
    updateData: Partial<Order>,
    serviceToken: string
  ): Promise<{ message: string; order: Order }> => {
    try {
      const response = await apiClient.put<{ message: string; order: Order }>(
        `${ORDERS_PATH}/service/${orderId}`,
        updateData,
        {
          headers: {
            "x-service-token": serviceToken,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to update order ${orderId} from service:`, error);
      throw error;
    }
  },

  // Cancel an order
  cancelOrder: async (
    orderId: number | string
  ): Promise<{ message: string; order: Order }> => {
    try {
      return orderService.updateOrder(orderId, {
        status: ORDER_STATUS.CANCELLED,
      });
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  },

  // Get customer orders (with pagination)
  getCustomerOrders: async (
    page = 1,
    limit = 10,
    status?: ORDER_STATUS
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    try {
      let url = `${ORDERS_PATH}/customer?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      // The apiClient interceptor will automatically add the auth token
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Failed to get customer orders:", error);
      throw error;
    }
  },
};

export default orderService;
