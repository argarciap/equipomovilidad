/**
 * Hook that executes clock-in / clock-out operations.
 *
 * Builds a ClockRequest from the authenticated user, captures GPS
 * coordinates when the GPS method is selected, and delegates to the
 * API client. Prevents duplicate punches via an `isPunching` guard.
 *
 * Requisitos: 1.4, 1.5, 4.2, 4.3, 6.1, 6.2, 10.1, 10.2, 10.3
 */

import { useCallback, useRef, useState } from 'react';
import type {
  ClockMethod,
  ClockPunchState,
  ClockRequest,
  ClockResult,
  ClockStatus,
  AttendanceApiClient,
} from '../types/clock';
import { GPSServiceImpl } from '../services/GPSService';

const gpsService = new GPSServiceImpl();

export function useClockPunch(
  userId: string,
  currentStatus: ClockStatus,
  apiClient: AttendanceApiClient,
  onSuccess: () => void,
): ClockPunchState {
  const [isPunching, setIsPunching] = useState(false);
  const punchingRef = useRef(false);

  const punch = useCallback(
    async (method: ClockMethod): Promise<ClockResult> => {
      if (punchingRef.current) {
        return {
          success: false,
          error: { code: 'BUSY', message: 'Operación en curso' },
        };
      }

      punchingRef.current = true;
      setIsPunching(true);

      try {
        const request: ClockRequest = {
          worker_id: userId,
          method,
        };

        if (method === 'GPS') {
          const location = await gpsService.getCurrentPosition();
          request.latitude = location.latitude;
          request.longitude = location.longitude;
        }

        let record;
        if (currentStatus === 'CLOCKED_OUT') {
          record = await apiClient.clockIn(request);
        } else {
          record = await apiClient.clockOut(request);
        }

        onSuccess();
        return { success: true, record };
      } catch (error: any) {
        return {
          success: false,
          error: {
            code: error.code ?? 'UNKNOWN_ERROR',
            message: error.message ?? 'Error desconocido al fichar',
          },
        };
      } finally {
        punchingRef.current = false;
        setIsPunching(false);
      }
    },
    [userId, currentStatus, apiClient, onSuccess],
  );

  return { isPunching, punch };
}
