import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useAuth from "../../../hooks/useAuth";
import { useOrder } from "../../../hooks/useOrder";
import { usePayment } from "../../../hooks/usePayment";
import { useCart } from "../../../hooks/useCart";
import theme from "../../../constants/Theme";

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
}

export default function SelectPaymentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createOrder } = useOrder();
  const {
    initializePaymentMethods,
    savedCards,
    processPayment,
    addPaymentCard,
    loading,
    error,
  } = usePayment();
  const { items, totalPrice, clearCart } = useCart();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddCardModalVisible, setIsAddCardModalVisible] = useState(false);
  const [newCard, setNewCard] = useState<{
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    cardholderName: string;
  }>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
  });

  const params = useLocalSearchParams<{
    totalAmount: string;
    restaurantId: string;
    items: string;
  }>();

  const totalAmount = parseFloat(params.totalAmount || "0");
  const restaurantId = params.restaurantId;
  const cartItems = params.items ? JSON.parse(params.items) : [];

  const paymentMethods: PaymentMethod[] = [
    { id: "cash", name: "Cash on Delivery", icon: "cash-outline" },
    { id: "card", name: "Credit/Debit Card", icon: "card-outline" },
  ];

  // Initialize payment methods
  useEffect(() => {
    initializePaymentMethods();
  }, []);

  // Auto-select first card if available when selecting card payment method
  useEffect(() => {
    if (selectedMethod === "card" && savedCards.length > 0 && !selectedCardId) {
      setSelectedCardId(savedCards[0].id);
    }
  }, [selectedMethod, savedCards]);

  // Handle payment method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    if (methodId !== "card") {
      setSelectedCardId(null); // Reset card selection when changing payment methods
    }
  };

  // Handle card selection
  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId);
  };

  // Handle adding a new card
  const handleAddCard = async () => {
    // Basic validation
    if (newCard.cardNumber.length < 16) {
      Alert.alert("Invalid Card", "Please enter a valid card number");
      return;
    }

    if (newCard.expiryMonth.length < 1 || newCard.expiryYear.length < 4) {
      Alert.alert("Invalid Expiry Date", "Please enter a valid expiry date");
      return;
    }

    try {
      // Create a unique ID for the new card
      const cardId = `card_${Date.now()}`;

      // Get last 4 digits of card number
      const last4 = newCard.cardNumber.slice(-4);

      // Add the new card
      await addPaymentCard({
        id: cardId,
        type: "visa", // For simplicity, default to visa
        last4,
        expiryMonth: parseInt(newCard.expiryMonth),
        expiryYear: parseInt(newCard.expiryYear),
        cardholderName: newCard.cardholderName,
      });

      // Select the newly added card
      setSelectedCardId(cardId);

      // Close the modal
      setIsAddCardModalVisible(false);

      // Reset form
      setNewCard({
        cardNumber: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        cardholderName: "",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to add card. Please try again.");
    }
  };

  // Handle order confirmation
  const handleConfirmOrder = async () => {
    console.log(user);
    // if (!user?.id) {
    //   Alert.alert("Error", "You need to be logged in to place an order");
    //   return;
    // }

    if (!selectedMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    // For card payments, ensure a card is selected
    if (selectedMethod === "card" && !selectedCardId && savedCards.length > 0) {
      Alert.alert("Error", "Please select a card");
      return;
    }

    try {
      setIsProcessing(true);

      // Create order items from cart items
      const orderItems = items.map((item) => ({
        foodItemId: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      // Calculate delivery fee (could be dynamic based on distance)
      const deliveryFee = 2.99;
      const finalTotal = totalAmount + deliveryFee;

      // Create the order first
      const order = await createOrder({
        customerId: user.id,
        restaurantId: restaurantId,
        totalBill: finalTotal,
        deliveryFee: deliveryFee,
        status: "PENDING",
        items: orderItems,
      });

      if (!order || !order.id) {
        throw new Error("Failed to create order");
      }

      // Clear the cart
      clearCart();

      // For card payment, get the payment method ID
      const paymentMethodId =
        selectedMethod === "card" ? selectedCardId : selectedMethod;

      // Process payment immediately for card payments
      if (selectedMethod === "card" && paymentMethodId) {
        const paymentResult = await processPayment(
          finalTotal,
          paymentMethodId,
          order.id.toString()
        );

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || "Payment failed");
        }
      }

      // Navigate to payment processing screen
      router.push({
        pathname: "/payment/process",
        params: {
          orderId: order.id.toString(),
          paymentMethodId: paymentMethodId,
        },
      });
    } catch (error) {
      console.error("Order placement failed:", error);
      Alert.alert(
        "Order Failed",
        "There was an error placing your order. Please try again."
      );
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemText}>Items Total</Text>
            <Text style={styles.summaryItemValue}>
              ${totalAmount.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemText}>Delivery Fee</Text>
            <Text style={styles.summaryItemValue}>$2.99</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryItemText, styles.totalText]}>
              Total
            </Text>
            <Text style={[styles.summaryItemValue, styles.totalValue]}>
              ${(totalAmount + 2.99).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedMethod === method.id && styles.selectedMethod,
              ]}
              onPress={() => handleMethodSelect(method.id)}
            >
              <View style={styles.methodInfo}>
                <Ionicons
                  name={method.icon as any}
                  size={24}
                  color={theme.palette.primary.main}
                />
                <Text style={styles.methodName}>{method.name}</Text>
              </View>
              <View style={styles.radioButton}>
                {selectedMethod === method.id && (
                  <View style={styles.radioButtonSelected} />
                )}
              </View>
            </TouchableOpacity>
          ))}

          {selectedMethod === "card" && (
            <View style={styles.savedCardsSection}>
              <Text style={styles.subsectionTitle}>Your Cards</Text>
              {savedCards.length === 0 ? (
                <Text style={styles.noCardsText}>No saved cards</Text>
              ) : (
                savedCards.map((card) => (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.savedCard,
                      selectedCardId === card.id && styles.selectedCard,
                    ]}
                    onPress={() => handleCardSelect(card.id)}
                  >
                    <Ionicons
                      name={card.type === "visa" ? "card" : "card-outline"}
                      size={24}
                      color={theme.palette.primary.main}
                    />
                    <Text style={styles.cardNumber}>
                      **** **** **** {card.last4}
                    </Text>
                    <Text style={styles.cardExpiry}>
                      {card.expiryMonth}/{card.expiryYear}
                    </Text>
                    {selectedCardId === card.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={theme.palette.status.success}
                        style={styles.cardSelectedIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
              <TouchableOpacity
                style={styles.addCardButton}
                onPress={() => setIsAddCardModalVisible(true)}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={theme.palette.primary.main}
                />
                <Text style={styles.addCardText}>Add New Card</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!selectedMethod ||
              (selectedMethod === "card" &&
                savedCards.length > 0 &&
                !selectedCardId)) &&
              styles.disabledButton,
          ]}
          onPress={handleConfirmOrder}
          disabled={
            isProcessing ||
            !selectedMethod ||
            (selectedMethod === "card" &&
              savedCards.length > 0 &&
              !selectedCardId)
          }
        >
          {isProcessing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Order</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Add Card Modal */}
      <Modal
        visible={isAddCardModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddCardModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Card</Text>

            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={styles.input}
              value={newCard.cardholderName}
              onChangeText={(text) =>
                setNewCard({ ...newCard, cardholderName: text })
              }
              placeholder="Name on Card"
            />

            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={styles.input}
              value={newCard.cardNumber}
              onChangeText={(text) =>
                setNewCard({ ...newCard, cardNumber: text.replace(/\D/g, "") })
              }
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={16}
            />

            <View style={styles.rowContainer}>
              <View style={styles.expiryContainer}>
                <Text style={styles.inputLabel}>Expiry Month</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newCard.expiryMonth}
                  onChangeText={(text) =>
                    setNewCard({
                      ...newCard,
                      expiryMonth: text.replace(/\D/g, ""),
                    })
                  }
                  placeholder="MM"
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>

              <View style={styles.expiryContainer}>
                <Text style={styles.inputLabel}>Expiry Year</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newCard.expiryYear}
                  onChangeText={(text) =>
                    setNewCard({
                      ...newCard,
                      expiryYear: text.replace(/\D/g, ""),
                    })
                  }
                  placeholder="YYYY"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>

              <View style={styles.expiryContainer}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newCard.cvv}
                  onChangeText={(text) =>
                    setNewCard({ ...newCard, cvv: text.replace(/\D/g, "") })
                  }
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsAddCardModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddCard}
              >
                <Text style={styles.addButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    color: theme.palette.neutral.black,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  summaryItemText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.grey,
  },
  summaryItemValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "500",
    color: theme.palette.neutral.black,
  },
  totalText: {
    fontWeight: "bold",
    color: theme.palette.neutral.black,
  },
  totalValue: {
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  divider: {
    height: 1,
    backgroundColor: theme.palette.neutral.lightGrey,
    marginVertical: theme.spacing.md,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral.lightGrey,
  },
  selectedMethod: {
    backgroundColor: `${theme.palette.primary.light}20`,
  },
  methodInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  methodName: {
    marginLeft: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.palette.primary.main,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.palette.primary.main,
  },
  savedCardsSection: {
    marginTop: theme.spacing.md,
  },
  subsectionTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
    color: theme.palette.neutral.darkGrey,
  },
  noCardsText: {
    color: theme.palette.neutral.grey,
    fontStyle: "italic",
    marginBottom: theme.spacing.md,
  },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.palette.neutral.lightGrey,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  selectedCard: {
    borderColor: theme.palette.primary.main,
    backgroundColor: `${theme.palette.primary.light}10`,
  },
  cardNumber: {
    marginLeft: theme.spacing.sm,
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
  },
  cardExpiry: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginRight: theme.spacing.sm,
  },
  cardSelectedIcon: {
    marginLeft: theme.spacing.xs,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.palette.neutral.lightGrey,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
  },
  addCardText: {
    marginLeft: theme.spacing.xs,
    color: theme.palette.primary.main,
    fontSize: theme.typography.fontSize.md,
  },
  bottomContainer: {
    backgroundColor: theme.palette.neutral.white,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  confirmButton: {
    backgroundColor: theme.palette.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: theme.palette.neutral.lightGrey,
  },
  confirmButtonText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    width: "90%",
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
    color: theme.palette.neutral.black,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.palette.neutral.lightGrey,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  expiryContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: theme.palette.neutral.lightGrey,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginRight: theme.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.palette.neutral.grey,
    borderRadius: theme.borderRadius.md,
  },
  cancelButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
  },
  addButton: {
    flex: 1,
    padding: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.borderRadius.md,
  },
  addButtonText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.white,
    fontWeight: "bold",
  },
});
