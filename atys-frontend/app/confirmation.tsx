import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

export default function ConfirmationScreen() {
  const { title, message, status } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✅</Text>
        </View>

        <Text style={styles.heading}>Request Launched!</Text>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Status</Text>
          <Text style={styles.statusValue}>
            {status || "Finding providers..."}
          </Text>
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can now close this screen. We will notify you once a provider is
            found.
          </Text>

          <Text style={styles.homeLink} onPress={() => router.replace("/")}>
            Start New Request
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e6f7ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  icon: {
    fontSize: 40,
  },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 18,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#eee",
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#007AFF",
  },
  message: {
    fontSize: 16,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 48,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 16,
  },
  homeLink: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
});
