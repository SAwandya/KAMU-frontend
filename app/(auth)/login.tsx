// app/(auth)/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import theme from "../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import Button from "@/components/Button/Button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
  
    try {
      setError("");
      setIsSubmitting(true);
      console.log("Logging in with email:", email, "and password:", password);
      await signIn(email, password);
    } catch (error) {
      setError("Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/kamu-logo.png")}
              style={styles.logo}
              defaultSource={{ uri: "https://via.placeholder.com/150" }}
            />
            <Text style={styles.logoText}>Kamu.Lk</Text>
            <Text style={styles.tagline}>Food delivery made simple</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to your account</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={20}
                  color={theme.palette.status.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.palette.neutral.darkGrey}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.palette.neutral.mediumGrey}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.palette.neutral.darkGrey}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor={theme.palette.neutral.mediumGrey}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <Button
              title="Sign In"
              onPress={handleLogin}
              isLoading={isSubmitting}
              size="large"
              style={styles.button}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtonsContainer}>
              <Button
                title="Google"
                onPress={() => {}}
                variant="outline"
                style={styles.socialButton}
                icon={
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color={theme.palette.primary.main}
                    style={styles.socialIcon}
                  />
                }
              />
              <Button
                title="Facebook"
                onPress={() => {}}
                variant="outline"
                style={styles.socialButton}
                icon={
                  <Ionicons
                    name="logo-facebook"
                    size={20}
                    color={theme.palette.primary.main}
                    style={styles.socialIcon}
                  />
                }
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.neutral.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.pill,
  },
  logoText: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: "bold",
    marginTop: theme.spacing.sm,
    color: theme.palette.primary.main,
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.palette.neutral.darkGrey,
    marginTop: theme.spacing.xs,
  },
  formContainer: {
    backgroundColor: theme.palette.neutral.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    flex: 1,
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: "bold",
    color: theme.palette.neutral.black,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
    marginBottom: theme.spacing.lg,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.status.error + "15", // 15% opacity
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    marginLeft: theme.spacing.sm,
    color: theme.palette.status.error,
    fontSize: theme.typography.fontSize.sm,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xs,
    fontWeight: "500",
    color: theme.palette.neutral.black,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.palette.neutral.grey,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.palette.neutral.white,
  },
  inputIcon: {
    paddingLeft: theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.black,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: theme.palette.primary.main,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: "500",
  },
  button: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.palette.neutral.grey,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.palette.neutral.darkGrey,
    fontSize: theme.typography.fontSize.sm,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  socialButton: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  socialIcon: {
    marginRight: theme.spacing.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.neutral.darkGrey,
  },
  link: {
    fontSize: theme.typography.fontSize.md,
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
});
