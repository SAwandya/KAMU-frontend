import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOrder } from "../hooks/useOrder";
import { useDelivery } from "../hooks/useDelivery";
import theme from "../constants/Theme";

// Order status steps for the UI
const ORDER_STEPS = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { getOrderById, currentOrder, loading: orderLoading } = useOrder();
  const { getTripById, currentTrip, loading: tripLoading } = useDelivery();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch order data
  const fetchOrderData = useCallback(async () => {
    if (!orderId) return;
    try {
      const order = await getOrderById(orderId);

      // If order has a delivery ID, fetch the trip details
      if (order?.deliveryId) {
        await getTripById(order.deliveryId);
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  }, [orderId, getOrderById, getTripById]);

  // Initial data fetch
  useEffect(() => {
    fetchOrderData();

    // Set up polling for order status updates
    const intervalId = setInterval(fetchOrderData, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchOrderData]);

  // Handle manual refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrderData();
    setRefreshing(false);
  }, [fetchOrderData]);

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!currentOrder) return -1;
    return ORDER_STEPS.indexOf(currentOrder.status as string);
  };

  if (orderLoading && !currentOrder) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!currentOrder) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="warning-outline"
          size={64}
          color={theme.palette.status.error}
        />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorMessage}>
          We couldn't find the order you're looking for.
        </Text>
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex();
  const isCompleted = currentOrder.status === "DELIVERED";
  const isCancelled = currentOrder.status === "CANCELLED";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Order Status Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Order #{orderId}</Text>
          <View
            style={[
              styles.statusBadge,
              isCancelled && styles.cancelledBadge,
              isCompleted && styles.completedBadge,
            ]}
          >
            <Text style={styles.statusText}>{currentOrder.status}</Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.timeline}>
          {ORDER_STEPS.map((step, index) => {
            const isActive = currentStepIndex >= index;
            const isCurrentStep = currentStepIndex === index;

            return (
              <View key={step} style={styles.timelineItem}>
                <View style={styles.timelineStepContainer}>
                  <View
                    style={[
                      styles.timelineStep,
                      isActive && styles.activeStep,
                      isCurrentStep && styles.currentStep,
                    ]}
                  >
                    {isActive && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  {index < ORDER_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        currentStepIndex > index && styles.activeConnector,
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineText,
                    isCurrentStep && styles.currentStepText,
                  ]}
                >
                  {step.replace(/_/g, " ")}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Estimated Delivery Time */}
        <View style={styles.deliveryTimeContainer}>
          <Ionicons
            name="time-outline"
            size={24}
            color={theme.palette.primary.main}
          />
          <Text style={styles.deliveryTimeText}>
            {isCompleted
              ? "Order delivered"
              : isCancelled
              ? "Order cancelled"
              : "Estimated delivery: 30-45 min"}
          </Text>
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Details</Text>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          {currentOrder.items.map((item, index) => {
            // Ensure price is a valid number
            const price = typeof item.price === "number" ? item.price : 0;

            return (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>
                    {item.name || `Item #${item.foodItemId}`}
                  </Text>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>${price.toFixed(2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* Order Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              $
              {(
                currentOrder.totalBill - (currentOrder.deliveryFee || 0)
              ).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>
              ${(currentOrder.deliveryFee || 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.summaryLabel, styles.totalLabel]}>Total</Text>
            <Text style={[styles.summaryValue, styles.totalValue]}>
              ${currentOrder.totalBill.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* Rider Details - Show only if out for delivery */}
      {currentStepIndex >= ORDER_STEPS.indexOf("OUT_FOR_DELIVERY") &&
        !isCompleted &&
        !isCancelled && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivery Person</Text>
            <View style={styles.riderContainer}>
              <View style={styles.riderAvatar}>
                <Ionicons
                  name="person"
                  size={32}
                  color={theme.palette.neutral.white}
                />
              </View>
              <View style={styles.riderInfo}>
                <Text style={styles.riderName}>John Smith</Text>
                <Text style={styles.riderDetails}>
                  Delivery Agent • ID: {currentOrder.riderId || "Assigning..."}
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Ionicons
                  name="call"
                  size={20}
                  color={theme.palette.neutral.white}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

      {/* Help Button */}
      <TouchableOpacity style={styles.helpButton}>
        <Ionicons
          name="help-circle-outline"
          size={20}
          color={theme.palette.neutral.white}
        />
        <Text style={styles.helpButtonText}>Need Help?</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  contentContainer: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.palette.neutral.darkGrey,
    fontSize: theme.typography.fontSize.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.neutral.background,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
    marginTop: theme.spacing.md,
  },
  errorMessage: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    textAlign: "center",
    marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  statusBadge: {
    backgroundColor: theme.palette.status.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  completedBadge: {
    backgroundColor: theme.palette.status.success,
  },
  cancelledBadge: {
    backgroundColor: theme.palette.status.error,
  },
  statusText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: "500",
  },
  timeline: {
    marginBottom: theme.spacing.lg,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  timelineStepContainer: {
    alignItems: "center",
  },
  timelineStep: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.palette.neutral.lightGrey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  activeStep: {
    backgroundColor: theme.palette.primary.main,
  },
  currentStep: {
    backgroundColor: theme.palette.primary.main,
    borderWidth: 2,
    borderColor: theme.palette.primary.light,
  },
  timelineConnector: {
    width: 2,
    height: 24,
    backgroundColor: theme.palette.neutral.lightGrey,
  },
  activeConnector: {
    backgroundColor: theme.palette.primary.main,
  },
  timelineText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    flex: 1,
    paddingTop: 3,
  },
  currentStepText: {
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  deliveryTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.primary.light + "20",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  deliveryTimeText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.primary.main,
    fontWeight: "500",
    marginLeft: theme.spacing.sm,
  },
  itemsContainer: {
    marginTop: theme.spacing.md,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
  },
  itemQuantity: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
  },
  itemPrice: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "500",
    color: theme.palette.neutral.black,
  },
  divider: {
    height: 1,
    backgroundColor: theme.palette.neutral.lightGrey,
    marginVertical: theme.spacing.md,
  },
  summaryContainer: {
    marginTop: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
  },
  totalRow: {
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  riderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  riderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.palette.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  riderDetails: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.primary.main,
    justifyContent: "center",
    alignItems: "center",
  },
  helpButton: {
    backgroundColor: theme.palette.secondary.main,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  helpButtonText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    marginLeft: theme.spacing.xs,
  },
});
