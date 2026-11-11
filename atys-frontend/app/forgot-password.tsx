import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

type RecoveryMethod = "email" | "phone";
type RecoveryStep = "destination" | "otp" | "password" | "success";

const COLORS = {
  background: "#F5F5ED",
  white: "#FFFFFF",
  green: "#174C38",
  greenDark: "#103B2B",
  greenLight: "#E7F0E9",
  heading: "#172C22",
  text: "#45574B",
  muted: "#89958B",
  border: "#E3E9E1",
  error: "#C04444",
};

export default function ForgotPasswordScreen() {
  const [method, setMethod] = useState<RecoveryMethod>("email");
  const [step, setStep] = useState<RecoveryStep>("destination");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = method === "email" ? email.trim() : phone.trim();

  const maskedDestination = () => {
    if (method === "email") {
      const [name, domain] = email.split("@");
      if (!name || !domain) return email;

      return `${name.slice(0, 2)}${"*".repeat(
        Math.max(name.length - 2, 2),
      )}@${domain}`;
    }

    return phone.length > 4
      ? `${"*".repeat(Math.max(phone.length - 4, 4))}${phone.slice(-4)}`
      : phone;
  };

  const handleSendOtp = () => {
    setError("");
    setNotice("");

    if (!destination) {
      setError(
        method === "email"
          ? "Please enter your email address."
          : "Please enter your phone number.",
      );
      return;
    }

    if (method === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(destination)) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      const digits = destination.replace(/\D/g, "");

      if (digits.length < 10 || digits.length > 15) {
        setError("Please enter a valid phone number.");
        return;
      }
    }

    setLoading(true);

    // UI simulation. Connect the real OTP API later.
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setOtp("");
      setNotice(
        "This is a preview. Actual OTP delivery will be connected later.",
      );
    }, 500);
  };

  const handleVerifyOtp = () => {
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    // UI simulation. Real OTP verification will be added later.
    setStep("password");
    setNotice("");
  };

  const handleResetPassword = () => {
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // UI simulation. No password is changed yet.
    setStep("success");
  };

  const handleResendOtp = () => {
    setOtp("");
    setError("");
    setNotice(
      "Resend is currently a UI preview. OTP delivery will be added later.",
    );
  };

  const changeMethod = (nextMethod: RecoveryMethod) => {
    setMethod(nextMethod);
    setError("");
    setNotice("");
    setEmail("");
    setPhone("");
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (step === "destination") {
            router.back();
          } else if (step === "otp") {
            setStep("destination");
          } else if (step === "password") {
            setStep("otp");
          } else {
            router.replace("/login");
          }

          setError("");
          setNotice("");
        }}
      >
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>

      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandIconText}>A</Text>
        </View>
        <Text style={styles.brandName}>ATYS</Text>
      </View>
    </View>
  );

  const renderIllustration = () => (
    <View style={styles.illustrationArea}>
      <View style={styles.illustrationCircle}>
        <View style={styles.illustrationInner}>
          <Text style={styles.lockEmoji}>🔐</Text>
        </View>

        <View style={styles.floatingBadge}>
          <Text style={styles.floatingBadgeText}>✓</Text>
        </View>
      </View>

      <View style={styles.floatingDotOne} />
      <View style={styles.floatingDotTwo} />

      <Text style={styles.illustrationCaption}>YOUR ACCOUNT, YOUR CONTROL</Text>
    </View>
  );

  const renderDestinationStep = () => (
    <>
      <Text style={styles.title}>Forgot password?</Text>

      <Text style={styles.subtitle}>
        Choose how you want to receive your password recovery code.
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>
          {method === "email" ? "EMAIL ADDRESS" : "PHONE NUMBER"}
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>{method === "email" ? "✉" : "☎"}</Text>

          <TextInput
            style={styles.input}
            value={method === "email" ? email : phone}
            onChangeText={(value) => {
              method === "email" ? setEmail(value) : setPhone(value);
              setError("");
            }}
            placeholder={
              method === "email"
                ? "Enter your email address"
                : "Enter your phone number"
            }
            placeholderTextColor={COLORS.muted}
            keyboardType={method === "email" ? "email-address" : "phone-pad"}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleSendOtp}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.primaryButtonText}>Send OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={() => changeMethod(method === "email" ? "phone" : "email")}
          activeOpacity={0.75}
        >
          <Text style={styles.alternativeButtonText}>
            {method === "email"
              ? "Use phone number instead"
              : "Use email address instead"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.bottomText}>
        Remember your password?{" "}
        <Text style={styles.linkText} onPress={() => router.replace("/login")}>
          Sign in
        </Text>
      </Text>
    </>
  );

  const renderOtpStep = () => (
    <>
      <Text style={styles.title}>Verify your account</Text>

      <Text style={styles.subtitle}>
        Enter the 6-digit verification code for{" "}
        <Text style={styles.destinationText}>{maskedDestination()}</Text>
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>VERIFICATION CODE</Text>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={(value) => {
            setOtp(value.replace(/\D/g, "").slice(0, 6));
            setError("");
          }}
          placeholder="000000"
          placeholderTextColor="#B5BDB6"
          keyboardType="number-pad"
          maxLength={6}
          textContentType="oneTimeCode"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleVerifyOtp}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Verify OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendButton} onPress={handleResendOtp}>
          <Text style={styles.resendText}>
            Didn't receive the code? Resend OTP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.changeDestination}
          onPress={() => {
            setStep("destination");
            setError("");
            setNotice("");
          }}
        >
          <Text style={styles.changeDestinationText}>
            Change {method === "email" ? "email address" : "phone number"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderPasswordStep = () => (
    <>
      <Text style={styles.title}>Create new password</Text>

      <Text style={styles.subtitle}>
        Choose a strong password for your ATYS account.
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.inputLabel}>NEW PASSWORD</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>●</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setError("");
            }}
            placeholder="Enter new password"
            placeholderTextColor={COLORS.muted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>At least 8 characters.</Text>

        <Text style={[styles.inputLabel, styles.secondLabel]}>
          CONFIRM PASSWORD
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>●</Text>

          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setError("");
            }}
            placeholder="Confirm new password"
            placeholderTextColor={COLORS.muted}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.showText}>
              {showConfirmPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleResetPassword}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSuccessStep = () => (
    <View style={styles.successContainer}>
      <View style={styles.successCircle}>
        <Text style={styles.successIcon}>✓</Text>
      </View>

      <Text style={styles.title}>All set!</Text>

      <Text style={styles.subtitle}>
        Your password recovery flow is complete in this UI preview.
      </Text>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => router.replace("/login")}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Back to Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.previewNote}>
        Connect the backend recovery service before using this flow with real
        accounts.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderHeader()}

          {step !== "success" && renderIllustration()}

          {step === "destination" && renderDestinationStep()}
          {step === "otp" && renderOtpStep()}
          {step === "password" && renderPasswordStep()}
          {step === "success" && renderSuccessStep()}

          {notice ? (
            <View style={styles.noticeContainer}>
              <Text style={styles.noticeText}>{notice}</Text>
            </View>
          ) : null}

          <Text style={styles.footer}>ATYS · AT YOUR SERVICE</Text>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingBottom: 24,
  },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    color: COLORS.green,
    fontSize: 32,
    lineHeight: 36,
    marginTop: -4,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandIcon: {
    width: 30,
    height: 30,
    backgroundColor: COLORS.green,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  brandIconText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },
  brandName: {
    color: COLORS.green,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 2,
  },
  illustrationArea: {
    height: 225,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 15,
  },
  illustrationCircle: {
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: "#E1EDE2",
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "#C6DCCB",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#B3CCB9",
  },
  lockEmoji: {
    fontSize: 57,
  },
  floatingBadge: {
    position: "absolute",
    right: 3,
    top: 12,
    width: 39,
    height: 39,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: COLORS.background,
  },
  floatingBadgeText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },
  floatingDotOne: {
    position: "absolute",
    left: "23%",
    top: 34,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#D7B77B",
  },
  floatingDotTwo: {
    position: "absolute",
    right: "21%",
    bottom: 36,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#7EAA8A",
  },
  illustrationCaption: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 15,
  },
  title: {
    color: COLORS.heading,
    fontSize: 29,
    fontWeight: "800",
    letterSpacing: -0.8,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 9,
    marginBottom: 24,
    paddingHorizontal: 5,
  },
  destinationText: {
    color: COLORS.green,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 23,
    padding: 21,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputLabel: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  inputContainer: {
    height: 55,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FBFCF9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  inputIcon: {
    color: COLORS.green,
    fontSize: 17,
    width: 27,
  },
  input: {
    flex: 1,
    color: COLORS.heading,
    fontSize: 14,
    height: "100%",
  },
  showText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "700",
    paddingLeft: 8,
  },
  primaryButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  switchDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 19,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  orText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
  },
  alternativeButton: {
    height: 48,
    borderRadius: 13,
    backgroundColor: COLORS.greenLight,
    alignItems: "center",
    justifyContent: "center",
  },
  alternativeButtonText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "700",
  },
  otpInput: {
    height: 65,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FBFCF9",
    textAlign: "center",
    color: COLORS.green,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 12,
    paddingLeft: 18,
  },
  resendButton: {
    alignItems: "center",
    marginTop: 21,
  },
  resendText: {
    color: COLORS.green,
    fontSize: 12,
    fontWeight: "700",
  },
  changeDestination: {
    alignItems: "center",
    marginTop: 16,
  },
  changeDestinationText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  secondLabel: {
    marginTop: 21,
  },
  helperText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 10,
    fontWeight: "600",
  },
  bottomText: {
    color: COLORS.text,
    textAlign: "center",
    fontSize: 12,
    marginTop: 25,
  },
  linkText: {
    color: COLORS.green,
    fontWeight: "800",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 65,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DCEBDF",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  successIcon: {
    color: COLORS.green,
    fontSize: 48,
    fontWeight: "800",
  },
  previewNote: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 22,
    paddingHorizontal: 15,
  },
  noticeContainer: {
    backgroundColor: "#E9F0E8",
    borderRadius: 12,
    padding: 12,
    marginTop: 15,
  },
  noticeText: {
    color: COLORS.green,
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
  },
  footer: {
    color: "#A0AAA0",
    textAlign: "center",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 30,
  },
});
