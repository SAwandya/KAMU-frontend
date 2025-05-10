import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import theme from "@/constants/Theme";
import { processPayment, PAYMENT_METHODS } from "@/services/paymentService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "@/hooks/useCart";
import PaymentStatusIndicator from "@/components/Payment/PaymentStatusIndicator";
import { useStripe } from "@stripe/stripe-react-native";
import { usePaymentStore } from "@/store/paymentStore";

const PaymentProcessingScreen = () => {
  const router = useRouter();
  const {
    totalAmount,
    paymentMethod,
    paymentMethodId,
    restaurantId,
    items: itemsParam,
  } = useLocalSearchParams();

  const [status, setStatus] = useState<"processing" | "success" | "failed">(
    "processing"
  );
  const [transactionId, setTransactionId] = useState<string>("");
  const [orderId, setOrderId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();

  // Parse items from params
  const items = itemsParam
    ? typeof itemsParam === "string"
      ? JSON.parse(itemsParam)
      : itemsParam
    : [];

  useEffect(() => {
    const processOrder = async () => {
      // Wait a moment to show the processing animation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        // Generate a new order ID
        const newOrderId = `order_${Math.random()
          .toString(36)
          .substring(2, 15)}`;
        setOrderId(newOrderId);

        // Process payment
        const paymentResult = await processPayment(
          Number(totalAmount),
          paymentMethodId as string,
          newOrderId
        );

        if (paymentResult.success) {
          setTransactionId(paymentResult.transactionId || "");

          // Create order
          const order = {
            id: newOrderId,
            restaurantId,
            items,
            total: Number(totalAmount),
            paymentMethod,
            paymentMethodId,
            transactionId: paymentResult.transactionId,
            status: "preparing",
            createdAt: new Date().toISOString(),
          };

          // Save order to AsyncStorage (for demo purposes)
          const existingOrders = await AsyncStorage.getItem("orders");
          const orders = existingOrders ? JSON.parse(existingOrders) : [];
          orders.push(order);
          await AsyncStorage.setItem("orders", JSON.stringify(orders));

          // Clear cart
          clearCart();

          // Show success state
          setStatus("success");
        } else {
          setError(paymentResult.error || "Payment processing failed");
          setStatus("failed");
        }
      } catch (err) {
        console.error("Error processing payment:", err);
        setError("An unexpected error occurred");
        setStatus("failed");
      }
    };

    processOrder();
  }, [
    totalAmount,
    paymentMethod,
    paymentMethodId,
    restaurantId,
    items,
    clearCart,
  ]);

  const handleContinue = () => {
    if (status === "success") {
      // Navigate to order tracking with the newly created order ID
      router.replace(`/order-tracking?orderId=${orderId}`);
    } else {
      // Go back to payment selection
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <PaymentStatusIndicator
          status={status}
          amount={totalAmount}
          errorMessage={error || undefined}
          transactionId={transactionId}
        />

        {(status === "success" || status === "failed") && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>
              {status === "success" ? "Track Your Order" : "Try Again"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  continueButton: {
    backgroundColor: theme.palette.primary.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
    width: "100%",
    alignItems: "center",
  },
  continueButtonText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
  },
});

export default PaymentProcessingScreen;
