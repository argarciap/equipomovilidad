/**
 * GPS service implementation.
 *
 * Encapsulates @react-native-community/geolocation for location capture.
 * - getCurrentPosition: enableHighAccuracy with 10s timeout.
 * - isAvailable: checks permissions per platform.
 *
 * Requisitos: 4.1, 4.2, 4.3, 4.5, 4.6
 */

import type { GPSService, GeoLocation } from '../types/clock';
import Geolocation from '@react-native-community/geolocation';
import { Platform, PermissionsAndroid } from 'react-native';

export class GPSServiceImpl implements GPSService {
  /**
   * Obtains the current device position with high accuracy.
   * Throws a descriptive error on failure (timeout, permissions, service disabled).
   */
  async getCurrentPosition(): Promise<GeoLocation> {
    return new Promise<GeoLocation>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          switch (error.code) {
            case 1:
              reject(new Error('Permisos de ubicación denegados. Activa los permisos en ajustes.'));
              break;
            case 2:
              reject(new Error('Servicio de ubicación no disponible. Activa la ubicación del dispositivo.'));
              break;
            case 3:
              reject(new Error('No se pudo obtener la ubicación. Inténtalo de nuevo o usa otro método.'));
              break;
            default:
              reject(new Error(`Error de GPS: ${error.message}`));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
        },
      );
    });
  }

  /**
   * Checks whether GPS is available and permissions are granted.
   * On Android, checks ACCESS_FINE_LOCATION permission.
   * On iOS, returns true (permissions are handled at request time).
   */
  async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted;
    }

    // iOS: permissions are requested when getCurrentPosition is called
    return true;
  }
}
