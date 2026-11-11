import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { aiService } from "../services/api";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { ChatMessage } from "../components/request/ChatMessage";
import { RequestCard } from "../components/request/RequestCard";
import { AnythingElseOptions } from "../components/request/AnythingElseOptions";
import { RequestCompletion } from "../components/request/RequestCompletion";
import { useConversation } from "../hooks/useConversation";

export default function ConversationScreen() {
  const { width } = useWindowDimensions();
  const { title, question, requestId, initialDraft, initialMessage } =
    useLocalSearchParams();

  const normalizeParam = (
    value: string | string[] | undefined,
  ): string | null => {
    return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
  };

  const horizontalPadding = width < 360 ? 14 : 20;

  const {
    messages,
    draft,
    loading,
    error,
    isComplete,
    isAskingAnythingElse,
    isCollectingAdditionalDetails,
    sendFollowUp,
    handleAnythingElseYes,
    handleAnythingElseNo,
  } = useConversation({
    requestId: normalizeParam(requestId),
    initialDraft: normalizeParam(initialDraft),
    question: normalizeParam(question),
    initialMessage: normalizeParam(initialMessage),
  });

  const [input, setInput] = useState("");
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    setInput("");

    const success = await sendFollowUp(messageText);

    if (success.success) {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  };

  if (isComplete && !isAskingAnythingElse) {
    return (
      <RequestCompletion
        draft={draft!}
        onReview={() =>
          router.push({
            pathname: "/review",
            params: {
              requestId: draft?.requestId,
              initialDraft: JSON.stringify(draft),
            },
          })
        }
        onLaunch={async () => {
          try {
            const res = await aiService.launchRequest({ draft: draft! });
            router.push({
              pathname: "/confirmation",
              params: {
                title: draft?.title,
                message: res.message,
                status: res.status,
              },
            });
          } catch (err: any) {
            alert(err.response?.data?.message || "Launch failed");
          }
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>A</Text>
            </View>

            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>ATYS Assistant</Text>
              <Text style={styles.headerSubtitle}>
                Let's get your request ready
              </Text>
            </View>

            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>Active</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
        </View>

        {/* Conversation */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.requestSection}>
            <Text style={styles.sectionEyebrow}>YOUR REQUEST</Text>
            <View style={styles.requestCardContainer}>
              {draft ? (
                <RequestCard draft={draft} />
              ) : (
                <ActivityIndicator color="#356447" />
              )}
            </View>
          </View>

          <View style={styles.chatSection}>
            <View style={styles.chatSectionHeader}>
              <Text style={styles.sectionTitle}>Let's talk it through</Text>
              <Text style={styles.sectionCaption}>
                Answer a few questions so we can understand what you need.
              </Text>
            </View>

            {messages.map((msg, index) => (
              <ChatMessage key={index} text={msg.text} isUser={msg.isUser} />
            ))}

            {loading && (
              <View style={styles.loadingBubble}>
                <View style={styles.loadingAvatar}>
                  <Text style={styles.loadingAvatarText}>A</Text>
                </View>

                <View style={styles.loadingContent}>
                  <ActivityIndicator color="#397A52" size="small" />
                  <Text style={styles.loadingText}>
                    Thinking through your request...
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          {isAskingAnythingElse && !isCollectingAdditionalDetails && (
            <View style={styles.optionsContainer}>
              <Text style={styles.optionsPrompt}>
                Would you like to add anything else?
              </Text>
              <AnythingElseOptions
                onYes={handleAnythingElseYes}
                onNo={handleAnythingElseNo}
              />
            </View>
          )}

          <View style={styles.inputRow}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder={
                  isCollectingAdditionalDetails
                    ? "Add more details..."
                    : "Type your answer..."
                }
                value={input}
                onChangeText={setInput}
                multiline
                style={styles.flexInput}
              />
            </View>

            <Button
              title="Send"
              onPress={handleSend}
              loading={loading}
              disabled={!input.trim() || loading}
              style={styles.sendButton}
            />
          </View>

          <Text style={styles.composerHint}>
            Your answers help ATYS prepare a clearer request.
          </Text>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
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

  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E9EDE7",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandMark: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#174C38",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: "#21372A",
    fontSize: 16,
    fontWeight: "800",
  },
  headerSubtitle: {
    color: "#89948B",
    fontSize: 11,
    marginTop: 3,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF3EB",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#39815A",
  },
  activeBadgeText: {
    color: "#39704D",
    fontSize: 10,
    fontWeight: "700",
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E9EEE8",
    borderRadius: 4,
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: {
    width: "45%",
    height: "100%",
    backgroundColor: "#39815A",
    borderRadius: 4,
  },

  // Scroll area
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 22,
    paddingBottom: 24,
  },
  requestSection: {
    marginBottom: 27,
  },
  sectionEyebrow: {
    color: "#8A968D",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  requestCardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E6EBE4",
    padding: 4,
    overflow: "hidden",
  },

  // Chat
  chatSection: {
    marginTop: 2,
  },
  chatSectionHeader: {
    marginBottom: 18,
  },
  sectionTitle: {
    color: "#26392D",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 6,
  },
  sectionCaption: {
    color: "#89948B",
    fontSize: 12,
    lineHeight: 18,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 14,
  },
  loadingAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#174C38",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  loadingAvatarText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  loadingContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E6EBE4",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
    gap: 9,
  },
  loadingText: {
    color: "#738076",
    fontSize: 12,
  },

  // Composer
  composer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: Platform.OS === "ios" ? 12 : 10,
    borderTopWidth: 1,
    borderTopColor: "#E8ECE6",
  },
  optionsContainer: {
    marginBottom: 12,
  },
  optionsPrompt: {
    color: "#526257",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 9,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    minWidth: 0,
  },
  flexInput: {
    flex: 1,
    minWidth: 0,
  },
  sendButton: {
    width: 78,
    flexShrink: 0,
  },
  composerHint: {
    color: "#9AA39B",
    fontSize: 10,
    textAlign: "center",
    marginTop: 9,
  },

  // Error
  errorBanner: {
    position: "absolute",
    bottom: 112,
    left: 20,
    right: 20,
    backgroundColor: "#B83D3D",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    zIndex: 10,
    elevation: 4,
  },
  errorText: {
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "center",
    fontWeight: "600",
  },
});
