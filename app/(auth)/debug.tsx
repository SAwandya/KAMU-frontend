import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import ApiDiagnostic from "../../components/Debug/ApiDiagnostic";

export default function DebugScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Connection Diagnostics",
          headerTitleAlign: "center",
        }}
      />
      <View style={styles.content}>
        <ApiDiagnostic />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
});
