// hooks/useDelivery.ts
import { useState, useCallback, useEffect } from "react";
import deliveryService, {
  Trip,
  Location,
  TRIP_STATUS,
} from "../services/deliveryService";

interface DeliveryState {
  currentTrip: Trip | null;
  currentLocation: Location | null;
  loading: boolean;
  error: string | null;
  isTracking: boolean;
}

export const useDelivery = (tripId?: string | number) => {
  const [state, setState] = useState<DeliveryState>({
    currentTrip: null,
    currentLocation: null,
    loading: false,
    error: null,
    isTracking: false,
  });

  // Create a new trip
  const createTrip = useCallback(
    async (tripData: Omit<Trip, "id" | "created_at" | "updated_at">) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const newTrip = await deliveryService.createTrip(tripData);
        setState((prev) => ({
          ...prev,
          currentTrip: newTrip,
          loading: false,
        }));
        return newTrip;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create trip";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Get a trip by ID
  const getTripById = useCallback(async (id: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const trip = await deliveryService.getTripById(id);
      setState((prev) => ({
        ...prev,
        currentTrip: trip,
        loading: false,
      }));
      return trip;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch trip";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Update trip status
  const updateTripStatus = useCallback(
    async (id: string | number, status: TRIP_STATUS | string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const updatedTrip = await deliveryService.updateTrip(id, { status });
        setState((prev) => ({
          ...prev,
          currentTrip: updatedTrip,
          loading: false,
        }));
        return updatedTrip;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update trip status";
        setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Get rider location
  const getRiderLocation = useCallback(async (riderId: string | number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const location = await deliveryService.getRiderLocation(riderId);
      setState((prev) => ({
        ...prev,
        currentLocation: location,
        loading: false,
      }));
      return location;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch rider location";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      return null;
    }
  }, []);

  // Start real-time tracking
  const startTracking = useCallback(
    (id: string | number, onLocationUpdate: (data: any) => void) => {
      setState((prev) => ({ ...prev, isTracking: true }));

      // This sets up the socket connection and returns a cleanup function
      const cleanupFn = deliveryService.setupTripSocket(id, (data) => {
        setState((prev) => ({
          ...prev,
          currentLocation: data.location || prev.currentLocation,
        }));

        onLocationUpdate(data);
      });

      return () => {
        cleanupFn();
        setState((prev) => ({ ...prev, isTracking: false }));
      };
    },
    []
  );

  // If tripId is provided, automatically fetch trip details
  useEffect(() => {
    if (tripId) {
      getTripById(tripId);
    }
  }, [tripId, getTripById]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    createTrip,
    getTripById,
    updateTripStatus,
    getRiderLocation,
    startTracking,
    clearError,
  };
};

export default useDelivery;
