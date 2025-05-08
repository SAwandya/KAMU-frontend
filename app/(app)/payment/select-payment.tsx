import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/constants/Theme";

import PaymentMethodItem from "@/components/Payment/PaymentMethodItem";
import CreditCardItemNew from "@/components/Payment/CreditCardItemNew";
import { usePaymentStore } from "@/store/paymentStore";
import { PAYMENT_METHODS, getWalletBalance } from "@/services/paymentService";

export default function SelectPaymentScreen() {
  const router = useRouter();
  const { totalAmount, restaurantId, items } = useLocalSearchParams();

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Zustand store
  const savedCards = usePaymentStore((state) => state.savedCards);
  const selectedCardId = usePaymentStore((state) => state.selectedCardId);
  const setSelectedCardId = usePaymentStore((state) => state.setSelectedCardId);

  // Local state for preferred payment method
  const [preferredMethod, setPreferredMethod] = useState<string | null>(null);

  // Parse items if needed
  const parsedItems = items
    ? typeof items === "string"
      ? JSON.parse(items)
      : items
    : [];

  useEffect(() => {
    const loadWalletBalance = async () => {
      setIsLoading(true);
      try {
        const balance = await getWalletBalance();
        setWalletBalance(balance);
      } catch (e) {
        setError("Failed to load wallet balance");
      }
      setIsLoading(false);
    };
    loadWalletBalance();
  }, []);

  const handleSelectPaymentMethod = (method: string) => {
    setPreferredMethod(method);

    if (method !== PAYMENT_METHODS.CARD) {
      setSelectedCardId(null);
    } else if (savedCards.length > 0 && !selectedCardId) {
      setSelectedCardId(savedCards[0].id);
    }
  };

  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setPreferredMethod(PAYMENT_METHODS.CARD);
  };

  const handleContinue = () => {
    if (!preferredMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }
    if (
      preferredMethod === PAYMENT_METHODS.CARD &&
      !selectedCardId &&
      savedCards.length > 0
    ) {
      Alert.alert("Error", "Please select a card");
      return;
    }
    if (
      preferredMethod === PAYMENT_METHODS.WALLET &&
      walletBalance < Number(totalAmount) * 0.8
    ) {
      Alert.alert(
        "Insufficient Balance",
        `Your wallet balance ($${walletBalance.toFixed(
          2
        )}) is insufficient for this order. Please add funds or select another payment method.`,
        [
          {
            text: "Add Funds",
            onPress: () => router.push("/account/add-funds"),
          },
          { text: "Change Method", style: "cancel" },
        ]
      );
      return;
    }
    router.push({
      pathname: "/payment/process",
      params: {
        totalAmount: (Number(totalAmount) * 0.8).toFixed(2),
        paymentMethod: preferredMethod,
        paymentMethodId: selectedCardId || "",
        restaurantId,
        items: typeof items === "string" ? items : JSON.stringify(items),
      },
    });
  };

  const handleAddNewCard = () => {
    router.push("/payment/add-payment");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
        <Text style={styles.loadingText}>Loading payment methods...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.palette.neutral.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        <Text style={styles.sectionTitle}>Select Payment Method</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.paymentOptionsContainer}>
          <PaymentMethodItem
            title="Credit/Debit Card"
            iconName="card-outline"
            isSelected={preferredMethod === PAYMENT_METHODS.CARD}
            onSelect={() => handleSelectPaymentMethod(PAYMENT_METHODS.CARD)}
            testID="credit-card-payment-option"
          />
          <PaymentMethodItem
            title="Cash on Delivery"
            iconName="cash-outline"
            isSelected={preferredMethod === PAYMENT_METHODS.CASH}
            onSelect={() => handleSelectPaymentMethod(PAYMENT_METHODS.CASH)}
            testID="cash-payment-option"
          />
          <PaymentMethodItem
            title={`Wallet Balance ($${walletBalance.toFixed(2)})`}
            iconName="wallet-outline"
            isSelected={preferredMethod === PAYMENT_METHODS.WALLET}
            onSelect={() => handleSelectPaymentMethod(PAYMENT_METHODS.WALLET)}
            testID="wallet-payment-option"
          />
        </View>

        {preferredMethod === PAYMENT_METHODS.CARD && (
          <>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            {savedCards.length > 0 ? (
              <View style={styles.cardsContainer}>
                {savedCards.map((card) => (
                  <CreditCardItemNew
                    key={card.id}
                    card={card}
                    isSelected={selectedCardId === card.id}
                    onSelect={() => handleSelectCard(card.id)}
                  />
                ))}
                <TouchableOpacity
                  style={styles.addCardButton}
                  onPress={handleAddNewCard}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color={theme.palette.secondary.main}
                  />
                  <Text style={styles.addCardText}>Add New Card</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noCardsContainer}>
                <Ionicons
                  name="card-outline"
                  size={48}
                  color={theme.palette.neutral.lightGrey}
                />
                <Text style={styles.noCardsText}>No saved cards</Text>
                <TouchableOpacity
                  style={styles.addCardButtonEmpty}
                  onPress={handleAddNewCard}
                >
                  <Text style={styles.addCardButtonText}>Add Card</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order Total:</Text>
            <Text style={styles.originalAmount}>
              ${Number(totalAmount || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.summaryLabel}>Promotion</Text>
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>20% OFF</Text>
              </View>
            </View>
            <Text style={styles.promoDeduction}>
              -${(Number(totalAmount || 0) * 0.2).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, { marginTop: theme.spacing.sm }]}>
            <Text style={styles.summaryLabel}>Total Payable:</Text>
            <Text style={styles.finalAmount}>
              $
              {Number(totalAmount || 0) * 0.8 < 0
                ? "0.00"
                : (Number(totalAmount || 0) * 0.8).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!preferredMethod ||
              (preferredMethod === PAYMENT_METHODS.CARD &&
                !selectedCardId &&
                savedCards.length > 0) ||
              (preferredMethod === PAYMENT_METHODS.WALLET &&
                walletBalance < Number(totalAmount) * 0.8)) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={
            !preferredMethod ||
            (preferredMethod === PAYMENT_METHODS.CARD &&
              !selectedCardId &&
              savedCards.length > 0) ||
            (preferredMethod === PAYMENT_METHODS.WALLET &&
              walletBalance < Number(totalAmount) * 0.8)
          }
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral.lightGrey,
    backgroundColor: theme.palette.neutral.white,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    color: theme.palette.neutral.black,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: theme.palette.status.errorLight,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.palette.status.error,
    fontSize: theme.typography.fontSize.sm,
  },
  paymentOptionsContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardsContainer: {
    marginHorizontal: theme.spacing.lg,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.palette.neutral.lightGrey,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    justifyContent: "center",
  },
  addCardText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.secondary.main,
    marginLeft: theme.spacing.sm,
    fontWeight: "500",
  },
  noCardsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.lg,
  },
  noCardsText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  addCardButtonEmpty: {
    backgroundColor: theme.palette.secondary.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  addCardButtonText: {
    color: theme.palette.neutral.white,
    fontWeight: "600",
    fontSize: theme.typography.fontSize.md,
  },
  summaryContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.neutral.white,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    color: theme.palette.neutral.black,
    marginBottom: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
  },
  summaryAmount: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  originalAmount: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.neutral.mediumGrey,
    textDecorationLine: "line-through",
    fontFamily: theme.typography.fontFamily.medium,
  },
  promoBadge: {
    backgroundColor: theme.palette.primary.light,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  promoBadgeText: {
    color: theme.palette.primary.contrast,
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.semiBold,
    letterSpacing: 1,
  },
  promoDeduction: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.primary.main,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  finalAmount: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.palette.primary.main,
    fontFamily: theme.typography.fontFamily.bold,
  },
  footer: {
    backgroundColor: theme.palette.neutral.white,
    borderTopWidth: 1,
    borderTopColor: theme.palette.neutral.lightGrey,
    padding: theme.spacing.lg,
  },
  continueButton: {
    backgroundColor: theme.palette.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonDisabled: {
    backgroundColor: theme.palette.neutral.mediumGrey,
    opacity: 0.7,
  },
  continueButtonText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
  },
});
