import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import theme from "../../constants/Theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  // Button styling based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryButton;
      case "outline":
        return styles.outlineButton;
      case "text":
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };

  // Text styling based on variant
  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryButtonText;
      case "outline":
        return styles.outlineButtonText;
      case "text":
        return styles.textButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  // Size styling
  const getSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.smallButton;
      case "large":
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSizeStyle = () => {
    switch (size) {
      case "small":
        return styles.smallButtonText;
      case "large":
        return styles.largeButtonText;
      default:
        return styles.mediumButtonText;
    }
  };

  const buttonStyles = [
    styles.button,
    getButtonStyle(),
    getSizeStyle(),
    (disabled || isLoading) && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    getTextStyle(),
    getTextSizeStyle(),
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={buttonStyles}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === "outline" || variant === "text"
              ? theme.palette.primary.main
              : theme.palette.primary.contrast
          }
          size="small"
        />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.borderRadius.md,
  },
  // Variants
  primaryButton: {
    backgroundColor: theme.palette.primary.main,
    borderWidth: 0,
  },
  secondaryButton: {
    backgroundColor: theme.palette.secondary.main,
    borderWidth: 0,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.palette.primary.main,
  },
  textButton: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  // Sizes
  smallButton: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
  },
  mediumButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  largeButton: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  // Text styles
  buttonText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  primaryButtonText: {
    color: theme.palette.primary.contrast,
  },
  secondaryButtonText: {
    color: theme.palette.secondary.contrast,
  },
  outlineButtonText: {
    color: theme.palette.primary.main,
  },
  textButtonText: {
    color: theme.palette.primary.main,
  },
  // Text sizes
  smallButtonText: {
    fontSize: theme.typography.fontSize.sm,
  },
  mediumButtonText: {
    fontSize: theme.typography.fontSize.md,
  },
  largeButtonText: {
    fontSize: theme.typography.fontSize.lg,
  },
  // Disabled state
  disabledButton: {
    opacity: 0.6,
  },
});

export default Button;
