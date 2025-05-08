import { CartItem } from "./store";

export enum PaymentMethod {
  CARD = "card",
  CASH = "cash",
  WALLET = "wallet",
}

export interface CardDetails {
  id: string;
  type: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface PaymentProcessRequest {
  amount: number;
  paymentMethodId: string;
  orderId: string;
}

export interface OrderPayment {
  method: PaymentMethod;
  methodId?: string;
  transactionId?: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  timestamp: string;
}

// Extend the existing Order interface if needed
export interface PaymentOrder {
  id: string;
  restaurantId: string;
  items: CartItem[];
  total: number;
  status: string;
  createdAt: string;
  payment?: OrderPayment;
}
