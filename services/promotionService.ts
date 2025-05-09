// services/promotionService.ts
import apiClient from "./apiClient";

export interface Promotion {
  id: number | string;
  code: string;
  type: "percentage" | "fixed";
  amount: number;
  maxDiscount?: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  applicableRestaurants: Array<number | string>;
  applicableUsers: Array<number | string>;
  status: "active" | "inactive" | "expired";
}

export interface PromoValidationResult {
  valid: boolean;
  message: string;
  discountAmount?: number;
  newTotal?: number;
  promo?: Promotion;
}

export interface PromoRedemptionRequest {
  code: string;
  userId: number | string;
  orderId: number | string;
}

export interface PromoValidationRequest {
  code: string;
  userId: number | string;
  restaurantId: number | string;
  cartTotal: number;
}

const promotionService = {
  // Validate a promotion code
  validatePromotion: async (
    validationData: PromoValidationRequest
  ): Promise<PromoValidationResult> => {
    try {
      const response = await apiClient.post<PromoValidationResult>(
        "/promotions/validate",
        validationData
      );
      return response.data;
    } catch (error) {
      console.error("Error validating promotion:", error);
      return {
        valid: false,
        message: "Error validating promotion code",
      };
    }
  },

  // Redeem a promotion code
  redeemPromotion: async (
    redemptionData: PromoRedemptionRequest
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>("/promotions/redeem", redemptionData);
      return response.data;
    } catch (error) {
      console.error("Error redeeming promotion:", error);
      return {
        success: false,
        message: "Failed to redeem promotion",
      };
    }
  },

  // Get active promotions
  getActivePromotions: async (): Promise<Promotion[]> => {
    try {
      const response = await apiClient.get<Promotion[]>("/promotions/active");
      return response.data;
    } catch (error) {
      console.error("Error fetching active promotions:", error);
      return [];
    }
  },

  // Get promotion by code
  getPromotionByCode: async (code: string): Promise<Promotion | null> => {
    try {
      const response = await apiClient.get<Promotion>(`/promotions/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching promotion with code ${code}:`, error);
      return null;
    }
  },

  // Create a new promotion (admin only)
  createPromotion: async (
    promotionData: Omit<Promotion, "id">
  ): Promise<Promotion> => {
    try {
      const response = await apiClient.post<Promotion>(
        "/promotions",
        promotionData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw new Error("Failed to create promotion");
    }
  },
};

export default promotionService;
