/**
 * QRScannerScreen — full-screen camera modal for scanning QR codes.
 *
 * Uses react-native-vision-camera for camera access and QR code detection.
 * Validates scanned payload with validateQRPayload before accepting.
 * If invalid, shows error and allows retry without closing.
 * If permissions denied, calls onError with message and closes.
 *
 * Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { validateQRPayload } from '../services/AttendanceApiClient';

// react-native-vision-camera does not support web — lazy import only on native
let Camera: any = null;
let useCameraDevice: any = () => null;
let useCodeScanner: any = () => ({});

if (Platform.OS !== 'web') {
  try {
    const visionCamera = require('react-native-vision-camera');
    Camera = visionCamera.Camera;
    useCameraDevice = visionCamera.useCameraDevice;
    useCodeScanner = visionCamera.useCodeScanner;
  } catch {
    // Module not available — will show fallback UI
  }
}

export interface QRScannerScreenProps {
  visible: boolean;
  onScanned: (data: string) => void;
  onClose: () => void;
  onError: (message: string) => void;
}

export function QRScannerScreen({
  visible,
  onScanned,
  onClose,
  onError,
}: QRScannerScreenProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const processedRef = useRef(false);

  const device = useCameraDevice('back');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setScanError(null);
      processedRef.current = false;
      setHasPermission(null);
      requestPermission();
    }
  }, [visible]);

  async function requestPermission() {
    try {
      const status = await Camera.requestCameraPermission();
      const granted = status === 'granted';
      setHasPermission(granted);
      if (!granted) {
        onError('Permisos de cámara denegados. Activa los permisos en ajustes.');
        onClose();
      }
    } catch {
      onError('Permisos de cámara denegados. Activa los permisos en ajustes.');
      onClose();
    }
  }

  const handleCodeScanned = useCallback(
    (codes: { value?: string }[]) => {
      if (processedRef.current) return;

      const qrCode = codes.find((c) => c.value);
      if (!qrCode?.value) return;

      const data = qrCode.value;
      const result = validateQRPayload(data);

      if (result.valid) {
        processedRef.current = true;
        onScanned(data);
        onClose();
      } else {
        setScanError(result.errorMessage ?? 'Código QR no válido');
      }
    },
    [onScanned, onClose],
  );

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: handleCodeScanned,
  });

  const handleRetry = () => {
    setScanError(null);
    processedRef.current = false;
  };

  if (!visible) return null;

  // Web fallback — camera not supported
  if (Platform.OS === 'web') {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityLabel="Cerrar escáner QR" accessibilityRole="button">
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.centered}>
            <Text style={styles.errorText}>El escáner QR no está disponible en web. Usa la app nativa en tu dispositivo.</Text>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Cerrar escáner QR"
          accessibilityRole="button"
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Camera or fallback */}
        {hasPermission && device ? (
          <Camera
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={visible && !processedRef.current}
            codeScanner={codeScanner}
          />
        ) : hasPermission && !device ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              Cámara no disponible en este dispositivo.
            </Text>
          </View>
        ) : hasPermission === null ? (
          <View style={styles.centered}>
            <Text style={styles.loadingText}>Solicitando permisos…</Text>
          </View>
        ) : null}

        {/* Scan area overlay */}
        {hasPermission && device && (
          <View style={styles.overlayContainer} pointerEvents="none">
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.scanArea} />
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
          </View>
        )}

        {/* Scan instruction */}
        {hasPermission && device && !scanError && (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Apunta al código QR de la obra
            </Text>
          </View>
        )}

        {/* Error message with retry */}
        {scanError && (
          <View style={styles.errorContainer}>
            <Text style={styles.scanErrorText}>{scanError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              accessibilityLabel="Reintentar escaneo"
              accessibilityRole="button"
            >
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}


const OVERLAY_COLOR = 'rgba(0, 0, 0, 0.55)';
const SCAN_AREA_SIZE = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 12,
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: OVERLAY_COLOR,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  scanErrorText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
