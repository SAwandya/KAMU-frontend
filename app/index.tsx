// app/index.tsx
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator, Text } from "react-native";

export default function Index() {
  const { user, isLoading } = useAuth();

  // Show loading indicator while checking authentication state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00ccbb" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication state
  if (user) {
    return <Redirect href="/(app)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
