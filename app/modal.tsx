import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Text, View } from "@/components/Themed";
import theme from "@/constants/Theme";
import Button from "@/components/Button/Button";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="close"
            size={24}
            color={theme.palette.neutral.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Information</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="information-circle-outline"
              size={40}
              color={theme.palette.secondary.main}
            />
          </View>

          <Text style={styles.title}>Important Details</Text>

          <Text style={styles.description}>
            This is a modal view that can be used to show important information
            or gather user input without navigating away from the current
            context.
          </Text>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Ionicons
              name="time-outline"
              size={20}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.infoText}>Processing time: 5-10 minutes</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="card-outline"
              size={20}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.infoText}>Payment methods: Card, Cash</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={theme.palette.secondary.main}
            />
            <Text style={styles.infoText}>
              Keep your phone nearby for updates
            </Text>
          </View>
        </View>

        <Button
          title="Got it"
          onPress={() => router.back()}
          style={styles.button}
          size="large"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral.lightGrey,
    backgroundColor: theme.palette.neutral.white,
  },
  closeButton: {
    position: "absolute",
    left: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "600",
    color: theme.palette.neutral.black,
  },
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.palette.neutral.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "700",
    color: theme.palette.neutral.black,
    textAlign: "center",
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    lineHeight:
      theme.typography.lineHeight.relaxed * theme.typography.fontSize.md,
  },
  separator: {
    height: 1,
    backgroundColor: theme.palette.neutral.lightGrey,
    width: "100%",
    marginVertical: theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    marginLeft: theme.spacing.sm,
  },
  button: {
    marginTop: theme.spacing.md,
  },
});
