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

/**
 * Contrato del cliente API.
 * Tanto MockApiClient como RealApiClient implementan esta interfaz.
 */
export interface IApiClient {
  clockIn(request: ClockInRequest): Promise<AttendanceRecord>;
  clockOut(request: ClockOutRequest): Promise<AttendanceRecord>;
  getRecords(params: RecordsQueryParams): Promise<PaginatedAttendanceRecords>;
  getTodayRecords(params?: TodayQueryParams): Promise<TodaySummary>;
  createIncident(request: CreateIncidentRequest): Promise<AttendanceIncident>;
  getMe(): Promise<User>;
}
