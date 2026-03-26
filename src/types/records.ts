// Tipos alineados con attendance-service.yaml — sección Records/Summary

import { RecordStatus } from './incidents';

export type ClockMethod = 'QR' | 'NFC' | 'MANUAL' | 'GPS';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface AttendanceRecord {
  id: string;
  worker_id: string;
  worker_name: string;
  date: string;
  clock_in: string;
  clock_out: string | null;
  clock_in_method: ClockMethod;
  clock_out_method: ClockMethod | null;
  clock_in_location: GeoLocation | null;
  clock_out_location: GeoLocation | null;
  total_hours: number | null;
  status: RecordStatus;
  modified_by: string | null;
  modification_reason: string | null;
  created_at: string;
}

export interface WorkerHoursSummary {
  worker_id: string;
  worker_name: string;
  period_from: string;
  period_to: string;
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  days_worked: number;
  days_absent: number;
  pending_incidents: number;
  daily_breakdown: Array<{
    date: string;
    hours: number;
    is_overtime: boolean;
  }>;
}

export interface ListRecordsParams {
  worker_id?: string;
  team_id?: string;
  date_from: string;
  date_to: string;
  status?: RecordStatus;
  page?: number;
  size?: number;
}
