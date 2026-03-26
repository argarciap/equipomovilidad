import {
  IncidentStatus,
  AttendanceIncident,
  CreateIncidentRequest,
  ResolveIncidentRequest,
  PaginatedResponse,
} from '../types/incidents';

export interface ListIncidentsParams {
  status?: IncidentStatus;
  date_from?: string;
  date_to?: string;
  page?: number;
  size?: number;
}

export interface IncidentService {
  listIncidents(params: ListIncidentsParams): Promise<PaginatedResponse<AttendanceIncident>>;
  createIncident(request: CreateIncidentRequest): Promise<AttendanceIncident>;
  getIncident(incidentId: string): Promise<AttendanceIncident>;
  resolveIncident(incidentId: string, request: ResolveIncidentRequest): Promise<AttendanceIncident>;
}
