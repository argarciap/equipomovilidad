import {
  AttendanceIncident,
  CreateIncidentRequest,
  ResolveIncidentRequest,
  PaginatedResponse,
  ApiError,
  IncidentStatus,
} from '../types/incidents';
import { IncidentService, ListIncidentsParams } from './IncidentService';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type DataScope = 'own' | 'team' | 'all';

function getDataScope(role: string): DataScope {
  switch (role) {
    case 'ADMIN':
    case 'JEFE_OBRA':
      return 'all';
    case 'ENCARGADO':
      return 'team';
    case 'TRABAJADOR':
      return 'own';
    case 'PREVENCION':
    case 'SOLO_LECTURA':
      return 'all';
    default:
      return 'own';
  }
}

interface WorkerInfo {
  id: string;
  team_id: string;
  first_name: string;
  last_name: string;
}

export class MockIncidentService implements IncidentService {
  private incidents: AttendanceIncident[];
  private getCurrentUser: () => { id: string; role: string } | null;
  private workers: WorkerInfo[];

  constructor(
    getCurrentUser: () => { id: string; role: string } | null,
    workers: WorkerInfo[],
  ) {
    this.getCurrentUser = getCurrentUser;
    this.workers = workers;
    this.incidents = this.generateInitialData();
  }

  private generateInitialData(): AttendanceIncident[] {
    return [
      {
        id: 'inc-001',
        worker_id: 'd1b2c3d4-0004-0004-0004-000000000001',
        worker_name: 'Pedro Fernández',
        type: 'OLVIDO_ENTRADA',
        description: 'Olvidé fichar la entrada al llegar a obra',
        affected_date: '2025-01-15',
        proposed_clock_in: '2025-01-15T07:00:00Z',
        proposed_clock_out: null,
        status: 'PENDING',
        resolution_notes: null,
        resolved_by: null,
        created_at: '2025-01-15T10:30:00Z',
        resolved_at: null,
      },
      {
        id: 'inc-002',
        worker_id: 'd1b2c3d4-0004-0004-0004-000000000002',
        worker_name: 'María Ruiz',
        type: 'OLVIDO_SALIDA',
        description: 'No registré la salida al terminar la jornada',
        affected_date: '2025-01-14',
        proposed_clock_in: null,
        proposed_clock_out: '2025-01-14T15:30:00Z',
        status: 'RESOLVED',
        resolution_notes: 'Verificado con el parte de obra',
        resolved_by: 'a1b2c3d4-0001-0001-0001-000000000003',
        created_at: '2025-01-14T16:00:00Z',
        resolved_at: '2025-01-14T17:00:00Z',
      },
      {
        id: 'inc-003',
        worker_id: 'd1b2c3d4-0004-0004-0004-000000000003',
        worker_name: 'Alexandru Popescu',
        type: 'CORRECCION_HORA',
        description: 'La hora de entrada registrada es incorrecta, llegué antes',
        affected_date: '2025-01-13',
        proposed_clock_in: '2025-01-13T06:45:00Z',
        proposed_clock_out: null,
        status: 'REJECTED',
        resolution_notes: 'No se puede verificar la hora indicada',
        resolved_by: 'a1b2c3d4-0001-0001-0001-000000000003',
        created_at: '2025-01-13T09:00:00Z',
        resolved_at: '2025-01-13T11:00:00Z',
      },
      {
        id: 'inc-004',
        worker_id: 'd1b2c3d4-0004-0004-0004-000000000004',
        worker_name: 'Lucía Sánchez',
        type: 'FICHAJE_DUPLICADO',
        description: 'Se registró doble fichaje de entrada por error del lector NFC',
        affected_date: '2025-01-12',
        proposed_clock_in: null,
        proposed_clock_out: null,
        status: 'PENDING',
        resolution_notes: null,
        resolved_by: null,
        created_at: '2025-01-12T08:15:00Z',
        resolved_at: null,
      },
      {
        id: 'inc-005',
        worker_id: 'd1b2c3d4-0004-0004-0004-000000000001',
        worker_name: 'Pedro Fernández',
        type: 'OTRO',
        description: 'Problema con el código QR, no escaneaba correctamente',
        affected_date: '2025-01-10',
        proposed_clock_in: '2025-01-10T07:00:00Z',
        proposed_clock_out: '2025-01-10T15:00:00Z',
        status: 'RESOLVED',
        resolution_notes: 'Se corrigió el registro manualmente',
        resolved_by: 'a1b2c3d4-0001-0001-0001-000000000002',
        created_at: '2025-01-10T09:00:00Z',
        resolved_at: '2025-01-10T12:00:00Z',
      },
      {
        id: 'inc-006',
        worker_id: 'd1b2c3d4-0004-0004-0004-000000000002',
        worker_name: 'María Ruiz',
        type: 'OLVIDO_ENTRADA',
        description: 'Olvidé fichar al entrar por la mañana',
        affected_date: '2025-01-09',
        proposed_clock_in: '2025-01-09T07:15:00Z',
        proposed_clock_out: null,
        status: 'PENDING',
        resolution_notes: null,
        resolved_by: null,
        created_at: '2025-01-09T10:00:00Z',
        resolved_at: null,
      },
      {
        id: 'inc-007',
        worker_id: 'd1b2c3d4-0004-0004-0004-000000000003',
        worker_name: 'Alexandru Popescu',
        type: 'CORRECCION_HORA',
        description: 'Hora de salida incorrecta, salí más tarde de lo registrado',
        affected_date: '2025-01-08',
        proposed_clock_in: null,
        proposed_clock_out: '2025-01-08T17:30:00Z',
        status: 'RESOLVED',
        resolution_notes: 'Confirmado por el encargado de cuadrilla',
        resolved_by: 'a1b2c3d4-0001-0001-0001-000000000003',
        created_at: '2025-01-08T18:00:00Z',
        resolved_at: '2025-01-09T08:00:00Z',
      },
    ];
  }

  private getWorkerTeamId(workerId: string): string | null {
    const worker = this.workers.find((w) => w.id === workerId);
    return worker ? worker.team_id : null;
  }

  private getUserWorkerMapping(userId: string): string | null {
    // In the mock, the user ID maps directly to a worker ID
    // In production, this mapping would come from the backend
    const worker = this.workers.find((w) => w.id === userId);
    return worker ? worker.id : null;
  }

  private filterByRole(incidents: AttendanceIncident[]): AttendanceIncident[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    const scope = getDataScope(user.role);

    switch (scope) {
      case 'own': {
        const workerId = this.getUserWorkerMapping(user.id);
        if (!workerId) return [];
        return incidents.filter((inc) => inc.worker_id === workerId);
      }
      case 'team': {
        const userWorker = this.workers.find((w) => w.id === user.id);
        if (!userWorker) return [];
        const teamId = userWorker.team_id;
        const teamWorkerIds = this.workers
          .filter((w) => w.team_id === teamId)
          .map((w) => w.id);
        return incidents.filter((inc) => teamWorkerIds.includes(inc.worker_id));
      }
      case 'all':
        return incidents;
      default:
        return [];
    }
  }

  async listIncidents(params: ListIncidentsParams): Promise<PaginatedResponse<AttendanceIncident>> {
    const { status, date_from, date_to, page = 0, size = 20 } = params;

    let filtered = this.filterByRole([...this.incidents]);

    if (status) {
      filtered = filtered.filter((inc) => inc.status === status);
    }

    if (date_from) {
      filtered = filtered.filter((inc) => inc.affected_date >= date_from);
    }

    if (date_to) {
      filtered = filtered.filter((inc) => inc.affected_date <= date_to);
    }

    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const start = page * size;
    const content = filtered.slice(start, start + size);

    return {
      content,
      page,
      size,
      total_elements: totalElements,
      total_pages: totalPages,
    };
  }

  async createIncident(request: CreateIncidentRequest): Promise<AttendanceIncident> {
    const worker = this.workers.find((w) => w.id === request.worker_id);
    const workerName = worker
      ? `${worker.first_name} ${worker.last_name}`
      : 'Trabajador desconocido';

    const incident: AttendanceIncident = {
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
      created_at: new Date().toISOString(),
      resolved_at: null,
    };

    this.incidents.push(incident);
    return incident;
  }

  async getIncident(incidentId: string): Promise<AttendanceIncident> {
    const incident = this.incidents.find((inc) => inc.id === incidentId);
    if (!incident) {
      throw { code: 'NOT_FOUND', message: 'Incidencia no encontrada' } as ApiError;
    }
    return incident;
  }

  async resolveIncident(
    incidentId: string,
    request: ResolveIncidentRequest,
  ): Promise<AttendanceIncident> {
    const incident = this.incidents.find((inc) => inc.id === incidentId);
    if (!incident) {
      throw { code: 'NOT_FOUND', message: 'Incidencia no encontrada' } as ApiError;
    }

    if (incident.status !== 'PENDING') {
      throw {
        code: 'INVALID_STATUS',
        message: 'Solo se pueden resolver incidencias pendientes',
      } as ApiError;
    }

    // Check ENCARGADO team access
    const user = this.getCurrentUser();
    if (user && user.role === 'ENCARGADO') {
      const userWorker = this.workers.find((w) => w.id === user.id);
      const incidentWorker = this.workers.find((w) => w.id === incident.worker_id);
      if (
        !userWorker ||
        !incidentWorker ||
        userWorker.team_id !== incidentWorker.team_id
      ) {
        throw {
          code: 'FORBIDDEN',
          message: 'No tiene permiso para resolver esta incidencia',
        } as ApiError;
      }
    }

    const newStatus: IncidentStatus =
      request.resolution === 'APPROVE' ? 'RESOLVED' : 'REJECTED';

    incident.status = newStatus;
    incident.resolved_by = user?.id ?? null;
    incident.resolved_at = new Date().toISOString();
    incident.resolution_notes = request.notes ?? null;

    return incident;
  }
}
