// components/RestaurantCarousel.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
} from "react-native";
import theme from "../../constants/Theme";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width * 0.6;
const ITEM_SPACING = 16;

export interface Restaurant {
  id: string;
  name: string;
  image: string;
}

interface Props {
  restaurants: Restaurant[];
}

const RestaurantCarousel: React.FC<Props> = ({ restaurants }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (restaurants.length <= 1) return;
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= restaurants.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIndex, restaurants.length]);

  if (!restaurants.length) return null;

  const renderItem = ({ item }: { item: Restaurant }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.labelBar}>
        <Text style={styles.labelText}>{item.name}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.carouselContainer}>
      <Text style={styles.carouselTitle}>Applicable Restaurants</Text>
      <Animated.FlatList
        ref={flatListRef}
        data={restaurants}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: ITEM_SPACING / 2 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  carouselTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "bold",
    color: theme.palette.primary.main,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.md,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 0.6,
    marginHorizontal: ITEM_SPACING / 2,
    borderRadius: theme.borderRadius.lg,
    overflow: "hidden",
    backgroundColor: theme.palette.neutral.lightGrey,
    ...theme.shadows.md,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    position: "absolute",
    top: 0,
    left: 0,
  },
  labelBar: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  labelText: {
    color: theme.palette.neutral.white,
    fontWeight: "bold",
    fontSize: theme.typography.fontSize.md,
    textAlign: "center",
  },
});

export default RestaurantCarousel;
