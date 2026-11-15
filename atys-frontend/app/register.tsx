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
  heading: "#1D3328",
  text: "#526357",
  muted: "#87938A",
  border: "#E5EAE3",
  error: "#B83D3D",
};

function getRegistrationError(err: unknown): string {
  if (!axios.isAxiosError(err)) {
    return "Unable to create your account. Please try again.";
  }

  if (!err.response) {
    return "Unable to connect to ATYS. Please check your internet connection and try again.";
  }

  const status = err.response.status;
  const backendMessage = err.response.data?.message;

  if (status === 409) {
    return "An account with this email or phone number already exists. Please sign in instead.";
  }

  if (status === 400) {
    if (Array.isArray(backendMessage)) {
      return backendMessage.join("\n");
    }

    return typeof backendMessage === "string"
      ? backendMessage
      : "Please check your information and try again.";
  }

  if (status === 401) {
    return "Your registration request could not be authenticated. Please try again.";
  }

  if (status === 403) {
    return "You are not authorized to perform this action.";
  }

  if (status === 429) {
    return "Too many attempts. Please wait a moment before trying again.";
  }

  if (status >= 500) {
    return "Something went wrong on our server. Please try again later.";
  }

  return typeof backendMessage === "string"
    ? backendMessage
    : "Unable to create your account. Please try again.";
}

export default function RegisterScreen() {
  const { signUp, isLoading, user } = useAuth();

  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/");
    }
  }, [isLoading, user]);

  const handleRegister = async () => {
    if (submitting) return;

    const normalizedName = fullName.trim();
    const normalizedContact = contact.trim();

    setError("");

    if (
      !normalizedName ||
      !normalizedContact ||
      !password ||
      !confirmPassword
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    const isEmail = normalizedContact.includes("@");

    setSubmitting(true);

    try {
      await signUp({
        fullName: normalizedName,
        ...(isEmail
          ? { email: normalizedContact.toLowerCase() }
          : { phone: normalizedContact }),
        password,
      });

      router.replace("/");
    } catch (err: unknown) {
      setError(getRegistrationError(err));
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

          {/* Hero illustration */}
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <View style={styles.backCircle} />
            <View style={styles.middleCircle} />

            <View style={styles.illustration}>
              <View style={styles.personBack}>
                <View style={styles.personBackHead} />
                <View style={styles.personBackBody} />
              </View>

              <View style={styles.personFront}>
                <View style={styles.personFrontHead}>
                  <View style={styles.personHair} />
                </View>

                <View style={styles.personFrontBody}>
                  <View style={styles.personShirtDetail} />
                </View>
              </View>

              <View style={styles.handCircle}>
                <Text style={styles.handEmoji}>🤝</Text>
              </View>
            </View>

            <View style={[styles.floatingIcon, styles.iconLeft]}>
              <Text style={styles.floatingEmoji}>🏠</Text>
            </View>

            <View style={[styles.floatingIcon, styles.iconRight]}>
              <Text style={styles.floatingEmoji}>✨</Text>
            </View>

            <View style={[styles.floatingIcon, styles.iconBottom]}>
              <Text style={styles.floatingEmoji}>🔧</Text>
            </View>

            <View style={styles.dotOne} />
            <View style={styles.dotTwo} />
            <View style={styles.dotThree} />

            <View style={styles.heroCaption}>
              <View style={styles.captionDot} />
              <Text style={styles.heroCaptionText}>
                GOOD PEOPLE. HELPFUL NEIGHBORS.
              </Text>
            </View>
          </View>

          {/* Heading */}
          <View style={styles.intro}>
            <Text style={styles.heading}>
              Join your{"\n"}
              <Text style={styles.headingHighlight}>neighborhood.</Text>
            </Text>

            <Text style={styles.subtitle}>
              Create your account and get started with ATYS.
            </Text>
          </View>

          {/* Registration form */}
          <View style={styles.formCard}>
            <View style={styles.cardTopLine} />

            <Text style={styles.formTitle}>Create account</Text>
            <Text style={styles.formSubtitle}>
              Just a few details to get started
            </Text>

            <View style={styles.form}>
              {/* Full name */}
              <View style={styles.field}>
                <Text style={styles.label}>FULL NAME</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>◉</Text>

                  <TextInput
                    value={fullName}
                    onChangeText={(value) => {
                      setFullName(value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.muted}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="next"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Email / Phone */}
              <View style={styles.field}>
                <Text style={styles.label}>EMAIL OR PHONE NUMBER</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>✉</Text>

                  <TextInput
                    value={contact}
                    onChangeText={(value) => {
                      setContact(value);
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
                <Text style={styles.label}>PASSWORD</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>●</Text>

                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value);
                      if (error) setError("");
                    }}
                    placeholder="At least 8 characters"
                    placeholderTextColor={COLORS.muted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
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

              {/* Confirm password */}
              <View style={styles.field}>
                <Text style={styles.label}>CONFIRM PASSWORD</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>●</Text>

                  <TextInput
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      if (error) setError("");
                    }}
                    placeholder="Re-enter your password"
                    placeholderTextColor={COLORS.muted}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                    style={styles.input}
                  />

                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.visibilityButton}
                  >
                    <Text style={styles.visibilityText}>
                      {showConfirmPassword ? "Hide" : "Show"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error message */}
              {!!error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>!</Text>
                  <View style={styles.errorContent}>
                    <Text style={styles.errorTitle}>Registration failed</Text>
                    <Text style={styles.errorText}>{error}</Text>

                    {error.includes("already exists") && (
                      <TouchableOpacity
                        onPress={() => router.replace("/login")}
                        style={styles.errorAction}
                      >
                        <Text style={styles.errorActionText}>
                          Sign in instead →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Submit */}
              <Button
                title={submitting ? "Creating account..." : "Create Account"}
                onPress={handleRegister}
                loading={submitting}
                disabled={submitting}
                style={styles.primaryButton}
              />
            </View>

            {/* Login navigation */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>

              <TouchableOpacity
                onPress={() => router.replace("/login")}
                disabled={submitting}
              >
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.bottomFooter}>
            <View style={styles.footerLine} />
            <Text style={styles.bottomFooterText}>
              MADE FOR YOUR NEIGHBORHOOD
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

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 5,
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

  hero: {
    height: 190,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 10,
    overflow: "hidden",
  },

  heroGlow: {
    position: "absolute",
    width: 190,
    height: 170,
    borderRadius: 100,
    backgroundColor: "#E6EDDF",
  },

  backCircle: {
    position: "absolute",
    width: 155,
    height: 155,
    borderRadius: 80,
    backgroundColor: "#DCE8D9",
    top: 12,
    left: "19%",
  },

  middleCircle: {
    position: "absolute",
    width: 115,
    height: 115,
    borderRadius: 60,
    backgroundColor: "#EDF2E8",
    top: 25,
    right: "20%",
  },

  illustration: {
    width: 145,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -10,
  },

  personBack: {
    position: "absolute",
    left: 5,
    top: 18,
    alignItems: "center",
    zIndex: 1,
  },

  personBackHead: {
    width: 39,
    height: 39,
    borderRadius: 22,
    backgroundColor: "#D9A77F",
    borderWidth: 3,
    borderColor: "#FFF9EC",
  },

  personBackBody: {
    width: 58,
    height: 67,
    marginTop: -2,
    backgroundColor: "#85A98C",
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#526D55",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },

  personFront: {
    position: "absolute",
    right: 3,
    top: 8,
    alignItems: "center",
    zIndex: 3,
  },

  personFrontHead: {
    width: 47,
    height: 47,
    borderRadius: 25,
    backgroundColor: "#E8B991",
    borderWidth: 3,
    borderColor: "#FFF9EC",
    alignItems: "center",
    overflow: "hidden",
  },

  personHair: {
    width: 49,
    height: 20,
    backgroundColor: "#51402F",
    borderRadius: 20,
    position: "absolute",
    top: -7,
  },

  personFrontBody: {
    width: 70,
    height: 75,
    marginTop: -1,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 13,
    borderBottomRightRadius: 13,
    alignItems: "center",
    shadowColor: "#103B2B",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.24,
    shadowRadius: 7,
    elevation: 7,
  },

  personShirtDetail: {
    width: 20,
    height: 35,
    backgroundColor: "#2E7151",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  handCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    bottom: 13,
    left: 4,
    zIndex: 5,
    shadowColor: "#304C38",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

  handEmoji: {
    fontSize: 21,
  },

  floatingIcon: {
    position: "absolute",
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#304C38",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#EDF1E9",
  },

  iconLeft: {
    top: 38,
    left: "12%",
    transform: [{ rotate: "-9deg" }],
  },

  iconRight: {
    top: 35,
    right: "12%",
    transform: [{ rotate: "9deg" }],
  },

  iconBottom: {
    bottom: 26,
    right: "24%",
    width: 38,
    height: 38,
    borderRadius: 13,
  },

  floatingEmoji: {
    fontSize: 21,
  },

  dotOne: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#82A78A",
    top: 20,
    right: "34%",
  },

  dotTwo: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D2A66E",
    top: 95,
    left: "10%",
  },

  dotThree: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#A6BEA0",
    bottom: 27,
    left: "32%",
  },

  heroCaption: {
    position: "absolute",
    bottom: 2,
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
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1.1,
  },

  intro: {
    marginTop: 4,
    marginBottom: 19,
  },

  heading: {
    color: COLORS.heading,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "900",
    letterSpacing: -1,
  },

  headingHighlight: {
    color: COLORS.primary,
  },

  subtitle: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 8,
  },

  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 23,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
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
    marginBottom: 19,
  },

  form: {
    gap: 14,
  },

  field: {
    gap: 7,
  },

  label: {
    color: COLORS.heading,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },

  inputContainer: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAF7",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },

  inputIcon: {
    width: 24,
    color: "#8CA18F",
    fontSize: 15,
    fontWeight: "700",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 5,
    color: COLORS.heading,
    fontSize: 12,
  },

  visibilityButton: {
    paddingHorizontal: 5,
    paddingVertical: 9,
  },

  visibilityText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF0EF",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F5D9D6",
    gap: 10,
  },

  errorIcon: {
    width: 21,
    height: 21,
    borderRadius: 11,
    overflow: "hidden",
    textAlign: "center",
    textAlignVertical: "center",
    color: "#FFFFFF",
    backgroundColor: COLORS.error,
    fontSize: 14,
    fontWeight: "900",
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 4,
  },

  errorText: {
    color: COLORS.error,
    fontSize: 12,
    lineHeight: 18,
  },

  errorAction: {
    marginTop: 8,
    alignSelf: "flex-start",
  },

  errorActionText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    marginTop: 3,
  },

  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 21,
  },

  footerText: {
    color: COLORS.text,
    fontSize: 12,
  },

  loginLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "900",
  },

  bottomFooter: {
    alignItems: "center",
    marginTop: 23,
    gap: 10,
  },

  footerLine: {
    width: 35,
    height: 3,
    borderRadius: 3,
    backgroundColor: "#C7D5C6",
  },

  bottomFooterText: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.3,
  },
});
