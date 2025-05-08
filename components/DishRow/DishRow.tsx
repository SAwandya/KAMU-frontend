// components/DishRow.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dish } from "../../types";
import { useCart } from "../../hooks/useCart";
import theme from "../../constants/Theme";

interface DishRowProps {
  dish: Dish;
  restaurantId: string;
}

const DishRow: React.FC<DishRowProps> = ({ dish, restaurantId }) => {
  const [isPressed, setIsPressed] = useState<boolean>(false);
  const { addToCart, removeFromCart, getItemQuantity } = useCart();
  const quantity = getItemQuantity(dish.id);

  const handleAddToCart = () => {
    addToCart({ ...dish, restaurantId });
  };

  const handleRemoveFromCart = () => {
    removeFromCart(dish.id);
  };

  return (
    <View style={styles.rowContainer}>
      <TouchableOpacity
        onPress={() => setIsPressed(!isPressed)}
        style={styles.container}
        activeOpacity={0.7}
      >
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{dish.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {dish.description}
          </Text>
          <Text style={styles.price}>${dish.price.toFixed(2)}</Text>

          {quantity > 0 && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityBadgeText}>{quantity}</Text>
            </View>
          )}
        </View>

        {(dish.image || dish.imageSource) && (
          <View style={styles.imageContainer}>
            <Image
              source={dish.imageSource || { uri: dish.image }}
              style={styles.image}
              resizeMode="cover"
            />
            {!isPressed && quantity === 0 && (
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={handleAddToCart}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={theme.palette.neutral.white}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </TouchableOpacity>

      {isPressed && (
        <View style={styles.quantityContainer}>
          <View style={styles.divider} />
          <View style={styles.quantityControls}>
            <TouchableOpacity
              disabled={!quantity}
              onPress={handleRemoveFromCart}
              style={[
                styles.quantityButton,
                !quantity && styles.disabledButton,
              ]}
            >
              <Ionicons
                name="remove"
                size={22}
                color={
                  !quantity
                    ? theme.palette.neutral.grey
                    : theme.palette.secondary.main
                }
              />
            </TouchableOpacity>

            <Text style={styles.quantityText}>{quantity}</Text>

            <TouchableOpacity
              onPress={handleAddToCart}
              style={styles.quantityButton}
            >
              <Ionicons
                name="add"
                size={22}
                color={theme.palette.secondary.main}
              />
            </TouchableOpacity>
          </View>

          {quantity > 0 && (
            <TouchableOpacity
              style={styles.addToOrderButton}
              onPress={() => setIsPressed(false)}
            >
              <Text style={styles.addToOrderText}>
                Add to order • ${(quantity * dish.price).toFixed(2)}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    marginBottom: 16,
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  container: {
    flexDirection: "row",
    padding: 16,
  },
  infoContainer: {
    flex: 1,
    paddingRight: 12,
    position: "relative",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: theme.palette.neutral.black,
  },
  description: {
    fontSize: 14,
    color: theme.palette.neutral.mediumGrey,
    marginBottom: 8,
    lineHeight: 20,
  },
  price: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.palette.neutral.darkGrey,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.neutral.lightGrey,
  },
  quantityBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: theme.palette.secondary.main,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityBadgeText: {
    color: theme.palette.neutral.white,
    fontSize: 12,
    fontWeight: "700",
  },
  quickAddButton: {
    position: "absolute",
    bottom: -8,
    right: -8,
    backgroundColor: theme.palette.secondary.main,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  quantityContainer: {
    padding: 16,
    paddingTop: 0,
  },
  divider: {
    height: 1,
    backgroundColor: theme.palette.neutral.lightGrey,
    marginBottom: 16,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  quantityButton: {
    padding: 8,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.palette.neutral.lightGrey,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 20,
    minWidth: 20,
    textAlign: "center",
    color: theme.palette.neutral.black,
  },
  addToOrderButton: {
    backgroundColor: theme.palette.secondary.main,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
  },
  addToOrderText: {
    color: theme.palette.neutral.white,
    fontWeight: "600",
    fontSize: 15,
  },
});

export default DishRow;
