// =============================================================================
// Union Types — Attendance Service
// =============================================================================

/** Método de fichaje utilizado */
export type ClockMethod = 'GPS' | 'QR' | 'NFC' | 'MANUAL';

/** Estado de un registro de asistencia */
export type RecordStatus = 'OPEN' | 'CLOSED' | 'INCIDENT';

/** Tipo de incidencia de fichaje */
export type IncidentType =
  | 'OLVIDO_ENTRADA'
  | 'OLVIDO_SALIDA'
  | 'CORRECCION_HORA'
  | 'FICHAJE_DUPLICADO'
  | 'OTRO';

/** Estado de una incidencia */
export type IncidentStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

// =============================================================================
// Union Types — Auth Service
// =============================================================================

/** Nombre de rol de usuario */
export type RoleName =
  | 'ADMIN'
  | 'JEFE_OBRA'
  | 'ENCARGADO'
  | 'TRABAJADOR'
  | 'PREVENCION'
  | 'SOLO_LECTURA';

// =============================================================================
// Interfaces — Attendance Service
// =============================================================================

/** Ubicación geográfica (nullable en el schema OpenAPI) */
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

/** Request para registrar entrada */
export interface ClockInRequest {
  worker_id: string;
  method: ClockMethod;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

/** Request para registrar salida */
export interface ClockOutRequest {
  worker_id: string;
  method: ClockMethod;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

/** Registro de asistencia completo */
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

/** Request para corregir un registro de asistencia */
export interface UpdateRecordRequest {
  clock_in?: string;
  clock_out?: string;
  reason: string;
}

/** Resumen del día actual */
export interface TodaySummary {
  date: string;
  total_workers_present: number;
  total_workers_absent: number;
  records: AttendanceRecord[];
}

/** Incidencia de fichaje */
export interface AttendanceIncident {
  id: string;
  worker_id: string;
  worker_name: string;
  type: IncidentType;
  description: string;
  affected_date: string;
  proposed_clock_in: string | null;
  proposed_clock_out: string | null;
  status: IncidentStatus;
  resolution_notes: string | null;
  resolved_by: string | null;
  created_at: string;
  resolved_at: string | null;
}

/** Request para crear una incidencia */
export interface CreateIncidentRequest {
  worker_id: string;
  type: IncidentType;
  description: string;
  affected_date: string;
  proposed_clock_in?: string;
  proposed_clock_out?: string;
}

/** Request para resolver una incidencia */
export interface ResolveIncidentRequest {
  resolution: 'APPROVE' | 'REJECT';
  notes?: string;
}

/** Desglose diario de horas */
export interface DailyBreakdown {
  date: string;
  hours: number;
  is_overtime: boolean;
}

/** Resumen de horas de un trabajador */
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
  daily_breakdown: DailyBreakdown[];
}

/** Resumen de horas por equipo */
export interface TeamHoursSummary {
  team_id: string;
  team_name: string;
  period_from: string;
  period_to: string;
  total_hours: number;
  total_overtime_hours: number;
  average_hours_per_worker: number;
  workers_summary: WorkerHoursSummary[];
}

// =============================================================================
// Pagination — Attendance Service
// =============================================================================

/** Respuesta paginada de registros de asistencia */
export interface PaginatedAttendanceRecords {
  content: AttendanceRecord[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

/** Respuesta paginada de incidencias */
export interface PaginatedIncidents {
  content: AttendanceIncident[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

// =============================================================================
// Query Params — Attendance Service
// =============================================================================

/** Parámetros de consulta para listar registros */
export interface RecordsQueryParams {
  worker_id?: string;
  team_id?: string;
  company_id?: string;
  date_from: string;
  date_to: string;
  status?: RecordStatus;
  page?: number;
  size?: number;
}

/** Parámetros de consulta para registros del día */
export interface TodayQueryParams {
  team_id?: string;
  company_id?: string;
}

// =============================================================================
// Interfaces — Auth Service
// =============================================================================

/** Rol de usuario */
export interface Role {
  id: string;
  name: RoleName;
  description: string;
  permissions: string[];
}

/** Usuario autenticado */
export interface User {
  id: string;
  external_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}
