// components/Debug/NetworkMonitor.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import apiClient from "../../services/apiClient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../constants/Theme";
import Constants from "expo-constants";

// Only include this component in development builds
const isDev = !Constants.expoConfig?.extra?.production;

interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  timestamp: Date;
  status?: number;
  duration?: number;
  requestData?: any;
  responseData?: any;
  error?: boolean;
  errorMessage?: string;
}

export default function NetworkMonitor() {
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<NetworkRequest | null>(
    null
  );

  // Skip this component in production
  if (!isDev) return null;

  useEffect(() => {
    // Create an in-memory log of API calls
    const requestMap = new Map<string, NetworkRequest>();

    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const id = Math.random().toString(36).substring(2, 9);
        const request = {
          id,
          url: `${config.baseURL || ""}${config.url || ""}`,
          method: config.method?.toUpperCase() || "UNKNOWN",
          timestamp: new Date(),
          requestData: config.data,
        };

        // Store request in our map
        requestMap.set(id, request);

        // Add id to request for correlation with response
        config.headers = config.headers || {};
        config.headers["X-Request-ID"] = id;

        // Update the requests list
        setRequests((prev) => [request, ...prev].slice(0, 50)); // Keep only last 50 requests

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => {
        const id = response.config.headers?.["X-Request-ID"];
        if (id && requestMap.has(id)) {
          const request = requestMap.get(id)!;
          const updatedRequest = {
            ...request,
            status: response.status,
            duration: new Date().getTime() - request.timestamp.getTime(),
            responseData: response.data,
          };

          requestMap.set(id, updatedRequest);

          // Update the requests list
          setRequests((prev) =>
            prev.map((req) => (req.id === id ? updatedRequest : req))
          );
        }
        return response;
      },
      (error) => {
        const id = error.config?.headers?.["X-Request-ID"];
        if (id && requestMap.has(id)) {
          const request = requestMap.get(id)!;
          const updatedRequest = {
            ...request,
            status: error.response?.status,
            duration: new Date().getTime() - request.timestamp.getTime(),
            responseData: error.response?.data,
            error: true,
            errorMessage: error.message,
          };

          requestMap.set(id, updatedRequest);

          // Update the requests list
          setRequests((prev) =>
            prev.map((req) => (req.id === id ? updatedRequest : req))
          );
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptors on unmount
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const handleRequestPress = (request: NetworkRequest) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const renderRequestItem = ({ item }: { item: NetworkRequest }) => (
    <TouchableOpacity
      style={[
        styles.requestItem,
        item.error
          ? styles.errorItem
          : item.status && item.status >= 400
          ? styles.errorItem
          : item.status
          ? styles.successItem
          : styles.pendingItem,
      ]}
      onPress={() => handleRequestPress(item)}
    >
      <View style={styles.requestHeader}>
        <View style={styles.methodContainer}>
          <Text style={styles.methodText}>{item.method}</Text>
        </View>
        <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="tail">
          {item.url.replace(/https?:\/\/[^/]+\//, "/")}
        </Text>
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.statusText}>{item.status || "Pending"}</Text>
        <Text style={styles.durationText}>
          {item.duration ? `${item.duration}ms` : "..."}
        </Text>
        <Text style={styles.timeText}>
          {item.timestamp.toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderDetailModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Details</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons
                name="close"
                size={24}
                color={theme.palette.neutral.darkGrey}
              />
            </TouchableOpacity>
          </View>

          {selectedRequest && (
            <ScrollView style={styles.detailsContainer}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>URL:</Text>
                  <Text style={styles.detailValue}>{selectedRequest.url}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Method:</Text>
                  <Text style={styles.detailValue}>
                    {selectedRequest.method}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={styles.detailValue}>
                    {selectedRequest.status || "Pending"}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time:</Text>
                  <Text style={styles.detailValue}>
                    {selectedRequest.timestamp.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Duration:</Text>
                  <Text style={styles.detailValue}>
                    {selectedRequest.duration
                      ? `${selectedRequest.duration}ms`
                      : "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Request Data</Text>
                <Text style={styles.jsonText}>
                  {selectedRequest.requestData
                    ? JSON.stringify(selectedRequest.requestData, null, 2)
                    : "No request data"}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Response Data</Text>
                <Text style={styles.jsonText}>
                  {selectedRequest.responseData
                    ? JSON.stringify(selectedRequest.responseData, null, 2)
                    : "No response data"}
                </Text>
              </View>

              {selectedRequest.error && (
                <View style={styles.detailSection}>
                  <Text style={[styles.sectionTitle, styles.errorText]}>
                    Error
                  </Text>
                  <Text style={[styles.jsonText, styles.errorText]}>
                    {selectedRequest.errorMessage}
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // Toggle button to show/hide the network monitor
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {isExpanded ? (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Network Monitor (DEV)</Text>
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <Ionicons
                name="chevron-down"
                size={24}
                color={theme.palette.neutral.white}
              />
            </TouchableOpacity>
          </View>

          <FlatList
            data={requests}
            renderItem={renderRequestItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />

          {renderDetailModal()}
        </View>
      ) : (
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setIsExpanded(true)}
        >
          <Ionicons
            name="analytics"
            size={24}
            color={theme.palette.neutral.white}
          />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: theme.palette.neutral.white,
    borderTopWidth: 1,
    borderColor: theme.palette.neutral.grey,
    zIndex: 9999,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 8,
    backgroundColor: theme.palette.primary.main,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerTitle: {
    color: theme.palette.neutral.white,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  requestItem: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  pendingItem: {
    backgroundColor: theme.palette.neutral.lightGrey,
  },
  successItem: {
    backgroundColor: `${theme.palette.status.success}20`, // 20% opacity
  },
  errorItem: {
    backgroundColor: `${theme.palette.status.error}20`, // 20% opacity
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  methodContainer: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: theme.palette.primary.main,
    borderRadius: 4,
    marginRight: 8,
  },
  methodText: {
    color: theme.palette.neutral.white,
    fontWeight: "bold",
    fontSize: 12,
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: theme.palette.neutral.black,
  },
  requestInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusText: {
    fontSize: 12,
    color: theme.palette.neutral.darkGrey,
  },
  durationText: {
    fontSize: 12,
    color: theme.palette.neutral.darkGrey,
  },
  timeText: {
    fontSize: 12,
    color: theme.palette.neutral.darkGrey,
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.palette.primary.main,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 9999,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.palette.neutral.white,
    borderRadius: 8,
    maxHeight: "80%",
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.neutral.grey,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
  },
  detailsContainer: {
    flex: 1,
  },
  detailSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: theme.palette.neutral.black,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    width: 80,
    fontWeight: "500",
    color: theme.palette.neutral.darkGrey,
  },
  detailValue: {
    flex: 1,
    color: theme.palette.neutral.black,
  },
  jsonText: {
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: theme.palette.neutral.lightGrey,
    padding: 8,
    borderRadius: 4,
  },
  errorText: {
    color: theme.palette.status.error,
  },
});
