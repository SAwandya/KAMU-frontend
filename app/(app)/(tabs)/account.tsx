// app/(app)/(tabs)/account.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/constants/Theme";
import { useNavigation, useRouter } from "expo-router";

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/150" }}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || "User Name"}</Text>
            <Text style={styles.email}>
              {user?.email || "user@example.com"}
            </Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {/* Account Section */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="person-outline"
              size={22}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.menuItemText}>Personal Information</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.palette.neutral.mediumGrey}
              onPress={() => router.push("/(app)/personalInfo/userEditScreen")}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="location-outline"
              size={22}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.menuItemText}>Saved Addresses</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.palette.neutral.mediumGrey}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="card-outline"
              size={22}
              color={theme.palette.secondary.main}
            />
            <Text
              style={styles.menuItemText}
              onPress={() => router.push("/(app)/account/payment-methods")}
            >
              Payment Methods
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.palette.neutral.mediumGrey}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemLast}>
            <Ionicons
              name="gift-outline"
              size={22}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.menuItemText}>Promotions</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.palette.neutral.mediumGrey}
            />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.palette.neutral.mediumGrey}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemLast}>
            <Ionicons
              name="language-outline"
              size={22}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.menuItemText}>Language</Text>
            <Text style={styles.menuItemValue}>English</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.palette.neutral.mediumGrey}
            />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.menuItemText}>Help Center</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.palette.neutral.mediumGrey}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItemLast}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.menuItemText}>About Us</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.palette.neutral.mediumGrey}
            />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  header: {
    backgroundColor: theme.palette.primary.main,
    padding: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: theme.palette.neutral.white,
    borderWidth: 2,
    borderColor: theme.palette.neutral.white,
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.palette.neutral.white,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: theme.palette.neutral.white,
    opacity: 0.9,
    marginBottom: 6,
  },
  editButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.palette.neutral.white,
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: theme.palette.neutral.white,
    fontSize: 12,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.palette.neutral.darkGrey,
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: theme.palette.neutral.white,
    marginHorizontal: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.palette.neutral.lightGrey,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral.lightGrey,
  },
  menuItemLast: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: theme.palette.neutral.black,
  },
  menuItemValue: {
    fontSize: 16,
    color: theme.palette.neutral.mediumGrey,
    marginRight: 8,
  },
  logoutButton: {
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.palette.primary.main,
    alignItems: "center",
  },
  logoutButtonText: {
    color: theme.palette.neutral.white,
    fontWeight: "600",
    fontSize: 16,
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: theme.palette.neutral.mediumGrey,
    marginTop: 16,
    marginBottom: 32,
  },
});
