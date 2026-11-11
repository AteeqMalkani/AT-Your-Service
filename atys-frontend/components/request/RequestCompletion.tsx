import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RequestDraft } from "../../types/api";
import { Button } from "../ui/Button";

interface RequestCompletionProps {
  draft: RequestDraft;
  onReview: () => void;
  onLaunch: () => void;
  launchLoading?: boolean;
}

export function RequestCompletion({
  draft,
  onReview,
  onLaunch,
  launchLoading = false,
}: RequestCompletionProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandHeader}>
          <Text style={styles.brand}>ATYS</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.headingContainer}>
            <Text style={styles.title}>Review your request</Text>

            <Text style={styles.subtitle}>
              Your request details are ready. You can review them before
              launching.
            </Text>
          </View>

          <View style={styles.readyCard}>
            <View style={styles.readyIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>

            <View style={styles.readyContent}>
              <Text style={styles.readyTitle}>Your request is ready</Text>

              <Text style={styles.readyDescription}>
                Everything is prepared for your final review.
              </Text>
            </View>
          </View>

          <View style={styles.nextSection}>
            <Text style={styles.sectionTitle}>What happens next?</Text>

            <Text style={styles.nextDescription}>
              When you launch your request, ATYS submits it so the next step of
              the request process can begin.
            </Text>
          </View>

          <View style={styles.requestPreview}>
            <Text style={styles.requestLabel}>YOUR REQUEST</Text>

            <Text style={styles.requestTitle} numberOfLines={2}>
              {draft.title}
            </Text>
          </View>
        </View>

        <View style={styles.bottomActions}>
          <Button
            title="Launch Request"
            onPress={onLaunch}
            loading={launchLoading}
            disabled={launchLoading}
          />

          <Button
            title="Review Request"
            variant="secondary"
            onPress={onReview}
            disabled={launchLoading}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7F3",
  },

  container: {
    flex: 1,
  },

  brandHeader: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  brand: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#244B35",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
  },

  headingContainer: {
    marginBottom: 30,
  },

  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#244B35",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#718075",
  },

  readyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F0E8",
    borderRadius: 16,
    padding: 18,
    marginBottom: 34,
    gap: 14,
  },

  readyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D2E5D5",
    justifyContent: "center",
    alignItems: "center",
  },

  checkmark: {
    fontSize: 23,
    fontWeight: "800",
    color: "#356447",
  },

  readyContent: {
    flex: 1,
  },

  readyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#244B35",
    marginBottom: 5,
  },

  readyDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: "#526B59",
  },

  nextSection: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#244B35",
    marginBottom: 10,
  },

  nextDescription: {
    fontSize: 14,
    lineHeight: 23,
    color: "#718075",
  },

  requestPreview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6EAE5",
    padding: 16,
  },

  requestLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#829084",
    marginBottom: 7,
  },

  requestTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#244B35",
  },

  bottomActions: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#E7ECE6",
    gap: 12,
  },
});
