/**
 * Funciones puras de lógica de negocio del módulo de fichaje.
 *
 * Requisitos: 1.1, 1.2, 1.3, 3.3, 3.5
 */

import type {
  AttendanceApiClient,
  AttendanceRecord,
  ClockStatus,
  TodaySummary,
} from '../types/clock';

// Re-export para conveniencia de los consumidores
export type { AttendanceApiClient };

/**
 * Determina el estado de fichaje de un trabajador a partir del resumen del día.
 *
 * - Si todaySummary es null → CLOCKED_OUT, null
 * - Si existe un registro OPEN del worker → CLOCKED_IN con ese registro
 * - En caso contrario → CLOCKED_OUT, null
 *
 * Requisitos: 1.1, 1.2, 1.3
 */
export function determineClockStatus(
  todaySummary: TodaySummary | null,
  workerId: string,
): { status: ClockStatus; currentRecord: AttendanceRecord | null } {
  if (!todaySummary) {
    return { status: 'CLOCKED_OUT', currentRecord: null };
  }

  const openRecord = todaySummary.records.find(
    (r) => r.worker_id === workerId && r.status === 'OPEN',
  );

  if (openRecord) {
    return { status: 'CLOCKED_IN', currentRecord: openRecord };
  }

  return { status: 'CLOCKED_OUT', currentRecord: null };
}

/** Regex UUID v4 (case-insensitive). */
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Valida que un payload de código QR sea un UUID válido.
 *
 * - Vacío / solo espacios → { valid: false, errorMessage: 'Código QR vacío' }
 * - No UUID → { valid: false, errorMessage: 'Código QR no válido' }
 * - UUID válido → { valid: true }
 *
 * Requisitos: 3.3, 3.5
 */
export function validateQRPayload(
  payload: string,
): { valid: boolean; errorMessage?: string } {
  if (!payload || payload.trim().length === 0) {
    return { valid: false, errorMessage: 'Código QR vacío' };
  }

  if (!UUID_REGEX.test(payload)) {
    return { valid: false, errorMessage: 'Código QR no válido' };
  }

  return { valid: true };
}
