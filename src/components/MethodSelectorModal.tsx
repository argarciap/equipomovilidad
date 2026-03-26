/**
 * MethodSelectorModal — modal that presents the four clock methods.
 *
 * Shows GPS (📍), QR (📷), NFC (📱), MANUAL (✋).
 * Hides NFC button if NFCServiceImpl.isAvailable() returns false.
 * Each button calls onSelect(method) and closes the modal.
 * Cancel button calls onClose.
 *
 * Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { ClockMethod } from '../types/clock';
import { NFCServiceImpl } from '../services/NFCService';

export interface MethodSelectorModalProps {
  visible: boolean;
  onSelect: (method: ClockMethod) => void;
  onClose: () => void;
}

interface MethodOption {
  method: ClockMethod;
  icon: string;
  label: string;
}

const METHOD_OPTIONS: MethodOption[] = [
  { method: 'GPS', icon: '📍', label: 'Ubicación GPS' },
  { method: 'QR', icon: '📷', label: 'Código QR' },
  { method: 'NFC', icon: '📱', label: 'Etiqueta NFC' },
  { method: 'MANUAL', icon: '✋', label: 'Manual' },
];

export function MethodSelectorModal({
  visible,
  onSelect,
  onClose,
}: MethodSelectorModalProps) {
  const [nfcAvailable, setNfcAvailable] = useState<boolean>(true);

  useEffect(() => {
    const nfcService = new NFCServiceImpl();
    nfcService.isAvailable().then(setNfcAvailable).catch(() => setNfcAvailable(false));
  }, []);

  const handleSelect = (method: ClockMethod) => {
    onSelect(method);
    onClose();
  };

  const visibleOptions = METHOD_OPTIONS.filter(
    (opt) => opt.method !== 'NFC' || nfcAvailable,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Selecciona método de fichaje</Text>

          {visibleOptions.map((opt) => (
            <TouchableOpacity
              key={opt.method}
              style={styles.methodButton}
              onPress={() => handleSelect(opt.method)}
              accessibilityLabel={`Fichar con ${opt.label}`}
              accessibilityRole="button"
            >
              <Text style={styles.methodIcon}>{opt.icon}</Text>
              <Text style={styles.methodLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            accessibilityLabel="Cancelar selección de método"
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 340,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 20,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
    marginBottom: 10,
  },
  methodIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
});
