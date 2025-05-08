import AsyncStorage from "@react-native-async-storage/async-storage";
import { PaymentResult, CardDetails } from "@/types/payment";

// Payment method constants
export const PAYMENT_METHODS = {
  CARD: "card",
  CASH: "cash",
  WALLET: "wallet",
};

// Process payment with mock API
export const processPayment = async (
  amount: number,
  paymentMethodId: string,
  orderId: string
): Promise<PaymentResult> => {
  // Simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Success rate of 90% for demo purposes
      const isSuccessful = Math.random() > 0.1;

      if (isSuccessful) {
        resolve({
          success: true,
          transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`,
        });
      } else {
        resolve({
          success: false,
          error: "Payment processing failed. Please try again.",
        });
      }
    }, 2000);
  });
};

// Save payment method to user preferences
export const savePaymentMethod = async (method: string): Promise<void> => {
  try {
    await AsyncStorage.setItem("preferredPaymentMethod", method);
  } catch (error) {
    console.error("Error saving payment method:", error);
    throw new Error("Failed to save payment method");
  }
};

// Get saved payment method
export const getPreferredPaymentMethod = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem("preferredPaymentMethod");
  } catch (error) {
    console.error("Error getting payment method:", error);
    return null;
  }
};

// Get saved payment methods (cards, etc.)
export const getSavedPaymentMethods = async (): Promise<CardDetails[]> => {
  try {
    // In a real app, this would come from your backend
    // For demo, we'll check if we have stored cards first
    const storedCards = await AsyncStorage.getItem("savedPaymentCards");

    if (storedCards) {
      return JSON.parse(storedCards);
    }

    // Default mock data if no stored cards
    const defaultCards = [
      {
        id: "card_1",
        type: "visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 24,
      },
      {
        id: "card_2",
        type: "mastercard",
        last4: "5555",
        expiryMonth: 8,
        expiryYear: 26,
      },
    ];

    // Save the default cards
    await AsyncStorage.setItem(
      "savedPaymentCards",
      JSON.stringify(defaultCards)
    );

    return defaultCards;
  } catch (error) {
    console.error("Error fetching saved payment methods:", error);
    return [];
  }
};

// Save a new card
export const saveNewCard = async (
  card: Omit<CardDetails, "id">
): Promise<CardDetails> => {
  try {
    const savedCards = await getSavedPaymentMethods();

    // Create a new card with ID
    const newCard: CardDetails = {
      ...card,
      id: `card_${Date.now()}`,
    };

    // Add to saved cards
    const updatedCards = [...savedCards, newCard];
    await AsyncStorage.setItem(
      "savedPaymentCards",
      JSON.stringify(updatedCards)
    );

    return newCard;
  } catch (error) {
    console.error("Error saving new card:", error);
    throw new Error("Failed to save new card");
  }
};

// Delete a saved card
export const deleteCard = async (cardId: string): Promise<void> => {
  try {
    const savedCards = await getSavedPaymentMethods();
    const updatedCards = savedCards.filter((card) => card.id !== cardId);
    await AsyncStorage.setItem(
      "savedPaymentCards",
      JSON.stringify(updatedCards)
    );
  } catch (error) {
    console.error("Error deleting card:", error);
    throw new Error("Failed to delete card");
  }
};

// Get wallet balance
export const getWalletBalance = async (): Promise<number> => {
  try {
    const balance = await AsyncStorage.getItem("walletBalance");
    return balance ? parseFloat(balance) : 50.0; // Default $50 balance for demo
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return 50.0; // Default balance
  }
};

// Add funds to wallet
export const addFundsToWallet = async (amount: number): Promise<number> => {
  try {
    const currentBalance = await getWalletBalance();
    const newBalance = currentBalance + amount;
    await AsyncStorage.setItem("walletBalance", newBalance.toString());
    return newBalance;
  } catch (error) {
    console.error("Error adding funds to wallet:", error);
    throw new Error("Failed to add funds to wallet");
  }
};
