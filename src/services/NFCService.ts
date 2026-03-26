/**
 * NFC service implementation.
 *
 * Encapsulates react-native-nfc-manager for tag reading.
 * - readTag: starts NFC session, reads NDEF tag, extracts payload, cleans up. 30s timeout.
 * - isAvailable: checks NFC hardware support.
 * - cancelRead: cancels an in-progress NFC technology request.
 *
 * Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import type { NFCService } from '../types/clock';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

const NFC_READ_TIMEOUT_MS = 30_000;

export class NFCServiceImpl implements NFCService {
  /**
   * Starts an NFC session, requests NDEF technology, reads the tag,
   * extracts the payload as a string, and cleans up.
   * Times out after 30 seconds.
   */
  async readTag(): Promise<string> {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      const result = await Promise.race<string>([
        this.performRead(),
        new Promise<string>((_resolve, reject) => {
          timeoutId = setTimeout(() => {
            this.cancelRead();
            reject(new Error('Tiempo de lectura NFC agotado. Inténtalo de nuevo.'));
          }, NFC_READ_TIMEOUT_MS);
        }),
      ]);

      return result;
    } finally {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Checks whether the device supports NFC hardware.
   */
  async isAvailable(): Promise<boolean> {
    return NfcManager.isSupported();
  }

  /**
   * Cancels an in-progress NFC technology request.
   */
  cancelRead(): void {
    NfcManager.cancelTechnologyRequest().catch(() => {
      // Swallow — cancel may fail if no session is active
    });
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async performRead(): Promise<string> {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();

      if (!tag?.ndefMessage || tag.ndefMessage.length === 0) {
        throw new Error('No se pudo leer la etiqueta NFC. Acerca el dispositivo de nuevo.');
      }

      const ndefRecord = tag.ndefMessage[0];
      const payload = Ndef.text.decodePayload(
        new Uint8Array(ndefRecord.payload),
      );

      if (!payload) {
        throw new Error('No se pudo leer la etiqueta NFC. Acerca el dispositivo de nuevo.');
      }

      return payload;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('No se pudo leer la etiqueta NFC. Acerca el dispositivo de nuevo.');
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {
        // Cleanup — swallow errors
      });
    }
  }
}
