// components/FormInput.js
import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import theme from "../../constants/Theme";

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  multiline,
  numberOfLines,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.palette.neutral.mediumGrey}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "sentences"}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: "500",
    marginBottom: theme.spacing.xs,
    color: theme.palette.neutral.darkGrey,
  },
  input: {
    backgroundColor: theme.palette.neutral.white,
    borderWidth: 1,
    borderColor: theme.palette.neutral.grey,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
  },
  inputError: {
    borderColor: theme.palette.status.error,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: theme.palette.status.error,
    fontSize: theme.typography.fontSize.xs,
    marginTop: theme.spacing.xs,
  },
});

export default FormInput;
