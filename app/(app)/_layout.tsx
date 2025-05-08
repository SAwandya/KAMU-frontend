import { Stack } from "expo-router";
import theme from "@/constants/Theme";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.palette.neutral.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="restaurant/[id]" />

      <Stack.Screen
        options={{ headerShown: false, title: "Promo Details" }}
        name="promotion/[promoId]"
      />

      {/* Payment screens must be properly defined */}
      <Stack.Screen
        name="(app)/payment/select-payment"
        options={{
          headerShown: false,
          animation: "slide_from_bottom",
        }}
      />

      <Stack.Screen
        name="(app)/payment/process"
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />

      <Stack.Screen
        name="(app)/account/payment-methods"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="(app)/personalInfo/userEditScreen"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />

      {/* Add order tracking screen */}
      <Stack.Screen
        name="order-tracking"
        options={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
