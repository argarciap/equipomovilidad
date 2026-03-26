import type { AttendanceRecord, ListRecordsParams, WorkerHoursSummary } from '../types/records';
import type { PaginatedResponse } from '../types/incidents';

type DataScope = 'own' | 'team' | 'all';

function getDataScope(role: string): DataScope {
  switch (role) {
    case 'ADMIN':
    case 'JEFE_OBRA':
      return 'all';
    case 'ENCARGADO':
      return 'team';
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

export class MockRecordsService {
  private records: AttendanceRecord[];
  private getCurrentUser: () => { id: string; role: string } | null;
  private workers: WorkerInfo[];

  constructor(
    getCurrentUser: () => { id: string; role: string } | null,
    workers: WorkerInfo[],
  ) {
    this.getCurrentUser = getCurrentUser;
    this.workers = workers;
    this.records = this.generateInitialData();
  }

  private generateInitialData(): AttendanceRecord[] {
    return [
      {
        id: 'rec-001', worker_id: 'd1b2c3d4-0004-0004-0004-000000000001', worker_name: 'Pedro Fernández',
        date: '2025-01-15', clock_in: '2025-01-15T07:00:00Z', clock_out: '2025-01-15T15:30:00Z',
        clock_in_method: 'QR', clock_out_method: 'QR', clock_in_location: { latitude: 40.4168, longitude: -3.7038 },
        clock_out_location: { latitude: 40.4168, longitude: -3.7038 }, total_hours: 8.5, status: 'CLOSED',
        modified_by: null, modification_reason: null, created_at: '2025-01-15T07:00:00Z',
      },
      {
        id: 'rec-002', worker_id: 'd1b2c3d4-0004-0004-0004-000000000002', worker_name: 'María Ruiz',
        date: '2025-01-15', clock_in: '2025-01-15T07:15:00Z', clock_out: '2025-01-15T15:15:00Z',
        clock_in_method: 'NFC', clock_out_method: 'NFC', clock_in_location: null, clock_out_location: null,
        total_hours: 8.0, status: 'CLOSED', modified_by: null, modification_reason: null, created_at: '2025-01-15T07:15:00Z',
      },
      {
        id: 'rec-003', worker_id: 'd1b2c3d4-0004-0004-0004-000000000003', worker_name: 'Alexandru Popescu',
        date: '2025-01-15', clock_in: '2025-01-15T06:45:00Z', clock_out: null,
        clock_in_method: 'GPS', clock_out_method: null, clock_in_location: { latitude: 40.4168, longitude: -3.7038 },
        clock_out_location: null, total_hours: null, status: 'OPEN', modified_by: null, modification_reason: null,
        created_at: '2025-01-15T06:45:00Z',
      },
      {
        id: 'rec-004', worker_id: 'd1b2c3d4-0004-0004-0004-000000000004', worker_name: 'Lucía Sánchez',
        date: '2025-01-15', clock_in: '2025-01-15T08:00:00Z', clock_out: '2025-01-15T16:00:00Z',
        clock_in_method: 'MANUAL', clock_out_method: 'MANUAL', clock_in_location: null, clock_out_location: null,
        total_hours: 8.0, status: 'CLOSED', modified_by: null, modification_reason: null, created_at: '2025-01-15T08:00:00Z',
      },
      {
        id: 'rec-005', worker_id: 'd1b2c3d4-0004-0004-0004-000000000001', worker_name: 'Pedro Fernández',
        date: '2025-01-14', clock_in: '2025-01-14T07:00:00Z', clock_out: '2025-01-14T15:00:00Z',
        clock_in_method: 'QR', clock_out_method: 'QR', clock_in_location: null, clock_out_location: null,
        total_hours: 8.0, status: 'CLOSED', modified_by: null, modification_reason: null, created_at: '2025-01-14T07:00:00Z',
      },
      {
        id: 'rec-006', worker_id: 'd1b2c3d4-0004-0004-0004-000000000002', worker_name: 'María Ruiz',
        date: '2025-01-14', clock_in: '2025-01-14T07:30:00Z', clock_out: null,
        clock_in_method: 'NFC', clock_out_method: null, clock_in_location: null, clock_out_location: null,
        total_hours: null, status: 'INCIDENT', modified_by: null, modification_reason: null, created_at: '2025-01-14T07:30:00Z',
      },
    ];
  }

  private filterByRole(records: AttendanceRecord[]): AttendanceRecord[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    const scope = getDataScope(user.role);
    switch (scope) {
      case 'own': {
        const worker = this.workers.find((w) => w.id === user.id);
        return worker ? records.filter((r) => r.worker_id === worker.id) : [];
      }
      case 'team': {
        const userWorker = this.workers.find((w) => w.id === user.id);
        if (!userWorker) return [];
        const teamWorkerIds = this.workers.filter((w) => w.team_id === userWorker.team_id).map((w) => w.id);
        return records.filter((r) => teamWorkerIds.includes(r.worker_id));
      }
      case 'all':
        return records;
      default:
        return [];
    }
  }

  async listRecords(params: ListRecordsParams): Promise<PaginatedResponse<AttendanceRecord>> {
    const { date_from, date_to, status, page = 0, size = 20 } = params;
    let filtered = this.filterByRole([...this.records]);
    filtered = filtered.filter((r) => r.date >= date_from && r.date <= date_to);
    if (status) filtered = filtered.filter((r) => r.status === status);
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size) || 1;
    const start = page * size;
    return { content: filtered.slice(start, start + size), page, size, total_elements: totalElements, total_pages: totalPages };
  }

  async getRecord(recordId: string): Promise<AttendanceRecord> {
    const record = this.records.find((r) => r.id === recordId);
    if (!record) throw { code: 'NOT_FOUND', message: 'Registro no encontrado' };
    return record;
  }

  async getWorkerSummary(workerId: string, dateFrom: string, dateTo: string): Promise<WorkerHoursSummary> {
    const records = this.filterByRole(this.records).filter(
      (r) => r.worker_id === workerId && r.date >= dateFrom && r.date <= dateTo && r.status === 'CLOSED',
    );
    const worker = this.workers.find((w) => w.id === workerId);
    const totalHours = records.reduce((sum, r) => sum + (r.total_hours ?? 0), 0);
    const regularHours = Math.min(totalHours, records.length * 8);
    return {
      worker_id: workerId, worker_name: worker ? `${worker.first_name} ${worker.last_name}` : 'Desconocido',
      period_from: dateFrom, period_to: dateTo, total_hours: totalHours, regular_hours: regularHours,
      overtime_hours: Math.max(0, totalHours - regularHours), days_worked: records.length,
      days_absent: 0, pending_incidents: 0,
      daily_breakdown: records.map((r) => ({ date: r.date, hours: r.total_hours ?? 0, is_overtime: (r.total_hours ?? 0) > 8 })),
    };
  }
}
