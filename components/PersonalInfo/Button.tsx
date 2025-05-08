// components/Button.js
import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import theme from "../../constants/Theme";

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  disabled,
  loading,
  variant = "filled",
}) => {
  const getButtonStyles = () => {
    if (variant === "outlined") {
      return [
        styles.button,
        styles.outlinedButton,
        disabled && styles.disabledOutlinedButton,
        style,
      ];
    }

    return [
      styles.button,
      styles.filledButton,
      disabled && styles.disabledButton,
      style,
    ];
  };

  const getTextStyles = () => {
    if (variant === "outlined") {
      return [
        styles.buttonText,
        styles.outlinedButtonText,
        disabled && styles.disabledOutlinedButtonText,
        textStyle,
      ];
    }

    return [
      styles.buttonText,
      disabled && styles.disabledButtonText,
      textStyle,
    ];
  };

  return (
    <TouchableOpacity
      style={getButtonStyles()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "outlined"
              ? theme.palette.secondary.main
              : theme.palette.neutral.white
          }
          size="small"
        />
      ) : (
        <Text style={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  filledButton: {
    backgroundColor: theme.palette.primary.main,
  },
  outlinedButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.palette.secondary.main,
  },
  buttonText: {
    color: theme.palette.neutral.white,
    fontSize: theme.typography.fontSize.md,
    fontWeight: "600",
  },
  outlinedButtonText: {
    color: theme.palette.secondary.main,
  },
  disabledButton: {
    backgroundColor: theme.palette.neutral.lightGrey,
  },
  disabledOutlinedButton: {
    borderColor: theme.palette.neutral.grey,
  },
  disabledButtonText: {
    color: theme.palette.neutral.mediumGrey,
  },
  disabledOutlinedButtonText: {
    color: theme.palette.neutral.mediumGrey,
  },
});

export default Button;
