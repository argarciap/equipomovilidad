import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography, borderRadius } from '../theme';
import { AllStatus } from '../types/incidents';

interface StatusBadgeProps {
  status: AllStatus;
  label?: string;
}

const STATUS_COLOR_MAP: Record<AllStatus, { bg: string; text: string }> = {
  PENDING: { bg: colors.statusBackground.pending, text: colors.status.pending },
  RESOLVED: { bg: colors.statusBackground.resolved, text: colors.status.resolved },
  REJECTED: { bg: colors.statusBackground.rejected, text: colors.status.rejected },
  OPEN: { bg: colors.statusBackground.open, text: colors.status.open },
  CLOSED: { bg: colors.statusBackground.resolved, text: colors.status.resolved },
  INCIDENT: { bg: colors.statusBackground.pending, text: colors.status.pending },
};

const DEFAULT_LABELS: Record<AllStatus, string> = {
  PENDING: 'Pendiente',
  RESOLVED: 'Resuelta',
  REJECTED: 'Rechazada',
  OPEN: 'Abierto',
  CLOSED: 'Cerrado',
  INCIDENT: 'Incidencia',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const displayLabel = label ?? DEFAULT_LABELS[status];
  const colorConfig = STATUS_COLOR_MAP[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colorConfig.bg },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Estado: ${displayLabel}`}
    >
      <Text style={[styles.text, { color: colorConfig.text }]}>
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.small,
    fontWeight: '600',
  },
});
