// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";
import ApiToastInitializer from "../components/ApiToastInitializer";
import NetworkMonitor from "../components/Debug/NetworkMonitor";
import ApiConnectionChecker from "../components/Debug/ApiConnectionChecker";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { CartProvider } from "@/hooks/useCart";
import theme from "@/constants/Theme";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  useEffect(() => {
    // Keep splash screen visible while fonts are loading
    if (!fontsLoaded) {
      SplashScreen.preventAutoHideAsync();
    } else {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // or a loading component
  }

  return (
    <ToastProvider>
      <ApiToastInitializer />
      <AuthProvider>
        <CartProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: theme.palette.neutral.background,
              },
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" options={{ title: "KAMU" }} />
            <Stack.Screen
              name="(auth)"
              options={{ headerShown: false, animation: "fade" }}
            />
            <Stack.Screen
              name="(app)"
              options={{ headerShown: false, animation: "fade" }}
            />
            <Stack.Screen
              name="order-tracking"
              options={{
                title: "Order Tracking",
                headerShown: true, // Keep header for this screen for navigation
                headerTransparent: true,
                headerTitle: "", // Empty title for cleaner look
                headerBackVisible: false,
                headerTintColor: theme.palette.primary.main,
              }}
            />
          </Stack>

          {/* Debug tools for development only */}
          <NetworkMonitor />
          <ApiConnectionChecker />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
