// app/(auth)/register.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import theme from "../../constants/Theme";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);
      await signUp(name, email, password);
    } catch (error) {
      setError("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.palette.neutral.black}
            />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Join the world's largest food delivery platform
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={theme.palette.status.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={theme.palette.neutral.mediumGrey}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.palette.neutral.mediumGrey}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={theme.palette.neutral.mediumGrey}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor={theme.palette.neutral.mediumGrey}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                (!name || !email || !password || !confirmPassword) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={
                isSubmitting || !name || !email || !password || !confirmPassword
              }
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{" "}
              <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.palette.neutral.white,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backButton: {
    padding: 16,
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 10,
  },
  formContainer: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.palette.neutral.black,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.palette.neutral.darkGrey,
    marginBottom: 32,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF2F2",
    padding: 12,
    borderRadius: theme.borderRadius.md,
    marginBottom: 24,
  },
  errorText: {
    color: theme.palette.status.error,
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    color: theme.palette.neutral.black,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.palette.neutral.lightGrey,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.palette.neutral.black,
    backgroundColor: theme.palette.neutral.white,
  },
  button: {
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: theme.palette.neutral.darkGrey,
    opacity: 0.7,
  },
  buttonText: {
    color: theme.palette.neutral.white,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 15,
    color: theme.palette.neutral.darkGrey,
  },
  link: {
    fontSize: 15,
    color: theme.palette.secondary.main,
    fontWeight: "600",
  },
  termsText: {
    fontSize: 13,
    color: theme.palette.neutral.mediumGrey,
    textAlign: "center",
    marginTop: 32,
    lineHeight: 18,
    paddingHorizontal: 24,
  },
  termsLink: {
    color: theme.palette.secondary.main,
  },
});
