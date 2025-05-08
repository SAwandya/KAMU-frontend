import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { usePaymentStore } from "@/store/paymentStore";
import theme from "@/constants/Theme";

function luhnCheck(cardNumber: string) {
  // Remove spaces
  const digits = cardNumber.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function validateExpiry(expiry: string) {
  // Format MM/YY
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
  const [monthStr, yearStr] = expiry.split("/");
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expDate = new Date(year, month - 1, 1);
  // Card valid until end of expiry month
  return expDate >= new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function AddPaymentScreen() {
  const router = useRouter();
  const addCard = usePaymentStore((state) => state.addCard);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [brand, setBrand] = useState("");
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // Format card number as "1234 5678 9012 3456"
  const handleCardNumberChange = (text: string) => {
    let value = text.replace(/\D/g, "");
    value = value.slice(0, 16);
    let formatted = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // Auto-insert "/" after MM in expiry
  const handleExpiryChange = (text: string) => {
    let value = text.replace(/\D/g, "");
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) value = value.slice(0, 2) + "/" + value.slice(2);
    setExpiry(value);
  };

  const handleSave = () => {
    const newErrors: { [k: string]: string } = {};

    if (!cardNumber || cardNumber.replace(/\s/g, "").length < 13)
      newErrors.cardNumber = "Enter a valid card number";
    else if (!luhnCheck(cardNumber))
      newErrors.cardNumber = "Invalid card number";

    if (!cardHolder) newErrors.cardHolder = "Card holder name required";
    if (!expiry) newErrors.expiry = "Expiry required";
    else if (!validateExpiry(expiry))
      newErrors.expiry = "Invalid or expired date";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    addCard({
      id: Date.now().toString(),
      cardNumber,
      cardHolder,
      expiry,
      brand: brand || "Unknown",
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.palette.neutral.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add New Card</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={[styles.input, errors.cardNumber && styles.inputError]}
            placeholder="1234 5678 9012 3456"
            keyboardType="number-pad"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            maxLength={19}
            placeholderTextColor={theme.palette.neutral.mediumGrey}
            autoComplete="cc-number"
          />
          {errors.cardNumber && (
            <Text style={styles.errorText}>{errors.cardNumber}</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Card Holder Name</Text>
          <TextInput
            style={[styles.input, errors.cardHolder && styles.inputError]}
            placeholder="Name on Card"
            value={cardHolder}
            onChangeText={setCardHolder}
            placeholderTextColor={theme.palette.neutral.mediumGrey}
            autoCapitalize="words"
            autoComplete="cc-name"
          />
          {errors.cardHolder && (
            <Text style={styles.errorText}>{errors.cardHolder}</Text>
          )}
        </View>

        <View style={styles.row}>
          <View
            style={[
              styles.fieldGroup,
              { flex: 1, marginRight: theme.spacing.sm },
            ]}
          >
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              style={[styles.input, errors.expiry && styles.inputError]}
              placeholder="MM/YY"
              value={expiry}
              onChangeText={handleExpiryChange}
              maxLength={5}
              keyboardType="number-pad"
              placeholderTextColor={theme.palette.neutral.mediumGrey}
              autoComplete="cc-exp"
            />
            {errors.expiry && (
              <Text style={styles.errorText}>{errors.expiry}</Text>
            )}
          </View>
          <View
            style={[
              styles.fieldGroup,
              { flex: 1, marginLeft: theme.spacing.sm },
            ]}
          >
            <Text style={styles.label}>Brand</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Visa"
              value={brand}
              onChangeText={setBrand}
              placeholderTextColor={theme.palette.neutral.mediumGrey}
              autoCapitalize="words"
              autoComplete="cc-type"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.palette.neutral.background,
    justifyContent: "center",
  },
  title: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  fieldGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.palette.neutral.lightGrey,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
    fontFamily: theme.typography.fontFamily.regular,
    ...theme.shadows.sm,
  },
  inputError: {
    borderColor: theme.palette.status.error,
  },
  errorText: {
    color: theme.palette.status.error,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.medium,
  },
  row: {
    flexDirection: "row",
    marginBottom: theme.spacing.lg,
  },
  saveButton: {
    backgroundColor: theme.palette.primary.main,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginTop: theme.spacing.xl,
    ...theme.shadows.md,
  },
  saveButtonText: {
    color: theme.palette.primary.contrast,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    letterSpacing: 1,
  },
});
