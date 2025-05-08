// services/deliveryService.ts
import apiClient from "./apiClient";

export enum TRIP_STATUS {
  PENDING = "pending",
  ACCEPTED = "accepted",
  PICKED_UP = "picked_up",
  DELIVERED = "delivered",
  FAILED = "failed",
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Rider {
  id: number | string;
  name: string;
  isAvailable: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Trip {
  id: number | string;
  orderId: number | string;
  riderId: number | string;
  customerId: number | string;
  status: TRIP_STATUS | string;
  startLocation: Location;
  endLocation: Location;
  currentLocation?: Location;
  created_at?: string;
  updated_at?: string;
  rider?: Rider;
}

const deliveryService = {
  // Create a new trip
  createTrip: async (
    tripData: Omit<Trip, "id" | "created_at" | "updated_at">
  ): Promise<Trip> => {
    try {
      const response = await apiClient.post<Trip>("/trips", tripData);
      return response.data;
    } catch (error) {
      console.error("Error creating trip:", error);
      throw new Error("Failed to create trip");
    }
  },

  // Get a trip by ID
  getTripById: async (tripId: number | string): Promise<Trip> => {
    try {
      const response = await apiClient.get<Trip>(`/trips/${tripId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching trip with ID ${tripId}:`, error);
      throw new Error("Failed to fetch trip");
    }
  },

  // Update a trip (status, etc.)
  updateTrip: async (
    tripId: number | string,
    updateData: Partial<Trip>
  ): Promise<Trip> => {
    try {
      const response = await apiClient.patch<Trip>(
        `/trips/${tripId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating trip with ID ${tripId}:`, error);
      throw new Error("Failed to update trip");
    }
  },

  // Create a new rider
  createRider: async (
    riderData: Omit<Rider, "id" | "isAvailable" | "created_at" | "updated_at">
  ): Promise<Rider> => {
    try {
      const response = await apiClient.post<Rider>("/riders", riderData);
      return response.data;
    } catch (error) {
      console.error("Error creating rider:", error);
      throw new Error("Failed to create rider");
    }
  },

  // Update rider location (real-time)
  updateRiderLocation: async (
    riderId: number | string,
    location: Location
  ): Promise<void> => {
    try {
      await apiClient.post(`/riders/${riderId}/location`, { location });
    } catch (error) {
      console.error(`Error updating rider ${riderId} location:`, error);
      throw new Error("Failed to update rider location");
    }
  },

  // Get rider's current location
  getRiderLocation: async (riderId: number | string): Promise<Location> => {
    try {
      const response = await apiClient.get<Location>(
        `/riders/${riderId}/location`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching rider ${riderId} location:`, error);
      throw new Error("Failed to get rider location");
    }
  },

  // Socket.IO connection setup for real-time tracking
  setupTripSocket: (
    tripId: number | string,
    onLocationUpdate: (data: any) => void
  ) => {
    // In a real app, this would initialize socket.io connection
    // Example implementation when integrating with socket.io:
    //
    // import { io } from 'socket.io-client';
    //
    // const socket = io(`${API_URL}`);
    // socket.on('connect', () => {
    //   socket.emit('join_trip', tripId);
    //
    //   socket.on(`trip:${tripId}:location_update`, (data) => {
    //     if (onLocationUpdate) {
    //       onLocationUpdate(data);
    //     }
    //   });
    // });
    //
    // return () => {
    //   socket.disconnect();
    // };

    // Placeholder for demo
    console.log(`Socket connection would be established for trip ${tripId}`);

    // Return cleanup function
    return () => {
      console.log(`Socket connection would be closed for trip ${tripId}`);
    };
  },
};

export default deliveryService;
