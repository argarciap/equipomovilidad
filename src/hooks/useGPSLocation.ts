/**
 * Hook that wraps GPSService as a React hook.
 *
 * On mount, checks GPS availability. Exposes `getLocation` to
 * capture the current position and `isAvailable` for UI gating.
 *
 * Requisitos: 4.1, 4.2
 */

import { useCallback, useEffect, useState } from 'react';
import type { GeoLocation } from '../types/clock';
import { GPSServiceImpl } from '../services/GPSService';

const gpsService = new GPSServiceImpl();

export function useGPSLocation(): {
  getLocation: () => Promise<GeoLocation>;
  isAvailable: boolean;
} {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    gpsService.isAvailable().then(setIsAvailable).catch(() => setIsAvailable(false));
  }, []);

  const getLocation = useCallback(async (): Promise<GeoLocation> => {
    return gpsService.getCurrentPosition();
  }, []);

  return { getLocation, isAvailable };
}
