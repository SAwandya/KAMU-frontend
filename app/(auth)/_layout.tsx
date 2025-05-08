// app/(auth)/_layout.tsx
import theme from "@/constants/Theme";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide all headers in auth flow
        contentStyle: { backgroundColor: theme.palette.neutral.background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
