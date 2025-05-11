// app/order-tracking.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "@/constants/Theme";

// Define a background task name
const LOCATION_TRACKING = "location-tracking";

// Define the background task
TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
  if (error) {
    console.error("Error in background location task:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    // Here you would send this location to your backend
    console.log("Background location:", location);

    try {
      // Store the latest location in AsyncStorage for retrieval when app reopens
      await AsyncStorage.setItem(
        "lastDriverLocation",
        JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error("Error saving location to storage:", err);
    }
  }
});

export default function OrderTrackingScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState("25 min");
  const [orderStatus, setOrderStatus] = useState("Preparing your order");
  const [driverName, setDriverName] = useState("Alex Johnson");
  const [restaurantName, setRestaurantName] = useState("Restaurant");
  const mapRef = useRef(null);
  const locationSubscription = useRef(null);

  // Initial region (default values, will be updated)
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Load order details
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const ordersJson = await AsyncStorage.getItem("orders");
        if (ordersJson) {
          const orders = JSON.parse(ordersJson);
          const foundOrder = orders.find((o) => o.id === orderId);
          if (foundOrder) {
            setOrder(foundOrder);

            // Get restaurant name if available
            if (foundOrder.restaurantId) {
              try {
                const restaurantsJson = await AsyncStorage.getItem(
                  "restaurants"
                );
                if (restaurantsJson) {
                  const restaurants = JSON.parse(restaurantsJson);
                  const foundRestaurant = restaurants.find(
                    (r) => r.id === foundOrder.restaurantId
                  );
                  if (foundRestaurant) {
                    setRestaurantName(foundRestaurant.name);
                  }
                }
              } catch (error) {
                console.error("Error loading restaurant:", error);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading order:", error);
      }
    };

    loadOrder();
  }, [orderId]);

  // Setup location tracking
  useEffect(() => {
    let locationWatchId = null;

    const startLocationTracking = async () => {
      try {
        setIsLoading(true);

        // Request permissions
        const { status: foregroundStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== "granted") {
          setErrorMsg("Permission to access location was denied");
          setIsLoading(false);
          return;
        }

        // Request background permissions on Android
        if (Platform.OS === "android") {
          const { status: backgroundStatus } =
            await Location.requestBackgroundPermissionsAsync();
          console.log("Background permission status:", backgroundStatus);
        }

        // Get current location (customer location)
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const customerCoords = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        };

        setCustomerLocation(customerCoords);

        // For demo purposes, set the driver location slightly offset from customer
        // In a real app, this would come from your backend
        const driverCoords = {
          latitude: customerCoords.latitude + 0.01,
          longitude: customerCoords.longitude + 0.01,
        };

        setDriverLocation(driverCoords);

        // Set route coordinates
        setRouteCoordinates([customerCoords, driverCoords]);

        // Set the map region to show both points
        setRegion({
          latitude: (customerCoords.latitude + driverCoords.latitude) / 2,
          longitude: (customerCoords.longitude + driverCoords.longitude) / 2,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        });

        // Start watching position for real-time updates
        locationWatchId = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10, // Update every 10 meters
            timeInterval: 5000, // Update every 5 seconds
          },
          (location) => {
            // In a real app, this would be the driver's location from your backend
            // For demo, we'll simulate driver movement towards customer
            const newDriverLocation = {
              latitude: driverCoords.latitude - Math.random() * 0.001,
              longitude: driverCoords.longitude - Math.random() * 0.001,
            };

            setDriverLocation(newDriverLocation);

            if (customerLocation) {
              setRouteCoordinates([customerLocation, newDriverLocation]);
            }

            // Calculate distance and update estimated time
            const distance = calculateDistance(
              customerLocation.latitude,
              customerLocation.longitude,
              newDriverLocation.latitude,
              newDriverLocation.longitude
            );

            // Rough estimate: 1km = 3 minutes
            const timeInMinutes = Math.max(
              5,
              Math.round((distance / 1000) * 3)
            );
            setEstimatedTime(`${timeInMinutes} min`);

            // Update order status based on distance
            if (distance < 500) {
              setOrderStatus("Driver is nearby");
            } else if (distance < 2000) {
              setOrderStatus("Driver is on the way");
            } else {
              setOrderStatus("Order is being prepared");
            }
          }
        );

        // Start background location tracking if permission granted
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
          LOCATION_TRACKING
        );
        if (!hasStarted) {
          await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
            foregroundService: {
              notificationTitle: "Tracking Order",
              notificationBody: "Tracking your order in background",
              notificationColor: theme.palette.primary.main,
            },
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error setting up location tracking:", error);
        setErrorMsg("Failed to start location tracking");
        setIsLoading(false);
      }
    };

    startLocationTracking();

    // Cleanup function
    return () => {
      if (locationWatchId) {
        locationWatchId.remove();
      }

      // Stop background location tracking
      Location.hasStartedLocationUpdatesAsync(LOCATION_TRACKING).then(
        (hasStarted) => {
          if (hasStarted) {
            Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
          }
        }
      );
    };
  }, []);

  // Function to calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
  };

  // Function to fit map to show all markers
  const fitMapToMarkers = () => {
    if (mapRef.current && customerLocation && driverLocation) {
      mapRef.current.fitToCoordinates([customerLocation, driverLocation], {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const handleBackToHome = () => {
    router.replace("/(app)");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
        <Text style={styles.loadingText}>Getting your order status...</Text>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" />
        <Ionicons
          name="alert-circle"
          size={64}
          color={theme.palette.status.error}
        />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToHome}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIconButton}
          onPress={handleBackToHome}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.palette.neutral.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          onMapReady={fitMapToMarkers}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          zoomControlEnabled={false}
          mapPadding={{ top: 0, right: 0, bottom: 100, left: 0 }}
        >
          {customerLocation && (
            <Marker
              coordinate={customerLocation}
              title="Your Location"
              description="This is where you are"
            >
              <View style={styles.markerCustomer}>
                <Ionicons
                  name="home"
                  size={18}
                  color={theme.palette.neutral.white}
                />
              </View>
            </Marker>
          )}

          {driverLocation && (
            <Marker
              coordinate={driverLocation}
              title={`${driverName}`}
              description={`Arriving in ${estimatedTime}`}
            >
              <View style={styles.markerDriver}>
                <Ionicons
                  name="bicycle"
                  size={18}
                  color={theme.palette.neutral.white}
                />
              </View>
            </Marker>
          )}

          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeWidth={4}
              strokeColor={theme.palette.primary.main}
              lineDashPattern={[1, 3]}
            />
          )}
        </MapView>

        {/* Floating status card */}
        <View style={styles.statusOverlay}>
          <View style={styles.deliveryStatus}>
            <Ionicons
              name={
                orderStatus.includes("nearby") ? "location" : "time-outline"
              }
              size={24}
              color={theme.palette.primary.main}
            />
            <Text style={styles.deliveryStatusText}>
              {orderStatus} • {estimatedTime}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Details Bottom Sheet */}
      <View style={styles.detailsContainer}>
        <View style={styles.handleBar} />

        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.title}>Order 12345</Text>
            <Text style={styles.restaurantName}>{restaurantName}</Text>
          </View>
          <View style={styles.orderStatusBadge}>
            <Text style={styles.orderStatusText}>On the way</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Driver Info */}
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}>
            <Ionicons
              name="person"
              size={24}
              color={theme.palette.neutral.white}
            />
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{driverName}</Text>
            <Text style={styles.driverVehicle}>Delivery Partner</Text>
          </View>

          <View style={styles.driverActions}>
            <TouchableOpacity
              style={styles.driverAction}
              onPress={() => alert("Messaging driver...")}
            >
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color={theme.palette.primary.main}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.driverAction}
              onPress={() => alert("Calling driver...")}
            >
              <Ionicons
                name="call-outline"
                size={22}
                color={theme.palette.primary.main}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* ETA */}
        <View style={styles.etaContainer}>
          <View style={styles.etaIconContainer}>
            <Ionicons
              name="time-outline"
              size={24}
              color={theme.palette.primary.main}
            />
          </View>
          <View style={styles.etaInfo}>
            <Text style={styles.etaLabel}>Estimated Delivery</Text>
            <Text style={styles.etaTime}>{estimatedTime}</Text>
          </View>
        </View>

        {/* Contact Support */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => alert("Contacting support...")}
        >
          <Ionicons
            name="help-buoy-outline"
            size={20}
            color={theme.palette.neutral.white}
          />
          <Text style={styles.supportButtonText}>Help with this order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral.lightGrey,
  },
  backIconButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  mapContainer: {
    height: Dimensions.get("window").height * 0.45,
    width: "100%",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.neutral.mediumGrey,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  detailsContainer: {
    flex: 1,
    backgroundColor: theme.palette.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "700",
    color: theme.palette.neutral.black,
  },
  restaurantName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    marginTop: 4,
  },
  orderStatusBadge: {
    backgroundColor: theme.palette.status.success,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  orderStatusText: {
    color: theme.palette.status.success,
    fontWeight: "600",
    fontSize: theme.typography.fontSize.sm,
  },
  divider: {
    height: 1,
    backgroundColor: theme.palette.neutral.lightGrey,
    marginVertical: theme.spacing.md,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.palette.primary.main,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  driverVehicle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginTop: 2,
  },
  driverActions: {
    flexDirection: "row",
  },
  driverAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.neutral.lightGrey,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.sm,
  },
  etaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginVertical: theme.spacing.md,
  },
  etaIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.primary.light,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.md,
  },
  etaInfo: {
    flex: 1,
  },
  etaLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
  },
  etaTime: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "700",
    color: theme.palette.neutral.black,
    marginTop: 2,
  },
  supportButton: {
    backgroundColor: theme.palette.secondary.main,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: "auto",
  },
  supportButtonText: {
    color: theme.palette.neutral.white,
    fontWeight: "600",
    fontSize: theme.typography.fontSize.md,
    marginLeft: theme.spacing.sm,
  },
  markerCustomer: {
    backgroundColor: theme.palette.primary.dark,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: theme.palette.neutral.white,
  },
  markerDriver: {
    backgroundColor: theme.palette.secondary.main,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: theme.palette.neutral.white,
  },
  statusOverlay: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  deliveryStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    ...theme.shadows.md,
  },
  deliveryStatusText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
    color: theme.palette.neutral.black,
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
    backgroundColor: theme.palette.neutral.background,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.status.error,
    textAlign: "center",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    backgroundColor: theme.palette.primary.main,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  backButtonText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
  },
});
