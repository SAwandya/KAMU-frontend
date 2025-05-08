import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Restaurant } from "../../types";
import theme from "../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        router.push(`/restaurant/${restaurant.id}`);
      }}
      activeOpacity={0.95}
    >
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={restaurant.imageSource || { uri: restaurant.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Delivery Time Badge */}
        <View style={styles.deliveryTimeContainer}>
          <Text style={styles.deliveryTimeText}>
            {restaurant.deliveryTime} min
          </Text>
        </View>

        {/* Favorite Button - Uber-like touch */}
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons
            name="heart-outline"
            size={18}
            color={theme.palette.neutral.black}
          />
        </TouchableOpacity>
      </View>

      {/* Restaurant Information */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>{restaurant.rating}</Text>
          </View>
        </View>

        {/* Category and other info */}
        <View style={styles.detailsRow}>
          <Text style={styles.category}>{restaurant.category}</Text>
          <View style={styles.dotSeparator} />
          <View style={styles.deliveryFeeContainer}>
            <Text style={styles.deliveryFee}>Free Delivery</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.palette.neutral.white,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  imageContainer: {
    position: "relative",
    height: 176,
    backgroundColor: theme.palette.neutral.lightGrey,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  deliveryTimeContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: theme.palette.neutral.white,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    ...theme.shadows.sm,
  },
  deliveryTimeText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: theme.palette.neutral.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  infoContainer: {
    padding: 12,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.palette.neutral.black,
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.palette.neutral.black,
    marginLeft: 3,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  category: {
    fontSize: 14,
    color: theme.palette.neutral.darkGrey,
  },
  dotSeparator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.palette.neutral.mediumGrey,
    marginHorizontal: 6,
  },
  deliveryFeeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryFee: {
    fontSize: 14,
    color: theme.palette.secondary.main,
    fontWeight: "500",
  },
});

export default RestaurantCard;
