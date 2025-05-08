// src/data/promotionsData.ts
export interface Promotion {
  id: string;
  code: string;
  type: "percentage" | "flat";
  amount: number;
  maxDiscount?: number;
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  applicableRestaurants: string[];
  applicableUsers: string[];
  status: "active" | "expired" | "inactive";
  message?: string;
}

export const promotions: Promotion[] = [
  {
    id: "1",
    code: "SAVE20",
    type: "percentage",
    amount: 20,
    maxDiscount: 50,
    minOrderValue: 100,
    startDate: "2025-04-01T00:00:00Z",
    endDate: "2025-04-30T23:59:59Z",
    usageLimit: 100,
    perUserLimit: 2,
    applicableRestaurants: ["Pizza Palace", "Burger Hub"],
    applicableUsers: [],
    status: "active",
    message: "Save 20% on orders over $100",
  },

  {
    id: "2",
    code: "FLAT50",
    type: "flat",
    amount: 50,
    minOrderValue: 200,
    startDate: "2025-04-10T00:00:00Z",
    endDate: "2025-05-10T23:59:59Z",
    usageLimit: 50,
    perUserLimit: 1,
    applicableRestaurants: ["Sushi Express"],
    applicableUsers: ["user123", "user456"],
    status: "active",
    message: "Get $50 off at Sushi Express for select users!",
  },
  {
    id: "21",
    code: "BURGERBLISS",
    type: "flat",
    amount: 25,
    minOrderValue: 70,
    startDate: "2025-04-01T00:00:00Z",
    endDate: "2025-05-15T23:59:59Z",
    usageLimit: 150,
    perUserLimit: 2,
    applicableRestaurants: ["Burger Hub"],
    applicableUsers: [],
    status: "active",
    message:
      "Get $25 off your Burger Hub order over $70! Enjoy juicy burgers at a discount.",
    restaurantImages: [
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "22",
    code: "SUSHIDAY",
    type: "percentage",
    amount: 18,
    maxDiscount: 40,
    minOrderValue: 90,
    startDate: "2025-04-10T00:00:00Z",
    endDate: "2025-06-10T23:59:59Z",
    usageLimit: 200,
    perUserLimit: 3,
    applicableRestaurants: ["Sushi Express"],
    applicableUsers: [],
    status: "active",
    message:
      "Save 18% at Sushi Express! Fresh rolls and sashimi, now for less.",
    restaurantImages: [
      "https://images.unsplash.com/photo-1543779508-66b53be2c5fc?auto=format&fit=crop&w=800&q=80",
    ],
  },
  {
    id: "23",
    code: "DINERDELIGHT",
    type: "flat",
    amount: 15,
    minOrderValue: 50,
    startDate: "2025-04-20T00:00:00Z",
    endDate: "2025-05-31T23:59:59Z",
    usageLimit: 100,
    perUserLimit: 1,
    applicableRestaurants: ["All Day Diner"],
    applicableUsers: [],
    status: "active",
    message:
      "Enjoy $15 off at All Day Diner on orders over $50. Breakfast, lunch, or dinner-your choice!",
    restaurantImages: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    ],
  },
];
