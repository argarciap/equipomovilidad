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
} from './types';
import { ApiError } from './errors';
import { ATTENDANCE_API_URL, AUTH_API_URL } from './config';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a query-string from an object, omitting undefined values. */
function toQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

// ---------------------------------------------------------------------------
// RealApiClient
// ---------------------------------------------------------------------------

/**
 * Production implementation of IApiClient.
 *
 * - Uses native `fetch` (available in React Native)
 * - Injects JWT token via Authorization: Bearer header
 * - Parses backend error responses into ApiError instances
 */
export class RealApiClient implements IApiClient {
  private getToken: () => Promise<string> | string;

  constructor(getToken: () => Promise<string> | string) {
    this.getToken = getToken;
  }

  // -----------------------------------------------------------------------
  // Internal request helper
  // -----------------------------------------------------------------------

  private async request<T>(
    baseUrl: string,
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = await this.getToken();

    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers as Record<string, string> | undefined),
      },
    });

    if (!response.ok) {
      await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  private async handleError(response: Response): Promise<never> {
    let body: Record<string, unknown> | undefined;
    try {
      body = (await response.json()) as Record<string, unknown>;
    } catch {
      // response body is not JSON – fall through to generic error
    }

    const code = (body?.code as string) ?? 'UNKNOWN_ERROR';
    const message =
      (body?.message as string) ?? response.statusText ?? 'Request failed';
    const details = body?.details as
      | Array<{ field: string; message: string }>
      | undefined;

    throw new ApiError(code, message, response.status, details);
  }

  // -----------------------------------------------------------------------
  // IApiClient methods
  // -----------------------------------------------------------------------

  async clockIn(request: ClockInRequest): Promise<AttendanceRecord> {
    return this.request<AttendanceRecord>(
      ATTENDANCE_API_URL,
      '/records/clock-in',
      { method: 'POST', body: JSON.stringify(request) },
    );
  }

  async clockOut(request: ClockOutRequest): Promise<AttendanceRecord> {
    return this.request<AttendanceRecord>(
      ATTENDANCE_API_URL,
      '/records/clock-out',
      { method: 'POST', body: JSON.stringify(request) },
    );
  }

  async getRecords(
    params: RecordsQueryParams,
  ): Promise<PaginatedAttendanceRecords> {
    const qs = toQueryString(params as unknown as Record<string, unknown>);
    return this.request<PaginatedAttendanceRecords>(
      ATTENDANCE_API_URL,
      `/records${qs}`,
    );
  }

  async getTodayRecords(params?: TodayQueryParams): Promise<TodaySummary> {
    const qs = params
      ? toQueryString(params as unknown as Record<string, unknown>)
      : '';
    return this.request<TodaySummary>(
      ATTENDANCE_API_URL,
      `/records/today${qs}`,
    );
  }

  async createIncident(
    request: CreateIncidentRequest,
  ): Promise<AttendanceIncident> {
    return this.request<AttendanceIncident>(
      ATTENDANCE_API_URL,
      '/incidents',
      { method: 'POST', body: JSON.stringify(request) },
    );
  }

  async getMe(): Promise<User> {
    return this.request<User>(AUTH_API_URL, '/me');
  }
}
