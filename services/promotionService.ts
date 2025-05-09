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
      // Validate inputs to prevent null payloads
      if (!validationData) {
        throw new Error("Validation data is required");
      }

      if (!validationData.code) {
        return {
          valid: false,
          message: "Promotion code is required",
        };
      }

      if (!validationData.userId) {
        return {
          valid: false,
          message: "User ID is required to validate promotion",
        };
      }

      if (!validationData.restaurantId) {
        return {
          valid: false,
          message: "Restaurant ID is required for promotion validation",
        };
      }

      if (
        validationData.cartTotal === undefined ||
        validationData.cartTotal < 0
      ) {
        return {
          valid: false,
          message: "Valid cart total is required",
        };
      }

      // Ensure the object is fully defined with all properties
      const payload: PromoValidationRequest = {
        code: validationData.code,
        userId: validationData.userId,
        restaurantId: validationData.restaurantId,
        cartTotal: validationData.cartTotal,
      };

      console.log("Validating promotion with payload:", payload);

      const response = await apiClient.post<PromoValidationResult>(
        "/promotions/validate",
        payload
      );

      console.log("Promotion validation response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error validating promotion:", error);
      return {
        valid: false,
        message:
          error instanceof Error
            ? error.message
            : "Error validating promotion code",
      };
    }
  },

  // Redeem a promotion code
  redeemPromotion: async (
    redemptionData: PromoRedemptionRequest
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate inputs to prevent null payloads
      if (!redemptionData) {
        throw new Error("Redemption data is required");
      }

      if (!redemptionData.code) {
        return {
          success: false,
          message: "Promotion code is required",
        };
      }

      if (!redemptionData.userId) {
        return {
          success: false,
          message: "User ID is required to redeem promotion",
        };
      }

      if (!redemptionData.orderId) {
        return {
          success: false,
          message: "Order ID is required for promotion redemption",
        };
      }

      // Ensure the object is fully defined with all properties
      const payload: PromoRedemptionRequest = {
        code: redemptionData.code,
        userId: redemptionData.userId,
        orderId: redemptionData.orderId,
      };

      console.log("Redeeming promotion with payload:", payload);

      const response = await apiClient.post<{
        success: boolean;
        message: string;
      }>("/promotions/redeem", payload);

      console.log("Promotion redemption response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error redeeming promotion:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to redeem promotion",
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
