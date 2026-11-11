import React, { useState, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { TextInput } from "../components/ui/TextInput";
import { Button } from "../components/ui/Button";
import { aiService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useVoice } from "../hooks/useVoice";

const EXAMPLE_REQUESTS = [
  {
    title: "AC repair",
    description: "My AC is not cooling properly. I need someone to check it.",
  },
  {
    title: "Buy groceries",
    description: "I need 2 litres of milk and some groceries.",
  },
  {
    title: "Moving help",
    description: "I need help moving some furniture to another room.",
  },
];

export default function RequestInputScreen() {
  const { width } = useWindowDimensions();
  const { signOut } = useAuth();

  const [requestText, setRequestText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voiceBaseText = useRef("");

  const isSmallScreen = width < 360;

  // Keep the existing request text and append recognized speech.
  const handleVoiceTranscript = useCallback((transcript: string) => {
    const combined = [voiceBaseText.current, transcript]
      .filter(Boolean)
      .join(" ");

    setRequestText(combined);
    setError(null);
  }, []);

  const { isListening, voiceError, startListening, stopListening } = useVoice({
    onTranscript: handleVoiceTranscript,
  });

  const handleMicrophonePress = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    voiceBaseText.current = requestText.trim();
    await startListening();
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      if (isListening) {
        stopListening();
      }

      setLoggingOut(true);

      await signOut();

      router.replace("/login");
    } catch (err) {
      console.error("Logout error:", err);

      Alert.alert(
        "Logout failed",
        "We couldn't log you out. Please try again.",
      );

      setLoggingOut(false);
    }
  };

  const handleSubmit = async () => {
    if (!requestText.trim()) {
      setError("Please describe what you need help with.");
      return;
    }

    if (isListening) {
      stopListening();
    }

    setError(null);
    setLoading(true);

    try {
      const response = await aiService.prepareRequest({
        message: requestText.trim(),
        language: "en",
        interactionMode: "text",
      });

      router.push({
        pathname: "/response",
        params: {
          title: response.draft.title,
          question: response.nextQuestion,
          requestId: response.requestId,
          initialDraft: JSON.stringify(response.draft),
          initialMessage: requestText.trim(),
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExamplePress = (description: string) => {
    if (isListening) {
      stopListening();
    }

    setRequestText(description);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: isSmallScreen ? 20 : 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandContainer}>
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>A</Text>
              </View>

              <View>
                <Text style={styles.brand}>ATYS</Text>
                <Text style={styles.brandSubtitle}>AT YOUR SERVICE</Text>
              </View>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.headerBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.headerBadgeText}>Here to help</Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.logoutButton,
                  pressed && styles.logoutButtonPressed,
                  loggingOut && styles.logoutButtonDisabled,
                ]}
                onPress={handleLogout}
                disabled={loggingOut}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Log out of ATYS"
              >
                {loggingOut ? (
                  <ActivityIndicator size="small" color="#A33D3D" />
                ) : (
                  <Text style={styles.logoutButtonText}>Log out</Text>
                )}
              </Pressable>
            </View>
          </View>

          {/* Welcome section */}
          <View style={styles.welcomeSection}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>YOUR PERSONAL ASSISTANT</Text>
            </View>

            <Text
              style={[styles.heading, { fontSize: isSmallScreen ? 30 : 35 }]}
            >
              How can we help{"\n"}
              <Text style={styles.headingHighlight}>you today?</Text>
            </Text>

            <Text style={styles.subheading}>
              Tell us what you need in your own words. We'll help you organize
              everything.
            </Text>
          </View>

          {/* Request input card */}
          <View style={styles.inputCard}>
            <View style={styles.inputCardHeader}>
              <View>
                <Text style={styles.inputTitle}>Describe your request</Text>
                <Text style={styles.inputSubtitle}>
                  What would you like us to help with?
                </Text>
              </View>

              <View style={styles.inputIcon}>
                <Text style={styles.inputIconText}>✎</Text>
              </View>
            </View>

            <View style={styles.textInputWrapper}>
              <TextInput
                placeholder="For example, I need someone to repair my AC..."
                value={requestText}
                onChangeText={(value) => {
                  setRequestText(value);

                  if (error) {
                    setError(null);
                  }
                }}
                multiline
                numberOfLines={5}
                error={error}
              />

              {/* Voice input */}
              <Pressable
                style={({ pressed }) => [
                  styles.voiceButton,
                  isListening && styles.voiceButtonActive,
                  pressed && styles.voiceButtonPressed,
                ]}
                onPress={handleMicrophonePress}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={
                  isListening ? "Stop voice input" : "Start voice input"
                }
              >
                <Text style={styles.voiceButtonIcon}>
                  {isListening ? "■" : "🎙"}
                </Text>

                <Text style={styles.voiceButtonText}>
                  {isListening ? "Stop listening" : "Speak your request"}
                </Text>
              </Pressable>

              {isListening && (
                <Text style={styles.voiceStatus}>
                  Listening... Speak clearly.
                </Text>
              )}

              {voiceError && (
                <Text style={styles.voiceError}>{voiceError}</Text>
              )}
            </View>

            <Text style={styles.inputHint}>
              Don't worry about the details. We'll ask you if we need more
              information.
            </Text>

            <View style={styles.buttonWrapper}>
              <Button
                title="Continue"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || loggingOut}
              />
            </View>

            <Text style={styles.secureNote}>
              Your request will be prepared before you submit it.
            </Text>
          </View>

          {/* Example requests */}
          <View style={styles.examplesSection}>
            <View style={styles.examplesHeader}>
              <Text style={styles.examplesTitle}>Need some inspiration?</Text>
              <Text style={styles.examplesSubtitle}>TRY AN EXAMPLE</Text>
            </View>

            {EXAMPLE_REQUESTS.map((example) => (
              <Pressable
                key={example.title}
                style={({ pressed }) => [
                  styles.exampleItem,
                  pressed && styles.examplePressed,
                ]}
                onPress={() => handleExamplePress(example.description)}
                accessibilityRole="button"
                accessibilityLabel={`Use example: ${example.title}`}
              >
                <View style={styles.exampleIcon}>
                  <Text style={styles.exampleIconText}>
                    {example.title === "AC repair"
                      ? "⌁"
                      : example.title === "Buy groceries"
                        ? "🛒"
                        : "⌂"}
                  </Text>
                </View>

                <View style={styles.exampleContent}>
                  <Text style={styles.exampleTitle}>{example.title}</Text>

                  <Text style={styles.exampleDescription}>
                    {example.description}
                  </Text>
                </View>

                <Text style={styles.exampleArrow}>›</Text>
              </Pressable>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>
              One simple conversation. A clearer request.
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
    backgroundColor: "#F7F8F3",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 36,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 34,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  logoBox: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: "#174C38",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
  },
  brand: {
    fontSize: 21,
    fontWeight: "800",
    color: "#174C38",
    letterSpacing: 1.2,
  },
  brandSubtitle: {
    fontSize: 9,
    color: "#7B887F",
    letterSpacing: 1.4,
    fontWeight: "600",
    marginTop: 2,
  },
  headerRight: {
    alignItems: "flex-end",
    gap: 10,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E9F1E9",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#39865C",
  },
  headerBadgeText: {
    color: "#37674B",
    fontSize: 11,
    fontWeight: "600",
  },
  logoutButton: {
    minWidth: 86,
    minHeight: 38,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E7D5D3",
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 11,
  },
  logoutButtonPressed: {
    backgroundColor: "#FCEDEC",
    borderColor: "#D9AAAA",
  },
  logoutButtonDisabled: {
    opacity: 0.5,
  },
  logoutButtonText: {
    color: "#A33D3D",
    fontSize: 12,
    fontWeight: "700",
  },

  // Welcome
  welcomeSection: {
    marginBottom: 28,
  },
  eyebrow: {
    alignSelf: "flex-start",
    backgroundColor: "#E9F0E8",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 6,
    marginBottom: 16,
  },
  eyebrowText: {
    color: "#39704D",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  heading: {
    color: "#1D3026",
    fontWeight: "800",
    lineHeight: 43,
    letterSpacing: -1,
    marginBottom: 12,
  },
  headingHighlight: {
    color: "#39815A",
  },
  subheading: {
    color: "#78847B",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 340,
  },

  // Input card
  inputCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EAEDE7",
    shadowColor: "#263A2D",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  inputCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  inputTitle: {
    color: "#26392D",
    fontSize: 17,
    fontWeight: "700",
  },
  inputSubtitle: {
    color: "#909B92",
    fontSize: 12,
    marginTop: 5,
  },
  inputIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "#EAF2EB",
    justifyContent: "center",
    alignItems: "center",
  },
  inputIconText: {
    color: "#39815A",
    fontSize: 22,
    fontWeight: "700",
  },
  textInputWrapper: {
    marginBottom: 10,
  },
  inputHint: {
    color: "#89948B",
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 20,
  },
  buttonWrapper: {
    marginBottom: 13,
  },
  secureNote: {
    color: "#8A958D",
    fontSize: 10,
    textAlign: "center",
  },

  // Voice input
  voiceButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    backgroundColor: "#EAF2EB",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D5E5D6",
  },
  voiceButtonActive: {
    backgroundColor: "#FCEDEC",
    borderColor: "#D9AAAA",
  },
  voiceButtonPressed: {
    opacity: 0.75,
  },
  voiceButtonIcon: {
    fontSize: 15,
    color: "#286044",
  },
  voiceButtonText: {
    color: "#286044",
    fontSize: 13,
    fontWeight: "700",
  },
  voiceStatus: {
    marginTop: 9,
    color: "#39815A",
    fontSize: 12,
  },
  voiceError: {
    marginTop: 9,
    color: "#B83D3D",
    fontSize: 12,
  },

  // Examples
  examplesSection: {
    marginTop: 34,
  },
  examplesHeader: {
    marginBottom: 15,
  },
  examplesTitle: {
    color: "#26392D",
    fontSize: 17,
    fontWeight: "700",
  },
  examplesSubtitle: {
    color: "#929C93",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginTop: 5,
  },
  exampleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EAEDE7",
    padding: 13,
    marginBottom: 10,
  },
  examplePressed: {
    backgroundColor: "#EDF4EC",
    borderColor: "#AFC9B3",
  },
  exampleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EDF3EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  exampleIconText: {
    fontSize: 19,
    color: "#397A52",
  },
  exampleContent: {
    flex: 1,
  },
  exampleTitle: {
    color: "#2A3B30",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  exampleDescription: {
    color: "#89948B",
    fontSize: 11,
    lineHeight: 16,
  },
  exampleArrow: {
    color: "#7D9984",
    fontSize: 25,
    marginLeft: 8,
  },

  // Footer
  footer: {
    alignItems: "center",
    marginTop: 22,
  },
  footerLine: {
    width: 35,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#D6E3D6",
    marginBottom: 12,
  },
  footerText: {
    color: "#98A198",
    fontSize: 11,
  },
});
