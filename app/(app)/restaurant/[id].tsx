// app/(app)/restaurant/[id].tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DishRow from "../../../components/DishRow/DishRow";
import { Dish } from "../../../types";
// Import the Restaurant and FoodItem types from restaurantService instead
import restaurantService, {
  Restaurant as APIRestaurant,
  FoodItem,
} from "../../../services/restaurantService";
import { useCart } from "@/hooks/useCart";
import useAuth from "@/hooks/useAuth";
import theme from "@/constants/Theme";

// Import restaurant images
const restaurantImages: Record<string, any> = {
  "1": require("../../../assets/data/r1.jpeg"),
  "2": require("../../../assets/data/r2.jpeg"),
  "3": require("../../../assets/data/r3.jpeg"),
};

// Import dish images
const dishImages: Record<string, any> = {
  d1: require("../../../assets/data/1.png"),
  d2: require("../../../assets/data/2.png"),
  d3: require("../../../assets/data/3.png"),
  d4: require("../../../assets/data/4.png"),
  d5: require("../../../assets/data/5.png"),
  d6: require("../../../assets/data/6.png"),
  d7: require("../../../assets/data/7.png"),
  d8: require("../../../assets/data/8.png"),
  d9: require("../../../assets/data/9.png"),
  d10: require("../../../assets/data/10.png"),
};

const HEADER_HEIGHT = 300;

// Define a combined restaurant type that includes both API and UI properties
interface CombinedRestaurant extends Partial<APIRestaurant> {
  id: string | number;
  name: string;
  image?: string;
  imageSource?: any;
  rating?: number;
  category?: string;
  description?: string;
  deliveryTime?: string;
  address?: string;
}

// Extend FoodItem to include imageSource property
interface ExtendedFoodItem extends FoodItem {
  imageSource?: any;
}

// Convert FoodItem to Dish for DishRow component
const convertFoodItemToDish = (foodItem: ExtendedFoodItem): Dish => {
  return {
    id: foodItem.id.toString(),
    name: foodItem.name,
    description: foodItem.description,
    price: foodItem.price,
    image: foodItem.image,
    imageSource: foodItem.imageSource,
  };
};

const RestaurantScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<CombinedRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<ExtendedFoodItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMenuLoading, setIsMenuLoading] = useState<boolean>(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const scrollY = new Animated.Value(0);

  const { items, clearCart, totalItems, totalPrice } = useCart();

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: "clamp",
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0],
    outputRange: [2, 1],
    extrapolateRight: "clamp",
  });

  // Improved createOrder function with authentication check
  const handleCheckout = () => {
    // Skip auth check since users are already logged in via app layout
    // We can assume the user is valid if they're in the app section

    if (!restaurant) {
      Alert.alert("Error", "Restaurant information not available");
      return;
    }

    if (items.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to your cart before checkout"
      );
      return;
    }

    // Validate cart items belong to this restaurant
    const hasOtherRestaurantItems = items.some(
      (item) => item.restaurantId && item.restaurantId !== id
    );

    if (hasOtherRestaurantItems) {
      Alert.alert(
        "Items from Different Restaurant",
        "Your cart contains items from another restaurant. Would you like to clear your cart and add items from this restaurant instead?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Clear Cart",
            onPress: () => clearCart(),
          },
        ]
      );
      return;
    }

    // Proceed to checkout
    router.push({
      pathname: "/payment/select-payment",
      params: {
        totalAmount: totalPrice.toString(),
        restaurantId: id as string,
        items: JSON.stringify(
          items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }))
        ),
      },
    });
  };

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true);
        const data = await restaurantService.getRestaurantById(id as string);

        // Create a combined restaurant with UI-friendly properties
        const enhancedData: CombinedRestaurant = {
          ...data,
          // Set default values for UI properties if not provided by API
          image:
            data.images && typeof data.images === "string"
              ? data.images
              : undefined,
          imageSource: restaurantImages[data.id.toString()] || null,
          rating: 4.5, // Default rating if not provided
          category: "Restaurant", // Default category if not provided
          description: "Delicious food served fresh.", // Default description
          deliveryTime: "30", // Default delivery time
        };

        setRestaurant(enhancedData);
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  // Fetch menu items with retry mechanism
  const fetchMenuItems = useCallback(async () => {
    if (!id) return;

    try {
      setIsMenuLoading(true);
      setMenuError(null);

      console.log(
        `Fetching menu for restaurant ${id}, attempt ${retryCount + 1}`
      );
      const items = await restaurantService.getFoodItemsByRestaurantId(
        id as string
      );

      if (items.length === 0 && retryCount < 2) {
        // Retry up to 2 times if no items returned
        setRetryCount((prev) => prev + 1);
        return;
      }

      // Enhance menu items with local image sources if available
      const enhancedItems = items.map((item) => ({
        ...item,
        imageSource: dishImages[`d${item.id.toString()}`] || dishImages.d1,
      }));

      setMenuItems(enhancedItems);
    } catch (error: any) {
      console.error("Error fetching menu items:", error);
      setMenuError(error.message || "Failed to load menu items");
    } finally {
      setIsMenuLoading(false);
    }
  }, [id, retryCount]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Handle retry button press
  const handleRetryMenuLoad = () => {
    setRetryCount(0);
    fetchMenuItems();
  };

  if (isLoading || !restaurant) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
        <Text style={styles.loadingText}>Loading restaurant details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Animated Header */}
      <Animated.View
        style={[styles.animatedHeader, { opacity: headerOpacity }]}
      >
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.palette.neutral.white}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{restaurant.name}</Text>
        <TouchableOpacity style={styles.heartButton}>
          <Ionicons
            name="heart-outline"
            size={24}
            color={theme.palette.neutral.white}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={styles.scrollViewContent}
      >
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            },
          ]}
        >
          <Image
            source={restaurant.imageSource || { uri: restaurant.image }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.imageForeground}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.palette.neutral.white}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.heartButton}>
              <Ionicons
                name="heart-outline"
                size={24}
                color={theme.palette.neutral.white}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.detailsCard}>
          <View style={styles.restaurantDetails}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={18} color="#FFD700" />
                <Text style={styles.statText}>{restaurant.rating}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.categoryText}>{restaurant.category}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={theme.palette.neutral.darkGrey}
                />
                <Text style={styles.statText}>
                  {restaurant.deliveryTime} min
                </Text>
              </View>
            </View>

            <View style={styles.addressContainer}>
              <Ionicons
                name="location-outline"
                size={18}
                color={theme.palette.neutral.darkGrey}
              />
              <Text style={styles.addressText}>{restaurant.address}</Text>
            </View>

            <Text style={styles.description}>{restaurant.description}</Text>
          </View>

          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <View style={styles.divider} />
          </View>

          {isMenuLoading ? (
            <View style={styles.menuLoadingContainer}>
              <ActivityIndicator
                size="small"
                color={theme.palette.primary.main}
              />
              <Text style={styles.menuLoadingText}>Loading menu items...</Text>
            </View>
          ) : menuError ? (
            <View style={styles.menuErrorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={32}
                color={theme.palette.status.error}
              />
              <Text style={styles.menuErrorText}>{menuError}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryMenuLoad}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : menuItems.length > 0 ? (
            menuItems.map((foodItem) => (
              <DishRow
                key={foodItem.id.toString()}
                dish={convertFoodItemToDish(foodItem)}
                restaurantId={restaurant.id.toString()}
              />
            ))
          ) : (
            <View style={styles.noMenuContainer}>
              <Ionicons
                name="restaurant-outline"
                size={32}
                color={theme.palette.neutral.darkGrey}
              />
              <Text style={styles.noMenuText}>No menu items available</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetryMenuLoad}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* Checkout Button */}
      {items.length > 0 && (
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <View style={styles.basketItemCount}>
            <Text style={styles.basketItemCountText}>{totalItems}</Text>
          </View>
          <Text style={styles.checkoutButtonText}>View Basket</Text>
          <Text style={styles.checkoutAmount}>${totalPrice.toFixed(2)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.palette.neutral.darkGrey,
    fontSize: theme.typography.fontSize.md,
  },
  menuLoadingContainer: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  menuLoadingText: {
    marginTop: theme.spacing.sm,
    color: theme.palette.neutral.darkGrey,
    fontSize: theme.typography.fontSize.sm,
  },
  menuErrorContainer: {
    padding: theme.spacing.lg,
    alignItems: "center",
  },
  menuErrorText: {
    marginTop: theme.spacing.sm,
    color: theme.palette.status.error,
    fontSize: theme.typography.fontSize.md,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  noMenuContainer: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  noMenuText: {
    marginTop: theme.spacing.sm,
    textAlign: "center",
    color: theme.palette.neutral.darkGrey,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.palette.primary.light,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  retryButtonText: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "500",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: theme.palette.primary.main,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    paddingTop: 40,
  },
  headerTitle: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
  },
  backButtonHeader: {
    padding: theme.spacing.xs,
  },
  scrollViewContent: {
    paddingBottom: theme.spacing.xxl,
  },
  imageContainer: {
    height: HEADER_HEIGHT,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageForeground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailsCard: {
    backgroundColor: theme.palette.neutral.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  restaurantDetails: {
    paddingBottom: theme.spacing.lg,
  },
  restaurantName: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
    marginBottom: theme.spacing.md,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginLeft: theme.spacing.xs,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.neutral.grey,
    marginHorizontal: theme.spacing.sm,
  },
  addressContainer: {
    flexDirection: "row",
    marginBottom: theme.spacing.md,
    alignItems: "center",
  },
  addressText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginLeft: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    lineHeight: 22,
  },
  menuHeader: {
    marginVertical: theme.spacing.lg,
  },
  menuTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
    marginBottom: theme.spacing.sm,
  },
  divider: {
    height: 2,
    backgroundColor: theme.palette.neutral.lightGrey,
    width: 40,
  },
  checkoutButtonContainer: {
    position: "absolute",
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  checkoutButton: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.borderRadius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.md,
  },
  basketItemCount: {
    backgroundColor: theme.palette.primary.dark,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  basketItemCountText: {
    color: theme.palette.neutral.white,
    fontWeight: "bold",
    fontSize: theme.typography.fontSize.sm,
  },
  checkoutButtonText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "bold",
  },
  checkoutAmount: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "bold",
  },
});

export default RestaurantScreen;
