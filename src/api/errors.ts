/**
 * Detalle de error de validación de la API.
 * Cada entrada indica qué campo falló y por qué.
 */
export interface ApiErrorDetail {
  field: string;
  message: string;
}

/**
 * Error tipado para respuestas de error de la API.
 * Usado tanto por MockApiClient como por RealApiClient para
 * proporcionar un manejo de errores uniforme en las pantallas.
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: ApiErrorDetail[];

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
