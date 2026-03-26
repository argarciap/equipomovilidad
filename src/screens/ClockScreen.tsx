/**
 * Pantalla principal de Fichaje (Clock-In / Clock-Out).
 *
 * Muestra el estado actual del trabajador, permite seleccionar método
 * de fichaje, ejecuta la operación y muestra feedback visual.
 *
 * Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.5, 9.1–9.6
 */

import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { useClockStatus } from '../hooks/useClockStatus';
import { useClockPunch } from '../hooks/useClockPunch';
import { StatusIndicator } from '../components/StatusIndicator';
import { MethodSelectorModal } from '../components/MethodSelectorModal';
import { FeedbackOverlay } from '../components/FeedbackOverlay';
import { QRScannerScreen } from '../components/QRScannerScreen';
import { MockAttendanceClient } from '../services/MockAttendanceClient';
import { NFCServiceImpl } from '../services/NFCService';
import type { ClockMethod, ClockResult } from '../types/clock';

// Singleton API client — persists across re-renders
const apiClient = new MockAttendanceClient();

/**
 * Maps known error codes to user-facing Spanish messages.
 */
function getErrorMessage(error: { code: string; message: string }): string {
  switch (error.code) {
    case 'ALREADY_CLOCKED_IN':
      return 'Ya tienes una entrada abierta. Registra tu salida primero.';
    case 'NO_OPEN_RECORD':
      return 'No hay entrada abierta para registrar salida.';
    case 'NETWORK_ERROR':
      return 'Sin conexión. Verifica tu conexión a internet.';
    case 'TIMEOUT':
      return 'La operación tardó demasiado. Inténtalo de nuevo.';
    default:
      return error.message;
  }
}

/**
 * Returns true for error codes that indicate a stale local status (409/404).
 * After these errors we refresh status to re-sync with the server.
 */
function shouldRefreshAfterError(code: string): boolean {
  return code === 'ALREADY_CLOCKED_IN' || code === 'NO_OPEN_RECORD';
}

export function ClockScreen() {
  const { user } = useAuth();
  const { status, currentRecord, refresh } = useClockStatus(user!.id, apiClient);
  const { isPunching, punch } = useClockPunch(user!.id, status, apiClient, refresh);

  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [feedback, setFeedback] = useState<ClockResult | null>(null);

  const handlePunchResult = useCallback(
    (result: ClockResult) => {
      if (!result.success && result.error) {
        // Rewrite the message to the localised version
        const localised = getErrorMessage(result.error);
        setFeedback({
          ...result,
          error: { ...result.error, message: localised },
        });

        if (shouldRefreshAfterError(result.error.code)) {
          refresh();
        }
      } else {
        setFeedback(result);
      }
    },
    [refresh],
  );

  // ---- Method selection handler ----
  const handleMethodSelected = useCallback(
    async (method: ClockMethod) => {
      setShowMethodSelector(false);

      if (method === 'QR') {
        setShowQRScanner(true);
        return;
      }

      if (method === 'NFC') {
        try {
          const nfcService = new NFCServiceImpl();
          await nfcService.readTag();
        } catch {
          // NFC read failed — surface as error feedback
          setFeedback({
            success: false,
            error: {
              code: 'NFC_ERROR',
              message: 'No se pudo leer la etiqueta NFC. Acerca el dispositivo de nuevo.',
            },
          });
          return;
        }
      }

      // GPS and MANUAL punch directly (GPS coords captured inside useClockPunch)
      const result = await punch(method);
      handlePunchResult(result);
    },
    [punch, handlePunchResult],
  );

  // ---- QR scanner callbacks ----
  const handleQRScanned = useCallback(
    async (data: string) => {
      setShowQRScanner(false);
      const result = await punch('QR');
      handlePunchResult(result);
    },
    [punch, handlePunchResult],
  );

  const handleQRError = useCallback((message: string) => {
    setShowQRScanner(false);
    setFeedback({
      success: false,
      error: { code: 'QR_ERROR', message },
    });
  }, []);

  const handleQRClose = useCallback(() => {
    setShowQRScanner(false);
  }, []);

  // ---- Derived UI state ----
  const actionLabel =
    status === 'CLOCKED_IN' ? 'Fichar Salida' : 'Fichar Entrada';
  const isDisabled = isPunching || status === 'LOADING';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Status indicator */}
        <StatusIndicator status={status} record={currentRecord} />

        {/* Main action button */}
        <TouchableOpacity
          style={[styles.actionButton, isDisabled && styles.actionButtonDisabled]}
          onPress={() => setShowMethodSelector(true)}
          disabled={isDisabled}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text style={[styles.actionText, isDisabled && styles.actionTextDisabled]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Method selector modal */}
      <MethodSelectorModal
        visible={showMethodSelector}
        onSelect={handleMethodSelected}
        onClose={() => setShowMethodSelector(false)}
      />

      {/* QR scanner */}
      <QRScannerScreen
        visible={showQRScanner}
        onScanned={handleQRScanned}
        onClose={handleQRClose}
        onError={handleQRError}
      />

      {/* Feedback overlay */}
      {feedback && (
        <FeedbackOverlay
          result={feedback}
          onDismiss={() => setFeedback(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  actionButton: {
    marginTop: 32,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    backgroundColor: '#A2C4E0',
  },
  actionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionTextDisabled: {
    color: '#E0E0E0',
  },
});
