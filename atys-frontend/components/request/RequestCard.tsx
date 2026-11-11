import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { RequestDraft } from "../../types/api";

type RequestCardProps = {
  draft: RequestDraft;
  onEdit?: (field: RequestDraft["fields"][number]) => void;
};

export const RequestCard = ({ draft, onEdit }: RequestCardProps) => {
  const { width } = useWindowDimensions();

  if (!draft) return null;

  const isNarrow = width < 360;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
            {draft.title}
          </Text>
          <Text style={styles.category}>
            {draft.category.replace(/_/g, " ").toUpperCase()}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Review</Text>
        </View>
      </View>

      <View style={styles.fieldsContainer}>
        {draft.fields.map((field) => (
          <View
            key={field.id}
            style={[styles.fieldRow, isNarrow && styles.fieldRowStacked]}
          >
            <View style={styles.fieldContent}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <Text
                style={[
                  styles.fieldValue,
                  field.status === "missing" && styles.missingValue,
                ]}
              >
                {field.value ||
                  (field.status === "missing" ? "Not provided" : "N/A")}
              </Text>
            </View>

            {onEdit && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Edit ${field.label}`}
                hitSlop={8}
                onPress={() => onEdit(field)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E6EAE5",
    shadowColor: "#173D2A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF1ED",
  },
  heading: {
    flex: 1,
  },
  title: {
    color: "#183D2B",
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 25,
  },
  category: {
    marginTop: 6,
    color: "#6B806F",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  statusBadge: {
    backgroundColor: "#EEF5EF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    color: "#356447",
    fontSize: 11,
    fontWeight: "700",
  },
  fieldsContainer: {
    marginTop: 4,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2EF",
  },
  fieldRowStacked: {
    alignItems: "flex-start",
  },
  fieldContent: {
    flex: 1,
    gap: 5,
  },
  fieldLabel: {
    color: "#718075",
    fontSize: 12,
    fontWeight: "600",
  },
  fieldValue: {
    color: "#263B2E",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  missingValue: {
    color: "#A4AAA5",
    fontStyle: "italic",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "#F0F5F0",
  },
  editButtonText: {
    color: "#356447",
    fontSize: 12,
    fontWeight: "700",
  },
});
