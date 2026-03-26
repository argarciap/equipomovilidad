import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message }) => {
  return (
    <View
      style={styles.container}
      accessibilityLabel={message || 'Cargando'}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      {message ? (
        <Text style={styles.message}>{message}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
