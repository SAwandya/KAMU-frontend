import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/constants/Theme";

type PaymentStatus = "processing" | "success" | "failed";

interface PaymentStatusIndicatorProps {
  status: PaymentStatus;
  amount?: number | string | null;
  errorMessage?: string;
  transactionId?: string;
}

const PaymentStatusIndicator: React.FC<PaymentStatusIndicatorProps> = ({
  status,
  amount,
  errorMessage,
  transactionId,
}) => {
  const renderIcon = () => {
    switch (status) {
      case "processing":
        return (
          <ActivityIndicator size="large" color={theme.palette.primary.main} />
        );
      case "success":
        return (
          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark-circle"
              size={80}
              color={theme.palette.status.success}
            />
          </View>
        );
      case "failed":
        return (
          <View style={styles.iconContainer}>
            <Ionicons
              name="close-circle"
              size={80}
              color={theme.palette.status.error}
            />
          </View>
        );
    }
  };

  const renderTitle = () => {
    switch (status) {
      case "processing":
        return "Processing Payment";
      case "success":
        return "Payment Successful!";
      case "failed":
        return "Payment Failed";
    }
  };

  const renderDescription = () => {
    switch (status) {
      case "processing":
        return `Please wait while we process your payment${
          amount ? ` of $${Number(amount).toFixed(2)}` : ""
        }`;
      case "success":
        return `Your payment${
          amount ? ` of $${Number(amount).toFixed(2)}` : ""
        } was successful.`;
      case "failed":
        return (
          errorMessage ||
          "There was an issue processing your payment. Please try again."
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderIcon()}
      <Text style={styles.title}>{renderTitle()}</Text>
      <Text style={styles.description}>{renderDescription()}</Text>
      {status === "success" && transactionId && (
        <Text style={styles.transactionId}>
          Transaction ID: {transactionId}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
    marginVertical: theme.spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
  transactionId: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.mediumGrey,
    marginBottom: theme.spacing.xl,
  },
});

export default PaymentStatusIndicator;
