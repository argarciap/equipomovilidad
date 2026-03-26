# Plan de Implementación: Setup, Navegación y Autenticación Móvil

## Visión General

Implementación incremental de la capa fundacional de la app React Native: tipos compartidos, autenticación mock, navegación con rutas protegidas por rol, pantallas placeholder y utilidades de acceso. Cada tarea construye sobre la anterior y termina con la integración completa.

## Tareas

- [x] 1. Inicializar proyecto y definir tipos base
  - [x] 1.1 Inicializar proyecto React Native con TypeScript estricto
    - Crear proyecto React Native con template TypeScript
    - Configurar `tsconfig.json` con `strict: true`
    - Instalar dependencias: `@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`, `@react-native-async-storage/async-storage`, `react-native-screens`, `react-native-safe-area-context`
    - Instalar dependencias de testing: `jest`, `@testing-library/react-native`, `fast-check`
    - _Requisitos: 1.1, 1.2_

  - [x] 1.2 Crear sistema de tipos compartidos (`src/types/index.ts`)
    - Definir tipo `UserRole` con los 6 valores: `ADMIN`, `JEFE_OBRA`, `ENCARGADO`, `TRABAJADOR`, `PREVENCION`, `SOLO_LECTURA`
    - Definir interfaz `User` con campos `id` (UUID), `email`, `firstName`, `lastName`, `role`
    - Definir interfaz `AuthService` con métodos `login`, `logout`, `getCurrentUser`
    - _Requisitos: 1.3, 1.4, 7.1_

- [x] 2. Implementar capa de autenticación mock
  - [x] 2.1 Implementar `MockAuthService` (`src/auth/MockAuthService.ts`)
    - Implementar clase que cumpla la interfaz `AuthService`
    - Cargar usuarios desde `mock-data.json` con mapeo `snake_case` → `camelCase`
    - Implementar `login(userId)`: buscar usuario por ID, persistir en AsyncStorage, lanzar error si no existe
    - Implementar `logout()`: eliminar `auth_user_id` de AsyncStorage
    - Implementar `getCurrentUser()`: leer userId de AsyncStorage y devolver usuario o null
    - Colocar `mock-data.json` accesible para la app (copiar a `src/data/mock-data.json` o importar desde raíz)
    - _Requisitos: 2.2, 2.3, 2.4, 2.6, 7.1, 7.3_

  - [ ]* 2.2 Tests de propiedad para MockAuthService (`src/auth/MockAuthService.test.ts`)
    - **Propiedad 1: Login establece el usuario correcto**
    - **Valida: Requisito 2.3**

  - [ ]* 2.3 Tests de propiedad para round trip login/logout (`src/auth/MockAuthService.test.ts`)
    - **Propiedad 2: Login/logout es un viaje de ida y vuelta**
    - **Valida: Requisito 2.4**

  - [ ]* 2.4 Test de propiedad para persistencia (`src/auth/MockAuthService.test.ts`)
    - **Propiedad 4: Persistencia de autenticación (round trip)**
    - **Valida: Requisito 2.6**

  - [ ]* 2.5 Tests unitarios para MockAuthService (`src/auth/MockAuthService.test.ts`)
    - Test: login con userId inexistente lanza error
    - Test: login con string vacío lanza error
    - Test: logout sin usuario autenticado no lanza error
    - _Requisitos: 2.3, 2.4_

- [x] 3. Implementar AuthProvider y contexto React
  - [x] 3.1 Crear AuthContext y AuthProvider (`src/auth/AuthContext.ts`, `src/auth/AuthProvider.tsx`)
    - Crear contexto React con tipo `AuthState` + acciones (`login`, `logout`)
    - Implementar `AuthProvider` que reciba `AuthService` por inyección de dependencias
    - Exponer: `user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `availableUsers`
    - Al montar, restaurar sesión con `authService.getCurrentUser()`
    - Crear hook `useAuth()` para consumir el contexto
    - _Requisitos: 2.1, 2.5, 7.3_

  - [ ]* 3.2 Test de propiedad para consistencia de isAuthenticated (`src/auth/AuthProvider.test.tsx`)
    - **Propiedad 3: Consistencia de isAuthenticated**
    - **Valida: Requisito 2.5**

  - [ ]* 3.3 Tests unitarios para AuthProvider (`src/auth/AuthProvider.test.tsx`)
    - Test: estado inicial tiene `isLoading: true`, `user: null`
    - Test: tras login, `isAuthenticated` es `true` y `user` no es null
    - Test: tras logout, `isAuthenticated` es `false` y `user` es null
    - _Requisitos: 2.1, 2.5_

- [x] 4. Checkpoint — Verificar capa de autenticación
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 5. Implementar utilidades de rol
  - [x] 5.1 Crear utilidades de rol (`src/utils/roles.ts`)
    - Implementar función `hasAccess(userRole, allowedRoles)` que devuelva booleano
    - Implementar función `getDataScope(role)` que devuelva `'own'`, `'team'` o `'all'`
    - Definir constante `TAB_VISIBILITY` con la configuración de pestañas visibles por rol
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 5.2 Test de propiedad para hasAccess (`src/utils/roles.test.ts`)
    - **Propiedad 8: Corrección de hasAccess**
    - **Valida: Requisito 6.1**

  - [ ]* 5.3 Test de propiedad para getDataScope (`src/utils/roles.test.ts`)
    - **Propiedad 7: Mapeo de rol a alcance de datos**
    - **Valida: Requisitos 6.2, 6.3, 6.4, 6.5**

  - [ ]* 5.4 Tests unitarios para utilidades de rol (`src/utils/roles.test.ts`)
    - Test: `hasAccess('ADMIN', ['ADMIN', 'JEFE_OBRA'])` devuelve `true`
    - Test: `hasAccess('TRABAJADOR', ['ADMIN'])` devuelve `false`
    - Test: `getDataScope('TRABAJADOR')` devuelve `'own'`
    - Test: `getDataScope('ENCARGADO')` devuelve `'team'`
    - Test: `TAB_VISIBILITY` excluye SOLO_LECTURA de Clock e Incidents
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 6. Implementar navegación
  - [x] 6.1 Crear MainStack navigator (`src/navigation/MainStack.tsx`)
    - Implementar stack principal con renderizado condicional basado en `isAuthenticated`
    - Si no autenticado → mostrar LoginScreen
    - Si autenticado → mostrar BottomTabs
    - Mostrar indicador de carga mientras `isLoading` es `true`
    - _Requisitos: 4.1, 4.2, 4.3, 3.5_

  - [x] 6.2 Crear BottomTabs navigator (`src/navigation/BottomTabs.tsx`)
    - Implementar navegador de pestañas con 4 tabs: Dashboard, Clock, Records, Incidents
    - Filtrar pestañas visibles según rol del usuario usando `hasAccess` y `TAB_VISIBILITY`
    - _Requisitos: 4.4, 6.6_

  - [x] 6.3 Configurar deep linking (`src/navigation/linking.ts`)
    - Configurar prefijo `construction://` con ruta `callback` → Dashboard
    - _Requisitos: 4.8_

  - [ ]* 6.4 Test de propiedad para navegación según estado de auth (`src/navigation/MainStack.test.tsx`)
    - **Propiedad 5: El estado de navegación sigue al estado de autenticación**
    - **Valida: Requisitos 3.5, 4.2, 4.3**

  - [ ]* 6.5 Test de propiedad para redirección en acceso no autorizado (`src/navigation/MainStack.test.tsx`)
    - **Propiedad 9: Redirección en acceso no autorizado**
    - **Valida: Requisito 6.6**

  - [ ]* 6.6 Tests unitarios para BottomTabs (`src/navigation/BottomTabs.test.tsx`)
    - Test: BottomTabs muestra 4 pestañas para ADMIN
    - Test: BottomTabs oculta Clock e Incidents para SOLO_LECTURA
    - Test: deep link `construction://callback` está configurado
    - _Requisitos: 4.4, 4.8_

- [x] 7. Implementar pantallas
  - [x] 7.1 Crear LoginScreen con RoleSelector (`src/screens/LoginScreen.tsx`)
    - Implementar FlatList con usuarios mock de `availableUsers` del AuthProvider
    - Cada item muestra nombre completo y badge de rol con color diferenciado
    - Al pulsar un item, invocar `login(user.id)`
    - _Requisitos: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 7.2 Test de propiedad para RoleSelector (`src/screens/LoginScreen.test.tsx`)
    - **Propiedad 6: RoleSelector muestra todos los usuarios mock**
    - **Valida: Requisito 3.1**

  - [x] 7.3 Crear pantallas placeholder (`src/screens/`)
    - Implementar `DashboardScreen.tsx`: muestra nombre y rol del usuario autenticado
    - Implementar `ClockScreen.tsx`: indica "Será implementada por Integrante 3"
    - Implementar `RecordsScreen.tsx`: indica "Será implementada por Integrante 4"
    - Implementar `IncidentsScreen.tsx`: indica "Será implementada por Integrante 5"
    - Todas las pantallas muestran el rol del usuario autenticado actual via `useAuth()`
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.4 Test de propiedad para propagación de contexto (`src/screens/PlaceholderScreens.test.tsx`)
    - **Propiedad 10: Propagación del contexto de autenticación a todas las pantallas**
    - **Valida: Requisitos 5.1, 5.5**

  - [ ]* 7.5 Tests unitarios para pantallas placeholder
    - Test: DashboardScreen muestra nombre y rol del usuario
    - Test: ClockScreen muestra texto de Integrante 3
    - Test: RecordsScreen muestra texto de Integrante 4
    - Test: IncidentsScreen muestra texto de Integrante 5
    - _Requisitos: 5.1, 5.2, 5.3, 5.4_

- [x] 8. Integración y configuración Cognito
  - [x] 8.1 Crear configuración placeholder de Cognito (`src/config/cognito.ts`)
    - Crear archivo con valores placeholder: User Pool ID, Client ID, redirect URI `construction://callback`, scopes
    - _Requisitos: 7.2_

  - [x] 8.2 Crear entry point de la app (`src/App.tsx`)
    - Envolver la app con `AuthProvider` inyectando `MockAuthService`
    - Envolver con `NavigationContainer` usando configuración de deep linking
    - Conectar `MainStack` como navegador raíz
    - _Requisitos: 4.1, 7.3_

- [x] 9. Checkpoint final — Verificar integración completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan propiedades universales de corrección
- Los tests unitarios validan ejemplos específicos y edge cases
- Archivos de test junto al código fuente: `MockAuthService.ts` → `MockAuthService.test.ts`
