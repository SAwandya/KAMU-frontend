import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/constants/Theme";
import { CardDetails } from "@/types/payment";

interface CreditCardItemProps {
  card: CardDetails;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

const CARD_BRANDS: Record<
  string,
  { icon: string; color: string; label: string }
> = {
  visa: { icon: "logo-visa", color: "#1A1F71", label: "VISA" },
  mastercard: { icon: "logo-mastercard", color: "#EB001B", label: "MC" },
  amex: { icon: "logo-amex", color: "#2E77BB", label: "AMEX" },
};

const CreditCardItem: React.FC<CreditCardItemProps> = ({
  card,
  isSelected = false,
  onSelect,
  onDelete,
  showDeleteButton = false,
}) => {
  const brandKey = card.type?.toLowerCase() || "default";
  const brand = CARD_BRANDS[brandKey] || {
    icon: "card-outline",
    color: theme.palette.secondary.main,
    label: card.type?.toUpperCase() || "CARD",
  };

  // Animation: fade and slide in
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.animatedCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Pressable
        style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
        onPress={onSelect}
        android_ripple={{
          color: theme.palette.primary.light + "22",
          borderless: false,
        }}
      >
        <View style={styles.leftSection}>
          <View
            style={[styles.brandBadge, { backgroundColor: brand.color + "22" }]}
          >
            <Ionicons name={brand.icon as any} size={22} color={brand.color} />
            <Text style={[styles.brandLabel, { color: brand.color }]}>
              {brand.label}
            </Text>
          </View>
        </View>
        <View style={styles.cardDetails}>
          <Text style={styles.cardNumber}>•••• {card.last4}</Text>
          <Text style={styles.cardExpiry}>
            Expires {card.expiryMonth}/{card.expiryYear}
          </Text>
        </View>
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={26}
            color={theme.palette.primary.main}
            style={styles.selectedIcon}
          />
        )}
        {showDeleteButton && onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            hitSlop={12}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={theme.palette.status.error}
            />
          </TouchableOpacity>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  animatedCard: {
    width: "100%",
  },
  cardOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
    ...theme.shadows.md,
    shadowColor: theme.palette.primary.dark,
  },
  cardOptionSelected: {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.accent.lightGreen,
    shadowColor: theme.palette.primary.main,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  leftSection: {
    marginRight: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: theme.palette.secondary.light,
    marginRight: 2,
  },
  brandLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    marginLeft: 6,
    letterSpacing: 1,
  },
  cardDetails: {
    flex: 1,
    justifyContent: "center",
  },
  cardNumber: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.neutral.black,
    marginBottom: 2,
    letterSpacing: 2,
  },
  cardExpiry: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.mediumGrey,
  },
  selectedIcon: {
    marginLeft: theme.spacing.md,
  },
  deleteButton: {
    marginLeft: theme.spacing.md,
    padding: theme.spacing.sm,
    backgroundColor: theme.palette.accent.lightGreen,
    borderRadius: theme.borderRadius.pill,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreditCardItem;
