<!--
  STEERING FILE: Product Context
  Inclusion: "always" — loaded in every Kiro interaction.

  This file combines product definition, auth architecture, and security rules
  because they form the core context that shapes all generated code.

  TIPS:
  - Keep it concise — this loads every time
  - Update business rules as requirements evolve
  - Kiro uses these rules to generate validation logic
-->
---
inclusion: always
---

# Construction Site Management Platform

Platform for managing construction site operations: attendance tracking, workforce management, and daily reporting.

## Users & Roles

| Role | Description |
|------|------------|
| ADMIN | Full system access |
| JEFE_OBRA | Site manager — oversees all operations |
| ENCARGADO | Supervisor — manages teams, approves records |
| TRABAJADOR | Worker — clocks in/out, views own records |
| PREVENCION | Safety officer — read access + safety functions |
| SOLO_LECTURA | Read-only access |

## Core Business Rules

<!-- Add rules here. Kiro enforces these when generating validation. -->

- Cannot clock in if there's already an open record (no clock-out)
- Clock methods: QR, NFC, MANUAL, GPS
- Attendance incidents (forgotten punch, time correction) require supervisor resolution
- Workers belong to companies (PRINCIPAL, SUBCONTRATA, ETT) and teams
- All IDs are UUIDs
- Pagination uses offset-based (page/size), not cursor-based

## Authentication

- IDP: OneLogin (OIDC) — fallback: Cognito local users if IDP unavailable
- Broker: Amazon Cognito User Pool (federated sign-in)
- Flow: Cognito Hosted UI → OneLogin → JWT → API Gateway authorizer
- Fallback flow: Cognito Hosted UI → username/password → JWT → API Gateway authorizer
- Auth service manages user profiles and role-based permissions internally

## Security

- All endpoints require valid JWT via bearerAuth
- Never hardcode secrets — use env vars or Secrets Manager
- Validate all input before processing
- Role-based access: TRABAJADOR sees own data, ENCARGADO sees team, JEFE_OBRA sees all
- Worker document numbers (DNI/NIE) are sensitive — handle accordingly
