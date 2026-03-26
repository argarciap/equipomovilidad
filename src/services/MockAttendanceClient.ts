/**
 * Mock implementation of AttendanceApiClient for development.
 *
 * Uses in-memory storage (Map) to simulate attendance records.
 * Worker names are sourced from mock-data.json for realistic responses.
 *
 * Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7
 */

import type {
  AttendanceApiClient,
  AttendanceRecord,
  ClockRequest,
  TodaySummary,
} from '../types/clock';

// ---------------------------------------------------------------------------
// Worker name map — IDs from mock-data.json (user IDs)
// ---------------------------------------------------------------------------

const MOCK_WORKER_NAMES: Record<string, string> = {
  'a1b2c3d4-0001-0001-0001-000000000001': 'Carlos Martínez',
  'a1b2c3d4-0001-0001-0001-000000000002': 'Ana García',
  'a1b2c3d4-0001-0001-0001-000000000003': 'Miguel López',
  'a1b2c3d4-0001-0001-0001-000000000004': 'Pedro Fernández',
};

// ---------------------------------------------------------------------------
// UUID helper
// ---------------------------------------------------------------------------

let uuidCounter = 0;

/** Simple UUID generator for mock purposes. */
function generateUUID(): string {
  uuidCounter += 1;
  const hex = uuidCounter.toString(16).padStart(12, '0');
  const ts = Date.now().toString(16).padStart(8, '0');
  return `${ts}-mock-4mock-9mck-${hex}`;
}

// ---------------------------------------------------------------------------
// Hour calculation helper
// ---------------------------------------------------------------------------

/** Calculate total hours between two ISO date-time strings. */
function calculateHours(clockIn: string, clockOut: string): number {
  const diffMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

// ---------------------------------------------------------------------------
// MockAttendanceClient
// ---------------------------------------------------------------------------

export class MockAttendanceClient implements AttendanceApiClient {
  private openRecords: Map<string, AttendanceRecord> = new Map();
  private closedRecords: AttendanceRecord[] = [];

  async clockIn(request: ClockRequest): Promise<AttendanceRecord> {
    if (this.openRecords.has(request.worker_id)) {
      throw {
        code: 'ALREADY_CLOCKED_IN',
        message: 'Ya existe una entrada abierta sin salida',
      };
    }

    const now = new Date().toISOString();

    const record: AttendanceRecord = {
      id: generateUUID(),
      worker_id: request.worker_id,
      worker_name: MOCK_WORKER_NAMES[request.worker_id] ?? 'Trabajador Mock',
      date: now.split('T')[0],
      clock_in: now,
      clock_out: null,
      clock_in_method: request.method,
      clock_out_method: null,
      clock_in_location:
        request.latitude != null && request.longitude != null
          ? { latitude: request.latitude, longitude: request.longitude }
          : null,
      clock_out_location: null,
      total_hours: null,
      status: 'OPEN',
      modified_by: null,
      modification_reason: null,
      created_at: now,
    };

    this.openRecords.set(request.worker_id, record);
    return record;
  }

  async clockOut(request: ClockRequest): Promise<AttendanceRecord> {
    const openRecord = this.openRecords.get(request.worker_id);
    if (!openRecord) {
      throw {
        code: 'NO_OPEN_RECORD',
        message: 'No hay entrada abierta para este trabajador',
      };
    }

    const now = new Date().toISOString();

    const closedRecord: AttendanceRecord = {
      ...openRecord,
      clock_out: now,
      clock_out_method: request.method,
      clock_out_location:
        request.latitude != null && request.longitude != null
          ? { latitude: request.latitude, longitude: request.longitude }
          : null,
      status: 'CLOSED',
      total_hours: calculateHours(openRecord.clock_in, now),
    };

    this.openRecords.delete(request.worker_id);
    this.closedRecords.push(closedRecord);
    return closedRecord;
  }

  async getTodayRecords(workerId: string): Promise<TodaySummary> {
    const today = new Date().toISOString().split('T')[0];
    const records: AttendanceRecord[] = [];

    // Include open record for this worker if it exists
    const openRecord = this.openRecords.get(workerId);
    if (openRecord) {
      records.push(openRecord);
    }

    // Include closed records for this worker from today
    for (const record of this.closedRecords) {
      if (record.worker_id === workerId && record.date === today) {
        records.push(record);
      }
    }

    return {
      date: today,
      total_workers_present: records.length,
      total_workers_absent: 0,
      records,
    };
  }
}
