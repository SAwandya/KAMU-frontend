// hooks/usePayment.ts
import { useState, useCallback } from "react";
import * as paymentService from "../services/paymentService";
import { PaymentMethod, CardDetails } from "../types/payment";

interface PaymentState {
  loading: boolean;
  error: string | null;
  preferredPaymentMethod: string | null;
  savedCards: CardDetails[];
  currentPayment: paymentService.Payment | null;
  paymentLogs: paymentService.PaymentLog[];
  refunds: paymentService.Refund[];
}

export const usePayment = () => {
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    preferredPaymentMethod: null,
    savedCards: [],
    currentPayment: null,
    paymentLogs: [],
    refunds: [],
  });

  // Initialize payment methods
  const initializePaymentMethods = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [preferredMethod, savedCards] = await Promise.all([
        paymentService.getPreferredPaymentMethod(),
        paymentService.getSavedPaymentMethods(),
      ]);

      setState((prev) => ({
        ...prev,
        preferredPaymentMethod: preferredMethod,
        savedCards,
        loading: false,
      }));

      return { preferredMethod, savedCards };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load payment methods";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return { preferredMethod: null, savedCards: [] };
    }
  }, []);

  // Create payment intent
  const createPaymentIntent = useCallback(
    async (paymentData: paymentService.PaymentData) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const paymentIntent = await paymentService.createPaymentIntent(
          paymentData
        );
        setState((prev) => ({ ...prev, loading: false }));
        return paymentIntent;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create payment intent";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Create checkout session
  const createCheckoutSession = useCallback(
    async (paymentData: paymentService.PaymentData) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const session = await paymentService.createCheckoutSession(paymentData);
        setState((prev) => ({ ...prev, loading: false }));
        return session;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create checkout session";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Get payment by order ID
  const getPaymentByOrderId = useCallback(async (orderId: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const payment = await paymentService.getPaymentByOrderId(orderId);
      setState((prev) => ({
        ...prev,
        currentPayment: payment,
        loading: false,
      }));
      return payment;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payment";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Get payment logs
  const getPaymentLogs = useCallback(async (paymentId: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const logs = await paymentService.getPaymentLogs(paymentId);
      setState((prev) => ({
        ...prev,
        paymentLogs: logs,
        loading: false,
      }));
      return logs;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payment logs";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Get refunds
  const getRefunds = useCallback(async (paymentId: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const refunds = await paymentService.getPaymentRefunds(paymentId);
      setState((prev) => ({
        ...prev,
        refunds,
        loading: false,
      }));
      return refunds;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch refunds";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Request refund
  const requestRefund = useCallback(
    async (paymentIntentId: string, amount?: number, reason?: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const refund = await paymentService.requestRefund(
          paymentIntentId,
          amount,
          reason
        );
        setState((prev) => ({
          ...prev,
          refunds: [...prev.refunds, refund],
          loading: false,
        }));
        return refund;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process refund";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Process payment (simplified version for demo)
  const processPayment = useCallback(
    async (amount: number, paymentMethodId: string, orderId: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const result = await paymentService.processPayment(
          amount,
          paymentMethodId,
          orderId
        );
        setState((prev) => ({ ...prev, loading: false }));

        if (!result.success) {
          setState((prev) => ({
            ...prev,
            error: result.error || "Payment failed",
          }));
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process payment";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Save preferred payment method
  const savePreferredPaymentMethod = useCallback(async (method: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await paymentService.savePaymentMethod(method);
      setState((prev) => ({
        ...prev,
        preferredPaymentMethod: method,
        loading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save payment method";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  // Add new payment card
  const addPaymentCard = useCallback(async (card: CardDetails) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedCards = await paymentService.saveNewPaymentMethod(card);
      setState((prev) => ({
        ...prev,
        savedCards: updatedCards,
        loading: false,
      }));
      return updatedCards;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add payment card";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  // Remove payment card
  const removePaymentCard = useCallback(async (cardId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const updatedCards = await paymentService.removePaymentMethod(cardId);
      setState((prev) => ({
        ...prev,
        savedCards: updatedCards,
        loading: false,
      }));
      return updatedCards;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to remove payment card";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw new Error(errorMessage);
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    initializePaymentMethods,
    createPaymentIntent,
    createCheckoutSession,
    getPaymentByOrderId,
    getPaymentLogs,
    getRefunds,
    requestRefund,
    processPayment,
    savePreferredPaymentMethod,
    addPaymentCard,
    removePaymentCard,
    clearError,
  };
};

export default usePayment;
