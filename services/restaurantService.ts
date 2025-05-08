// services/restaurantService.ts
import { Restaurant } from "../types";

// Mock data for restaurants
const restaurants: Restaurant[] = [
  {
    id: "1",
    name: "Burger King",
    image: "https://via.placeholder.com/400",
    rating: 4.2,
    category: "Fast Food",
    address: "123 Main St, Colombo",
    description:
      "Home of the Whopper and more. Enjoy flame-grilled burgers, crispy fries, and refreshing drinks.",
    deliveryTime: "20-30",
    dishes: [
      {
        id: "d1",
        name: "Whopper",
        description:
          "A ¼ lb of flame-grilled beef with juicy tomatoes, crisp lettuce, creamy mayonnaise, ketchup, crunchy pickles, and sliced white onions on a toasted sesame seed bun.",
        price: 5.99,
        image: "https://via.placeholder.com/200",
      },
      {
        id: "d2",
        name: "Chicken Sandwich",
        description:
          "Our Original Chicken Sandwich is made with white meat chicken, lightly breaded and topped with a simple combination of shredded lettuce and creamy mayonnaise on a sesame seed bun.",
        price: 4.99,
        image: "https://via.placeholder.com/200",
      },
      {
        id: "d3",
        name: "French Fries",
        description:
          "Golden, crispy, and piping hot. Our French fries are salted to perfection.",
        price: 2.49,
        image: "https://via.placeholder.com/200",
      },
    ],
  },
  // Add more restaurants as needed
];

export const getAllRestaurants = async (): Promise<Restaurant[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(restaurants);
    }, 500);
  });
};

export const getRestaurantById = async (
  id: string
): Promise<Restaurant | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const restaurant = restaurants.find((r) => r.id === id) || null;
      resolve(restaurant);
    }, 500);
  });
};
