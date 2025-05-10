import apiClient from "./apiClient";

interface PaymentIntentPayload {
  orderId: string;
  customerId: string;
  totalAmount: number;
  items: any[];
}

export const createPaymentIntent = async ({
  orderId,
  customerId,
  totalAmount,
  items,
}: PaymentIntentPayload) => {
  try {
    const response = await apiClient.post("/payments/intent", {
      orderId,
      customerId,
      totalAmount,
      items,
    });

    return response.data;
  } catch (error) {
    console.error("Payment Intent Error:", error.response?.data || error.message);
    throw error.response?.data || { error: "Unknown error" };
  }
};
