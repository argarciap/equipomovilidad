/**
 * Utilidades de control de acceso por rol.
 *
 * Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { UserRole } from '../types';

/**
 * Alcance de datos que un rol puede ver.
 * - 'own': solo datos propios
 * - 'team': datos del equipo supervisado
 * - 'all': todos los datos
 */
export type DataScope = 'own' | 'team' | 'all';

/**
 * Determina si un rol tiene acceso según una lista de roles permitidos.
 */
export function hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Mapeo de cada rol a su alcance de datos.
 */
const ROLE_DATA_SCOPE: Record<UserRole, DataScope> = {
  ADMIN: 'all',
  JEFE_OBRA: 'all',
  ENCARGADO: 'team',
  TRABAJADOR: 'own',
  PREVENCION: 'all',
  SOLO_LECTURA: 'all',
};

/**
 * Devuelve el alcance de datos para un rol dado.
 */
export function getDataScope(role: UserRole): DataScope {
  return ROLE_DATA_SCOPE[role];
}

/** Roles que pueden ver cada pestaña. */
export const TAB_VISIBILITY: Record<string, UserRole[]> = {
  Dashboard: ['ADMIN', 'JEFE_OBRA', 'ENCARGADO', 'TRABAJADOR', 'PREVENCION', 'SOLO_LECTURA'],
  Clock: ['ADMIN', 'JEFE_OBRA', 'ENCARGADO', 'TRABAJADOR', 'PREVENCION'],
  Records: ['ADMIN', 'JEFE_OBRA', 'ENCARGADO', 'TRABAJADOR', 'PREVENCION', 'SOLO_LECTURA'],
  Incidents: ['ADMIN', 'JEFE_OBRA', 'ENCARGADO', 'TRABAJADOR', 'PREVENCION'],
};

/**
 * Configuración centralizada de roles: alcance de datos y pestañas visibles.
 */
export const roleConfig: Record<UserRole, { dataScope: DataScope; visibleTabs: string[] }> = {
  ADMIN: { dataScope: 'all', visibleTabs: ['Dashboard', 'Clock', 'Records', 'Incidents'] },
  JEFE_OBRA: { dataScope: 'all', visibleTabs: ['Dashboard', 'Clock', 'Records', 'Incidents'] },
  ENCARGADO: { dataScope: 'team', visibleTabs: ['Dashboard', 'Clock', 'Records', 'Incidents'] },
  TRABAJADOR: { dataScope: 'own', visibleTabs: ['Dashboard', 'Clock', 'Records', 'Incidents'] },
  PREVENCION: { dataScope: 'all', visibleTabs: ['Dashboard', 'Clock', 'Records', 'Incidents'] },
  SOLO_LECTURA: { dataScope: 'all', visibleTabs: ['Dashboard', 'Records'] },
};
