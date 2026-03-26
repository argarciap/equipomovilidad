/**
 * StatusIndicator — visual indicator of the worker's current clock status.
 *
 * - CLOCKED_IN: green dot + "Fichado" + clock_in time (HH:MM)
 * - CLOCKED_OUT: gray dot + "No fichado"
 * - LOADING: ActivityIndicator + "Consultando estado..."
 * - ERROR: error text "Error al consultar estado"
 *
 * Requisitos: 1.2, 1.3, 1.6
 */

import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import type { ClockStatus, AttendanceRecord } from '../types/clock';

export interface StatusIndicatorProps {
  status: ClockStatus;
  record: AttendanceRecord | null;
}

function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function StatusIndicator({ status, record }: StatusIndicatorProps) {
  if (status === 'LOADING') {
    return (
      <View
        style={styles.container}
        accessibilityLabel="Consultando estado"
        accessibilityRole="text"
      >
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Consultando estado...</Text>
      </View>
    );
  }

  if (status === 'ERROR') {
    return (
      <View
        style={styles.container}
        accessibilityLabel="Error al consultar estado"
        accessibilityRole="alert"
      >
        <Text style={styles.errorText}>Error al consultar estado</Text>
      </View>
    );
  }

  if (status === 'CLOCKED_IN' && record) {
    const timeStr = formatTime(record.clock_in);
    return (
      <View
        style={styles.container}
        accessibilityLabel={`Fichado desde las ${timeStr}`}
        accessibilityRole="text"
      >
        <View style={[styles.dot, styles.dotGreen]} />
        <Text style={styles.statusText}>Fichado</Text>
        <Text style={styles.timeText}>{timeStr}</Text>
      </View>
    );
  }

  // CLOCKED_OUT (default)
  return (
    <View
      style={styles.container}
      accessibilityLabel="No fichado"
      accessibilityRole="text"
    >
      <View style={[styles.dot, styles.dotGray]} />
      <Text style={styles.statusText}>No fichado</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dotGreen: {
    backgroundColor: '#34C759',
  },
  dotGray: {
    backgroundColor: '#8E8E93',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  timeText: {
    fontSize: 14,
    color: '#636366',
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#636366',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
  },
});
