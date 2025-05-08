import { useState, useEffect, useCallback } from "react";
import {
  getPreferredPaymentMethod,
  getSavedPaymentMethods,
  savePaymentMethod,
  PAYMENT_METHODS,
} from "../services/paymentService";
import { CardDetails } from "../types/payment";

export default function usePaymentMethods() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferredMethod, setPreferredMethod] = useState<string | null>(null);
  const [savedCards, setSavedCards] = useState<CardDetails[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const loadPaymentData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [preferredMethodResult, cards] = await Promise.all([
        getPreferredPaymentMethod(),
        getSavedPaymentMethods(),
      ]);

      setSavedCards(cards);
      setPreferredMethod(preferredMethodResult || PAYMENT_METHODS.CARD);

      // If a card is the preferred method and we have saved cards, select the first one
      if (preferredMethodResult === PAYMENT_METHODS.CARD && cards.length > 0) {
        setSelectedCardId(cards[0].id);
      }
    } catch (err) {
      setError("Failed to load payment methods");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePreferredMethod = useCallback(async (method: string) => {
    try {
      await savePaymentMethod(method);
      setPreferredMethod(method);
    } catch (err) {
      setError("Failed to update payment method");
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadPaymentData();
  }, [loadPaymentData]);

  return {
    isLoading,
    error,
    preferredMethod,
    savedCards,
    selectedCardId,
    setSelectedCardId,
    updatePreferredMethod,
    refreshPaymentMethods: loadPaymentData,
  };
}
