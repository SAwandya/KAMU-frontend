import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Platform } from "react-native";
import * as Network from "expo-network";
import { getApiDebugInfo } from "../../config/api.config";
import { testApiConnection } from "../../services/apiClient";
import Constants from "expo-constants";

interface ConnectionStatus {
  success: boolean;
  apiUrl?: string;
  error?: string;
  data?: any;
}

const ApiDiagnostic = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<Network.NetworkState | null>(
    null
  );
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus | null>(null);
  const [displayInfo, setDisplayInfo] = useState(false);

  const checkNetwork = async () => {
    try {
      const network = await Network.getNetworkStateAsync();
      setNetworkInfo(network);
    } catch (error) {
      console.error("Error checking network:", error);
    }
  };

  const runTests = async () => {
    setIsLoading(true);
    setConnectionStatus(null);

    try {
      await checkNetwork();
      const result = await testApiConnection();
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkNetwork();
  }, []);

  const apiInfo = getApiDebugInfo();
  const hostInfo = Constants.expoConfig?.hostUri
    ? Constants.expoConfig.hostUri.split(":")[0]
    : "Not available";

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Connection Diagnostic</Text>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setDisplayInfo(!displayInfo)}
      >
        <Text style={styles.toggleButtonText}>
          {displayInfo ? "Hide Configuration" : "Show Configuration"}
        </Text>
      </TouchableOpacity>

      {displayInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <Text style={styles.infoText}>
            Environment: {apiInfo.activeEnvironment}
          </Text>
          <Text style={styles.infoText}>Base URL: {apiInfo.baseUrl}</Text>
          <Text style={styles.infoText}>Expo Host IP: {hostInfo}</Text>
          <Text style={styles.infoText}>Platform: {Platform.OS}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network Status</Text>
        {networkInfo ? (
          <>
            <Text style={styles.infoText}>
              Connected: {networkInfo.isConnected ? "✅ Yes" : "❌ No"}
            </Text>
            <Text style={styles.infoText}>
              Internet Reachable:{" "}
              {networkInfo.isInternetReachable ? "✅ Yes" : "❌ No"}
            </Text>
            <Text style={styles.infoText}>
              Connection Type: {networkInfo.type}
            </Text>
          </>
        ) : (
          <Text style={styles.infoText}>Checking network status...</Text>
        )}
      </View>

      {connectionStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Connection Test Results</Text>
          <Text
            style={[
              styles.statusText,
              connectionStatus.success ? styles.success : styles.error,
            ]}
          >
            Status: {connectionStatus.success ? "✅ Connected" : "❌ Failed"}
          </Text>
          <Text style={styles.infoText}>URL: {connectionStatus.apiUrl}</Text>
          {connectionStatus.error && (
            <Text style={styles.errorText}>
              Error: {connectionStatus.error}
            </Text>
          )}
          {connectionStatus.data && (
            <Text style={styles.infoText}>
              Response: {JSON.stringify(connectionStatus.data)}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={runTests}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Test Connection</Text>
        )}
      </TouchableOpacity>

      <View style={styles.troubleshootingSection}>
        <Text style={styles.sectionTitle}>Troubleshooting Tips:</Text>
        <Text style={styles.tipText}>
          1. Ensure your backend services are running and accessible.
        </Text>
        <Text style={styles.tipText}>
          2. If testing on a physical device, make sure it's on the same network
          as your backend.
        </Text>
        <Text style={styles.tipText}>
          3. For mobile devices, 'localhost' refers to the device itself. Use
          your computer's IP address instead.
        </Text>
        <Text style={styles.tipText}>
          4. Check if there are any CORS issues by examining browser console
          logs.
        </Text>
        <Text style={styles.tipText}>
          5. Ensure your API endpoints are correctly configured in
          api.config.ts.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  success: {
    color: "#28a745",
  },
  error: {
    color: "#dc3545",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginVertical: 4,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  troubleshootingSection: {
    marginTop: 16,
    marginBottom: 24,
  },
  tipText: {
    fontSize: 14,
    marginBottom: 8,
    color: "#495057",
  },
  toggleButton: {
    padding: 8,
    backgroundColor: "#6c757d",
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 16,
  },
  toggleButtonText: {
    color: "#fff",
  },
});

export default ApiDiagnostic;
