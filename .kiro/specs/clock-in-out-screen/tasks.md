# Plan de Implementación: Pantalla de Fichaje (Clock-In / Clock-Out)

## Visión General

Implementación incremental del módulo de fichaje para React Native. Se reemplaza el placeholder `ClockScreen` del Integrante 1 con la pantalla completa que soporta cuatro métodos de fichaje (GPS, QR, NFC, MANUAL), cliente API mock, feedback visual y manejo de errores. Cada tarea construye sobre la anterior, integrándose con la capa fundacional existente (auth, tipos, navegación, roles).

## Tareas

- [x] 1. Definir tipos e interfaces del módulo de fichaje
  - [x] 1.1 Crear `src/types/clock.ts` con todos los tipos del módulo
    - Definir `ClockMethod`, `ClockStatus`, `GeoLocation`, `AttendanceRecord`, `TodaySummary`, `ClockRequest`, `ClockResult`, `ClockError`, `ClockStatusState`, `ClockPunchState`
    - Definir interfaces `AttendanceApiClient`, `GPSService`, `NFCService`, `QRScannerResult`
    - Incluir reglas de validación como comentarios (UUID para worker_id, rangos de lat/lng, etc.)
    - _Requisitos: 11.1, 11.2, 11.3, 11.4, 12.1, 12.2_

  - [ ]* 1.2 Escribir test de propiedad para validación de ClockRequest
    - **Propiedad 3: Validación de ClockRequest según método**
    - Generar ClockRequest aleatorios y verificar: worker_id es UUID válido, method es QR|NFC|MANUAL|GPS, coordenadas presentes sii method===GPS, coordenadas en rango válido
    - **Valida: Requisitos 11.1, 11.2, 11.3, 11.4**

- [x] 2. Implementar funciones puras de lógica de negocio
  - [x] 2.1 Crear función `determineClockStatus` en `src/services/AttendanceApiClient.ts`
    - Implementar lógica: buscar registro OPEN del worker en TodaySummary → CLOCKED_IN con record, o CLOCKED_OUT con null
    - Exportar la interfaz `AttendanceApiClient` y la función factory
    - _Requisitos: 1.1, 1.2, 1.3_

  - [x] 2.2 Crear función `validateQRPayload` en `src/services/AttendanceApiClient.ts`
    - Validar que el payload sea UUID con regex `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`
    - Retornar `{ valid, errorMessage? }`
    - _Requisitos: 3.3, 3.5_

  - [ ]* 2.3 Escribir test de propiedad para determineClockStatus
    - **Propiedad 1: Consistencia entre estado visual y registro abierto**
    - Generar TodaySummary con registros aleatorios (OPEN/CLOSED) y verificar: CLOCKED_IN ↔ existe registro OPEN del worker
    - **Valida: Requisitos 1.2, 1.3**

  - [ ]* 2.4 Escribir test de propiedad para validateQRPayload
    - **Propiedad 7: QR payload debe ser UUID válido**
    - Generar UUIDs válidos → valid=true, generar strings aleatorios no-UUID → valid=false
    - **Valida: Requisitos 3.3, 3.5**

- [x] 3. Implementar MockAttendanceClient
  - [x] 3.1 Crear `src/services/MockAttendanceClient.ts`
    - Implementar `AttendanceApiClient` con almacenamiento en memoria (Map<string, AttendanceRecord>)
    - `clockIn`: crear registro OPEN, lanzar error ALREADY_CLOCKED_IN si ya existe registro abierto
    - `clockOut`: cerrar registro OPEN con status CLOSED y calcular total_hours, lanzar error NO_OPEN_RECORD si no existe
    - `getTodayRecords`: retornar TodaySummary con registros del worker
    - Usar IDs de `mock-data.json` para nombres realistas
    - _Requisitos: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 3.2 Escribir test de propiedad para idempotencia de clock-in (409)
    - **Propiedad 4: Idempotencia de clock-in — error 409**
    - Ejecutar clockIn, luego clockIn de nuevo con mismo worker → debe lanzar ALREADY_CLOCKED_IN
    - **Valida: Requisitos 8.4, 9.1**

  - [ ]* 3.3 Escribir test de propiedad para preservación de método
    - **Propiedad 5: Método de fichaje se preserva en el registro**
    - Generar ClockMethod aleatorio, ejecutar clockIn → record.clock_in_method === method
    - **Valida: Requisitos 12.1, 12.2**

  - [ ]* 3.4 Escribir test de propiedad para round-trip clock-in/clock-out
    - **Propiedad 10: Round-trip de clock-in / clock-out**
    - Ejecutar clockIn + clockOut → registro CLOSED, clock_out no nulo, total_hours calculado
    - **Valida: Requisitos 7.5, 8.2, 8.3, 8.5**

- [x] 4. Checkpoint — Verificar tipos, funciones puras y mock client
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 5. Implementar servicios de hardware (GPS y NFC)
  - [x] 5.1 Crear `src/services/GPSService.ts`
    - Encapsular `@react-native-community/geolocation` con `getCurrentPosition` (enableHighAccuracy, timeout 10s)
    - Implementar `isAvailable()` y manejo de permisos
    - _Requisitos: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [x] 5.2 Crear `src/services/NFCService.ts`
    - Encapsular `react-native-nfc-manager` con `readTag()`, `isAvailable()`, `cancelRead()`
    - Manejar errores de lectura y timeout
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 6. Implementar hooks personalizados
  - [x] 6.1 Crear `src/hooks/useClockStatus.ts`
    - Consultar `getTodayRecords` al montar, usar `determineClockStatus` para derivar estado
    - Exponer `status`, `currentRecord`, `todaySummary`, `refresh()`
    - _Requisitos: 1.1, 1.2, 1.3, 1.6_

  - [x] 6.2 Crear `src/hooks/useClockPunch.ts`
    - Implementar `punch(method)`: construir ClockRequest con user.id, ejecutar clockIn o clockOut según estado, invocar onSuccess al completar
    - Manejar `isPunching` flag para prevenir doble pulsación
    - Integrar GPSService para método GPS (capturar coordenadas antes de enviar)
    - _Requisitos: 1.4, 1.5, 4.2, 4.3, 6.1, 6.2, 10.1, 10.2, 10.3_

  - [x] 6.3 Crear `src/hooks/useGPSLocation.ts`
    - Wrapper de GPSService como hook React con `getLocation()` e `isAvailable`
    - _Requisitos: 4.1, 4.2_

  - [ ]* 6.4 Escribir test de propiedad para acción contextual según estado
    - **Propiedad 2: Acción contextual correcta según estado**
    - Generar ClockStatus aleatorio → CLOCKED_OUT ejecuta clock-in, CLOCKED_IN ejecuta clock-out
    - **Valida: Requisitos 1.4, 1.5**

  - [ ]* 6.5 Escribir test de propiedad para worker_id del usuario autenticado
    - **Propiedad 9: El worker_id del request siempre coincide con el usuario autenticado**
    - Generar user aleatorio, ejecutar punch → request.worker_id === user.id
    - **Valida: Requisitos 10.2, 10.3**

  - [ ]* 6.6 Escribir test de propiedad para protección contra doble pulsación
    - **Propiedad 8: No se puede ejecutar punch durante operación en curso**
    - Verificar que invocar punch mientras isPunching===true no inicia nueva petición
    - **Valida: Requisito 10.1**

- [x] 7. Checkpoint — Verificar servicios y hooks
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 8. Implementar componentes de UI
  - [x] 8.1 Crear `src/components/StatusIndicator.tsx`
    - Mostrar "Fichado" con hora de entrada cuando CLOCKED_IN, "No fichado" cuando CLOCKED_OUT
    - Mostrar indicador de carga cuando LOADING
    - Incluir accessibilityLabel y accessibilityRole apropiados
    - _Requisitos: 1.2, 1.3, 1.6_

  - [x] 8.2 Crear `src/components/MethodSelectorModal.tsx`
    - Modal con los 4 métodos: GPS (📍), QR (📷), NFC (📱), MANUAL (✋)
    - Ocultar NFC si `NFCService.isAvailable()` retorna false
    - Cerrar al seleccionar método o al cancelar
    - _Requisitos: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 8.3 Crear `src/components/FeedbackOverlay.tsx`
    - Mostrar confirmación (✓) con hora cuando success=true
    - Mostrar error (✗) con mensaje cuando success=false
    - Auto-cierre con timeout configurable, cierre manual al pulsar
    - _Requisitos: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 8.4 Escribir test de propiedad para feedback visual
    - **Propiedad 6: Feedback visual corresponde al resultado**
    - Generar ClockResult aleatorio → success=true muestra confirmación, success=false muestra error
    - **Valida: Requisitos 7.1, 7.2**

- [x] 9. Implementar QRScannerScreen
  - [x] 9.1 Crear `src/components/QRScannerScreen.tsx`
    - Solicitar permisos de cámara, mostrar visor con react-native-vision-camera
    - Detectar QR, validar payload con `validateQRPayload`, retornar resultado al padre
    - Manejar errores de permisos y QR inválido
    - _Requisitos: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 10. Reemplazar ClockScreen placeholder e integrar todo
  - [x] 10.1 Reescribir `src/screens/ClockScreen.tsx` con la implementación completa
    - Importar `useAuth` desde `'../auth/AuthContext'`, tipos desde `'../types'`
    - Usar hooks `useClockStatus`, `useClockPunch`
    - Integrar `StatusIndicator`, `MethodSelectorModal`, `FeedbackOverlay`, `QRScannerScreen`
    - Mantener `export function ClockScreen()` para compatibilidad con BottomTabs
    - Manejar errores de API (409, 404, 400, red, timeout) con mensajes en español
    - Refrescar estado tras fichaje exitoso y tras errores 409/404
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 7.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 10.2 Escribir tests unitarios para ClockScreen
    - Verificar render con estado CLOCKED_OUT muestra "Fichar Entrada"
    - Verificar render con estado CLOCKED_IN muestra "Fichar Salida"
    - Verificar que el botón se deshabilita durante isPunching
    - _Requisitos: 1.4, 1.5, 10.1_

- [x] 11. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan propiedades universales de corrección usando fast-check
- Los tests unitarios validan ejemplos específicos y casos borde
- El export de `ClockScreen` debe mantener el mismo nombre y ubicación para no romper `BottomTabs.tsx`
