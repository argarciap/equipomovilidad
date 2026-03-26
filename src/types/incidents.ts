// Tipos alineados con attendance-service.yaml — sección Incidents

export type IncidentType =
  | 'OLVIDO_ENTRADA'
  | 'OLVIDO_SALIDA'
  | 'CORRECCION_HORA'
  | 'FICHAJE_DUPLICADO'
  | 'OTRO';

export type IncidentStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export type RecordStatus = 'OPEN' | 'CLOSED' | 'INCIDENT';

export type AllStatus = IncidentStatus | RecordStatus;

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

export interface CreateIncidentRequest {
  worker_id: string;
  type: IncidentType;
  description: string;
  affected_date: string;
  proposed_clock_in?: string;
  proposed_clock_out?: string;
}

export type Resolution = 'APPROVE' | 'REJECT';

export interface ResolveIncidentRequest {
  resolution: Resolution;
  notes?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  total_elements: number;
  total_pages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}
