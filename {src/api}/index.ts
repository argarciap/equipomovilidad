// =============================================================================
// API Layer — Barrel Exports & Factory
// =============================================================================

import type { IApiClient } from './client.interface';
import { MockApiClient } from './mock-client';
import { RealApiClient } from './real-client';
import { USE_MOCK_API } from './config';

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Crea la instancia del cliente API según el flag `USE_MOCK_API`.
 *
 * @param getToken - Función opcional que devuelve el token JWT.
 *                   Requerida cuando `USE_MOCK_API` es `false`.
 * @returns Instancia de `IApiClient` (mock o real).
 */
export function createApiClient(
  getToken?: () => Promise<string> | string,
): IApiClient {
  if (USE_MOCK_API) {
    return new MockApiClient();
  }
  return new RealApiClient(getToken ?? (() => ''));
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export * from './types';
export { ApiError } from './errors';
export type { ApiErrorDetail } from './errors';
export type { IApiClient } from './client.interface';
export { USE_MOCK_API } from './config';
