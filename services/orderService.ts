// services/orderService.ts
import apiClient from "./apiClient";

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
    const response = await apiClient.post<{ message: string; order: Order }>(
      "/orders",
      orderData
    );
    return response.data.order;
  },

  // Get an order by ID
  getOrderById: async (orderId: number | string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  // Get the customer's latest order
  getLatestOrder: async (): Promise<Order> => {
    const response = await apiClient.get<Order>("/orders/latest");
    return response.data;
  },

  // Update an order (customer)
  updateOrder: async (
    orderId: number | string,
    updateData: Partial<Order>
  ): Promise<{ message: string; order: Order }> => {
    const response = await apiClient.put<{ message: string; order: Order }>(
      `/orders/${orderId}`,
      updateData
    );
    return response.data;
  },

  // Update an order from a microservice (internal)
  updateOrderFromService: async (
    orderId: number | string,
    updateData: Partial<Order>,
    serviceToken: string
  ): Promise<{ message: string; order: Order }> => {
    const response = await apiClient.put<{ message: string; order: Order }>(
      `/orders/service/${orderId}`,
      updateData,
      {
        headers: {
          "x-service-token": serviceToken,
        },
      }
    );
    return response.data;
  },

  // Cancel an order
  cancelOrder: async (
    orderId: number | string
  ): Promise<{ message: string; order: Order }> => {
    return orderService.updateOrder(orderId, {
      status: ORDER_STATUS.CANCELLED,
    });
  },
};

export default orderService;
