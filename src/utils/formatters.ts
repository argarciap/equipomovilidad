import { IncidentType, IncidentStatus } from '../types/incidents';

const MONTH_ABBREVIATIONS = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    const day = date.getUTCDate();
    const month = MONTH_ABBREVIATIONS[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return isoDate;
  }
}

export function formatDateTime(isoDateTime: string): string {
  try {
    const date = new Date(isoDateTime);
    if (isNaN(date.getTime())) return isoDateTime;
    const day = date.getUTCDate();
    const month = MONTH_ABBREVIATIONS[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return isoDateTime;
  }
}

const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  OLVIDO_ENTRADA: 'Olvido de entrada',
  OLVIDO_SALIDA: 'Olvido de salida',
  CORRECCION_HORA: 'Corrección de hora',
  FICHAJE_DUPLICADO: 'Fichaje duplicado',
  OTRO: 'Otro',
};

export function getIncidentTypeLabel(type: IncidentType): string {
  return INCIDENT_TYPE_LABELS[type] ?? type;
}

const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  PENDING: 'Pendiente',
  RESOLVED: 'Resuelta',
  REJECTED: 'Rechazada',
};

export function getIncidentStatusLabel(status: IncidentStatus): string {
  return INCIDENT_STATUS_LABELS[status] ?? status;
}
