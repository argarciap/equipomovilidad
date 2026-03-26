import type { IApiClient } from './client.interface';
import type {
  ClockInRequest,
  ClockOutRequest,
  AttendanceRecord,
  RecordsQueryParams,
  PaginatedAttendanceRecords,
  TodayQueryParams,
  TodaySummary,
  CreateIncidentRequest,
  AttendanceIncident,
  User,
  ClockMethod,
} from './types';
import { ApiError } from './errors';
import mockData from '../../mock-data.json';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Configurable simulated network delay in milliseconds */
const MOCK_DELAY_MS = 300;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Simple UUID v4 generator (no external dependency) */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Returns a promise that resolves after MOCK_DELAY_MS */
function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

/** Returns today's date as YYYY-MM-DD */
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns current ISO-8601 timestamp */
function nowISO(): string {
  return new Date().toISOString();
}

/** Find a worker in mock-data by id */
function findWorker(workerId: string) {
  return mockData.workers.find((w) => w.id === workerId);
}

// ---------------------------------------------------------------------------
// MockApiClient
// ---------------------------------------------------------------------------

/**
 * Mock implementation of IApiClient.
 *
 * - Returns realistic data sourced from mock-data.json
 * - Maintains in-memory state for open attendance records
 * - Enforces business rules (409 duplicate clock-in, 404 missing record, 400 validation)
 * - Adds a configurable delay to simulate network latency
 */
export class MockApiClient implements IApiClient {
  /** Open attendance records keyed by worker_id */
  private openRecords: Map<string, AttendanceRecord> = new Map();

  // -----------------------------------------------------------------------
  // clockIn  (Tasks 3.1 & 3.2)
  // -----------------------------------------------------------------------

  async clockIn(request: ClockInRequest): Promise<AttendanceRecord> {
    await delay();

    // --- Validation (Req 5.3) ---
    if (!request.worker_id || !request.method) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'worker_id and method are required',
        400,
        [
          ...(!request.worker_id
            ? [{ field: 'worker_id', message: 'worker_id is required' }]
            : []),
          ...(!request.method
            ? [{ field: 'method', message: 'method is required' }]
            : []),
        ],
      );
    }

    // --- Business rule: no duplicate open record (Req 5.1) ---
    if (this.openRecords.has(request.worker_id)) {
      throw new ApiError(
        'ALREADY_CLOCKED_IN',
        `Worker ${request.worker_id} already has an open record`,
        409,
      );
    }

    // --- Build record ---
    const worker = findWorker(request.worker_id);
    const workerName = worker
      ? `${worker.first_name} ${worker.last_name}`
      : 'Unknown Worker';

    const now = nowISO();

    const record: AttendanceRecord = {
      id: generateUUID(),
      worker_id: request.worker_id,
      worker_name: workerName,
      date: todayISO(),
      clock_in: now,
      clock_out: null,
      clock_in_method: request.method,
      clock_out_method: null,
      clock_in_location:
        request.method === 'GPS' &&
        request.latitude !== undefined &&
        request.longitude !== undefined
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

  // -----------------------------------------------------------------------
  // clockOut  (Task 3.3)
  // -----------------------------------------------------------------------

  async clockOut(request: ClockOutRequest): Promise<AttendanceRecord> {
    await delay();

    // --- Business rule: must have open record (Req 5.2) ---
    const openRecord = this.openRecords.get(request.worker_id);
    if (!openRecord) {
      throw new ApiError(
        'NO_OPEN_RECORD',
        `No open record found for worker ${request.worker_id}`,
        404,
      );
    }

    const now = nowISO();

    // Calculate total hours
    const clockInMs = new Date(openRecord.clock_in).getTime();
    const clockOutMs = new Date(now).getTime();
    const totalHours =
      Math.round(((clockOutMs - clockInMs) / (1000 * 60 * 60)) * 100) / 100;

    const closedRecord: AttendanceRecord = {
      ...openRecord,
      clock_out: now,
      clock_out_method: request.method,
      clock_out_location:
        request.method === 'GPS' &&
        request.latitude !== undefined &&
        request.longitude !== undefined
          ? { latitude: request.latitude, longitude: request.longitude }
          : null,
      total_hours: totalHours,
      status: 'CLOSED',
    };

    this.openRecords.delete(request.worker_id);
    return closedRecord;
  }

  // -----------------------------------------------------------------------
  // getRecords  (Task 3.4)
  // -----------------------------------------------------------------------

  async getRecords(
    params: RecordsQueryParams,
  ): Promise<PaginatedAttendanceRecords> {
    await delay();

    const page = params.page ?? 0;
    const size = params.size ?? 20;

    // Generate sample records from mock workers
    const allRecords: AttendanceRecord[] = mockData.workers.map(
      (worker, idx) => {
        const clockIn = new Date(
          `${params.date_from}T0${7 + idx}:00:00.000Z`,
        );
        const clockOut = new Date(clockIn.getTime() + 8 * 60 * 60 * 1000);

        return {
          id: generateUUID(),
          worker_id: worker.id,
          worker_name: `${worker.first_name} ${worker.last_name}`,
          date: params.date_from,
          clock_in: clockIn.toISOString(),
          clock_out: clockOut.toISOString(),
          clock_in_method: 'GPS' as ClockMethod,
          clock_out_method: 'GPS' as ClockMethod,
          clock_in_location: { latitude: 40.4168, longitude: -3.7038 },
          clock_out_location: { latitude: 40.4168, longitude: -3.7038 },
          total_hours: 8,
          status: 'CLOSED' as const,
          modified_by: null,
          modification_reason: null,
          created_at: clockIn.toISOString(),
        };
      },
    );

    // Filter by worker_id if provided
    const filtered = params.worker_id
      ? allRecords.filter((r) => r.worker_id === params.worker_id)
      : allRecords;

    // Paginate
    const start = page * size;
    const content = filtered.slice(start, start + size);

    return {
      content,
      page,
      size,
      total_elements: filtered.length,
      total_pages: Math.max(1, Math.ceil(filtered.length / size)),
    };
  }

  // -----------------------------------------------------------------------
  // getTodayRecords  (Task 3.4)
  // -----------------------------------------------------------------------

  async getTodayRecords(_params?: TodayQueryParams): Promise<TodaySummary> {
    await delay();

    const today = todayISO();
    const now = nowISO();

    // Build one record per worker for today
    const records: AttendanceRecord[] = mockData.workers.map((worker, idx) => {
      const clockIn = new Date(`${today}T0${7 + idx}:00:00.000Z`);
      return {
        id: generateUUID(),
        worker_id: worker.id,
        worker_name: `${worker.first_name} ${worker.last_name}`,
        date: today,
        clock_in: clockIn.toISOString(),
        clock_out: null,
        clock_in_method: 'GPS' as ClockMethod,
        clock_out_method: null,
        clock_in_location: { latitude: 40.4168, longitude: -3.7038 },
        clock_out_location: null,
        total_hours: null,
        status: 'OPEN' as const,
        modified_by: null,
        modification_reason: null,
        created_at: now,
      };
    });

    return {
      date: today,
      total_workers_present: records.length,
      total_workers_absent: 0,
      records,
    };
  }

  // -----------------------------------------------------------------------
  // createIncident  (Task 3.4)
  // -----------------------------------------------------------------------

  async createIncident(
    request: CreateIncidentRequest,
  ): Promise<AttendanceIncident> {
    await delay();

    // --- Validation (Req 5.4) ---
    const missing: Array<{ field: string; message: string }> = [];
    if (!request.worker_id)
      missing.push({ field: 'worker_id', message: 'worker_id is required' });
    if (!request.type)
      missing.push({ field: 'type', message: 'type is required' });
    if (!request.description)
      missing.push({
        field: 'description',
        message: 'description is required',
      });
    if (!request.affected_date)
      missing.push({
        field: 'affected_date',
        message: 'affected_date is required',
      });

    if (missing.length > 0) {
      throw new ApiError(
        'VALIDATION_ERROR',
        'Missing required fields',
        400,
        missing,
      );
    }

    const worker = findWorker(request.worker_id);
    const workerName = worker
      ? `${worker.first_name} ${worker.last_name}`
      : 'Unknown Worker';

    const now = nowISO();

    return {
      id: generateUUID(),
      worker_id: request.worker_id,
      worker_name: workerName,
      type: request.type,
      description: request.description,
      affected_date: request.affected_date,
      proposed_clock_in: request.proposed_clock_in ?? null,
      proposed_clock_out: request.proposed_clock_out ?? null,
      status: 'PENDING',
      resolution_notes: null,
      resolved_by: null,
      created_at: now,
      resolved_at: null,
    };
  }

  // -----------------------------------------------------------------------
  // getMe  (Task 3.4)
  // -----------------------------------------------------------------------

  async getMe(): Promise<User> {
    await delay();

    // Return Pedro Fernández (TRABAJADOR) from mock-data.json
    const pedro = mockData.users.find((u) => u.role === 'TRABAJADOR')!;
    const now = nowISO();

    return {
      id: pedro.id,
      external_id: pedro.external_id,
      email: pedro.email,
      first_name: pedro.first_name,
      last_name: pedro.last_name,
      role: {
        id: generateUUID(),
        name: 'TRABAJADOR',
        description: 'Trabajador de obra con permisos básicos de fichaje',
        permissions: [
          'clock:in',
          'clock:out',
          'records:own',
          'incidents:create',
          'profile:read',
        ],
      },
      active: true,
      last_login_at: now,
      created_at: '2024-01-15T10:00:00.000Z',
      updated_at: now,
    };
  }
}
