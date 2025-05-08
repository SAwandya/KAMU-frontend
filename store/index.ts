// store/index.ts
import { create } from "zustand";
import { createCartSlice } from "./slices/cartSlice";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StoreState } from "../types/store";

// Create the store with persistence
export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createCartSlice(...a),
    }),
    {
      name: "kamu-cart-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Only include cart data in persistence
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
);
