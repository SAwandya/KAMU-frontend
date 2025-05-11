import apiClient from "./apiClient";

interface SendSmsPayload {
  to: string; // Phone number in E.164 format (e.g., +1234567890)
  message: string; // SMS content
}

export const sendSms = async (payload: SendSmsPayload) => {
  try {
    const response = await apiClient.post("/notification/send-email", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    throw error;
  }
};
