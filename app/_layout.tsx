// app/_layout.tsx
import { Stack } from "expo-router";
import { AuthProvider } from "../context/AuthContext";
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
import { StripeProvider } from "@stripe/stripe-react-native";


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
    <StripeProvider publishableKey="pk_test_TYooMQauvdEDq54NiTphI7jx">
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
            <Stack.Screen name="index" options={{ headerShown: false }} />
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
                headerShown: true, // Keep header for this screen for navigation
                headerTransparent: true,
                headerTitle: "", // Empty title for cleaner look
                headerBackVisible: false,
                headerTintColor: theme.palette.primary.main,
              }}
            />
          </Stack>
        </CartProvider>
      </AuthProvider>
    </StripeProvider>
  );
}
