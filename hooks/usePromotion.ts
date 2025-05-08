// hooks/usePromotion.ts
import { useState, useCallback } from "react";
import promotionService, {
  Promotion,
  PromoValidationResult,
  PromoValidationRequest,
  PromoRedemptionRequest,
} from "../services/promotionService";
import { useAuthContext } from "../context/AuthContext";

interface PromotionState {
  activePromotions: Promotion[];
  validationResult: PromoValidationResult | null;
  currentPromotion: Promotion | null;
  loading: boolean;
  error: string | null;
}

export const usePromotion = () => {
  const { user } = useAuthContext();
  const [state, setState] = useState<PromotionState>({
    activePromotions: [],
    validationResult: null,
    currentPromotion: null,
    loading: false,
    error: null,
  });

  // Get active promotions
  const fetchActivePromotions = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const promotions = await promotionService.getActivePromotions();
      setState((prev) => ({
        ...prev,
        activePromotions: promotions,
        loading: false,
      }));
      return promotions;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch active promotions";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return [];
    }
  }, []);

  // Get promotion by code
  const getPromotionByCode = useCallback(async (code: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const promotion = await promotionService.getPromotionByCode(code);
      setState((prev) => ({
        ...prev,
        currentPromotion: promotion,
        loading: false,
      }));
      return promotion;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch promotion";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Validate a promotion code
  const validatePromoCode = useCallback(
    async (data: Omit<PromoValidationRequest, "userId">) => {
      if (!user?.id) {
        const errorMessage =
          "User must be authenticated to validate promotion codes";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return { valid: false, message: errorMessage };
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const validationData: PromoValidationRequest = {
          ...data,
          userId: user.id,
        };

        const result = await promotionService.validatePromotion(validationData);

        setState((prev) => ({
          ...prev,
          validationResult: result,
          currentPromotion: result.promo || null,
          loading: false,
        }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to validate promotion code";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        return { valid: false, message: errorMessage };
      }
    },
    [user?.id]
  );

  // Redeem a promotion code
  const redeemPromoCode = useCallback(
    async (code: string, orderId: string | number) => {
      if (!user?.id) {
        const errorMessage =
          "User must be authenticated to redeem promotion codes";
        setState((prev) => ({ ...prev, error: errorMessage }));
        return { success: false, message: errorMessage };
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const redemptionData: PromoRedemptionRequest = {
          code,
          userId: user.id,
          orderId,
        };

        const result = await promotionService.redeemPromotion(redemptionData);
        setState((prev) => ({ ...prev, loading: false }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to redeem promotion code";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        return { success: false, message: errorMessage };
      }
    },
    [user?.id]
  );

  // Create a new promotion (admin only)
  const createPromotion = useCallback(
    async (promotionData: Omit<Promotion, "id">) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newPromotion = await promotionService.createPromotion(
          promotionData
        );
        setState((prev) => ({
          ...prev,
          activePromotions: [...prev.activePromotions, newPromotion],
          loading: false,
        }));
        return newPromotion;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create promotion";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const clearValidationResult = useCallback(() => {
    setState((prev) => ({ ...prev, validationResult: null }));
  }, []);

  return {
    ...state,
    fetchActivePromotions,
    getPromotionByCode,
    validatePromoCode,
    redeemPromoCode,
    createPromotion,
    clearError,
    clearValidationResult,
  };
};

export default usePromotion;
