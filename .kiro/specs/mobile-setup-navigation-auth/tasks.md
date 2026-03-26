# Plan de Implementación: Setup, Navegación y Autenticación Móvil

## Visión General

Implementación incremental de la capa fundacional de la app React Native: tipos compartidos, autenticación mock, navegación con rutas protegidas por rol, pantallas placeholder y preparación para Cognito. Cada tarea construye sobre la anterior y termina con la integración completa.

## Tareas

- [x] 1. Crear sistema de tipos y estructura base del proyecto
  - [x] 1.1 Crear `src/types/index.ts` con `UserRole`, `User` y `AuthService`
    - Definir el tipo `UserRole` con los 6 valores: `ADMIN`, `JEFE_OBRA`, `ENCARGADO`, `TRABAJADOR`, `PREVENCION`, `SOLO_LECTURA`
    - Definir la interfaz `User` con campos `id`, `email`, `firstName`, `lastName`, `role`
    - Definir la interfaz `AuthService` con métodos `login(userId: string): Promise<User>`, `logout(): Promise<void>`, `getCurrentUser(): Promise<User | null>`
    - _Requisitos: 1.3, 1.4, 7.1_

  - [x] 1.2 Crear `src/utils/roles.ts` con `hasAccess`, `getDataScope` y `roleConfig`
    - Implementar `hasAccess(userRole: UserRole, allowedRoles: UserRole[]): boolean`
    - Implementar `getDataScope(role: UserRole): DataScope` con mapeo ADMIN/JEFE_OBRA→'all', ENCARGADO→'team', TRABAJADOR→'own', PREVENCION→'all', SOLO_LECTURA→'all'
    - Exportar `TAB_VISIBILITY` con la configuración de pestañas visibles por rol
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 1.3 Escribir tests de propiedades para `hasAccess` y `getDataScope`
    - **Propiedad 8: Corrección de hasAccess** — Para cualquier UserRole y lista de roles, `hasAccess(role, list)` devuelve `true` sii `role` está en `list`
    - **Valida: Requisito 6.1**
    - **Propiedad 7: Mapeo de rol a alcance de datos** — Para cualquier UserRole, `getDataScope` devuelve el valor correcto según el mapeo definido
    - **Valida: Requisitos 4.5, 4.6, 4.7, 6.2, 6.3, 6.4, 6.5**

- [x] 2. Implementar MockAuthService y AuthProvider
  - [x] 2.1 Crear `src/auth/MockAuthService.ts`
    - Implementar clase `MockAuthService` que implemente la interfaz `AuthService`
    - Cargar usuarios desde `mock-data.json` transformando `snake_case` a `camelCase`
    - Implementar `login(userId)`: buscar usuario por id, persistir en AsyncStorage, lanzar error si no existe
    - Implementar `logout()`: eliminar `auth_user_id` de AsyncStorage
    - Implementar `getCurrentUser()`: leer `auth_user_id` de AsyncStorage, devolver usuario o null
    - _Requisitos: 2.2, 2.3, 2.4, 2.6, 7.1, 7.3_

  - [x] 2.2 Crear `src/auth/AuthContext.ts` y `src/auth/AuthProvider.tsx`
    - Crear contexto React con tipo `AuthState`: `user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `availableUsers`
    - Crear hook `useAuth()` que consuma el contexto
    - Implementar `AuthProvider` que reciba `AuthService` como dependencia
    - Al montar, restaurar sesión con `authService.getCurrentUser()`
    - Mantener invariante: `isAuthenticated === (user !== null)` siempre
    - _Requisitos: 2.1, 2.3, 2.4, 2.5, 2.6, 7.3_

  - [ ]* 2.3 Escribir tests de propiedades para MockAuthService y AuthProvider
    - **Propiedad 1: Login establece el usuario correcto** — Para cualquier userId válido, `login(userId)` establece el usuario con campos idénticos al mock
    - **Valida: Requisito 2.3**
    - **Propiedad 2: Login/logout round trip** — Para cualquier usuario, login seguido de logout devuelve `user === null` e `isAuthenticated === false`
    - **Valida: Requisito 2.4**
    - **Propiedad 3: Consistencia de isAuthenticated** — `isAuthenticated` es `true` sii `user !== null`, en cualquier estado
    - **Valida: Requisito 2.5**
    - **Propiedad 4: Persistencia round trip** — Login + re-init del provider devuelve el mismo usuario
    - **Valida: Requisito 2.6**

- [x] 3. Checkpoint — Verificar tipos, auth mock y utilidades
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 4. Implementar pantallas placeholder y LoginScreen
  - [x] 4.1 Crear pantallas placeholder: `DashboardScreen`, `ClockScreen`, `RecordsScreen`, `IncidentsScreen`
    - Cada placeholder muestra título, nombre del usuario autenticado, rol actual y nombre del integrante asignado
    - `DashboardScreen`: muestra nombre y rol del usuario (Integrante 2)
    - `ClockScreen`: indica "Será implementada por Integrante 3"
    - `RecordsScreen`: indica "Será implementada por Integrante 4"
    - `IncidentsScreen`: indica "Será implementada por Integrante 5"
    - Usar `useAuth()` para obtener el usuario actual en cada pantalla
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.2 Crear `src/screens/LoginScreen.tsx` con selector de rol
    - Renderizar `FlatList` con todos los usuarios de `availableUsers` del AuthProvider
    - Cada item muestra nombre completo (`firstName lastName`) y badge de rol con color diferenciado
    - Al pulsar un item, invocar `login(user.id)` del AuthProvider
    - _Requisitos: 3.1, 3.2, 3.4_

  - [ ]* 4.3 Escribir test de propiedad para LoginScreen (RoleSelector)
    - **Propiedad 6: RoleSelector muestra todos los usuarios mock** — Para cualquier conjunto de usuarios mock, el selector renderiza exactamente un elemento por usuario con nombre y rol
    - **Valida: Requisito 3.1**

- [x] 5. Implementar navegación con rutas protegidas por rol
  - [x] 5.1 Crear `src/navigation/BottomTabs.tsx`
    - Configurar 4 pestañas: Inicio (Dashboard), Fichaje (Clock), Registros (Records), Incidencias (Incidents)
    - Filtrar pestañas visibles según el rol del usuario usando `TAB_VISIBILITY` y `hasAccess`
    - Ocultar pestañas Fichaje e Incidencias para rol `SOLO_LECTURA`
    - _Requisitos: 4.4, 6.1, 6.6_

  - [x] 5.2 Crear `src/navigation/MainStack.tsx`
    - Si `!isAuthenticated`: mostrar `LoginScreen` (rama de autenticación)
    - Si `isAuthenticated`: mostrar `BottomTabs` (rama de app autenticada)
    - Usar renderizado condicional (no `initialRouteName`)
    - _Requisitos: 3.3, 3.5, 4.1, 4.2, 4.3_

  - [x] 5.3 Crear `src/navigation/linking.ts` con configuración de deep links
    - Configurar prefijo `construction://`
    - Mapear `construction://callback` a la pantalla Dashboard
    - _Requisitos: 4.8_

  - [ ]* 5.4 Escribir tests de propiedades para navegación
    - **Propiedad 5: Estado de navegación sigue al estado de autenticación** — Si `isAuthenticated` es false se muestra LoginScreen, si es true se muestra BottomTabs
    - **Valida: Requisitos 3.5, 4.2, 4.3**
    - **Propiedad 9: Redirección en acceso no autorizado** — Si el rol del usuario no tiene permiso para una ruta, se redirige a Dashboard
    - **Valida: Requisito 6.6**
    - **Propiedad 10: Propagación del contexto de autenticación** — Cada pantalla placeholder muestra el rol del usuario autenticado
    - **Valida: Requisitos 5.1, 5.5**

- [x] 6. Integrar App.tsx y configuración Cognito
  - [x] 6.1 Crear `src/App.tsx` como entry point
    - Envolver la app con `AuthProvider` pasando `MockAuthService` como implementación
    - Envolver con `NavigationContainer` usando la configuración de `linking.ts`
    - _Requisitos: 2.1, 4.1, 4.8_

  - [x] 6.2 Crear `src/config/cognito.ts` con configuración placeholder
    - Exportar objeto `cognitoConfig` con `issuer`, `clientId`, `redirectUrl: 'construction://callback'`, `scopes` y `additionalParameters`
    - Todos los valores son placeholder para futura sustitución por el Equipo 2
    - _Requisitos: 7.2_

- [x] 7. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.
  - Verificar que la app compila sin errores de TypeScript
  - Verificar que el flujo login → navegación → logout funciona correctamente

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan corrección universal con `fast-check`
- Los tests unitarios validan ejemplos específicos y edge cases
