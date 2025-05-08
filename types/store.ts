// types/store.ts
import { Dish } from "./index";

export interface CartItem extends Dish {
  quantity: number;
  restaurantId: string;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export interface CartActions {
  addToCart: (item: Dish & { restaurantId: string }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getItemQuantity: (id: string) => number;
}

export type CartStore = CartState & CartActions;

// This is used in the main store type definition
export type StoreState = CartStore;
