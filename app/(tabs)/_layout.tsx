// app/(app)/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/constants/Theme";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Remove all tab screen headers
        tabBarActiveTintColor: theme.palette.primary.main,
        tabBarInactiveTintColor: theme.palette.neutral.mediumGrey,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          borderTopWidth: 0,
          ...theme.shadows.sm,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
        tabBarBackground: () => (
          <View
            style={{
              backgroundColor: theme.palette.neutral.white,
              flex: 1,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
