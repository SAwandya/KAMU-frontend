export interface Category {
  id: string;
  name: string;
  emoji: string;
  icon: string; // Ionicons name
  color: string;
  textColor: string;
}

export const categories: Category[] = [
  {
    id: "1",
    name: "Fast Food",
    emoji: "🍔",
    icon: "fast-food-outline",
    color: "#F9F0D3",
    textColor: "#85660E",
  },
  {
    id: "2",
    name: "Pizza",
    emoji: "🍕",
    icon: "pizza-outline",
    color: "#E6F2EA",
    textColor: "#0B6832",
  },
  {
    id: "3",
    name: "Sushi",
    emoji: "🍣",
    icon: "fish-outline",
    color: "#F3EBF5",
    textColor: "#7E369C",
  },
  {
    id: "4",
    name: "Desserts",
    emoji: "🍰",
    icon: "ice-cream-outline",
    color: "#FBE8E7",
    textColor: "#C93A35",
  },
  {
    id: "5",
    name: "Healthy",
    emoji: "🥗",
    icon: "leaf-outline",
    color: "#E6F4F1",
    textColor: "#1D8275",
  },
  {
    id: "6",
    name: "Mexican",
    emoji: "🌮",
    icon: "restaurant-outline",
    color: "#FFF1DB",
    textColor: "#D17E06",
  },
  {
    id: "7",
    name: "Italian",
    emoji: "🍝",
    icon: "restaurant-outline",
    color: "#FFE8E8",
    textColor: "#A02C2C",
  },
  {
    id: "8",
    name: "Chinese",
    emoji: "🥡",
    icon: "cafe-outline",
    color: "#E9F5FF",
    textColor: "#0A6EBD",
  },
  {
    id: "9",
    name: "Breakfast",
    emoji: "🍳",
    icon: "egg-outline",
    color: "#FFF8E1",
    textColor: "#8D7B34",
  },
  {
    id: "10",
    name: "Coffee",
    emoji: "☕",
    icon: "cafe-outline",
    color: "#EFE8E4",
    textColor: "#6D4C41",
  },
  {
    id: "11",
    name: "Vegetarian",
    emoji: "🥬",
    icon: "leaf-outline",
    color: "#E8F5E9",
    textColor: "#2E7D32",
  },
  {
    id: "12",
    name: "Smoothies",
    emoji: "🥤",
    icon: "nutrition-outline",
    color: "#F3E5F5",
    textColor: "#8E24AA",
  },
];
