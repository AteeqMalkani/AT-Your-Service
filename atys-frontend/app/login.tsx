import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import axios from "axios";

import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

const COLORS = {
  background: "#F5F5ED",
  surface: "#FFFFFF",
  primary: "#174C38",
  primaryDark: "#103B2B",
  primaryLight: "#E4EEE5",
  heading: "#1D3328",
  text: "#526357",
  muted: "#87938A",
  border: "#E5EAE3",
  error: "#B83D3D",
};

export default function LoginScreen() {
  const { signIn, isLoading, user } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, user]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError("Enter your email or phone number and password.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await signIn({
        identifier: identifier.trim(),
        password,
      });

      router.replace("/");
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : undefined;

      setError(
        Array.isArray(message)
          ? message.join("\n")
          : message || "Unable to sign in. Check your details and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Restoring your ATYS session...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Text style={styles.brandIconText}>A</Text>
            </View>

            <View>
              <Text style={styles.brandName}>ATYS</Text>
              <Text style={styles.brandTagline}>AT YOUR SERVICE</Text>
            </View>
          </View>

          {/* Decorative 3D hero */}
          <View style={styles.hero}>
            <View style={styles.heroGlow} />

            {/* Background decorative circles */}
            <View style={styles.backCircle} />
            <View style={styles.middleCircle} />

            {/* Floating home illustration */}
            <View style={styles.homeShadow} />
            <View style={styles.homeIllustration}>
              <View style={styles.roof} />
              <View style={styles.house}>
                <View style={styles.houseWindow}>
                  <View style={styles.windowVertical} />
                  <View style={styles.windowHorizontal} />
                </View>
                <View style={styles.houseDoor} />
              </View>
            </View>

            {/* Floating service symbols */}
            <View style={[styles.floatingIcon, styles.floatingIconLeft]}>
              <Text style={styles.floatingEmoji}>🔧</Text>
            </View>

            <View style={[styles.floatingIcon, styles.floatingIconRight]}>
              <Text style={styles.floatingEmoji}>📦</Text>
            </View>

            <View style={[styles.floatingIcon, styles.floatingIconBottom]}>
              <Text style={styles.floatingEmoji}>🤝</Text>
            </View>

            {/* Decorative dots */}
            <View style={styles.decorDotOne} />
            <View style={styles.decorDotTwo} />
            <View style={styles.decorDotThree} />

            <View style={styles.heroCaption}>
              <View style={styles.captionDot} />
              <Text style={styles.heroCaptionText}>
                HELP IS CLOSER THAN YOU THINK
              </Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.intro}>
            <Text style={styles.heading}>Welcome{"\n"}back.</Text>
            <Text style={styles.subtitle}>
              Your neighborhood is just a tap away.
            </Text>
          </View>

          {/* Login form */}
          <View style={styles.loginCard}>
            <View style={styles.cardTopLine} />

            <Text style={styles.formTitle}>Sign in to ATYS</Text>
            <Text style={styles.formSubtitle}>Continue with your account</Text>

            <View style={styles.form}>
              {/* Email / Phone */}
              <View style={styles.field}>
                <Text style={styles.label}>EMAIL OR PHONE NUMBER</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>✉</Text>

                  <TextInput
                    value={identifier}
                    onChangeText={(value) => {
                      setIdentifier(value);
                      if (error) setError("");
                    }}
                    placeholder="Enter email or phone"
                    placeholderTextColor={COLORS.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.field}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.label}>PASSWORD</Text>

                  <TouchableOpacity
                    onPress={() => router.push("/forgot-password" as any)}
                    disabled={submitting}
                  >
                    <Text style={styles.forgotLink}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>●</Text>

                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    style={styles.input}
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.visibilityButton}
                  >
                    <Text style={styles.visibilityText}>
                      {showPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error */}
              {!!error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Login button */}
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={submitting}
                disabled={submitting}
                style={styles.primaryButton}
              />
            </View>

            {/* Signup */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>Don't have an account?</Text>

              <TouchableOpacity
                onPress={() => router.push("/register")}
                disabled={submitting}
              >
                <Text style={styles.signupLink}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>MADE FOR YOUR NEIGHBORHOOD</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 18 : 12,
    paddingBottom: 35,
  },

  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.text,
    fontSize: 14,
  },

  // Brand

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 10,
  },

  brandIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  brandIconText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },

  brandName: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
  },

  brandTagline: {
    color: COLORS.muted,
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: 2,
  },

  // Hero illustration

  hero: {
    height: 218,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 15,
    overflow: "hidden",
  },

  heroGlow: {
    position: "absolute",
    width: 210,
    height: 190,
    borderRadius: 100,
    backgroundColor: "#E6EDDF",
    opacity: 0.9,
  },

  backCircle: {
    position: "absolute",
    width: 175,
    height: 175,
    borderRadius: 90,
    backgroundColor: "#DCE8D9",
    top: 12,
    left: "18%",
  },

  middleCircle: {
    position: "absolute",
    width: 125,
    height: 125,
    borderRadius: 70,
    backgroundColor: "#EDF2E8",
    top: 32,
    right: "19%",
  },

  homeShadow: {
    position: "absolute",
    width: 155,
    height: 25,
    borderRadius: 50,
    backgroundColor: "#A5B8A0",
    bottom: 35,
    opacity: 0.35,
  },

  homeIllustration: {
    width: 132,
    height: 126,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: -15,
  },

  roof: {
    width: 104,
    height: 82,
    backgroundColor: "#174C38",
    borderRadius: 13,
    transform: [{ rotate: "45deg" }],
    position: "absolute",
    top: 7,
    shadowColor: "#103B2B",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  house: {
    width: 112,
    height: 78,
    backgroundColor: "#FFFDF3",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#D8E2D2",
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    paddingHorizontal: 15,
    zIndex: 2,
    shadowColor: "#506A52",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 7,
  },

  houseWindow: {
    width: 26,
    height: 26,
    borderRadius: 5,
    backgroundColor: "#C4DED6",
    borderWidth: 2,
    borderColor: "#8EAD9C",
    marginRight: 12,
    overflow: "hidden",
  },

  windowVertical: {
    position: "absolute",
    width: 2,
    height: "100%",
    backgroundColor: "#8EAD9C",
    left: 10,
  },

  windowHorizontal: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#8EAD9C",
    top: 10,
  },

  houseDoor: {
    width: 23,
    height: 39,
    backgroundColor: "#A4B995",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: "#849D78",
  },

  floatingIcon: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#304C38",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 9,
    elevation: 7,
    borderWidth: 1,
    borderColor: "#EDF1E9",
  },

  floatingIconLeft: {
    top: 49,
    left: "13%",
    transform: [{ rotate: "-9deg" }],
  },

  floatingIconRight: {
    top: 48,
    right: "12%",
    transform: [{ rotate: "9deg" }],
  },

  floatingIconBottom: {
    bottom: 33,
    right: "24%",
    width: 43,
    height: 43,
    borderRadius: 14,
    transform: [{ rotate: "-8deg" }],
  },

  floatingEmoji: {
    fontSize: 23,
  },

  decorDotOne: {
    position: "absolute",
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#82A78A",
    top: 26,
    right: "32%",
  },

  decorDotTwo: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: "#D2A66E",
    top: 105,
    left: "10%",
  },

  decorDotThree: {
    position: "absolute",
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#A6BEA0",
    bottom: 36,
    left: "32%",
  },

  heroCaption: {
    position: "absolute",
    bottom: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  captionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#78A17C",
  },

  heroCaptionText: {
    color: "#718575",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },

  // Introduction

  intro: {
    marginTop: 5,
    marginBottom: 20,
  },

  heading: {
    color: COLORS.heading,
    fontSize: 36,
    lineHeight: 39,
    fontWeight: "900",
    letterSpacing: -1.2,
  },

  subtitle: {
    color: COLORS.text,
    fontSize: 13,
    marginTop: 8,
  },

  // Form card

  loginCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 23,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#1D3328",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.06,
    shadowRadius: 15,
    elevation: 3,
    overflow: "hidden",
  },

  cardTopLine: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    height: 3,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    backgroundColor: "#7DA487",
  },

  formTitle: {
    color: COLORS.heading,
    fontSize: 21,
    fontWeight: "900",
  },

  formSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 21,
  },

  form: {
    gap: 17,
  },

  field: {
    gap: 8,
  },

  label: {
    color: COLORS.heading,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  inputContainer: {
    height: 53,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAF7",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 13,
  },

  inputIcon: {
    width: 25,
    color: "#8CA18F",
    fontSize: 16,
    fontWeight: "700",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 5,
    color: COLORS.heading,
    fontSize: 13,
  },

  passwordLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  forgotLink: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  visibilityButton: {
    paddingHorizontal: 5,
    paddingVertical: 9,
  },

  visibilityText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
  },

  errorContainer: {
    backgroundColor: "#FFF0EF",
    borderRadius: 10,
    padding: 11,
    borderWidth: 1,
    borderColor: "#F5D9D6",
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    marginTop: 2,
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 22,
  },

  signupText: {
    color: COLORS.text,
    fontSize: 12,
  },

  signupLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  // Footer

  footer: {
    alignItems: "center",
    marginTop: 24,
    gap: 10,
  },

  footerLine: {
    width: 35,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#C7D5C6",
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
});
