// types/index.ts
export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  category: string;
  address: string;
  description: string;
  deliveryTime: string;
  dishes: Dish[];
}

export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  imageSource?: any; // Adding imageSource for local images
}

export interface CartItem extends Dish {
  quantity: number;
  restaurantId: string;
}

// FoodItem from API matches with Restaurant service
export interface FoodItem {
  id: string | number;
  restaurantId: string | number;
  name: string;
  description: string;
  price: number;
  prepareTime: number;
  isPromotion: boolean;
  image?: string;
  imageSource?: any; // For local images
}
