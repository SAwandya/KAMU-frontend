import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import apiClient from "../../services/apiClient";
import { getApiDebugInfo } from "../../config/api.config";
import theme from "../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

interface EndpointStatus {
  name: string;
  url: string;
  status: "checking" | "success" | "fail";
  message: string;
}

export default function DebugScreen() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Get API configurations
  const apiInfo = getApiDebugInfo();

  useEffect(() => {
    const checkEndpoints = async () => {
      setIsLoading(true);

      const endpointList: EndpointStatus[] = [
        {
          name: "Auth Service",
          url: `${apiInfo.fullUrl.auth}/health`,
          status: "checking",
          message: "Checking...",
        },
        {
          name: "Restaurant Service",
          url: `${apiInfo.fullUrl.restaurants}/health`,
          status: "checking",
          message: "Checking...",
        },
        {
          name: "Order Service",
          url: `${apiInfo.fullUrl.orders}/health`,
          status: "checking",
          message: "Checking...",
        },
        {
          name: "Payment Service",
          url: `${apiInfo.fullUrl.payment}/health`,
          status: "checking",
          message: "Checking...",
        },
        {
          name: "Delivery Service",
          url: `${apiInfo.fullUrl.delivery}/health`,
          status: "checking",
          message: "Checking...",
        },
        {
          name: "Promotion Service",
          url: `${apiInfo.fullUrl.promotion}/health`,
          status: "checking",
          message: "Checking...",
        },
      ];

      setEndpoints(endpointList);

      // Check each endpoint
      for (let i = 0; i < endpointList.length; i++) {
        try {
          await apiClient.get(endpointList[i].url);
          endpointList[i].status = "success";
          endpointList[i].message = "Service is reachable and healthy";
        } catch (error: any) {
          endpointList[i].status = "fail";
          endpointList[i].message = `Error: ${
            error.message || "Unknown error"
          }`;

          // Add more detailed error info
          if (error.response) {
            endpointList[i].message += ` (Status: ${error.response.status})`;
          } else if (error.request) {
            endpointList[i].message += " (No response received)";
          }
        }

        // Update the UI after each check
        setEndpoints([...endpointList]);
      }

      setIsLoading(false);
    };

    checkEndpoints();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={theme.palette.primary.main}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Connection Diagnostics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>API Configuration</Text>
          <Text style={styles.infoText}>
            Environment: {apiInfo.activeEnvironment}
          </Text>
          <Text style={styles.infoText}>Base URL: {apiInfo.baseUrl}</Text>
        </View>

        <View style={styles.endpointsContainer}>
          <Text style={styles.sectionTitle}>Service Health Checks</Text>

          {isLoading && (
            <ActivityIndicator
              size="large"
              color={theme.palette.primary.main}
            />
          )}

          {endpoints.map((endpoint, index) => (
            <View key={index} style={styles.endpointItem}>
              <View style={styles.endpointHeader}>
                <Text style={styles.endpointName}>{endpoint.name}</Text>
                {endpoint.status === "checking" && (
                  <ActivityIndicator
                    size="small"
                    color={theme.palette.primary.main}
                  />
                )}
                {endpoint.status === "success" && (
                  <Ionicons name="checkmark-circle" size={20} color="green" />
                )}
                {endpoint.status === "fail" && (
                  <Ionicons name="alert-circle" size={20} color="red" />
                )}
              </View>
              <Text style={styles.endpointUrl}>{endpoint.url}</Text>
              <Text
                style={[
                  styles.endpointMessage,
                  endpoint.status === "success"
                    ? styles.successText
                    : endpoint.status === "fail"
                    ? styles.errorText
                    : {},
                ]}
              >
                {endpoint.message}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/(auth)/debug")}
        >
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryButtonText}>Retry All Checks</Text>
        </TouchableOpacity>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Troubleshooting Tips:</Text>
          <Text style={styles.tipText}>
            1. Make sure all services are running.
          </Text>
          <Text style={styles.tipText}>
            2. Check if your WiFi/network is connected.
          </Text>
          <Text style={styles.tipText}>
            3. Check if the API URL in config is correct.
          </Text>
          <Text style={styles.tipText}>
            4. Try using a different API environment.
          </Text>
          <Text style={styles.tipText}>
            5. Check Nginx/gateway configuration.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral.lightGrey,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
  },
  content: {
    padding: theme.spacing.md,
  },
  infoContainer: {
    backgroundColor: theme.palette.neutral.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
    color: theme.palette.neutral.black,
  },
  infoText: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xs,
    color: theme.palette.neutral.darkGrey,
  },
  endpointsContainer: {
    backgroundColor: theme.palette.neutral.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: "bold",
    marginBottom: theme.spacing.md,
    color: theme.palette.neutral.black,
  },
  endpointItem: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral.lightGrey,
  },
  endpointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  endpointName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
  },
  endpointUrl: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.mediumGrey,
    marginBottom: theme.spacing.xs,
  },
  endpointMessage: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
  },
  successText: {
    color: "green",
  },
  errorText: {
    color: theme.palette.status.error,
  },
  retryButton: {
    backgroundColor: theme.palette.primary.main,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  retryButtonText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "bold",
    marginLeft: theme.spacing.xs,
  },
  tipsContainer: {
    backgroundColor: theme.palette.neutral.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  tipsTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: "bold",
    marginBottom: theme.spacing.sm,
    color: theme.palette.neutral.black,
  },
  tipText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginBottom: theme.spacing.xs,
  },
});
