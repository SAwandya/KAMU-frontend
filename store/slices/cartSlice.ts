// store/slices/cartSlice.ts
import { StateCreator } from "zustand";
import { CartStore, CartItem } from "../../types/store";

export const createCartSlice: StateCreator<CartStore> = (set, get) => ({
  // Initial state
  items: [],
  totalItems: 0,
  totalPrice: 0,

  // Actions
  addToCart: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);

      let updatedItems: CartItem[];

      if (existingItem) {
        updatedItems = state.items.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [...state.items, { ...item, quantity: 1 }];
      }

      // Calculate derived state
      const totalItems = updatedItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const totalPrice = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      return {
        items: updatedItems,
        totalItems,
        totalPrice,
      };
    });
  },

  removeFromCart: (id) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === id);

      let updatedItems: CartItem[];

      if (existingItem && existingItem.quantity > 1) {
        updatedItems = state.items.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      } else {
        updatedItems = state.items.filter((i) => i.id !== id);
      }

      // Calculate derived state
      const totalItems = updatedItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      const totalPrice = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );

      return {
        items: updatedItems,
        totalItems,
        totalPrice,
      };
    });
  },

  clearCart: () => {
    set({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  },

  getItemQuantity: (id) => {
    return get().items.find((item) => item.id === id)?.quantity || 0;
  },
});
