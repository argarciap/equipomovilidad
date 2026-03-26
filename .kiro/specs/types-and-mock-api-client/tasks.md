# Plan de Implementación: Types & Mock API Client

## Visión General

Implementación incremental de la capa de abstracción de API para la app móvil React Native. Se crean primero los tipos y la interfaz, luego el mock client con reglas de negocio, después el real client con fetch, y finalmente la factory con el flag de alternancia. Cada paso construye sobre el anterior.

## Tareas

- [x] 1. Crear tipos TypeScript e interfaz base
  - [x] 1.1 Crear `src/api/types.ts` con todos los tipos e interfaces derivados de los OpenAPI specs
    - Definir union types: `ClockMethod`, `RecordStatus`, `IncidentType`, `IncidentStatus`, `RoleName`
    - Definir interfaces del attendance-service: `GeoLocation`, `ClockInRequest`, `ClockOutRequest`, `AttendanceRecord`, `UpdateRecordRequest`, `TodaySummary`, `AttendanceIncident`, `CreateIncidentRequest`, `ResolveIncidentRequest`, `WorkerHoursSummary`, `TeamHoursSummary`, `PaginatedAttendanceRecords`, `PaginatedIncidents`, `RecordsQueryParams`, `TodayQueryParams`
    - Definir interfaces del auth-service: `Role`, `User`
    - Campos UUID como `string`, campos nullable como unión con `null`
    - Exportar todos los tipos con named exports
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3_

  - [x] 1.2 Crear `src/api/errors.ts` con la clase `ApiError`
    - Implementar clase `ApiError extends Error` con `code`, `statusCode`, `message` y `details` opcionales
    - Definir interfaz `ApiErrorDetail` con `field` y `message`
    - _Requisitos: 7.1, 7.2, 7.3_

  - [x] 1.3 Crear `src/api/client.interface.ts` con la interfaz `IApiClient`
    - Definir métodos: `clockIn`, `clockOut`, `getRecords`, `getTodayRecords`, `createIncident`, `getMe`
    - Cada método con sus tipos de parámetros y retorno según el diseño
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ]* 1.4 Escribir tests unitarios para los tipos y la interfaz
    - Verificar que los tipos compilan correctamente con objetos de ejemplo
    - Verificar que `ApiError` se instancia correctamente con todos los campos
    - _Requisitos: 1.1, 7.1_

- [x] 2. Checkpoint - Verificar compilación de tipos
  - Asegurar que todos los tipos compilan sin errores. Preguntar al usuario si hay dudas.

- [x] 3. Implementar MockApiClient con reglas de negocio
  - [x] 3.1 Crear `src/api/mock-client.ts` con la clase `MockApiClient`
    - Implementar `IApiClient` completa
    - Cargar datos de `mock-data.json` (workers, users)
    - Mantener `Map<string, AttendanceRecord>` de registros abiertos por `worker_id`
    - Implementar retardo configurable con `MOCK_DELAY_MS` (default 300ms)
    - Generar UUIDs con `uuid.v4()` para nuevos registros
    - _Requisitos: 4.1, 4.9, 4.10_

  - [x] 3.2 Implementar método `clockIn` del mock
    - Validar campos requeridos (`worker_id`, `method`), lanzar `ApiError` 400 si faltan
    - Verificar si ya existe registro abierto para el `worker_id`, lanzar `ApiError` 409 si existe
    - Crear `AttendanceRecord` con status `OPEN`, `clock_out: null`, datos del worker de mock-data.json
    - Incluir `clock_in_location` si method es `GPS` y se proporcionan coordenadas
    - Añadir registro al mapa de registros abiertos
    - _Requisitos: 4.2, 4.3, 5.1, 5.3, 7.2, 7.3_

  - [x] 3.3 Implementar método `clockOut` del mock
    - Verificar que existe registro abierto para el `worker_id`, lanzar `ApiError` 404 si no existe
    - Actualizar registro con `clock_out`, `clock_out_method`, `clock_out_location`, calcular `total_hours`, status `CLOSED`
    - Eliminar registro del mapa de registros abiertos
    - _Requisitos: 4.4, 5.2, 7.2, 7.3_

  - [x] 3.4 Implementar métodos `getRecords`, `getTodayRecords`, `createIncident` y `getMe` del mock
    - `getRecords`: retornar `PaginatedAttendanceRecords` con registros de prueba, respetar `page` y `size`
    - `getTodayRecords`: retornar `TodaySummary` con fecha actual y registros generados desde workers de mock-data.json
    - `createIncident`: validar campos requeridos (400 si faltan), retornar `AttendanceIncident` con status `PENDING` y UUID generado
    - `getMe`: retornar `User` con datos de Pedro Fernández (TRABAJADOR) de mock-data.json
    - _Requisitos: 4.5, 4.6, 4.7, 4.8, 5.4, 7.2_

  - [ ]* 3.5 Escribir tests unitarios para MockApiClient
    - Test clockIn exitoso retorna AttendanceRecord con status OPEN
    - Test clockIn con registro abierto lanza ApiError 409
    - Test clockOut exitoso retorna AttendanceRecord con status CLOSED y total_hours calculado
    - Test clockOut sin registro abierto lanza ApiError 404
    - Test clockIn sin worker_id lanza ApiError 400
    - Test createIncident sin campos requeridos lanza ApiError 400
    - Test getMe retorna usuario Pedro Fernández con rol TRABAJADOR
    - _Requisitos: 4.1, 5.1, 5.2, 5.3, 5.4, 7.3_

- [x] 4. Checkpoint - Verificar mock client funcional
  - Asegurar que todos los tests pasan y el mock client responde correctamente. Preguntar al usuario si hay dudas.

- [x] 5. Implementar RealApiClient y configuración
  - [x] 5.1 Crear `src/api/config.ts` con flag y URLs base
    - Exportar constante `USE_MOCK_API = true`
    - Exportar constantes `ATTENDANCE_API_URL` y `AUTH_API_URL` con URLs base configurables
    - Exportar `MOCK_DELAY_MS` con valor default 300
    - _Requisitos: 6.1_

  - [x] 5.2 Crear `src/api/real-client.ts` con la clase `RealApiClient`
    - Implementar `IApiClient` completa usando `fetch` nativo de React Native
    - Inyectar token JWT en header `Authorization: Bearer <token>` en cada petición
    - Usar URLs base de `config.ts` (`ATTENDANCE_API_URL` para fichajes, `AUTH_API_URL` para auth)
    - Parsear errores del backend a `ApiError` con code, message, statusCode y details
    - _Requisitos: 6.5, 6.6, 7.2_

  - [ ]* 5.3 Escribir tests unitarios para RealApiClient
    - Test que las URLs se construyen correctamente con los parámetros
    - Test que el header Authorization se incluye en cada petición
    - Test que errores HTTP se parsean a ApiError
    - _Requisitos: 6.5, 6.6, 7.2_

- [x] 6. Crear factory y barrel exports
  - [x] 6.1 Crear `src/api/index.ts` con factory `createApiClient()` y re-exports
    - Implementar `createApiClient(): IApiClient` que resuelve según `USE_MOCK_API`
    - Re-exportar todos los tipos, interfaces, `ApiError` y `IApiClient`
    - Las pantallas consumidoras importan todo desde `src/api`
    - _Requisitos: 6.2, 6.3, 6.4_

  - [ ]* 6.2 Escribir test unitario para la factory
    - Test que con `USE_MOCK_API = true` retorna instancia de `MockApiClient`
    - Test que con `USE_MOCK_API = false` retorna instancia de `RealApiClient`
    - _Requisitos: 6.2, 6.3_

- [x] 7. Checkpoint final - Verificar integración completa
  - Asegurar que todos los tests pasan, que la factory resuelve correctamente, y que los tipos se exportan desde `src/api/index.ts`. Preguntar al usuario si hay dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- El lenguaje de implementación es TypeScript (React Native)
- Los IDs de mock-data.json deben usarse consistentemente para coherencia entre equipos
