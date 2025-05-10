// services/restaurantService.ts
import api from "./apiClient"; // Make sure this is your Axios instance

export interface Restaurant {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  images?: string;
  isAvailable: boolean;
  status: string;
}

class RestaurantService {
  async getAllRestaurants(): Promise<Restaurant[]> {
    const response = await api.get<Restaurant[]>("/restaurant");
    console.log("All restaurants:", response);
    return response.data;
  }

  async getRestaurantById(id: number): Promise<Restaurant> {
    const response = await api.get<Restaurant>(`/restaurant/${id}`);
    return response.data;
  }

}

export default new RestaurantService();
