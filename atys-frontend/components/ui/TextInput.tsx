import React from "react";
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  Text,
  StyleProp,
  ViewStyle,
} from "react-native";

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
}

export const TextInput = ({
  value,
  onChangeText,
  placeholder,
  multiline,
  numberOfLines,
  error,
  style,
}: TextInputProps) => {
  return (
    <View style={[styles.container, style]}>
      <RNTextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        placeholderTextColor="#999"
        textAlignVertical={multiline ? "top" : "center"}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
    color: "#333",
  },
  multilineInput: {
    minHeight: 56,
    maxHeight: 120,
  },
  errorText: {
    color: "#ff4d4f",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
