export type UserRole =
  | 'ADMIN'
  | 'JEFE_OBRA'
  | 'ENCARGADO'
  | 'TRABAJADOR'
  | 'PREVENCION'
  | 'SOLO_LECTURA';

export interface User {
  id: string; // UUID
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface AuthService {
  login(userId: string): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}
