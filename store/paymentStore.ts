// store/paymentStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Card = {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  brand: string;
};

type PaymentState = {
  savedCards: Card[];
  selectedCardId: string | null;
  addCard: (card: Card) => void;
  setSelectedCardId: (id: string | null) => void;
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      savedCards: [],
      selectedCardId: null,
      addCard: (card) =>
        set((state) => ({
          savedCards: [...state.savedCards, card],
          selectedCardId: card.id,
        })),
      setSelectedCardId: (id) => set({ selectedCardId: id }),
    }),
    { name: "payment-store" }
  )
);
