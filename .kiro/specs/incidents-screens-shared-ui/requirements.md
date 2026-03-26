# Documento de Requisitos — Pantallas de Incidencias y Componentes UI Compartidos

## Introducción

Este documento define los requisitos para las pantallas de gestión de incidencias de fichaje y los componentes UI compartidos de la aplicación móvil React Native del Equipo 4. Cubre tres áreas principales:

1. **Pantallas de incidencias**: listado, creación, detalle y resolución de incidencias de fichaje, con control de acceso por rol.
2. **Componentes UI compartidos**: cards, badges de estado, estados de carga/vacío/error reutilizables por todos los integrantes del equipo.
3. **Tema y estilos base**: sistema de colores, tipografía, espaciado y bordes redondeados que unifican la apariencia visual de toda la app.

Este módulo depende de la capa fundacional creada por el Integrante 1 (AuthProvider, navegación, tipos base, `useAuth`, `hasAccess`, `getDataScope`). Los datos se obtienen de datos mock hasta que el backend real (Equipo 1) esté disponible. Los endpoints de incidencias están definidos en `attendance-service.yaml`.

## Glosario

- **IncidentService**: Servicio mock que simula las llamadas a los endpoints de incidencias (`GET /incidents`, `POST /incidents`, `GET /incidents/{incidentId}`, `POST /incidents/{incidentId}/resolve`) usando datos locales.
- **AttendanceIncident**: Objeto que representa una incidencia de fichaje con campos `id`, `worker_id`, `worker_name`, `type`, `description`, `affected_date`, `proposed_clock_in`, `proposed_clock_out`, `status`, `resolution_notes`, `resolved_by`, `created_at`, `resolved_at`.
- **IncidentType**: Tipo de incidencia: `OLVIDO_ENTRADA`, `OLVIDO_SALIDA`, `CORRECCION_HORA`, `FICHAJE_DUPLICADO` u `OTRO`.
- **IncidentStatus**: Estado de una incidencia: `PENDING`, `RESOLVED` o `REJECTED`.
- **StatusBadge**: Componente visual que muestra un estado con código de color (PENDING=naranja, RESOLVED=verde, REJECTED=rojo, OPEN=azul, CLOSED=verde, INCIDENT=naranja).
- **Card**: Componente contenedor presionable con sombra, utilizado para mostrar elementos en listas.
- **LoadingState**: Componente que muestra un spinner centrado con un mensaje de carga.
- **EmptyState**: Componente que muestra un icono, título y mensaje cuando una lista no tiene elementos.
- **ErrorState**: Componente que muestra un mensaje de error con un botón de reintentar.
- **Theme**: Objeto de configuración que define colores, espaciado, tipografía y bordes redondeados de la app.
- **PaginatedResponse**: Interfaz genérica para respuestas paginadas con campos `content`, `page`, `size`, `total_elements` y `total_pages`.
- **ApiError**: Interfaz para errores de API con campos `code`, `message` y `details` opcional.
- **CreateIncidentRequest**: Interfaz para la solicitud de creación de incidencia con campos `worker_id`, `type`, `description`, `affected_date`, `proposed_clock_in` (opcional) y `proposed_clock_out` (opcional).
- **ResolveIncidentRequest**: Interfaz para la solicitud de resolución de incidencia con campos `resolution` (`APPROVE` o `REJECT`) y `notes` (opcional).

## Requisitos

### Requisito 1: Tipos e Interfaces de Incidencias

**Historia de Usuario:** Como integrante del equipo móvil, quiero tipos TypeScript que representen fielmente el contrato de la API de incidencias definido en `attendance-service.yaml`, para que el código sea tipado y consistente con el backend.

#### Criterios de Aceptación

1. THE App SHALL definir un tipo `IncidentType` que contenga exactamente los valores `OLVIDO_ENTRADA`, `OLVIDO_SALIDA`, `CORRECCION_HORA`, `FICHAJE_DUPLICADO` y `OTRO`.
2. THE App SHALL definir un tipo `IncidentStatus` que contenga exactamente los valores `PENDING`, `RESOLVED` y `REJECTED`.
3. THE App SHALL definir una interfaz `AttendanceIncident` con los campos `id` (string UUID), `worker_id` (string UUID), `worker_name` (string), `type` (IncidentType), `description` (string), `affected_date` (string fecha), `proposed_clock_in` (string fecha-hora nullable), `proposed_clock_out` (string fecha-hora nullable), `status` (IncidentStatus), `resolution_notes` (string nullable), `resolved_by` (string UUID nullable), `created_at` (string fecha-hora) y `resolved_at` (string fecha-hora nullable).
4. THE App SHALL definir una interfaz `CreateIncidentRequest` con los campos obligatorios `worker_id` (string UUID), `type` (IncidentType), `description` (string) y `affected_date` (string fecha), y los campos opcionales `proposed_clock_in` (string fecha-hora) y `proposed_clock_out` (string fecha-hora).
5. THE App SHALL definir una interfaz `ResolveIncidentRequest` con el campo obligatorio `resolution` (valor `APPROVE` o `REJECT`) y el campo opcional `notes` (string).
6. THE App SHALL definir una interfaz genérica `PaginatedResponse<T>` con los campos `content` (array de T), `page` (number), `size` (number), `total_elements` (number) y `total_pages` (number).
7. THE App SHALL definir una interfaz `ApiError` con los campos `code` (string), `message` (string) y `details` (array opcional de objetos con `field` y `message`).

### Requisito 2: Tema y Estilos Base de la App

**Historia de Usuario:** Como integrante del equipo móvil, quiero un sistema de tema centralizado con colores, tipografía, espaciado y bordes redondeados, para que todos los integrantes apliquen estilos consistentes en sus pantallas.

#### Criterios de Aceptación

1. THE Theme SHALL definir un color primario rojo `#E30613` y colores neutros para fondos, textos y bordes.
2. THE Theme SHALL definir colores de estado: naranja para PENDING, verde para RESOLVED, azul para OPEN, rojo para REJECTED, verde para CLOSED y naranja para INCIDENT.
3. THE Theme SHALL definir una escala de espaciado basada en múltiplos de 4px (4, 8, 12, 16, 20, 24, 32).
4. THE Theme SHALL definir estilos de tipografía para títulos, subtítulos, cuerpo de texto y texto pequeño, incluyendo tamaño de fuente y peso.
5. THE Theme SHALL definir valores de borderRadius para componentes (small, medium, large).
6. THE Theme SHALL ser exportado como un objeto TypeScript tipado accesible desde cualquier componente de la app.

### Requisito 3: Componente StatusBadge

**Historia de Usuario:** Como integrante del equipo móvil, quiero un componente StatusBadge reutilizable que muestre estados con código de color, para representar visualmente el estado de registros e incidencias en toda la app.

#### Criterios de Aceptación

1. THE StatusBadge SHALL recibir un valor de estado como prop y mostrar una etiqueta de texto con fondo de color correspondiente.
2. WHEN el StatusBadge recibe el estado `PENDING`, THE StatusBadge SHALL mostrar fondo naranja.
3. WHEN el StatusBadge recibe el estado `RESOLVED`, THE StatusBadge SHALL mostrar fondo verde.
4. WHEN el StatusBadge recibe el estado `REJECTED`, THE StatusBadge SHALL mostrar fondo rojo.
5. WHEN el StatusBadge recibe el estado `OPEN`, THE StatusBadge SHALL mostrar fondo azul.
6. WHEN el StatusBadge recibe el estado `CLOSED`, THE StatusBadge SHALL mostrar fondo verde.
7. WHEN el StatusBadge recibe el estado `INCIDENT`, THE StatusBadge SHALL mostrar fondo naranja.
8. THE StatusBadge SHALL incluir la propiedad de accesibilidad `accessibilityRole` con valor `text` y un `accessibilityLabel` descriptivo que incluya el estado.

### Requisito 4: Componente Card

**Historia de Usuario:** Como integrante del equipo móvil, quiero un componente Card presionable con sombra, para mostrar elementos de lista de forma consistente en todas las pantallas de la app.

#### Criterios de Aceptación

1. THE Card SHALL renderizar un contenedor con fondo blanco, bordes redondeados y sombra sutil.
2. THE Card SHALL aceptar una prop `onPress` opcional que convierta el contenedor en un elemento presionable.
3. WHEN la prop `onPress` está definida, THE Card SHALL proporcionar retroalimentación visual al ser presionada (opacidad reducida).
4. THE Card SHALL renderizar cualquier contenido hijo (`children`) dentro del contenedor.
5. THE Card SHALL aceptar una prop `style` opcional para permitir personalización adicional de estilos.
6. THE Card SHALL utilizar los valores de espaciado y borderRadius definidos en el Theme.

### Requisito 5: Componente LoadingState

**Historia de Usuario:** Como integrante del equipo móvil, quiero un componente de estado de carga reutilizable, para mostrar un indicador visual consistente mientras se obtienen datos en cualquier pantalla.

#### Criterios de Aceptación

1. THE LoadingState SHALL mostrar un spinner de actividad centrado vertical y horizontalmente en su contenedor.
2. THE LoadingState SHALL aceptar una prop `message` opcional y mostrar un texto debajo del spinner cuando se proporcione.
3. THE LoadingState SHALL utilizar el color primario del Theme para el spinner.
4. THE LoadingState SHALL incluir la propiedad de accesibilidad `accessibilityLabel` con el texto "Cargando" o el mensaje proporcionado.

### Requisito 6: Componente EmptyState

**Historia de Usuario:** Como integrante del equipo móvil, quiero un componente de estado vacío reutilizable, para informar al usuario de forma clara cuando una lista no tiene elementos.

#### Criterios de Aceptación

1. THE EmptyState SHALL mostrar un icono, un título y un mensaje descriptivo centrados en su contenedor.
2. THE EmptyState SHALL aceptar las props `icon` (string nombre del icono), `title` (string) y `message` (string).
3. THE EmptyState SHALL utilizar colores neutros del Theme para el icono y el texto.
4. THE EmptyState SHALL incluir la propiedad de accesibilidad `accessibilityRole` con valor `text` y un `accessibilityLabel` que combine título y mensaje.

### Requisito 7: Componente ErrorState

**Historia de Usuario:** Como integrante del equipo móvil, quiero un componente de estado de error reutilizable con botón de reintentar, para manejar errores de carga de datos de forma consistente en toda la app.

#### Criterios de Aceptación

1. THE ErrorState SHALL mostrar un mensaje de error centrado en su contenedor.
2. THE ErrorState SHALL aceptar las props `message` (string) y `onRetry` (función callback).
3. WHEN el usuario presiona el botón de reintentar, THE ErrorState SHALL invocar la función `onRetry` proporcionada.
4. THE ErrorState SHALL mostrar el botón de reintentar con el color primario del Theme.
5. THE ErrorState SHALL incluir la propiedad de accesibilidad `accessibilityRole` con valor `button` en el botón de reintentar y un `accessibilityLabel` con el texto "Reintentar".

### Requisito 8: Servicio Mock de Incidencias

**Historia de Usuario:** Como integrante del equipo móvil, quiero un servicio mock que simule los endpoints de incidencias de `attendance-service.yaml`, para desarrollar las pantallas de incidencias sin depender del backend real del Equipo 1.

#### Criterios de Aceptación

1. THE IncidentService SHALL implementar una función `listIncidents` que devuelva una `PaginatedResponse<AttendanceIncident>` filtrable por `status` (IncidentStatus), `date_from` (string fecha) y `date_to` (string fecha), con paginación por `page` y `size`.
2. THE IncidentService SHALL implementar una función `createIncident` que reciba un `CreateIncidentRequest` y devuelva un nuevo `AttendanceIncident` con estado `PENDING`, un `id` UUID generado y `created_at` con la fecha-hora actual.
3. THE IncidentService SHALL implementar una función `getIncident` que reciba un `incidentId` (string UUID) y devuelva el `AttendanceIncident` correspondiente.
4. IF la función `getIncident` recibe un `incidentId` que no existe, THEN THE IncidentService SHALL devolver un `ApiError` con código `NOT_FOUND`.
5. THE IncidentService SHALL implementar una función `resolveIncident` que reciba un `incidentId` y un `ResolveIncidentRequest`, y devuelva el `AttendanceIncident` actualizado con estado `RESOLVED` o `REJECTED` según el campo `resolution`.
6. IF la función `resolveIncident` recibe un `incidentId` de una incidencia que no tiene estado `PENDING`, THEN THE IncidentService SHALL devolver un `ApiError` con código `INVALID_STATUS`.
7. THE IncidentService SHALL filtrar las incidencias según el alcance de datos del rol del usuario autenticado: TRABAJADOR ve incidencias propias, ENCARGADO ve incidencias del equipo, JEFE_OBRA y ADMIN ven todas las incidencias.
8. THE IncidentService SHALL generar datos mock iniciales con incidencias de ejemplo en los tres estados (PENDING, RESOLVED, REJECTED) y con diferentes tipos de incidencia.

### Requisito 9: Pantalla de Listado de Incidencias

**Historia de Usuario:** Como usuario de la app, quiero ver una lista de incidencias de fichaje filtrable por estado, para revisar rápidamente las incidencias pendientes, resueltas o rechazadas.

#### Criterios de Aceptación

1. THE App SHALL mostrar la pantalla de listado de incidencias cuando el usuario navega a la pestaña Incidencias del BottomTabs.
2. THE App SHALL mostrar cada incidencia en un Card con el nombre del trabajador, el tipo de incidencia, la fecha afectada y un StatusBadge con el estado actual.
3. THE App SHALL permitir filtrar las incidencias por estado (PENDING, RESOLVED, REJECTED) mediante controles de filtro visibles en la parte superior de la pantalla.
4. WHEN el usuario selecciona un filtro de estado, THE App SHALL mostrar únicamente las incidencias que coincidan con el estado seleccionado.
5. WHEN no existen incidencias que coincidan con los filtros aplicados, THE App SHALL mostrar el componente EmptyState con un mensaje indicando que no hay incidencias.
6. WHILE las incidencias se están cargando, THE App SHALL mostrar el componente LoadingState.
7. IF ocurre un error al cargar las incidencias, THEN THE App SHALL mostrar el componente ErrorState con un botón de reintentar.
8. WHEN el usuario presiona una incidencia del listado, THE App SHALL navegar a la pantalla de detalle de la incidencia seleccionada.
9. WHEN un usuario con rol TRABAJADOR está autenticado, THE App SHALL mostrar únicamente las incidencias propias del trabajador.
10. WHEN un usuario con rol ENCARGADO está autenticado, THE App SHALL mostrar las incidencias de los trabajadores del equipo que supervisa.
11. WHEN un usuario con rol JEFE_OBRA o ADMIN está autenticado, THE App SHALL mostrar todas las incidencias.
12. WHEN un usuario con rol SOLO_LECTURA o PREVENCION está autenticado, THE App SHALL mostrar las incidencias en modo lectura sin opción de crear ni resolver.

### Requisito 10: Pantalla de Creación de Incidencia

**Historia de Usuario:** Como trabajador, quiero reportar una incidencia de fichaje indicando el tipo, la fecha afectada y una descripción, para que mi supervisor pueda revisarla y resolverla.

#### Criterios de Aceptación

1. THE App SHALL mostrar un formulario de creación de incidencia con campos para tipo de incidencia (selector), fecha afectada (selector de fecha), descripción (campo de texto), hora de entrada propuesta (opcional) y hora de salida propuesta (opcional).
2. THE App SHALL mostrar el selector de tipo de incidencia con las opciones: Olvido de entrada, Olvido de salida, Corrección de hora, Fichaje duplicado y Otro.
3. WHEN el usuario selecciona el tipo `CORRECCION_HORA`, THE App SHALL mostrar los campos de hora de entrada propuesta y hora de salida propuesta.
4. WHEN el usuario envía el formulario con todos los campos obligatorios completos, THE App SHALL invocar la función `createIncident` del IncidentService y navegar de vuelta al listado de incidencias.
5. IF el usuario intenta enviar el formulario sin completar los campos obligatorios (tipo, fecha afectada, descripción), THEN THE App SHALL mostrar mensajes de validación junto a cada campo incompleto.
6. WHILE la incidencia se está creando, THE App SHALL deshabilitar el botón de envío y mostrar un indicador de carga.
7. IF ocurre un error al crear la incidencia, THEN THE App SHALL mostrar un mensaje de error sin perder los datos ingresados por el usuario.
8. WHEN un usuario con rol SOLO_LECTURA, PREVENCION, JEFE_OBRA o ADMIN está autenticado, THE App SHALL ocultar el botón de crear incidencia en la pantalla de listado.
9. WHEN un usuario con rol TRABAJADOR o ENCARGADO está autenticado, THE App SHALL mostrar el botón de crear incidencia en la pantalla de listado.

### Requisito 11: Pantalla de Detalle de Incidencia

**Historia de Usuario:** Como usuario de la app, quiero ver el detalle completo de una incidencia de fichaje, para entender el contexto antes de tomar una decisión o hacer seguimiento.

#### Criterios de Aceptación

1. THE App SHALL mostrar la pantalla de detalle de incidencia con los campos: nombre del trabajador, tipo de incidencia, fecha afectada, descripción, hora de entrada propuesta (si aplica), hora de salida propuesta (si aplica), estado actual (StatusBadge), fecha de creación, notas de resolución (si existen) y nombre del resolutor (si existe).
2. WHEN la incidencia tiene estado `PENDING` y el usuario autenticado tiene rol ENCARGADO, JEFE_OBRA o ADMIN, THE App SHALL mostrar los botones de "Aprobar" y "Rechazar".
3. WHEN la incidencia tiene estado `RESOLVED` o `REJECTED`, THE App SHALL mostrar la información de resolución (notas y fecha) sin botones de acción.
4. WHEN un usuario con rol TRABAJADOR visualiza el detalle de una incidencia, THE App SHALL ocultar los botones de resolución.
5. WHEN un usuario con rol SOLO_LECTURA o PREVENCION visualiza el detalle de una incidencia, THE App SHALL ocultar los botones de resolución.
6. WHILE el detalle de la incidencia se está cargando, THE App SHALL mostrar el componente LoadingState.
7. IF ocurre un error al cargar el detalle de la incidencia, THEN THE App SHALL mostrar el componente ErrorState con un botón de reintentar.

### Requisito 12: Resolución de Incidencias

**Historia de Usuario:** Como encargado o jefe de obra, quiero aprobar o rechazar incidencias de fichaje con notas opcionales, para gestionar las solicitudes de corrección de mi equipo.

#### Criterios de Aceptación

1. WHEN el usuario presiona el botón "Aprobar" en el detalle de una incidencia, THE App SHALL mostrar un campo opcional para notas de resolución y un botón de confirmación.
2. WHEN el usuario presiona el botón "Rechazar" en el detalle de una incidencia, THE App SHALL mostrar un campo opcional para notas de resolución y un botón de confirmación.
3. WHEN el usuario confirma la resolución, THE App SHALL invocar la función `resolveIncident` del IncidentService con el `incidentId`, la resolución (`APPROVE` o `REJECT`) y las notas proporcionadas.
4. WHEN la resolución se completa exitosamente, THE App SHALL actualizar el estado de la incidencia en la pantalla de detalle y navegar de vuelta al listado.
5. WHILE la resolución se está procesando, THE App SHALL deshabilitar los botones de acción y mostrar un indicador de carga.
6. IF ocurre un error al resolver la incidencia, THEN THE App SHALL mostrar un mensaje de error sin perder las notas ingresadas por el usuario.
7. IF un usuario con rol ENCARGADO intenta resolver una incidencia de un trabajador que no pertenece a su equipo, THEN THE App SHALL mostrar un mensaje de error indicando que no tiene permiso para resolver la incidencia.

### Requisito 13: Navegación Interna del Módulo de Incidencias

**Historia de Usuario:** Como usuario de la app, quiero navegar fluidamente entre el listado, la creación y el detalle de incidencias, para gestionar incidencias sin perder contexto.

#### Criterios de Aceptación

1. THE App SHALL implementar un stack navigator interno dentro de la pestaña Incidencias con las rutas: listado (pantalla principal), detalle de incidencia y creación de incidencia.
2. WHEN el usuario presiona una incidencia en el listado, THE App SHALL navegar a la pantalla de detalle pasando el `incidentId` como parámetro de ruta.
3. WHEN el usuario presiona el botón de crear incidencia en el listado, THE App SHALL navegar a la pantalla de creación de incidencia.
4. WHEN el usuario completa la creación o resolución de una incidencia, THE App SHALL navegar de vuelta al listado y refrescar la lista de incidencias.
5. THE App SHALL mostrar un botón de retroceso en las pantallas de detalle y creación que permita volver al listado.
