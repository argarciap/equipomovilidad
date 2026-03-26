# Deuda Técnica

## Pendiente

### 1. Unificar tipos duplicados entre `src/types/incidents.ts` y `src/api/types.ts`

Persona 2 creó tipos completos en `src/api/types.ts` (IncidentType, IncidentStatus, AttendanceIncident, CreateIncidentRequest, etc.) y Persona 5 creó los mismos en `src/types/incidents.ts`. Los valores son idénticos (ambos derivados de `attendance-service.yaml`) pero están duplicados.

**Acción:** Elegir una fuente única de verdad para los tipos y que todos los módulos importen de ahí. Opciones:
- Mover todo a `src/types/` y que `src/api/` importe desde ahí
- O mover todo a `src/api/types.ts` y que las pantallas importen desde ahí

**Impacto:** Bajo riesgo, pero si alguien modifica un tipo en un sitio y no en el otro, se desincronizarán.
