// hooks/useOrder.ts
import { useState, useCallback } from "react";
import orderService, { Order, ORDER_STATUS } from "../services/orderService";

interface OrderState {
  currentOrder: Order | null;
  latestOrder: Order | null;
  loading: boolean;
  error: string | null;
}

export const useOrder = () => {
  const [state, setState] = useState<OrderState>({
    currentOrder: null,
    latestOrder: null,
    loading: false,
    error: null,
  });

  // Create a new order
  const createOrder = useCallback(
    async (
      orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "status">
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newOrder = await orderService.createOrder(orderData);
        setState((prev) => ({
          ...prev,
          currentOrder: newOrder,
          latestOrder: newOrder,
          loading: false,
        }));
        return newOrder;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create order";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Get order by ID
  const getOrderById = useCallback(async (orderId: number | string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const order = await orderService.getOrderById(orderId);
      setState((prev) => ({
        ...prev,
        currentOrder: order,
        loading: false,
      }));
      return order;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch order";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  // Get latest order
  const getLatestOrder = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const order = await orderService.getLatestOrder();
      setState((prev) => ({
        ...prev,
        latestOrder: order,
        currentOrder: order,
        loading: false,
      }));
      return order;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch latest order";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Update order
  const updateOrder = useCallback(
    async (orderId: number | string, updateData: Partial<Order>) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { order } = await orderService.updateOrder(orderId, updateData);
        setState((prev) => ({
          ...prev,
          currentOrder: order,
          latestOrder:
            state.latestOrder?.id === order.id ? order : state.latestOrder,
          loading: false,
        }));
        return order;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update order";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    [state.latestOrder?.id]
  );

  // Cancel order
  const cancelOrder = useCallback(
    async (orderId: number | string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const { order } = await orderService.cancelOrder(orderId);
        setState((prev) => ({
          ...prev,
          currentOrder: order,
          latestOrder:
            state.latestOrder?.id === order.id ? order : state.latestOrder,
          loading: false,
        }));
        return order;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to cancel order";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    [state.latestOrder?.id]
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createOrder,
    getOrderById,
    getLatestOrder,
    updateOrder,
    cancelOrder,
    clearError,
  };
};

export default useOrder;
