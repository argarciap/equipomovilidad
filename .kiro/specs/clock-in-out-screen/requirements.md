# Documento de Requisitos — Pantalla de Fichaje (Clock-In / Clock-Out)

## Introducción

Este documento define los requisitos para la pantalla de fichaje (clock-in / clock-out) de la aplicación móvil React Native. El módulo reemplaza el `ClockScreen` placeholder del Integrante 1 y permite a los trabajadores registrar su entrada y salida mediante cuatro métodos: QR, NFC, MANUAL y GPS. Se integra con la capa fundacional existente (AuthProvider, useAuth, navegación, utilidades de rol) y consume los endpoints del servicio de asistencia (POST /clock-in, POST /clock-out, GET /records/today). Incluye un cliente API mock para desarrollo sin backend real y manejo completo de errores de API y hardware.

## Glosario

- **ClockScreen**: Pantalla principal de fichaje que muestra el estado actual del trabajador y el botón de acción contextual (entrada/salida).
- **MethodSelectorModal**: Modal que presenta los cuatro métodos de fichaje disponibles (QR, NFC, MANUAL, GPS) para que el usuario seleccione uno.
- **FeedbackOverlay**: Overlay visual que muestra el resultado de la operación de fichaje (confirmación o error) con auto-cierre.
- **QRScannerScreen**: Pantalla de cámara que utiliza `react-native-vision-camera` para escanear códigos QR.
- **AttendanceApiClient**: Interfaz del cliente API que abstrae las llamadas a los endpoints de asistencia (clock-in, clock-out, records/today).
- **MockAttendanceClient**: Implementación mock del AttendanceApiClient que devuelve respuestas realistas basadas en `mock-data.json` sin necesidad de backend real.
- **GPSService**: Servicio que encapsula la captura de ubicación GPS usando `@react-native-community/geolocation`.
- **NFCService**: Servicio que encapsula la lectura de tags NFC usando `react-native-nfc-manager`.
- **ClockMethod**: Tipo enumerado con los valores QR, NFC, MANUAL y GPS que representa los métodos de fichaje disponibles.
- **ClockStatus**: Estado del fichaje del trabajador: CLOCKED_IN (fichado), CLOCKED_OUT (no fichado), LOADING o ERROR.
- **AttendanceRecord**: Registro de asistencia retornado por el API con datos de entrada, salida, método, ubicación y estado.
- **TodaySummary**: Resumen del día actual retornado por GET /records/today con los registros del trabajador.
- **ClockRequest**: Objeto de petición enviado al API con worker_id, method y opcionalmente coordenadas GPS.
- **ClockResult**: Resultado de una operación de fichaje que contiene success (boolean), record (si éxito) o error (si fallo).
- **AuthProvider**: Contexto de autenticación existente (Integrante 1) que provee el usuario autenticado mediante el hook useAuth().
- **StatusIndicator**: Componente visual que muestra el estado actual de fichaje del trabajador (fichado/no fichado) con la hora de entrada si aplica.

## Requisitos

### Requisito 1: Estado Actual del Trabajador y Botón Contextual

**Historia de Usuario:** Como trabajador, quiero ver mi estado actual de fichaje (fichado o no fichado) y un botón que cambie según mi estado, para saber si necesito fichar entrada o salida.

#### Criterios de Aceptación

1. WHEN el ClockScreen se monta, THE ClockScreen SHALL consultar GET /records/today con el worker_id del usuario autenticado para determinar el estado de fichaje actual.
2. WHEN existe un AttendanceRecord con status OPEN y worker_id igual al usuario autenticado en los registros del día, THE StatusIndicator SHALL mostrar el estado "Fichado" junto con la hora de entrada del registro abierto.
3. WHEN no existe un AttendanceRecord con status OPEN para el usuario autenticado en los registros del día, THE StatusIndicator SHALL mostrar el estado "No fichado".
4. WHILE el estado del trabajador es CLOCKED_OUT, THE ClockScreen SHALL mostrar el botón con la etiqueta "Fichar Entrada".
5. WHILE el estado del trabajador es CLOCKED_IN, THE ClockScreen SHALL mostrar el botón con la etiqueta "Fichar Salida".
6. WHILE el estado del trabajador es LOADING, THE ClockScreen SHALL deshabilitar el botón de acción y mostrar un indicador de carga.

### Requisito 2: Selector de Método de Fichaje como Modal

**Historia de Usuario:** Como trabajador, quiero seleccionar el método de fichaje (QR, NFC, MANUAL, GPS) desde un modal, para elegir el método más conveniente según mi situación.

#### Criterios de Aceptación

1. WHEN el trabajador pulsa el botón de acción (Fichar Entrada o Fichar Salida), THE ClockScreen SHALL abrir el MethodSelectorModal.
2. THE MethodSelectorModal SHALL mostrar los cuatro métodos de fichaje disponibles: QR, NFC, MANUAL y GPS, cada uno con un icono y etiqueta descriptiva.
3. WHEN el trabajador selecciona un método en el MethodSelectorModal, THE MethodSelectorModal SHALL cerrarse e iniciar el flujo de fichaje con el método seleccionado.
4. WHEN el trabajador pulsa fuera del modal o un botón de cancelar, THE MethodSelectorModal SHALL cerrarse sin iniciar ningún fichaje.
5. WHILE el dispositivo no dispone de hardware NFC, THE MethodSelectorModal SHALL ocultar la opción NFC del selector de métodos.

### Requisito 3: Integración con Cámara para Escaneo QR

**Historia de Usuario:** Como trabajador, quiero escanear un código QR de la obra con la cámara del dispositivo para registrar mi fichaje de forma rápida y verificable.

#### Criterios de Aceptación

1. WHEN el trabajador selecciona el método QR, THE QRScannerScreen SHALL solicitar permisos de cámara al sistema operativo si no están concedidos.
2. WHEN los permisos de cámara están concedidos, THE QRScannerScreen SHALL mostrar el visor de cámara con un overlay de área de escaneo utilizando react-native-vision-camera.
3. WHEN el QRScannerScreen detecta un código QR, THE QRScannerScreen SHALL validar que el payload sea un UUID válido con formato xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.
4. WHEN el payload QR es un UUID válido, THE QRScannerScreen SHALL enviar la petición de fichaje al AttendanceApiClient con method QR.
5. IF el payload QR no es un UUID válido, THEN THE QRScannerScreen SHALL mostrar el mensaje de error "Código QR no válido. Escanea el código de la obra." y permitir reintentar el escaneo.
6. IF los permisos de cámara son denegados, THEN THE ClockScreen SHALL mostrar una alerta solicitando activar permisos en ajustes y deshabilitar la opción QR en el MethodSelectorModal.

### Requisito 4: Integración con GPS para Fichaje por Ubicación

**Historia de Usuario:** Como trabajador, quiero fichar usando mi ubicación GPS para que quede registrado dónde me encuentro al momento del fichaje.

#### Criterios de Aceptación

1. WHEN el trabajador selecciona el método GPS, THE GPSService SHALL solicitar permisos de ubicación al sistema operativo si no están concedidos.
2. WHEN los permisos de ubicación están concedidos, THE GPSService SHALL obtener la posición actual del dispositivo con enableHighAccuracy activado.
3. THE ClockRequest enviado al API con método GPS SHALL incluir latitude en el rango [-90, 90] y longitude en el rango [-180, 180].
4. IF los permisos de ubicación son denegados, THEN THE ClockScreen SHALL mostrar una alerta solicitando activar permisos en ajustes y deshabilitar la opción GPS en el MethodSelectorModal.
5. IF el GPSService no obtiene la posición dentro de 10 segundos, THEN THE ClockScreen SHALL mostrar el mensaje "No se pudo obtener la ubicación. Inténtalo de nuevo o usa otro método."
6. IF el servicio de ubicación del dispositivo está desactivado, THEN THE ClockScreen SHALL mostrar una alerta solicitando activar la ubicación.

### Requisito 5: Integración con NFC para Fichaje por Etiqueta

**Historia de Usuario:** Como trabajador, quiero fichar acercando mi dispositivo a una etiqueta NFC de la obra para un registro rápido y sin interacción manual.

#### Criterios de Aceptación

1. WHEN el trabajador selecciona el método NFC, THE NFCService SHALL iniciar la lectura de tags NFC.
2. WHEN el NFCService lee un tag NFC correctamente, THE ClockScreen SHALL enviar la petición de fichaje al AttendanceApiClient con method NFC.
3. IF el dispositivo no dispone de hardware NFC, THEN THE MethodSelectorModal SHALL ocultar la opción NFC.
4. IF la lectura NFC falla, THEN THE ClockScreen SHALL mostrar el mensaje "No se pudo leer la etiqueta NFC. Acerca el dispositivo de nuevo."
5. IF la lectura NFC supera el tiempo de espera, THEN THE ClockScreen SHALL mostrar el mensaje "Tiempo de lectura NFC agotado. Inténtalo de nuevo."

### Requisito 6: Fichaje Manual

**Historia de Usuario:** Como trabajador, quiero poder fichar de forma manual cuando no dispongo de QR, NFC o GPS, para que siempre exista un método de fichaje disponible.

#### Criterios de Aceptación

1. WHEN el trabajador selecciona el método MANUAL, THE ClockScreen SHALL enviar la petición de fichaje al AttendanceApiClient con method MANUAL sin requerir datos adicionales de hardware.
2. THE ClockRequest enviado con método MANUAL SHALL contener worker_id y method como únicos campos obligatorios.

### Requisito 7: Feedback Visual con Overlay de Confirmación/Error

**Historia de Usuario:** Como trabajador, quiero ver un feedback visual claro tras fichar, para saber si mi fichaje se registró correctamente o si hubo un error.

#### Criterios de Aceptación

1. WHEN el fichaje se completa con éxito (ClockResult.success es true), THE FeedbackOverlay SHALL mostrar una animación de confirmación (✓) con el mensaje de hora de registro.
2. WHEN el fichaje falla (ClockResult.success es false), THE FeedbackOverlay SHALL mostrar una animación de error (✗) con el mensaje descriptivo de ClockResult.error.message.
3. THE FeedbackOverlay SHALL cerrarse automáticamente tras un timeout configurable.
4. WHEN el trabajador pulsa sobre el FeedbackOverlay, THE FeedbackOverlay SHALL cerrarse inmediatamente.
5. WHEN el fichaje se completa con éxito, THE ClockScreen SHALL refrescar automáticamente el estado consultando GET /records/today y actualizar el StatusIndicator y el botón de acción.

### Requisito 8: Mock API Client para Desarrollo

**Historia de Usuario:** Como desarrollador del equipo móvil, quiero un cliente API mock que devuelva respuestas realistas sin necesidad de backend real, para poder desarrollar y probar la pantalla de fichaje de forma independiente.

#### Criterios de Aceptación

1. THE MockAttendanceClient SHALL implementar la interfaz AttendanceApiClient con los métodos clockIn, clockOut y getTodayRecords.
2. WHEN se invoca clockIn en el MockAttendanceClient, THE MockAttendanceClient SHALL crear un AttendanceRecord con status OPEN, el worker_id del request, el method del request y la fecha/hora actual.
3. WHEN se invoca clockOut en el MockAttendanceClient con un worker_id que tiene un registro OPEN, THE MockAttendanceClient SHALL cerrar el registro con status CLOSED, registrar clock_out_method y calcular total_hours.
4. WHEN se invoca clockIn en el MockAttendanceClient con un worker_id que ya tiene un registro OPEN, THE MockAttendanceClient SHALL lanzar un error con código ALREADY_CLOCKED_IN simulando una respuesta HTTP 409.
5. WHEN se invoca clockOut en el MockAttendanceClient con un worker_id que no tiene un registro OPEN, THE MockAttendanceClient SHALL lanzar un error con código NO_OPEN_RECORD simulando una respuesta HTTP 404.
6. THE MockAttendanceClient SHALL utilizar los IDs de usuarios de mock-data.json para generar nombres de trabajador realistas en los registros.
7. THE AttendanceApiClient SHALL definirse como interfaz para que la implementación mock pueda sustituirse por una implementación HTTP real sin modificar los componentes consumidores.

### Requisito 9: Manejo de Errores de API

**Historia de Usuario:** Como trabajador, quiero recibir mensajes de error claros cuando el fichaje falla por razones del servidor, para entender qué ocurrió y qué acción tomar.

#### Criterios de Aceptación

1. WHEN el API responde con código 409 (ALREADY_CLOCKED_IN), THE ClockScreen SHALL mostrar el mensaje "Ya tienes una entrada abierta. Registra tu salida primero." y refrescar el estado.
2. WHEN el API responde con código 404 (NO_OPEN_RECORD), THE ClockScreen SHALL mostrar el mensaje "No hay entrada abierta para registrar salida." y refrescar el estado.
3. WHEN el API responde con código 400 (Bad Request), THE ClockScreen SHALL mostrar el mensaje "Datos de fichaje inválidos."
4. IF la conexión de red no está disponible, THEN THE ClockScreen SHALL mostrar el mensaje "Sin conexión. Verifica tu conexión a internet."
5. IF la petición al API supera el tiempo de espera, THEN THE ClockScreen SHALL mostrar el mensaje "La operación tardó demasiado. Inténtalo de nuevo."
6. WHEN ocurre un error de API (409 o 404), THE ClockScreen SHALL refrescar el estado de fichaje para sincronizar la interfaz con el servidor.

### Requisito 10: Protección contra Fichaje Duplicado y Seguridad

**Historia de Usuario:** Como sistema, quiero prevenir fichajes duplicados por doble pulsación y garantizar que cada trabajador solo pueda fichar por sí mismo, para mantener la integridad de los registros de asistencia.

#### Criterios de Aceptación

1. WHILE una operación de fichaje está en curso (isPunching es true), THE ClockScreen SHALL deshabilitar el botón de acción e ignorar nuevas pulsaciones.
2. THE ClockRequest SHALL utilizar siempre el user.id del usuario autenticado obtenido de useAuth() como worker_id, sin permitir que el usuario introduzca un worker_id diferente.
3. WHEN se construye un ClockRequest, THE ClockScreen SHALL obtener el worker_id exclusivamente del contexto de autenticación (useAuth().user.id).

### Requisito 11: Validación de Datos del Request de Fichaje

**Historia de Usuario:** Como sistema, quiero validar los datos del request de fichaje antes de enviarlo al API, para prevenir errores y garantizar la consistencia de los datos.

#### Criterios de Aceptación

1. THE ClockRequest SHALL contener un worker_id que sea un UUID válido.
2. THE ClockRequest SHALL contener un method que sea uno de los valores: QR, NFC, MANUAL o GPS.
3. WHEN el method es GPS, THE ClockRequest SHALL incluir latitude en el rango [-90, 90] y longitude en el rango [-180, 180].
4. WHEN el method es QR, NFC o MANUAL, THE ClockRequest SHALL omitir los campos latitude y longitude o enviarlos como undefined.

### Requisito 12: Preservación del Método de Fichaje en el Registro

**Historia de Usuario:** Como sistema, quiero que el método de fichaje seleccionado se preserve correctamente en el registro de asistencia, para mantener trazabilidad del método utilizado.

#### Criterios de Aceptación

1. WHEN se completa un clock-in exitoso, THE AttendanceRecord retornado SHALL tener clock_in_method igual al method enviado en el ClockRequest.
2. WHEN se completa un clock-out exitoso, THE AttendanceRecord retornado SHALL tener clock_out_method igual al method enviado en el ClockRequest.
