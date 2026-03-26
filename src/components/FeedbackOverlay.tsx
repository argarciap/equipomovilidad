/**
 * FeedbackOverlay — overlay that shows the result of a clock operation.
 *
 * - Success: green background, ✓ icon, "Fichaje registrado" with time
 * - Error: red background, ✗ icon, error message
 * - Auto-closes after autoCloseMs (default 3000ms)
 * - Manual close on press via onDismiss
 *
 * Requisitos: 7.1, 7.2, 7.3, 7.4
 */

import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { ClockResult } from '../types/clock';

export interface FeedbackOverlayProps {
  result: ClockResult;
  onDismiss: () => void;
  autoCloseMs?: number;
}

const DEFAULT_AUTO_CLOSE_MS = 3000;

function formatTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function FeedbackOverlay({
  result,
  onDismiss,
  autoCloseMs = DEFAULT_AUTO_CLOSE_MS,
}: FeedbackOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, autoCloseMs);
    return () => clearTimeout(timer);
  }, [onDismiss, autoCloseMs]);

  const isSuccess = result.success;

  const timeDisplay = isSuccess && result.record
    ? formatTime(result.record.clock_out ?? result.record.clock_in)
    : null;

  return (
    <Modal transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
        accessibilityLabel={
          isSuccess ? 'Fichaje registrado correctamente' : 'Error en el fichaje'
        }
        accessibilityRole="alert"
      >
        <View
          style={[
            styles.card,
            isSuccess ? styles.cardSuccess : styles.cardError,
          ]}
        >
          <Text style={styles.icon}>{isSuccess ? '✓' : '✗'}</Text>
          <Text style={styles.message}>
            {isSuccess
              ? `Fichaje registrado${timeDisplay ? ` a las ${timeDisplay}` : ''}`
              : result.error?.message ?? 'Error desconocido'}
          </Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '75%',
    maxWidth: 300,
  },
  cardSuccess: {
    backgroundColor: '#34C759',
  },
  cardError: {
    backgroundColor: '#FF3B30',
  },
  icon: {
    fontSize: 48,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
