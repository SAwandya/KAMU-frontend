import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../constants/Theme";
import {
  promotions as promotionsData,
  Promotion,
} from "../../../data/promotionData";
import { useRouter } from "expo-router";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - theme.spacing.lg;

const PromotionTab: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handlePress = (promoId: string) => {
    router.push(`/promotion/${promoId}`);
  };

  useEffect(() => {
    setTimeout(() => {
      setPromotions(promotionsData);
      setLoading(false);
    }, 500);
  }, []);

  // Map promo types to appropriate visual styles
  const getPromoBgStyle = (type: string, status: string) => {
    if (status !== "active") return "#F8F8F8";
    return type === "percentage" ? "#EFF6FF" : "#EEFAF2";
  };

  const getPromoColor = (type: string, status: string) => {
    if (status !== "active") return theme.palette.neutral.mediumGrey;
    return type === "percentage" ? "#2563EB" : "#059669";
  };

  const getPromoImage = (id: string) => {
    // Map promotion IDs to images - in a real app these would come from your backend
    const images = {
      "1": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=3080&auto=format&fit=crop",
      "2": "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?q=80&w=3270&auto=format&fit=crop",
      "21": "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=3270&auto=format&fit=crop",
      "22": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=3270&auto=format&fit=crop",
      "23": "https://images.unsplash.com/photo-1579684947550-22e945225d9a?q=80&w=3270&auto=format&fit=crop",
      default:
        "https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?q=80&w=3387&auto=format&fit=crop",
    };

    return images[id] || images.default;
  };

  const renderPromotion = ({
    item,
    index,
  }: {
    item: Promotion;
    index: number;
  }) => {
    const isActive = item.status === "active";
    const promoColor = getPromoColor(item.type, item.status);
    const promoBg = getPromoBgStyle(item.type, item.status);

    return (
      <Animated.View entering={FadeInUp.delay(index * 80).springify()}>
        <TouchableOpacity
          style={[styles.promoCard]}
          onPress={() => handlePress(item.id)}
          activeOpacity={0.9}
        >
          <Image
            source={{ uri: getPromoImage(item.id) }}
            style={styles.promoImage}
          />

          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.7)"]}
            style={styles.promoGradient}
          >
            <View style={[styles.promoBadge, { backgroundColor: promoBg }]}>
              <Text style={[styles.promoBadgeText, { color: promoColor }]}>
                {item.type === "percentage"
                  ? `${item.amount}% OFF`
                  : `$${item.amount} OFF`}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.promoContent}>
            <View style={styles.promoHeader}>
              <View>
                <Text style={styles.promoCode}>{item.code}</Text>
                <Text style={styles.promoMessage} numberOfLines={2}>
                  {item.message ||
                    `Save ${
                      item.type === "percentage"
                        ? `${item.amount}%`
                        : `$${item.amount}`
                    } on your order`}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: isActive ? "#E9F7EF" : "#FEE2E2" },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: isActive ? "#059669" : "#DC2626" },
                  ]}
                >
                  {isActive ? "Active" : "Expired"}
                </Text>
              </View>
            </View>

            <View style={styles.promoMeta}>
              {item.applicableRestaurants.length > 0 && (
                <View style={styles.metaItem}>
                  <Ionicons
                    name="restaurant-outline"
                    size={14}
                    color={theme.palette.neutral.darkGrey}
                  />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {item.applicableRestaurants.slice(0, 2).join(", ")}
                    {item.applicableRestaurants.length > 2 ? " + more" : ""}
                  </Text>
                </View>
              )}

              <View style={styles.metaItem}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={theme.palette.neutral.darkGrey}
                />
                <Text style={styles.metaText}>
                  Expires {new Date(item.endDate).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.promoFooter}>
              <View style={styles.minOrderContainer}>
                <Text style={styles.minOrderText}>
                  {item.minOrderValue > 0
                    ? `Min. order: $${item.minOrderValue}`
                    : "No minimum"}
                </Text>
              </View>
              <View style={styles.seeDetailsButton}>
                <Text style={styles.seeDetailsText}>See details</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.palette.primary.main}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Promotions</Text>
        <Text style={styles.headerSubtitle}>
          Available offers and discounts for you
        </Text>
      </View>

      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        renderItem={renderPromotion}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="ticket-outline"
              size={60}
              color={theme.palette.neutral.lightGrey}
            />
            <Text style={styles.emptyText}>No promotions available</Text>
            <Text style={styles.emptySubtext}>
              Check back later for new offers
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    color: theme.palette.neutral.black,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  promoCard: {
    width: CARD_WIDTH,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.neutral.white,
    overflow: "hidden",
    ...theme.shadows.sm,
  },
  promoImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  promoGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: theme.spacing.sm,
  },
  promoBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    marginBottom: theme.spacing.sm,
  },
  promoBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.sm,
  },
  promoContent: {
    padding: theme.spacing.md,
  },
  promoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.sm,
  },
  promoCode: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
    marginBottom: 2,
  },
  promoMessage: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    maxWidth: "80%",
    lineHeight: 18,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.pill,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
  },
  promoMeta: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.palette.neutral.lightGrey + "40", // 25% opacity
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  metaText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.neutral.darkGrey,
    marginLeft: theme.spacing.xs,
  },
  promoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.sm,
  },
  minOrderContainer: {
    backgroundColor: theme.palette.neutral.lightGrey + "50", // 30% opacity
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
  },
  minOrderText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.neutral.darkGrey,
  },
  seeDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  seeDetailsText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.xs,
    color: theme.palette.primary.main,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.mediumGrey,
    marginTop: theme.spacing.xs,
  },
});

export default PromotionTab;
