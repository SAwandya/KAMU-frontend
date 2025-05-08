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
}

export interface CartItem extends Dish {
  quantity: number;
  restaurantId: string;
}
