# Documento de Requisitos — Setup, Navegación y Autenticación Móvil

## Introducción

Este documento define los requisitos para la base fundacional de la aplicación móvil React Native del Equipo 4. Cubre la inicialización del proyecto con TypeScript, la configuración de navegación (stacks, tabs, rutas protegidas), el proveedor de autenticación mock (usuarios hardcodeados desde `mock-data.json` sin Cognito), la pantalla de login simulado con selector de rol, y la lógica de enrutamiento basada en rol. Esta capa es la dependencia principal de los otros 4 integrantes del equipo, quienes construirán sus pantallas sobre esta estructura.

## Glosario

- **App**: La aplicación móvil React Native con TypeScript para gestión de asistencia en obra.
- **AuthProvider**: Contexto de React que gestiona el estado de autenticación (usuario actual, rol, login/logout).
- **MockUser**: Objeto de usuario cargado desde `mock-data.json` que simula un usuario autenticado sin Cognito.
- **RoleSelector**: Componente de la pantalla de login que permite seleccionar un rol de usuario mock para desarrollo.
- **NavigationContainer**: Contenedor raíz de React Navigation que gestiona el árbol de navegación.
- **MainStack**: Stack navigator principal que contiene las pantallas de autenticación y la app autenticada.
- **BottomTabs**: Navegador de pestañas inferiores visible tras autenticarse.
- **ProtectedRoute**: Ruta que requiere autenticación y opcionalmente un rol específico para ser accesible.
- **PlaceholderScreen**: Pantalla temporal con texto indicativo que reserva espacio para el trabajo de otros integrantes.
- **Rol**: Uno de los valores `ADMIN`, `JEFE_OBRA`, `ENCARGADO`, `TRABAJADOR`, `PREVENCION`, `SOLO_LECTURA` definidos en el sistema.

## Requisitos

### Requisito 1: Inicialización del Proyecto React Native con TypeScript

**Historia de Usuario:** Como integrante del equipo móvil, quiero un proyecto React Native inicializado con TypeScript y configuración estricta, para que todos los integrantes trabajen sobre una base consistente y tipada.

#### Criterios de Aceptación

1. THE App SHALL utilizar React Native con TypeScript y la opción `strict: true` en `tsconfig.json`.
2. THE App SHALL incluir las dependencias `@react-navigation/native`, `@react-navigation/native-stack` y `@react-navigation/bottom-tabs` en `package.json`.
3. THE App SHALL definir un tipo `UserRole` que contenga exactamente los valores `ADMIN`, `JEFE_OBRA`, `ENCARGADO`, `TRABAJADOR`, `PREVENCION` y `SOLO_LECTURA`.
4. THE App SHALL definir una interfaz `User` con los campos `id` (string UUID), `email` (string), `firstName` (string), `lastName` (string) y `role` (UserRole).

### Requisito 2: Proveedor de Autenticación Mock (AuthProvider)

**Historia de Usuario:** Como integrante del equipo móvil, quiero un contexto de autenticación que cargue usuarios desde `mock-data.json` sin depender de Cognito, para poder desarrollar pantallas de forma independiente al Equipo 2.

#### Criterios de Aceptación

1. THE AuthProvider SHALL exponer el usuario autenticado actual, una función `login` y una función `logout` a través de React Context.
2. THE AuthProvider SHALL cargar los usuarios disponibles desde los datos definidos en `mock-data.json`.
3. WHEN la función `login` es invocada con un identificador de usuario mock, THE AuthProvider SHALL establecer el MockUser correspondiente como usuario autenticado.
4. WHEN la función `logout` es invocada, THE AuthProvider SHALL eliminar el usuario autenticado actual y devolver la App al estado no autenticado.
5. THE AuthProvider SHALL exponer una propiedad booleana `isAuthenticated` que indique si existe un usuario autenticado.
6. THE AuthProvider SHALL persistir el estado de autenticación de forma que al recargar la App el usuario permanezca autenticado.

### Requisito 3: Pantalla de Login Simulado con Selector de Rol

**Historia de Usuario:** Como desarrollador del equipo móvil, quiero una pantalla de login con un selector de rol que muestre los usuarios de `mock-data.json`, para poder probar la app con diferentes perfiles sin configurar Cognito.

#### Criterios de Aceptación

1. THE RoleSelector SHALL mostrar una lista de todos los usuarios definidos en `mock-data.json` con su nombre completo y rol.
2. WHEN el usuario selecciona un MockUser de la lista, THE App SHALL invocar la función `login` del AuthProvider con el usuario seleccionado.
3. WHEN el login se completa exitosamente, THE App SHALL navegar automáticamente a la pantalla principal (BottomTabs).
4. THE RoleSelector SHALL mostrar visualmente el rol de cada usuario utilizando una etiqueta o badge diferenciado.
5. THE App SHALL mostrar la pantalla de login únicamente cuando no existe un usuario autenticado.

### Requisito 4: Configuración de Navegación (Stack + Tabs + Rutas Protegidas)

**Historia de Usuario:** Como integrante del equipo móvil, quiero una estructura de navegación con stack principal, pestañas inferiores y rutas protegidas por rol, para que cada integrante pueda agregar sus pantallas en la ubicación correcta.

#### Criterios de Aceptación

1. THE NavigationContainer SHALL contener un MainStack con dos ramas: una rama de autenticación (login) y una rama de app autenticada (BottomTabs).
2. WHILE el AuthProvider indica que no existe usuario autenticado, THE MainStack SHALL mostrar únicamente la rama de autenticación.
3. WHILE el AuthProvider indica que existe un usuario autenticado, THE MainStack SHALL mostrar únicamente la rama de app autenticada con BottomTabs.
4. THE BottomTabs SHALL incluir las pestañas: Inicio (Dashboard), Fichaje (Clock), Registros (Records) e Incidencias (Incidents).
5. WHEN un usuario con rol TRABAJADOR está autenticado, THE App SHALL mostrar en la pestaña Registros únicamente los datos propios del trabajador.
6. WHEN un usuario con rol ENCARGADO está autenticado, THE App SHALL mostrar en la pestaña Registros los datos del equipo que supervisa.
7. WHEN un usuario con rol JEFE_OBRA o ADMIN está autenticado, THE App SHALL mostrar acceso completo a todos los datos en todas las pestañas.
8. THE NavigationContainer SHALL configurar el esquema de deep link `construction://callback` para la futura integración con Cognito.

### Requisito 5: Pantallas Placeholder para Otros Integrantes

**Historia de Usuario:** Como integrante del equipo móvil, quiero pantallas placeholder registradas en la navegación para cada módulo funcional, para que cada integrante pueda reemplazarlas con su implementación real sin modificar la estructura de navegación.

#### Criterios de Aceptación

1. THE App SHALL incluir una PlaceholderScreen para Dashboard que muestre el nombre del usuario autenticado y su rol actual.
2. THE App SHALL incluir una PlaceholderScreen para Fichaje (ClockScreen) que indique que será implementada por el Integrante 3.
3. THE App SHALL incluir una PlaceholderScreen para Registros (RecordsScreen) que indique que será implementada por el Integrante 4.
4. THE App SHALL incluir una PlaceholderScreen para Incidencias (IncidentsScreen) que indique que será implementada por el Integrante 5.
5. THE App SHALL mostrar en cada PlaceholderScreen el rol del usuario autenticado actual para verificar que el contexto de autenticación se propaga correctamente.

### Requisito 6: Lógica de Visibilidad por Rol

**Historia de Usuario:** Como desarrollador del equipo móvil, quiero que la lógica de visibilidad por rol esté centralizada y sea reutilizable, para que todos los integrantes apliquen las mismas reglas de acceso en sus pantallas.

#### Criterios de Aceptación

1. THE App SHALL exportar una función utilitaria `hasAccess` que reciba un UserRole y una lista de roles permitidos, y devuelva un booleano indicando si el rol tiene acceso.
2. WHEN un usuario con rol TRABAJADOR está autenticado, THE App SHALL restringir la visibilidad a datos propios del trabajador en todas las pantallas que muestren datos.
3. WHEN un usuario con rol ENCARGADO está autenticado, THE App SHALL permitir la visibilidad de datos del equipo asignado al encargado.
4. WHEN un usuario con rol JEFE_OBRA está autenticado, THE App SHALL permitir la visibilidad de todos los datos de la obra.
5. WHEN un usuario con rol ADMIN está autenticado, THE App SHALL permitir acceso completo a todos los datos y funciones del sistema.
6. IF un usuario intenta acceder a una ruta para la cual su rol no tiene permiso, THEN THE App SHALL redirigir al usuario a la pantalla de Inicio (Dashboard).

### Requisito 7: Preparación para Integración con Cognito Real

**Historia de Usuario:** Como equipo móvil, queremos que la arquitectura de autenticación mock sea reemplazable por Cognito real cuando el Equipo 2 entregue la configuración, para que la migración sea directa y sin reestructuración.

#### Criterios de Aceptación

1. THE AuthProvider SHALL definir una interfaz `AuthService` con los métodos `login`, `logout` y `getCurrentUser`, de forma que la implementación mock pueda ser sustituida por una implementación real de Cognito.
2. THE App SHALL almacenar la configuración de Cognito (User Pool ID, Client ID, dominio, redirect URI `construction://callback`) en un archivo de configuración separado con valores placeholder.
3. THE AuthProvider SHALL utilizar la interfaz `AuthService` internamente, de forma que cambiar de mock a Cognito real requiera únicamente sustituir la implementación concreta.
