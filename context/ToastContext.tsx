// context/ToastContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../constants/Theme";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

// Helper function to strip HTML tags from a string
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show a new toast notification
  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);

      // Clean message by removing HTML tags
      const cleanMessage = stripHtmlTags(message);

      setToasts((prev) => [
        ...prev,
        { id, message: cleanMessage, type, duration },
      ]);

      // Auto-hide the toast after specified duration
      if (duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  // Hide a specific toast by ID
  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Toast notification UI component
  const ToastItem = ({ toast }: { toast: Toast }) => {
    const { id, message, type } = toast;

    // Get color based on toast type
    const getColor = () => {
      switch (type) {
        case "success":
          return theme.palette.status.success;
        case "error":
          return theme.palette.status.error;
        case "warning":
          return theme.palette.status.warning;
        default:
          return theme.palette.primary.main;
      }
    };

    // Get icon based on toast type
    const getIcon = () => {
      switch (type) {
        case "success":
          return "checkmark-circle";
        case "error":
          return "alert-circle";
        case "warning":
          return "warning";
        default:
          return "information-circle";
      }
    };

    return (
      <Animated.View style={[styles.toast, { borderLeftColor: getColor() }]}>
        <View style={styles.toastContent}>
          <Ionicons
            name={getIcon() as any}
            size={24}
            color={getColor()}
            style={styles.icon}
          />
          <Text style={styles.message}>{message}</Text>
        </View>
        <TouchableOpacity
          onPress={() => hideToast(id)}
          style={styles.closeButton}
        >
          <Ionicons
            name="close"
            size={20}
            color={theme.palette.neutral.darkGrey}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast container */}
      <View style={styles.container}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  toast: {
    width: Dimensions.get("window").width - 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.palette.neutral.white,
    borderLeftWidth: 6,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  toastContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: theme.palette.neutral.black,
  },
  closeButton: {
    padding: 12,
  },
});
