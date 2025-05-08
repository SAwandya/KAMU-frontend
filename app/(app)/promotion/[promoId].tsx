import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import theme from "../../../constants/Theme";
import { promotions } from "../../../data/promotionData";
import RestaurantCarousel, {
  Restaurant,
} from "../../../components/Promotion/RestaurantCarousel";
import { restaurantImages } from "../../../data/restaurantImages";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - theme.spacing.md * 2;

const PromotionDetail: React.FC = () => {
  const { promoId } = useLocalSearchParams<{ promoId: string }>();
  const router = useRouter();
  const promo = promotions.find((p) => p.id === promoId);

  if (!promo) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.notFound}>Promotion not found.</Text>
      </SafeAreaView>
    );
  }

  const handleApply = () => {
    Alert.alert(
      "Promotion Applied",
      `Promo code "${promo.code}" has been applied to your next order!`,
      [{ text: "OK" }]
    );
  };

  // Map restaurant names to objects with id, name, image
  const applicableRestaurants: Restaurant[] = promo.applicableRestaurants.map(
    (name, idx) => ({
      id: name + idx,
      name,
      image:
        restaurantImages[name] ||
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=3174&auto=format&fit=crop",
    })
  );

  // Get promo color based on type
  const getPromoColor = () => {
    if (promo.status !== "active") return theme.palette.neutral.mediumGrey;
    return promo.type === "percentage"
      ? theme.palette.status.info
      : theme.palette.status.success;
  };

  const promoColor = getPromoColor();

  const getBackgroundImage = () => {
    const images = {
      percentage:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=3081&auto=format&fit=crop",
      fixed:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=3270&auto=format&fit=crop",
      default:
        "https://images.unsplash.com/photo-1493770348161-369560ae357d?q=80&w=3270&auto=format&fit=crop",
    };

    return promo.type === "percentage"
      ? images.percentage
      : promo.type === "fixed"
      ? images.fixed
      : images.default;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" />

      {/* Fixed Header */}
      <View style={styles.header}>
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
        <Text style={styles.headerTitle}>Promotion Details</Text>
        <View style={styles.placeholderButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section - Now part of the ScrollView */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: getBackgroundImage() }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Animated.View
              style={styles.discountBadge}
              entering={FadeInDown.delay(200).springify()}
            >
              <Text style={styles.discountText}>
                {promo.type === "percentage"
                  ? `${promo.amount}%`
                  : `$${promo.amount}`}
              </Text>
              <Text style={styles.discountLabel}>OFF</Text>
            </Animated.View>
          </View>
        </View>

        {/* Promo Code Section */}
        <Animated.View
          style={styles.promoCodeSection}
          entering={FadeInDown.delay(300).springify()}
        >
          <Text style={styles.codeLabel}>PROMO CODE</Text>
          <View style={styles.codeContainer}>
            <Text style={[styles.code, { color: promoColor }]}>
              {promo.code}
            </Text>
            <TouchableOpacity
              style={[
                styles.copyButton,
                { backgroundColor: `${promoColor}15` },
              ]}
              onPress={() =>
                Alert.alert("Copied", "Promo code copied to clipboard")
              }
            >
              <Text style={[styles.copyText, { color: promoColor }]}>Copy</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View
          style={styles.descriptionSection}
          entering={FadeInDown.delay(400).springify()}
        >
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.message}>{promo.message}</Text>
        </Animated.View>

        {/* Details Section */}
        <Animated.View
          style={styles.detailsSection}
          entering={FadeInDown.delay(500).springify()}
        >
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <Ionicons
                name="wallet-outline"
                size={18}
                color={theme.palette.neutral.darkGrey}
              />
              <Text style={styles.detailLabel}>
                {promo.type === "percentage" ? "Max Discount" : "Min Order"}:
              </Text>
              <Text style={styles.detailValue}>
                $
                {promo.type === "percentage"
                  ? promo.maxDiscount || "-"
                  : promo.minOrderValue}
              </Text>
            </View>

            <View style={styles.detailDivider} />

            <View style={styles.detailRow}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={theme.palette.neutral.darkGrey}
              />
              <Text style={styles.detailLabel}>Valid Until:</Text>
              <Text style={styles.detailValue}>
                {new Date(promo.endDate).toLocaleDateString()}
              </Text>
            </View>

            {promo.usageLimit && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Ionicons
                    name="repeat-outline"
                    size={18}
                    color={theme.palette.neutral.darkGrey}
                  />
                  <Text style={styles.detailLabel}>Usage Limit:</Text>
                  <Text style={styles.detailValue}>{promo.usageLimit}</Text>
                </View>
              </>
            )}

            {promo.perUserLimit && (
              <>
                <View style={styles.detailDivider} />
                <View style={styles.detailRow}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={theme.palette.neutral.darkGrey}
                  />
                  <Text style={styles.detailLabel}>Per User Limit:</Text>
                  <Text style={styles.detailValue}>{promo.perUserLimit}</Text>
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {/* Applicable Restaurants Section */}
        {applicableRestaurants.length > 0 && (
          <Animated.View
            style={styles.restaurantsSection}
            entering={FadeInDown.delay(600).springify()}
          >
            <Text style={styles.sectionTitle}>Valid at these restaurants</Text>
            <RestaurantCarousel restaurants={applicableRestaurants} />
          </Animated.View>
        )}

        {/* Terms & Conditions */}
        <Animated.View
          style={styles.termsSection}
          entering={FadeInDown.delay(700).springify()}
        >
          <Text style={styles.termsTitle}>Terms & Conditions</Text>
          <Text style={styles.termsText}>
            • This promotion is valid only for the specified restaurants.{"\n"}•
            Cannot be combined with other promotions.{"\n"}• Valid for the
            mentioned time period only.{"\n"}• UberX reserves the right to
            modify or cancel this offer at any time.
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.applyButton, { backgroundColor: promoColor }]}
          onPress={handleApply}
          activeOpacity={0.8}
        >
          <Text style={styles.applyButtonText}>Apply Promotion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: `${theme.palette.neutral.black}99`,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.palette.neutral.black}4D`,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.neutral.white,
  },
  placeholderButton: {
    width: 40,
  },
  scrollContent: {
    paddingTop: 60, // Add top padding to account for the fixed header
    paddingBottom: 100, // Bottom padding for the fixed bottom button
  },
  heroContainer: {
    width: "100%",
    height: 220,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: `${theme.palette.neutral.black}66`,
    justifyContent: "center",
    alignItems: "center",
  },
  discountBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  discountText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 56,
    color: theme.palette.neutral.white,
    lineHeight: 60,
  },
  discountLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.neutral.white,
    letterSpacing: 2,
  },
  promoCodeSection: {
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  codeLabel: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginBottom: theme.spacing.xs,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  code: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.xl,
    letterSpacing: 1,
  },
  copyButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.pill,
  },
  copyText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
  },
  descriptionSection: {
    margin: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.neutral.black,
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    lineHeight: 22,
  },
  detailsSection: {
    margin: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  detailCard: {
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  detailLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  detailValue: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
  },
  detailDivider: {
    height: 1,
    backgroundColor: theme.palette.neutral.lightGrey,
    width: "100%",
  },
  restaurantsSection: {
    margin: theme.spacing.lg,
    marginVertical: theme.spacing.md,
  },
  termsSection: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  termsTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.mediumGrey,
    marginBottom: theme.spacing.sm,
  },
  termsText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.mediumGrey,
    lineHeight: 20,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.palette.neutral.white,
    ...theme.shadows.md,
  },
  applyButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.neutral.white,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFound: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.lg,
    color: theme.palette.status.error,
  },
});

export default PromotionDetail;
