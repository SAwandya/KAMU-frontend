// hooks/useCart.tsx
import { useContext, createContext, useState, ReactNode } from "react";
import { CartItem, Dish } from "../types";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Dish & { restaurantId: string }) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getItemQuantity: (id: string) => number;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (item: Dish & { restaurantId: string }) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === item.id);

      if (existingItem) {
        return currentItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }

      return [...currentItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((i) => i.id === id);

      if (existingItem && existingItem.quantity > 1) {
        return currentItems.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }

      return currentItems.filter((i) => i.id !== id);
    });
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (id: string) => {
    return items.find((item) => item.id === id)?.quantity || 0;
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
