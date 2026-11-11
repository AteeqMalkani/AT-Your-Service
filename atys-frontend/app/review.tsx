import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

import { aiService } from "../services/api";
import { RequestDraft, RequestField } from "../types/api";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { RequestCard } from "../components/request/RequestCard";
import { RequestNavigation } from "../utils/requestNavigation";

export default function ReviewScreen() {
  const { initialDraft } = useLocalSearchParams();

  const normalizedDraft = Array.isArray(initialDraft)
    ? (initialDraft[0] ?? null)
    : (initialDraft ?? null);

  const [draft, setDraft] = useState<RequestDraft | null>(() =>
    RequestNavigation.parseDraft(normalizedDraft),
  );

  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditPress = (field: RequestField) => {
    setEditingFieldId(field.id);
    setEditValue(field.value || "");
    setError(null);
  };

  const saveEdit = async () => {
    if (!draft || !editingFieldId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const field = draft.fields.find((item) => item.id === editingFieldId);

      if (!field) {
        throw new Error("Field not found.");
      }

      const message = `Update the field "${field.label}" to "${editValue}"`;

      const response = await aiService.continueRequest({
        requestId: draft.requestId,
        draft,
        message,
      });

      setDraft(response.draft);
      setEditingFieldId(null);
      setEditValue("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update field.");
    } finally {
      setLoading(false);
    }
  };

  const handleLaunch = async () => {
    if (!draft) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await aiService.launchRequest({ draft });

      router.push({
        pathname: "/confirmation",
        params: {
          title: draft.title,
          message: response.message,
          status: response.status,
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Launch failed. Please check your details.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!draft) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.completionContainer}>
          <Text style={styles.errorTextCenter}>
            Invalid request data. Please return to the conversation.
          </Text>

          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Review Request</Text>
          </View>

          <RequestCard draft={draft} onEdit={handleEditPress} />

          {editingFieldId !== null && (
            <View style={styles.editContainer}>
              <Text style={styles.editLabel}>Editing Field</Text>

              <TextInput
                value={editValue}
                onChangeText={setEditValue}
                placeholder="Enter corrected value..."
                multiline
              />

              <View style={styles.editButtons}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={() => {
                    setEditingFieldId(null);
                    setEditValue("");
                    setError(null);
                  }}
                  disabled={loading}
                />

                <Button
                  title="Save"
                  onPress={saveEdit}
                  loading={loading}
                  disabled={loading}
                />
              </View>
            </View>
          )}

          {error !== null && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.footer}>
            <Button
              title="Back to Completion"
              variant="secondary"
              onPress={() => router.back()}
              disabled={loading}
            />

            <Button
              title="Launch Request"
              onPress={handleLaunch}
              loading={loading}
              disabled={loading || editingFieldId !== null}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f7",
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
    flexGrow: 1,
  },
  editContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  editLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: "column",
    gap: 10,
    marginTop: 16,
    width: "100%",
  },
  footer: {
    marginTop: 24,
    gap: 12,
  },
  errorBanner: {
    backgroundColor: "#ff4d4f",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  completionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    gap: 16,
  },
  errorTextCenter: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
});
