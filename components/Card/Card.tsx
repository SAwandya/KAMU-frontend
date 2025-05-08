import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import theme from "../../constants/Theme";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "elevated" | "outlined" | "flat";
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "elevated",
}) => {
  const getCardStyle = () => {
    switch (variant) {
      case "outlined":
        return styles.outlinedCard;
      case "flat":
        return styles.flatCard;
      default:
        return styles.elevatedCard;
    }
  };

  return <View style={[styles.card, getCardStyle(), style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
  },
  elevatedCard: {
    ...theme.shadows.md,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: theme.palette.neutral.lightGrey,
  },
  flatCard: {
    // No additional styles needed
  },
});

export default Card;
