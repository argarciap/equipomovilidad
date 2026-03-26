import { UserRole } from '@/types';

export type DataScope = 'own' | 'team' | 'all';

export function hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function getDataScope(role: UserRole): DataScope {
  switch (role) {
    case 'ADMIN':
    case 'JEFE_OBRA':
    case 'PREVENCION':
    case 'SOLO_LECTURA':
      return 'all';
    case 'ENCARGADO':
      return 'team';
    default:
      return 'own';
  }
}

export const TAB_VISIBILITY: Record<string, UserRole[]> = {
  Dashboard: ['ADMIN', 'JEFE_OBRA', 'ENCARGADO', 'TRABAJADOR', 'PREVENCION', 'SOLO_LECTURA'],
  Clock: ['ADMIN', 'JEFE_OBRA', 'ENCARGADO', 'TRABAJADOR', 'PREVENCION'],
  Records: ['ADMIN', 'JEFE_OBRA', 'ENCARGADO', 'TRABAJADOR', 'PREVENCION', 'SOLO_LECTURA'],
  Incidents: ['ADMIN', 'JEFE_OBRA', 'ENCARGADO', 'TRABAJADOR', 'PREVENCION'],
};
