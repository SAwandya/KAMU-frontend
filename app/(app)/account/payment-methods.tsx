import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/constants/Theme";
import { getSavedPaymentMethods, deleteCard } from "@/services/paymentService";
import CreditCardItem from "@/components/Payment/CreditCardItem";
import { CardDetails } from "@/types/payment";

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<CardDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setIsLoading(true);
        const methods = await getSavedPaymentMethods();
        setPaymentMethods(methods);
      } catch (error) {
        console.error("Error loading payment methods:", error);
        Alert.alert("Error", "Failed to load payment methods");
      } finally {
        setIsLoading(false);
      }
    };

    loadPaymentMethods();
  }, [refreshKey]);

  const handleAddCard = () => {
    Alert.alert(
      "Add Payment Method",
      "In a real app, this would navigate to a secure form to add a new card.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add Demo Card",
          onPress: () => {
            // Add a demo card
            const newCard: CardDetails = {
              id: `card_${Date.now()}`,
              type: ["visa", "mastercard", "amex"][
                Math.floor(Math.random() * 3)
              ],
              last4: Math.floor(1000 + Math.random() * 9000)
                .toString()
                .substring(0, 4),
              expiryMonth: Math.floor(1 + Math.random() * 12),
              expiryYear: 23 + Math.floor(Math.random() * 10),
            };

            setPaymentMethods([...paymentMethods, newCard]);

            // In a real app, you would save this card to AsyncStorage or backend
          },
        },
      ]
    );
  };

  const handleDeleteCard = async (cardId: string) => {
    Alert.alert("Remove Card", "Are you sure you want to remove this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCard(cardId);
            // Refresh the list
            setRefreshKey((prev) => prev + 1);
          } catch (error) {
            console.error("Error deleting card:", error);
            Alert.alert("Error", "Failed to delete card");
          }
        },
      },
    ]);
  };

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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={theme.palette.primary.main}
            />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Your Payment Methods</Text>

            {paymentMethods.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Ionicons
                  name="card-outline"
                  size={64}
                  color={theme.palette.neutral.lightGrey}
                />
                <Text style={styles.emptyStateText}>
                  No payment methods added yet
                </Text>
              </View>
            ) : (
              <View style={styles.cardsContainer}>
                {paymentMethods.map((card) => (
                  <CreditCardItem
                    key={card.id}
                    card={card}
                    showDeleteButton={true}
                    onDelete={() => handleDeleteCard(card.id)}
                  />
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.addCardButton}
              onPress={handleAddCard}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={theme.palette.neutral.white}
              />
              <Text style={styles.addCardText}>Add New Card</Text>
            </TouchableOpacity>

            <View style={styles.secureInfoContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={theme.palette.secondary.main}
              />
              <Text style={styles.secureInfoText}>
                Your payment information is stored securely. We never store your
                full card details.
              </Text>
            </View>

            {/* Wallet section */}
            <Text style={styles.sectionTitle}>Wallet</Text>
            <TouchableOpacity
              style={styles.walletOption}
              onPress={() => router.push("/account/wallet")}
            >
              <Ionicons
                name="wallet-outline"
                size={24}
                color={theme.palette.secondary.main}
              />
              <View style={styles.walletDetails}>
                <Text style={styles.walletTitle}>App Wallet</Text>
                <Text style={styles.walletDescription}>
                  Add funds to your wallet for faster checkout
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={theme.palette.neutral.darkGrey}
              />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
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
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: theme.spacing.xl * 2,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.palette.neutral.black,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.xl * 2,
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    marginTop: theme.spacing.md,
  },
  cardsContainer: {
    marginBottom: theme.spacing.lg,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.secondary.main,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  addCardText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    marginLeft: theme.spacing.sm,
  },
  secureInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  secureInfoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  walletOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  walletDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  walletTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  walletDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginTop: 2,
  },
  menuItemText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
});
