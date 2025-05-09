import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../constants/Theme";

// Payment processing states
const PROCESSING_STATES = {
  INITIALIZING: "Initializing payment",
  PROCESSING: "Processing payment",
  CONFIRMING: "Confirming order",
  SUCCESS: "Payment successful!",
  FAILED: "Payment failed",
};

export default function ProcessPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId: string;
    paymentMethodId: string;
  }>();

  const [currentState, setCurrentState] = useState(
    PROCESSING_STATES.INITIALIZING
  );
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const progressAnim = new Animated.Value(0);

  // Simulate payment processing flow with staged animations
  useEffect(() => {
    // Step 1: Initializing
    setTimeout(() => {
      setCurrentState(PROCESSING_STATES.PROCESSING);
      Animated.timing(progressAnim, {
        toValue: 0.33,
        duration: 800,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }, 1500);

    // Step 2: Processing
    setTimeout(() => {
      setCurrentState(PROCESSING_STATES.CONFIRMING);
      Animated.timing(progressAnim, {
        toValue: 0.66,
        duration: 800,
        useNativeDriver: false,
        easing: Easing.inOut(Easing.ease),
      }).start();
    }, 3000);

    // Step 3: Completing
    setTimeout(() => {
      // Random success/failure for demo
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        setCurrentState(PROCESSING_STATES.SUCCESS);
        setIsSuccess(true);
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.ease),
        }).start();

        // Navigate to order tracking
        setTimeout(() => {
          router.replace({
            pathname: "/order-tracking",
            params: { orderId: params.orderId },
          });
        }, 1500);
      } else {
        setCurrentState(PROCESSING_STATES.FAILED);
        setIsError(true);
        setErrorMessage("Payment could not be processed. Please try again.");

        // Navigate back to payment selection
        setTimeout(() => {
          router.back();
        }, 2000);
      }
    }, 4500);
  }, []);

  // Progress bar width animation
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Status Icon */}
        <View
          style={[
            styles.iconContainer,
            isSuccess && styles.successIconContainer,
            isError && styles.errorIconContainer,
          ]}
        >
          {isSuccess ? (
            <Ionicons name="checkmark" size={40} color="white" />
          ) : isError ? (
            <Ionicons name="close" size={40} color="white" />
          ) : (
            <ActivityIndicator size="large" color="white" />
          )}
        </View>

        {/* Status Text */}
        <Text
          style={[
            styles.statusText,
            isSuccess && styles.successText,
            isError && styles.errorText,
          ]}
        >
          {currentState}
        </Text>

        {/* Error Message */}
        {isError && <Text style={styles.errorMessage}>{errorMessage}</Text>}

        {/* Progress Bar (only show during processing) */}
        {!isSuccess && !isError && (
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[styles.progressBar, { width: progressWidth }]}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.background,
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.xl,
    width: "100%",
    alignItems: "center",
    ...theme.shadows.md,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.palette.primary.main,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  successIconContainer: {
    backgroundColor: theme.palette.status.success,
  },
  errorIconContainer: {
    backgroundColor: theme.palette.status.error,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "600",
    color: theme.palette.neutral.black,
    marginBottom: theme.spacing.md,
    textAlign: "center",
  },
  successText: {
    color: theme.palette.status.success,
  },
  errorText: {
    color: theme.palette.status.error,
  },
  errorMessage: {
    color: theme.palette.neutral.darkGrey,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.palette.neutral.lightGrey,
    borderRadius: 4,
    width: "100%",
    marginTop: theme.spacing.md,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
  },
});
