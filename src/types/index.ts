/**
 * Sistema de tipos compartidos para la app móvil de gestión de asistencia en obra.
 *
 * Requisitos: 1.3, 1.4, 7.1
 */

/**
 * Roles de usuario del sistema.
 * Cada rol define un nivel de acceso y visibilidad de datos diferente.
 */
export type UserRole =
  | 'ADMIN'
  | 'JEFE_OBRA'
  | 'ENCARGADO'
  | 'TRABAJADOR'
  | 'PREVENCION'
  | 'SOLO_LECTURA';

/**
 * Interfaz de usuario autenticado.
 * Los campos mapean desde mock-data.json (snake_case → camelCase).
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

/**
 * Interfaz del servicio de autenticación.
 * Permite intercambiar la implementación mock por Cognito real
 * sin modificar el AuthProvider ni el resto de la app.
 */
export interface AuthService {
  login(userId: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
