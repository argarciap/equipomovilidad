import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Reintentar"
      >
        <Text style={styles.buttonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.base,
  },
  message: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
  },
});
