import api from "./apiClient"; // Make sure this is your Axios instance

export interface FoodItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  prepareTime: number;
  isPromotion: boolean;
}

class FoodItemService {
  // Fetch food items by restaurantId
  async getFoodItemsByRestaurantId(restaurantId: number): Promise<FoodItem[]> {
    const response = await api.get<FoodItem[]>(
      `/restaurant/menu/restaurant/${restaurantId}`
    );
    console.log("Food items for restaurant:", response);
    return response.data;
  }

  // Optionally, you can add other methods such as creating or updating food items
}

export default new FoodItemService();
