import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import apiConfig, { getApiDebugInfo } from "../../config/api.config";
import { testApiConnection } from "../../services/apiClient";

const ApiConnectionChecker = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [customEndpoint, setCustomEndpoint] = useState("");

  const apiDebugInfo = getApiDebugInfo();

  // Test a specific endpoint
  const testEndpoint = async (endpoint: string) => {
    setLoading(true);
    try {
      const response = await axios.get(endpoint, { timeout: 5000 });
      setTestResults({
        endpoint,
        success: true,
        status: response.status,
        statusText: response.statusText,
        data:
          JSON.stringify(response.data).slice(0, 200) +
          (JSON.stringify(response.data).length > 200 ? "..." : ""),
      });
    } catch (error: any) {
      setTestResults({
        endpoint,
        success: false,
        error: error.message,
        code: error.code,
        isTimeout: error.message.includes("timeout"),
      });
    } finally {
      setLoading(false);
    }
  };

  // Test the API connection using the client's test function
  const testApiClientConnection = async () => {
    setLoading(true);
    try {
      const result = await testApiConnection();
      setTestResults({
        endpoint: result.apiUrl,
        success: result.success,
        data: result.success ? JSON.stringify(result.data) : undefined,
        error: !result.success ? result.error : undefined,
      });
    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Test all main API endpoints
  const testAllEndpoints = async () => {
    const authEndpoint = `${apiConfig.baseUrl}${apiConfig.endpoints.auth}/health`;
    await testEndpoint(authEndpoint);
  };

  // Test a custom endpoint entered by the user
  const testCustomEndpoint = async () => {
    if (!customEndpoint) return;
    await testEndpoint(customEndpoint);
  };

  // Platform-specific networking tips
  const renderNetworkingTips = () => {
    return (
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Networking Tips:</Text>

        {Platform.OS === "android" && (
          <Text style={styles.tipText}>
            • On Android emulators, use 10.0.2.2 instead of localhost to access
            your computer • Ensure network_security_config.xml allows cleartext
            traffic if using http://
          </Text>
        )}

        {Platform.OS === "ios" && (
          <Text style={styles.tipText}>
            • On iOS simulators, localhost works to access your computer • Your
            Info.plist must include NSAllowsArbitraryLoads if using http://
          </Text>
        )}

        <Text style={styles.tipText}>
          • Ensure your backend server is running and accessible • Check for
          CORS configuration if applicable • On physical devices, use your
          computer's actual local network IP address
        </Text>
      </View>
    );
  };

  return (
    <>
      {/* Floating button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="bug-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Debug Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>API Connection Debugger</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView}>
              {/* Current API Configuration */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Current API Configuration
                </Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Base URL:</Text>
                  <Text style={styles.infoValue}>{apiDebugInfo.baseUrl}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Auth URL:</Text>
                  <Text style={styles.infoValue}>
                    {apiDebugInfo.fullUrl.auth}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Platform:</Text>
                  <Text style={styles.infoValue}>{Platform.OS}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Environment:</Text>
                  <Text style={styles.infoValue}>
                    {apiDebugInfo.activeEnvironment}
                  </Text>
                </View>
              </View>

              {/* Connection Tests */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Connection Tests</Text>

                <TouchableOpacity
                  style={styles.testButton}
                  onPress={testApiClientConnection}
                  disabled={loading}
                >
                  <Text style={styles.testButtonText}>
                    Test API Client Connection
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.testButton}
                  onPress={testAllEndpoints}
                  disabled={loading}
                >
                  <Text style={styles.testButtonText}>Test Auth Endpoint</Text>
                </TouchableOpacity>

                <View style={styles.customEndpointContainer}>
                  <TextInput
                    style={styles.customEndpointInput}
                    placeholder="Enter custom endpoint URL"
                    value={customEndpoint}
                    onChangeText={setCustomEndpoint}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={[styles.testButton, styles.smallButton]}
                    onPress={testCustomEndpoint}
                    disabled={loading || !customEndpoint}
                  >
                    <Text style={styles.testButtonText}>Test</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Test Results */}
              {testResults && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Test Results</Text>
                  <View style={styles.resultsContainer}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Endpoint:</Text>
                      <Text style={styles.infoValue}>
                        {testResults.endpoint}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status:</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          { color: testResults.success ? "green" : "red" },
                        ]}
                      >
                        {testResults.success ? "SUCCESS" : "FAILED"}
                      </Text>
                    </View>

                    {testResults.success ? (
                      <>
                        {testResults.status && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Status Code:</Text>
                            <Text style={styles.infoValue}>
                              {testResults.status}
                            </Text>
                          </View>
                        )}
                        {testResults.data && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Response:</Text>
                            <Text style={styles.infoValue}>
                              {testResults.data}
                            </Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Error:</Text>
                        <Text style={[styles.infoValue, { color: "red" }]}>
                          {testResults.error}
                        </Text>
                      </View>
                    )}

                    {testResults.isTimeout && (
                      <View style={styles.timeoutWarning}>
                        <Ionicons name="warning" size={20} color="#e67e22" />
                        <Text style={styles.timeoutWarningText}>
                          The request timed out. Check if your server is running
                          and your API URL is correct.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Networking Tips */}
              {renderNetworkingTips()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  scrollView: {
    maxHeight: "90%",
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 5,
    flexWrap: "wrap",
  },
  infoLabel: {
    fontWeight: "bold",
    width: 100,
    color: "#333",
  },
  infoValue: {
    flex: 1,
    color: "#555",
  },
  testButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  smallButton: {
    padding: 8,
    width: 60,
  },
  testButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  customEndpointContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  customEndpointInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  resultsContainer: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 5,
  },
  timeoutWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8e1",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  timeoutWarningText: {
    color: "#e67e22",
    marginLeft: 10,
    flex: 1,
  },
  tipsContainer: {
    padding: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  tipText: {
    color: "#555",
    marginBottom: 10,
  },
});

export default ApiConnectionChecker;
