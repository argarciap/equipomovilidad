# Documento de Requisitos — Types & Mock API Client

## Introducción

Este módulo proporciona los tipos TypeScript derivados de las especificaciones OpenAPI (`attendance-service.yaml` y `auth-service.yaml`) y un cliente API mock que devuelve datos de prueba realistas desde `mock-data.json`. Incluye un mecanismo de flag para alternar entre el cliente mock y el cliente real cuando el backend esté disponible. Este módulo es la dependencia central que desbloquea a los Integrantes 3, 4 y 5 para construir sus pantallas en paralelo.

## Glosario

- **API_Client**: Interfaz TypeScript que define los métodos disponibles para consumir los endpoints de attendance-service y auth-service desde la app móvil.
- **Mock_API_Client**: Implementación del API_Client que devuelve datos de prueba desde mock-data.json sin realizar llamadas HTTP reales.
- **Real_API_Client**: Implementación del API_Client que realiza llamadas HTTP reales contra los servicios backend desplegados.
- **API_Flag**: Variable de configuración que determina si la app utiliza el Mock_API_Client o el Real_API_Client.
- **AttendanceRecord**: Registro de fichaje que contiene entrada, salida, método, ubicación y estado.
- **ClockMethod**: Método de fichaje utilizado (GPS, QR, NFC, MANUAL).
- **AttendanceIncident**: Incidencia de fichaje reportada por un trabajador (olvido, corrección, duplicado).
- **IncidentType**: Tipo de incidencia: OLVIDO_ENTRADA, OLVIDO_SALIDA, CORRECCION_HORA, FICHAJE_DUPLICADO, OTRO.
- **PaginatedResponse**: Estructura genérica de respuesta paginada con content, page, size, total_elements y total_pages.
- **UserProfile**: Datos del usuario autenticado obtenidos del endpoint /me del auth-service.
- **Mock_Data**: Archivo JSON compartido (mock-data.json) con fixtures de prueba consistentes entre todos los equipos.

## Requisitos

### Requisito 1: Tipos TypeScript para el servicio de asistencia

**User Story:** Como desarrollador del equipo móvil, quiero tipos TypeScript que reflejen los schemas del attendance-service.yaml, para que las pantallas tengan tipado estricto y autocompletado al consumir la API de fichajes.

#### Criterios de Aceptación

1. THE API_Client SHALL exportar interfaces TypeScript para ClockInRequest, ClockOutRequest, AttendanceRecord, UpdateRecordRequest, GeoLocation, TodaySummary, AttendanceIncident, CreateIncidentRequest, ResolveIncidentRequest, WorkerHoursSummary, TeamHoursSummary, PaginatedAttendanceRecords, PaginatedIncidents y Error, derivadas de los schemas definidos en attendance-service.yaml.
2. THE API_Client SHALL definir el tipo ClockMethod como unión literal de los valores "GPS", "QR", "NFC" y "MANUAL".
3. THE API_Client SHALL definir el tipo IncidentType como unión literal de los valores "OLVIDO_ENTRADA", "OLVIDO_SALIDA", "CORRECCION_HORA", "FICHAJE_DUPLICADO" y "OTRO".
4. THE API_Client SHALL definir el tipo RecordStatus como unión literal de los valores "OPEN", "CLOSED" e "INCIDENT".
5. THE API_Client SHALL definir el tipo IncidentStatus como unión literal de los valores "PENDING", "RESOLVED" y "REJECTED".
6. THE API_Client SHALL representar todos los campos UUID como tipo `string` en las interfaces TypeScript.
7. THE API_Client SHALL representar los campos nullable del schema OpenAPI como tipos unión con `null` en las interfaces TypeScript.

### Requisito 2: Tipos TypeScript para el servicio de autenticación

**User Story:** Como desarrollador del equipo móvil, quiero tipos TypeScript que reflejen los schemas del auth-service.yaml, para que la pantalla de perfil y el contexto de autenticación tengan tipado estricto.

#### Criterios de Aceptación

1. THE API_Client SHALL exportar interfaces TypeScript para User, Role, y Error derivadas de los schemas definidos en auth-service.yaml.
2. THE API_Client SHALL definir el tipo RoleName como unión literal de los valores "ADMIN", "JEFE_OBRA", "ENCARGADO", "TRABAJADOR", "PREVENCION" y "SOLO_LECTURA".
3. THE API_Client SHALL representar el campo `role` de User como un objeto Role con id, name, description y permissions.

### Requisito 3: Interfaz del cliente API

**User Story:** Como desarrollador del equipo móvil, quiero una interfaz TypeScript que defina todos los métodos del cliente API, para que tanto la implementación mock como la real cumplan el mismo contrato.

#### Criterios de Aceptación

1. THE API_Client SHALL definir una interfaz con el método `clockIn(request: ClockInRequest)` que retorne `Promise<AttendanceRecord>`.
2. THE API_Client SHALL definir una interfaz con el método `clockOut(request: ClockOutRequest)` que retorne `Promise<AttendanceRecord>`.
3. THE API_Client SHALL definir una interfaz con el método `getRecords(params: RecordsQueryParams)` que retorne `Promise<PaginatedAttendanceRecords>`, donde RecordsQueryParams incluya worker_id, team_id, company_id, date_from, date_to, status, page y size.
4. THE API_Client SHALL definir una interfaz con el método `getTodayRecords(params?: TodayQueryParams)` que retorne `Promise<TodaySummary>`, donde TodayQueryParams incluya team_id y company_id opcionales.
5. THE API_Client SHALL definir una interfaz con el método `createIncident(request: CreateIncidentRequest)` que retorne `Promise<AttendanceIncident>`.
6. THE API_Client SHALL definir una interfaz con el método `getMe()` que retorne `Promise<User>`.

### Requisito 4: Implementación del cliente API mock

**User Story:** Como desarrollador del equipo móvil, quiero un cliente API mock que devuelva datos realistas de mock-data.json, para que pueda desarrollar y probar pantallas sin depender del backend real.

#### Criterios de Aceptación

1. THE Mock_API_Client SHALL implementar todos los métodos definidos en la interfaz del API_Client.
2. WHEN el método `clockIn` es invocado, THE Mock_API_Client SHALL retornar un AttendanceRecord con status "OPEN", clock_out null, y datos del trabajador obtenidos de mock-data.json.
3. WHEN el método `clockIn` es invocado con method "GPS", THE Mock_API_Client SHALL incluir clock_in_location con los valores de latitude y longitude proporcionados en el request.
4. WHEN el método `clockOut` es invocado, THE Mock_API_Client SHALL retornar un AttendanceRecord con status "CLOSED", clock_out con la hora actual, y total_hours calculado.
5. WHEN el método `getRecords` es invocado, THE Mock_API_Client SHALL retornar una PaginatedAttendanceRecords con registros de prueba que respeten los parámetros page y size.
6. WHEN el método `getTodayRecords` es invocado, THE Mock_API_Client SHALL retornar un TodaySummary con la fecha actual y registros de prueba generados a partir de los workers de mock-data.json.
7. WHEN el método `createIncident` es invocado, THE Mock_API_Client SHALL retornar un AttendanceIncident con status "PENDING", un id UUID generado, y los datos proporcionados en el request.
8. WHEN el método `getMe` es invocado, THE Mock_API_Client SHALL retornar un User con los datos del usuario "trabajador" de mock-data.json (Pedro Fernández, rol TRABAJADOR).
9. THE Mock_API_Client SHALL utilizar los IDs UUID consistentes definidos en mock-data.json para mantener coherencia con los datos de prueba compartidos entre equipos.
10. THE Mock_API_Client SHALL simular un retardo configurable en las respuestas para emular latencia de red realista.

### Requisito 5: Reglas de negocio en el cliente mock

**User Story:** Como desarrollador del equipo móvil, quiero que el cliente mock replique las reglas de negocio del backend, para que las pantallas manejen correctamente los casos de error durante el desarrollo.

#### Criterios de Aceptación

1. WHEN el método `clockIn` es invocado y ya existe un registro abierto (sin clock_out) para el mismo worker_id, THE Mock_API_Client SHALL rechazar la petición con un error de código "ALREADY_CLOCKED_IN" y status HTTP 409.
2. WHEN el método `clockOut` es invocado y no existe un registro abierto para el worker_id, THE Mock_API_Client SHALL rechazar la petición con un error de código "NO_OPEN_RECORD" y status HTTP 404.
3. IF el método `clockIn` recibe un request sin worker_id o sin method, THEN THE Mock_API_Client SHALL rechazar la petición con un error de código "VALIDATION_ERROR" y status HTTP 400.
4. IF el método `createIncident` recibe un request sin worker_id, type, description o affected_date, THEN THE Mock_API_Client SHALL rechazar la petición con un error de código "VALIDATION_ERROR" y status HTTP 400.

### Requisito 6: Mecanismo de alternancia mock/real

**User Story:** Como Integrante 2, quiero un mecanismo de flag para alternar entre el cliente mock y el cliente real, para que cuando el backend esté listo pueda activar las llamadas HTTP reales sin modificar el código de las pantallas.

#### Criterios de Aceptación

1. THE API_Flag SHALL ser una variable de entorno o constante de configuración con nombre `USE_MOCK_API` que acepte valores booleanos.
2. WHEN API_Flag tiene valor `true`, THE API_Client SHALL resolver al Mock_API_Client en toda la aplicación.
3. WHEN API_Flag tiene valor `false`, THE API_Client SHALL resolver al Real_API_Client en toda la aplicación.
4. THE API_Client SHALL exponer una función o provider que retorne la implementación correcta según el valor del API_Flag, sin que las pantallas consumidoras conozcan cuál implementación están usando.
5. THE Real_API_Client SHALL implementar todos los métodos de la interfaz del API_Client realizando llamadas HTTP reales a las URLs base configuradas para attendance-service y auth-service.
6. THE Real_API_Client SHALL incluir el token JWT en el header Authorization de cada petición HTTP.

### Requisito 7: Manejo de errores tipado

**User Story:** Como desarrollador del equipo móvil, quiero un tipo de error consistente para las respuestas de error de la API, para que las pantallas manejen errores de forma uniforme independientemente de si usan mock o real.

#### Criterios de Aceptación

1. THE API_Client SHALL exportar un tipo ApiError que contenga code (string), message (string), statusCode (number) y details opcionales (array de objetos con field y message).
2. WHEN cualquier método del API_Client falla, THE API_Client SHALL rechazar la Promise con un objeto ApiError.
3. THE Mock_API_Client SHALL lanzar errores ApiError con los mismos códigos y estructura que el backend real según la especificación OpenAPI.
