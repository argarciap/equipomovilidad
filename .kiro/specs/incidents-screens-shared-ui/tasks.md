# Implementation Plan: Incidents Screens & Shared UI Components

## Overview

Incremental implementation of incident management screens and shared UI components for the React Native mobile app. Each task builds on previous ones, starting with types and theme, then shared components, then services, then screens, and finally navigation wiring. Assumes Persona 1's foundational layer (AuthProvider, useAuth, hasAccess, getDataScope, User, UserRole, BottomTabs) will exist at runtime.

## Tasks

- [x] 1. Create incident types and interfaces
  - [x] 1.1 Create `src/types/incidents.ts` with IncidentType, IncidentStatus, RecordStatus, AllStatus, AttendanceIncident, CreateIncidentRequest, Resolution, ResolveIncidentRequest, PaginatedResponse<T>, and ApiError
    - Export all types and interfaces as named exports
    - Use `snake_case` fields to match `attendance-service.yaml` contract
    - IncidentType: 5 values (OLVIDO_ENTRADA, OLVIDO_SALIDA, CORRECCION_HORA, FICHAJE_DUPLICADO, OTRO)
    - IncidentStatus: 3 values (PENDING, RESOLVED, REJECTED)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [x] 2. Create theme system
  - [x] 2.1 Create `src/theme/colors.ts` with primary (#E30613), neutral, and status color palette
    - Include status colors: pending (orange), resolved (green), rejected (red), open (blue)
    - Include statusBackground variants for badges
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 Create `src/theme/spacing.ts` with spacing scale based on multiples of 4px
    - Values: xs=4, sm=8, md=12, base=16, lg=20, xl=24, xxl=32
    - _Requirements: 2.3_

  - [x] 2.3 Create `src/theme/typography.ts` with text styles (title, subtitle, body, bodyBold, caption, small)
    - Each style includes fontSize and fontWeight
    - _Requirements: 2.4_

  - [x] 2.4 Create `src/theme/index.ts` that re-exports colors, spacing, typography and defines borderRadius (small=4, medium=8, large=16) and a unified `theme` object with Theme type
    - _Requirements: 2.5, 2.6_

  - [ ]* 2.5 Write property test for spacing multiples of 4
    - **Property 1: All spacing values are multiples of 4**
    - **Validates: Requirements 2.3**

- [x] 3. Create shared UI components
  - [x] 3.1 Create `src/components/StatusBadge.tsx`
    - Accept `status: AllStatus` and optional `label` props
    - Map each status to correct background and text colors from theme
    - Include accessibilityRole="text" and accessibilityLabel with status
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [ ]* 3.2 Write property test for StatusBadge color mapping and accessibility
    - **Property 2: StatusBadge maps status to correct color and accessibility**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

  - [x] 3.3 Create `src/components/Card.tsx`
    - Accept children, optional onPress, and optional style props
    - White background, borderRadius.medium, subtle shadow (elevation 2 Android, shadow iOS)
    - Wrap in TouchableOpacity with activeOpacity=0.7 when onPress is defined
    - Use spacing.base for internal padding
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ]* 3.4 Write property test for Card children rendering and pressability
    - **Property 3: Card renders children and is pressable when onPress defined**
    - **Validates: Requirements 4.2, 4.4**

  - [x] 3.5 Create `src/components/LoadingState.tsx`
    - Centered ActivityIndicator with colors.primary and size="large"
    - Optional message text below spinner using typography.caption
    - accessibilityLabel = message or "Cargando"
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 3.6 Write property test for LoadingState message and accessibility
    - **Property 4: LoadingState shows message and correct accessibilityLabel**
    - **Validates: Requirements 5.2, 5.4**

  - [x] 3.7 Create `src/components/EmptyState.tsx`
    - Accept icon, title, and message props
    - Centered layout with icon (size 48, textDisabled color), title (subtitle style), message (caption style)
    - accessibilityRole="text", accessibilityLabel combines title and message
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ]* 3.8 Write property test for EmptyState props and combined accessibility
    - **Property 5: EmptyState renders all props and combines title+message in accessibilityLabel**
    - **Validates: Requirements 6.1, 6.2, 6.4**

  - [x] 3.9 Create `src/components/ErrorState.tsx`
    - Accept message and onRetry props
    - Centered layout with error icon, message text, and "Reintentar" button
    - Button uses colors.primary background, borderRadius.medium
    - Button: accessibilityRole="button", accessibilityLabel="Reintentar"
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 3.10 Write property test for ErrorState message and onRetry invocation
    - **Property 6: ErrorState renders message and invokes onRetry on press**
    - **Validates: Requirements 7.1, 7.3**

- [x] 4. Checkpoint - Verify types, theme, and shared components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create formatters utility
  - [x] 5.1 Create `src/utils/formatters.ts` with formatDate, formatDateTime, getIncidentTypeLabel, and getIncidentStatusLabel functions
    - formatDate: ISO string → "15 ene 2025" format
    - formatDateTime: ISO string → "15 ene 2025, 08:30" format
    - getIncidentTypeLabel: maps IncidentType to Spanish labels
    - getIncidentStatusLabel: maps IncidentStatus to Spanish labels
    - Graceful degradation: return original string if parsing fails
    - _Requirements: 9.2, 11.1_

  - [ ]* 5.2 Write unit tests for formatters
    - Test formatDate with valid and invalid ISO strings
    - Test formatDateTime with valid and invalid ISO strings
    - Test getIncidentTypeLabel for all 5 IncidentType values
    - Test getIncidentStatusLabel for all 3 IncidentStatus values
    - Test graceful degradation (invalid input returns original string)
    - _Requirements: 9.2, 11.1_

- [x] 6. Create incident service interface and mock implementation
  - [x] 6.1 Create `src/services/IncidentService.ts` with IncidentService interface and ListIncidentsParams type
    - Define listIncidents, createIncident, getIncident, resolveIncident methods
    - All methods return Promises
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 6.2 Create `src/services/MockIncidentService.ts` implementing IncidentService
    - Constructor receives getCurrentUser function and workers array from mock-data.json
    - Generate 6-8 initial mock incidents covering all 3 statuses and multiple types
    - Implement listIncidents with status/date filtering and pagination
    - Implement createIncident generating UUID, setting status=PENDING and created_at
    - Implement getIncident with NOT_FOUND error for missing IDs
    - Implement resolveIncident with INVALID_STATUS error for non-PENDING incidents
    - Implement role-based filtering using getDataScope: own, team, all
    - Implement FORBIDDEN error when ENCARGADO resolves outside their team
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ]* 6.3 Write property test for listIncidents filtering and pagination
    - **Property 7: listIncidents filters correctly by status and pagination**
    - **Validates: Requirements 8.1**

  - [ ]* 6.4 Write property test for createIncident → getIncident round trip
    - **Property 8: Round trip createIncident then getIncident returns same data with PENDING status**
    - **Validates: Requirements 8.2, 8.3**

  - [ ]* 6.5 Write property test for resolveIncident state update
    - **Property 9: resolveIncident updates status to RESOLVED or REJECTED based on resolution**
    - **Validates: Requirements 8.5**

  - [ ]* 6.6 Write property test for role-based incident filtering
    - **Property 10: listIncidents respects DataScope filtering per user role**
    - **Validates: Requirements 8.7, 9.9, 9.10, 9.11**

  - [ ]* 6.7 Write property test for ENCARGADO team restriction
    - **Property 15: ENCARGADO cannot resolve incidents outside their team**
    - **Validates: Requirements 12.7**

- [x] 7. Checkpoint - Verify formatters and mock service
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Create IncidentListScreen
  - [x] 8.1 Create `src/screens/incidents/IncidentListScreen.tsx`
    - Use useAuth() to get current user and role
    - Call incidentService.listIncidents() on mount and on filter change
    - Render status filter chips at top (Todas, Pendientes, Resueltas, Rechazadas)
    - Render each incident in a Card with worker_name, getIncidentTypeLabel(type), formatDate(affected_date), and StatusBadge
    - Navigate to IncidentDetail on Card press, passing incidentId
    - Show floating "+" button for TRABAJADOR and ENCARGADO roles only
    - Show LoadingState while loading, EmptyState when no results, ErrorState on failure
    - Read-only mode for SOLO_LECTURA and PREVENCION (no create button)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10, 9.11, 9.12_

  - [ ]* 8.2 Write property test for incident Card information display
    - **Property 11: Card renders worker_name, type label, formatted date, and StatusBadge**
    - **Validates: Requirements 9.2**

  - [ ]* 8.3 Write property test for create button visibility by role
    - **Property 12: Create button visible only for TRABAJADOR and ENCARGADO**
    - **Validates: Requirements 9.12, 10.8, 10.9**

- [x] 9. Create CreateIncidentScreen
  - [x] 9.1 Create `src/screens/incidents/CreateIncidentScreen.tsx`
    - Form with: type selector (5 IncidentType options), date picker for affected_date, multiline description field
    - Show proposed_clock_in and proposed_clock_out fields only when type is CORRECCION_HORA
    - Validate required fields (type, affected_date, description) with inline error messages
    - On submit: call createIncident with worker_id from useAuth user, disable button and show loading
    - On success: navigate back to IncidentList
    - On error: show error message, preserve form data
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9_

  - [ ]* 9.2 Write property test for required field validation
    - **Property 14: Form rejects submission when any required field is empty**
    - **Validates: Requirements 10.5**

- [x] 10. Create IncidentDetailScreen
  - [x] 10.1 Create `src/screens/incidents/IncidentDetailScreen.tsx`
    - Receive incidentId from route params
    - Call getIncident(incidentId) on mount
    - Display all AttendanceIncident fields formatted (using formatDate, formatDateTime, getIncidentTypeLabel)
    - Show StatusBadge with current status
    - Show resolution info (notes, date, resolver) when status is RESOLVED or REJECTED
    - Show "Aprobar" and "Rechazar" buttons only when status=PENDING and role is ENCARGADO, JEFE_OBRA, or ADMIN
    - Hide resolution buttons for TRABAJADOR, SOLO_LECTURA, PREVENCION
    - On approve/reject: show optional notes field + confirmation button
    - Call resolveIncident, disable buttons during processing, show loading
    - On success: update detail view and navigate back to list
    - On error: show error message, preserve notes
    - Show LoadingState while loading, ErrorState on failure
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 10.2 Write property test for resolution button visibility by status and role
    - **Property 13: Approve/Reject buttons visible only when PENDING and role is ENCARGADO, JEFE_OBRA, or ADMIN**
    - **Validates: Requirements 11.2, 11.3, 11.4, 11.5**

- [x] 11. Create IncidentsStackNavigator and wire navigation
  - [x] 11.1 Create `src/navigation/IncidentsStackNavigator.tsx`
    - Define IncidentsStackParamList with routes: IncidentList, IncidentDetail (incidentId param), CreateIncident
    - Set IncidentList as initial route with header "Incidencias"
    - IncidentDetail header: "Detalle de Incidencia"
    - CreateIncident header: "Nueva Incidencia"
    - Back button on detail and create screens
    - This navigator replaces the IncidentsScreen placeholder in BottomTabs
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 11.2 Write unit tests for IncidentsStackNavigator
    - Verify 3 routes are registered (IncidentList, IncidentDetail, CreateIncident)
    - Verify navigation to detail passes incidentId
    - Verify back button presence on detail and create screens
    - _Requirements: 13.1, 13.2, 13.5_

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- This spec assumes Persona 1's foundational layer (AuthProvider, useAuth, hasAccess, getDataScope, UserRole, User, BottomTabs) exists at runtime
- All code is TypeScript for React Native
