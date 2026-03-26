/**
 * Tipos e interfaces del módulo de fichaje (Clock-In / Clock-Out).
 *
 * Requisitos: 11.1, 11.2, 11.3, 11.4, 12.1, 12.2
 *
 * Todas las interfaces siguen el contrato definido en attendance-service.yaml (OpenAPI 3.0.3).
 * Se usan named exports y son compatibles con TypeScript strict mode.
 */

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

/** Métodos de fichaje disponibles. */
export type ClockMethod = 'QR' | 'NFC' | 'MANUAL' | 'GPS';

/**
 * Estado del fichaje del trabajador.
 * - CLOCKED_IN: tiene un registro OPEN activo.
 * - CLOCKED_OUT: no tiene registro OPEN.
 * - LOADING: consultando estado al API.
 * - ERROR: fallo al consultar estado.
 */
export type ClockStatus = 'CLOCKED_IN' | 'CLOCKED_OUT' | 'LOADING' | 'ERROR';

// ---------------------------------------------------------------------------
// Data Models
// ---------------------------------------------------------------------------

/** Ubicación geográfica (coordenadas GPS). */
export interface GeoLocation {
  /** Latitud en grados decimales. Rango válido: [-90, 90]. */
  latitude: number;
  /** Longitud en grados decimales. Rango válido: [-180, 180]. */
  longitude: number;
}

/**
 * Registro de asistencia retornado por el API.
 *
 * Mapea 1:1 con el schema `AttendanceRecord` de attendance-service.yaml.
 * - `id`: UUID del registro.
 * - `worker_id`: UUID del trabajador (debe coincidir con user.id del contexto auth).
 * - `status`: OPEN (entrada sin salida), CLOSED (entrada+salida), INCIDENT.
 */
export interface AttendanceRecord {
  /** UUID del registro. */
  id: string;
  /** UUID del trabajador. Validación: formato UUID v4. */
  worker_id: string;
  /** Nombre completo del trabajador. */
  worker_name: string;
  /** Fecha del registro (formato ISO date: YYYY-MM-DD). */
  date: string;
  /** Hora de entrada (formato ISO date-time). */
  clock_in: string;
  /** Hora de salida (formato ISO date-time). null si el registro está OPEN. */
  clock_out: string | null;
  /** Método usado para fichar entrada. */
  clock_in_method: ClockMethod;
  /** Método usado para fichar salida. null si el registro está OPEN. */
  clock_out_method: ClockMethod | null;
  /** Ubicación GPS al fichar entrada. null si el método no fue GPS. */
  clock_in_location: GeoLocation | null;
  /** Ubicación GPS al fichar salida. null si el método no fue GPS o registro OPEN. */
  clock_out_location: GeoLocation | null;
  /** Horas trabajadas calculadas. null si el registro está OPEN. */
  total_hours: number | null;
  /** Estado del registro: OPEN, CLOSED o INCIDENT. */
  status: 'OPEN' | 'CLOSED' | 'INCIDENT';
  /** UUID del usuario que modificó el registro. null si no ha sido modificado. */
  modified_by: string | null;
  /** Motivo de la modificación. null si no ha sido modificado. */
  modification_reason: string | null;
  /** Fecha de creación del registro (formato ISO date-time). */
  created_at: string;
}

/**
 * Resumen del día actual retornado por GET /records/today.
 *
 * Mapea con el schema `TodaySummary` de attendance-service.yaml.
 */
export interface TodaySummary {
  /** Fecha del resumen (formato ISO date: YYYY-MM-DD). */
  date: string;
  /** Total de trabajadores presentes (con registro del día). */
  total_workers_present: number;
  /** Total de trabajadores ausentes. */
  total_workers_absent: number;
  /** Registros de asistencia del día. */
  records: AttendanceRecord[];
}

// ---------------------------------------------------------------------------
// Request / Response
// ---------------------------------------------------------------------------

/**
 * Request de fichaje enviado al API (POST /clock-in o POST /clock-out).
 *
 * Reglas de validación:
 * - `worker_id` debe ser un UUID válido (formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).
 * - `method` debe ser uno de: QR, NFC, MANUAL, GPS.
 * - `latitude` y `longitude` son REQUERIDOS cuando method === 'GPS'.
 *   - latitude debe estar en el rango [-90, 90].
 *   - longitude debe estar en el rango [-180, 180].
 * - `latitude` y `longitude` deben ser undefined cuando method !== 'GPS'.
 * - `notes` es opcional para cualquier método.
 */
export interface ClockRequest {
  /** UUID del trabajador. Siempre debe coincidir con useAuth().user.id. */
  worker_id: string;
  /** Método de fichaje seleccionado. */
  method: ClockMethod;
  /** Latitud GPS. Requerido sii method === 'GPS'. Rango: [-90, 90]. */
  latitude?: number;
  /** Longitud GPS. Requerido sii method === 'GPS'. Rango: [-180, 180]. */
  longitude?: number;
  /** Notas opcionales del fichaje. */
  notes?: string;
}

/** Resultado de una operación de fichaje. */
export interface ClockResult {
  /** true si el fichaje se completó con éxito. */
  success: boolean;
  /** Registro de asistencia creado/actualizado. Presente solo si success === true. */
  record?: AttendanceRecord;
  /** Detalle del error. Presente solo si success === false. */
  error?: ClockError;
}

/** Error de fichaje. */
export interface ClockError {
  /**
   * Código de error.
   * Valores conocidos: ALREADY_CLOCKED_IN (409), NO_OPEN_RECORD (404),
   * BAD_REQUEST (400), NETWORK_ERROR, TIMEOUT, UNKNOWN_ERROR.
   */
  code: string;
  /** Mensaje descriptivo del error en español. */
  message: string;
}

// ---------------------------------------------------------------------------
// Hook States
// ---------------------------------------------------------------------------

/** Estado expuesto por el hook useClockStatus. */
export interface ClockStatusState {
  /** Estado actual del fichaje del trabajador. */
  status: ClockStatus;
  /** Registro OPEN actual. null si el trabajador no está fichado. */
  currentRecord: AttendanceRecord | null;
  /** Resumen del día actual. null mientras se carga. */
  todaySummary: TodaySummary | null;
  /** Función para refrescar el estado desde el API. */
  refresh: () => Promise<void>;
}

/** Estado expuesto por el hook useClockPunch. */
export interface ClockPunchState {
  /** true mientras una operación de fichaje está en curso. Previene doble pulsación. */
  isPunching: boolean;
  /** Ejecuta el fichaje con el método indicado. Retorna el resultado de la operación. */
  punch: (method: ClockMethod) => Promise<ClockResult>;
}

// ---------------------------------------------------------------------------
// Service Interfaces
// ---------------------------------------------------------------------------

/**
 * Interfaz del cliente API de asistencia.
 *
 * Abstrae las llamadas a los endpoints del servicio de asistencia.
 * Permite intercambiar la implementación mock por una HTTP real
 * sin modificar los componentes consumidores.
 */
export interface AttendanceApiClient {
  /** POST /clock-in — Registrar entrada. Lanza error con code ALREADY_CLOCKED_IN (409) si ya existe registro OPEN. */
  clockIn(request: ClockRequest): Promise<AttendanceRecord>;
  /** POST /clock-out — Registrar salida. Lanza error con code NO_OPEN_RECORD (404) si no existe registro OPEN. */
  clockOut(request: ClockRequest): Promise<AttendanceRecord>;
  /** GET /records/today — Obtener registros del día actual para un trabajador. */
  getTodayRecords(workerId: string): Promise<TodaySummary>;
}

/**
 * Interfaz del servicio de geolocalización GPS.
 *
 * Encapsula @react-native-community/geolocation.
 * - getCurrentPosition usa enableHighAccuracy con timeout de 10 segundos.
 * - isAvailable verifica permisos y disponibilidad del hardware.
 */
export interface GPSService {
  /** Obtiene la posición actual del dispositivo. Lanza error si permisos denegados o timeout. */
  getCurrentPosition(): Promise<GeoLocation>;
  /** Verifica si el GPS está disponible y los permisos están concedidos. */
  isAvailable(): Promise<boolean>;
}

/**
 * Interfaz del servicio de lectura NFC.
 *
 * Encapsula react-native-nfc-manager.
 */
export interface NFCService {
  /** Inicia la lectura de un tag NFC. Retorna el contenido del tag como string. */
  readTag(): Promise<string>;
  /** Verifica si el hardware NFC está disponible en el dispositivo. */
  isAvailable(): Promise<boolean>;
  /** Cancela una lectura NFC en curso. */
  cancelRead(): void;
}

/** Resultado del escaneo de un código QR. */
export interface QRScannerResult {
  /** Contenido decodificado del código QR. */
  data: string;
  /** Tipo de código escaneado (e.g., 'qr'). */
  type: string;
}
