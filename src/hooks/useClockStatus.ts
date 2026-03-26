/**
 * Hook that manages the current clock status for a worker.
 *
 * On mount, fetches today's records via the API client and uses
 * `determineClockStatus` to derive the worker's current state.
 * Exposes status, currentRecord, todaySummary, and a refresh function.
 *
 * Requisitos: 1.1, 1.2, 1.3, 1.6
 */

import { useCallback, useEffect, useState } from 'react';
import type {
  ClockStatus,
  ClockStatusState,
  AttendanceRecord,
  TodaySummary,
  AttendanceApiClient,
} from '../types/clock';
import { determineClockStatus } from '../services/AttendanceApiClient';

export function useClockStatus(
  userId: string,
  apiClient: AttendanceApiClient,
): ClockStatusState {
  const [status, setStatus] = useState<ClockStatus>('LOADING');
  const [currentRecord, setCurrentRecord] = useState<AttendanceRecord | null>(null);
  const [todaySummary, setTodaySummary] = useState<TodaySummary | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus('LOADING');
      const summary = await apiClient.getTodayRecords(userId);
      const derived = determineClockStatus(summary, userId);
      setTodaySummary(summary);
      setCurrentRecord(derived.currentRecord);
      setStatus(derived.status);
    } catch {
      setStatus('ERROR');
      setCurrentRecord(null);
      setTodaySummary(null);
    }
  }, [userId, apiClient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, currentRecord, todaySummary, refresh };
}
