import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/constants/Theme";

interface PaymentMethodItemProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  isSelected: boolean;
  onSelect: () => void;
  testID?: string;
}

const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({
  title,
  iconName,
  isSelected,
  onSelect,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
      onPress={onSelect}
      testID={testID}
    >
      <Ionicons
        name={iconName}
        size={24}
        color={theme.palette.secondary.main}
      />
      <Text style={styles.paymentOptionText}>{title}</Text>
      {isSelected && (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={theme.palette.primary.main}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  paymentOptionSelected: {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  },
  paymentOptionText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
});

export default PaymentMethodItem;
