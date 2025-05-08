// components/Payment/CreditCardItem.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card } from "@/store/paymentStore";

type Props = {
  card: Card;
  isSelected: boolean;
  onSelect: () => void;
};

export default function CreditCardItemNew({ card, isSelected, onSelect }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.selected]}
      onPress={onSelect}
    >
      <Text>
        {card.brand} **** {card.cardNumber.slice(-4)}
      </Text>
      <Text>{card.cardHolder}</Text>
      <Text>Exp: {card.expiry}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  selected: { borderColor: "#007AFF", backgroundColor: "#e6f0ff" },
});
