// app/(app)/restaurant/[id].tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DishRow from "../../../components/DishRow/DishRow";
import { Restaurant } from "../../../types";
import { getRestaurantById } from "../../../services/restaurantService";
import { useCart } from "@/hooks/useCart";
import AsyncStorage from "@react-native-async-storage/async-storage";
import theme from "@/constants/Theme";

// Import restaurant images
const restaurantImages = {
  "1": require("../../../assets/data/r1.jpeg"),
  "2": require("../../../assets/data/r2.jpeg"),
  "3": require("../../../assets/data/r3.jpeg"),
};

// Import dish images
const dishImages = {
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

const RestaurantScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
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

  const createOrder = async () => {
    try {
      router.push({
        pathname: "/payment/select-payment",
        params: {
          totalAmount: totalPrice,
          restaurantId: id,
          items: JSON.stringify(items),
        },
      });
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setIsLoading(true);
        const data = await getRestaurantById(id as string);

        // Enhance restaurant data with local image sources
        if (data) {
          const enhancedData = {
            ...data,
            imageSource: restaurantImages[data.id] || null,
            dishes: data.dishes.map((dish) => ({
              ...dish,
              imageSource: dishImages[dish.id] || null,
            })),
          };
          setRestaurant(enhancedData);
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

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

          {restaurant.dishes &&
            restaurant.dishes.map((dish) => (
              <DishRow
                key={dish.id}
                dish={{
                  ...dish,
                  // If dish has a local image, use it; otherwise fall back to URI
                  image: dish.imageSource ? undefined : dish.image,
                  imageSource: dish.imageSource,
                }}
                restaurantId={restaurant.id}
              />
            ))}
        </View>
      </Animated.ScrollView>

      {/* Checkout Button */}
      {items.length > 0 && (
        <TouchableOpacity style={styles.checkoutButton} onPress={createOrder}>
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
