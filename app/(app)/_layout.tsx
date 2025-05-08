import React, { useEffect } from "react";
import { Redirect, Stack, router } from "expo-router";
import { useAuthContext } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import theme from "@/constants/Theme";

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // If not authenticated and not loading, redirect to login
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.palette.neutral.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.palette.primary.main} />
      </View>
    );
  }

  if (!isAuthenticated) {
    // This ensures we don't render anything while redirecting
    return <Redirect href="/(auth)/login" />;
  }

  // User is authenticated, render the app layout
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.palette.primary.main },
        headerTintColor: theme.palette.neutral.white,
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="restaurant/[id]"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="payment/process"
        options={{
          title: "Processing Payment",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="payment/select-payment"
        options={{
          title: "Select Payment Method",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
