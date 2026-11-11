import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '../ui/Button';

interface AnythingElseOptionsProps {
  onYes: () => void;
  onNo: () => void;
}

export function AnythingElseOptions({ onYes, onNo }: AnythingElseOptionsProps) {
  return (
    <View style={styles.optionsContainer}>
      <Button
        title="Yes, I want to add something"
        variant="secondary"
        onPress={onYes}
      />
      <Button
        title="No, that's all"
        onPress={onNo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 12,
  },
});
