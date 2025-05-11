import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  FlatList,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/constants/Theme";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// Import data from separate files
import { restaurants } from "@/assets/data/restaurants";
import { categories } from "@/assets/data/categories";
import { deliveryOptions } from "@/assets/data/deliveryOptions";
import { offers } from "@/assets/data/offers";
import { useRestaurants } from "@/hooks/useRestaurant";
import restaurantService from "@/services/restaurantService";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState("1");
  const [activeCategory, setActiveCategory] = useState("1");
  const scrollRef = useRef(null);
  const scrollY = useSharedValue(0);

  const [restaurantData, setRestaurantData] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchRestaurants = async () => {
  //     try {
  //       const data = await restaurantService.getAllRestaurants();
  //       setRestaurantData(data.restaurants);
  //     } catch (err: any) {
  //       setError(err.message || "Failed to fetch restaurants");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchRestaurants();
  // }, []);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await restaurantService.getAllRestaurants();
        const formattedRestaurants = data.restaurants.map((r) => ({
          ...r,
          imageSource: {
            uri: JSON.parse(r.images.replace(/'/g, '"'))[0], // Fixes single quotes and parses
          },
          rating: 4.5, // Add default or actual value if available
          category: "Sri Lankan", // Add a placeholder or real data
          deliveryTime: 30, // Same here
        }));
        setRestaurantData(formattedRestaurants);
      } catch (err: any) {
        setError(err.message || "Failed to fetch restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  console.log("Restaurant data:", restaurantData);

  const handleScroll = (event) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  const renderOfferItem = ({ item }) => (
    <Animated.View entering={FadeInUp.delay(300).springify()}>
      <TouchableOpacity style={styles.offerCard} activeOpacity={0.9}>
        <ImageBackground
          source={item.imageSource}
          style={styles.offerImageBackground}
          imageStyle={{ borderRadius: theme.borderRadius.md }}
        >
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.offerGradient}
          >
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
              <TouchableOpacity style={styles.orderNowButton}>
                <Text style={styles.orderNowText}>Claim</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        activeCategory === item.id && styles.categoryItemActive,
      ]}
      activeOpacity={0.7}
      onPress={() => setActiveCategory(item.id)}
    >
      <View
        style={[styles.categoryImageContainer, { backgroundColor: item.color }]}
      >
        <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      </View>
      <Text
        style={[
          styles.categoryName,
          {
            color:
              activeCategory === item.id
                ? theme.palette.primary.main
                : theme.palette.neutral.darkGrey,
          },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header Bar */}
      <Animated.View
        style={styles.header}
        entering={FadeInDown.duration(500).springify()}
      >
        <View>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-sharp"
              size={16}
              color={theme.palette.neutral.black}
            />
            <Text style={styles.locationText}>Colombo, Sri Lanka</Text>
            <Ionicons
              name="chevron-down"
              size={14}
              color={theme.palette.neutral.mediumGrey}
              style={{ marginLeft: theme.spacing.xs / 2 }}
            />
          </View>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => router.push("/(app)/(tabs)/account")}
        >
          <Image
            source={require("@/assets/data/avatar.png")}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Delivery Options */}
        <View style={styles.deliveryOptionsContainer}>
          {deliveryOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.deliveryOption,
                selectedOption === option.id && styles.deliveryOptionSelected,
              ]}
              onPress={() => setSelectedOption(option.id)}
            >
              <Ionicons
                name={option.icon}
                size={16}
                color={
                  selectedOption === option.id
                    ? theme.palette.neutral.white
                    : theme.palette.neutral.black
                }
                style={styles.deliveryOptionIcon}
              />
              <Text
                style={[
                  styles.deliveryOptionText,
                  selectedOption === option.id &&
                    styles.deliveryOptionTextSelected,
                ]}
              >
                {option.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push("/(app)/(tabs)/browse")}
        >
          <Ionicons
            name="search"
            size={18}
            color={theme.palette.neutral.mediumGrey}
          />
          <Text style={styles.searchText}>Food, groceries, drinks, etc.</Text>
        </TouchableOpacity>

        {/* Categories Section - Horizontal scrolling */}
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
          style={styles.categoriesList}
        />

        {/* Offers Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Offers for you</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={offers}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.offersContainer}
          snapToInterval={width - theme.spacing.xl * 3}
          decelerationRate="fast"
          snapToAlignment="center"
          pagingEnabled
        />

        {/* Restaurants Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Restaurants</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.restaurantsContainer}>
          {restaurantData.map((restaurant, index) => (
            <Animated.View
              key={restaurant.id}
              entering={FadeInUp.delay(index * 100).springify()}
              style={styles.restaurantWrapper}
            >
              <TouchableOpacity
                style={styles.restaurantCard}
                activeOpacity={0.95}
                onPress={() =>
                  router.push(`/(app)/restaurant/${restaurant.id}`)
                }
              >
                <Image
                  source={restaurant.imageSource}
                  style={styles.restaurantImage}
                />
                <View style={styles.restaurantDetailsContainer}>
                  <View style={styles.restaurantNameRow}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.ratingText}>{restaurant.rating}</Text>
                    </View>
                  </View>
                  <Text style={styles.restaurantCategory}>
                    {restaurant.category} • {restaurant.deliveryTime} min
                  </Text>
                  <View style={styles.deliveryFeeContainer}>
                    <Text style={styles.deliveryFeeText}>Free Delivery</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.neutral.white,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: theme.spacing.xxl + theme.spacing.xl,
    paddingTop: theme.spacing.sm,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.palette.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.03)",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.black,
    marginLeft: theme.spacing.xs,
  },
  profileButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.lightGrey,
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  searchText: {
    fontFamily: theme.typography.fontFamily.regular,
    marginLeft: theme.spacing.sm,
    color: theme.palette.neutral.mediumGrey,
    fontSize: theme.typography.fontSize.sm,
  },
  deliveryOptionsContainer: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  deliveryOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.neutral.lightGrey,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.sm,
  },
  deliveryOptionSelected: {
    backgroundColor: theme.palette.neutral.black,
  },
  deliveryOptionIcon: {
    marginRight: theme.spacing.xs,
  },
  deliveryOptionText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.black,
  },
  deliveryOptionTextSelected: {
    color: theme.palette.neutral.white,
  },
  categoriesList: {
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.md,
  },
  categoriesContainer: {
    paddingRight: theme.spacing.sm,
  },
  categoryItem: {
    width: 70,
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  categoryItemActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  categoryImage: {
    width: 36,
    height: 36,
  },
  categoryName: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    textAlign: "center",
    color: theme.palette.neutral.darkGrey,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.neutral.black,
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.primary.main,
  },
  offersContainer: {
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  offerCard: {
    width: width - theme.spacing.md * 3,
    height: 140,
    marginRight: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  offerImageBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  offerGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  offerContent: {
    padding: theme.spacing.md,
  },
  offerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.palette.neutral.white,
  },
  offerSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.white,
    opacity: 0.9,
    marginBottom: theme.spacing.sm,
  },
  orderNowButton: {
    backgroundColor: theme.palette.neutral.white,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    alignSelf: "flex-start",
    ...theme.shadows.sm,
  },
  orderNowText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.palette.neutral.black,
    fontSize: theme.typography.fontSize.xs,
  },
  restaurantsContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  restaurantWrapper: {
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  restaurantCard: {
    flexDirection: "row",
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
  },
  restaurantImage: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.xs,
  },
  restaurantDetailsContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  restaurantNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  restaurantName: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,215,0,0.1)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: theme.borderRadius.sm,
  },
  ratingText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.black,
    marginLeft: theme.spacing.xs / 2,
  },
  restaurantCategory: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginTop: theme.spacing.xs,
  },
  deliveryFeeContainer: {
    marginTop: theme.spacing.xs,
  },
  deliveryFeeText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.status.success,
  },
  categoryEmoji: {
    fontSize: 24,
  },
});
